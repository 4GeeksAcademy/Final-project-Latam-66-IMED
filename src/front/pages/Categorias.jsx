import React, { useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

const optimizePexels = (url) => {
    if (!url.includes("pexels.com")) return url;
    const baseUrl = url.split("?")[0];
    return `${baseUrl}?auto=compress&cs=tinysrgb&fit=crop&h=400&w=400`;
};

// Diccionario de imágenes
const imageDictionary = {
    "Alemana": optimizePexels("https://images.pexels.com/photos/33753896/pexels-photo-33753896.jpeg"),
    "Austríaca": optimizePexels("https://images.pexels.com/photos/33859572/pexels-photo-33859572.jpeg"),
    "Belga": optimizePexels("https://images.pexels.com/photos/18857730/pexels-photo-18857730.jpeg"),
    "Danesa": optimizePexels("https://images.pexels.com/photos/37308545/pexels-photo-37308545.jpeg"),
    "Española": optimizePexels("https://images.pexels.com/photos/36878063/pexels-photo-36878063.jpeg"),
    "Finlandesa": optimizePexels("https://images.pexels.com/photos/32112098/pexels-photo-32112098.jpeg"),
    "Francesa": optimizePexels("https://images.pexels.com/photos/27304303/pexels-photo-27304303.jpeg"),
    "Griega": optimizePexels("https://images.pexels.com/photos/5864352/pexels-photo-5864352.jpeg"),
    "Irlandesa": optimizePexels("https://images.pexels.com/photos/15913598/pexels-photo-15913598.jpeg"),
    "Islandesa": optimizePexels("https://images.pexels.com/photos/7634205/pexels-photo-7634205.jpeg"),
    "Italiana": optimizePexels("https://images.pexels.com/photos/17708242/pexels-photo-17708242.jpeg"),
    "Noruega": optimizePexels("https://images.pexels.com/photos/33673809/pexels-photo-33673809.jpeg"),
    "Neerlandesa": optimizePexels("https://images.pexels.com/photos/28911031/pexels-photo-28911031.jpeg"),
    "Polaca": optimizePexels("https://images.pexels.com/photos/4084925/pexels-photo-4084925.jpeg"),
    "Portuguesa": optimizePexels("https://images.pexels.com/photos/4198421/pexels-photo-4198421.jpeg"),
    "Británica": optimizePexels("https://images.pexels.com/photos/30776098/pexels-photo-30776098.jpeg"),
    "Rusa": optimizePexels("https://images.pexels.com/photos/32020817/pexels-photo-32020817.jpeg"),
    "Sueca": optimizePexels("https://images.pexels.com/photos/33254065/pexels-photo-33254065.jpeg"),
    "Suiza": optimizePexels("https://images.pexels.com/photos/12664804/pexels-photo-12664804.jpeg"),
    "Turca": optimizePexels("https://images.pexels.com/photos/18330996/pexels-photo-18330996.jpeg"),
    "Argentina": optimizePexels("https://images.pexels.com/photos/37069410/pexels-photo-37069410.jpeg"),
    "Brasileña": optimizePexels("https://images.pexels.com/photos/34234280/pexels-photo-34234280.png"),
    "Canadiense": optimizePexels("https://images.pexels.com/photos/35896261/pexels-photo-35896261.jpeg"),
    "Chilena": optimizePexels("https://images.pexels.com/photos/37342041/pexels-photo-37342041.jpeg"),
    "Colombiana": optimizePexels("https://images.pexels.com/photos/37024910/pexels-photo-37024910.jpeg"),
    "Costarricense": optimizePexels("https://images.pexels.com/photos/29450678/pexels-photo-29450678.jpeg"),
    "Cubana": optimizePexels("https://images.pexels.com/photos/16931501/pexels-photo-16931501.jpeg"),
    "Ecuatoriana": optimizePexels("https://images.pexels.com/photos/28490852/pexels-photo-28490852.jpeg"),
    "Estadounidense": optimizePexels("https://images.pexels.com/photos/12325094/pexels-photo-12325094.jpeg"),
    "Jamaiquina": optimizePexels("https://images.pexels.com/photos/27556985/pexels-photo-27556985.jpeg"),
    "Mexicana": optimizePexels("https://images.pexels.com/photos/12034501/pexels-photo-12034501.jpeg"),
    "Panameña": optimizePexels("https://images.pexels.com/photos/37039787/pexels-photo-37039787.jpeg"),
    "Peruana": optimizePexels("https://images.pexels.com/photos/31495671/pexels-photo-31495671.jpeg"),
    "Uruguaya": optimizePexels("https://images.pexels.com/photos/11957828/pexels-photo-11957828.jpeg"),
    "Venezolana": optimizePexels("https://images.pexels.com/photos/29496088/pexels-photo-29496088.jpeg"),
    "Australiana": optimizePexels("https://images.pexels.com/photos/7368043/pexels-photo-7368043.jpeg"),
    "Saudí": optimizePexels("https://images.pexels.com/photos/17650198/pexels-photo-17650198.jpeg"),
    "China": optimizePexels("https://images.pexels.com/photos/16211353/pexels-photo-16211353.jpeg"),
    "Coreana": optimizePexels("https://images.pexels.com/photos/7491952/pexels-photo-7491952.jpeg"),
    "Emiratí": optimizePexels("https://images.pexels.com/photos/18177331/pexels-photo-18177331.jpeg"),
    "India": optimizePexels("https://images.pexels.com/photos/29089211/pexels-photo-29089211.jpeg"),
    "Indonesa": optimizePexels("https://images.pexels.com/photos/8570300/pexels-photo-8570300.jpeg"),
    "Israelí": optimizePexels("https://images.pexels.com/photos/28992227/pexels-photo-28992227.jpeg"),
    "Japonesa": optimizePexels("https://images.pexels.com/photos/28291554/pexels-photo-28291554.jpeg"),
    "Neozelandesa": optimizePexels("https://images.pexels.com/photos/17377699/pexels-photo-17377699.jpeg"),
    "Singapurense": optimizePexels("https://images.pexels.com/photos/9772442/pexels-photo-9772442.jpeg"),
    "Tailandesa": optimizePexels("https://images.pexels.com/photos/12188535/pexels-photo-12188535.jpeg"),
    "Egipcia": optimizePexels("https://images.pexels.com/photos/10445962/pexels-photo-10445962.jpeg"),
    "Marroquí": optimizePexels("https://images.pexels.com/photos/30459912/pexels-photo-30459912.jpeg"),
    "Sudafricana": optimizePexels("https://images.pexels.com/photos/35470468/pexels-photo-35470468.jpeg"),
};

const defaultImage = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80";

export const Categorias = () => {
    const navigate = useNavigate();
    
    // IMPORTANTE: Asignamos "{}" por si el hook de reducer aún no ha cargado completamente
    const { store, dispatch } = useGlobalReducer() || {};

    // EFECTO DE RESCATE: Busca restaurantes si llegamos a la página vacía
    useEffect(() => {
        if (!store?.restaurants || store.restaurants.length === 0) {
            const fetchRestaurants = async () => {
                try {
                    const resp = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/restaurants");
                    if (resp.ok) {
                        const data = await resp.json();
                        dispatch({ type: "set_restaurants", payload: data });
                    }
                } catch (error) {
                    console.error("Error cargando:", error);
                }
            };
            fetchRestaurants();
        }
    }, []);

    // Calculamos la lista protegiendo todas las lecturas con "?."
    const categoriasList = useMemo(() => {
        const restaurants = store?.restaurants || [];
        
        // Extraemos solo los tipos de comida, filtramos vacíos y nulos, y quitamos duplicados
        const uniqueFoodTypes = [...new Set(restaurants.map(r => r?.food_type).filter(Boolean))];
        
        const dynamicCategories = uniqueFoodTypes.map(type => ({
            name: type,
            img: imageDictionary[type] ? optimizePexels(imageDictionary[type]) : defaultImage 
        }));

        // Mezclamos al azar
        return dynamicCategories.sort(() => Math.random() - 0.5);
    }, [store?.restaurants]); 

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

                {/* Si está cargando o no hay categorías, mostramos este mensaje */}
                {!store?.restaurants || categoriasList.length === 0 ? (
                    <div className="text-center py-5">
                        <i className="fas fa-utensils fs-1 text-muted mb-3 d-block"></i>
                        <h4 className="text-muted">Cargando categorías...</h4>
                    </div>
                ) : (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
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
                                    <img src={cat.img} alt={cat.name} loading="lazy" className="position-absolute w-100 h-100 object-fit-cover" />
                                    <div className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}>
                                        <h3 className="text-white fw-bold mb-0 text-uppercase tracking-wider text-center px-2" style={{ letterSpacing: "2px" }}>
                                            {cat.name}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};