import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export const Login = () => {
    // 1. Definimos los estados, tal como lo hiciste en el Signup
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // 2. Apuntamos al endpoint de login
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // 3. ¡Paso crucial! Guardamos el token de autenticación
                // Asumiendo que tu backend devuelve el token bajo la propiedad 'access_token'
                sessionStorage.setItem("token", data.access_token);
                sessionStorage.setItem("role", data.role); // Guardamos el rol

                if (data.role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/");
                }
            } else {
                setError(data.msg || "Credenciales inválidas. Inténtalo de nuevo.");
            }
        } catch (err) {
            setError("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container min-vh-100 d-flex justify-content-center align-items-center py-5">
            {/* Usamos las mismas clases de tu paleta: bg-fc-dark, text-fc-light, etc. */}
            <div
                className="card bg-fc-dark text-fc-light w-100 shadow-lg"
                style={{ maxWidth: "450px", border: "1px solid var(--fc-red)" }}
            >
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold">
                            <span className="text-fc-red">Log</span> In
                        </h2>
                        <p className="text-secondary small">Bienvenido de nuevo a FlavorCritic</p>
                    </div>

                    {error && (
                        <div className="alert alert-danger py-2 px-3 small border-0 text-center" role="alert">
                            {error}
                        </div>
                    )}

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
                                autoComplete="current-password"
                                placeholder="Tu contraseña"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-fc-red w-100 fw-bold py-2 mb-3"
                            disabled={loading}
                        >
                            {loading ? "Iniciando sesión..." : "Ingresar"}
                        </button>

                        <div className="text-center small mt-3">
                            ¿No tienes cuenta? <Link to="/signup" className="text-fc-red text-decoration-none fw-bold">Regístrate aquí</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};