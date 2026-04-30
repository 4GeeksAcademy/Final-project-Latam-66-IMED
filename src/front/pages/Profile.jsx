import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fileInputRef = useRef(null);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        email: "",
        fullName: "",
        username: "",
        country: "",
        city: "",
        age: "",
        bio: "",
        photoPreview: null
    });

    const registrationDate = "15 de marzo de 2023";

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const response = await fetch(`${backendUrl}/api/profile`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setProfileData(data);

                    setFormData({
                        email: data.user_info.email || "",
                        fullName: data.user_info.full_name || "",
                        username: data.user_info.username || "",
                        country: data.user_info.country || "",
                        city: data.user_info.city || "",
                        age: data.user_info.age || "",
                        bio: data.user_info.bio || "",
                        photoPreview: data.user_info.profile_picture || null
                    });
                } else {
                    sessionStorage.removeItem("token");
                    navigate("/login");
                    // ALERTA SI LA SESIÓN EXPIRÓ
                    toast.error("Tu sesión ha expirado, vuelve a iniciar sesión 🔒");
                }
            } catch (error) {
                console.error("Error de conexión", error);
                // ALERTA DE ERROR DE RED
                toast.error("Error al cargar tu perfil 🔌");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, photoPreview: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async () => {
        const token = sessionStorage.getItem("token");

        // Opcional: mostrar un toast de "Guardando..."
        const loadingToast = toast.loading("Guardando cambios... ⏳");

        try {
            const bodyData = {
                email: formData.email,
                full_name: formData.fullName.trim() || null,
                username: formData.username ? formData.username.replace("@", "").trim() : null,
                country: formData.country.trim() || null,
                city: formData.city.trim() || null,
                age: formData.age !== "" ? parseInt(formData.age) : null,
                bio: formData.bio.trim() || null,
                profile_picture: formData.photoPreview
            };

            const backendUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${backendUrl}/api/profile`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(bodyData)
            });

            const data = await response.json();
            // Quitamos el toast de "Cargando..."
            toast.dismiss(loadingToast);

            if (response.ok) {
                // Actualizamos profileData para la vista de lectura (Modo No-Edición)
                setProfileData((prev) => ({ ...prev, user_info: data.user_info }));

                // IMPORTANTE: Forzamos la actualización del formulario con los nombres correctos
                // Usamos lo que nos devolvió el servidor para asegurar sincronía total
                setFormData({
                    email: data.user_info.email || "",
                    fullName: data.user_info.full_name || "",
                    username: data.user_info.username || "",
                    country: data.user_info.country || "",
                    city: data.user_info.city || "",
                    age: data.user_info.age || "",
                    bio: data.user_info.bio || "",
                    photoPreview: data.user_info.profile_picture || null
                });

                // 3. Salimos del modo edición
                setIsEditing(false);

                // 4. Pequeña pausa antes del alert para que React procese los cambios visuales
                setTimeout(() => {
                    toast.success("¡Perfil actualizado con éxito! ✨");
                }, 100);

            } else {
                toast.error(data.msg || "Error al actualizar el perfil ❌");
            }
        } catch (error) {
            console.error("Error al actualizar", error);
            toast.dismiss(loadingToast);
            toast.error("Error de conexión con el servidor 🔌");
        }
    };

    if (loading) return <div className="text-center mt-5 text-light fs-4">Cargando tu cocina... 🍳</div>;
    if (!profileData) return <div className="text-center mt-5 text-danger fs-4">No se pudo cargar el perfil.</div>;

    return (
        <div className="container mt-5 text-light" style={{ minHeight: "80vh" }}>
            <div className="row">

                {/* PANEL IZQUIERDO: Identidad del Usuario */}
                <div className="col-md-4 mb-4">
                    <div className="card bg-dark text-light border border-danger shadow-lg p-4 text-center">

                        <div className="position-relative d-inline-block mb-3">
                            {formData.photoPreview ? (
                                <img src={formData.photoPreview} alt="Perfil" className="rounded-circle border border-3 border-danger object-fit-cover" style={{ width: "150px", height: "150px" }} />
                            ) : (
                                <svg className="rounded-circle border border-3 border-danger text-light p-3" style={{ width: "150px", height: "150px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            )}

                            {isEditing && (
                                <button
                                    className="btn btn-danger rounded-circle position-absolute bottom-0 end-0"
                                    onClick={() => fileInputRef.current.click()}
                                    title="Cambiar Foto"
                                >
                                    📷
                                </button>
                            )}
                            <input type="file" ref={fileInputRef} className="d-none" accept="image/*" onChange={handleImageChange} />
                        </div>

                        {!isEditing ? (
                            <>
                                <h3 className="fw-bold mb-0 text-white">{formData.fullName || "Usuario Anónimo"}</h3>
                                <p className="text-white-50 mb-2">{formData.username ? `@${formData.username}` : "@usuario"}</p>
                                <span className="badge bg-danger fs-6 mb-3 px-3 py-2">{profileData.level}</span>

                                <p className="small mb-1 text-light">📍 {formData.city || "Ciudad"}, {formData.country || "País"}</p>
                                <p className="small mb-3 text-light">🎂 {formData.age ? `${formData.age} años` : "-- años"}</p>
                                <p className="fst-italic border-top border-bottom border-secondary py-2 text-light">{formData.bio || "Sin biografía aún."}</p>

                                <p className="text-white-50 small mt-3">Miembro desde: {registrationDate}</p>

                                <button className="btn btn-outline-light rounded-pill mt-2 w-100" onClick={() => setIsEditing(true)}>
                                    Editar Perfil
                                </button>
                            </>
                        ) : (
                            <div className="text-start mt-3">
                                <label className="form-label small text-danger mb-0">Nombre Completo</label>
                                <input type="text" name="fullName" className="form-control bg-dark text-light border-secondary mb-2" value={formData.fullName} onChange={handleInputChange} />

                                <label className="form-label small text-danger mb-0">Nombre de Usuario</label>
                                <input type="text" name="username" className="form-control bg-dark text-light border-secondary mb-2" placeholder="ej: alejandro_foodie" value={formData.username} onChange={handleInputChange} />

                                <div className="row">
                                    <div className="col-6">
                                        <label className="form-label small text-danger mb-0">País</label>
                                        <input type="text" name="country" className="form-control bg-dark text-light border-secondary mb-2" value={formData.country} onChange={handleInputChange} />
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small text-danger mb-0">Ciudad</label>
                                        <input type="text" name="city" className="form-control bg-dark text-light border-secondary mb-2" value={formData.city} onChange={handleInputChange} />
                                    </div>
                                </div>

                                <label className="form-label small text-danger mb-0">Edad</label>
                                <input type="number" name="age" className="form-control bg-dark text-light border-secondary mb-2" value={formData.age} onChange={handleInputChange} />

                                <label className="form-label small text-danger mb-0">Biografía</label>
                                <textarea name="bio" className="form-control bg-dark text-light border-secondary mb-3" rows="3" value={formData.bio} onChange={handleInputChange}></textarea>

                                <div className="d-grid gap-2">
                                    <button className="btn btn-danger rounded-pill" onClick={handleUpdateProfile}>Guardar Cambios</button>
                                    <button className="btn btn-outline-secondary rounded-pill" onClick={() => {
                                        setIsEditing(false);
                                        // Resetear al estado guardado si cancela
                                        setFormData(prev => ({
                                            ...prev,
                                            fullName: profileData.user_info.full_name || "",
                                            username: profileData.user_info.username || "",
                                            bio: profileData.user_info.bio || ""
                                        }));
                                    }}>Cancelar</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* PANEL DERECHO: Actividad */}
                <div className="col-md-8">
                    <div className="mb-4">
                        <h4 className="text-danger border-bottom border-danger pb-2 fw-bold">Mis Insignias 🏆</h4>
                        {profileData.badges.length > 0 ? (
                            <div className="d-flex flex-wrap gap-2 mt-3">
                                {profileData.badges.map((badge, index) => (
                                    <span key={index} className="badge bg-warning text-dark fs-6 rounded-pill px-3 py-2 shadow-sm">
                                        {badge}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted">Aún no tienes insignias. ¡Haz tu primera reseña!</p>
                        )}
                    </div>

                    <div className="mb-5">
                        <div className="d-flex justify-content-between align-items-center border-bottom border-danger pb-2">
                            <h4 className="text-danger fw-bold mb-0">Mis Reseñas ✍️</h4>
                            <Link to="/" className="btn btn-sm btn-danger rounded-pill px-3">Hacer Reseña</Link>
                        </div>
                        {profileData.reviews && profileData.reviews.length > 0 ? (
                            <div className="list-group mt-3">
                                {profileData.reviews.map(review => (
                                    <div key={review.id} className="list-group-item bg-dark text-light border border-secondary mb-3 rounded-3 shadow-sm">
                                        <div className="d-flex w-100 justify-content-between align-items-center mb-2">

                                            <h5 className="mb-0 fw-bold">
                                                <span className="text-white">Restaurante: </span>
                                                <span className="text-danger">
                                                    {review.restaurant_name.replace(/Restaurante/i, '').trim()}
                                                </span>
                                            </h5>

                                            <span className="badge bg-warning text-dark fs-6 rounded-pill">
                                                {review.score} ⭐
                                            </span>
                                        </div>
                                        <p className="mb-0 text-white-50">"{review.text}"</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-3 text-muted">Aún no has escrito reseñas.</p>
                        )}
                    </div>


                </div>
            </div>
        </div>
    );
};