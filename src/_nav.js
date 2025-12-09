//  AcademIA\src\_nav.js
import React from 'react'
import { CIcon } from '@coreui/icons-react'
import { cilSchool, cilUser, cilAccountLogout, cilBook, cilHome, cilContact, cilDescription } from '@coreui/icons'
import { CNavItem, CNavTitle, CNavGroup } from '@coreui/react'

// --------------------------------------------------------------------------------
// ROLES ACTUALES DEL BACKEND (¡¡¡IMPORTANTÍSIMO!!!)
// --------------------------------------------------------------------------------
const ROL_ADMIN = 'ADMIN';
const ROL_ALUMNO = 'ALUMNO';
const ROL_DOCENTE = 'DOCENTE';

//  Ver si despues se pueden usar los tipos de usuarios para habilitar los menus
//  const ROL = {
//      ADMIN: 'ADMIN_SISTEMA',
//      ALUMNO: 'ALUMNO_APP',
//      DOCENTE: 'DOCENTE_APP', 
//  };


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

// --------------------------------------------------------------------------------
// 2. FUNCIÓN DE FILTRADO
// --------------------------------------------------------------------------------
const filterNavItems = (items, userRole) => {
    return items
        .filter(item => {
            if (item.roles && item.roles.includes(userRole)) {
                return true;
            }
            if (!item.roles) {
                return true;
            }
            return false;
        })
        .map(item => {
            if (item.items) {
                return {
                    ...item,
                    items: filterNavItems(item.items, userRole),
                };
            }
            return item;
        });
};

// --------------------------------------------------------------------------------
// 3. FUNCIÓN PRINCIPAL CON DEBUG
// --------------------------------------------------------------------------------
const getNavItems = () => {
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    const rolSistema = user && user.tipos_usuario && user.tipos_usuario.length > 0
        ? user.tipos_usuario[0].cod_tipo_usuario
        : null;

    console.log('🔍 _nav.js - Usuario en localStorage:', user);
    console.log('🔍 _nav.js - Rol detectado:', rolSistema);

    if (!rolSistema) {
        console.log('❌ No se encontró rol → Menú vacío');
        return [];
    }

    const finalNavItems = filterNavItems(fullNavigation, rolSistema);
    console.log('✅ Menú filtrado con ítems:', finalNavItems.length);

    return finalNavItems;
};

export default getNavItems;