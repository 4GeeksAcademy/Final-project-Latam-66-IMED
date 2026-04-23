import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const AdminDashboard = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate(); 

    const initialFormState = {
        name: "", image_url: "", food_type: "", cuisine_origin: "", 
        country: "", city: "", description: "" // <-- Agregado country
    };

    const [formData, setFormData] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    
    // Estados para Filtros
    const [filterName, setFilterName] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterCity, setFilterCity] = useState("");
    const [filterCountry, setFilterCountry] = useState("");

    // Estados para Carga Masiva (Excel/Sheets)
    const [showBulk, setShowBulk] = useState(false);
    const [bulkText, setBulkText] = useState("");
    const [bulkPreview, setBulkPreview] = useState([]);
    const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);

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

    // LÓGICA DE FILTROS AVANZADA (Con protección de nulos)
    const restaurantsList = store.restaurants || [];
    const filtered = restaurantsList.filter(r =>
        (r.name || "").toLowerCase().includes(filterName.toLowerCase()) &&
        (r.food_type || "").toLowerCase().includes(filterType.toLowerCase()) &&
        (r.city || "").toLowerCase().includes(filterCity.toLowerCase()) &&
        (r.country || "").toLowerCase().includes(filterCountry.toLowerCase())
    );

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
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
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

    // LÓGICA DE CARGA MASIVA (Copiar y Pegar desde Excel)
    useEffect(() => {
        if (!bulkText.trim()) {
            setBulkPreview([]);
            return;
        }
        // Separamos por filas (\n) y luego por columnas (\t del tabulador de Excel)
        const rows = bulkText.split('\n');
        const parsedData = rows.map(row => {
            const cols = row.split('\t');
            return {
                name: cols[0]?.trim() || "",
                image_url: cols[1]?.trim() || "",
                food_type: cols[2]?.trim() || "",
                cuisine_origin: cols[3]?.trim() || "",
                country: cols[4]?.trim() || "",
                city: cols[5]?.trim() || "",
                description: cols[6]?.trim() || ""
            };
        }).filter(r => r.name !== ""); // Ignoramos filas vacías sin nombre

        setBulkPreview(parsedData);
    }, [bulkText]);

    // Funcion para mandar un monton de restaurantes al backend en paralelo
    const handleBulkSubmit = async () => {
        if (bulkPreview.length === 0) return;
        setIsSubmittingBulk(true);
        const token = sessionStorage.getItem("token");

        try {
            // 1. Preparamos todas las peticiones
            const promises = bulkPreview.map(rest => 
                fetch(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants`, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json", 
                        "Authorization": `Bearer ${token}` 
                    },
                    body: JSON.stringify(rest)
                })
            );

            // 2. Esperamos a que todas terminen
            const responses = await Promise.all(promises);

            // 3. ¡EL TRUCO SENIOR! Filtramos las que NO fueron exitosas (resp.ok es falso para 401, 404, 500)
            const failedResponses = responses.filter(resp => !resp.ok);

            if (failedResponses.length > 0) {
                // Si hubo fallos, revisamos el código del primero para avisarle al usuario
                const errorCode = failedResponses[0].status;
                if (errorCode === 401) {
                    alert("Error 401: Tu sesión ha expirado o el Token es inválido. Por favor, cierra sesión y vuelve a iniciar sesión.");
                } else {
                    alert(`Error del servidor (${errorCode}). No se pudieron guardar todos los restaurantes.`);
                }
            } else {
                // Solo si el arreglo de fallos está vacío, cantamos victoria
                alert(`¡Éxito! Se han guardado ${bulkPreview.length} restaurantes en la Base de Datos.`);
                setBulkText("");
                setShowBulk(false);
                fetchAdminRestaurants(); // Recargamos la tabla visualmente
            }

        } catch (error) {
            console.error("Error en carga masiva:", error);
            alert("Error de red. Asegúrate de que el servidor Backend esté corriendo.");
        } finally {
            setIsSubmittingBulk(false);
        }
    };


    // ACCIONES DE TABLA
    const handleEditClick = (restaurant) => {
        setFormData({
            name: restaurant.name,
            image_url: restaurant.image_url || "",
            food_type: restaurant.food_type,
            cuisine_origin: restaurant.cuisine_origin,
            country: restaurant.country || "", // <-- Agregado
            city: restaurant.city,
            description: restaurant.description || ""
        });
        setEditingId(restaurant.id);
        setShowBulk(false); // Cerramos el masivo por si acaso
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
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
                } else {
                    const errorData = await resp.json();
                    alert(`Error: ${errorData.msg || "No se pudo eliminar"}`);
                }
            } catch (error) {
                console.error("Error eliminando:", error);
            }
        }
    };

    return (
        <div className="container-fluid bg-fc-dark text-fc-light min-vh-100 p-4" style={{ backgroundColor: "#1e1e1e" }}>
            
            {/* Header y Contadores Destacados */}
            <div className="row align-items-center mb-4 bg-dark p-4 rounded-4 shadow">
                <div className="col-12 col-md-6 mb-3 mb-md-0">
                    <h1 className="text-fc-red fw-bold mb-2" style={{ color: "#D32F2F" }}>Panel de Control</h1>
                    <div className="d-flex gap-3">
                        <span className="badge bg-secondary fs-6 py-2 px-3">
                            Total Base de Datos: {restaurantsList.length}
                        </span>
                        <span className="badge fs-6 py-2 px-3" style={{ backgroundColor: "#D32F2F" }}>
                            Visibles con Filtro: {filtered.length}
                        </span>
                    </div>
                </div>
                <div className="col-12 col-md-6 text-md-end d-flex gap-2 justify-content-md-end flex-wrap">
                    <button 
                        className="btn btn-outline-light fw-bold"
                        onClick={() => { setShowForm(false); setShowBulk(!showBulk); }}
                    >
                        {showBulk ? "Ocultar Carga Masiva" : "📋 Agregar Múltiples"}
                    </button>
                    <button
                        className="btn fw-bold text-white" style={{ backgroundColor: "#D32F2F" }}
                        onClick={() => {
                            setFormData(initialFormState);
                            setEditingId(null);
                            setShowBulk(false);
                            setShowForm(!showForm);
                        }}
                    >
                        {showForm ? "Cerrar Formulario" : "+ Crear Restaurante"}
                    </button>
                </div>
            </div>

            {/* FORMULARIO DE CARGA MASIVA (EXCEL) */}
            {showBulk && (
                <div className="card bg-dark text-light border-secondary mb-4 p-4 shadow rounded-4 border-2" style={{ borderColor: "#D32F2F !important" }}>
                    <h3 className="text-warning mb-3"><i className="fas fa-bolt me-2"></i>Carga Masiva (Desde Excel/Sheets)</h3>
                    <p className="text-muted small">
                        Copia las celdas desde tu hoja de cálculo y pégalas en el cuadro de abajo. <br/>
                        <b>Orden estricto de columnas:</b> Nombre | URL Imagen | Tipo de Comida | Origen | País | Ciudad | Descripción
                    </p>
                    
                    <textarea 
                        className="form-control bg-secondary text-light border-0 mb-3" 
                        rows="5" 
                        placeholder="Pega tus datos de Excel aquí..."
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                    ></textarea>

                    {/* Tabla de Previsualización */}
                    {bulkPreview.length > 0 && (
                        <div className="mb-3">
                            <h5 className="text-success mb-2">Previsualización ({bulkPreview.length} filas listas para subir)</h5>
                            <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                                <table className="table table-sm table-dark table-striped">
                                    <thead>
                                        <tr>
                                            <th>Nombre</th><th>Tipo</th><th>País</th><th>Ciudad</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bulkPreview.map((r, i) => (
                                            <tr key={i}>
                                                <td>{r.name}</td><td>{r.food_type}</td><td>{r.country}</td><td>{r.city}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button 
                                className="btn btn-success mt-2 fw-bold" 
                                onClick={handleBulkSubmit}
                                disabled={isSubmittingBulk}
                            >
                                {isSubmittingBulk ? "Guardando en BD..." : `Subir ${bulkPreview.length} Restaurantes`}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* FORMULARIO INDIVIDUAL */}
            {showForm && (
                <div className="card bg-dark text-light border-secondary mb-4 p-4 shadow rounded-4">
                    <h3 className="mb-4" style={{ color: "#D32F2F" }}>{editingId ? "Editar Restaurante" : "Nuevo Restaurante"}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Nombre</label>
                                <input type="text" name="name" className="form-control bg-secondary text-light border-0" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">URL de la Imagen</label>
                                <input type="text" name="image_url" className="form-control bg-secondary text-light border-0" value={formData.image_url} onChange={handleChange} />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label  fw-bold">Tipo de Comida</label>
                                <input type="text" name="food_type" className="form-control bg-secondary text-light border-0" placeholder="Ej: Pasta, Sushi" value={formData.food_type} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label  fw-bold">Origen (Cocina)</label>
                                <input type="text" name="cuisine_origin" className="form-control bg-secondary text-light border-0" placeholder="Ej: Italiana" value={formData.cuisine_origin} onChange={handleChange} required />
                            </div>
                            
                            {/* País antes que Ciudad */}
                            <div className="col-md-6">
                                <label className="form-label fw-bold">País</label>
                                <input type="text" name="country" className="form-control bg-secondary text-light border-0" placeholder="Ej: Venezuela" value={formData.country} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Ciudad</label>
                                <input type="text" name="city" className="form-control bg-secondary text-light border-0" placeholder="Ej: Caracas" value={formData.city} onChange={handleChange} required />
                            </div>
                            
                            <div className="col-12">
                                <label className="form-label fw-bold">Descripción</label>
                                <textarea name="description" className="form-control bg-secondary text-light border-0" rows="3" value={formData.description} onChange={handleChange}></textarea>
                            </div>
                        </div>
                        <div className="mt-4">
                            <button type="submit" className="btn text-white me-2 fw-bold" style={{ backgroundColor: "#D32F2F" }}>
                                {editingId ? "Guardar Cambios" : "Crear Restaurante"}
                            </button>
                            <button type="button" className="btn btn-outline-light" onClick={() => setShowForm(false)}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* BARRAS DE BÚSQUEDA Y FILTROS AMPLIADOS */}
            <div className="row g-3 mb-4 bg-dark p-4 rounded-4 shadow-sm">
                <h5 className="col-12 text-muted fw-bold mb-2"><i className="fas fa-search me-2"></i>Filtros del Panel</h5>
                <div className="col-12 col-md-3">
                    <input type="text" className="form-control border-0" placeholder="Buscar por nombre..." onChange={(e) => setFilterName(e.target.value)} />
                </div>
                <div className="col-12 col-md-3">
                    <select className="form-select border-0" onChange={(e) => setFilterType(e.target.value)}>
                        <option value="">Todos los Tipos</option>
                        {[...new Set(restaurantsList.map(r => r.food_type))].filter(Boolean).map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div className="col-12 col-md-3">
                    <select className="form-select border-0" onChange={(e) => setFilterCountry(e.target.value)}>
                        <option value="">Todos los Países</option>
                        {[...new Set(restaurantsList.map(r => r.country))].filter(Boolean).map((c, index) => (
                            <option key={index} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div className="col-12 col-md-3">
                    <select className="form-select border-0" onChange={(e) => setFilterCity(e.target.value)}>
                        <option value="">Todas las Ciudades</option>
                        {[...new Set(restaurantsList.map(r => r.city))].filter(Boolean).map((c, index) => (
                            <option key={index} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* TABLA DE GESTIÓN */}
            <div className="table-responsive card bg-dark text-light border-0 rounded-4 shadow overflow-hidden">
                <table className="table table-dark table-hover align-middle mb-0">
                    <thead style={{ backgroundColor: "#2c2c2c" }}>
                        <tr style={{ color: "#D32F2F" }}>
                            <th className="py-3 px-4">Nombre</th>
                            <th>País</th>
                            <th>Ciudad</th>
                            <th>Tipo</th>
                            <th>Score</th>
                            <th className="text-end px-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan="6" className="text-center py-5 text-muted">No hay restaurantes que coincidan con la búsqueda.</td></tr>
                        ) : (
                            filtered.map(r => (
                                <tr key={r.id}>
                                    <td className="px-4 fw-semibold">{r.name}</td>
                                    <td><span className="text-secondary"><i className="fas fa-globe-americas me-1"></i>{r.country || "N/A"}</span></td>
                                    <td>{r.city}</td>
                                    <td><span className="badge bg-secondary">{r.food_type}</span></td>
                                    <td className="fw-bold text-warning">{r.score}</td>
                                    <td className="text-end px-4">
                                        <button className="btn btn-sm btn-outline-light me-2 rounded-pill px-3" onClick={() => handleEditClick(r)}>
                                            <i className="fas fa-edit me-1"></i> Editar
                                        </button>
                                        <button className="btn btn-sm btn-outline-danger rounded-pill px-3" onClick={() => handleDelete(r.id)}>
                                            <i className="fas fa-trash me-1"></i> Eliminar
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