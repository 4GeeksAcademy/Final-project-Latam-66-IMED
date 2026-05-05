import React from "react";

export const AdminUsersList = ({ usersList, viewUserComments, selectedUserComments, setSelectedUserComments }) => {
    return (
        <div className="animate__animated animate__fadeIn">
            <div className="table-responsive card bg-dark border-0 rounded-4 shadow overflow-hidden">
                <table className="table table-dark table-hover align-middle mb-0">
                    <thead style={{ backgroundColor: "#2c2c2c" }}>
                        <tr style={{ color: "#ff6b6b" }}>
                            <th className="py-3 px-4 fw-bold text-white">ID</th>
                            <th className="fw-bold text-white">Nombre / Usuario</th>
                            <th className="fw-bold text-white">Email</th>
                            <th className="fw-bold text-white">Rol</th>
                            <th className="text-center fw-bold text-white">Reseñas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersList.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-5 text-white fw-bold">No hay usuarios registrados.</td></tr>
                        ) : (
                            usersList.map(u => (
                                <tr key={u.id}>
                                    <td className="px-4 text-info fw-bold">#{u.id}</td>
                                    <td className="fw-bold text-white">
                                        <span className="text-primary" style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => viewUserComments(u)}>
                                            {u.full_name || "Sin nombre"}
                                        </span>
                                        <div className="text-white">@{u.username}</div>
                                    </td>
                                    <td className="text-white">{u.email}</td>
                                    <td><span className={`badge px-3 py-2 ${u.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>{u.role.toUpperCase()}</span></td>
                                    <td className="text-center"><span className="badge bg-primary fs-6 px-3 py-2">{u.review_count || 0}</span></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Comentarios */}
            {selectedUserComments && (
                <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1050 }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered">
                        <div className="modal-content bg-dark border-secondary text-white shadow-lg">
                            <div className="modal-header border-secondary">
                                <h4 className="modal-title fw-bold text-white">Reseñas de {selectedUserComments.name}</h4>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedUserComments(null)}></button>
                            </div>
                            <div className="modal-body p-4" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                                {selectedUserComments.list.length === 0 ? (
                                    <div className="text-center py-4"><h5 className="text-white-50">Este usuario aún no ha realizado reseñas.</h5></div>
                                ) : (
                                    selectedUserComments.list.map((c, i) => (
                                        <div key={i} className="mb-3 p-4 bg-secondary rounded-4 border border-light border-opacity-10 shadow-sm">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h5 className="text-white fw-bold mb-0"><i className="fas fa-utensils me-2 text-warning"></i>{c.restaurant_name}</h5>
                                                <span className="badge bg-warning text-dark fs-6 px-3 py-2 fw-bold"><i className="fas fa-star me-1"></i> {c.score}</span>
                                            </div>
                                            <p className="mb-0 text-light fs-5 fst-italic">"{c.text}"</p>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="modal-footer border-secondary">
                                <button className="btn btn-outline-light fw-bold px-4" onClick={() => setSelectedUserComments(null)}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};