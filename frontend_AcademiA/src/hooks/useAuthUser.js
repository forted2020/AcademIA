//  src\hooks\useAuthUser.js

//  Hook de Usuario para la obtención del usuario desde localStorage.
//  No lee el localStorage, sinó que "escucha" al AuthContext.js. Es mucho más rápido y siempre está actualizado.


import { useMemo } from 'react';
import { useAuth } from '../../src/context/AuthContext'; // Importamos el contexto 

// Definimos qué roles se consideran administrativos, para la lógica de visualización, en un solo lugar.
//   OBS: ver si DOCENTE_APP debe estar como Administrativo.
const ADMIN_ROLES = ['ADMIN_SISTEMA', 'DOCENTE_APP'];

/**
 * Hook para obtener la información de autenticación del usuario logueado.
 * Transforma los datos brutos del contexto en información fácil de usar.
 * Usa useMemo para calcular y cachear la información una sola vez.
 */
const useAuthUser = () => {
    // Obtenemos la data centralizada
    const { sessionData } = useAuth();

    // useMemo memoriza el resultado. 
    // Funciona como una memoria que no se re-renderiza cada vez que el componente lo hace.
    // Solo se vuelve a calcular si sessionData cambia.
    return useMemo(() => {
        const { user, role, isAuthenticated } = sessionData;

        // Determinamos si es admin basándonos en la constante de arriba
        const isAdmin = ADMIN_ROLES.includes(role);

        return {
            // Datos útiles listos para usar:
            idEntidad: user?.id_entidad || null, 
            nombre: user?.nombre || 'Invitado',
            rol: role,
            isAdmin: isAdmin,
            isAuthenticated: isAuthenticated,
            // Retornamos el objeto user completo por si se necesita otra propiedad
            userData: user 
        };
    // Dependencia: el estado global de auth
    // useMemo actualiza, si sessionData cambia.
    }, [sessionData]); 
}

export default useAuthUser;