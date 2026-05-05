import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  useRouteError // 1. Importamos el hook para leer errores
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Demo } from "./pages/Demo";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Single } from "./pages/Single";
import { Profile } from "./pages/Profile";
import { Categorias } from "./pages/Categorias";
import { AboutUs } from "./pages/AboutUs";
import { Contacto } from "./pages/Contacto";

// =========================================================
// 🛡️ NUEVO: COMPONENTE DE MANEJO DE ERRORES (ERROR BOUNDARY)
// =========================================================
const RootErrorBoundary = () => {
    const error = useRouteError();
    console.error("🚨 Error capturado por React Router:", error);
    
    return (
        <div style={{ padding: "2rem", backgroundColor: "#ffcccc", color: "#990000", minHeight: "100vh" }}>
            <h1>¡Ups! Algo se rompió 💥</h1>
            <p><strong>Detalle del error:</strong> {error.message || error.statusText}</p>
            <p>Revisa la consola de tu navegador (F12) para más detalles.</p>
        </div>
    );
};

export const router = createBrowserRouter(
  createRoutesFromElements(
    // 2. Reemplazamos el "Not found!" por nuestro nuevo ErrorBoundary
    <Route path="/" element={<Layout />} errorElement={<RootErrorBoundary />} >

      <Route index element={<Home />} />
      <Route path="restaurant/:id" element={<Single />} />
      <Route path="demo" element={<Demo />} />
      <Route path="signup" element={<Signup />} />
      <Route path="login" element={<Login />} />
      <Route path="admin" element={<AdminDashboard />} />
      <Route path="perfil" element={<Profile />} />
      <Route path="categorias" element={<Categorias />} />
      <Route path="sobre-nosotros" element={<AboutUs />} />
      <Route path="contacto" element={<Contacto />} />
      
      {/* 3. Ruta comodín REAL para páginas que no existen (404) */}
      <Route path="*" element={<h1 className="text-center mt-5 text-white">404 - Página no encontrada</h1>} />
      
    </Route>
  )
);