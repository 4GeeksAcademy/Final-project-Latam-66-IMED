import React from "react";

export const AdminHeader = ({ 
    activeTab, setActiveTab, restaurantsCount, usersCount, filteredCount, 
    showBulk, handleBulkClick, showForm, editingId, handleCreateClick 
}) => {
    return (
        <div className="row align-items-center mb-4 bg-dark p-4 rounded-4 shadow">
            <div className="col-12 col-md-6 mb-3 mb-md-0">
                <h1 className="fw-bold mb-2 text-center text-md-start" style={{ color: "#D32F2F" }}>
                    Panel: {activeTab === "restaurants" ? "Restaurantes" : "Usuarios"}
                </h1>
                <div className="d-flex flex-column flex-sm-row gap-3">
                    <span className="badge fs-6 py-2 px-3 w-100 w-sm-auto" style={{ backgroundColor: "#4a4a4a", color: "#ffffff" }}>
                        {activeTab === "restaurants" ? `Total DB: ${restaurantsCount}` : `Usuarios Registrados: ${usersCount}`}
                    </span>
                    {activeTab === "restaurants" && (
                        <span className="badge fs-6 py-2 px-3 w-100 w-sm-auto" style={{ backgroundColor: "#D32F2F", color: "#ffffff" }}>
                            Visibles con Filtro: {filteredCount}
                        </span>
                    )}
                </div>
            </div>

            <div className="col-12 col-md-6 text-md-end d-flex gap-2 justify-content-md-end flex-wrap align-items-center">
                <div className="btn-group bg-secondary rounded-pill p-1 me-md-2 w-100 w-md-auto mb-2 mb-md-0">
                    <button className={`btn btn-sm rounded-pill px-4 fw-bold ${activeTab === "restaurants" ? "btn-light text-dark" : "text-white"}`} onClick={() => setActiveTab("restaurants")}>
                        Restaurantes
                    </button>
                    <button className={`btn btn-sm rounded-pill px-4 fw-bold ${activeTab === "users" ? "btn-light text-dark" : "text-white"}`} onClick={() => setActiveTab("users")}>
                        Usuarios
                    </button>
                </div>
                {activeTab === "restaurants" && (
                    <>
                        <button className="btn btn-outline-light fw-bold w-100 w-sm-auto mb-2 mb-sm-0" onClick={handleBulkClick}>
                            {showBulk ? "Ocultar Carga Masiva" : "📋 Carga / Edición Masiva"}
                        </button>
                        <button className="btn fw-bold text-white w-100 w-sm-auto" style={{ backgroundColor: "#D32F2F" }} onClick={handleCreateClick}>
                            {showForm && !editingId ? "Cerrar Formulario" : "+ Crear Individual"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};