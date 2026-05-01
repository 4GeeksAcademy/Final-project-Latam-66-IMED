import React, { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

// Diccionario de imágenes
const imageDictionary = {
    "Mexicana": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80",
    "Italiana": "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
    "Japonesa": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
    "Estadounidense": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    "Coreana": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
    "Francesa": "https://images.pexels.com/photos/33674416/pexels-photo-33674416.jpeg"
};

const defaultImage = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80";

export const Categorias = () => {
    const navigate = useNavigate();
    
    // IMPORTANTE: Asignamos "{}" por si el hook de reducer aún no ha cargado completamente
    const { store, dispatch } = useGlobalReducer() || {};

    // EFECTO DE RESCATE: Busca restaurantes si llegamos a la página vacía
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const resp = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/restaurants");
                if (resp.ok) {
                    const data = await resp.json();
                    if (dispatch) {
                        dispatch({ type: "set_restaurants", payload: data });
                    }
                }
            } catch (error) {
                console.error("Error cargando restaurantes:", error);
            }
        };

        // Verificamos de forma segura usando "?."
        if (!store?.restaurants || store.restaurants.length === 0) {
            fetchRestaurants();
        }
    }, [store?.restaurants, dispatch]); // Dependencias seguras

    // Calculamos la lista protegiendo todas las lecturas con "?."
    const categoriasList = useMemo(() => {
        const restaurants = store?.restaurants || [];
        
        // Extraemos solo los tipos de comida, filtramos vacíos y nulos, y quitamos duplicados
        const uniqueFoodTypes = [...new Set(restaurants.map(r => r?.food_type).filter(Boolean))];
        
        const dynamicCategories = uniqueFoodTypes.map(type => ({
            name: type,
            img: imageDictionary[type] || defaultImage 
        }));

        // Mezclamos al azar
        return dynamicCategories.sort(() => Math.random() - 0.5);
    }, [store?.restaurants]); 

    const handleCategoryClick = (categoryName) => {
        navigate("/", { state: { selectedCategory: categoryName } });
    };

    return (
        <div className="container-fluid py-5" style={{ backgroundColor: "#fdfdfd", minHeight: "80vh" }}>
            <div className="container">
                <div className="text-center mb-5">
                    <h1 className="fw-bold" style={{ color: "var(--fc-dark)" }}>¿Qué se te antoja hoy?</h1>
                    <p className="text-muted fs-5">Explora los mejores sabores agrupados para ti.</p>
                </div>

                {/* Si está cargando o no hay categorías, mostramos este mensaje */}
                {!store?.restaurants || categoriasList.length === 0 ? (
                    <div className="text-center py-5">
                        <i className="fas fa-utensils fs-1 text-muted mb-3 d-block"></i>
                        <h4 className="text-muted">Cargando categorías...</h4>
                    </div>
                ) : (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {categoriasList.map((cat, index) => (
                            <div key={index} className="col">
                                <div 
                                    onClick={() => handleCategoryClick(cat.name)}
                                    className="ratio ratio-1x1 rounded-4 overflow-hidden shadow-sm position-relative"
                                    style={{ cursor: "pointer", transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = "translateY(-5px)";
                                        e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.2)";
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                        e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                                    }}
                                >
                                    <img src={cat.img} alt={cat.name} className="position-absolute w-100 h-100 object-fit-cover" />
                                    <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}>
                                        <h3 className="text-white fw-bold mb-0 text-uppercase tracking-wider text-center px-2" style={{ letterSpacing: "2px" }}>
                                            {cat.name}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};