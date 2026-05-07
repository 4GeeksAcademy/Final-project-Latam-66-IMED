import React, { useState } from "react";
import toast from "react-hot-toast";

export const Contacto = () => {
    // ESTADO PARA EL FORMULARIO
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });

    // MANEJO DE LOS INPUTS
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // ENVÍO DEL FORMULARIO SIN RECARGAR LA PÁGINA (AJAX)
    const handleSubmit = async (e) => {
        e.preventDefault();

        const submitPromise = fetch("https://formspree.io/f/mkoygbay", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json" // Importante para que Formspree no redirija
            },
            body: JSON.stringify(formData)
        });

        toast.promise(submitPromise, {
            loading: 'Enviando tu mensaje... ⏳',
            success: '¡Mensaje enviado con éxito! Nos pondremos en contacto. 🚀',
            error: 'Hubo un error al enviar el mensaje. ❌'
        }).then((res) => {
            if (res.ok) {
                // Limpiamos el formulario si se envio bien
                setFormData({ name: "", email: "", message: "" });
            }
        }).catch((err) => console.error("Error enviando correo:", err));
    };

    return (
        <div className="container-fluid text-light py-5 animate__animated animate__fadeIn" style={{ backgroundColor: "#121212", minHeight: "100vh" }}>
            <div className="container">

                {/* =========================================
                    FORMULARIO DE CONTACTO
                ========================================= */}
                <div className="row justify-content-center mb-4">
                    <div className="col-md-8 col-lg-6 bg-dark p-5 rounded-4 border border-secondary shadow-lg">
                        <div className="text-center mb-4">
                            <i className="fas fa-paper-plane text-danger fs-1 mb-3"></i>
                            <h2 className="text-light fw-bold">Contáctanos</h2>
                            <p className="text-white-50">¿Tienes dudas, sugerencias o encontraste un bug? Escríbenos directamente a nuestro correo de administración.</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label text-white-50 fw-bold">Nombre Completo</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="form-control fw-bold border-secondary"
                                    placeholder="Ej: Juan Pérez"
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label text-white-50 fw-bold">Correo Electrónico</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-control fw-bold border-secondary"
                                    placeholder="juan@ejemplo.com"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="form-label text-white-50 fw-bold">Tu Mensaje</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="form-control border-secondary"
                                    rows="5"
                                    placeholder="Cuéntanos en qué podemos ayudarte..."
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="btn btn-danger w-100 py-3 fw-bold rounded-pill shadow">
                                <i className="fas fa-envelope me-2"></i> Enviar Mensaje
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};