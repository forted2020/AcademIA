//  AcademIA\src\_nav.js
import React from 'react'
import { CIcon } from '@coreui/icons-react'
import { cilSchool, cilUser, cilAccountLogout, cilBook, cilHome, cilContact, cilDescription, cilBell, cilSettings, cilPrint } from '@coreui/icons'
import { CNavItem, CNavTitle, CNavGroup } from '@coreui/react'

import { ROL_ADMIN, ROL_ALUMNO, ROL_DOCENTE } from '../src/constants/Roles'
import { parsePermisos } from '../src/views/configuracion/ConfiguracionGeneral/navPermisosCatalogo'

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
        navKey: 'nav_inicio',
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
            { component: CNavItem, name: 'Gestión de Usuarios', to: '/usuarios', navKey: 'nav_usuarios_gestion', roles: [ROL_ADMIN] },
            { component: CNavItem, name: 'Informes', to: '/usuarios/informes', navKey: 'nav_usuarios_informes', roles: [ROL_ADMIN] },
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
            { component: CNavItem, name: 'Gestión de Cursos', to: '/cursos', navKey: 'nav_cursos_gestion', roles: [ROL_ADMIN, ROL_DOCENTE] },
            { component: CNavItem, name: 'Gestión de Materias', to: '/materias', navKey: 'nav_materias_gestion', roles: [ROL_ADMIN, ROL_DOCENTE] },
            { component: CNavItem, name: 'Informes', to: '/cursos/informes', navKey: 'nav_cursos_informes', roles: [ROL_ADMIN, ROL_DOCENTE] },
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
            { component: CNavItem, name: 'Gestión de Docentes', to: '/docentes', navKey: 'nav_docentes_gestion', roles: [ROL_ADMIN] },
            { component: CNavItem, name: 'Carga de notas', to: '/docentes/cargaNotas', navKey: 'nav_docentes_carga_notas', roles: [ROL_ADMIN, ROL_DOCENTE] },
            { component: CNavItem, name: 'Informes', to: '/docentes/informes', navKey: 'nav_docentes_informes', roles: [ROL_ADMIN, ROL_DOCENTE] },
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
            { component: CNavItem, name: 'Gestión de Personal', to: '/personal', navKey: 'nav_gestion_personal', roles: [ROL_ADMIN] },
            { component: CNavItem, name: 'Asistencia', to: '/asistencia', navKey: 'nav_gestion_asistencia', roles: [ROL_ADMIN] },
            { component: CNavItem, name: 'Inscripción a ciclo lectivo', to: '/inscripcion', navKey: 'nav_gestion_inscripcion', roles: [ROL_ADMIN, ROL_DOCENTE] },
            { component: CNavItem, name: 'Materias Previas', to: '/gestion/materias-previas', navKey: 'nav_gestion_previas', roles: [ROL_ADMIN, ROL_DOCENTE] },
            { component: CNavItem, name: 'Informes', to: '/gestion/informes', navKey: 'nav_gestion_informes', roles: [ROL_ADMIN, ROL_DOCENTE] },
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
            { component: CNavItem, name: 'Gestión de Estudiantes', to: '/estudiante', navKey: 'nav_estudiantes_gestion', roles: [ROL_ADMIN, ROL_DOCENTE] },
            { component: CNavItem, name: 'Trayectoria', to: '/estudiante/trayectoria', navKey: 'nav_estudiantes_trayectoria', roles: [ROL_ALUMNO, ROL_ADMIN, ROL_DOCENTE] },
            { component: CNavItem, name: 'Boletín de Calificaciones', to: '/estudiante/boletin', navKey: 'nav_estudiantes_boletin', roles: [ROL_ALUMNO, ROL_ADMIN, ROL_DOCENTE] },
            { component: CNavItem, name: 'Planilla de Calificaciones', to: '/estudiante/planilla-calificaciones', navKey: 'nav_estudiantes_planilla', roles: [ROL_ADMIN, ROL_DOCENTE] },
            { component: CNavItem, name: 'Informe de Asistencia', to: '/estudiante/informe-asistencia', navKey: 'nav_estudiantes_asistencia', roles: [ROL_ALUMNO, ROL_ADMIN, ROL_DOCENTE] },
            { component: CNavItem, name: 'Informes', to: '/estudiante/informes', navKey: 'nav_estudiantes_informes', roles: [ROL_ALUMNO, ROL_ADMIN, ROL_DOCENTE] },
        ],
    },

    // --- CONFIGURACIÓN ---
    {
        component: CNavItem,
        name: 'Notificaciones',
        to: '/configuracion/notificaciones',
        navKey: 'nav_notificaciones',
        icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
        roles: [ROL_ADMIN, ROL_ALUMNO, ROL_DOCENTE],
    },
    {
        component: CNavGroup,
        name: 'Configuración',
        to: '/configuracion',
        icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
        roles: [ROL_ADMIN],
        items: [
            { component: CNavItem, name: 'Configuración General', to: '/configuracion/general', roles: [ROL_ADMIN] },
            { component: CNavItem, name: 'Formatos de Impresión', to: '/configuracion/formatos-impresion', roles: [ROL_ADMIN] },
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
// FUNCIÓN DE FILTRADO 
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
// FUNCIÓN PRINCIPAL: Extracción de Todos los Roles
// --------------------------------------------------------------------------------
/**
 * Obtiene el menú de navegación filtrado según los roles del usuario logueado.
 * @returns {Array} El array de navegación de CoreUI.
 */
const getNavItems = () => {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    let userRoles = [];

    if (user && user.rol_sistema) {
        userRoles = [user.rol_sistema];
    } else if (user && user.tipos_usuario && Array.isArray(user.tipos_usuario)) {
        userRoles = user.tipos_usuario.map(tipo => tipo.cod_tipo_usuario);
    }

    if (userRoles.length === 0) return [];

    // Cargar permisos de navegación configurados para cada rol del usuario
    let configRaw = {}
    try {
        const cfgJson = localStorage.getItem('nav_config')
        if (cfgJson) configRaw = JSON.parse(cfgJson)
    } catch { /* sin permisos persistidos → se usan defaults */ }

    // Construir mapa de permisos activos para los roles del usuario
    const permisosActivos = {}
    for (const rol of userRoles) {
        const mapa = parsePermisos(configRaw[`nav_permisos_${rol}`] ?? null, rol)
        for (const [key, val] of Object.entries(mapa)) {
            // Un ítem se muestra si AL MENOS UNO de los roles del usuario lo habilita
            if (val) permisosActivos[key] = true
        }
    }

    // Filtrar primero por roles, luego por permisos configurados
    const porRoles = filterNavItems(fullNavigation, userRoles);

    const filtrarPorPermisos = (items) =>
        items
            .map(item => {
                if (item.items) {
                    return { ...item, items: filtrarPorPermisos(item.items) }
                }
                return item
            })
            .filter(item => {
                // Ítems sin navKey (títulos, logout) siempre visibles
                if (!item.navKey) return true
                // Si no hay config guardada, mostrar todo (defaults)
                if (Object.keys(configRaw).length === 0) return true
                return permisosActivos[item.navKey] === true
            })
            // Eliminar grupos que quedaron vacíos
            .filter(item => {
                if (item.component === CNavGroup && item.items && item.items.length === 0) return false
                return true
            })

    return filtrarPorPermisos(porRoles)
};

export default getNavItems;