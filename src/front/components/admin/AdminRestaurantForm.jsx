import React from "react";
import toast from "react-hot-toast";

export const AdminRestaurantForm = ({ 
    formData, setFormData, handleChange, handleSubmit, editingId, 
    setShowForm, isUploading, uploadImageToCloudinary 
}) => {
    return (
        <div className="card bg-dark text-light border-secondary mb-4 p-4 shadow rounded-4">
            <h3 className="mb-4 fw-bold" style={{ color: "#D32F2F" }}>{editingId ? "Editar Restaurante" : "Nuevo Restaurante"}</h3>
            <form onSubmit={handleSubmit}>
                <div className="row g-3">
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
                        {formData.image_url && !isUploading && (
                            <div className="mt-2 d-flex align-items-center gap-2">
                                <img src={formData.image_url} alt="Previa" className="img-thumbnail bg-dark border-secondary" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px" }} />
                            </div>
                        )}
                    </div>
                    <div className="col-md-4">
                        <label className="form-label text-light fs-8 fw-bold">Score (Rating 0-100)</label>
                        <input type="number" name="score" className="form-control bg-secondary text-white fw-bold border-0" value={formData.score} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label text-light fs-8 fw-bold">Tipo de Comida</label>
                        <input type="text" placeholder="Tipo de Comida" name="food_type" className="form-control bg-secondary text-white fw-bold border-0" value={formData.food_type} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label text-light fs-8 fw-bold">Origen (Cocina)</label>
                        <input type="text" placeholder="Origen de la Comida (tipo)" name="cuisine_origin" className="form-control bg-secondary text-white fw-bold border-0" value={formData.cuisine_origin} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label text-light fs-8 fw-bold">País</label>
                        <input type="text" placeholder="Pais Ej: Alemania" name="country" className="form-control bg-secondary text-white fw-bold border-0" value={formData.country} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label text-light fs-8 fw-bold">Ciudad</label>
                        <input type="text" placeholder="Ciudad Ej: Berlin" name="city" className="form-control bg-secondary text-white fw-bold border-0" value={formData.city} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label text-light fs-8 fw-bold">Latitud</label>
                        <input type="number" placeholder="Ej: 10.540" step="any" name="latitud" className="form-control bg-secondary text-white fw-bold border-0" value={formData.latitud} onChange={handleChange} />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label text-light fs-8 fw-bold">Longitud</label>
                        <input type="number" placeholder="Ej: -75.500" step="any" name="longitud" className="form-control bg-secondary text-white fw-bold border-0" value={formData.longitud} onChange={handleChange} />
                    </div>
                    <div className="col-12">
                        <label className="form-label text-light fs-8 fw-bold">Descripción</label>
                        <textarea name="description" placeholder="Descripcion del lugar y su comida" className="form-control bg-secondary text-white fw-bold border-0" rows="3" value={formData.description} onChange={handleChange}></textarea>
                    </div>
                </div>
                <div className="mt-4">
                    <button type="submit" className="btn text-white me-3 px-4 py-2 fw-bold fs-8" style={{ backgroundColor: "#D32F2F" }} disabled={isUploading}>
                        {editingId ? "Guardar Cambios" : "Crear Restaurante"}
                    </button>
                    <button type="button" className="btn btn-outline-light px-4 py-2 fw-bold fs-8" onClick={() => setShowForm(false)}>Cancelar</button>
                </div>
            </form>
        </div>
    );
};