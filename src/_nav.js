//  AcademIA\src\_nav.js
import React from 'react'
import { CIcon } from '@coreui/icons-react'
import { cilSchool, cilUser, cilAccountLogout, cilBook, cilHome, cilContact, cilDescription } from '@coreui/icons'
import { CNavItem, CNavTitle, CNavGroup } from '@coreui/react'

import { ROL_ADMIN, ROL_ALUMNO, ROL_DOCENTE } from '../src/constants/Roles';

// --------------------------------------------------------------------------------
// 1. DEFINICIÓN DEL MENÚ CON PERMISOS
// --------------------------------------------------------------------------------
const fullNavigation = [
    {
        component: CNavTitle,
        name: 'AcademIA',
    },
    {
        component: CNavItem,
        name: 'Inicio',
        to: '/home',
        icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
        roles: [ROL_ADMIN, ROL_ALUMNO, ROL_DOCENTE],
    },

    // --- USUARIOS (Solo Admin) ---
    {
        component: CNavGroup,
        name: 'Usuarios',
        to: '/usuarios',
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        roles: [ROL_ADMIN],
        items: [
            { component: CNavItem, name: 'Gestión de Usuarios', to: '/usuarios', roles: [ROL_ADMIN] },
            { component: CNavItem, name: 'Informes', to: '/usuarios/informes', roles: [ROL_ADMIN] },
        ],
    },

    // --- CURSOS ---
    {
        component: CNavGroup,
        name: 'Cursos',
        to: '/gestion-cursos',
        icon: <CIcon icon={cilContact} customClassName="nav-icon" />,
        roles: [ROL_ADMIN, ROL_DOCENTE],
        items: [
            { component: CNavItem, name: 'Gestión de Cursos', to: '/cursos', roles: [ROL_ADMIN, ROL_DOCENTE] },
            { component: CNavItem, name: 'Gestión de Materias', to: '/materias', roles: [ROL_ADMIN, ROL_DOCENTE] },
            { component: CNavItem, name: 'Informes', to: '/cursos/informes', roles: [ROL_ADMIN, ROL_DOCENTE] },
        ],
    },

    // --- DOCENTES ---
    {
        component: CNavGroup,
        name: 'Docentes',
        to: '/docentes',
        icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
        roles: [ROL_ADMIN, ROL_DOCENTE],
        items: [
            { component: CNavItem, name: 'Gestión de Docentes', to: '/docentes', roles: [ROL_ADMIN] },
            { component: CNavItem, name: 'Carga de notas', to: '/docentes/cargaNotas', roles: [ROL_ADMIN, ROL_DOCENTE] },
            { component: CNavItem, name: 'Informes', to: '/docentes/informes', roles: [ROL_ADMIN, ROL_DOCENTE] },
        ],
    },

    // --- GESTIÓN ACADÉMICA ---
    {
        component: CNavGroup,
        name: 'Gestión Académica',
        to: '/gestion-academica',
        icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
        roles: [ROL_ADMIN, ROL_DOCENTE],
        items: [
            { component: CNavItem, name: 'Gestión de Personal', to: '/personal', roles: [ROL_ADMIN] },
            { component: CNavItem, name: 'Asistencia', to: '/asistencia', roles: [ROL_ADMIN] },
            { component: CNavItem, name: 'Inscripción a ciclo lectivo', to: '/inscripcion', roles: [ROL_ADMIN, ROL_DOCENTE] },
            { component: CNavItem, name: 'Informes', to: '/informes-academicos', roles: [ROL_ADMIN, ROL_DOCENTE] },
        ],
    },

    // --- ESTUDIANTES ---
    {
        component: CNavGroup,
        name: 'Estudiantes',
        to: '/estudiante',
        icon: <CIcon icon={cilSchool} customClassName="nav-icon" />,
        roles: [ROL_ALUMNO, ROL_ADMIN, ROL_DOCENTE],
        items: [
            { component: CNavItem, name: 'Gestión de Estudiantes', to: '/estudiante', roles: [ROL_ADMIN, ROL_DOCENTE] },
            { component: CNavItem, name: 'Trayectoria', to: '/estudiante/trayectoria', roles: [ROL_ALUMNO, ROL_ADMIN, ROL_DOCENTE] },
            { component: CNavItem, name: 'Informes', to: '/estudiante/informes', roles: [ROL_ALUMNO, ROL_ADMIN, ROL_DOCENTE] },
        ],
    },

    // --- CERRAR SESIÓN ---
    {
        component: CNavItem,
        name: 'Cerrar Sesión',
        to: '/logout',
        icon: <CIcon icon={cilAccountLogout} customClassName="nav-icon" />,
        roles: [ROL_ADMIN, ROL_ALUMNO, ROL_DOCENTE],
        onClick: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        },
    },
];

//--------------------------------------------------------------------------------
// 2. FUNCIÓN DE FILTRADO (MEJORADA: Soporte Multirrol y Limpieza de Grupos)
// --------------------------------------------------------------------------------
const filterNavItems = (items, userRoles) => {
    // Usamos un Set para búsquedas de roles eficientes (O(1))
    const userRoleSet = new Set(userRoles);

    // Primera pasada: Filtrar recursivamente los sub-ítems
    const itemsWithFilteredChildren = items.map(item => {
        if (item.items) {
            // Se filtra recursivamente el contenido del grupo
            const filteredItems = filterNavItems(item.items, userRoles);
            
            return {
                ...item,
                items: filteredItems,
            };
        }
        return item;
    });

    // Segunda pasada: Filtrar el ítem principal (y eliminar grupos vacíos)
    return itemsWithFilteredChildren.filter(item => {
        // Regla 1: Ocultar si es un grupo sin ítems visibles (limpieza UX)
        if (item.component === CNavGroup && item.items && item.items.length === 0) {
            return false;
        }

        // Regla 2: Si no tiene roles definidos (ej. CNavTitle), siempre es visible
        if (!item.roles || item.roles.length === 0) {
            return true;
        }
        
        // Regla 3 (Soporte Multirrol): Es visible si AL MENOS UNO de los roles
        // requeridos por el ítem coincide con CUALQUIERA de los roles del usuario.
        return item.roles.some(requiredRole => userRoleSet.has(requiredRole));
    });
};

// --------------------------------------------------------------------------------
// 3. FUNCIÓN PRINCIPAL (MEJORADA: Extracción de Todos los Roles)
// --------------------------------------------------------------------------------
/**
 * Obtiene el menú de navegación filtrado según los roles del usuario logueado.
 * @returns {Array} El array de navegación de CoreUI.
 */
const getNavItems = () => {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    // Extraer *TODOS* los códigos de rol del usuario (soporte multirrol)
    const userRoles = user && user.tipos_usuario
        ? user.tipos_usuario.map(tipo => tipo.cod_tipo_usuario)
        : [];

    console.log('🔍 _nav.js - Usuario en localStorage:', user);
    console.log('🔍 _nav.js - Roles detectados (multirrol):', userRoles);

    if (userRoles.length === 0) {
        console.log('❌ No se encontraron roles → Menú vacío');
        return [];
    }

    // Filtrar el menú completo con el array de roles del usuario
    const finalNavItems = filterNavItems(fullNavigation, userRoles);
    console.log('✅ Menú filtrado con ítems finales:', finalNavItems.length);

    return finalNavItems;
};

export default getNavItems;