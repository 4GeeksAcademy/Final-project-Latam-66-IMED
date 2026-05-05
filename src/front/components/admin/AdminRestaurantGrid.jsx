import React from "react";

export const AdminRestaurantGrid = ({ 
    restaurantsList, filtered, setFilterName, setFilterType, setFilterCountry, setFilterCity,
    isAllSelected, handleSelectAll, selectedIds, handleBulkDelete, isDeletingBulk,
    handleSelectOne, handleEditClick, handleDelete
}) => {
    return (
        <>
            {/* Filtros */}
            <div className="row g-3 mb-4 bg-dark p-4 rounded-4 shadow-sm">
                <div className="col-12"><h4 className="text-light fw-bold mb-0"><i className="fas fa-search me-2 text-primary"></i>Filtros</h4></div>
                <div className="col-12 col-md-3"><input type="text" className="form-control fw-bold border-0" placeholder="Buscar nombre..." onChange={(e) => setFilterName(e.target.value)} /></div>
                <div className="col-12 col-md-3">
                    <select className="form-select fw-bold border-0" onChange={(e) => setFilterType(e.target.value)}>
                        <option value="">Todos los Tipos</option>
                        {[...new Set(restaurantsList.map(r => r.food_type))].filter(Boolean).map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </select>
                </div>
                <div className="col-12 col-md-3">
                    <select className="form-select fw-bold border-0" onChange={(e) => setFilterCountry(e.target.value)}>
                        <option value="">Todos los Países</option>
                        {[...new Set(restaurantsList.map(r => r.country))].filter(Boolean).map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                </div>
                <div className="col-12 col-md-3">
                    <select className="form-select fw-bold border-0" onChange={(e) => setFilterCity(e.target.value)}>
                        <option value="">Todas las Ciudades</option>
                        {[...new Set(restaurantsList.map(r => r.city))].filter(Boolean).map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Barra de Selección Masiva */}
            <div className="d-flex justify-content-between align-items-center bg-secondary p-3 rounded-4 mb-3 shadow-sm">
                <div className="form-check text-light mb-0 d-flex align-items-center">
                    <input type="checkbox" className="form-check-input mt-0 me-2 border-white" id="selectAllCards" checked={isAllSelected} onChange={handleSelectAll} style={{ transform: "scale(1.3)", cursor: "pointer" }} />
                    <label className="form-check-label fw-bold" htmlFor="selectAllCards" style={{ cursor: "pointer", fontSize: "0.95rem" }}>Seleccionar Todos ({filtered.length})</label>
                </div>
                {selectedIds.length > 0 && (
                    <button className="btn btn-danger btn-sm fw-bold shadow-sm px-3 rounded-pill animate__animated animate__pulse" onClick={handleBulkDelete} disabled={isDeletingBulk}>
                        {isDeletingBulk ? "Borrando..." : <><i className="fas fa-trash-alt me-1"></i> Borrar {selectedIds.length}</>}
                    </button>
                )}
            </div>

            {/* Grilla de Micro-Cards */}
            {filtered.length === 0 ? (
                <div className="text-center py-5 text-white fw-bold">No hay resultados disponibles.</div>
            ) : (
                <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3">
                    {filtered.map(r => (
                        <div key={r.id} className="col">
                            <div className={`card h-100 bg-dark text-white border-secondary shadow-sm rounded-3 ${selectedIds.includes(r.id) ? "border-danger bg-danger bg-opacity-10" : ""}`} style={{ fontSize: "0.85rem" }}>
                                <div className="position-relative">
                                    <div className="position-absolute top-0 start-0 p-2 z-1">
                                        <input type="checkbox" id={`check-${r.id}`} className="form-check-input bg-dark border-white" style={{ transform: "scale(1.2)", cursor: "pointer" }} checked={selectedIds.includes(r.id)} onChange={() => handleSelectOne(r.id)} />
                                    </div>
                                    <div className="position-absolute top-0 end-0 p-1 z-1"><span className="badge bg-dark border border-secondary text-info opacity-75" style={{fontSize: "0.65rem"}}>#{r.id}</span></div>
                                    <img src={r.image_url || "https://via.placeholder.com/400x200?text=Sin+Imagen"} className="card-img-top rounded-top-3" alt={r.name} style={{ height: "120px", objectFit: "cover" }} />
                                </div>
                                <div className="card-body p-2 d-flex flex-column">
                                    <h6 className="card-title fw-bold mb-1 text-truncate" title={r.name}>{r.name}</h6>
                                    <div className="mb-2 text-truncate" style={{fontSize: "0.75rem"}}><i className="fas fa-globe-americas text-primary me-1"></i><span className="text-white-50">{r.city}, {r.country}</span></div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="badge bg-primary text-truncate" style={{fontSize: "0.7rem", maxWidth: "65%"}} title={r.food_type}>{r.food_type}</span>
                                        <span className="text-warning fw-bold" style={{fontSize: "0.8rem"}}><i className="fas fa-star me-1"></i>{r.score}</span>
                                    </div>
                                    <div className="mt-auto d-flex gap-1">
                                        <button className="btn btn-light btn-sm text-dark fw-bold rounded-pill flex-grow-1" style={{fontSize: "0.7rem", padding: "0.2rem"}} onClick={() => handleEditClick(r)}><i className="fas fa-edit"></i></button>
                                        <button className="btn btn-outline-danger btn-sm fw-bold rounded-pill flex-grow-1" style={{fontSize: "0.7rem", padding: "0.2rem"}} onClick={() => handleDelete(r.id)}><i className="fas fa-trash"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};