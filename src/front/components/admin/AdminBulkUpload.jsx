import React from "react";

export const AdminBulkUpload = ({ 
    defaultBulkScore, setDefaultBulkScore, bulkText, setBulkText, 
    bulkPreview, handleBulkSubmit, isSubmittingBulk 
}) => {
    return (
        <div className="card bg-dark text-light border-secondary mb-4 p-4 shadow rounded-4 border-2" style={{ borderColor: "#D32F2F !important" }}>
            <h3 className="text-warning fw-bold mb-3"><i className="fas fa-bolt me-2"></i>Edición y Carga Masiva (Excel)</h3>
            <div className="alert alert-secondary text-dark border-0 mb-4 fw-semibold">
                <p className="mb-2"><b>Instrucciones:</b> Copia y pega desde tu Excel con este orden exacto de columnas:</p>
                <p className="mb-0 font-monospace text-danger bg-light p-2 rounded">
                    ID (Dejar vacío para crear) | Nombre | URL Imagen | Score | Tipo Comida | Origen | País | Ciudad | Descripción | Latitud | Longitud
                </p>
            </div>
            <div className="mb-3 d-flex align-items-center gap-3">
                <label className="fw-bold text-light text-nowrap">Score por Defecto:</label>
                <input type="number" className="form-control bg-secondary text-white fw-bold border-0" style={{ width: "100px" }} value={defaultBulkScore} onChange={(e) => setDefaultBulkScore(e.target.value)} />
            </div>
            <textarea className="form-control bg-secondary text-white fw-bold border-0 mb-3 font-monospace" rows="6" placeholder="Pega tus datos aquí..." value={bulkText} onChange={(e) => setBulkText(e.target.value)}></textarea>

            {bulkPreview.length > 0 && (
                <div className="mb-3">
                    <h5 className="text-success fw-bold mb-2">Previsualización ({bulkPreview.length} filas listas)</h5>
                    <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                        <table className="table table-sm table-dark table-striped">
                            <thead><tr><th>Acción</th><th>Nombre</th><th>Score</th><th>Tipo</th><th>País</th><th>Ciudad</th></tr></thead>
                            <tbody>
                                {bulkPreview.map((r, i) => (
                                    <tr key={i}>
                                        <td>{r.id ? <span className="badge bg-warning text-dark">📝 ID: {r.id}</span> : <span className="badge bg-success">✨ Nuevo</span>}</td>
                                        <td>{r.name}</td><td>{r.score}</td><td>{r.food_type}</td><td>{r.country}</td><td>{r.city}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button className="btn btn-success mt-3 fw-bold px-4" onClick={handleBulkSubmit} disabled={isSubmittingBulk}>
                        {isSubmittingBulk ? "Procesando en BD..." : `Procesar ${bulkPreview.length} Restaurantes`}
                    </button>
                </div>
            )}
        </div>
    );
};