import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { RestaurantCard } from "../components/RestaurantCard";

export const Home = () => {
    const { store, dispatch } = useGlobalReducer();

    // 1. Estados de los filtros originales + Los 2 nuevos (City y Country)
    const [searchTerm, setSearchTerm] = useState("");
    const [foodType, setFoodType] = useState("");
    const [origin, setOrigin] = useState("");
    const [minScore, setMinScore] = useState(0);
    const [searchCity, setSearchCity] = useState("");
    const [searchCountry, setSearchCountry] = useState("");

    useEffect(() => {
        if (!store.restaurants || store.restaurants.length === 0) {
            const fetchPublicRestaurants = async () => {
                try {
                    const resp = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/restaurants");
                    if (resp.ok) {
                        const data = await resp.json();
                        dispatch({ type: "set_restaurants", payload: data });
                    }
                } catch (error) {
                    console.error("Error de conexión:", error);
                }
            };
            fetchPublicRestaurants();
        }
    }, []);

    // 2. Lógica del Filtro Actualizada
    const restaurantsToFilter = store.restaurants || [];
    
    // Función temporal para predecir el país mientras actualizamos el backend
    const getCountryFallback = (city) => {
        const cityMap = { "Caracas": "Venezuela", "CDMX": "México", "Lima": "Perú", "Madrid": "España", "Bangkok": "Tailandia" };
        return cityMap[city] || "";
    };

    const filteredRestaurants = restaurantsToFilter.filter((rest) => {
        const matchName = rest.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = foodType === "" || rest.food_type === foodType;
        const matchOrigin = origin === "" || rest.cuisine_origin === origin;
        const matchScore = rest.score >= parseInt(minScore);
        
        // Nuevos filtros (Ignoramos mayúsculas/minúsculas)
        const matchCity = searchCity === "" || rest.city?.toLowerCase().includes(searchCity.toLowerCase());
        
        // Comprobamos si el país coincide (usando el del backend si existe, o el fallback temporal)
        const currentCountry = rest.country || getCountryFallback(rest.city);
        const matchCountry = searchCountry === "" || currentCountry === searchCountry;

        return matchName && matchType && matchOrigin && matchScore && matchCity && matchCountry;
    });

    return (
        <div className="container-fluid py-5" style={{ backgroundColor: "#fdfdfd" }}>
            <div className="container">
                <h2 className="fw-bold mb-4" style={{ color: "#333" }}>
                    Destacados en <span style={{ color: "#D32F2F" }}>{searchCountry || "El Mundo"}</span>
                </h2>

                {/* --- BARRA DE FILTROS --- */}
                <div className="card shadow-sm p-3 mb-5 bg-white rounded-4 border-0">
                    <h6 className="mb-3 fw-bold text-secondary">
                        <i className="fas fa-filter me-2"></i>Filtra tu antojo
                    </h6>
                    {/* Cambiamos a g-3 y col-md-4 para que quepan 3 por fila */}
                    <div className="row g-3">
                        
                        {/* 1. Nombre */}
                        <div className="col-12 col-md-4">
                            <input type="text" className="form-control bg-light border-0" placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        
                        {/* 2. Ciudad (Nuevo) */}
                        <div className="col-12 col-md-4">
                            <input type="text" className="form-control bg-light border-0" placeholder="Buscar por ciudad..." value={searchCity} onChange={(e) => setSearchCity(e.target.value)} />
                        </div>

                        {/* 3. País (Nuevo) */}
                        <div className="col-12 col-md-4">
                            <select className="form-select bg-light border-0" value={searchCountry} onChange={(e) => setSearchCountry(e.target.value)} >
                                <option value="">Cualquier País</option>
                                <option value="Venezuela">Venezuela</option>
                                <option value="México">México</option>
                                <option value="España">España</option>
                                <option value="Perú">Perú</option>
                                <option value="Tailandia">Tailandia</option>
                            </select>
                        </div>

                        {/* 4. Tipo de Comida */}
                        <div className="col-12 col-md-4">
                            <select className="form-select bg-light border-0" value={foodType} onChange={(e) => setFoodType(e.target.value)} >
                                <option value="">Cualquier Tipo de Comida</option>
                                <option value="Cortes">Cortes de Carne</option>
                                <option value="Sushi">Sushi</option>
                                <option value="Hamburguesas">Hamburguesas</option>
                                <option value="Pasta">Pasta</option>
                                <option value="Rellena">Arepa Rellena</option>
                                <option value="Tacos">Tacos</option>
                                <option value="Ceviche">Ceviche</option>
                            </select>
                        </div>

                        {/* 5. Origen */}
                        <div className="col-12 col-md-4">
                            <select className="form-select bg-light border-0" value={origin} onChange={(e) => setOrigin(e.target.value)} >
                                <option value="">Cualquier Origen Culinario</option>
                                <option value="Venezolana">Venezolana</option>
                                <option value="Italiana">Italiana</option>
                                <option value="Japonesa">Japonesa</option>
                                <option value="Americana">Americana</option>
                                <option value="Mexicana">Mexicana</option>
                                <option value="Peruana">Peruana</option>
                            </select>
                        </div>

                        {/* 6. Rating */}
                        <div className="col-12 col-md-4">
                            <select className="form-select bg-light border-0" value={minScore} onChange={(e) => setMinScore(e.target.value)} >
                                <option value={0}>Cualquier Rating</option>
                                <option value={90}>Excelente (90+)</option>
                                <option value={80}>Muy Bueno (80+)</option>
                                <option value={60}>Aceptable (60+)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* --- LISTA DE RESTAURANTES FILTRADA --- */}
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                    {store.restaurants && store.restaurants.length > 0 ? (
                        filteredRestaurants.length > 0 ? (
                            filteredRestaurants.map((rest) => (
                                <div key={rest.id} className="col">
                                    <RestaurantCard restaurant={rest} />
                                </div>
                            ))
                        ) : (
                            <div className="col-12 text-center py-5 w-100">
                                <h4 className="text-muted">No encontramos restaurantes con esos filtros 😢</h4>
                                <button className="btn btn-outline-danger mt-3 rounded-pill px-4"
                                    onClick={() => { setSearchTerm(""); setFoodType(""); setOrigin(""); setMinScore(0); setSearchCity(""); setSearchCountry(""); }}
                                > Limpiar Filtros </button>
                            </div>
                        )
                    ) : null}
                </div>
            </div>
        </div>
    );
};