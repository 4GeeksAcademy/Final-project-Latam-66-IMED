/*
mport React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Single = () => {
    // 1. Obtenemos el ID de la URL (ej. /restaurant/1 -> id = 1)
    const { id } = useParams(); 
    const { store } = useGlobalReducer();
    
    // 2. Estados locales para manejar la carga y los datos
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);


    // --- NUEVOS ESTADOS PARA LOS COMENTARIOS ---
    const [comments, setComments] = useState([]); // Guarda los comentarios de la BD
    const [newScore, setNewScore] = useState(""); // Guarda el puntaje del input
    const [newText, setNewText] = useState(""); // Guarda el texto del input

    // 3. Buscamos la info del restaurante al cargar la página
    useEffect(() => {
        // Le cambiamos el nombre a fetchData porque ahora trae 2 cosas (restaurante y comentarios)
        const fetchData = async () => {
            try {
                // --- 1.Traer el restaurante ---
                const resp = await fetch(import.meta.env.VITE_BACKEND_URL + `/api/restaurants/${id}`);
                
                if (resp.ok) {
                    const data = await resp.json();
                    setRestaurant(data);
                } else {
                    // Plan B: Si el backend aún no tiene el endpoint individual
                    if (store.restaurants && store.restaurants.length > 0) {
                        const found = store.restaurants.find(r => r.id === parseInt(id));
                        setRestaurant(found || null);
                    }
                }

                // --- 2. Traer los comentarios del restaurante ---
                const respComments = await fetch(import.meta.env.VITE_BACKEND_URL + `/api/restaurants/${id}/comments`);
                if (respComments.ok) {
                    const commentsData = await respComments.json();
                    // Guardamos los comentarios en el nuevo estado
                    setComments(commentsData); 
                }

            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData(); // Ejecutamos la función
    }, [id, store.restaurants]);

    // Pantallas de carga y error
    if (loading) return <div className="text-center py-5 mt-5"><h5><i className="fas fa-spinner fa-spin me-2"></i>Cargando detalles...</h5></div>;
    if (!restaurant) return (
        <div className="text-center py-5 mt-5">
            <h2 className="text-danger mb-3">Restaurante no encontrado 😢</h2>
            <Link to="/" className="btn btn-outline-primary">Volver al inicio</Link>
        </div>
    );

    // Lógica de colores basada en el score
    const getRankingConfig = (score) => {
        if (score >= 80) return { label: "Excelente", color: "#198754", shadow: "rgba(25, 135, 84, 0.2)" };
        if (score >= 60) return { label: "Bueno", color: "#0d6efd", shadow: "rgba(13, 110, 253, 0.2)" };
        if (score >= 40) return { label: "Regular", color: "#ffc107", shadow: "rgba(255, 193, 7, 0.2)" };
        return { label: "Malo", color: "#dc3545", shadow: "rgba(220, 53, 69, 0.2)" };
    };
    const config = getRankingConfig(restaurant.score);

    // Comentarios Simulados (Próximo paso para conectar con la Base de Datos)
    const mockComments = [
        { id: 1, user: "María G.", text: "La atención fue increíble, la comida llegó rápido.", score: 95 },
        { id: 2, user: "Juan Pérez", text: "Muy buen ambiente, pero podría mejorar el precio.", score: 75 }
    ];

    // Verificación de Login (Asumiendo que guardas el token en store.token)
    const isUserLoggedIn = store.token || store.user;

    return (
        <div className="container py-5 mt-4">
            
            {/* --- BOTÓN DE VOLVER --- */}
            <div className="mb-4">
                <Link to="/" className="text-decoration-none text-secondary">
                    <i className="fas fa-arrow-left me-2"></i> Volver a restaurantes
                </Link>
            </div>

            {/* --- SECCIÓN SUPERIOR: IMAGEN E INFORMACIÓN --- */}
            <div className="row mb-5 align-items-center">
                
                {/* Izquierda: Imagen */}
                <div className="col-12 col-md-6 mb-4 mb-md-0">
                    <img 
                        src={restaurant.image_url || "https://placehold.co/800x600?text=Sin+Imagen"} 
                        alt={restaurant.name} 
                        className="img-fluid rounded-4 shadow object-fit-cover w-100" 
                        style={{ height: "400px" }} 
                    />
                </div>

                {/* Derecha: Información */}
                <div className="col-12 col-md-6 ps-md-5">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h1 className="display-4 fw-bold mb-2 text-dark">{restaurant.name}</h1>
                            <div className="d-flex gap-3 text-secondary fs-5 mb-3">
                                <span><i className="fas fa-utensils me-2"></i>{restaurant.food_type}</span>
                                <span><i className="fas fa-map-marker-alt me-2"></i>{restaurant.city || "Ubicación desconocida"}</span>
                            </div>
                        </div>

                        {/* Diseño Circular del Puntaje */}
                        <div 
                            className="rounded-circle d-flex flex-column justify-content-center align-items-center shadow-sm" 
                            style={{ 
                                width: "110px", height: "110px", 
                                backgroundColor: config.color, color: "white", 
                                border: `5px solid ${config.shadow}` 
                            }}
                        >
                            <span className="fw-bold lh-1" style={{ fontSize: "2.5rem" }}>{restaurant.score}</span>
                            <span className="fw-semibold text-uppercase" style={{ fontSize: "0.6rem", letterSpacing: "1px" }}>{config.label}</span>
                        </div>
                    </div>

                    <span 
                        className="badge rounded-pill mb-4 px-3 py-2 fs-6" 
                        style={{ backgroundColor: config.shadow, color: config.color, border: `1px solid ${config.color}` }}
                    >
                        Origen: {restaurant.cuisine_origin}
                    </span>

                    <h5 className="fw-bold mb-3">Acerca del restaurante</h5>
                    <p className="lead text-secondary" style={{ lineHeight: "1.8", fontSize: "1.1rem" }}>
                        {restaurant.description || "Un lugar increíble con gran variedad gastronómica. Disfruta de la mejor calidad en cada plato."}
                    </p>
                </div>
            </div>

            <hr className="my-5 text-muted opacity-25" />

            {/* --- SECCIÓN INFERIOR: COMENTARIOS --- */}
            <div className="row">
                <div className="col-12 col-lg-8 mx-auto">
                    <h3 className="fw-bold mb-4"><i className="fas fa-comments me-2" style={{color: "#D32F2F"}}></i> Reseñas de la Comunidad</h3>

                    {/* Verificación de Login para poder comentar */}
           
                    {isUserLoggedIn ? (
                        <div className="card shadow-sm p-4 mb-5 rounded-4 border-0 bg-white" style={{ borderLeft: "5px solid #D32F2F !important" }}>
                            <h5 className="fw-bold mb-3">Deja tu puntuación</h5>
                            <div className="d-flex flex-column flex-md-row gap-3">
                                <input type="number" className="form-control" placeholder="Puntaje (0-100)" max="100" min="0" style={{ maxWidth: "150px" }} />
                                <input type="text" className="form-control" placeholder="Escribe tu comentario aquí..." />
                                <button className="btn btn-primary px-4 fw-bold rounded-3" style={{ backgroundColor: "#D32F2F", border: "none" }}>Enviar</button>
                            </div>
                        </div>
                    ) : (
                        <div className="alert alert-warning rounded-4 border-0 shadow-sm d-flex align-items-center p-4 mb-5" style={{ backgroundColor: "#fff3cd" }}>
                            <i className="fas fa-lock me-3 fs-3 text-warning"></i>
                            <div>
                                <h5 className="fw-bold mb-1 text-dark">¡Inicia sesión para opinar!</h5>
                                <p className="mb-0 text-muted">Debes entrar a tu cuenta para poder dejar un comentario y puntuar este restaurante.</p>
                            </div>
                        </div>
                    )}

                    {/* Lista de Comentarios */}
                    <div className="d-flex flex-column gap-3">
                        {mockComments.map((c) => {
                            const cConf = getRankingConfig(c.score);
                            return (
                                <div key={c.id} className="card border-0 shadow-sm p-3 rounded-4 d-flex flex-row align-items-center gap-4 bg-white transition-hover">
                                    <div 
                                        className="rounded-circle d-flex justify-content-center align-items-center fw-bold text-white shadow-sm" 
                                        style={{ width: "60px", height: "60px", backgroundColor: cConf.color, fontSize: "1.2rem", flexShrink: 0 }}
                                    >
                                        {c.score}
                                    </div>
                                    <div>
                                        <h6 className="mb-1 fw-bold text-dark">{c.user}</h6>
                                        <p className="mb-0 text-secondary">{c.text}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};