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
    image_url = db.Column(db.String(500), nullable=True)
    score = db.Column(db.Integer, default=0) # El MetaScore
    food_type = db.Column(db.String(80), nullable=False) # ej: Sushi, Pasta
    cuisine_origin = db.Column(db.String(80), nullable=False) # ej: Japonesa, Italiana
    description = db.Column(db.Text, nullable=True)
    city = db.Column(db.String(80), nullable=False)
    
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "image_url": self.image_url,
            "score": self.score,
            "food_type": self.food_type,
            "cuisine_origin": self.cuisine_origin,
            "description": self.description,
            "city": self.city
        }