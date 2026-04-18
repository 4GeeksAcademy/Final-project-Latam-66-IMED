import React from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { RestaurantCard } from "../components/RestaurantCard";

export const Home = () => {
    const { store } = useGlobalReducer();

    return (
        <div className="container-fluid py-5" style={{ backgroundColor: "#fdfdfd" }}>
            <div className="container">
                <h2 className="fw-bold mb-4" style={{ color: "#333" }}>
                    Destacados en <span style={{ color: "#D32F2F" }}>Caracas</span>
                </h2>

                {/* CONFIGURACIÓN DE COLUMNAS:
                  row-cols-1: Mobile / celular (1 columna)
                  row-cols-sm-2: Tablets/Small (2 columnas)
                  row-cols-md-3: Tablets grandes (3 columnas)
                  row-cols-lg-4: Desktop / PC normal / laptops (4 columnas)
                */}
                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-3">
                    {store.restaurants.map((rest) => (
                        <div key={rest.id} className="col">
                            <RestaurantCard restaurant={rest} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};