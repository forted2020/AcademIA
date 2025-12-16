//  src\hooks\useAuthUser.js

//  Hook de Usuario para la obtención del usuario desde localStorage. 

import { useMemo } from 'react';

// Roles definidos para la lógica de visualización (Se mueven aquí o a una constante global)
const ADMIN_ROLES = ['ADMIN_SISTEMA', 'DOCENTE_APP'];

/**
 * Hook para obtener la información de autenticación del usuario logueado.
 * Usa useMemo para calcular y cachear la información una sola vez.
 * @returns {{ idEntidad: number | null, rol: string | null, isAdmin: boolean }}
 */
const useAuthUser = () => {
    return useMemo(() => {
        try {
            const userString = localStorage.getItem('user');
            if (userString) {
                const user = JSON.parse(userString);
                
                // Extrae el rol de forma segura (prioriza cod_tipo_usuario, luego rol_sistema como fallback)
                const rol = user.tipo_rol?.cod_tipo_usuario || user.rol_sistema || null;
                
                const isAdmin = ADMIN_ROLES.includes(rol);

                return {
                    idEntidad: user.id_entidad || null, // Clave para la API
                    rol: rol,
                    isAdmin: isAdmin, // Indica si es Docente o Admin
                };
            }
            return { idEntidad: null, rol: null, isAdmin: false };
        } catch (e) {
            console.error("Error al parsear el usuario del localStorage", e);
            // Retorna valores seguros en caso de fallo
            return { idEntidad: null, rol: null, isAdmin: false };
        }
    }, []); // Se ejecuta solo una vez al montar el componente.
};

export default useAuthUser;