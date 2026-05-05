import React, { useState, useEffect } from 'react'
// import { Routes, Route } from 'react-router-dom';
import { Outlet, useNavigate} from 'react-router-dom';
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import LogoutModal from '../components/LogoutModal';

import UserManagement from '../views/UserManagement/UserManagement';


const DefaultLayout = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false); // Estado para controlar el modal
  const navigate = useNavigate(); // Hook para redirigir

  // Escuchar el evento logout-request para abrir el modal
  useEffect(() => {
    const handleLogoutRequest = () => {
      console.log('DefaultLayout: Evento logout-request recibido');
      setShowLogoutModal(true);
    };
    window.addEventListener('logout-request', handleLogoutRequest);
    return () => {
      window.removeEventListener('logout-request', handleLogoutRequest); // Limpiar el listener
    };
  }, []);

  // Manejar confirmación de logout
  const handleLogout = () => {
    console.log('DefaultLayout: localStorage limpiado');
    localStorage.removeItem('token'); // Limpiar token
    localStorage.removeItem('user'); // Limpiar datos del usuario
    localStorage.clear(); // Limpia todo localStorage
    setShowLogoutModal(false); // Cerrar modal
    navigate('/login'); // Redirigir a login
  };

  // Manejar cancelación del logout
  const handleCancelLogout = () => {
    setShowLogoutModal(false); // Cerrar modal
  };

  // Verifica token al cargar DefaultLayout
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('DefaultLayout: No hay token, redirigiendo a /login');
      navigate('/login');
    }
  }, [navigate]);

  console.log('DefaultLayout: Renderizando'); // Log para confirmar que DefaultLayout se ejecuta
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <Outlet />  {/* Para renderizar las rutas hijas definidas en App.js. */}
        </div>
        <AppFooter />
      </div>
      <LogoutModal
        visible={showLogoutModal}
        onClose={handleCancelLogout}
        onConfirm={handleLogout}
      />
    </div>
  )
}

export default DefaultLayout
