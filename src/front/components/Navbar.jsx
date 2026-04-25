import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const closeMenu = () => setIsOpen(false);
	const toggleMenu = () => setIsOpen(!isOpen);

	// Estado local exclusivo para la barra de búsqueda del Navbar
    const [navSearch, setNavSearch] = useState("");

	// Rastreamos si el usuario hizo scroll
    const [isScrolled, setIsScrolled] = useState(false);

    const navigate = useNavigate();

    // Traemos la lista de restaurantes desde el estado global
    const { store } = useGlobalReducer();
    const restaurantsList = store.restaurants || [];

	// Verificamos si hay una sesión activa y leemos el rol del usuario
	const token = sessionStorage.getItem("token");
	const role = sessionStorage.getItem("role");

	// Escuchamos el scroll de la ventana
    useEffect(() => {
        const handleScroll = () => {
            // Si bajamos más de 50 pixeles, activamos el estado
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        // Limpiamos el event listener al desmontar
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

	// Función para cerrar sesión
	const handleLogout = () => {
		sessionStorage.removeItem("token");
		sessionStorage.removeItem("role");
		navigate("/");
	};

	// Lógica para filtrar los resultados del Navbar (busca por nombre o tipo de comida)
    const searchResults = navSearch.trim() === "" ? [] : restaurantsList.filter((rest) => {
        const query = navSearch.toLowerCase();
        const name = rest.name ? rest.name.toLowerCase() : "";
        const type = rest.food_type ? rest.food_type.toLowerCase() : "";
        
        return name.includes(query) || type.includes(query);
	});

	return (
		<>
			<nav 
				className={`navbar-custom w-100 sticky-top top-0 ${isScrolled ? "" : "bg-fc-dark"}`} 
                style={{ 
                    zIndex: 1040,
                    // Si está scrolleado, ponemos un negro transparente, sino usamos tu color base
                    backgroundColor: isScrolled ? "rgba(18, 18, 18, 0.85)" : "var(--fc-dark)",
                    // Efecto de vidrio esmerilado para que el fondo se vea borroso al pasar por debajo
                    backdropFilter: isScrolled ? "blur(10px)" : "none",
                    WebkitBackdropFilter: isScrolled ? "blur(10px)" : "none", // Soporte para Safari
                    // Transición suave
                    transition: "background-color 0.3s ease, backdrop-filter 0.3s ease" 
                }}
			>
				<div className="container-fluid px-3 px-md-5">
					<div className="d-flex justify-content-between align-items-center" style={{ height: "64px" }}>

						{/* LOGO */}
						<div className="d-flex align-items-center">
							<Link to="/" onClick={closeMenu} className="text-decoration-none fs-4 fw-bold">
								<span className="text-fc-red">Flavor</span>
								<span className="text-fc-light">Critic</span>
							</Link>
						</div>

						{/* DESKTOP MENU (Oculto en d-md-none) */}
						<div className="d-none d-md-flex align-items-center gap-4">
							<Link to="/" className="nav-link-custom">Home</Link>
							<Link to="/categorias" className="nav-link-custom">Categorías</Link>

							{/* BARRA DE BÚSQUEDA */}
							<div className="position-relative" style={{ width: "250px" }}>
								<input
									type="text"
									className="form-control rounded-pill"
									placeholder="Buscar..."
									value={navSearch}
                                    onChange={(e) => setNavSearch(e.target.value)}
									style={{
										backgroundColor: "var(--fc-light)",
										color: "var(--fc-dark)",
										width: "100%",
										paddingLeft: "40px",
										paddingRight: "35px",
										paddingTop: "0.25rem",
										paddingBottom: "0.25rem"
									}}
								/>
								<svg
									className="position-absolute top-50 translate-middle-y"
									style={{
										left: "15px",
										height: "16px",
										color: "var(--fc-dark)",
										pointerEvents: "none"
									}}
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>

								{navSearch.length > 0 && (
                                    <i 
                                        className="fas fa-times position-absolute top-50 translate-middle-y text-secondary"
                                        style={{ right: "15px", cursor: "pointer", zIndex: 5 }}
                                        onClick={() => setNavSearch("")}
                                        title="Limpiar búsqueda"
                                    ></i>
                                )}

								{/* CAJA DE RESULTADOS FLOTANTE */}
                                {navSearch.trim() !== "" && (
                                    <div 
                                        className="position-absolute bg-white w-100 shadow-lg rounded-3 overflow-auto mt-2" 
                                        style={{ top: "100%", left: 0, maxHeight: "300px", zIndex: 1050 }}
                                    >
                                        {searchResults.length > 0 ? (
                                            searchResults.map((rest, index) => (
                                                <Link 
                                                    to={`/restaurant/${rest.id}`}
                                                    key={index}
                                                    onClick={() => setNavSearch("")} // Limpia el buscador al hacer clic
                                                    className="d-block p-3 text-decoration-none text-dark border-bottom table-hover-custom"
                                                    style={{ transition: "background-color 0.2s" }}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f8f9fa"}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                                >
                                                    <div className="fw-bold text-truncate">{rest.name}</div>
                                                    <div className="small text-muted text-truncate">
                                                        <i className="fas fa-utensils me-1"></i>{rest.food_type}
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="p-3 text-center text-muted">
                                                <small>No hay coincidencias...</small>
                                            </div>
                                        )}
                                    </div>
                                )}
							</div>

							{/* RENDERIZADO CONDICIONAL DESKTOP */}
							{token ? (
								<>
									{/* Botón exclusivo para el administrador */}
									{role === "admin" && (
										<Link to="/admin" className="btn btn-outline-warning rounded-2 px-4 py-2 fw-medium">
											Panel Admin
										</Link>
									)}
									<button
										onClick={handleLogout}
										className="btn btn-fc-red rounded-2 px-4 py-2 fw-medium"
									>
										Log-Out
									</button>

									{/* BOTÓN DE USUARIO (Solo visible con sesión iniciada) */}
									<Link to="/perfil" className="nav-link-custom">
										<svg className="border border-white rounded-circle p-1" style={{ width: "34px", height: "34px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
									</Link>
								</>
							) : (
								<>
									<Link to="/login" className="nav-link-custom">Log-In</Link>
									<Link to="/signup" className="btn btn-fc-red rounded-2 px-4 py-2 fw-medium">
										Sign-Up
									</Link>
								</>
							)}
						</div>

						{/* MOBILE HAMBURGER BUTTON */}
						<div className="d-md-none">
							<button
								onClick={toggleMenu}
								className="btn border-0 p-1 text-fc-light"
								aria-label="Toggle navigation"
							>
								<svg style={{ width: "30px", height: "30px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
								</svg>
							</button>
						</div>
					</div>
				</div>
			</nav>

			{/* MOBILE SIDEBAR (Bootstrap Offcanvas Structure) */}

			{/* Backdrop oscuro */}
			{isOpen && (
				<div className="offcanvas-backdrop fade show" onClick={closeMenu}></div>
			)}

			{/* Panel lateral */}
			<div
				className={`offcanvas offcanvas-end offcanvas-custom ${isOpen ? "show" : ""}`}
				tabIndex="-1"
				style={{ visibility: isOpen ? "visible" : "hidden" }}
			>
				<div className="offcanvas-header border-bottom" style={{ borderColor: "var(--fc-darkred)" }}>
					<Link to="/" onClick={closeMenu} className="text-decoration-none fs-4 fw-bold">
						<span className="text-fc-red">Flavor</span>
						<span className="text-fc-light">Critic</span>
					</Link>
					<button type="button" className="btn-close btn-close-custom" onClick={closeMenu} aria-label="Close"></button>
				</div>

				<div className="offcanvas-body d-flex flex-column gap-3 mt-2">
					<Link to="/" onClick={closeMenu} className="nav-link-custom fs-5">Home</Link>
					<Link to="/categorias" onClick={closeMenu} className="nav-link-custom fs-5">Categorías</Link>

					<hr className="text-fc-red my-1" />

					{/* RENDERIZADO CONDICIONAL MOBILE */}
					{token ? (
						<>
							{/* Opción exclusiva de Administrador en versión móvil */}
							{role === "admin" && (
								<Link to="/admin" onClick={closeMenu} className="text-decoration-none text-warning fs-5 fw-bold">
									Panel Admin
								</Link>
							)}
							<button
								onClick={() => { handleLogout(); closeMenu(); }}
								className="btn btn-link text-decoration-none text-fc-red fs-5 fw-bold text-start p-0 border-0"
							>
								Log-Out
							</button>
						</>
					) : (
						<>
							<Link to="/login" onClick={closeMenu} className="nav-link-custom fs-5">Log-In</Link>
							<Link to="/signup" onClick={closeMenu} className="text-decoration-none text-fc-red fs-5 fw-bold">Sign-Up</Link>
						</>
					)}

					{/* PERFIL MOBILE AL FONDO (Solo visible con sesión iniciada) */}
					{token && (
						<div className="mt-auto border-top pt-4" style={{ borderColor: "var(--fc-darkred)" }}>
							<Link to="/perfil" onClick={closeMenu} className="nav-link-custom fs-5 d-flex align-items-center gap-2">
								<svg style={{ width: "24px", height: "24px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
								Mi Cuenta
							</Link>
						</div>
					)}
				</div>
			</div>
		</>
	);
};