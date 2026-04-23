from flask import Flask, request, jsonify, Blueprint
from api.models import db, User, Restaurant, Review, Favorite, PlaceToVisit
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from flask_jwt_extended import create_access_token
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

api = Blueprint('api', __name__)

CORS(api)


@api.route('/signup', methods=['POST'])
def create_user():
    body = request.get_json(force=True)
    email = body.get("email", None)
    password = body.get("password", None)

    # Validación básica
    if not email or not password:
        return jsonify({"msg": "Faltan datos obligatorios (email o password)"}), 400

    # Comprobar si el usuario ya existe
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"msg": "El correo ya está registrado"}), 400

    # Lógica del Administrador
    role = "admin" if email == "admin@flavorcritic.com" else "user"

    # Encriptar la contraseña
    hashed_password = generate_password_hash(password)

    # Crear el nuevo usuario
    new_user = User(email=email, password=hashed_password,
                    role=role, is_active=True)

    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"msg": "Usuario creado exitosamente", "user": new_user.serialize()}), 201
    except Exception as e:
        db.session.rollback()  # Deshace los cambios

        print(f"🔥 ERROR FATAL EN LA BASE DE DATOS: {str(e)}")
        return jsonify({"msg": f"Error real: {str(e)}"}), 500


# ruta del Login
@api.route('/login', methods=['POST'])
def login():
    body = request.get_json()
    email = body.get("email")
    password = body.get("password")

    # 1. Buscamos al usuario por correo
    user = User.query.filter_by(email=email).first()

    # 2. Verificamos si el usuario existe y si la contraseña coincide con el Hash
    if not user or not check_password_hash(user.password, password):
        return jsonify({"msg": "Correo o contraseña incorrectos"}), 401

    # 3. Como ya guardaste el rol correctamente en el Signup, ¡solo lo leemos!
    role = user.role

    # 4. Creamos el token
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "access_token": access_token,
        "role": role,
        "user_id": user.id
    }), 200


# OBTENER TODOS LOS RESTAURANTES (GET)
@api.route('/restaurants', methods=['GET'])
def get_restaurants():
    # 1. Busca todos los restaurantes en la base de datos
    restaurants = Restaurant.query.all()

    # 2. Los convierte a formato JSON usando tu función serialize()
    result = [r.serialize() for r in restaurants]

    # 3. Los envía al frontend
    return jsonify(result), 200


# CREAR restaurante (POST)
@api.route('/restaurants', methods=['POST'])
@jwt_required()  # <--- 1. Exige que el usuario envíe un token válido
def create_restaurant():
    # 2. Obtenemos el ID del usuario desde el token
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    # 3. Verificamos si es administrador
    if not user or user.role != "admin":
        return jsonify({"msg": "Acceso denegado: Se requieren permisos de administrador"}), 403

    body = request.get_json()
    if not body:
        return jsonify({"msg": "El cuerpo de la petición está vacío"}), 400

    new_restaurant = Restaurant(
        name=body.get("name"),
        image_url=body.get("image_url"),
        food_type=body.get("food_type"),
        score=body.get("score", 0), # Si no viene score, pone 0 por defecto
        cuisine_origin=body.get("cuisine_origin"),
        city=body.get("city"),
        country=body.get("country"),
        description=body.get("description")
    )
    db.session.add(new_restaurant)
    db.session.commit()

    return jsonify({"msg": "Restaurante creado exitosamente", "restaurant": new_restaurant.serialize()}), 201


# EDITAR restaurante (PUT)
@api.route('/restaurants/<int:restaurant_id>', methods=['PUT'])
@jwt_required()
def update_restaurant(restaurant_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != "admin":
        return jsonify({"msg": "Acceso denegado"}), 403

    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({"msg": "Restaurante no encontrado"}), 404

    body = request.get_json()

    if "name" in body:
        restaurant.name = body["name"]
    if "image_url" in body:
        restaurant.image_url = body["image_url"]
    if "food_type" in body:
        restaurant.food_type = body["food_type"]
    if "cuisine_origin" in body:
        restaurant.cuisine_origin = body["cuisine_origin"]
    if "description" in body:
        restaurant.description = body["description"]
    if "city" in body:
        restaurant.city = body["city"]
    if "country" in body:
        restaurant.country = body["country"]
    if "score" in body:
        restaurant.score = body["score"]

    db.session.commit()
    return jsonify({"msg": "Restaurante actualizado", "restaurant": restaurant.serialize()}), 200

# ELIMINAR (DELETE)


@api.route('/restaurants/<int:restaurant_id>', methods=['DELETE'])
@jwt_required()
def delete_restaurant(restaurant_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user or user.role != "admin":
        return jsonify({"msg": "Acceso denegado"}), 403

    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        return jsonify({"msg": "Restaurante no encontrado"}), 404

    db.session.delete(restaurant)
    db.session.commit()

    return jsonify({"msg": "Restaurante eliminado correctamente"}), 200

# Traer un solo restaurante por ID


@api.route('/restaurants/<int:restaurant_id>', methods=['GET'])
def get_single_restaurant(restaurant_id):
    # Buscamos en la base de datos por la llave primaria
    restaurant = Restaurant.query.get(restaurant_id)

    if restaurant is None:
        return jsonify({"msg": "Restaurante no encontrado"}), 404

    # Retornamos el restaurante serializado
    return jsonify(restaurant.serialize()), 200

# ==========================================
# RUTAS DE PERFIL DE USUARIO
# ==========================================


@api.route('/profile', methods=['GET'])
@jwt_required()  # Protegemos la ruta: solo entran usuarios con token
def get_user_profile():
    # 1. Identificamos quién es el usuario a través de su token
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    # 2. Lógica de Negocio: Nivel de Usuario
    review_count = len(user.reviews)
    level = "Novato"
    if review_count >= 15:
        level = "Crítico experto"
    elif review_count >= 5:
        level = "Foodie"

    # 3. Lógica de Negocio: Insignias
    badges = []
    if review_count >= 10:
        badges.append("Top Reviewer ⭐")
    if len(user.favorites) >= 5:
        badges.append("Cazador de Joyas ❤️")

    # 4. Devolvemos todo estructurado para React
    return jsonify({
        "user_info": user.serialize(),
        "level": level,
        "badges": badges,
        # Usamos List Comprehensions para transformar las listas de objetos en JSON
        "reviews": [review.serialize() for review in user.reviews],
        "favorites": [fav.serialize() for fav in user.favorites],
        "places_to_visit": [place.serialize() for place in user.places_to_visit]
    }), 200



# RUTAS PARA EDITAR EL PERFIL
@api.route('/profile', methods=['PUT'])
@jwt_required()
def update_user_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    body = request.get_json()

    try:
        # Email (Validación normal)
        if "email" in body:
            user.email = body["email"]
        
        # Username (LA SOLUCIÓN AL ERROR 500)
        if "username" in body:
            new_val = body["username"].strip() if body["username"] else ""
            if new_val == "" or new_val == "@usuario": # Si es el default o vacío
                user.username = None
            else:
                # Buscamos si ALGUIEN MÁS tiene ese nombre
                check = User.query.filter(User.username == new_val, User.id != user.id).first()
                if check:
                    return jsonify({"msg": "Nombre de usuario ya ocupado"}), 400
                user.username = new_val

        # Otros campos
        if "full_name" in body: user.full_name = body["full_name"]
        if "country" in body: user.country = body["country"]
        if "city" in body: user.city = body["city"]
        if "age" in body: user.age = body["age"]
        if "bio" in body: user.bio = body["bio"]
        if "profile_picture" in body: user.profile_picture = body["profile_picture"]

        db.session.commit()
        return jsonify({"msg": "Perfil actualizado", "user_info": user.serialize()}), 200

    except Exception as e:
        db.session.rollback()
        # Mira tu terminal negra de Flask, ahí verás el error real impreso
        print(f"--- ERROR CRÍTICO ---: {str(e)}")
        return jsonify({"msg": "Error de duplicado en la base de datos"}), 500