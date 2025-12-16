// AcademIA\src\_nav.js

//  Importa la configuración y las utilidades, y ensambla la función getNavItems.

// ================================================================================
// 1. IMPORTACIONES Y CONSTANTES
// ================================================================================

import { fullNavigation } from './config/navigation/navigation'
import { filterNavItems, getUserRolesFromLocalStorage } from '../src/utils/authUtils/authUtils'


/**
 * Función principal para obtener el menú de navegación filtrado.
 * * Este es el único punto de contacto entre el Layout (CoreUI) y la lógica de seguridad.
 * @returns {Array} El array de navegación de CoreUI listo para renderizar.
 */

const getNavItems = () => {
    // 1. Extraer los roles del usuario logueado
    const userRoles = getUserRolesFromLocalStorage();
    
    if (userRoles.length === 0) {
        // Usuario no logueado o sin roles
        return [];
    }

    // 2. Filtrar el menú completo con el array de roles del usuario
    const finalNavItems = filterNavItems(fullNavigation, userRoles);

    return finalNavItems;
};

export default getNavItems;
