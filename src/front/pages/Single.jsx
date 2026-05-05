import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import toast from "react-hot-toast";
import { RestaurantMap } from "../components/RestaurantMap";

export const Single = () => {
  const { id } = useParams();
  const { store } = useGlobalReducer();

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);

  // ==========================================
  // ESTADOS PARA CREAR UN COMENTARIO NUEVO
  // ==========================================
  const [newScore, setNewScore] = useState("");
  const [newText, setNewText] = useState("");
  const [newPhotos, setNewPhotos] = useState([]);

  // ==========================================
  // ESTADOS PARA EDITAR UN COMENTARIO EXISTENTE
  // ==========================================
  const [editingId, setEditingId] = useState(null);
  const [editScore, setEditScore] = useState("");
  const [editText, setEditText] = useState("");
  const [editPhotos, setEditPhotos] = useState([]); // Nuevas fotos a agregar en la edición
  const [keptPhotos, setKeptPhotos] = useState([]); // Fotos viejas que el usuario decide conservar

  // Maneja las fotos del comentario NUEVO
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      toast.error("Máximo puedes subir 3 fotos 📸");
      e.target.value = null;
      setNewPhotos([]);
    } else {
      setNewPhotos(files);
    }
  };

  // Maneja las fotos del comentario EN EDICIÓN
  const handleEditFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (keptPhotos.length + files.length > 3) {
      toast.error(`Límite excedido. Tienes ${keptPhotos.length} fotos guardadas, puedes agregar máximo ${3 - keptPhotos.length} más.`);
      e.target.value = null;
      setEditPhotos([]);
    } else {
      setEditPhotos(files);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch(import.meta.env.VITE_BACKEND_URL + `/api/restaurants/${id}`);
        if (resp.ok) {
          setRestaurant(await resp.json());
        } else if (store.restaurants?.length > 0) {
          setRestaurant(store.restaurants.find(r => r.id === parseInt(id)) || null);
        }

        const respComments = await fetch(import.meta.env.VITE_BACKEND_URL + `/api/restaurants/${id}/comments`);
        if (respComments.ok) {
          setComments(await respComments.json());
        }
      } catch (error) {
        toast.error("Error de conexión al cargar el restaurante 🔌");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, store.restaurants]);

  // CREAR COMENTARIO (POST)
  const handleSendComment = async () => {
    if (!newScore || !newText) return toast.error("Por favor llena el puntaje y el comentario ✍️");
    if (newScore < 0 || newScore > 100) return toast.error("El puntaje debe ser entre 0 y 100 🎯");

    try {
      const token = sessionStorage.getItem("token");
      const url = import.meta.env.VITE_BACKEND_URL + `/api/restaurants/${id}/comments`;

      const formData = new FormData();
      formData.append("score", parseInt(newScore));
      formData.append("text", newText);
      if (newPhotos) newPhotos.forEach(photo => formData.append("photo", photo));

      const resp = await fetch(url, { method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: formData });

      if (resp.ok) {
        const data = await resp.json();
        setComments([...comments, data.comment]);
        toast.success("¡Reseña publicada con éxito! ⭐");
        setNewScore(""); setNewText(""); setNewPhotos([]);

        const rResp = await fetch(import.meta.env.VITE_BACKEND_URL + `/api/restaurants/${id}`);
        if (rResp.ok) setRestaurant(await rResp.json());
      } else {
        toast.error("Error al enviar el comentario ❌");
      }
    } catch (error) {
      toast.error("Error de conexión 🔌");
    }
  };

  // ACTUALIZAR COMENTARIO (PUT)
  const handleUpdateComment = async (commentId) => {
    if (!editScore || !editText) return toast.error("Llena el puntaje y comentario ✍️");
    if (editScore < 0 || editScore > 100) return toast.error("Puntaje entre 0 y 100 🎯");

    try {
      const token = sessionStorage.getItem("token");
      const url = import.meta.env.VITE_BACKEND_URL + `/api/comments/${commentId}`;

      const formData = new FormData();
      formData.append("score", parseInt(editScore));
      formData.append("text", editText);

      // --- NUEVO: Bandera para que el backend sepa que estamos editando fotos ---
      formData.append("editing_photos", "true");

      // --- NUEVO: Agregamos [] al nombre para que Python lo lea como una lista perfecta ---
      keptPhotos.forEach(url => formData.append("kept_photos[]", url));

      // Enviamos las fotos nuevas
      if (editPhotos) editPhotos.forEach(photo => formData.append("photo", photo));

      const resp = await fetch(url, { method: "PUT", headers: { "Authorization": `Bearer ${token}` }, body: formData });

      if (resp.ok) {
        const data = await resp.json();
        setComments(comments.map(c => c.id === commentId ? data.comment : c));
        setEditingId(null);
        toast.success("¡Reseña actualizada! ✏️");

        const rResp = await fetch(import.meta.env.VITE_BACKEND_URL + `/api/restaurants/${id}`);
        if (rResp.ok) setRestaurant(await rResp.json());
      } else {
        toast.error("Error al actualizar ❌");
      }
    } catch (error) {
      toast.error("Error de conexión 🔌");
    }
  };

  // INICIAR EDICIÓN (Carga los datos actuales en el estado de edición)
  const handleEditClick = (comment) => {
    setEditingId(comment.id);
    setEditScore(comment.score.toString());
    setEditText(comment.text);
    setKeptPhotos(comment.photo_urls || []); // Guardamos las fotos actuales
    setEditPhotos([]); // Vaciamos las nuevas por si acaso
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta reseña?")) return;
    try {
      const token = sessionStorage.getItem("token");
      const resp = await fetch(import.meta.env.VITE_BACKEND_URL + `/api/comments/${commentId}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      if (resp.ok) {
        setComments(comments.filter(c => c.id !== commentId));
        toast.success("Reseña eliminada 🗑️");
      }
    } catch (error) {
      toast.error("Error de conexión 🔌");
    }
  };

  if (loading) return <div className="text-center py-5 mt-5"><h5><i className="fas fa-spinner fa-spin me-2"></i>Cargando...</h5></div>;
  if (!restaurant) return <div className="text-center py-5 mt-5"><h2 className="text-danger">No encontrado</h2><Link to="/" className="btn btn-primary">Volver</Link></div>;

  const getRankingConfig = (score) => {
    if (score >= 80) return { label: "Excelente", color: "#198754", shadow: "rgba(25, 135, 84, 0.2)" };
    if (score >= 60) return { label: "Bueno", color: "#0d6efd", shadow: "rgba(13, 110, 253, 0.2)" };
    if (score >= 40) return { label: "Regular", color: "#ffc107", shadow: "rgba(255, 193, 7, 0.2)" };
    return { label: "Malo", color: "#dc3545", shadow: "rgba(220, 53, 69, 0.2)" };
  };
  const config = getRankingConfig(restaurant.score);
  const isUserLoggedIn = store.token || store.user || sessionStorage.getItem("token");

  return (
    <div className="container py-5 mt-4">
      <div className="mb-4">
        <Link to="/" className="text-decoration-none text-secondary"><i className="fas fa-arrow-left me-2"></i> Volver a restaurantes</Link>
      </div>

      <div className="row mb-5 align-items-center">
        <div className="col-12 col-md-6 mb-4 mb-md-0">
          <img src={restaurant.image_url || "https://placehold.co/800x600?text=Sin+Imagen"} alt={restaurant.name} className="img-fluid rounded-4 shadow object-fit-cover w-100" style={{ height: "400px" }} />
        </div>
        <div className="col-12 col-md-6 ps-md-5">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h1 className="display-4 fw-bold mb-2 text-dark">{restaurant.name}</h1>
              <div className="d-flex gap-3 text-secondary fs-5 mb-3">
                <span><i className="fas fa-utensils me-2"></i>{restaurant.food_type}</span>
                <span><i className="fas fa-map-marker-alt me-2"></i>{restaurant.city || "Ubicación desconocida"}</span>
              </div>
            </div>
            <div className="rounded-circle d-flex flex-column justify-content-center align-items-center shadow-sm flex-shrink-0" style={{ width: "110px", height: "110px", backgroundColor: config.color, color: "white", border: `5px solid ${config.shadow}` }}>
              <span className="fw-bold lh-1" style={{ fontSize: "2.5rem" }}>{restaurant.score}</span>
              <span className="fw-semibold text-uppercase" style={{ fontSize: "0.6rem", letterSpacing: "1px" }}>{config.label}</span>
            </div>
          </div>
          <span className="badge rounded-pill mb-4 px-3 py-2 fs-6" style={{ backgroundColor: config.shadow, color: config.color, border: `1px solid ${config.color}` }}>Origen: {restaurant.cuisine_origin}</span>
          <h5 className="fw-bold mb-3">Acerca del restaurante</h5>
          <p className="lead text-secondary" style={{ lineHeight: "1.8", fontSize: "1.1rem" }}>{restaurant.description}</p>
          <div className="mt-5">
            <h5 className="fw-bold mb-3"><i className="fas fa-map-marked-alt me-2" style={{ color: "#D32F2F" }}></i> Ubicación</h5>
            <RestaurantMap latitud={restaurant.latitud} longitud={restaurant.longitud} />
          </div>
        </div>
      </div>

      <hr className="my-5 text-muted opacity-25" />

      <div className="row">
        <div className="col-12 col-lg-8 mx-auto">
          <h3 className="fw-bold mb-4"><i className="fas fa-comments me-2" style={{ color: "#D32F2F" }}></i> Reseñas de la Comunidad</h3>

          {/* FORMULARIO PRINCIPAL SIEMPRE VISIBLE PARA CREAR */}
          {isUserLoggedIn ? (
            <div className="card shadow-sm p-4 mb-5 rounded-4 border-0 bg-white" style={{ borderLeft: "5px solid #D32F2F !important" }}>
              <h5 className="fw-bold mb-3">Deja tu puntuación</h5>
              <div className="border p-3 rounded mb-2" style={{ backgroundColor: "#fcfcfc" }}>
                <div className="mb-3" style={{ maxWidth: "150px" }}>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" className="form-control" placeholder="Puntaje (0-100)" value={newScore} onChange={(e) => { let val = e.target.value.replace(/\D/g, ""); if (val === "") { setNewScore(""); return; } let num = parseInt(val, 10); if (num >= 0 && num <= 100) { setNewScore(num.toString()); } }} />
                </div>
                <div className="mb-3">
                  <textarea className="form-control" rows="3" placeholder="Escribe tu comentario aquí..." value={newText} onChange={(e) => setNewText(e.target.value)}></textarea>
                </div>
                <div className="d-flex justify-content-between align-items-end flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ maxWidth: "250px" }}>
                      <input type="file" className="form-control" accept="image/*" multiple onChange={handleFileChange} />
                    </div>
                    {newPhotos && newPhotos.length > 0 && (
                      <div className="d-flex gap-2">
                        {newPhotos.map((foto, index) => (
                          <img key={index} src={URL.createObjectURL(foto)} alt="preview" style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "6px" }} />
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={handleSendComment} className="btn btn-primary px-4 fw-bold rounded-3" style={{ backgroundColor: "#D32F2F", border: "none" }}>Enviar</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning rounded-4 border-0 p-4 mb-5"><i className="fas fa-lock me-3"></i> ¡Inicia sesión para opinar!</div>
          )}

          {/* LISTA DE COMENTARIOS */}
          <div className="d-flex flex-column gap-3">
            {comments.length === 0 ? (
              <p className="text-muted">No hay reseñas aún.</p>
            ) : (
              comments.map((c) => {
                const cConf = getRankingConfig(c.score);

                return (
                  <div key={c.id} className="card border-0 shadow-sm p-3 rounded-4 d-flex flex-row align-items-start gap-4 bg-white transition-hover" style={{ border: editingId === c.id ? "1px solid #0d6efd" : "" }}>

                    {/* BOLA DE SCORE (Se vuelve un input numérico si estamos editando) */}
                    {editingId === c.id ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        className="form-control text-center rounded-circle fw-bold shadow-sm"
                        style={{ width: "60px", height: "60px", fontSize: "1.2rem", padding: "0", flexShrink: 0, border: "3px solid #0d6efd", color: "#0d6efd" }}
                        value={editScore}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val === "") return setEditScore("");
                          let num = parseInt(val, 10);
                          if (num >= 0 && num <= 100) setEditScore(num.toString());
                        }}
                      />
                    ) : (
                      <div className="rounded-circle d-flex justify-content-center align-items-center fw-bold text-white shadow-sm" style={{ width: "60px", height: "60px", backgroundColor: cConf.color, fontSize: "1.2rem", flexShrink: 0 }}>
                        {c.score}
                      </div>
                    )}

                    {/* CUERPO DEL COMENTARIO */}
                    <div className="flex-grow-1">
                      <h6 className="mb-2 fw-bold text-dark">
                        {c.username || "Usuario"}
                        {editingId === c.id && <span className="text-primary ms-2 fs-6 fw-normal"><i className="fas fa-pen me-1"></i>Editando</span>}
                      </h6>

                      {editingId === c.id ? (
                        /* VISTA DE EDICIÓN MÁGICA INLINE */
                        <div className="mt-2">
                          <textarea className="form-control mb-3" rows="3" value={editText} onChange={(e) => setEditText(e.target.value)}></textarea>

                          {/* GESTOR DE FOTOS DEL COMENTARIO */}
                          <div className="mb-3 p-3 rounded bg-light border">
                            <label className="fw-bold fs-6 text-secondary mb-3"><i className="fas fa-images me-2"></i>Tus imágenes (Máximo 3):</label>

                            <div className="d-flex flex-wrap gap-3 mb-3">
                              {/* 1. Las que ya tenías guardadas */}
                              {keptPhotos.map((url, i) => (
                                <div key={`kept-${i}`} className="position-relative">
                                  <img src={url} alt="guardada" className="rounded-3 shadow-sm border" style={{ width: "80px", height: "80px", objectFit: "cover" }} />
                                  <button
                                    onClick={() => setKeptPhotos(keptPhotos.filter(u => u !== url))}
                                    className="btn btn-danger position-absolute top-0 end-0 m-1 rounded-circle d-flex justify-content-center align-items-center shadow"
                                    style={{ width: "24px", height: "24px", padding: 0 }}
                                    title="Eliminar esta foto"
                                  >
                                    <i className="fas fa-times" style={{ fontSize: "12px" }}></i>
                                  </button>
                                </div>
                              ))}

                              {/* 2. Las nuevas que agregues ahorita */}
                              {editPhotos.map((f, i) => (
                                <div key={`new-${i}`} className="position-relative">
                                  <img src={URL.createObjectURL(f)} alt="nueva" className="rounded-3 shadow-sm" style={{ width: "80px", height: "80px", objectFit: "cover", border: "2px dashed #0d6efd" }} />
                                </div>
                              ))}
                            </div>

                            {/* Botón para subir más si queda espacio */}
                            {(keptPhotos.length + editPhotos.length) < 3 && (
                              <input type="file" className="form-control form-control-sm" accept="image/*" multiple onChange={handleEditFileChange} />
                            )}
                          </div>

                          <div className="d-flex gap-2 justify-content-end">
                            <button onClick={() => setEditingId(null)} className="btn btn-secondary fw-bold px-3">Cancelar</button>
                            <button onClick={() => handleUpdateComment(c.id)} className="btn btn-primary fw-bold px-3">Guardar Cambios</button>
                          </div>
                        </div>
                      ) : (
                        /* VISTA NORMAL */
                        <>
                          <p className="mb-0 text-secondary">{c.text}</p>
                          {c.photo_urls && c.photo_urls.length > 0 && (
                            <div className="d-flex gap-2 flex-wrap mt-3">
                              {c.photo_urls.map((url, index) => (
                                <img key={index} src={url} alt="adjunto" className="img-fluid rounded-3 shadow-sm border" style={{ maxHeight: "120px", objectFit: "cover" }} />
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* BOTONES DE LÁPIZ Y BASURA */}
                    {String(c.user_id) === String(sessionStorage.getItem("user_id")) && editingId !== c.id && (
                      <div className="d-flex flex-column gap-2 ms-auto">
                        <button onClick={() => handleEditClick(c)} className="btn btn-sm btn-outline-primary border-0 shadow-sm" title="Editar"><i className="fas fa-edit"></i></button>
                        <button onClick={() => handleDeleteComment(c.id)} className="btn btn-sm btn-outline-danger border-0 shadow-sm" title="Eliminar"><i className="fas fa-trash"></i></button>
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