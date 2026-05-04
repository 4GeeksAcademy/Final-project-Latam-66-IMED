import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import toast from "react-hot-toast";

export const AdminDashboard = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const initialFormState = {
        name: "", image_url: "", score: 0, food_type: "", cuisine_origin: "",
        country: "", city: "", description: "", latitud: "", longitud: ""
    };

    const [formData, setFormData] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // ESTADO PARA CLOUDINARY
    const [isUploading, setIsUploading] = useState(false);

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

    // Estados para Usuarios y Pestañas
    const [activeTab, setActiveTab] = useState("restaurants");
    const [usersList, setUsersList] = useState([]);
    const [selectedUserComments, setSelectedUserComments] = useState(null);

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
        fetchAdminUsers();
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
            toast.error("Error de conexión al cargar restaurantes 🔌");
        }
    };

    const fetchAdminUsers = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                setUsersList(data);
            }
        } catch (error) {
            console.error("Error cargando usuarios:", error);
            toast.error("Error al cargar la lista de usuarios");
        }
    };

    const viewUserComments = async (user) => {
        try {
            const token = sessionStorage.getItem("token");
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${user.id}/comments`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (resp.ok) {
                const data = await resp.json();
                setSelectedUserComments({ name: user.full_name || user.username, list: data });
            }
        } catch (error) {
            console.error("Error cargando comentarios:", error);
            toast.error("Error al cargar las reseñas del usuario");
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

    // FUNCIÓN PARA SUBIR IMAGEN A CLOUDINARY
    const uploadImageToCloudinary = async (file) => {
        setIsUploading(true);
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "restaurantes_preset");
        data.append("cloud_name", "de1dgfuk3");

        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/de1dgfuk3/image/upload", {
                method: "POST",
                body: data,
            });
            
            if (!response.ok) {
                throw new Error("Error en la respuesta de Cloudinary");
            }

            const result = await response.json();
            setIsUploading(false);
            return result.secure_url; 
        } catch (error) {
            console.error("Error al subir la imagen:", error);
            toast.error("Fallo al subir imagen a la nube ☁️❌");
            setIsUploading(false);
            return null;
        }
    };

    const handleCreateClick = () => {
        if (showForm && !editingId) {
            setShowForm(false);
        } else {
            setShowBulk(false);
            setFormData(initialFormState);
            setEditingId(null);
            setShowForm(true);
        }
    };

    const handleBulkClick = () => {
        if (showBulk) {
            setShowBulk(false);
        } else {
            setShowForm(false);
            setShowBulk(true);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (isUploading) {
            toast.error("Espera a que la imagen termine de subir ⏳");
            return;
        }

        const token = sessionStorage.getItem("token");
        const url = editingId
            ? `${import.meta.env.VITE_BACKEND_URL}/api/restaurants/${editingId}`
            : `${import.meta.env.VITE_BACKEND_URL}/api/restaurants`;
        const method = editingId ? "PUT" : "POST";

        const savePromise = new Promise(async (resolve, reject) => {
            try {
                const resp = await fetch(url, {
                    method: method,
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify(formData)
                });

                if (resp.ok) {
                    const data = await resp.json();
                    resolve(data);
                } else {
                    const errorData = await resp.json();
                    reject(errorData.msg || "No se pudo guardar");
                }
            } catch (error) {
                reject("Error de red");
            }
        });

        toast.promise(savePromise, {
            loading: editingId ? 'Actualizando...' : 'Creando restaurante...',
            success: editingId ? '¡Restaurante actualizado con éxito! ✨' : '¡Restaurante creado con éxito! 🍽️',
            error: (err) => `Error: ${err} ❌`
        }).then((data) => {
            if (editingId) {
                dispatch({ type: "update_restaurant", payload: data.restaurant });
            } else {
                dispatch({ type: "add_restaurant", payload: data.restaurant });
            }
            setFormData(initialFormState);
            setEditingId(null);
            setShowForm(false);
        }).catch(err => console.error(err));
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
                description: cols[8]?.trim() || "",
                latitud: cols[9]?.trim() ? parseFloat(cols[9].trim()) : null,
                longitud: cols[10]?.trim() ? parseFloat(cols[10].trim()) : null
            };
        }).filter(r => r.name !== "");
        setBulkPreview(parsedData);
    }, [bulkText, defaultBulkScore]);

    const handleBulkSubmit = async () => {
        if (bulkPreview.length === 0) return;
        setIsSubmittingBulk(true);
        const token = sessionStorage.getItem("token");

        const bulkPromise = new Promise(async (resolve, reject) => {
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
                    if (errorCode === 401) reject("Sesión expirada 🔒");
                    else reject(`Error HTTP ${errorCode}`);
                } else {
                    resolve();
                }
            } catch (error) {
                reject("Error de conexión 🔌");
            }
        });

        toast.promise(bulkPromise, {
            loading: 'Procesando carga masiva en BD... ⏳',
            success: `¡Éxito! Se procesaron ${bulkPreview.length} restaurantes 🚀`,
            error: (err) => `Error: ${err}`
        }).then(() => {
            setBulkText("");
            setShowBulk(false);
            fetchAdminRestaurants();
        }).finally(() => {
            setIsSubmittingBulk(false);
        });
    };

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

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;

        toast((t) => (
            <div className="bg-dark text-light p-4 rounded-4 border border-danger shadow-lg d-flex flex-column align-items-center text-center">
                <i className="fas fa-exclamation-triangle text-danger fs-1 mb-3"></i>
                <h5 className="fw-bold mb-3">¿Eliminar {selectedIds.length} restaurantes?</h5>
                <p className="text-white-50 small mb-4">Esta acción no se puede deshacer y borrará sus dependencias.</p>
                <div className="d-flex gap-3 w-100 justify-content-center">
                    <button
                        className="btn btn-danger fw-bold rounded-pill px-4"
                        onClick={async () => {
                            toast.dismiss(t.id);
                            setIsDeletingBulk(true);
                            const token = sessionStorage.getItem("token");

                            const deleteBulkPromise = new Promise(async (resolve, reject) => {
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
                                        reject(`Fallaron ${failedResponses.length} eliminaciones`);
                                    } else {
                                        resolve();
                                    }
                                } catch (error) {
                                    reject("Error de red");
                                }
                            });

                            toast.promise(deleteBulkPromise, {
                                loading: 'Eliminando restaurantes... 🔥',
                                success: `¡Limpiaste ${selectedIds.length} restaurantes! 🗑️`,
                                error: (err) => `Error: ${err} ❌`
                            }).then(() => {
                                setSelectedIds([]);
                                fetchAdminRestaurants();
                            }).finally(() => {
                                setIsDeletingBulk(false);
                            });
                        }}
                    >
                        Sí, eliminar
                    </button>
                    <button
                        className="btn btn-outline-light fw-bold rounded-pill px-4"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            style: { background: "transparent", boxShadow: "none", padding: 0 }
        });
    };

    const handleDelete = (id) => {
        toast((t) => (
            <div className="bg-dark text-light p-4 rounded-4 border border-danger shadow-lg d-flex flex-column align-items-center text-center">
                <i className="fas fa-exclamation-triangle text-danger fs-1 mb-3"></i>
                <h5 className="fw-bold mb-3">¿Eliminar este restaurante?</h5>
                <p className="text-white-50 small mb-4">Se borrará permanentemente de la base de datos.</p>
                <div className="d-flex gap-3 w-100 justify-content-center">
                    <button
                        className="btn btn-danger fw-bold rounded-pill px-4"
                        onClick={() => {
                            toast.dismiss(t.id);
                            const token = sessionStorage.getItem("token");

                            const deleteSinglePromise = new Promise(async (resolve, reject) => {
                                try {
                                    const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/${id}`, {
                                        method: "DELETE",
                                        headers: { "Authorization": `Bearer ${token}` }
                                    });

                                    if (resp.ok) resolve();
                                    else reject();
                                } catch (error) {
                                    reject();
                                }
                            });

                            toast.promise(deleteSinglePromise, {
                                loading: 'Eliminando...',
                                success: 'Restaurante eliminado permanentemente 🗑️',
                                error: 'Error al eliminar el restaurante ❌'
                            }).then(() => {
                                dispatch({ type: "delete_restaurant", payload: id });
                                setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
                            }).catch(() => console.error("Fallo al borrar"));
                        }}
                    >
                        Sí, eliminar
                    </button>
                    <button
                        className="btn btn-outline-light fw-bold rounded-pill px-4"
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        ), {
            duration: Infinity,
            style: { background: "transparent", boxShadow: "none", padding: 0 }
        });
    };

    const handleEditClick = (restaurant) => {
        setFormData({
            name: restaurant.name, image_url: restaurant.image_url || "", score: restaurant.score || 0,
            food_type: restaurant.food_type, cuisine_origin: restaurant.cuisine_origin,
            country: restaurant.country || "", city: restaurant.city, description: restaurant.description || "",
            latitud: restaurant.latitud || "", longitud: restaurant.longitud || ""
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
                    <h1 className="fw-bold mb-2 text-center text-md-start" style={{ color: "#D32F2F" }}>
                        Panel: {activeTab === "restaurants" ? "Restaurantes" : "Usuarios"}
                    </h1>
                    <div className="d-flex flex-column flex-sm-row gap-3">
                        <span className="badge fs-6 py-2 px-3 w-100 w-sm-auto" style={{ backgroundColor: "#4a4a4a", color: "#ffffff" }}>
                            {activeTab === "restaurants" ? `Total DB: ${restaurantsList.length}` : `Usuarios Registrados: ${usersList.length}`}
                        </span>
                        {activeTab === "restaurants" && (
                            <span className="badge fs-6 py-2 px-3 w-100 w-sm-auto" style={{ backgroundColor: "#D32F2F", color: "#ffffff" }}>
                                Visibles con Filtro: {filtered.length}
                            </span>
                        )}
                    </div>
                </div>

                <div className="col-12 col-md-6 text-md-end d-flex gap-2 justify-content-md-end flex-wrap align-items-center">

                    {/* TOGGLE PESTAÑAS */}
                    <div className="btn-group bg-secondary rounded-pill p-1 me-md-2 w-100 w-md-auto mb-2 mb-md-0">
                        <button
                            className={`btn btn-sm rounded-pill px-4 fw-bold ${activeTab === "restaurants" ? "btn-light text-dark" : "text-white"}`}
                            onClick={() => setActiveTab("restaurants")}
                        >
                            Restaurantes
                        </button>
                        <button
                            className={`btn btn-sm rounded-pill px-4 fw-bold ${activeTab === "users" ? "btn-light text-dark" : "text-white"}`}
                            onClick={() => setActiveTab("users")}
                        >
                            Usuarios
                        </button>
                    </div>

                    {/* BOTONES SOLO PARA RESTAURANTES */}
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

            {/* =========================================================
                VISTA DE USUARIOS
            ========================================================= */}
            {activeTab === "users" && (
                <div className="table-responsive card bg-dark border-0 rounded-4 shadow overflow-hidden animate__animated animate__fadeIn">
                    <table className="table table-dark table-hover align-middle mb-0">
                        <thead style={{ backgroundColor: "#2c2c2c" }}>
                            <tr style={{ color: "#ff6b6b" }}>
                                <th className="py-3 px-4 fw-bold text-white">ID</th>
                                <th className="fw-bold text-white">Nombre / Usuario</th>
                                <th className="fw-bold text-white">Email</th>
                                <th className="fw-bold text-white">Rol</th>
                                <th className="text-center fw-bold text-white">Reseñas Realizadas</th>
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
                                            <span
                                                className="text-primary"
                                                style={{ cursor: "pointer", textDecoration: "underline" }}
                                                onClick={() => viewUserComments(u)}
                                            >
                                                {u.full_name || "Sin nombre"}
                                            </span>
                                            <div className="text-white">@{u.username}</div>
                                        </td>
                                        <td className="text-white">{u.email}</td>
                                        <td>
                                            <span className={`badge px-3 py-2 ${u.role === 'admin' ? 'bg-danger' : 'bg-secondary'}`}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <span className="badge bg-primary fs-6 px-3 py-2">
                                                {u.review_count || 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* =========================================================
                VISTA DE RESTAURANTES 
            ========================================================= */}
            {activeTab === "restaurants" && (
                <div className="animate__animated animate__fadeIn">
                    {/* FORMULARIO DE CARGA MASIVA (EXCEL) */}
                    {showBulk && (
                        <div className="card bg-dark text-light border-secondary mb-4 p-4 shadow rounded-4 border-2" style={{ borderColor: "#D32F2F !important" }}>
                            <h3 className="text-warning fw-bold mb-3"><i className="fas fa-bolt me-2"></i>Edición y Carga Masiva (Excel)</h3>

                            <div className="alert alert-secondary text-dark border-0 mb-4 fw-semibold">
                                <p className="mb-2"><b>Instrucciones:</b> Copia y pega desde tu Excel con este orden exacto de columnas:</p>
                                <p className="mb-0 font-monospace text-danger bg-light p-2 rounded">
                                    ID (Dejar vacío para crear) | Nombre | URL Imagen | Score | Tipo Comida | Origen | País | Ciudad | Descripción | Latitud | Longitud
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

                            {bulkPreview.length > 0 && (
                                <div className="mb-3">
                                    <h5 className="text-success fw-bold mb-2">Previsualización ({bulkPreview.length} filas listas para procesar)</h5>
                                    <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                        <table className="table table-sm table-dark table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Acción</th><th>Nombre</th><th>Score</th><th>Tipo</th><th>País</th><th>Ciudad</th><th>Latitud</th><th>Longitud</th>
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
                                                        <td>{r.latitud || "-"}</td>
                                                        <td>{r.longitud || "-"}</td>
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

                    {/* FORMULARIO INDIVIDUAL */}
                    {showForm && (
                        <div className="card bg-dark text-light border-secondary mb-4 p-4 shadow rounded-4">
                            <h3 className="mb-4 fw-bold" style={{ color: "#D32F2F" }}>{editingId ? "Editar Restaurante" : "Nuevo Restaurante"}</h3>
                            <form onSubmit={handleSubmit}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label text-light fs-8 fw-bold">Nombre</label>
                                        <input type="text" name="name" className="form-control bg-secondary text-white fw-bold border-0" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    
                                    {/* INPUT DE CLOUDINARY */}
                                    <div className="col-md-6">
                                        <label className="form-label text-light fs-8 fw-bold">Foto del Restaurante</label>
                                        <input 
                                            type="file" 
                                            className="form-control bg-secondary text-white fw-bold border-0" 
                                            accept="image/*" 
                                            disabled={isUploading} 
                                            onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                    const url = await uploadImageToCloudinary(file);
                                                    if (url) {
                                                        setFormData({ ...formData, image_url: url });
                                                        toast.success("Imagen subida y lista para guardar 📸");
                                                    }
                                                }
                                            }} 
                                        />
                                        {isUploading && (
                                            <div className="text-info mt-2 small fw-bold">
                                                <i className="fas fa-spinner fa-spin me-2"></i> Subiendo a la nube...
                                            </div>
                                        )}
                                        {formData.image_url && !isUploading && (
                                            <div className="mt-2 d-flex align-items-center gap-2">
                                                <img 
                                                    src={formData.image_url} 
                                                    alt="Vista previa" 
                                                    className="img-thumbnail bg-dark border-secondary" 
                                                    style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }} 
                                                />
                                                <span className="text-success small fw-bold"><i className="fas fa-check-circle me-1"></i>Imagen cargada</span>
                                            </div>
                                        )}
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

                                    <div className="col-md-6">
                                        <label className="form-label text-light fs-8 fw-bold">Latitud</label>
                                        <input type="number" step="any" name="latitud" className="form-control bg-secondary text-white fw-bold border-0" placeholder="Ej: 19.4326" value={formData.latitud} onChange={handleChange} />
                                    </div>

                                    <div className="col-md-6">
                                        <label className="form-label text-light fs-8 fw-bold">Longitud</label>
                                        <input type="number" step="any" name="longitud" className="form-control bg-secondary text-white fw-bold border-0" placeholder="Ej: -99.1332" value={formData.longitud} onChange={handleChange} />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label text-light fs-8 fw-bold">Descripción</label>
                                        <textarea name="description" className="form-control bg-secondary text-white fw-bold border-0" rows="3" value={formData.description} onChange={handleChange}></textarea>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <button 
                                        type="submit" 
                                        className="btn text-white me-3 px-4 py-2 fw-bold fs-8" 
                                        style={{ backgroundColor: "#D32F2F" }}
                                        disabled={isUploading} 
                                    >
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

                    {/* =========================================================
                        GRILLA DE MICRO-CARDS (COMPACTA) + SELECCIÓN MASIVA
                    ========================================================= */}
                    
                    {/* BARRA DE SELECCION MASIVA */}
                    <div className="d-flex justify-content-between align-items-center bg-secondary p-3 rounded-4 mb-3 shadow-sm">
                        <div className="form-check text-light mb-0 d-flex align-items-center">
                            <input
                                type="checkbox"
                                className="form-check-input mt-0 me-2 border-white"
                                id="selectAllCards"
                                checked={isAllSelected}
                                onChange={handleSelectAll}
                                style={{ transform: "scale(1.3)", cursor: "pointer" }}
                            />
                            <label className="form-check-label fw-bold" htmlFor="selectAllCards" style={{ cursor: "pointer", fontSize: "0.95rem" }}>
                                Seleccionar Todos ({filtered.length})
                            </label>
                        </div>
                        
                        {/* Botón Flotante de Eliminar Masivo */}
                        {selectedIds.length > 0 && (
                            <button
                                className="btn btn-danger btn-sm fw-bold shadow-sm px-3 rounded-pill animate__animated animate__pulse"
                                onClick={handleBulkDelete}
                                disabled={isDeletingBulk}
                            >
                                {isDeletingBulk ? "Borrando..." : (
                                    <><i className="fas fa-trash-alt me-1"></i> Borrar {selectedIds.length}</>
                                )}
                            </button>
                        )}
                    </div>

                    {filtered.length === 0 ? (
                        <div className="text-center py-5 text-white fw-bold">No hay resultados disponibles.</div>
                    ) : (
                        // GRILLA ULTRA COMPACTA (Hasta 5 por fila en PC grandes)
                        <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3">
                            {filtered.map(r => (
                                <div key={r.id} className="col">
                                    <div className={`card h-100 bg-dark text-white border-secondary shadow-sm rounded-3 ${selectedIds.includes(r.id) ? "border-danger bg-danger bg-opacity-10" : ""}`} style={{ fontSize: "0.85rem" }}>
                                        
                                        {/* HEADER: Miniatura y Checkbox */}
                                        <div className="position-relative">
                                            <div className="position-absolute top-0 start-0 p-2 z-1">
                                                <input
                                                    type="checkbox"
                                                    id={`check-${r.id}`}
                                                    className="form-check-input bg-dark border-white"
                                                    style={{ transform: "scale(1.2)", cursor: "pointer" }}
                                                    checked={selectedIds.includes(r.id)}
                                                    onChange={() => handleSelectOne(r.id)}
                                                />
                                            </div>
                                            <div className="position-absolute top-0 end-0 p-1 z-1">
                                                <span className="badge bg-dark border border-secondary text-info opacity-75" style={{fontSize: "0.65rem"}}>#{r.id}</span>
                                            </div>
                                            <img 
                                                src={r.image_url || "https://via.placeholder.com/400x200?text=Sin+Imagen"} 
                                                className="card-img-top rounded-top-3" 
                                                alt={r.name} 
                                                // Imagen más compacta
                                                style={{ height: "120px", objectFit: "cover" }} 
                                            />
                                        </div>

                                        {/* BODY: Textos reducidos */}
                                        <div className="card-body p-2 d-flex flex-column">
                                            <h6 className="card-title fw-bold mb-1 text-truncate" title={r.name}>{r.name}</h6>
                                            
                                            <div className="mb-2 text-truncate" style={{fontSize: "0.75rem"}}>
                                                <i className="fas fa-globe-americas text-primary me-1"></i>
                                                <span className="text-white-50">{r.city}, {r.country}</span>
                                            </div>
                                            
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="badge bg-primary text-truncate" style={{fontSize: "0.7rem", maxWidth: "65%"}} title={r.food_type}>{r.food_type}</span>
                                                <span className="text-warning fw-bold" style={{fontSize: "0.8rem"}}>
                                                    <i className="fas fa-star me-1"></i>{r.score}
                                                </span>
                                            </div>

                                            {/* BOTONES COMPACTOS */}
                                            <div className="mt-auto d-flex gap-1">
                                                <button
                                                    className="btn btn-light btn-sm text-dark fw-bold rounded-pill flex-grow-1"
                                                    style={{fontSize: "0.7rem", padding: "0.2rem"}}
                                                    onClick={() => handleEditClick(r)}
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm fw-bold rounded-pill flex-grow-1"
                                                    style={{fontSize: "0.7rem", padding: "0.2rem"}}
                                                    onClick={() => handleDelete(r.id)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* MODAL DE RESEÑAS DE USUARIO SE MANTIENE IGUAL... */}
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
                                    <div className="text-center py-4">
                                        <i className="fas fa-comment-slash fs-1 text-secondary mb-3"></i>
                                        <h5 className="text-white-50">Este usuario aún no ha realizado reseñas.</h5>
                                    </div>
                                ) : (
                                    selectedUserComments.list.map((c, i) => (
                                        <div key={i} className="mb-3 p-4 bg-secondary rounded-4 border border-light border-opacity-10 shadow-sm">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h5 className="text-white fw-bold mb-0">
                                                    <i className="fas fa-utensils me-2 text-warning"></i>
                                                    {c.restaurant_name}
                                                </h5>
                                                <span className="badge bg-warning text-dark fs-6 px-3 py-2 fw-bold">
                                                    <i className="fas fa-star me-1"></i> {c.score}
                                                </span>
                                            </div>
                                            <p className="mb-0 text-light fs-5 fst-italic">"{c.text}"</p>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="modal-footer border-secondary">
                                <button className="btn btn-outline-light fw-bold px-4" onClick={() => setSelectedUserComments(null)}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};