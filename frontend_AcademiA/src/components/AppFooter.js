//  frontend_AcademiA\src\components\AppFooter.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Importar el hook para acceder a los datos de la sesi{on almacenados en AuthProvider
import { CFooter } from '@coreui/react'

const AppFooter = () => {

  // Consumir el estado centralizado de la sesion global
  const { sessionData } = useAuth();  //  useAuth(): hook personalizado que internamente llama a useContext(AuthContext).
  const { user, role, isAuthenticated } = sessionData;


  return (
    <CFooter className="px-4">
      <div>
        <a>
          AcademIA
        </a>
        <span className="ms-1">&copy; 2026</span>
      </div>
      <div className="ms-auto">

        {/* Muestra la información del login, pasada por sessionData */}
        <span className="me-3">
          Usuario: {isAuthenticated ? user.name : 'Invitado'}
        </span>
        <a >
          Rol: {role || 'N/A'}
        </a>
      </div>
    </CFooter>
  )
}

export default AppFooter
