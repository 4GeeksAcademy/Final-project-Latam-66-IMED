import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";

export const PublicProfile = () => {
    const { userId } = useParams(); // Obtenemos el ID de la URL
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPublicProfile = async () => {
            try {
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const response = await fetch(`${backendUrl}/api/user/${userId}`);

                if (response.ok) {
                    const data = await response.json();
                    setProfileData(data);
                } else {
                    toast.error("No se pudo encontrar a este usuario");
                }
            } catch (error) {
                console.error("Error", error);
                toast.error("Error de conexión");
            } finally {
                setLoading(false);
            }
        };

        fetchPublicProfile();
    }, [userId]);

    if (loading) return <div className="text-center mt-5 text-light fs-4">Cargando perfil... 🍳</div>;
    if (!profileData) return <div className="text-center mt-5 text-danger fs-4">Usuario no encontrado.</div>;

    const user = profileData?.user_info;

    if (!user) return <div className="text-center mt-5 text-danger fs-4">Cargando datos...</div>;

    return (
        <div className="container mt-5 text-light" style={{ minHeight: "80vh" }}>
            <div className="row">
                
                <div className="col-md-4 mb-4">
                    <div className="card bg-dark text-light border border-danger shadow-lg p-4 text-center">
                        <div className="mb-3">
                            {user.profile_picture ? (
                                <img src={user.profile_picture} alt="Perfil" className="rounded-circle border border-3 border-danger object-fit-cover" style={{ width: "150px", height: "150px" }} />
                            ) : (
                                <svg className="rounded-circle border border-3 border-danger text-light p-3" style={{ width: "150px", height: "150px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            )}
                        </div>
                        <h3 className="fw-bold mb-0 text-white">{user.full_name || "Usuario Anónimo"}</h3>
                        <p className="text-white-50 mb-2">{user.username ? `@${user.username}` : "@usuario"}</p>
                        <span className="badge bg-danger fs-6 mb-3 px-3 py-2">{profileData.level}</span>
                        <p className="small mb-1 text-light">📍 {user.city || "Ciudad"}, {user.country || "País"}</p>
                        <p className="fst-italic border-top border-bottom border-secondary py-2 text-light">{user.bio || "Sin biografía aún."}</p>
                    </div>
                </div>

                <div className="col-md-8">
                    <div className="mb-5">
                        <h4 className="text-danger border-bottom border-danger pb-2 fw-bold">Reseñas de {user.username || "este usuario"} ✍️</h4>
                        
                        {profileData.reviews && profileData.reviews.length > 0 ? (
                            <div className="list-group mt-3">
                                {profileData.reviews.map(review => (
                                    <div key={review.id} className="list-group-item bg-dark text-light border border-secondary mb-3 rounded-3 shadow-sm">
                                        <div className="d-flex w-100 justify-content-between align-items-center mb-2">
                                            <h5 className="mb-0 fw-bold">
                                                <span className="text-white">Restaurante: </span>
                                                <Link to={`/restaurant/${review.restaurant_id}`} className="text-danger text-decoration-none">
                                                    {review.restaurant_name}
                                                </Link>
                                            </h5>
                                            <span className="badge bg-warning text-dark fs-6 rounded-pill">
                                                {review.score} ⭐
                                            </span>
                                        </div>
                                        <p className="mb-0 text-white-50">"{review.text}"</p>
                                        
                                        {review.fotos && review.fotos.length > 0 && (
                                            <div className="d-flex gap-2 mt-3 flex-wrap">
                                                {review.fotos.map((urlFoto, indice) => (
                                                    <img key={indice} src={urlFoto} alt="Foto" className="rounded shadow-sm" style={{ width: "120px", height: "120px", objectFit: "cover" }} />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-3 text-muted">Este usuario aún no ha escrito reseñas.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};