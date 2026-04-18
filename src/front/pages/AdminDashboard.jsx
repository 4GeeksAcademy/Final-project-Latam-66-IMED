import React, { useState, useEffect } from "react";

export const AdminDashboard = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [filterName, setFilterName] = useState("");
    const [filterType, setFilterType] = useState("");

    useEffect(() => {
        // Aquí llamarías a tu API: fetch(process.env.BACKEND_URL + "/api/restaurants")
        // Por ahora simulamos datos para que veas el diseño
        const mockData = [
            { id: 1, name: "Pizza Palace", food_type: "Italiana", location: "Madrid", score: 85 },
            { id: 2, name: "Sushi Zen", food_type: "Japonesa", location: "Barcelona", score: 92 },
        ];
        setRestaurants(mockData);
    }, []);

    const filtered = restaurants.filter(r => 
        r.name.toLowerCase().includes(filterName.toLowerCase()) &&
        r.food_type.toLowerCase().includes(filterType.toLowerCase())
    );

    return (
        <div className="container-fluid bg-fc-dark text-fc-light min-vh-100 p-4">
            {/* Header y Contadores */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="text-fc-red fw-bold">Admin Dashboard</h1>
                    <p className="text-secondary">
                        Mostrando {filtered.length} de {restaurants.length} restaurantes totales
                    </p>
                </div>
                <button className="btn btn-fc-red btn-lg">+ Crear Restaurante</button>
            </div>

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
                        <option value="Italiana">Italiana</option>
                        <option value="Japonesa">Japonesa</option>
                    </select>
                </div>
            </div>

            {/* Tabla de Gestión */}
            <div className="table-responsive card bg-dark text-light border-secondary">
                <table className="table table-dark table-hover mb-0">
                    <thead>
                        <tr className="text-fc-red">
                            <th>Nombre</th>
                            <th>Ubicación</th>
                            <th>Tipo</th>
                            <th>Score</th>
                            <th className="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(r => (
                            <tr key={r.id}>
                                <td>{r.name}</td>
                                <td>{r.location}</td>
                                <td><span className="badge bg-secondary">{r.food_type}</span></td>
                                <td className="fw-bold">{r.score}</td>
                                <td className="text-end">
                                    <button className="btn btn-sm btn-outline-warning me-2">Editar</button>
                                    <button className="btn btn-sm btn-outline-danger">Eliminar</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};