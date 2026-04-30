import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { RestaurantCard } from "../components/RestaurantCard";
import toast from "react-hot-toast";

export const Home = () => {
    const { store, dispatch } = useGlobalReducer();
    const location = useLocation();

    // Estados de los filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [foodType, setFoodType] = useState(location.state?.selectedCategory || "");
    const [origin, setOrigin] = useState("");
    const [minScore, setMinScore] = useState(0);
    const [searchCity, setSearchCity] = useState("");
    const [searchCountry, setSearchCountry] = useState("");

    useEffect(() => {
        if (location.state?.selectedCategory) {
            setFoodType(location.state.selectedCategory);
            setSearchTerm("");
            setSearchCity("");
            setSearchCountry("");
        }
    }, [location.state]);

    useEffect(() => {
        if (!store.restaurants || store.restaurants.length === 0) {
            const fetchPublicRestaurants = async () => {
                try {
                    const resp = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/restaurants");
                    if (resp.ok) {
                        const data = await resp.json();
                        dispatch({ type: "set_restaurants", payload: data });
                    } else {
                        // ALERTA SI EL BACKEND DEVUELVE ERROR (Ej. 500)
                        toast.error("Error al cargar los restaurantes 😢");
                    }
                } catch (error) {
                    console.error("Error de conexión:", error);
                    // ALERTA SI NO HAY INTERNET O EL SERVIDOR ESTÁ APAGADO
                    toast.error("Error de conexión con el servidor 😢");
                }
            };
            fetchPublicRestaurants();
        }
    }, []);

    const restaurantsList = store.restaurants || [];

    // --- EXTRACCIÓN DINÁMICA PARA LOS FILTROS ---
    const uniqueCountries = [...new Set(restaurantsList.map(r => r.country).filter(Boolean))].sort();

    // MODIFICACIÓN: Ciudades condicionales según el país seleccionado
    const uniqueCities = [...new Set(restaurantsList
        .filter(r => searchCountry === "" || r.country === searchCountry)
        .map(r => r.city)
        .filter(Boolean)
    )].sort();

    const uniqueFoodTypes = [...new Set(restaurantsList.map(r => r.food_type).filter(Boolean))].sort();
    const uniqueOrigins = [...new Set(restaurantsList.map(r => r.cuisine_origin).filter(Boolean))].sort();

    // MODIFICACIÓN: Función helper para los contadores dinámicos
    const getOptionCount = (key, value) => {
        if (key === "city" && searchCountry !== "") {
            return restaurantsList.filter(r => r[key] === value && r.country === searchCountry).length;
        }
        return restaurantsList.filter(r => r[key] === value).length;
    };

    // --- LÓGICA DE FILTRADO ---
    const filteredRestaurants = restaurantsList.filter((rest) => {
        // Usamos la búsqueda local
        const query = searchTerm.toLowerCase();

        const name = rest.name ? rest.name.toLowerCase() : "";
        const typeOfFood = rest.food_type ? rest.food_type.toLowerCase() : "";
        const matchSearch = name.includes(query) || typeOfFood.includes(query);

        const matchType = foodType === "" || rest.food_type === foodType;
        const matchOrigin = origin === "" || rest.cuisine_origin === origin;
        const matchScore = rest.score >= parseInt(minScore);
        const matchCity = searchCity === "" || rest.city === searchCity;
        const matchCountry = searchCountry === "" || rest.country === searchCountry;

        return matchSearch && matchType && matchOrigin && matchScore && matchCity && matchCountry;
    });

    // Función para limpiar absolutamente todos los filtros
    const clearAllFilters = () => {
        setSearchTerm(""); // Limpiamos estado local
        setFoodType("");
        setOrigin("");
        setMinScore(0);
        setSearchCity("");
        setSearchCountry("");
        // ALERTA AL LIMPIAR FILTROS
        toast("Filtros limpiados", { icon: "🧹" });
    };

    return (
        <div className="container-fluid py-5" style={{ backgroundColor: "#fdfdfd" }}>
            <div className="container">

                {/* TÍTULO Y CONTADOR CIRCULAR */}
                <div className="d-flex align-items-center mb-4">
                    {/* Fuente adaptable con clamp() para que no se rompa en celulares */}
                    <h2 className="fw-bold mb-0" style={{ color: "#333", fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>
                        Destacados en <span style={{ color: "#D32F2F" }}>{searchCountry || "El Mundo"} ({searchCity || "Todas"})</span>
                    </h2>
                    <div
                        className="ms-3 d-flex justify-content-center align-items-center rounded-circle text-white shadow-sm transition-all flex-shrink-0"
                        style={{
                            backgroundColor: "#D32F2F",
                            width: "40px",
                            height: "40px",
                            fontSize: "1.1rem",
                            fontWeight: "bold"
                        }}
                        title={`${filteredRestaurants.length} restaurantes encontrados`}
                    >
                        {filteredRestaurants.length}
                    </div>
                </div>

                {/* --- BARRA DE FILTROS COMPACTA --- */}
                <div className="card shadow-sm p-3 mb-5 bg-white rounded-4 border-0">
                    <h6 className="mb-3 fw-bold text-secondary">
                        <i className="fas fa-filter me-2"></i>Filtra tu antojo
                    </h6>
                    <div className="row g-2 g-md-3 align-items-end">

                        {/* Búsqueda */}
                        <div className="col-12 col-sm-6 col-md-4">
                            <label className="form-label text-muted fw-bold mb-1" style={{ fontSize: "0.8rem" }}>Buscar</label>
                            <input
                                type="text"
                                className="form-control form-control-sm bg-light border-0"
                                placeholder="Nombre o comida..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ fontSize: "0.85rem" }}
                            />
                        </div>

                        {/* País */}
                        <div className="col-12 col-sm-6 col-md-4">
                            <label className="form-label text-muted fw-bold mb-1" style={{ fontSize: "0.8rem" }}>País</label>
                            <select
                                className="form-select form-select-sm bg-light border-0"
                                value={searchCountry}
                                onChange={(e) => {
                                    setSearchCountry(e.target.value);
                                    setSearchCity(""); // Resetea la ciudad al cambiar de país
                                }}
                                style={{ fontSize: "0.85rem" }}
                            >
                                <option value="">Cualquier País</option>
                                {uniqueCountries.map((country, index) => (
                                    <option key={index} value={country}>
                                        {country} ({getOptionCount("country", country)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Ciudad */}
                        <div className="col-12 col-sm-6 col-md-4">
                            <label className="form-label text-muted fw-bold mb-1" style={{ fontSize: "0.8rem" }}>Ciudad</label>
                            <select
                                className="form-select form-select-sm bg-light border-0"
                                value={searchCity}
                                onChange={(e) => setSearchCity(e.target.value)}
                                style={{ fontSize: "0.85rem" }}
                            >
                                <option value="">Cualquier Ciudad</option>
                                {uniqueCities.map((city, index) => (
                                    <option key={index} value={city}>
                                        {city} ({getOptionCount("city", city)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tipo de Comida */}
                        <div className="col-12 col-sm-6 col-md-4">
                            <label className="form-label text-muted fw-bold mb-1" style={{ fontSize: "0.8rem" }}>Tipo de Comida</label>
                            <select
                                className="form-select form-select-sm bg-light border-0"
                                value={foodType}
                                onChange={(e) => setFoodType(e.target.value)}
                                style={{ fontSize: "0.85rem" }}
                            >
                                <option value="">Cualquier Comida</option>
                                {uniqueFoodTypes.map((type, index) => (
                                    <option key={index} value={type}>
                                        {type} ({getOptionCount("food_type", type)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Origen Culinario */}
                        <div className="col-12 col-sm-6 col-md-4">
                            <label className="form-label text-muted fw-bold mb-1" style={{ fontSize: "0.8rem" }}>Origen de Comida</label>
                            <select
                                className="form-select form-select-sm bg-light border-0"
                                value={origin}
                                onChange={(e) => setOrigin(e.target.value)}
                                style={{ fontSize: "0.85rem" }}
                            >
                                <option value="">Cualquier Origen</option>
                                {uniqueOrigins.map((org, index) => (
                                    <option key={index} value={org}>
                                        {org} ({getOptionCount("cuisine_origin", org)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Rating */}
                        <div className="col-12 col-sm-6 col-md-4">
                            <label className="form-label text-muted fw-bold mb-1" style={{ fontSize: "0.8rem" }}>Rating</label>
                            <select
                                className="form-select form-select-sm bg-light border-0"
                                value={minScore}
                                onChange={(e) => setMinScore(e.target.value)}
                                style={{ fontSize: "0.85rem" }}
                            >
                                <option value={0}>Cualquier Rating</option>
                                <option value={90}>Excelente (90+)</option>
                                <option value={80}>Muy Bueno (80+)</option>
                                <option value={60}>Aceptable (60+)</option>
                                <option value={10}>Malo (10+)</option>
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