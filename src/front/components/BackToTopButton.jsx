import React, { useState, useEffect } from "react";

export const BackToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Escuchamos el scroll para mostrar u ocultar el botón
    useEffect(() => {
        const toggleVisibility = () => {
            // Si bajamos más de 300px, mostramos el botón
            if (window.scrollY > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    // Función que hace el scroll suave hacia arriba
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    return (
        <>
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="btn btn-fc-red shadow-lg"
                    style={{
                        position: "fixed",
                        bottom: "30px",
                        right: "30px",
                        zIndex: 1050,
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%", // Lo hace completamente redondo
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        transition: "opacity 0.3s ease, transform 0.3s ease",
                        animation: "fadeIn 0.3s" // Aparece suavemente
                    }}
                    title="Volver arriba"
                >
                    {/* Usamos un ícono de flecha de FontAwesome */}
                    <i className="fas fa-arrow-up fs-5 text-white"></i>
                </button>
            )}
        </>
    );
};