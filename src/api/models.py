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
    full_name = db.Column(db.String(120), nullable=True)
    username = db.Column(db.String(80), unique=True, nullable=True)
    country = db.Column(db.String(80), nullable=True)
    city = db.Column(db.String(80), nullable=True)
    age = db.Column(db.Integer, nullable=True)
    bio = db.Column(db.Text, nullable=True)
    profile_picture = db.Column(db.Text, nullable=True)

    # relaciones
    reviews = db.relationship('Review', backref='user', lazy=True)
    favorites = db.relationship('Favorite', backref='user', lazy=True)
    places_to_visit = db.relationship('PlaceToVisit', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.email}>'

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role,
            "is_active": self.is_active,
            "full_name": self.full_name,
        "username": self.username,
        "country": self.country,
        "city": self.city,
        "age": self.age,
        "bio": self.bio,
        "profile_picture": self.profile_picture
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
    city = db.Column(db.String(80), nullable=False) # ej: caracas, tokio, bogota

    # Nueva columna para pais
    country = db.Column(db.String(80), nullable=True) # ej: japon, mexico, venezuela
    
    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "image_url": self.image_url,
            "score": self.score,
            "food_type": self.food_type,
            "cuisine_origin": self.cuisine_origin,
            "description": self.description,
            "city": self.city,
            "country": self.country
        }
    
# ==========================================
# NUEVAS TABLAS PARA EL PERFIL
# ==========================================

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    # Llaves foráneas: conectan la reseña con un usuario y un restaurante
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurant.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False) 
    comment = db.Column(db.Text, nullable=True)
    
    # Relación para acceder a los datos del restaurante fácilmente
    restaurant = db.relationship('Restaurant')

    def serialize(self):
        return {
            "id": self.id,
            "restaurant_id": self.restaurant.id,
            "restaurant_name": self.restaurant.name, 
            "rating": self.rating,
            "comment": self.comment
        }

class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurant.id'), nullable=False)
    
    restaurant = db.relationship('Restaurant')

    def serialize(self):
        return {
            "id": self.id,
            "restaurant": self.restaurant.serialize() 
        }

class PlaceToVisit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    restaurant_id = db.Column(db.Integer, db.ForeignKey('restaurant.id'), nullable=False)

    restaurant = db.relationship('Restaurant')

    def serialize(self):
        return {
            "id": self.id,
            "restaurant": self.restaurant.serialize()
        }
