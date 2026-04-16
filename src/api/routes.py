from flask import Flask, request, jsonify, Blueprint
from api.models import db, User
from werkzeug.security import generate_password_hash

from flask_cors import CORS

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
