// src/utils/authUtils.js

//  Contiene las funciones de lógica: getUserRolesFromLocalStorage y filterNavItems.
//  Centraliza y aísla la lógica de seguridad y el manejo de roles/sesión. 
//  Facilita la prueba unitaria de la lógica de permisos sin montar React/CoreUI.


/**
 * Filtra un array de navegación basado en un conjunto de roles del usuario.
 * @param {Array} items - El array de ítems de navegación (CNavItem o CNavGroup).
 * @param {Array<string>} userRoles - Array con todos los códigos de rol del usuario.
 * @returns {Array} El array de navegación filtrado.
 */
export const filterNavItems = (items, userRoles) => {
    const userRoleSet = new Set(userRoles);

    // 1. Filtrar recursivamente los sub-ítems
    const itemsWithFilteredChildren = items.map(item => {
        if (item.items) {
            const filteredItems = filterNavItems(item.items, userRoles);
            return { ...item, items: filteredItems };
        }
        return item;
    });

    // 2. Filtrar el ítem principal (y eliminar grupos vacíos)
    return itemsWithFilteredChildren.filter(item => {
        // Ocultar si es un grupo sin ítems visibles
        if (item.component === 'CNavGroup' && item.items && item.items.length === 0) {
            return false;
        }

        // Si no tiene roles definidos, es visible (ej. CNavTitle)
        if (!item.roles || item.roles.length === 0) {
            return true;
        }

        // Es visible si AL MENOS UNO de los roles requeridos coincide con los roles del usuario.
        return item.roles.some(requiredRole => userRoleSet.has(requiredRole));
    });
};

/**
 * Obtiene el array de todos los roles del usuario logueado desde localStorage.
 * Maneja la lógica de compatibilidad de estructuras de roles.
 * @returns {Array<string>} Un array de códigos de rol (ej. ['ADM', 'DOC']).
 */
export const getUserRolesFromLocalStorage = () => {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    
    if (!user) {
        return [];
    }
    
    // 1. Prioridad a la nueva estructura: rol_sistema (String simple)
    if (user.rol_sistema) {
        return [user.rol_sistema];
    }
    
    // 2. Fallback / Soporte a la estructura antigua/multirrol: tipos_usuario (Array de objetos)
    if (user.tipos_usuario && Array.isArray(user.tipos_usuario)) {
        return user.tipos_usuario.map(tipo => tipo.cod_tipo_usuario);
    }
    
    return [];
};