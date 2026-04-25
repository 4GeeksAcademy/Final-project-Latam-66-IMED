import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialCategories = [
    { name: "Mexicana", img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=800&q=80" },
    { name: "Italiana", img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80" },
    { name: "Japonesa", img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80" },
    { name: "Estadounidense", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80" },
    { name: "Coreana", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80" },
    { name: "Francesa", img: "https://images.pexels.com/photos/33674416/pexels-photo-33674416.jpeg" }
];

export const Categorias = () => {
    const navigate = useNavigate();

    // Inicializamos el estado mezclando el arreglo original al azar
    // Usar una función dentro de useState garantiza que la mezcla solo ocurra una vez al cargar la página
    const [categoriasList] = useState(() => 
        [...initialCategories].sort(() => Math.random() - 0.5)
    );

    const handleCategoryClick = (categoryName) => {
        navigate("/", { state: { selectedCategory: categoryName } });
    };

    return (
        <div className="container-fluid py-5" style={{ backgroundColor: "#fdfdfd", minHeight: "80vh" }}>
            <div className="container">
                <div className="text-center mb-5">
                    <h1 className="fw-bold" style={{ color: "var(--fc-dark)" }}>¿Qué se te antoja hoy?</h1>
                    <p className="text-muted fs-5">Explora los mejores sabores agrupados para ti.</p>
                </div>

                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {/* Mapeamos la lista ya mezclada */}
                    {categoriasList.map((cat, index) => (
                        <div key={index} className="col">
                            <div 
                                onClick={() => handleCategoryClick(cat.name)}
                                className="ratio ratio-1x1 rounded-4 overflow-hidden shadow-sm position-relative"
                                style={{ cursor: "pointer", transition: "transform 0.3s ease, box-shadow 0.3s ease" }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = "translateY(-5px)";
                                    e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.2)";
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
                                }}
                            >
                                <img src={cat.img} alt={cat.name} className="position-absolute w-100 h-100 object-fit-cover" />
                                <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}>
                                    <h3 className="text-white fw-bold mb-0 text-uppercase tracking-wider" style={{ letterSpacing: "2px" }}>
                                        {cat.name}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};