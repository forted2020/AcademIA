import React from 'react'
import { Routes, Route } from 'react-router-dom';
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import UserManagement from '../views/UserManagement/UserManagement';


const DefaultLayout = () => {
  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <Routes>
            <Route path="/users" element={<UserManagement />} />
            <Route path="*" element={<AppContent />} /> {/* Contenido por defecto */}
          </Routes>
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
