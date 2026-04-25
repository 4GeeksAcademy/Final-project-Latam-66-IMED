import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const AdminDashboard = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate(); 

    const initialFormState = {
        name: "", image_url: "", score: 0, food_type: "", cuisine_origin: "", 
        country: "", city: "", description: "" 
    };

    const [formData, setFormData] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    
    // Estados para Filtros del Dashboard
    const [filterName, setFilterName] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterCity, setFilterCity] = useState("");
    const [filterCountry, setFilterCountry] = useState("");

    // Estados para Carga y Modificación Masiva (Excel/Sheets)
    const [showBulk, setShowBulk] = useState(false);
    const [bulkText, setBulkText] = useState("");
    const [bulkPreview, setBulkPreview] = useState([]);
    const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
    const [defaultBulkScore, setDefaultBulkScore] = useState(0);

    // Estados para la Eliminación Masiva (Checkboxes) 
    const [selectedIds, setSelectedIds] = useState([]); 
    const [isDeletingBulk, setIsDeletingBulk] = useState(false);

    // PROTECCIÓN Y CARGA DE DATOS
    useEffect(() => {
        const role = sessionStorage.getItem("role");
        const token = sessionStorage.getItem("token");

        if (!token || role !== "admin") {
            navigate("/");
            return; 
        }

        if (!store.restaurants || store.restaurants.length === 0) {
            fetchAdminRestaurants();
        }
    }, []); 

    const fetchAdminRestaurants = async () => {
        try {
            const resp = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/restaurants");
            if (resp.ok) {
                const data = await resp.json();
                dispatch({ type: "set_restaurants", payload: data });
            }
        } catch (error) {
            console.error("Error cargando restaurantes:", error);
        }
    };

    // LÓGICA DE FILTROS AVANZADA
    const restaurantsList = store.restaurants || [];
    const filtered = restaurantsList.filter(r =>
        (r.name || "").toLowerCase().includes(filterName.toLowerCase()) &&
        (r.food_type || "").toLowerCase().includes(filterType.toLowerCase()) &&
        (r.city || "").toLowerCase().includes(filterCity.toLowerCase()) &&
        (r.country || "").toLowerCase().includes(filterCountry.toLowerCase())
    );

    // ====================================================================
    // 🌟 CONTROLADORES DE LOS BOTONES SUPERIORES (Corrección de choques)
    // ====================================================================
    const handleCreateClick = () => {
        // Si el formulario ya está abierto y NO estamos editando, significa que estábamos creando. Lo cerramos.
        if (showForm && !editingId) {
            setShowForm(false);
        } else {
            // Cerramos el panel masivo si estaba abierto, limpiamos el form y abrimos creación
            setShowBulk(false);
            setFormData(initialFormState);
            setEditingId(null);
            setShowForm(true);
        }
    };

    const handleBulkClick = () => {
        // Si el masivo está abierto, lo cerramos
        if (showBulk) {
            setShowBulk(false);
        } else {
            // Si estaba cerrado, nos aseguramos de cerrar el form individual y abrimos masivo
            setShowForm(false);
            setShowBulk(true);
        }
    };

    // MANEJO DE FORMULARIO INDIVIDUAL
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = sessionStorage.getItem("token");
        const url = editingId 
            ? `${import.meta.env.VITE_BACKEND_URL}/api/restaurants/${editingId}`
            : `${import.meta.env.VITE_BACKEND_URL}/api/restaurants`;
        const method = editingId ? "PUT" : "POST";

        try {
            const resp = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(formData)
            });

            if (resp.ok) {
                const data = await resp.json();
                if (editingId) {
                    dispatch({ type: "update_restaurant", payload: data.restaurant });
                    alert("Restaurante actualizado");
                } else {
                    dispatch({ type: "add_restaurant", payload: data.restaurant });
                    alert("Restaurante creado");
                }
                setFormData(initialFormState);
                setEditingId(null);
                setShowForm(false);
            } else {
                const errorData = await resp.json();
                alert(`Error: ${errorData.msg || "No se pudo guardar"}`);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    // LÓGICA DE CARGA MASIVA (Excel)
    useEffect(() => {
        if (!bulkText.trim()) {
            setBulkPreview([]);
            return;
        }
        const rows = bulkText.split('\n');
        const parsedData = rows.map(row => {
            const cols = row.split('\t');
            const rowId = cols[0]?.trim();
            const rowScore = cols[3]?.trim();
            return {
                id: rowId !== "" ? rowId : null, 
                name: cols[1]?.trim() || "",
                image_url: cols[2]?.trim() || "",
                score: rowScore !== "" && rowScore !== undefined ? parseInt(rowScore) : parseInt(defaultBulkScore),
                food_type: cols[4]?.trim() || "",
                cuisine_origin: cols[5]?.trim() || "",
                country: cols[6]?.trim() || "",
                city: cols[7]?.trim() || "",
                description: cols[8]?.trim() || ""
            };
        }).filter(r => r.name !== ""); 
        setBulkPreview(parsedData);
    }, [bulkText, defaultBulkScore]); 

    const handleBulkSubmit = async () => {
        if (bulkPreview.length === 0) return;
        setIsSubmittingBulk(true);
        const token = sessionStorage.getItem("token");

        try {
            const promises = bulkPreview.map(rest => {
                const isUpdate = rest.id !== null;
                const url = isUpdate 
                    ? `${import.meta.env.VITE_BACKEND_URL}/api/restaurants/${rest.id}` 
                    : `${import.meta.env.VITE_BACKEND_URL}/api/restaurants`;
                const method = isUpdate ? "PUT" : "POST";
                const { id, ...bodyData } = rest;

                return fetch(url, {
                    method: method,
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(bodyData)
                });
            });

            const responses = await Promise.all(promises);
            const failedResponses = responses.filter(resp => !resp.ok);

            if (failedResponses.length > 0) {
                const errorCode = failedResponses[0].status;
                if (errorCode === 401) alert("Error 401: Sesión expirada.");
                else alert(`Error (${errorCode}). Revisar consola.`);
            } else {
                alert(`¡Éxito! Se han procesado ${bulkPreview.length} restaurantes.`);
                setBulkText("");
                setShowBulk(false);
                fetchAdminRestaurants(); 
            }
        } catch (error) {
            console.error("Error masivo:", error);
            alert("Error de red.");
        } finally {
            setIsSubmittingBulk(false);
        }
    };


    // LÓGICA DE LOS CHECKBOXES Y ELIMINACIÓN MASIVA
    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allVisibleIds = filtered.map(r => r.id);
            setSelectedIds(allVisibleIds);
        } else {
            setSelectedIds([]);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return; 
        if (!window.confirm(`¿Estás seguro de eliminar ${selectedIds.length} restaurantes de forma permanente?`)) return;

        setIsDeletingBulk(true);
        const token = sessionStorage.getItem("token");

        try {
            const deletePromises = selectedIds.map(id => 
                fetch(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/${id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                })
            );

            const responses = await Promise.all(deletePromises);
            const failedResponses = responses.filter(resp => !resp.ok);

            if (failedResponses.length > 0) {
                alert(`Error. No se pudieron eliminar ${failedResponses.length} restaurantes.`);
            } else {
                alert(`¡Éxito! Limpiaste ${selectedIds.length} restaurantes.`);
                setSelectedIds([]);
                fetchAdminRestaurants();
            }
        } catch (error) {
            console.error("Error en eliminación masiva:", error);
            alert("Ocurrió un error de conexión.");
        } finally {
            setIsDeletingBulk(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Seguro que quieres eliminar este restaurante permanentemente?")) {
            const token = sessionStorage.getItem("token");
            try {
                const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/${id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                if (resp.ok) {
                    dispatch({ type: "delete_restaurant", payload: id });
                    setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
                } else {
                    alert(`Error al eliminar`);
                }
            } catch (error) {
                console.error("Error eliminando:", error);
            }
        }
    };

    const handleEditClick = (restaurant) => {
        setFormData({
            name: restaurant.name, image_url: restaurant.image_url || "", score: restaurant.score || 0,
            food_type: restaurant.food_type, cuisine_origin: restaurant.cuisine_origin,
            country: restaurant.country || "", city: restaurant.city, description: restaurant.description || ""
        });
        setEditingId(restaurant.id);
        setShowBulk(false); 
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const isAllSelected = filtered.length > 0 && selectedIds.length === filtered.length;

    return (
        <div className="container-fluid min-vh-100 p-4" style={{ backgroundColor: "#1e1e1e", color: "#f8f9fa" }}>
            
            {/* Header y Contadores Destacados */}
            <div className="row align-items-center mb-4 bg-dark p-4 rounded-4 shadow">
                <div className="col-12 col-md-6 mb-3 mb-md-0">
                    <h1 className="fw-bold mb-2 text-center" style={{ color: "#D32F2F" }}>Panel de Control</h1>
                    <div className="d-flex flex-column flex-sm-row gap-3">
                        <span className="badge fs-6 py-2 px-3 w-100 w-sm-auto" style={{ backgroundColor: "#4a4a4a", color: "#ffffff" }}>
                            Total Base de Datos: {restaurantsList.length}
                        </span>
                        <span className="badge fs-6 py-2 px-3 w-100 w-sm-auto" style={{ backgroundColor: "#D32F2F", color: "#ffffff" }}>
                            Visibles con Filtro: {filtered.length}
                        </span>
                    </div>
                </div>
                <div className="col-12 col-md-6 text-md-end d-flex gap-2 justify-content-md-end flex-wrap">
                    {/* Botón Masivo arreglado */}
                    <button 
                        className="btn btn-outline-light fw-bold w-100 w-sm-auto" 
                        onClick={handleBulkClick}
                    >
                        {showBulk ? "Ocultar Carga Masiva" : "📋 Carga / Edición Masiva"}
                    </button>
                    {/* Botón Individual arreglado */}
                    <button 
                        className="btn fw-bold text-white w-100 w-sm-auto" 
                        style={{ backgroundColor: "#D32F2F" }} 
                        onClick={handleCreateClick}
                    >
                        {showForm && !editingId ? "Cerrar Formulario" : "+ Crear Individual"}
                    </button>
                </div>
            </div>

            {/* FORMULARIO DE CARGA MASIVA (EXCEL) - Textos muy legibles */}
            {showBulk && (
                <div className="card bg-dark text-light border-secondary mb-4 p-4 shadow rounded-4 border-2" style={{ borderColor: "#D32F2F !important" }}>
                    <h3 className="text-warning fw-bold mb-3"><i className="fas fa-bolt me-2"></i>Edición y Carga Masiva (Excel)</h3>
                    
                    <div className="alert alert-secondary text-dark border-0 mb-4 fw-semibold">
                        <p className="mb-2"><b>Instrucciones:</b> Copia y pega desde tu Excel con este orden exacto de columnas:</p>
                        <p className="mb-0 font-monospace text-danger bg-light p-2 rounded">
                            ID (Dejar vacío para crear) | Nombre | URL Imagen | Score | Tipo Comida | Origen | País | Ciudad | Descripción
                        </p>
                    </div>
                    
                    <div className="mb-3 d-flex align-items-center gap-3">
                        <label className="fw-bold text-light text-nowrap">Score (Rating) por Defecto:</label>
                        <input 
                            type="number" 
                            className="form-control bg-secondary text-white fw-bold border-0" 
                            style={{ width: "100px" }}
                            value={defaultBulkScore} 
                            onChange={(e) => setDefaultBulkScore(e.target.value)} 
                        />
                        <span className="text-light">Se aplicará si dejas la columna de score vacía en el Excel.</span>
                    </div>

                    <textarea 
                        className="form-control bg-secondary text-white fw-bold border-0 mb-3 font-monospace" 
                        rows="6" 
                        placeholder="Pega tus datos aquí..."
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                    ></textarea>

                    {/* Tabla de Previsualización */}
                    {bulkPreview.length > 0 && (
                        <div className="mb-3">
                            <h5 className="text-success fw-bold mb-2">Previsualización ({bulkPreview.length} filas listas para procesar)</h5>
                            <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                <table className="table table-sm table-dark table-striped">
                                    <thead>
                                        <tr>
                                            <th>Acción</th><th>Nombre</th><th>Score</th><th>Tipo</th><th>País</th><th>Ciudad</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bulkPreview.map((r, i) => (
                                            <tr key={i}>
                                                <td>
                                                    {r.id 
                                                        ? <span className="badge bg-warning text-dark">📝 Actualizar (ID: {r.id})</span> 
                                                        : <span className="badge bg-success">✨ Nuevo</span>}
                                                </td>
                                                <td>{r.name}</td>
                                                <td>{r.score}</td>
                                                <td>{r.food_type}</td>
                                                <td>{r.country}</td>
                                                <td>{r.city}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button 
                                className="btn btn-success mt-3 fw-bold px-4" 
                                onClick={handleBulkSubmit}
                                disabled={isSubmittingBulk}
                            >
                                {isSubmittingBulk ? "Procesando en BD..." : `Procesar ${bulkPreview.length} Restaurantes`}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* FORMULARIO INDIVIDUAL - Cero text-muted, todo text-light */}
            {showForm && (
                <div className="card bg-dark text-light border-secondary mb-4 p-4 shadow rounded-4">
                    <h3 className="mb-4 fw-bold" style={{ color: "#D32F2F" }}>{editingId ? "Editar Restaurante" : "Nuevo Restaurante"}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label text-light fs-8 fw-bold">Nombre</label>
                                <input type="text" name="name" className="form-control bg-secondary text-white fw-bold border-0" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-light fs-8 fw-bold">URL de la Imagen</label>
                                <input type="text" name="image_url" className="form-control bg-secondary text-white fw-bold border-0" value={formData.image_url} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label text-light fs-8 fw-bold">Score (Rating 0-100)</label>
                                <input type="number" name="score" className="form-control bg-secondary text-white fw-bold border-0" value={formData.score} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label text-light fs-8 fw-bold">Tipo de Comida</label>
                                <input type="text" name="food_type" className="form-control bg-secondary text-white fw-bold border-0" placeholder="Ej: Pasta, Sushi" value={formData.food_type} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label text-light fs-8 fw-bold">Origen (Cocina)</label>
                                <input type="text" name="cuisine_origin" className="form-control bg-secondary text-white fw-bold border-0" placeholder="Ej: Italiana" value={formData.cuisine_origin} onChange={handleChange} required />
                            </div>
                            
                            <div className="col-md-6">
                                <label className="form-label text-light fs-8 fw-bold">País</label>
                                <input type="text" name="country" className="form-control bg-secondary text-white fw-bold border-0" placeholder="Ej: Venezuela" value={formData.country} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label text-light fs-8 fw-bold">Ciudad</label>
                                <input type="text" name="city" className="form-control bg-secondary text-white fw-bold border-0" placeholder="Ej: Caracas" value={formData.city} onChange={handleChange} required />
                            </div>
                            
                            <div className="col-12">
                                <label className="form-label text-light fs-8 fw-bold">Descripción</label>
                                <textarea name="description" className="form-control bg-secondary text-white fw-bold border-0" rows="3" value={formData.description} onChange={handleChange}></textarea>
                            </div>
                        </div>
                        <div className="mt-4">
                            <button type="submit" className="btn text-white me-3 px-4 py-2 fw-bold fs-8" style={{ backgroundColor: "#D32F2F" }}>
                                {editingId ? "Guardar Cambios" : "Crear Restaurante"}
                            </button>
                            <button type="button" className="btn btn-outline-light px-4 py-2 fw-bold fs-8" onClick={() => setShowForm(false)}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* BARRAS DE BÚSQUEDA DEL PANEL */}
            <div className="row g-3 mb-4 bg-dark p-4 rounded-4 shadow-sm">
                <div className="col-12 d-flex justify-content-between align-items-center mb-2">
                    <h4 className="text-light fw-bold mb-0"><i className="fas fa-search me-2 text-primary"></i>Filtros del Panel</h4>
                    
                    {selectedIds.length > 0 && (
                        <button 
                            className="btn btn-danger fw-bold shadow fs-8 px-4"
                            onClick={handleBulkDelete}
                            disabled={isDeletingBulk}
                        >
                            {isDeletingBulk ? "Eliminando..." : (
                                <><i className="fas fa-trash-alt me-2"></i>Eliminar Seleccionados ({selectedIds.length})</>
                            )}
                        </button>
                    )}
                </div>
                
                <div className="col-12 col-md-3">
                    <input type="text" className="form-control fw-bold border-0" placeholder="Buscar por nombre..." onChange={(e) => setFilterName(e.target.value)} />
                </div>
                <div className="col-12 col-md-3">
                    <select className="form-select fw-bold border-0" onChange={(e) => setFilterType(e.target.value)}>
                        <option value="">Todos los Tipos</option>
                        {[...new Set(restaurantsList.map(r => r.food_type))].filter(Boolean).map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div className="col-12 col-md-3">
                    <select className="form-select fw-bold border-0" onChange={(e) => setFilterCountry(e.target.value)}>
                        <option value="">Todos los Países</option>
                        {[...new Set(restaurantsList.map(r => r.country))].filter(Boolean).map((c, index) => (
                            <option key={index} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div className="col-12 col-md-3">
                    <select className="form-select fw-bold border-0" onChange={(e) => setFilterCity(e.target.value)}>
                        <option value="">Todas las Ciudades</option>
                        {[...new Set(restaurantsList.map(r => r.city))].filter(Boolean).map((c, index) => (
                            <option key={index} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- ESTILOS CSS REFORZADOS PARA MÁXIMA LEGIBILIDAD --- */}
            <style>
                {`
                @media (max-width: 768px) {
                    .mobile-grid-table thead {
                        display: none;
                    }
                    .mobile-grid-table tbody, 
                    .mobile-grid-table tr {
                        display: block;
                        width: 100%;
                    }
                    .mobile-grid-table tr {
                        background-color: #2c2c2c;
                        border: 2px solid #444;
                        border-radius: 1.25rem;
                        margin-bottom: 1.5rem;
                        padding: 1.25rem;
                        display: flex;
                        flex-direction: column;
                        gap: 0.75rem;
                    }
                    .mobile-grid-table td {
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                        border: none !important;
                        padding: 0 !important;
                        width: 100%;
                        font-size: 1rem;
                    }
                    /* Etiquetas para identificar los datos en móvil */
                    .mobile-grid-table td::before {
                        content: attr(data-label);
                        font-weight: 800;
                        color: #ff6b6b; /* Rojo vibrante para la etiqueta */
                        min-width: 100px;
                        text-transform: uppercase;
                        font-size: 0.75rem;
                        letter-spacing: 1px;
                    }
                    
                    /* Ajustes específicos por orden */
                    .td-check { 
                        order: 1; 
                        border-bottom: 2px solid #444 !important;
                        padding-bottom: 1rem !important;
                        margin-bottom: 0.5rem;
                    }
                    .td-check::before { content: "Seleccionar:"; color: #fff; }

                    .td-id { order: 2; }
                    .td-name { order: 3; font-size: 1.2rem !important; }
                    .td-country { order: 4; }
                    .td-city { order: 5; }
                    .td-type { order: 6; }
                    .td-score { order: 7; }
                    
                    .td-actions { 
                        order: 8; 
                        margin-top: 1rem;
                        padding-top: 1rem !important;
                        border-top: 2px solid #444 !important;
                        display: flex;
                        gap: 0.5rem;
                        justify-content: space-between !important;
                    }
                    .td-actions::before { display: none; }
                    
                    .td-actions button {
                        flex: 1;
                        padding: 0.75rem !important;
                        font-size: 0.9rem !important;
                    }
                }

                /* Forzar blanco en títulos y nombres */
                .text-white-force {
                    color: #ffffff !important;
                    opacity: 1 !important;
                }
                `}
            </style>

            {/* TABLA DE GESTIÓN */}
            <div className="table-responsive card bg-dark border-0 rounded-4 shadow overflow-hidden">
                <table className="table table-dark table-hover align-middle mb-0 mobile-grid-table">
                    <thead style={{ backgroundColor: "#2c2c2c" }}>
                        <tr style={{ color: "#ff6b6b" }}>
                            <th className="py-3 px-4 text-center" style={{ width: "50px" }}>
                                <input 
                                    type="checkbox" 
                                    className="form-check-input border-white" 
                                    style={{ transform: "scale(1.5)", cursor: "pointer" }}
                                    checked={isAllSelected}
                                    onChange={handleSelectAll}
                                />
                            </th>
                            <th className="fw-bold text-white-force">ID</th>
                            <th className="fw-bold text-white-force">Nombre</th>
                            <th className="fw-bold text-white-force">País</th>
                            <th className="fw-bold text-white-force">Ciudad</th>
                            <th className="fw-bold text-white-force">Tipo</th>
                            <th className="fw-bold text-white-force">Score</th>
                            <th className="text-end px-4 fw-bold text-white-force">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan="8" className="text-center py-5 text-white fw-bold">No hay resultados disponibles.</td></tr>
                        ) : (
                            filtered.map(r => (
                                <tr key={r.id} className={selectedIds.includes(r.id) ? "bg-danger bg-opacity-25" : ""}>
                                    
                                    {/* 1. Checkbox */}
                                    <td className="td-check px-4 text-center">
                                     <div className="form-check d-flex justify-content-between gap-4 mb-0">
                                            <input 
                                                type="checkbox" 
                                                id={`check-${r.id}`}
                                                className="form-check-input border-white m-0"
                                                style={{ transform: "scale(1.4)", cursor: "pointer" }}
                                                checked={selectedIds.includes(r.id)}
                                                onChange={() => handleSelectOne(r.id)}
                                            />
                                            {/* Esta etiqueta solo se ve en MÓVIL (d-md-none) */}
                                            <label 
                                                className="form-check-label text-white fw-bold d-md-none mb-0" 
                                                htmlFor={`check-${r.id}`}
                                                style={{ cursor: "pointer", fontSize: "0.9rem" }}
                                            >
                                                Seleccionar
                                            </label>
                                        </div>
                                    </td>

                                    {/* 2. ID */}
                                    <td className="td-id text-info fw-bold" data-label="ID:">#{r.id}</td>

                                    {/* 3. Nombre */}
                                    <td className="td-name text-white-force fw-bold fs-6" data-label="Nombre:">
                                        {r.name}
                                    </td>

                                    {/* 4. País */}
                                    <td className="td-country text-white-force fs-6" data-label="País:">
                                        <i className="fas fa-globe-americas me-2 text-primary"></i>
                                        {r.country}
                                    </td>

                                    {/* 5. Ciudad */}
                                    <td className="td-city text-white-force fs-6" data-label="Ciudad:">
                                        {r.city}
                                    </td>

                                    {/* 6. Tipo */}
                                    <td className="td-type" data-label="Tipo:">
                                        <span className="badge bg-primary px-3 py-2">{r.food_type}</span>
                                    </td>

                                    {/* 7. Score */}
                                    <td className="td-score fw-bold text-warning fs-6" data-label="Score:">
                                        <i className="fas fa-star me-1"></i>{r.score}
                                    </td>

                                    {/* 8 y 9. Acciones (Editar y Eliminar) */}
                                    <td className="td-actions text-end px-4">
                                        <button 
                                            className="btn btn-light text-dark fw-bold rounded-pill" 
                                            onClick={() => handleEditClick(r)}
                                        >
                                            <i className="fas fa-edit me-1"></i> Editar
                                        </button>
                                        <button 
                                            className="btn btn-danger fw-bold rounded-pill" 
                                            onClick={() => handleDelete(r.id)}
                                        >
                                            <i className="fas fa-trash me-1"></i> Borrar
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

        </div>
    );
};