import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { RestaurantCard } from "../components/RestaurantCard";

export const Home = () => {
    const { store, dispatch } = useGlobalReducer();

    // 1. Estados de los filtros (Eliminamos searchTerm porque ahora usaremos store.searchQuery)
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

    const restaurantsList = store.restaurants || [];
    
    // --- EXTRACCIÓN DINÁMICA PARA LOS FILTROS ---
    const uniqueCountries = [...new Set(restaurantsList.map(r => r.country).filter(Boolean))].sort();
    const uniqueCities = [...new Set(restaurantsList.map(r => r.city).filter(Boolean))].sort();
    const uniqueFoodTypes = [...new Set(restaurantsList.map(r => r.food_type).filter(Boolean))].sort();
    const uniqueOrigins = [...new Set(restaurantsList.map(r => r.cuisine_origin).filter(Boolean))].sort();

    // --- LÓGICA DE FILTRADO ---
    const filteredRestaurants = restaurantsList.filter((rest) => {
        // Leemos la búsqueda global del Navbar (o del input de abajo)
        const query = store.searchQuery ? store.searchQuery.toLowerCase() : "";
        
        // Hacemos que la búsqueda coincida con el nombre o el tipo de comida
        const name = rest.name ? rest.name.toLowerCase() : "";
        const typeOfFood = rest.food_type ? rest.food_type.toLowerCase() : "";
        const matchSearch = name.includes(query) || typeOfFood.includes(query);

        // Evaluamos el resto de tus filtros locales
        const matchType = foodType === "" || rest.food_type === foodType;
        const matchOrigin = origin === "" || rest.cuisine_origin === origin;
        const matchScore = rest.score >= parseInt(minScore);
        const matchCity = searchCity === "" || rest.city === searchCity;
        const matchCountry = searchCountry === "" || rest.country === searchCountry;

        return matchSearch && matchType && matchOrigin && matchScore && matchCity && matchCountry;
    });

    // Función para limpiar absolutamente todos los filtros
    const clearAllFilters = () => {
        // Limpiamos la búsqueda global
        dispatch({ type: 'set_search_query', payload: "" });
        // Limpiamos los estados locales
        setFoodType(""); 
        setOrigin(""); 
        setMinScore(0); 
        setSearchCity(""); 
        setSearchCountry("");
    };

    return (
        <div className="container-fluid py-5" style={{ backgroundColor: "#fdfdfd" }}>
            <div className="container">
                
                {/* TÍTULO Y CONTADOR CIRCULAR */}
                <div className="d-flex align-items-center mb-4">
                    <h2 className="fw-bold mb-0" style={{ color: "#333" }}>
                        Destacados en <span style={{ color: "#D32F2F" }}>{searchCountry || "El Mundo"} ({searchCity || "Todas las Ciudades"})</span>
                    </h2>
                    {/* El Contador Circular */}
                    <div 
                        className="ms-3 d-flex justify-content-center align-items-center rounded-circle text-white shadow-sm transition-all"
                        style={{
                            backgroundColor: "#D32F2F",
                            width: "45px",
                            height: "45px",
                            fontSize: "1.2rem",
                            fontWeight: "bold",
                            transition: "all 0.3s ease" 
                        }}
                        title={`${filteredRestaurants.length} restaurantes encontrados`}
                    >
                        {filteredRestaurants.length}
                    </div>
                </div>

                {/* --- BARRA DE FILTROS --- */}
                <div className="card shadow-sm p-3 mb-5 bg-white rounded-4 border-0">
                    <h6 className="mb-3 fw-bold text-secondary">
                        <i className="fas fa-filter me-2"></i>Filtra tu antojo
                    </h6>
                    <div className="row g-3">
                        
                        {/* 1. Nombre (CONECTADO AL NAVBAR Y AL ESTADO GLOBAL) */}
                        <div className="col-12 col-md-4">
                            <input 
                                type="text" 
                                className="form-control bg-light border-0" 
                                placeholder="Buscar por nombre o comida..." 
                                value={store.searchQuery || ""} 
                                onChange={(e) => dispatch({ type: 'set_search_query', payload: e.target.value })} 
                            />
                        </div>
                        
                        {/* 2. Ciudad */}
                        <div className="col-12 col-md-4">
                            <select className="form-select bg-light border-0" value={searchCity} onChange={(e) => setSearchCity(e.target.value)} >
                                <option value="">Todas las Ciudades</option>
                                {uniqueCities.map((city, index) => (
                                    <option key={index} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        {/* 3. País */}
                        <div className="col-12 col-md-4">
                            <select className="form-select bg-light border-0" value={searchCountry} onChange={(e) => setSearchCountry(e.target.value)} >
                                <option value="">Todos los Países</option>
                                {uniqueCountries.map((country, index) => (
                                    <option key={index} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>

                        {/* 4. Tipo de Comida */}
                        <div className="col-12 col-md-4">
                            <select className="form-select bg-light border-0" value={foodType} onChange={(e) => setFoodType(e.target.value)} >
                                <option value="">Cualquier Tipo de Comida</option>
                                {uniqueFoodTypes.map((type, index) => (
                                    <option key={index} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* 5. Origen Culinario */}
                        <div className="col-12 col-md-4">
                            <select className="form-select bg-light border-0" value={origin} onChange={(e) => setOrigin(e.target.value)} >
                                <option value="">Cualquier Origen Culinario</option>
                                {uniqueOrigins.map((org, index) => (
                                    <option key={index} value={org}>{org}</option>
                                ))}
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
                                <button 
                                    className="btn btn-outline-danger mt-3 rounded-pill px-4"
                                    onClick={clearAllFilters}
                                > 
                                    Limpiar Filtros 
                                </button>
                            </div>
                        )
                    ) : null}
                </div>
            </div>
        </div>
    );
};