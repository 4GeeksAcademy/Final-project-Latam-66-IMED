// Import necessary components and functions from react-router-dom.
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import { Layout } from "./pages/Layout";
import { Home } from "./pages/Home";
import { Demo } from "./pages/Demo";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Single } from "./pages/Single"; // Singleview de los restaurentes
import { Profile } from "./pages/Profile";
import { Categorias } from "./pages/Categorias";

export const router = createBrowserRouter(
  createRoutesFromElements(
    // CreateRoutesFromElements function allows you to build route elements declaratively.

    // Root Route: All navigation will start from here.
    // El Layout envuelve a todos sus hijos y les proporciona el Navbar y el Footer
    <Route path="/" element={<Layout />} errorElement={<h1>Not found!</h1>} >

      {/* CORRECCIÓN 1: Usamos 'index' en lugar de path="/" 
        Esto le dice a React Router: "Cuando el usuario visite la ruta padre (/), 
        muestra el componente Home por defecto dentro del Outlet".
      */}
      <Route index element={<Home />} />

      {/* CORRECCIÓN 2: Rutas relativas.
        Al quitar el "/" inicial, le decimos que estos paths se suman al padre.
        Ejemplo: el padre es "/" + el hijo es "login" = "/login"
      */}
      <Route path="restaurant/:id" element={<Single />} />

      {/* Otras rutas de la aplicación */}
      <Route path="demo" element={<Demo />} />
      <Route path="signup" element={<Signup />} />
      <Route path="login" element={<Login />} />
      <Route path="admin" element={<AdminDashboard />} />
      <Route path="perfil" element={<Profile />} />
      <Route path="categorias" element={<Categorias />} />
    </Route>
  )
);