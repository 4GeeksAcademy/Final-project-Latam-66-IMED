import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

export const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Si el backend devuelve un 201, redirigimos al login
                toast.success("¡Cuenta creada con éxito! Bienvenid@ a FlavorCritic 🍔");
                navigate("/login");
            } else {
                // Mostramos el error devuelto por la API 
                toast.error(data.msg || "Error al registrar el usuario");
            }
        } catch (err) {
            // Alerta de ERROR de conexión (si el servidor esta apagado)
            toast.error("Error de conexión con el servidor 🔌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container min-vh-100 d-flex justify-content-center align-items-center py-5">
            <div
                className="card bg-fc-dark text-fc-light w-100 shadow-lg"
                style={{ maxWidth: "450px", border: "1px solid var(--fc-red)" }}
            >
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold">
                            <span className="text-fc-red">Sign</span> Up
                        </h2>
                        <p className="text-secondary small">Crea tu cuenta en FlavorCritic</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="emailInput" className="form-label text-secondary small mb-1">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                id="emailInput"
                                className="form-control"
                                style={{ backgroundColor: "var(--fc-light)", color: "var(--fc-dark)", border: "none" }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                placeholder="usuario@ejemplo.com"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="passwordInput" className="form-label text-secondary small mb-1">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                id="passwordInput"
                                className="form-control"
                                style={{ backgroundColor: "var(--fc-light)", color: "var(--fc-dark)", border: "none" }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                minLength={6}
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-fc-red w-100 fw-bold py-2 mb-3"
                            disabled={loading}
                        >
                            {loading ? "Registrando..." : "Crear Cuenta"}
                        </button>

                        <div className="text-center small mt-3">
                            ¿Ya tienes cuenta? <Link to="/login" className="text-fc-red text-decoration-none fw-bold">Inicia sesión</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};