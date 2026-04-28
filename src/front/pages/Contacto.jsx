import React from "react";

export const Contacto = () => {
    // Lista de integrantes del equipo
    const team = [
        { name: "Edgar Cuenca", role: "Full Stack Developer" },
        { name: "Diego Luna", role: "Full Stack Developer" },
        { name: "Ignacio Pinto", role: "Full Stack Developer" },
        { name: "Miguel Vasquez", role: "Full Stack Developer" }
    ];

    return (
        <div className="container py-5 mt-4" style={{ minHeight: "75vh" }}>
            <div className="text-center mb-5">
                <h1 className="fw-bold mb-3" style={{ color: "var(--fc-dark)" }}>
                    <span className="text-fc-red">Nuestro</span> Equipo
                </h1>
                <p className="lead" style={{ color: "var(--fc-dark)" }}>
                    Conoce a los desarrolladores del equipo <strong>latam-pt-66-IMED</strong> de <strong>4Geeks Academy</strong> detrás de la magia de FlavorCritic.
                </p>
            </div>

            <div className="row g-4 justify-content-center mt-3">
                {team.map((member, index) => (
                    <div key={index} className="col-12 col-sm-6 col-lg-3">
                        <div
                            className="card h-100 border-0 shadow-sm rounded-4 text-center p-4 bg-white"
                            style={{ transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = "translateY(-8px)";
                                e.currentTarget.style.boxShadow = "0 10px 20px rgba(129, 0, 0, 0.1)";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
                            }}
                        >
                            {/* Avatar circular con la inicial del nombre */}
                            <div
                                className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm"
                                style={{ width: "80px", height: "80px", backgroundColor: "var(--fc-dark)", color: "var(--fc-light)" }}
                            >
                                <span className="fs-2 fw-bold">{member.name.charAt(0)}</span>
                            </div>

                            <h5 className="fw-bold mb-1 text-truncate" style={{ color: "var(--fc-dark)" }}>
                                {member.name}
                            </h5>
                            <p className="text-muted small mb-0">
                                <i className="fas fa-laptop-code me-2" style={{ color: "var(--fc-red)" }}></i>
                                {member.role}
                            </p>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};