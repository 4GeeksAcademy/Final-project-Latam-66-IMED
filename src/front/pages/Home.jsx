import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { RestaurantCard } from "../components/RestaurantCard";
import toast from "react-hot-toast";

// --- ACTUALIZACIÓN DE COLORES PARA HACER MATCH CON RESTAURANTCARD ---
const RATING_RANGES = [
    { id: "malo", label: "Malo", min: 0, max: 39, color: "rgba(225, 29, 72, 1)" },         // Rojo Carmesí
    { id: "regular", label: "Regular", min: 40, max: 59, color: "rgba(249, 115, 22, 1)" }, // Naranja Coral
    { id: "bueno", label: "Bueno", min: 60, max: 79, color: "rgba(37, 99, 235, 1)" },      // Azul Safiro
    { id: "muy_bueno", label: "Muy Bueno", min: 80, max: 89, color: "rgba(21, 128, 61, 1)" }, // Verde Bosque
    { id: "excelente", label: "Excelente", min: 90, max: 100, color: "rgba(218, 165, 32, 1)" } // Dorado Intenso
];

export const Home = () => {
    const { store, dispatch } = useGlobalReducer();
    const location = useLocation();

    // Estados de los filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [foodType, setFoodType] = useState(location.state?.selectedCategory || "");
    const [origin, setOrigin] = useState("");
    const [selectedRange, setSelectedRange] = useState(null); // Nuevo estado para el rango
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
                        toast.error("Error al cargar los restaurantes 😢");
                    }
                } catch (error) {
                    console.error("Error de conexión:", error);
                    toast.error("Error de conexión con el servidor 😢");
                }
            };
            fetchPublicRestaurants();
        }
    }, []);

    const restaurantsList = store.restaurants || [];

    // --- EXTRACCIÓN DINÁMICA ---
    const uniqueCountries = [...new Set(restaurantsList.map(r => r.country).filter(Boolean))].sort();
    const uniqueCities = [...new Set(restaurantsList
        .filter(r => searchCountry === "" || r.country === searchCountry)
        .map(r => r.city)
        .filter(Boolean)
    )].sort();
    const uniqueFoodTypes = [...new Set(restaurantsList.map(r => r.food_type).filter(Boolean))].sort();
    const uniqueOrigins = [...new Set(restaurantsList.map(r => r.cuisine_origin).filter(Boolean))].sort();

    const getOptionCount = (key, value) => {
        if (key === "city" && searchCountry !== "") {
            return restaurantsList.filter(r => r[key] === value && r.country === searchCountry).length;
        }
        return restaurantsList.filter(r => r[key] === value).length;
    };

    // --- LÓGICA DE FILTRADO ACTUALIZADA ---
    const filteredRestaurants = restaurantsList.filter((rest) => {
        const query = searchTerm.toLowerCase();
        const name = rest.name ? rest.name.toLowerCase() : "";
        const typeOfFood = rest.food_type ? rest.food_type.toLowerCase() : "";
        
        const matchSearch = name.includes(query) || typeOfFood.includes(query);
        const matchType = foodType === "" || rest.food_type === foodType;
        const matchOrigin = origin === "" || rest.cuisine_origin === origin;
        const matchCity = searchCity === "" || rest.city === searchCity;
        const matchCountry = searchCountry === "" || rest.country === searchCountry;

        // NUEVA LÓGICA DE RATING POR RANGO
        let matchScore = true;
        if (selectedRange) {
            matchScore = rest.score >= selectedRange.min && rest.score <= selectedRange.max;
        }

        return matchSearch && matchType && matchOrigin && matchScore && matchCity && matchCountry;
    });

    const clearAllFilters = () => {
        setSearchTerm("");
        setFoodType("");
        setOrigin("");
        setSelectedRange(null);
        setSearchCity("");
        setSearchCountry("");
        toast("Filtros limpiados", { icon: "🧹" });
    };

    return (
        <div className="container-fluid py-5" style={{ backgroundColor: "#fdfdfd" }}>
            <div className="container">

                {/* TÍTULO Y CONTADOR */}
                <div className="d-flex align-items-center mb-4">
                    <h2 className="fw-bold mb-0" style={{ color: "#333", fontSize: "clamp(1.5rem, 4vw, 2rem)" }}>
                        Destacados en <span style={{ color: "#D32F2F" }}>{searchCountry || "El Mundo"} ({searchCity || "Todas"})</span>
                    </h2>
                    <div
                        className="ms-3 d-flex justify-content-center align-items-center rounded-circle text-white shadow-sm flex-shrink-0"
                        style={{ backgroundColor: "#D32F2F", width: "40px", height: "40px", fontSize: "1.1rem", fontWeight: "bold" }}
                    >
                        {filteredRestaurants.length}
                    </div>
                </div>

                {/* --- BARRA DE FILTROS --- */}
                <div className="card shadow-sm p-4 mb-5 bg-white rounded-4 border-0">
                    <div className="row g-4">
                        {/* Buscador, País, Ciudad, Comida, Origen */}
                        <div className="col-12 col-md-4">
                            <label className="form-label text-muted fw-bold mb-1 small">Buscar</label>
                            <input type="text" className="form-control form-control-sm bg-light border-0" placeholder="Nombre o comida..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="col-12 col-sm-6 col-md-2">
                            <label className="form-label text-muted fw-bold mb-1 small">País</label>
                            <select className="form-select form-select-sm bg-light border-0" value={searchCountry} onChange={(e) => { setSearchCountry(e.target.value); setSearchCity(""); }}>
                                <option value="">Cualquier País</option>
                                {uniqueCountries.map((c, i) => <option key={i} value={c}>{c} ({getOptionCount("country", c)})</option>)}
                            </select>
                        </div>
                        <div className="col-12 col-sm-6 col-md-2">
                            <label className="form-label text-muted fw-bold mb-1 small">Ciudad</label>
                            <select className="form-select form-select-sm bg-light border-0" value={searchCity} onChange={(e) => setSearchCity(e.target.value)}>
                                <option value="">Cualquier Ciudad</option>
                                {uniqueCities.map((c, i) => <option key={i} value={c}>{c} ({getOptionCount("city", c)})</option>)}
                            </select>
                        </div>
                        <div className="col-12 col-sm-6 col-md-2">
                            <label className="form-label text-muted fw-bold mb-1 small">Comida</label>
                            <select className="form-select form-select-sm bg-light border-0" value={foodType} onChange={(e) => setFoodType(e.target.value)}>
                                <option value="">Todas</option>
                                {uniqueFoodTypes.map((t, i) => <option key={i} value={t}>{t} ({getOptionCount("food_type", t)})</option>)}
                            </select>
                        </div>
                        <div className="col-12 col-sm-6 col-md-2">
                            <label className="form-label text-muted fw-bold mb-1 small">Origen</label>
                            <select className="form-select form-select-sm bg-light border-0" value={origin} onChange={(e) => setOrigin(e.target.value)}>
                                <option value="">Cualquier Origen</option>
                                {uniqueOrigins.map((o, i) => <option key={i} value={o}>{o} ({getOptionCount("cuisine_origin", o)})</option>)}
                            </select>
                        </div>

                        {/* --- NUEVO FILTRO DE RATING VISUAL --- */}
                        <div className="col-12 mt-4">
                            <label className="form-label text-muted fw-bold mb-2 d-block small">Puntuación Crítica (MetaScore)</label>
                            <div className="d-flex flex-wrap gap-2">
                                {RATING_RANGES.map((range) => {
                                    const isSelected = selectedRange?.id === range.id;
                                    const isExcellent = range.id === "excelente";
                                    
                                    // Lógica visual dinámica para replicar el "Look Premium"
                                    const bgColor = isSelected 
                                        ? (isExcellent ? "#000000" : range.color) 
                                        : "transparent";
                                        
                                    const textColor = isSelected 
                                        ? (isExcellent ? range.color : "#ffffff") 
                                        : range.color;
                                        
                                    const borderColor = range.color;

                                    return (
                                        <button
                                            key={range.id}
                                            onClick={() => setSelectedRange(isSelected ? null : range)}
                                            className="btn btn-sm rounded-pill px-3 fw-bold transition-all border-2 shadow-sm"
                                            style={{
                                                borderColor: borderColor,
                                                backgroundColor: bgColor,
                                                color: textColor,
                                                fontSize: "0.75rem",
                                                // Añadimos un sutil efecto glow cuando se selecciona "Excelente"
                                                boxShadow: isSelected && isExcellent ? `0 0 10px ${range.color}80` : "none"
                                            }}
                                        >
                                            {range.label} {range.id !== "top" && `(${range.min}-${range.max})`}
                                        </button>
                                    );
                                })}
                                
                                {selectedRange && (
                                    <button 
                                        className="btn btn-link btn-sm text-muted text-decoration-none fw-bold" 
                                        onClick={() => setSelectedRange(null)}
                                        style={{ fontSize: "0.75rem" }}
                                    >
                                        <i className="fas fa-times-circle me-1 text-danger"></i>Quitar filtro
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- LISTA DE RESTAURANTES --- */}
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
                                <h4 className="text-muted">No hay resultados para esta puntuación 😢</h4>
                                <button className="btn btn-outline-danger mt-3 rounded-pill px-4" onClick={clearAllFilters}>Limpiar Todo</button>
                            </div>
                        )
                    ) : (
                        <div className="col-12 text-center py-5 w-100">
                           <div className="spinner-border text-danger" role="status"></div>
                           <p className="mt-2 text-muted">Cargando restaurantes...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};