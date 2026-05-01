import React from "react";
import imgDiego from "../assets/img/diego.jpeg";
import imgEdgar from "../assets/img/edgar.jpeg";
import imgIgnacio from "../assets/img/ignacio.jpeg";
import imgMiguel from "../assets/img/miguel.png";

export const AboutUs = () => {
    const team = [
        { name: "Edgar Cuenca", role: "Full Stack Developer", desc: "Soy Edgar Cuenca Hernandez, originario de Toluca, Estado de México, tengo 37 años, mi sueño es convertirme en programador full stack. Actualmente, me encuentro en etapa de transformación, sumergiéndome en el dominio de las herramientas necesarias para dominar tanto el front-end como el back-end, convencido de que mi dedicación y perseverancia son ventajas para resolver problemas complejos de manera eficiente. ", img: imgEdgar },

        { name: "Diego Luna", role: "Frontend Developer", desc: "Soy Diego Luna, Ingeniero Mecatrónico en formación como desarrollador Full Stack. Me motiva enfrentarme a retos técnicos que exigen persistencia y un análisis detallado, encontrando una satisfacción genuina en el proceso de dominar conceptos complejos por cuenta propia. Actualmente combino mi base técnica con un aprendizaje intensivo y autodidacta.", img: imgDiego },

        { name: "Ignacio Pinto", role: "Backend Developer", desc: "Soy Ignacio Pinto, ingeniero civil venezolano nacido en Maracaibo, Zulia, y un apasionado desarrollador Full Stack. A mis 35 años, combino mi experiencia profesional trabajando de forma remota para empresas estadounidenses con mi entusiasmo por el aprendizaje continuo y la creación de soluciones digitales.", img: imgIgnacio },

        { name: "Miguel Vasquez", role: "UX/UI Designer", desc: "Soy Miguel Vasquez, de Caracas - Venezuela, un entusiasta de la tecnología enfocado en la Experiencia de Usuario y el Diseño de Interfaces (UX/UI). Mi mayor satisfacción es resolver problemas estructurados combinando la creatividad visual con el desarrollo técnico. Me considero un profesional detallista y autodidacta, siempre buscando que la interacción entre las personas y el software sea lo más fluida, moderna y eficiente posible.", img: imgMiguel },
    ];

    const techs = [
        { icon: "fab fa-react", name: "React" },
        { icon: "fab fa-python", name: "Python" },
        { icon: "fas fa-database", name: "SQLAlchemy" },
        { icon: "fab fa-js", name: "JavaScript" },
        { icon: "fab fa-bootstrap", name: "Bootstrap" },
        { icon: "fab fa-git-alt", name: "Git" }
    ];
    return (
        <div className="container-fluid text-light py-5" style={{ backgroundColor: "#121212", minHeight: "100vh" }}>
            <div className="container">
                {/* Hero Section */}
                <div className="text-center mb-5 animate__animated animate__fadeIn">
                    <h1 className="display-4 fw-bold text-danger">Nuestra Misión</h1>
                    <p className="lead text-white-50">Conectando paladares con experiencias inolvidables.</p>
                </div>

                {/* Qué problema resolvemos */}
                <div className="row align-items-center mb-5 py-4 border-bottom border-secondary">
                    <div className="col-md-6 mb-4 mb-md-0 text-center">
                        <i className="fas fa-utensils text-danger" style={{ fontSize: "150px" }}></i>
                    </div>
                    <div className="col-md-6">
                        <h2 className="fw-bold mb-3">¿Por qué creamos este proyecto?</h2>
                        <p className="fs-5">
                            Sabemos lo difícil que es para un turista o un residente local descubrir un lugar nuevo que realmente valga la pena.
                            Atacamos ese nicho de buscadores de <strong>gastronomía auténtica</strong> que quieren evitar las "trampas para turistas".
                        </p>
                        <p className="text-white-50">
                            Ahorramos tu tiempo permitiéndote filtrar por las mejores críticas de comensales reales, asegurando que cada visita a un restaurante sea un éxito garantizado.
                        </p>
                    </div>
                </div>

                {/* Equipo */}
                <div className="text-center mb-5 py-4">
                    <h2 className="fw-bold mb-5"><i className="fas fa-users text-danger me-2"></i>El Equipo detrás de la magia</h2>
                    <div className="row g-4 justify-content-center">
                        {team.map((member, index) => (
                            <div className="col-md-6 col-lg-3" key={index}>
                                <div className="card bg-dark border-secondary h-100 p-4 shadow-lg" style={{ transition: "transform 0.3s ease", cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-10px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                                    <img src={member.img} className="card-img-top rounded-circle mb-3 mx-auto shadow border border-3 border-danger" alt={member.name} style={{ width: "120px", height: "120px", objectFit: "cover" }} />
                                    <div className="card-body p-0">
                                        <h4 className="card-title text-light fw-bold">{member.name}</h4>
                                        <h6 className="card-subtitle mb-3 text-danger fw-bold">{member.role}</h6>
                                        <p className="card-text text-white-50 small">{member.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Tecnologías */}
                <div className="text-center py-5 rounded-4" style={{ backgroundColor: "#1a1a1a" }}>
                    <h4 className="fw-bold mb-4">Construido con las mejores tecnologías</h4>
                    <div className="d-flex justify-content-center flex-wrap gap-5">
                        {techs.map((t, index) => (
                            <div key={index} className="text-center">
                                <i className={`${t.icon} fs-1 text-danger mb-2 d-block`}></i>
                                <span className="small text-white-50">{t.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};