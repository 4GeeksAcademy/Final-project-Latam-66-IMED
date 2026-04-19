import React, { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

const initialFormState = {
    name: "",
    image_url: "",
    food_type: "",
    cuisine_origin: "",
    city: "",
    description: ""
};

export const AdminDashboard = () => {
    // Solo extraemos store y dispatch, las actions aquí no existen
    const { store, dispatch } = useGlobalReducer();

    // Estados locales para manejar la UI
    const [filterName, setFilterName] = useState("");
    const [filterType, setFilterType] = useState("");

    // Estados para el CRUD
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);

    // 1. CARGAR DATOS REALES
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                // Asegúrate de que import.meta.env.VITE_BACKEND_URL esté definido en tu .env
                const resp = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/restaurants");
                if (resp.ok) {
                    const data = await resp.json();
                    dispatch({ type: "set_restaurants", payload: data });
                }
            } catch (error) {
                console.error("Error al cargar:", error);
            }
        };
        fetchRestaurants();
    }, []);

    // Filtramos usando store.restaurants (que ahora viene de la base de datos real)
    const restaurantsList = store.restaurants || [];
    const filtered = restaurantsList.filter(r =>
        r.name.toLowerCase().includes(filterName.toLowerCase()) &&
        r.food_type.toLowerCase().includes(filterType.toLowerCase())
    );

    // 2. MANEJAR EL FORMULARIO
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingId
            ? `${import.meta.env.VITE_BACKEND_URL}/api/restaurants/${editingId}`
            : `${import.meta.env.VITE_BACKEND_URL}/api/restaurants`;

        const method = editingId ? "PUT" : "POST";

        try {
            const resp = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
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
                // Limpiar y cerrar formulario
                setFormData(initialFormState);
                setEditingId(null);
                setShowForm(false);
            } else {
                alert("Error al guardar el restaurante");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    // 3. ACCIONES DE BOTONES
    const handleEditClick = (restaurant) => {
        setFormData({
            name: restaurant.name,
            image_url: restaurant.image_url || "",
            food_type: restaurant.food_type,
            cuisine_origin: restaurant.cuisine_origin,
            city: restaurant.city,
            description: restaurant.description || ""
        });
        setEditingId(restaurant.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" }); // Sube al usuario al formulario
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Seguro que quieres eliminar este restaurante permanentemente?")) {
            try {
                const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/${id}`, {
                    method: "DELETE"
                });
                if (resp.ok) {
                    dispatch({ type: "delete_restaurant", payload: id });
                    alert("Eliminado con éxito");
                }
            } catch (error) {
                console.error("Error eliminando:", error);
            }
        }
    };

    return (
        <div className="container-fluid bg-fc-dark text-fc-light min-vh-100 p-4">
            {/* Header y Contadores */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="text-fc-red fw-bold">Admin Dashboard</h1>
                    <p className="text-secondary">
                        Mostrando {filtered.length} de {restaurantsList.length} restaurantes totales
                    </p>
                </div>
                <button
                    className="btn btn-fc-red btn-lg"
                    onClick={() => {
                        setFormData(initialFormState);
                        setEditingId(null);
                        setShowForm(!showForm);
                    }}
                >
                    {showForm ? "Cerrar Formulario" : "+ Crear Restaurante"}
                </button>
            </div>

            {/* FORMULARIO DESPLEGABLE */}
            {showForm && (
                <div className="card bg-dark text-light border-secondary mb-4 p-4 shadow">
                    <h3 className="text-fc-red mb-3">{editingId ? "Editar Restaurante" : "Nuevo Restaurante"}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <label className="form-label">Nombre</label>
                                <input type="text" name="name" className="form-control bg-secondary text-light border-0" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label">URL de la Imagen</label>
                                <input type="text" name="image_url" className="form-control bg-secondary text-light border-0" value={formData.image_url} onChange={handleChange} />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Tipo de Comida</label>
                                <input type="text" name="food_type" className="form-control bg-secondary text-light border-0" placeholder="Ej: Pasta, Sushi" value={formData.food_type} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Origen (Cocina)</label>
                                <input type="text" name="cuisine_origin" className="form-control bg-secondary text-light border-0" placeholder="Ej: Italiana" value={formData.cuisine_origin} onChange={handleChange} required />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label">Ciudad</label>
                                <input type="text" name="city" className="form-control bg-secondary text-light border-0" value={formData.city} onChange={handleChange} required />
                            </div>
                            <div className="col-12">
                                <label className="form-label">Descripción</label>
                                <textarea name="description" className="form-control bg-secondary text-light border-0" rows="2" value={formData.description} onChange={handleChange}></textarea>
                            </div>
                        </div>
                        <div className="mt-4">
                            <button type="submit" className="btn btn-success me-2">
                                {editingId ? "Guardar Cambios" : "Crear Restaurante"}
                            </button>
                            <button type="button" className="btn btn-outline-light" onClick={() => setShowForm(false)}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Barras de Búsqueda */}
            <div className="row g-3 mb-4 bg-dark p-3 rounded shadow-sm">
                <div className="col-md-6">
                    <input
                        type="text" className="form-control bg-fc-light"
                        placeholder="Buscar por nombre..."
                        onChange={(e) => setFilterName(e.target.value)}
                    />
                </div>
                <div className="col-md-6">
                    <select className="form-select" onChange={(e) => setFilterType(e.target.value)}>
                        <option value="">Todos los tipos de comida</option>
                        {/* Se generan las opciones de forma dinámica según lo que haya en la BD */}
                        {[...new Set(restaurantsList.map(r => r.food_type))].map((type, index) => (
                            <option key={index} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabla de Gestión */}
            <div className="table-responsive card bg-dark text-light border-secondary">
                <table className="table table-dark table-hover mb-0">
                    <thead>
                        <tr className="text-fc-red">
                            <th>Nombre</th>
                            <th>Ciudad</th>
                            <th>Tipo</th>
                            <th>Score</th>
                            <th className="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4">No hay restaurantes que coincidan con la búsqueda.</td></tr>
                        ) : (
                            filtered.map(r => (
                                <tr key={r.id}>
                                    <td>{r.name}</td>
                                    <td>{r.city}</td>
                                    <td><span className="badge bg-secondary">{r.food_type}</span></td>
                                    <td className="fw-bold">{r.score}</td>
                                    <td className="text-end">
                                        <button
                                            className="btn btn-sm btn-outline-warning me-2"
                                            onClick={() => handleEditClick(r)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(r.id)}
                                        >
                                            Eliminar
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