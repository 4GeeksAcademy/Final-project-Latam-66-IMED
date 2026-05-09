import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

export const AdminRestaurantForm = ({
    formData, setFormData, handleChange, handleSubmit, editingId,
    setShowForm, isUploading, uploadImageToCloudinary
}) => {
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);
    const [isLoadingCities, setIsLoadingCities] = useState(false);

    // 1. Cargar la lista de países al montar el componente
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch("https://countriesnow.space/api/v0.1/countries/iso");
                const data = await response.json();
                if (!data.error) {
                    // Ordenamos alfabéticamente para mejor experiencia de usuario
                    const sortedCountries = data.data.sort((a, b) => a.name.localeCompare(b.name));
                    setCountries(sortedCountries);
                }
            } catch (error) {
                console.error("Error cargando países:", error);
                toast.error("No se pudo cargar la lista de países");
            }
        };
        fetchCountries();
    }, []);

    // 2. Cargar ciudades cuando cambie el país seleccionado
    useEffect(() => {
        const fetchCities = async () => {
            if (!formData.country) {
                setCities([]);
                return;
            }

            setIsLoadingCities(true);
            try {
                const response = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ country: formData.country })
                });
                const data = await response.json();
                if (!data.error) {
                    setCities(data.data.sort());
                } else {
                    setCities([]);
                }
            } catch (error) {
                console.error("Error cargando ciudades:", error);
                setCities([]);
            } finally {
                setIsLoadingCities(false);
            }
        };

        fetchCities();
    }, [formData.country]);

    // Interceptar cambio de país para resetear ciudad
    const handleCountryChange = (e) => {
        handleChange(e);
        setFormData(prev => ({ ...prev, city: "" })); // Limpia la ciudad previa
    };

    return (
        <div className="card bg-dark text-light border-secondary mb-4 p-4 shadow rounded-4">
            <h3 className="mb-4 fw-bold" style={{ color: "#D32F2F" }}>
                {editingId ? "Editar Restaurante" : "Nuevo Restaurante"}
            </h3>
            <form onSubmit={handleSubmit}>
                <div className="row g-3">
                    {/* Campos de Nombre y Foto (Mantener igual que antes) */}
                    <div className="col-md-6">
                        <label className="form-label text-light fs-8 fw-bold">Nombre</label>
                        <input type="text" placeholder="Nombre del Restaurante" name="name" className="form-control bg-secondary text-white fw-bold border-0" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label text-light fs-8 fw-bold">Foto del Restaurante</label>
                        <input type="file" className="form-control bg-secondary text-white fw-bold border-0" accept="image/*" disabled={isUploading}
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    const url = await uploadImageToCloudinary(file);
                                    if (url) {
                                        setFormData({ ...formData, image_url: url });
                                        toast.success("Imagen lista 📸");
                                    }
                                }
                            }}
                        />
                        {isUploading && <div className="text-info mt-2 small fw-bold"><i className="fas fa-spinner fa-spin me-2"></i> Subiendo...</div>}
                    </div>

                    {/* Fila de Score, Tipo y Origen */}
                    <div className="col-md-4">
                        <label className="form-label text-light fs-8 fw-bold">Score (0-100)</label>
                        <input type="number" name="score" className="form-control bg-secondary text-white fw-bold border-0" value={formData.score} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label text-light fs-8 fw-bold">Tipo de Comida</label>
                        <input type="text" name="food_type" className="form-control bg-secondary text-white fw-bold border-0" value={formData.food_type} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label text-light fs-8 fw-bold">Origen (Cocina)</label>
                        <input type="text" name="cuisine_origin" className="form-control bg-secondary text-white fw-bold border-0" value={formData.cuisine_origin} onChange={handleChange} required />
                    </div>

                    {/* SELECT DE PAÍS DINÁMICO */}
                    <div className="col-md-6">
                        <label className="form-label text-light fs-8 fw-bold">País</label>
                        <select
                            name="country"
                            className="form-select bg-secondary text-white fw-bold border-0"
                            value={formData.country}
                            onChange={handleCountryChange}
                            required
                        >
                            <option value="">{countries.length > 0 ? "Selecciona un país" : "Cargando países..."}</option>
                            {countries.map(c => (
                                <option key={c.iso2} value={c.name}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* SELECT DE CIUDAD DINÁMICO */}
                    <div className="col-md-6">
                        <label className="form-label text-light fs-8 fw-bold">
                            Ciudad {isLoadingCities && <i className="fas fa-spinner fa-spin ms-1"></i>}
                        </label>
                        <select
                            name="city"
                            className="form-select bg-secondary text-white fw-bold border-0"
                            value={formData.city}
                            onChange={handleChange}
                            required
                            disabled={!formData.country || isLoadingCities}
                        >
                            <option value="">
                                {!formData.country ? "Primero elige un país" : isLoadingCities ? "Cargando ciudades..." : "Selecciona una ciudad"}
                            </option>
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    {/* Latitud, Longitud y Descripción (Mantener igual) */}
                    <div className="col-md-6">
                        <label className="form-label text-light fs-8 fw-bold">Latitud</label>
                        <input type="number" step="any" name="latitud" className="form-control bg-secondary text-white fw-bold border-0" value={formData.latitud} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label text-light fs-8 fw-bold">Longitud</label>
                        <input type="number" step="any" name="longitud" className="form-control bg-secondary text-white fw-bold border-0" value={formData.longitud} onChange={handleChange} />
                    </div>
                    <div className="col-12">
                        <label className="form-label text-light fs-8 fw-bold">Descripción</label>
                        <textarea name="description" className="form-control bg-secondary text-white fw-bold border-0" rows="3" value={formData.description} onChange={handleChange}></textarea>
                    </div>
                </div>

                <div className="mt-4">
                    <button type="submit" className="btn text-white me-3 px-4 py-2 fw-bold" style={{ backgroundColor: "#D32F2F" }} disabled={isUploading}>
                        {editingId ? "Guardar Cambios" : "Crear Restaurante"}
                    </button>
                    <button type="button" className="btn btn-outline-light px-4 py-2 fw-bold" onClick={() => setShowForm(false)}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};