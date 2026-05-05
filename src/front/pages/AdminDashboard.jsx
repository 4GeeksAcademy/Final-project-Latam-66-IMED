import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import toast from "react-hot-toast";

// Importamos los "Dumb Components" (Presentacionales)
import { AdminHeader } from "../components/admin/AdminHeader.jsx";
import { AdminUsersList } from "../components/admin/AdminUsersList.jsx";
import { AdminBulkUpload } from "../components/admin/AdminBulkUpload.jsx";
import { AdminRestaurantForm } from "../components/admin/AdminRestaurantForm.jsx";
import { AdminRestaurantGrid } from "../components/admin/AdminRestaurantGrid.jsx";

export const AdminDashboard = () => {
    const { store, dispatch } = useGlobalReducer();
    const navigate = useNavigate();

    const initialFormState = { name: "", image_url: "", score: 0, food_type: "", cuisine_origin: "", country: "", city: "", description: "", latitud: "", longitud: "" };
    
    // ESTADOS
    const [formData, setFormData] = useState(initialFormState);
    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const [filterName, setFilterName] = useState("");
    const [filterType, setFilterType] = useState("");
    const [filterCity, setFilterCity] = useState("");
    const [filterCountry, setFilterCountry] = useState("");
    
    const [showBulk, setShowBulk] = useState(false);
    const [bulkText, setBulkText] = useState("");
    const [bulkPreview, setBulkPreview] = useState([]);
    const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
    const [defaultBulkScore, setDefaultBulkScore] = useState(0);
    
    const [selectedIds, setSelectedIds] = useState([]);
    const [isDeletingBulk, setIsDeletingBulk] = useState(false);
    
    const [activeTab, setActiveTab] = useState("restaurants");
    const [usersList, setUsersList] = useState([]);
    const [selectedUserComments, setSelectedUserComments] = useState(null);

    // =========================================================
    // 🛠️ FUNCIONES DE UI 
    // =========================================================

    // 🌟 Funcion handle change
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateClick = () => {
        if (showForm && !editingId) {
            setShowForm(false);
        } else {
            setShowBulk(false);
            setFormData(initialFormState);
            setEditingId(null);
            setShowForm(true);
        }
    };

    const handleBulkClick = () => {
        if (showBulk) {
            setShowBulk(false);
        } else {
            setShowForm(false);
            setShowBulk(true);
        }
    };

    // =========================================================
    // 📡 EFECTOS Y CARGA DE DATOS
    // =========================================================
    useEffect(() => {
        const role = sessionStorage.getItem("role");
        const token = sessionStorage.getItem("token");
        if (!token || role !== "admin") return navigate("/");
        if (!store.restaurants || store.restaurants.length === 0) fetchAdminRestaurants();
        fetchAdminUsers();
    }, []);

    const fetchAdminRestaurants = async () => {
        try {
            const resp = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/restaurants");
            if (resp.ok) dispatch({ type: "set_restaurants", payload: await resp.json() });
        } catch (error) { toast.error("Error de conexión 🔌"); }
    };

    const fetchAdminUsers = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users`, { headers: { "Authorization": `Bearer ${token}` } });
            if (resp.ok) setUsersList(await resp.json());
        } catch (error) { toast.error("Error al cargar usuarios"); }
    };

    const viewUserComments = async (user) => {
        try {
            const token = sessionStorage.getItem("token");
            const resp = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${user.id}/comments`, { headers: { "Authorization": `Bearer ${token}` } });
            if (resp.ok) setSelectedUserComments({ name: user.full_name || user.username, list: await resp.json() });
        } catch (error) { toast.error("Error al cargar reseñas"); }
    };

    // =========================================================
    // ☁️ LÓGICA CLOUDINARY Y FORMULARIOS INDIVIDUALES
    // =========================================================
    const uploadImageToCloudinary = async (file) => {
        setIsUploading(true);
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "restaurantes_preset");
        data.append("cloud_name", "de1dgfuk3");
        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/de1dgfuk3/image/upload", { method: "POST", body: data });
            setIsUploading(false);
            if (response.ok) return (await response.json()).secure_url; 
        } catch (error) { setIsUploading(false); return null; }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isUploading) return toast.error("Espera a que suba la imagen ⏳");
        const token = sessionStorage.getItem("token");
        const url = editingId ? `${import.meta.env.VITE_BACKEND_URL}/api/restaurants/${editingId}` : `${import.meta.env.VITE_BACKEND_URL}/api/restaurants`;
        
        toast.promise(fetch(url, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(formData) })
            .then(res => res.ok ? res.json() : Promise.reject("Error")), {
            loading: 'Guardando...', success: '¡Éxito! ✨', error: 'Error ❌'
        }).then(data => {
            dispatch({ type: editingId ? "update_restaurant" : "add_restaurant", payload: data.restaurant });
            setFormData(initialFormState); setEditingId(null); setShowForm(false);
        }).catch(err => console.error(err));
    };

    // =========================================================
    // 📋 LÓGICA BULK UPLOAD (Carga Masiva Excel)
    // =========================================================
    useEffect(() => {
        if (!bulkText.trim()) return setBulkPreview([]);
        const parsedData = bulkText.split('\n').map(row => {
            const cols = row.split('\t');
            return { id: cols[0]?.trim() || null, name: cols[1]?.trim() || "", image_url: cols[2]?.trim() || "", score: parseInt(cols[3]?.trim() || defaultBulkScore), food_type: cols[4]?.trim() || "", cuisine_origin: cols[5]?.trim() || "", country: cols[6]?.trim() || "", city: cols[7]?.trim() || "", description: cols[8]?.trim() || "", latitud: parseFloat(cols[9]?.trim() || null), longitud: parseFloat(cols[10]?.trim() || null) };
        }).filter(r => r.name !== "");
        setBulkPreview(parsedData);
    }, [bulkText, defaultBulkScore]);

    const handleBulkSubmit = async () => {
        if (bulkPreview.length === 0) return;
        setIsSubmittingBulk(true);
        const token = sessionStorage.getItem("token");
        const promises = bulkPreview.map(rest => {
            const { id, ...bodyData } = rest;
            const url = id ? `${import.meta.env.VITE_BACKEND_URL}/api/restaurants/${id}` : `${import.meta.env.VITE_BACKEND_URL}/api/restaurants`;
            return fetch(url, { method: id ? "PUT" : "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(bodyData) });
        });
        toast.promise(Promise.all(promises).then(resps => resps.some(r => !r.ok) ? Promise.reject("Error HTTP") : Promise.resolve()), {
            loading: 'Procesando BD... ⏳', success: `¡Procesados ${bulkPreview.length}! 🚀`, error: 'Error'
        }).then(() => { setBulkText(""); setShowBulk(false); fetchAdminRestaurants(); }).finally(() => setIsSubmittingBulk(false));
    };

    // =========================================================
    // 🗑️ LÓGICA DE ELIMINACIÓN Y EDICIÓN MASIVA E INDIVIDUAL
    // =========================================================
    const handleSelectAll = (e) => setSelectedIds(e.target.checked ? filtered.map(r => r.id) : []);
    const handleSelectOne = (id) => setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(sId => sId !== id) : [...selectedIds, id]);
    
    const executeDelete = async (ids) => {
        const token = sessionStorage.getItem("token");
        await Promise.all(ids.map(id => fetch(`${import.meta.env.VITE_BACKEND_URL}/api/restaurants/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } })));
        fetchAdminRestaurants(); setSelectedIds([]);
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        toast((t) => (
            <div className="bg-dark text-light p-4 rounded-4 text-center border border-danger shadow-lg">
                <i className="fas fa-exclamation-triangle text-danger fs-1 mb-3"></i>
                <h5 className="fw-bold mb-3 text-danger">¿Eliminar {selectedIds.length} restaurantes?</h5>
                <button className="btn btn-danger mx-2 fw-bold px-4 rounded-pill" onClick={() => { toast.dismiss(t.id); setIsDeletingBulk(true); toast.promise(executeDelete(selectedIds), { loading: 'Borrando...', success: 'Borrados', error: 'Error' }).finally(() => setIsDeletingBulk(false)); }}>Sí, eliminar</button>
                <button className="btn btn-outline-light mx-2 fw-bold px-4 rounded-pill" onClick={() => toast.dismiss(t.id)}>Cancelar</button>
            </div>
        ), { duration: Infinity, style: { background: "transparent", boxShadow: "none", padding: 0 } });
    };

    const handleDelete = (id) => {
        toast((t) => (
            <div className="bg-dark text-light p-4 rounded-4 text-center border border-danger shadow-lg">
                <i className="fas fa-exclamation-triangle text-danger fs-1 mb-3"></i>
                <h5 className="fw-bold mb-3 text-danger">¿Eliminar este restaurante?</h5>
                <button className="btn btn-danger mx-2 fw-bold px-4 rounded-pill" onClick={() => { toast.dismiss(t.id); toast.promise(executeDelete([id]), { loading: 'Borrando...', success: 'Borrado', error: 'Error' }); }}>Sí, eliminar</button>
                <button className="btn btn-outline-light mx-2 fw-bold px-4 rounded-pill" onClick={() => toast.dismiss(t.id)}>Cancelar</button>
            </div>
        ), { duration: Infinity, style: { background: "transparent", boxShadow: "none", padding: 0 } });
    };

    const handleEditClick = (r) => {
        setFormData({ name: r.name, image_url: r.image_url || "", score: r.score || 0, food_type: r.food_type, cuisine_origin: r.cuisine_origin, country: r.country || "", city: r.city, description: r.description || "", latitud: r.latitud || "", longitud: r.longitud || "" });
        setEditingId(r.id); setShowBulk(false); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // =========================================================
    // 🔍 FILTRADO EN TIEMPO REAL
    // =========================================================
    const restaurantsList = store.restaurants || [];
    const filtered = restaurantsList.filter(r => (r.name || "").toLowerCase().includes(filterName.toLowerCase()) && (r.food_type || "").toLowerCase().includes(filterType.toLowerCase()) && (r.city || "").toLowerCase().includes(filterCity.toLowerCase()) && (r.country || "").toLowerCase().includes(filterCountry.toLowerCase()));

    return (
        <div className="container-fluid min-vh-100 p-4" style={{ backgroundColor: "#1e1e1e" }}>
            {/* COMPONENTE 1: HEADER */}
            <AdminHeader 
                activeTab={activeTab} setActiveTab={setActiveTab} restaurantsCount={restaurantsList.length} usersCount={usersList.length} 
                filteredCount={filtered.length} showBulk={showBulk} handleBulkClick={handleBulkClick} showForm={showForm} 
                editingId={editingId} handleCreateClick={handleCreateClick} 
            />

            {/* COMPONENTE 2: LISTA DE USUARIOS */}
            {activeTab === "users" && (
                <AdminUsersList usersList={usersList} viewUserComments={viewUserComments} selectedUserComments={selectedUserComments} setSelectedUserComments={setSelectedUserComments} />
            )}

            {activeTab === "restaurants" && (
                <div className="animate__animated animate__fadeIn">
                    {/* COMPONENTE 3: CARGA MASIVA */}
                    {showBulk && <AdminBulkUpload defaultBulkScore={defaultBulkScore} setDefaultBulkScore={setDefaultBulkScore} bulkText={bulkText} setBulkText={setBulkText} bulkPreview={bulkPreview} handleBulkSubmit={handleBulkSubmit} isSubmittingBulk={isSubmittingBulk} />}
                    
                    {/* COMPONENTE 4: FORMULARIO INDIVIDUAL */}
                    {showForm && <AdminRestaurantForm formData={formData} setFormData={setFormData} handleChange={handleChange} handleSubmit={handleSubmit} editingId={editingId} setShowForm={setShowForm} isUploading={isUploading} uploadImageToCloudinary={uploadImageToCloudinary} />}
                    
                    {/* COMPONENTE 5: GRILLA DE TARJETAS Y FILTROS */}
                    <AdminRestaurantGrid 
                        restaurantsList={restaurantsList} filtered={filtered} setFilterName={setFilterName} setFilterType={setFilterType} 
                        setFilterCountry={setFilterCountry} setFilterCity={setFilterCity} isAllSelected={filtered.length > 0 && selectedIds.length === filtered.length} 
                        handleSelectAll={handleSelectAll} selectedIds={selectedIds} handleBulkDelete={handleBulkDelete} isDeletingBulk={isDeletingBulk} 
                        handleSelectOne={handleSelectOne} handleEditClick={handleEditClick} handleDelete={handleDelete} 
                    />
                </div>
            )}
        </div>
    );
};