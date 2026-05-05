//  frontend_AcademiA\src\context\AuthContext.js

// Proveedor que lee los datos del localStorage solo una vez y los mantiene disponibles.

import React, { createContext, useContext, useState, useEffect } from 'react';

// Creamos el contexto. Empezamos con null.
const AuthContext = createContext(null);


//  Función para leer los datos del LocalStorage
const localstorageDataView = () => {
  // 1. Obtenemos los strings crudos
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');

  console.log("--- REVISIÓN DE LOCALSTORAGE ---");
  
  // 2. Mostramos el Token
  console.log("Token:", token ? "Existe ✅" : "No existe ❌");
  
  // 3. Mostramos el Usuario
  if (userString) {
    const userObj = JSON.parse(userString);
    console.log("Objeto Usuario Completo:", userObj);
    
    // 4. Ver campos específicos que te interesan
    console.log("Rol detectado:", userObj.tipos_usuario?.[0]?.cod_tipo_usuario || userObj.rol_sistema);
    console.log("ID Entidad:", userObj.id_entidad);
  } else {
    console.log("Usuario: No hay datos de usuario en localStorage.");
  }
  
  console.log("---------------------------------");
}



// Definición del Proveedor
export const AuthProvider = ({ children }) => {
  
  // Estado "Flag" para saber si está cargando. Se usa luego para evitar 
  // que la app parpadee o muestre contenido privado mientras se lee el localStorage al arrancar.
  const [loadingSessionData, setLoadingSessionData] = useState(true);

  // Estado centralizado. Si este estado cambia, toda la app reacciona.
  const [sessionData, setSessionData] = useState({
    isAuthenticated: false,
    user: null,
    role: null, // Rol: ADM, DOC, ALU
  });

   // Mostramos los datos del localStorage por consola
    localstorageDataView();

  // Lógica Centralizada de Lectura y Parseo 
  // Hook useEffect: Lógica para Ejecutar una sola vez, al al Montar el Componente (cuando se abre la aplicación)
  // Se usa para realizar "efectos secundarios", como la lectura de datos externos.
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (token && userString) {
      try {
        const user = JSON.parse(userString);


        // LÓGICA DE UNIFICACIÓN:
        // Aquí decidimos de dónde viene el rol para toda la app.
        // El primer `?.` comprueba si `tipos_usuario` existe y no es null/undefined.
        // El segundo `?.` comprueba si el elemento [0] existe.
        // Si algo falla, 'roleCode' será undefined, no lanzará error.
        // Si no está en tipos_usuario, buscamos en rol_sistema.                
        const roleCode = user.tipos_usuario?.[0]?.cod_tipo_usuario || user.rol_sistema;
        // ----------------------------------------------------

        setSessionData({
          isAuthenticated: true,
          user: user,
          role: roleCode,
        });
      } catch (e) {
        console.error("Error al parsear datos de sesión:", e);
        // Si los datos están corruptos, limpiamos para evitar errores infinitos
        localStorage.clear();
      }
    }

    // Terminamos de cargar, sea que haya usuario o no
    setLoadingSessionData(false);

    


  // [] indica que se ejecuta solo al montar (iniciar aplicacion)
  }, []);

  // Función de Logout Centralizada: limpia el estado de React y el disco duro
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setSessionData({ 
      isAuthenticated: false, 
      user: null, 
      role: null
     });
  };

  // Función para refrescar los datos cuando cambia el usuario (cerrar y abrir la sesión con nuevo usuario)
  const login = (userData, token) => {
    // 1. Guardamos en el localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));

    // 2. Extraemos el rol
    const roleCode = userData.tipos_usuario?.[0]?.cod_tipo_usuario || userData.rol_sistema;

    // 3. ACTUALIZAMOS EL ESTADO (Esto hace que la app reaccione)
    setSessionData({
      isAuthenticated: true,
      user: userData,
      role: roleCode,
    });
  };

  // 4. Volvemos a ejecutar el log para ver los nuevos datos
  console.log("NUEVO USUARIO LOGUEADO:");
  localstorageDataView();

  return (
    // Proveemos tanto los datos como la función de logout y de login
    <AuthContext.Provider value={{ sessionData, loadingSessionData, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
};


// Hook básico para Consumo (acceder al contexto)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};


