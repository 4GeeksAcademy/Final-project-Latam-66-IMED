import React from "react";

export const AboutUs = () => {
    return (
        <div className="container py-5" style={{ minHeight: "75vh" }}>
            <div className="row justify-content-center text-center mt-5">
                <div className="col-12 col-md-8 col-lg-6">

                    <h1 className="display-4 fw-bold mb-4" style={{ color: "var(--fc-dark)" }}>
                        <span className="text-fc-red">Sobre </span>Nosotros
                    </h1>

                    <p className="lead mb-4" style={{ color: "var(--fc-dark)" }}>
                        En <strong>FlavorCritic</strong>, creemos que cada comida es una experiencia que merece ser compartida.
                        Nuestra misión es conectar a los amantes de la gastronomía con los mejores restaurantes,
                        creando una comunidad honesta y apasionada por el buen sabor.
                    </p>

                    <div className="p-4 rounded-4 bg-fc-dark text-fc-light mt-5 shadow">
                        <h3 className="text-fc-red mb-3 fw-semibold">Nuestra Visión</h3>
                        <p className="mb-0 fs-5">
                            Convertirnos en la guía de referencia más confiable para descubrir tu próximo plato favorito,
                            apoyando al mismo tiempo a la industria gastronómica local.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};