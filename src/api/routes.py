from flask import Flask, request, jsonify, Blueprint, url_for
from api.models import db, User, Restaurant, Review, Favorite, PlaceToVisit, Comment
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from flask_jwt_extended import create_access_token
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import os
import cloudinary
import cloudinary.uploader

api = Blueprint('api', __name__)

CORS(api)

# ====================================================================
# ☁️ CONFIGURACIÓN DE CLOUDINARY
# ====================================================================
cloudinary.config(
    cloud_name = os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key = os.getenv('CLOUDINARY_API_KEY'),
    api_secret = os.getenv('CLOUDINARY_API_SECRET'),
    secure = True
)


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

# ====================================================================
# 📝 CREAR RESTAURANTE (POST) - Soporta Carga Masiva con Pexels
# ====================================================================
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

    image_url = body.get("image_url", "")

    # 🪄 MAGIA DE CLOUDINARY: Intercepción y Subida
    # Verificamos si hay un link y si NO es un link que ya pertenece a Cloudinary
    if image_url and "res.cloudinary.com" not in image_url:
        try:
            print(f"Subiendo a Cloudinary la imagen: {image_url}")
            # Le pedimos a Cloudinary que descargue la imagen de Pexels y la guarde
            upload_result = cloudinary.uploader.upload(
                image_url, 
                folder="app_restaurantes" # Organiza tus fotos en esta carpeta
            )
            # Sobrescribimos nuestra variable local con el link seguro de Cloudinary
            image_url = upload_result.get('secure_url')
            print(f"Éxito. Nuevo link generado: {image_url}")
        except Exception as e:
            print(f"Error subiendo a Cloudinary: {e}")
            # Si falla, no rompemos el servidor, pero le avisamos al frontend
            return jsonify({"msg": f"Error subiendo imagen a Cloudinary: Verifique que la URL {image_url} sea pública."}), 400

    try:
        new_restaurant = Restaurant(
            name=body.get("name"),
            image_url=image_url, # Usamos la variable que quizás Cloudinary ya modificó
            food_type=body.get("food_type"),
            score=body.get("score", 0),
            cuisine_origin=body.get("cuisine_origin"),
            city=body.get("city"),
            country=body.get("country"),
            description=body.get("description"),
            latitud=body.get("latitud"),
            longitud=body.get("longitud")
        )
        db.session.add(new_restaurant)
        db.session.commit()

        return jsonify({"msg": "Restaurante creado exitosamente", "restaurant": new_restaurant.serialize()}), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Error interno en base de datos: {str(e)}"}), 500

# ====================================================================
# 📝 EDITAR RESTAURANTE (PUT)
# ====================================================================
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
    if not body:
        return jsonify({"msg": "No se enviaron datos para actualizar"}), 400

    # Lógica para la imagen
    if "image_url" in body:
        incoming_image_url = body["image_url"]
        
        # 🪄 MAGIA DE CLOUDINARY: Verificamos si mandaron un link nuevo que NO es de Cloudinary
        if incoming_image_url and incoming_image_url != restaurant.image_url and "res.cloudinary.com" not in incoming_image_url:
            try:
                print(f"Subiendo a Cloudinary nueva imagen: {incoming_image_url}")
                upload_result = cloudinary.uploader.upload(incoming_image_url, folder="app_restaurantes")
                restaurant.image_url = upload_result.get('secure_url')
            except Exception as e:
                print(f"Error subiendo a Cloudinary en actualización: {e}")
                return jsonify({"msg": "Error procesando la nueva imagen con Cloudinary."}), 400
        else:
            # Si es el mismo link de antes, o es un link de cloudinary, lo guardamos tal cual
            restaurant.image_url = incoming_image_url

    # Actualizamos el resto de campos si vienen en el body
    if "name" in body: restaurant.name = body["name"]
    if "food_type" in body: restaurant.food_type = body["food_type"]
    if "cuisine_origin" in body: restaurant.cuisine_origin = body["cuisine_origin"]
    if "description" in body: restaurant.description = body["description"]
    if "city" in body: restaurant.city = body["city"]
    if "country" in body: restaurant.country = body["country"]
    if "score" in body: restaurant.score = body["score"]
    if "latitud" in body: restaurant.latitud = body["latitud"]
    if "longitud" in body: restaurant.longitud = body["longitud"]

    try:
        db.session.commit()
        return jsonify({"msg": "Restaurante actualizado", "restaurant": restaurant.serialize()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Error guardando cambios: {str(e)}"}), 500
    
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
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    # 1. Buscamos las reseñas reales (modelo Comment) de este usuario
    comentarios_del_usuario = Comment.query.filter_by(
        user_id=current_user_id).all()
    review_count = len(comentarios_del_usuario)

    # 2. Lógica de Negocio: Nivel de Usuario
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
        "reviews": [{
            "id": c.id,
            "text": c.text,
            "score": c.score,
            "restaurant_id": c.restaurant_id,
            "restaurant_name": Restaurant.query.get(c.restaurant_id).name if Restaurant.query.get(c.restaurant_id) else "Restaurante desconocido"
        } for c in comentarios_del_usuario],
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
            if new_val == "" or new_val == "@usuario":  # Si es el default o vacío
                user.username = None
            else:
                # Buscamos si ALGUIEN MÁS tiene ese nombre
                check = User.query.filter(
                    User.username == new_val, User.id != user.id).first()
                if check:
                    return jsonify({"msg": "Nombre de usuario ya ocupado"}), 400
                user.username = new_val

        # Otros campos
        if "full_name" in body:
            user.full_name = body["full_name"]
        if "country" in body:
            user.country = body["country"]
        if "city" in body:
            user.city = body["city"]
        if "age" in body:
            user.age = body["age"]
        if "bio" in body:
            user.bio = body["bio"]
        if "profile_picture" in body:
            user.profile_picture = body["profile_picture"]

        db.session.commit()
        return jsonify({"msg": "Perfil actualizado", "user_info": user.serialize()}), 200

    except Exception as e:
        db.session.rollback()
        print(f"--- ERROR CRÍTICO ---: {str(e)}")
        return jsonify({"msg": "Error de duplicado en la base de datos"}), 500


# -----------------------------------------------------------
# 1. CREAR UN COMENTARIO EN UN RESTAURANTE
# -----------------------------------------------------------
@api.route('/restaurants/<int:restaurant_id>/comments', methods=['POST'])
@jwt_required()  # Solo usuarios registrados
def create_comment(restaurant_id):
    current_user_id = get_jwt_identity()
    text = request.form.get('text')
    score = request.form.get('score')

    # 1. Validamos que vengan los campos obligatorios (sin usar 'body')
    if not text or not score:
        return jsonify({"msg": "El texto y el score son obligatorios"}), 400

    # Verificamos que el restaurante exista
    restaurant = Restaurant.query.get(restaurant_id)
    if not restaurant:
        # 2. Faltaba el código de estado 404 aquí
        return jsonify({"msg": "Restaurante no encontrado"}), 404

    # 3. Corregido el error de dedo "hoto_url" -> "photo_url"
    photo_url = None
    if 'photo' in request.files:
        file = request.files['photo']
        if file.filename != '':
            upload_result = cloudinary.uploader.upload(file)
            photo_url = upload_result.get('secure_url')

    # Creamos el comentario usando los nombres exactos de tus columnas
    new_comment = Comment(
        # 4. Usamos la variable 'text' directamente en lugar de body['text']
        text=text,
        score=int(score),  # Aseguramos que sea entero
        photo_url=photo_url,  # Agregamos la URL de la imagen
        user_id=current_user_id,
        restaurant_id=restaurant_id
    )

    db.session.add(new_comment)
    db.session.commit()

    actualizar_promedio_restaurante(restaurant_id)

    return jsonify({"msg": "Comentario creado exitosamente", "comment": new_comment.serialize()}), 201

# -----------------------------------------------------------
# 2. OBTENER COMENTARIOS DE UN RESTAURANTE (Para la vista Single)
# -----------------------------------------------------------


@api.route('/restaurants/<int:restaurant_id>/comments', methods=['GET'])
def get_restaurant_comments(restaurant_id):
    comments = Comment.query.filter_by(restaurant_id=restaurant_id).all()
    return jsonify([comment.serialize() for comment in comments]), 200

# -----------------------------------------------------------
# 3. OBTENER COMENTARIOS DEL USUARIO (Para la vista Profile)
# -----------------------------------------------------------


@api.route('/users/comments', methods=['GET'])
@jwt_required()
def get_user_comments():
    current_user_id = get_jwt_identity()
    comments = Comment.query.filter_by(user_id=current_user_id).all()
    return jsonify([comment.serialize() for comment in comments]), 200


def actualizar_promedio_restaurante(id_restaurante):
    restaurante = Restaurant.query.get(id_restaurante)
    if not restaurante:
        return

    # Buscar todos los comentarios asociados a este restaurante
    comentarios = Comment.query.filter_by(restaurant_id=id_restaurante).all()

    if len(comentarios) > 0:
        # Sumar todas las puntuaciones y dividir entre la cantidad de comentarios
        puntaje_total = sum(comentario.score for comentario in comentarios)
        promedio = puntaje_total / len(comentarios)
        restaurante.score = round(promedio, 1)  # Redondeamos a 1 decimal
    else:
        restaurante.score = 0

    db.session.commit()

# Rutas para ver los comentarios


@api.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    # Solo el admin debería poder ver esta lista
    current_user_id = get_jwt_identity()
    admin = User.query.get(current_user_id)
    if admin.role != "admin":
        return jsonify({"msg": "No autorizado"}), 403

    users = User.query.all()
    return jsonify([user.serialize() for user in users]), 200

# Ruta para ver los comentarios de un usuario específico


@api.route('/users/<int:user_id>/comments', methods=['GET'])
@jwt_required()
def get_specific_user_comments(user_id):
    comments = Comment.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "text": c.text,
        "score": c.score,
        "restaurant_name": Restaurant.query.get(c.restaurant_id).name
    } for c in comments]), 200


# -----------------------------------------------------------
# EDITAR UN COMENTARIO (PUT)
# -----------------------------------------------------------
@api.route('/comments/<int:comment_id>', methods=['PUT'])
@jwt_required()
def update_comment(comment_id):
    current_user_id = get_jwt_identity()
    comment = Comment.query.get(comment_id)

    if not comment:
        return jsonify({"msg": "Comentario no encontrado"}), 404

    if str(comment.user_id) != str(current_user_id):
        return jsonify({"msg": "No autorizado"}), 403

    # --- CAMBIO AQUÍ: Aceptar tanto Form como JSON ---
    # Intentamos obtener de request.form (FormData del frontend)
    text = request.form.get("text")
    score = request.form.get("score")

    # Si vienen vacíos, intentamos obtener de JSON (por si acaso)
    if text is None and score is None:
        body = request.get_json(silent=True)
        if body:
            text = body.get("text")
            score = body.get("score")

    # Actualizamos si los valores existen
    if text:
        comment.text = text
    if score:
        comment.score = int(score)

    # 2. LOGICA PARA LA FOTO:
    # Verificamos si en el FormData viene un archivo llamado 'photo'
    if 'photo' in request.files:
        file_to_upload = request.files['photo']
        
        # Subimos la nueva imagen a Cloudinary
        upload_result = cloudinary.uploader.upload(file_to_upload)
        
        # Actualizamos la URL en la base de datos con la nueva dirección
        comment.photo_url = upload_result['secure_url']

    db.session.commit()
    return jsonify({"msg": "Comentario actualizado", "comment": comment.serialize()}), 200

# -----------------------------------------------------------
# ELIMINAR UN COMENTARIO (DELETE)
# -----------------------------------------------------------


@api.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    current_user_id = get_jwt_identity()
    comment = Comment.query.get(comment_id)

    if not comment:
        return jsonify({"msg": "Comentario no encontrado"}), 404

    # Verificamos que quien intenta borrar sea el dueño
    if str(comment.user_id) != str(current_user_id):
        return jsonify({"msg": "No autorizado para eliminar este comentario"}), 403

    db.session.delete(comment)
    db.session.commit()
    return jsonify({"msg": "Comentario eliminado exitosamente"}), 200
