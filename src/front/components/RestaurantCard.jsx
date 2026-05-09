import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

export const RestaurantCard = ({ restaurant }) => {
    const navigate = useNavigate();
    
    // Lógica dinámica de Puntuación y Colores con el nuevo diseño Premium
    const getRankingConfig = (score) => {
        if (score >= 90) return { 
            label: "Excelente", 
            color: "rgba(218, 165, 32, 1)", // Dorado Intenso
            shadow: "rgba(218, 165, 32, 0.6)",
            cardBg: "#000000",              // Fondo Negro Premium
            textColor: "#DAA520",           // Texto Oro
            secondaryText: "rgba(218, 165, 32, 0.8)",
            isExcellent: true 
        };
        if (score >= 80) return { 
            label: "Muy Bueno", 
            color: "rgba(21, 128, 61, 1)", // Verde Bosque
            shadow: "rgba(21, 128, 61, 0.2)",
            cardBg: "rgba(21, 128, 61, 0.05)", // Fondo sutil verde
            textColor: "#15803D", 
            secondaryText: "#4b5563"
        };
        if (score >= 60) return { 
            label: "Bueno", 
            color: "rgba(37, 99, 235, 1)", // Azul Safiro (Nuevo)
            shadow: "rgba(37, 99, 235, 0.2)",
            cardBg: "rgba(37, 99, 235, 0.05)", // Fondo sutil azul
            textColor: "#1D4ED8", 
            secondaryText: "#6b7280"
        };
        if (score >= 40) return { 
            label: "Regular", 
            color: "rgba(249, 115, 22, 1)", // Naranja Coral
            shadow: "rgba(249, 115, 22, 0.2)",
            cardBg: "rgba(249, 115, 22, 0.05)", // Fondo sutil naranja
            textColor: "#C2410C",
            secondaryText: "#6b7280"
        };
        return { 
            label: "Malo", 
            color: "rgb(211, 47, 47)",  // Rojo Carmesí
            shadow: "rgba(225, 29, 72, 0.2)",
            cardBg: "rgba(225, 29, 72, 0.05)", // Fondo sutil rojo
            textColor: "#BE123C",
            secondaryText: "#6b7280"
        };
    };

    const getCountryByCity = (city) => {
        const cityMap = {
            "Caracas": "Venezuela",
            "CDMX": "México",
            "Lima": "Perú",
            "Madrid": "España",
            "Bangkok": "Tailandia"
        };
        return cityMap[city] || "País Desconocido";
    };

    const config = getRankingConfig(restaurant.score);
    const countryName = restaurant.country || getCountryByCity(restaurant.city);

    return (
        <>
            {/* Definición de la animación de Glow Dorado para las cards Excelentes */}
            <style>
                {`
                @keyframes gold-glow {
                    0% { box-shadow: 0 0 5px rgba(218, 165, 32, 0.4), 0 0 10px rgba(218, 165, 32, 0.2); }
                    50% { box-shadow: 0 0 20px rgba(218, 165, 32, 0.8), 0 0 30px rgba(218, 165, 32, 0.4); }
                    100% { box-shadow: 0 0 5px rgba(218, 165, 32, 0.4), 0 0 10px rgba(218, 165, 32, 0.2); }
                }
                .excellent-glow {
                    animation: gold-glow 3s infinite ease-in-out;
                }
                `}
            </style>

            <div 
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                className={`card h-100 rounded-4 overflow-hidden position-relative animated-card ${config.isExcellent ? 'excellent-glow' : 'shadow-sm'}`}
                style={{ 
                    border: config.isExcellent ? `5px solid ${config.color}` : `2px solid ${config.color}`, 
                    backgroundColor: config.cardBg, 
                    cursor: "pointer",
                    transition: "transform 0.3s ease, border-color 0.3s ease",
                    zIndex: config.isExcellent ? 2 : 1
                }}
            >
                {/* Bookmark de Puntuación */}
                <div 
                    className="position-absolute top-0 end-0 pt-2 px-2 text-center fw-bold shadow-sm score-badge"
                    style={{ 
                        // FONDO: Si es Excelente = Negro puro. Si NO = El color fuerte de su categoría (Rojo, Azul, etc.)
                        backgroundColor: config.isExcellent ? "#000000" : config.color,
                        
                        // LETRAS: Si es Excelente = Dorado (config.color). Si NO = Blanco puro.
                        color: config.isExcellent ? config.color : "#FFFFFF", 
                        
                        width: "75px",
                        height: "85px",
                        zIndex: 10,
                        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 50% 85%, 0% 100%)",
                        
                        // Opcional pero recomendado: un bordecito dorado al bookmark negro para que destaque sobre el fondo negro de la card
                        borderLeft: config.isExcellent ? `1px solid ${config.color}` : "none"
                    }}
                >
                    <div className="fs-4 mb-0">{restaurant.score}</div>
                    <div className="small text-uppercase" style={{ fontSize: "0.55rem", letterSpacing: "1px" }}>
                        {config.label}
                    </div>
                </div>

                {/* Imagen del Restaurante */}
                <div className="ratio ratio-16x9 overflow-hidden" style={{ borderBottom: config.isExcellent ? `1px solid ${config.color}` : "none" }}>
                    <img 
                        src={restaurant.image_url || "https://placehold.co/600x400?text=Flavor+Critic"} 
                        className="card-img-top object-fit-cover" 
                        alt={restaurant.name} 
                        style={{ filter: config.isExcellent ? "contrast(1.1) brightness(0.9)" : "none" }}
                    />
                </div>

                <div className="card-body d-flex flex-column p-3">
                    
                    {/* Info de Ubicación y Tipo */}
                    <div className="d-flex gap-3 mb-2 small fw-semibold flex-wrap" style={{ color: config.secondaryText }}>
                        <span>
                            <i className={`fas fa-globe-americas me-1 ${config.isExcellent ? "" : ""}`} style={{ color: config.isExcellent ? config.color : '#0d6efd' }}></i> 
                            {countryName}
                        </span>
                        <span>
                            <i className={`fas fa-map-marker-alt me-1 ${config.isExcellent ? "" : ""}`} style={{ color: config.isExcellent ? config.color : '#dc3545' }}></i> 
                            {restaurant.city || "Ciudad"}
                        </span>
                        <span>
                            <i className={`fas fa-utensils me-1 ${config.isExcellent ? "" : ""}`} style={{ color: config.isExcellent ? config.color : '#198754' }}></i> 
                            {restaurant.food_type}
                        </span>
                    </div>

                    {/* Nombre del Restaurante */}
                    <h5 className="card-title fw-bold mb-1" style={{ color: config.textColor }}>
                        {restaurant.name}
                    </h5>

                    {/* Badge de Origen de Cocina */}
                    <div className="mb-3">
                        <span 
                            className="badge rounded-pill fw-bold"
                            style={{ 
                                color: config.isExcellent ? "#000" : config.color,
                                backgroundColor: config.isExcellent ? config.color : config.shadow, 
                                border: `1px solid ${config.color}`,
                                fontSize: "0.7rem",
                                textTransform: "uppercase"
                            }}
                        >
                            {restaurant.cuisine_origin || "Cocina Local"}
                        </span>
                    </div>

                    {/* Descripción */}
                    <p className="card-text small flex-grow-1" style={{ color: config.secondaryText }}>
                        {restaurant.description || "Explora una experiencia gastronómica inigualable con los mejores estándares de calidad."}
                    </p>

                    {/* Línea Decorativa Premium Inferior */}
                    <div 
                        className="mt-3" 
                        style={{ 
                            height: "6px", 
                            width: "100%", 
                            backgroundColor: config.color, 
                            borderRadius: "10px", 
                            boxShadow: config.isExcellent ? `0 0 15px ${config.color}` : "none"
                        }}
                    ></div>
                </div>
            </div>
        </>
    );
};

RestaurantCard.propTypes = {
    restaurant: PropTypes.object.isRequired
};