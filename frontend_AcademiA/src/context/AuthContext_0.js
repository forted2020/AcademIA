//  frontend_AcademiA\src\context\AuthContext.js

// Proveedor que lee los datos del localStorage solo una vez y los mantiene disponibles.

import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Crea el Contexto
const AuthContext = createContext(null);



// 2. Definición del Proveedor
export const AuthProvider = ({ children }) => {
    // Flag para saber si está cargando
  const [loadingSessionData, setLoadingSessionData] = useState(true);

  const [sessionData, setSessionData] = useState({
    isAuthenticated: false,
    user: null,
    role: null, // Rol: ADM, DOC, ALU
  });

  // 3. Lógica Centralizada de Lectura y Parseo 

  // Hook useEffect: Lógica para Ejecutar al Montar el Componente
  // Este hook se usa para realizar "efectos secundarios", como la lectura de datos externos.
  // El array de dependencias vacío `[]` asegura que esta función se ejecute SÓLO UNA VEZ, justo después del renderizado inicial del componente.
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (token && userString) {
      try {
        const user = JSON.parse(userString);

        // ----------------------------------------------------
        // El primer `?.` comprueba si `tipos_usuario` existe y no es null/undefined.
        // El segundo `?.` comprueba si el elemento [0] existe.
        // Si algo falla, 'roleCode' será undefined, no lanzará error.
        const roleCode = user.tipos_usuario?.[0]?.cod_tipo_usuario;
        // ----------------------------------------------------

        setSessionData({
          isAuthenticated: true,
          user: user,
          role: roleCode,
        });
      } catch (e) {
        console.error("Error al parsear datos de sesión:", e);
        // Si hay error, limpiar la sesión
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    setLoadingSessionData(false);  // Ya cargó

  }, []); // Se ejecuta solo al montar

  // 4. Función de Logout Centralizada
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setSessionData({ isAuthenticated: false, user: null, role: null });
  };

  return (
    <AuthContext.Provider value={{ sessionData, loadingSessionData, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 5. Hook Personalizado para Consumo (Reutilización)
export const useAuth = () => {
  return useContext(AuthContext);
};