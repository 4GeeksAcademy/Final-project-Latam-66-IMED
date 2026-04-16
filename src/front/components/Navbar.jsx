import React, { useState } from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);
	const closeMenu = () => setIsOpen(false);
	const toggleMenu = () => setIsOpen(!isOpen);

	return (
		<>
			<nav className="bg-fc-dark navbar-custom w-100 position-relative" style={{ zIndex: 1040 }}>
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
									style={{
										backgroundColor: "var(--fc-light)",
										color: "var(--fc-dark)",
										width: "100%",
										paddingLeft: "40px",
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
							</div>

							<Link to="/login" className="nav-link-custom">Log-In</Link>
							<Link to="/signup" className="btn btn-fc-red rounded-2 px-4 py-2 fw-medium">
								Sign-In
							</Link>

							{/* BOTÓN DE USUARIO */}
							<Link to="/perfil" className="nav-link-custom">
								<svg className="border border-white rounded-circle p-1" style={{ width: "34px", height: "34px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
								</svg>
							</Link>
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

					<Link to="/login" onClick={closeMenu} className="nav-link-custom fs-5">Log-In</Link>
					<Link to="/signup" onClick={closeMenu} className="text-decoration-none text-fc-red fs-5 fw-bold">Sign-In</Link>

					<div className="mt-auto border-top pt-4" style={{ borderColor: "var(--fc-darkred)" }}>
						<Link to="/perfil" onClick={closeMenu} className="nav-link-custom fs-5 d-flex align-items-center gap-2">
							<svg style={{ width: "24px", height: "24px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
							Mi Cuenta
						</Link>
					</div>
				</div>
			</div>
		</>
	);
};