import { Outlet } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { BackToTopButton } from "../components/BackToTopButton"

export const Layout = () => {
    return (
        <ScrollToTop>
            <Navbar />
            <Outlet /> {/* Aquí se inyectan todas nuestras páginas automáticamente */}
            <Footer />
            <BackToTopButton />
        </ScrollToTop>
    )
}