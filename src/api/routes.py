from flask import Flask, request, jsonify, Blueprint
from api.models import db, User
from werkzeug.security import generate_password_hash, check_password_hash

from flask_cors import CORS

from flask_jwt_extended import create_access_token

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
    access_token = create_access_token(identity=user.id)
    return jsonify({ 
        "access_token": access_token, 
        "role": role, 
        "user_id": user.id 
    }), 200


# ENDPOINTS PARA RESTAURANTES (CRUD)
@api.route('/restaurants', methods=['GET', 'POST'])
def handle_restaurants():
    if request.method == 'GET':
        restaurants = Restaurant.query.all()
        return jsonify([r.serialize() for r in restaurants]), 200
    
    if request.method == 'POST':
        body = request.get_json()
        new_rest = Restaurant(
            name=body['name'], location=body['location'],
            food_type=body['food_type'], photo_url=body['photo_url'],
            description=body['description']
        )
        db.session.add(new_rest)
        db.session.commit()
        return jsonify(new_rest.serialize()), 201