import { Outlet } from "react-router-dom/dist"
import ScrollToTop from "../components/ScrollToTop"
import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { BackToTopButton } from "../components/BackToTopButton"
import { Toaster } from "react-hot-toast";

export const Layout = () => {
    return (
        <ScrollToTop>
            <Navbar />
            <Toaster
                position="bottom-center"
                toastOptions={{
                    style: {
                        background: 'var(--fc-dark)',
                        color: 'var(--fc-light)',
                        border: '1px solid var(--fc-red)',
                        borderRadius: '10px'
                    },
                    success: {
                        iconTheme: { primary: '#810000', secondary: '#EEEBDD' }
                    }
                }}
            />
            <Outlet /> {/* Aquí se inyectan todas nuestras páginas automáticamente */}
            <Footer />
            <BackToTopButton />
        </ScrollToTop>
    )
}