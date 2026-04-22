import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { RestaurantCard } from "../components/RestaurantCard";

export const Home = () => {
    const { store, dispatch } = useGlobalReducer();

    // 1. Estados locales para capturar los filtros del usuario
    const [searchTerm, setSearchTerm] = useState("");
    const [foodType, setFoodType] = useState("");
    const [origin, setOrigin] = useState("");
    const [minScore, setMinScore] = useState(0);

    useEffect(() => {
        // Comprobamos si la lista de restaurantes está vacía
        if (!store.restaurants || store.restaurants.length === 0) {
            const fetchPublicRestaurants = async () => {
                try {
                    // Hacemos el GET público al backend
                    const resp = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/restaurants");
                    if (resp.ok) {
                        const data = await resp.json();
                        // Guardamos los datos en la memoria global
                        dispatch({ type: "set_restaurants", payload: data });
                    } else {
                        console.error("Error del servidor:", resp.status);
                    }
                } catch (error) {
                    console.error("Error de conexión:", error);
                }
            };
            fetchPublicRestaurants();
        }
    }, []); // <-- El array vacío es vital para que solo lo busque una vez al entrar

    // 2. Lógica del Filtro (Estado Derivado)
    // Usamos de forma segura store.restaurants (si es nulo, usamos un array vacío)
    const restaurantsToFilter = store.restaurants || [];
    
    // Filtramos la lista original en tiempo real basándonos en los estados
    const filteredRestaurants = restaurantsToFilter.filter((rest) => {
        const matchName = rest.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = foodType === "" || rest.food_type === foodType;
        const matchOrigin = origin === "" || rest.cuisine_origin === origin;
        const matchScore = rest.score >= parseInt(minScore);

        return matchName && matchType && matchOrigin && matchScore;
    });

    return (
        <div className="container-fluid py-5" style={{ backgroundColor: "#fdfdfd" }}>
            <div className="container">
                <h2 className="fw-bold mb-4" style={{ color: "#333" }}>
                    Destacados en <span style={{ color: "#D32F2F" }}>Caracas</span>
                </h2>

                {/* --- BARRA DE FILTROS --- */}
                <div className="card shadow-sm p-4 mb-5 bg-white rounded-4 border-0">
                    <h5 className="mb-3 fw-bold text-secondary">
                        <i className="fas fa-filter me-2"></i>Filtra tu antojo
                    </h5>
                    <div className="row g-3">
                        <div className="col-12 col-md-3">
                            <input 
                                type="text" 
                                className="form-control form-control-sm bg-light border-0" 
                                placeholder="Buscar restaurante..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="col-12 col-md-3">
                            <select 
                                className="form-select form-select-sm bg-light border-0"
                                value={foodType}
                                onChange={(e) => setFoodType(e.target.value)}
                            >
                                <option value="">Cualquier Tipo</option>
                                <option value="Cortes">Cortes de Carne</option>
                                <option value="Sushi">Sushi</option>
                                <option value="Hamburguesas">Hamburguesas</option>
                                <option value="Pasta">Pasta</option>
                                <option value="Rellena">Arepa Rellena</option>
                                <option value="Tacos">Tacos</option>
                                <option value="Arroz">Arroz / Wok</option>
                                <option value="Pad Thai">Pad Thai</option>
                                <option value="Ceviche">Ceviche</option>
                            </select>
                        </div>
                        <div className="col-12 col-md-3">
                            <select 
                                className="form-select form-select-sm bg-light border-0"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                            >
                                <option value="">Cualquier Origen</option>
                                <option value="Venezolana">Venezolana</option>
                                <option value="Italiana">Italiana</option>
                                <option value="Japonesa">Japonesa</option>
                                <option value="Argentina">Argentina</option>
                                <option value="Americana">Americana</option>
                                <option value="Mexicana">Mexicana</option>
                                <option value="China">China</option>
                                <option value="Española">Española</option>
                                <option value="Tailandesa">Tailandesa</option>
                                <option value="Peruana">Peruana</option>
                            </select>
                        </div>
                        <div className="col-12 col-md-3">
                            <select 
                                className="form-select form-select-sm bg-light border-0"
                                value={minScore}
                                onChange={(e) => setMinScore(e.target.value)}
                            >
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
                    {/* Primero verificamos que los datos ya llegaron del backend */}
                    {store.restaurants && store.restaurants.length > 0 ? (
                        filteredRestaurants.length > 0 ? (
                            // Si hay coincidencias en el filtro, las pintamos
                            filteredRestaurants.map((rest) => (
                                <div key={rest.id} className="col">
                                    <RestaurantCard restaurant={rest} />
                                </div>
                            ))
                        ) : (
                            // Si se filtró pero no hay resultados
                            <div className="col-12 text-center py-5 w-100">
                                <h4 className="text-muted">No encontramos restaurantes con esos filtros 😢</h4>
                                <button 
                                    className="btn btn-outline-danger mt-3 rounded-pill px-4"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setFoodType("");
                                        setOrigin("");
                                        setMinScore(0);
                                    }}
                                >
                                    Limpiar Filtros
                                </button>
                            </div>
                        )
                    ) : null}
                </div>

                {/* Mensaje de carga mientras llegan los datos del Backend */}
                {(!store.restaurants || store.restaurants.length === 0) && (
                    <p className="text-center mt-5 text-secondary">
                        <i className="fas fa-spinner fa-spin me-2"></i> Cargando los mejores restaurantes...
                    </p>
                )}
            </div>
        </div>
    );
};