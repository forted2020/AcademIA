import React, { useState, useEffect } from 'react';
import { CFooter } from '@coreui/react'

const AppFooter = () => {

  //  ----------------  Esto es para mostrar informacion de sesion en el footer  -------------  
  // 1. Estado para almacenar el nombre y el rol del usuario logueado
  const [loggedInUser, setLoggedInUser] = useState({ name: 'Invitado', role: 'N/A' });

  // 2. useEffect para leer los datos del usuario al cargar el componente
  useEffect(() => {
    const userString = localStorage.getItem('user');

    if (userString) {
      try {
        const user = JSON.parse(userString);
        
        // 🚨 Extracción del nombre:
        const userName = user.name || 'Sin nombre';
        
        // 🚨 Extracción del Rol (usando la estructura que el backend envía):
        const userRoleCode = user.tipos_usuario && user.tipos_usuario.length > 0
                             ? user.tipos_usuario[0].cod_tipo_usuario
                             : 'N/A';
        
        // 3. Actualizar el estado con la información
        setLoggedInUser({
          name: userName,
          role: userRoleCode
        });
      } catch (e) {
        console.error("Error al parsear el objeto 'user' de localStorage:", e);
        setLoggedInUser({ name: 'Error de Sesión', role: 'N/A' });
      }
    }
  }, []); // El array vacío asegura que se ejecute solo una vez al montar


  return (
    <CFooter className="px-4">
      <div>
        <a>
          CoreUI
        </a>
        <span className="ms-1">&copy; 2025</span>
      </div>
      <div className="ms-auto">
        <span className="me-3">
          Usuario: {loggedInUser.name}
        </span>
        <a >
          Rol: {loggedInUser.role}
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
