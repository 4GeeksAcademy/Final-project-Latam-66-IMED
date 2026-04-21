import click
# IMPORTANTE: Asegúrate de importar el modelo Restaurant aquí arriba
from api.models import db, User, Restaurant

"""
In this file, you can add as many commands as you want using the @app.cli.command decorator
Flask commands are usefull to run cronjobs or tasks outside of the API but sill in integration 
with your database, for example: Import the price of bitcoin every night as 12am
"""


def setup_commands(app):
    """ 
    This is an example command "insert-test-users" that you can run from the command line
    by typing: $ flask insert-test-users 5
    Note: 5 is the number of users to add
    """
    @app.cli.command("insert-test-users")  # name of our command
    @click.argument("count")  # argument of out command
    def insert_test_users(count):
        print("Creating test users")
        for x in range(1, int(count) + 1):
            user = User()
            user.email = "test_user" + str(x) + "@test.com"
            user.password = "123456"
            user.is_active = True
            db.session.add(user)
            db.session.commit()
            print("User: ", user.email, " created.")

        print("All test users created")

    # AQUÍ COMIENZA TU NUEVO COMANDO SEED
    @app.cli.command("insert-test-data")
    def insert_test_data():
        print("Limpiando la tabla de restaurantes para evitar duplicados...")
        Restaurant.query.delete()
        db.session.commit()

        print("Insertando restaurantes semilla (Seed)...")

        restaurantes_semilla = [
            {"name": "La Hacienda", "score": 92, "food_type": "Cortes", "cuisine_origin": "Argentina", "city": "Caracas",
                "image_url": "https://images.pexels.com/photos/36798158/pexels-photo-36798158.jpeg", "description": "Las mejores brasas de Caracas."},
            {"name": "Sake House", "score": 85, "food_type": "Sushi", "cuisine_origin": "Japonesa", "city": "Caracas",
                "image_url": "https://images.pexels.com/photos/36317040/pexels-photo-36317040.jpeg", "description": "Fusión tradicional y moderna."},
            {"name": "El Ávila Burger", "score": 78, "food_type": "Hamburguesas", "cuisine_origin": "Americana", "city": "Caracas",
                "image_url": "https://images.pexels.com/photos/35628178/pexels-photo-35628178.jpeg", "description": "Sabor urbano con vista al Ávila."},
            {"name": "Trattoria Mia", "score": 88, "food_type": "Pasta", "cuisine_origin": "Italiana", "city": "Caracas",
                "image_url": "https://images.pexels.com/photos/35622107/pexels-photo-35622107.jpeg", "description": "Recetas de la abuela directo de Roma."},
            {"name": "Arepa Factory", "score": 95, "food_type": "Rellena", "cuisine_origin": "Venezolana", "city": "Caracas",
                "image_url": "https://images.pexels.com/photos/29465175/pexels-photo-29465175.jpeg", "description": "Nuestra esencia en cada bocado."},
            {"name": "Taco Real", "score": 55, "food_type": "Tacos", "cuisine_origin": "Mexicana", "city": "CDMX",
                "image_url": "https://images.pexels.com/photos/14179983/pexels-photo-14179983.jpeg", "description": "Picante auténtico de CDMX."},
            {"name": "Chifa Express", "score": 62, "food_type": "Arroz", "cuisine_origin": "China", "city": "Lima",
                "image_url": "https://images.pexels.com/photos/35228295/pexels-photo-35228295.jpeg", "description": "El mejor wok del centro."},
            {"name": "Paella & Olé", "score": 81, "food_type": "Arroz", "cuisine_origin": "Española", "city": "Madrid",
                "image_url": "https://images.pexels.com/photos/36878063/pexels-photo-36878063.jpeg", "description": "Sabor a mar y azafrán."},
            {"name": "Bangkok Soul", "score": 45, "food_type": "Pad Thai", "cuisine_origin": "Tailandesa", "city": "Bangkok",
                "image_url": "https://images.pexels.com/photos/12188535/pexels-photo-12188535.jpeg", "description": "Especias exóticas y frescura."},
            {"name": "Lima 27", "score": 90, "food_type": "Ceviche", "cuisine_origin": "Peruana", "city": "Lima",
                "image_url": "https://images.pexels.com/photos/15352336/pexels-photo-15352336.jpeg", "description": "Alta cocina andina."}
        ]

        for data in restaurantes_semilla:
            nuevo_restaurante = Restaurant(
                name=data["name"],
                score=data["score"],
                food_type=data["food_type"],
                cuisine_origin=data["cuisine_origin"],
                city=data["city"],
                image_url=data["image_url"],
                description=data["description"]
            )
            db.session.add(nuevo_restaurante)

        db.session.commit()
        print(
            f"¡Éxito! Se han insertado {len(restaurantes_semilla)} restaurantes en la base de datos.")
