import React from "react";
import PropTypes from "prop-types";
// Asegúrate de que tu index.css se esté importando en tu main.jsx o layout.jsx
// En 4Geeks normalmente ya está configurado.

export const RestaurantCard = ({ restaurant }) => {
    // Lógica dinámica de Puntuación y Colores
    const getRankingConfig = (score) => {
        if (score >= 80) return { label: "Excelente", color: "#198754", shadow: "rgba(25, 135, 84, 0.3)" };
        if (score >= 60) return { label: "Bueno", color: "#0d6efd", shadow: "rgba(13, 110, 253, 0.3)" };
        if (score >= 40) return { label: "Regular", color: "#ffc107", shadow: "rgba(255, 193, 7, 0.3)" };
        return { label: "Malo", color: "#dc3545", shadow: "rgba(220, 53, 69, 0.3)" };
    };

    const config = getRankingConfig(restaurant.score);

    return (
        <div 
            // Agregamos la clase 'animated-card' aquí
            className="card h-100 rounded-4 overflow-hidden position-relative bg-white animated-card"
            style={{ 
                border: `3px solid ${config.color}40`, // Color base con transparencia
                cursor: "pointer",
                // ¡MAGIA CSS! Pasamos variables dinámicas al archivo index.css
                "--hover-shadow": config.shadow,
                "--hover-border": config.color
            }}
        >
            {/* Bookmark en V (Puntuación) con clase 'score-badge' */}
            <div 
                className="position-absolute top-0 end-0 pt-2 px-2 text-center text-white fw-bold shadow-sm score-badge"
                style={{ 
                    backgroundColor: config.color,
                    width: "70px",
                    height: "90px",
                    zIndex: 10,
                    clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)"
                }}
            >
                <div className="fs-4 mb-0">{restaurant.score}</div>
                <div className="small text-uppercase" style={{ fontSize: "0.6rem" }}>{config.label}</div>
            </div>

            {/* Imagen Central Responsive */}
            <div className="ratio ratio-16x9 overflow-hidden">
                <img 
                    src={restaurant.image_url || "https://placehold.co/600x400?text=Flavor+Critic"} 
                    className="card-img-top object-fit-cover" 
                    alt={restaurant.name} 
                />
            </div>

            <div className="card-body d-flex flex-column p-3">
                {/* Tres Iconos */}
                <div className="d-flex gap-3 mb-2 text-secondary small fw-semibold">
                    <span><i className="fas fa-flag me-1"></i> 🇻🇪</span>
                    <span><i className="fas fa-utensils me-1"></i> {restaurant.food_type}</span>
                </div>

                {/* Nombre del Restaurante */}
                <h5 className="card-title fw-bold text-dark mb-1">{restaurant.name}</h5>

                {/* Etiqueta de Origen */}
                <div className="mb-3">
                    <span 
                        className="badge rounded-pill fw-bold"
                        style={{ 
                            color: config.color,
                            backgroundColor: config.shadow, 
                            border: `2px solid ${config.color}`,
                            fontSize: "0.75rem"
                        }}
                    >
                        {restaurant.cuisine_origin || "Cocina Local"}
                    </span>
                </div>

                {/* Descripción Breve */}
                <p className="card-text text-muted small flex-grow-1">
                    {restaurant.description || "Disfruta de la mejor gastronomía con ingredientes frescos y un ambiente único."}
                </p>

                {/* Barra de Ranking Inferior */}
                <div 
                    className="mt-3" 
                    style={{ height: "6px", width: "100%", backgroundColor: config.color, borderRadius: "10px", opacity: 0.8 }}
                ></div>
            </div>
        </div>
    );
};

RestaurantCard.propTypes = {
    restaurant: PropTypes.object.isRequired
};