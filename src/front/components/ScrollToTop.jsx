import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// Este componente fuerza el scroll hacia arriba cada vez que cambia la ruta (pathname)
const ScrollToTop = ({ children }) => {
    const location = useLocation(); // para obtenr la ubicación actual directamente de React Router

    useEffect(() => {
        // Cada vez que location.pathname cambie,  el scroll sube a X:0, Y:0
        window.scrollTo(0, 0);
    }, [location.pathname]); 

    return children;
};

export default ScrollToTop;

ScrollToTop.propTypes = {
    children: PropTypes.any
};