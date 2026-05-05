import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import toast from "react-hot-toast";
import { RestaurantMap } from "../components/RestaurantMap";

export const Single = () => {
    // Obtenemos el ID de la URL (ej. /restaurant/1 -> id = 1)
    const { id } = useParams();
    const { store } = useGlobalReducer();

    // Estados locales para manejar la carga y los datos
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- NUEVOS ESTADOS PARA LOS COMENTARIOS ---
    const [comments, setComments] = useState([]); // Guarda los comentarios de la BD
    const [newScore, setNewScore] = useState(""); // Guarda el puntaje del input
    const [newText, setNewText] = useState(""); // Guarda el texto del input

    const [editingId, setEditingId] = useState(null); // Guarda el ID de la reseña que se está editando

    const [newPhotos, setNewPhotos] = useState([]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files); // Convierte la lista de archivos en un arreglo
        if (files.length > 3) {
            toast.error("Máximo puedes subir 3 fotos 📸");
            e.target.value = null; // Limpia el input visualmente
            setNewPhotos([]);
        } else {
            setNewPhotos(files);
        }
    };

    // Buscamos la info del restaurante al cargar la página
    useEffect(() => {
        const fetchData = async () => {
            try {
                // --- Traer el restaurante ---
                const resp = await fetch(import.meta.env.VITE_BACKEND_URL + `/api/restaurants/${id}`);

                if (resp.ok) {
                    const data = await resp.json();
                    setRestaurant(data);
                } else {
                    if (store.restaurants && store.restaurants.length > 0) {
                        const found = store.restaurants.find(r => r.id === parseInt(id));
                        setRestaurant(found || null);
                    }
                }

                // --- Traer los comentarios del restaurante ---
                const respComments = await fetch(import.meta.env.VITE_BACKEND_URL + `/api/restaurants/${id}/comments`);
                if (respComments.ok) {
                    const commentsData = await respComments.json();
                    setComments(commentsData);
                }

            } catch (error) {
                console.error("Error cargando datos:", error);
                // ALERTA SI FALLA LA CONEXIÓN AL ENTRAR AL RESTAURANTE
                toast.error("Error de conexión al cargar el restaurante 🔌");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, store.restaurants]);

    // Función para Crear o Editar el comentario
    const handleSendComment = async () => {
        if (!newScore || !newText) return toast.error("Por favor llena el puntaje y el comentario ✍️");

        // Validamos que el puntaje sea lógico
        if (newScore < 0 || newScore > 100) return toast.error("El puntaje debe ser entre 0 y 100 🎯");

        try {
            const token = sessionStorage.getItem("token");

            // Si hay editingId hacemos PUT, si no hacemos POST
            const method = editingId ? "PUT" : "POST";
            const url = editingId
                ? import.meta.env.VITE_BACKEND_URL + `/api/comments/${editingId}`
                : import.meta.env.VITE_BACKEND_URL + `/api/restaurants/${id}/comments`;

            // USAMOS FORMDATA EN LUGAR DE JSON
            const formData = new FormData();
            formData.append("score", parseInt(newScore));
            formData.append("text", newText);

            // Le ponemos un candado de seguridad: solo iterar si newPhotos no es nulo
            if (newPhotos) {
                newPhotos.forEach((photo) => {
                    formData.append("photo", photo);
                });
            }

            const resp = await fetch(url, {
                method: method,
                headers: {
                    "Authorization": `Bearer ${token}`
                    // ELIMINADO EL CONTENT-TYPE PARA QUE EL NAVEGADOR LO DETECTE COMO MULTIPART/FORM-DATA
                },
                body: formData
            });

            if (resp.ok) {
                const data = await resp.json();
                if (editingId) {
                    setComments(comments.map(c => c.id === editingId ? data.comment : c));
                    setEditingId(null);
                    // ALERTA DE ÉXITO AL EDITAR
                    toast.success("¡Reseña actualizada con éxito! ✏️");
                } else {
                    setComments([...comments, data.comment]);
                    // ALERTA DE ÉXITO AL CREAR
                    toast.success("¡Reseña publicada con éxito! ⭐");
                }
                setNewScore(""); setNewText(""); setNewPhotos(null);

                const respuestaRestaurante = await fetch(import.meta.env.VITE_BACKEND_URL + `/api/restaurants/${id}`);

                if (respuestaRestaurante.ok) {
                    const datosActualizados = await respuestaRestaurante.json();
                    setRestaurant(datosActualizados);
                }

            } else {
                toast.error("Error al enviar el comentario ❌");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error de conexión con el servidor 🔌");
        }
    };

    // Función para activar el modo edición
    const handleEditClick = (comment) => {
        setEditingId(comment.id);
        setNewScore(comment.score);
        setNewText(comment.text);
        toast("Modo edición activado", { icon: "📝" });
    };

    // Función para eliminar reseña
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta reseña?")) return;
        try {
            const token = sessionStorage.getItem("token");
            const resp = await fetch(import.meta.env.VITE_BACKEND_URL + `/api/comments/${commentId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (resp.ok) {
                setComments(comments.filter(c => c.id !== commentId));
                // ALERTA DE ÉXITO AL ELIMINAR
                toast.success("Reseña eliminada correctamente 🗑️");
            } else {
                toast.error("Error al intentar eliminar la reseña ❌");
            }
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error de conexión con el servidor 🔌");
        }
    };

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


    // MODIFICADO: Añadido sessionStorage.getItem por si el token no se carga a tiempo en el store global
    const isUserLoggedIn = store.token || store.user || sessionStorage.getItem("token");
    const currentUserId = sessionStorage.getItem("user_id"); // Para saber si es dueño del comentario

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
              src={
                restaurant.image_url ||
                "https://placehold.co/800x600?text=Sin+Imagen"
              }
              alt={restaurant.name}
              className="img-fluid rounded-4 shadow object-fit-cover w-100"
              style={{ height: "400px" }}
            />
          </div>

          {/* Derecha: Información */}
          <div className="col-12 col-md-6 ps-md-5">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h1 className="display-4 fw-bold mb-2 text-dark">
                  {restaurant.name}
                </h1>
                <div className="d-flex gap-3 text-secondary fs-5 mb-3">
                  <span>
                    <i className="fas fa-utensils me-2"></i>
                    {restaurant.food_type}
                  </span>
                  <span>
                    <i className="fas fa-map-marker-alt me-2"></i>
                    {restaurant.city || "Ubicación desconocida"}
                  </span>
                </div>
              </div>

              {/* Diseño Circular del Puntaje */}
              <div
                className="rounded-circle d-flex flex-column justify-content-center align-items-center shadow-sm flex-shrink-0"
                style={{
                  width: "110px",
                  height: "110px",
                  backgroundColor: config.color,
                  color: "white",
                  border: `5px solid ${config.shadow}`,
                }}
              >
                <span className="fw-bold lh-1" style={{ fontSize: "2.5rem" }}>
                  {restaurant.score}
                </span>
                <span
                  className="fw-semibold text-uppercase"
                  style={{ fontSize: "0.6rem", letterSpacing: "1px" }}
                >
                  {config.label}
                </span>
              </div>
            </div>

            <span
              className="badge rounded-pill mb-4 px-3 py-2 fs-6"
              style={{
                backgroundColor: config.shadow,
                color: config.color,
                border: `1px solid ${config.color}`,
              }}
            >
              Origen: {restaurant.cuisine_origin}
            </span>

            <h5 className="fw-bold mb-3">Acerca del restaurante</h5>
            <p
              className="lead text-secondary"
              style={{ lineHeight: "1.8", fontSize: "1.1rem" }}
            >
              {restaurant.description ||
                "Un lugar increíble con gran variedad gastronómica. Disfruta de la mejor calidad en cada plato."}
            </p>

            <div className="mt-5">
              <h5 className="fw-bold mb-3">
                <i
                  className="fas fa-map-marked-alt me-2"
                  style={{ color: "#D32F2F" }}
                ></i>
                Ubicación
              </h5>
              <RestaurantMap
                latitud={restaurant.latitud}
                longitud={restaurant.longitud}
              />
            </div>
          </div>
        </div>

        <hr className="my-5 text-muted opacity-25" />

        {/* --- SECCIÓN INFERIOR: COMENTARIOS --- */}
        <div className="row">
          <div className="col-12 col-lg-8 mx-auto">
            <h3 className="fw-bold mb-4">
              <i
                className="fas fa-comments me-2"
                style={{ color: "#D32F2F" }}
              ></i>{" "}
              Reseñas de la Comunidad
            </h3>

            {/* Verificación de Login para poder comentar */}
            {isUserLoggedIn ? (
              <div
                className="card shadow-sm p-4 mb-5 rounded-4 border-0 bg-white"
                style={{ borderLeft: "5px solid #D32F2F !important" }}
              >
                <h5 className="fw-bold mb-3">
                  {editingId ? "Editando tu reseña" : "Deja tu puntuación"}
                </h5>

                {/* --- CONTENEDOR PRINCIPAL DEL FORMULARIO ESTILO PROFESIONAL --- */}
                <div className="border p-3 rounded mb-2" style={{ backgroundColor: "#fcfcfc" }}>
                    
                    {/* Fila 1: Puntaje */}
                    <div className="mb-3" style={{ maxWidth: "150px" }}>
                        <input
                            type="text" 
                            inputMode="numeric" 
                            pattern="[0-9]*" 
                            className="form-control"
                            placeholder="Puntaje (0-100)"
                            value={newScore}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, "");
                              if (val === "") {
                                setNewScore("");
                                return;
                              }
                              let num = parseInt(val, 10);
                              if (num >= 0 && num <= 100) {
                                setNewScore(num.toString());
                              }
                            }}
                        />
                    </div>

                    {/* Fila 2: Área de texto ancha */}
                    <div className="mb-3">
                        <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Escribe tu comentario aquí..."
                            value={newText}
                            onChange={(e) => setNewText(e.target.value)}
                        ></textarea>
                    </div>

                    {/* Fila 3: Controles inferiores (Fotos y Botones) */}
                    <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
                        
                        {/* Lado Izquierdo: Input de fotos y Previsualización */}
                        <div className="d-flex align-items-center gap-3">
                            <div style={{ maxWidth: "250px" }}>
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                />
                            </div>
                            
                            {/* Previsualización en miniatura */}
                            {newPhotos && newPhotos.length > 0 && (
                                <div className="d-flex gap-2">
                                    {newPhotos.map((foto, index) => (
                                        <img
                                            key={index}
                                            src={URL.createObjectURL(foto)}
                                            alt={`Preview ${index + 1}`}
                                            style={{
                                                width: "45px",
                                                height: "45px",
                                                objectFit: "cover",
                                                borderRadius: "6px",
                                                boxShadow: "0px 2px 4px rgba(0,0,0,0.15)"
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Lado Derecho: Botones de Enviar y Cancelar */}
                        <div className="d-flex gap-2">
                            {editingId && (
                                <button
                                    onClick={() => {
                                        setEditingId(null);
                                        setNewScore("");
                                        setNewText("");
                                        setNewPhotos([]); 
                                    }}
                                    className="btn btn-secondary px-4 fw-bold rounded-3"
                                >
                                    Cancelar
                                </button>
                            )}
                            <button 
                                onClick={handleSendComment}
                                className="btn btn-primary px-4 fw-bold rounded-3"
                                style={{ backgroundColor: "#D32F2F", border: "none" }}
                            >
                                {editingId ? "Guardar" : "Enviar"}
                            </button>
                        </div>
                        
                    </div>
                </div>
              </div>
            ) : (
              <div
                className="alert alert-warning rounded-4 border-0 shadow-sm d-flex align-items-center p-4 mb-5"
                style={{ backgroundColor: "#fff3cd" }}
              >
                <i className="fas fa-lock me-3 fs-3 text-warning"></i>
                <div>
                  <h5 className="fw-bold mb-1 text-dark">
                    ¡Inicia sesión para opinar!
                  </h5>
                  <p className="mb-0 text-muted">
                    Debes entrar a tu cuenta para poder dejar un comentario y
                    puntuar este restaurante.
                  </p>
                </div>
              </div>
            )}

            {/* Lista de Comentarios */}
            <div className="d-flex flex-column gap-3">
              {/* MODIFICADO: Cambiamos mockComments por 'comments' (los reales de la BD) */}
              {comments.length === 0 ? (
                <p className="text-muted">
                  No hay reseñas aún. ¡Sé el primero!
                </p>
              ) : (
                comments.map((c) => {
                  const cConf = getRankingConfig(c.score);
                  return (
                    <div
                      key={c.id}
                      className="card border-0 shadow-sm p-3 rounded-4 d-flex flex-row align-items-center gap-4 bg-white transition-hover"
                    >
                      <div
                        className="rounded-circle d-flex justify-content-center align-items-center fw-bold text-white shadow-sm"
                        style={{
                          width: "60px",
                          height: "60px",
                          backgroundColor: cConf.color,
                          fontSize: "1.2rem",
                          flexShrink: 0,
                        }}
                      >
                        {c.score}
                      </div>

                      {/* NUEVO: Agregamos flex-grow-1 para empujar los botones a la derecha */}
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-bold text-dark">
                          {c.username || "Usuario"}
                        </h6>
                        <p className="mb-0 text-secondary">{c.text}</p>

                        {/* AQUÍ SE RENDERIZAN LAS IMÁGENES SI EXISTEN (AHORA SOPORTA VARIAS) */}
                        {c.photo_urls && c.photo_urls.length > 0 && (
                          <div className="d-flex gap-2 flex-wrap mt-2">
                            {c.photo_urls.map((url, index) => (
                              <img
                                key={index}
                                src={url}
                                alt={`Foto adjunta ${index + 1}`}
                                className="img-fluid rounded-3 shadow-sm"
                                style={{
                                  maxHeight: "150px",
                                  objectFit: "cover",
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* NUEVO: Botones de Editar y Eliminar (Solo visibles para el dueño) */}
                      {String(c.user_id) ===
                        String(sessionStorage.getItem("user_id")) && (
                        <div className="d-flex flex-column gap-2 ms-auto">
                          <button
                            onClick={() => handleEditClick(c)}
                            className="btn btn-sm btn-outline-primary border-0"
                            title="Editar"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteComment(c.id)}
                            className="btn btn-sm btn-outline-danger border-0"
                            title="Eliminar"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    );
};