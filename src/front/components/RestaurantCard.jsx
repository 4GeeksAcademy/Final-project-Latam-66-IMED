import React from "react";
import PropTypes from "prop-types";

export const RestaurantCard = ({ restaurant }) => {
    // 1. Lógica dinámica de Puntuación y Colores
    const getRankingConfig = (score) => {
        if (score >= 80) return { label: "Excelente", color: "#198754", shadow: "rgba(25, 135, 84, 0.2)" }; // Verde
        if (score >= 60) return { label: "Bueno", color: "#0d6efd", shadow: "rgba(13, 110, 253, 0.2)" };    // Azul
        if (score >= 40) return { label: "Regular", color: "#ffc107", shadow: "rgba(255, 193, 7, 0.2)" };  // Amarillo
        return { label: "Malo", color: "#dc3545", shadow: "rgba(220, 53, 69, 0.2)" };                    // Rojo
    };

    const config = getRankingConfig(restaurant.score);

    return (
        <div 
            className="card h-100 shadow rounded-4 overflow-hidden position-relative bg-white"
            style={{ 
                border: `4px solid ${config.color}`, // Borde colorido y bold
                transition: "transform 0.2s"
            }}
        >
            {/* 2. Bookmark en V (Puntuación) */}
            <div 
                className="position-absolute top-0 end-0 pt-2 px-2 text-center text-white fw-bold shadow-sm"
                style={{ 
                    backgroundColor: config.color,
                    width: "70px",
                    height: "90px",
                    zIndex: 10,
                    // Este es el truco para la forma en V
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)"
                }}
            >
                <div className="fs-4 mb-0">{restaurant.score}</div>
                <div className="small text-uppercase" style={{ fontSize: "0.6rem" }}>{config.label}</div>
            </div>

            {/* 3. Imagen Central Responsive */}
            <div className="ratio ratio-16x9">
                <img 
                    src={restaurant.image_url || "https://placehold.co/600x400?text=Flavor+Critic"} 
                    className="card-img-top object-fit-cover" 
                    alt={restaurant.name} 
                />
            </div>

            <div className="card-body d-flex flex-column p-3">
                {/* 4. Tres Iconos (Bandera, Tipo, Estilo) */}
                <div className="d-flex gap-3 mb-2 text-secondary small fw-semibold">
                    <span><i className="fas fa-flag me-1"></i> 🇻🇪</span>
                    <span><i className="fas fa-utensils me-1"></i> {restaurant.food_type}</span>
                    <span><i className="fas fa-star me-1"></i> Profesional</span>
                </div>

                {/* 5. Nombre del Restaurante */}
                <h5 className="card-title fw-bold text-dark mb-1">{restaurant.name}</h5>

                {/* 6. Etiqueta de Origen (Faded Background) */}
                <div className="mb-3">
                    <span 
                        className="badge rounded-pill fw-bold"
                        style={{ 
                            color: config.color,
                            backgroundColor: config.shadow, // Color de fondo "faded"
                            border: `2px solid ${config.color}`,
                            fontSize: "0.75rem"
                        }}
                    >
                        {restaurant.cuisine_origin || "Cocina Local"}
                    </span>
                </div>

                {/* 7. Descripción Breve */}
                <p className="card-text text-muted small flex-grow-1">
                    {restaurant.description || "Disfruta de la mejor gastronomía con ingredientes frescos y un ambiente único."}
                </p>

                {/* 8. Indicador de Ranking Inferior */}
                <div 
                    className="mt-3" 
                    style={{ height: "8px", width: "100%", backgroundColor: config.color, borderRadius: "10px" }}
                ></div>
            </div>
        </div>
    );
};

RestaurantCard.propTypes = {
    restaurant: PropTypes.object.isRequired
};