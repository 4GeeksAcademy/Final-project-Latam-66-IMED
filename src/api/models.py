from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    # Aumentamos a 250 para soportar el hash de la contraseña
    password = db.Column(db.String(250), unique=False, nullable=False)
    is_active = db.Column(db.Boolean(), unique=False,
                          nullable=False, default=True)
    # Añadimos la columna role. Por defecto todos son 'user'
    role = db.Column(db.String(20), unique=False,
                     nullable=False, default="user")

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active
            
        }

# tabla de restaurantes o base de datos de restaurantes   
class Restaurant(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(250), nullable=False)
    food_type = db.Column(db.String(80), nullable=False)
    photo_url = db.Column(db.String(500), nullable=True)
    description = db.Column(db.Text, nullable=False)
    # El score lo calcularemos dinámicamente o lo guardaremos como promedio
    base_score = db.Column(db.Float, default=0.0) 

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "food_type": self.food_type,
            "photo_url": self.photo_url,
            "description": self.description,
            "score": self.base_score
        }
