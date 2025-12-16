// AcademIA\src\_nav.js

//  Importa la configuración y las utilidades, y ensambla la función getNavItems.

// ================================================================================
// 1. IMPORTACIONES Y CONSTANTES
// ================================================================================

import { CIcon } from '@coreui/icons-react'
import {
  cilSchool, cilUser, cilAccountLogout, cilBook, cilHome, cilContact, cilDescription,
  cilList, // Agregado para una mejor distinción visual de los informes
  cilGroup,
} from '@coreui/icons'
import { CNavItem, CNavTitle, CNavGroup } from '@coreui/react'

// Importamos las constantes de roles desde su archivo centralizado (Buena Práctica)
import { ROL_ADMIN, ROL_ALUMNO, ROL_DOCENTE } from '../src/constants/Roles';


// ================================================================================
// 2. DEFINICIÓN DEL MENÚ COMPLETO (Estructura Estática)
// ================================================================================

/**
 * Estructura de navegación completa del sistema, incluyendo los roles requeridos
 * para cada ítem.
 */
const fullNavigation = [
  // --- TÍTULO ---
  {
    component: CNavTitle,
    name: 'AcademIA',
  },

  // --- INICIO ---
  {
    component: CNavItem,
    name: 'Inicio',
    to: '/home',
    icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
    roles: [ROL_ADMIN, ROL_ALUMNO, ROL_DOCENTE],
  },

  // --- GESTIÓN DE PERSONAS Y USUARIOS ---
  {
    component: CNavTitle,
    name: 'Gestión de Personas',
    roles: [ROL_ADMIN, ROL_DOCENTE], // Título visible si hay ítems debajo
  },

  // Sub-Menú: USUARIOS (Solo Admin)
  {
    component: CNavGroup,
    name: 'Usuarios del Sistema',
    to: '/usuarios',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />, // Icono cambiado por claridad
    roles: [ROL_ADMIN],
    items: [
      { component: CNavItem, name: 'Gestión de Usuarios', to: '/usuarios', roles: [ROL_ADMIN] },
      { component: CNavItem, name: 'Informes de Acceso', to: '/usuarios/informes', icon: <CIcon icon={cilList} customClassName="nav-icon" />, roles: [ROL_ADMIN] },
    ],
  },

  // Sub-Menú: DOCENTES
  {
    component: CNavGroup,
    name: 'Docentes',
    to: '/docentes',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    roles: [ROL_ADMIN, ROL_DOCENTE],
    items: [
      { component: CNavItem, name: 'Gestión de Docentes', to: '/docentes', roles: [ROL_ADMIN] },
      { component: CNavItem, name: 'Carga de Notas', to: '/docentes/cargaNotas', roles: [ROL_ADMIN, ROL_DOCENTE] },
      { component: CNavItem, name: 'Informes Docentes', to: '/docentes/informes', icon: <CIcon icon={cilList} customClassName="nav-icon" />, roles: [ROL_ADMIN, ROL_DOCENTE] },
    ],
  },

  // Sub-Menú: ESTUDIANTES
  {
    component: CNavGroup,
    name: 'Estudiantes',
    to: '/estudiante',
    icon: <CIcon icon={cilSchool} customClassName="nav-icon" />,
    roles: [ROL_ALUMNO, ROL_ADMIN, ROL_DOCENTE],
    items: [
      { component: CNavItem, name: 'Gestión de Estudiantes', to: '/estudiante', roles: [ROL_ADMIN, ROL_DOCENTE] },
      { component: CNavItem, name: 'Mi Trayectoria Académica', to: '/estudiante/trayectoria', roles: [ROL_ALUMNO, ROL_ADMIN, ROL_DOCENTE] },
      { component: CNavItem, name: 'Informes Estudiantiles', to: '/estudiante/informes', icon: <CIcon icon={cilList} customClassName="nav-icon" />, roles: [ROL_ALUMNO, ROL_ADMIN, ROL_DOCENTE] },
    ],
  },

  // --- GESTIÓN ACADÉMICA Y CURSOS ---
  {
    component: CNavTitle,
    name: 'Gestión Académica',
    roles: [ROL_ADMIN, ROL_DOCENTE],
  },

  // Sub-Menú: CURSOS
  {
    component: CNavGroup,
    name: 'Cursos y Materias',
    to: '/gestion-cursos',
    icon: <CIcon icon={cilContact} customClassName="nav-icon" />,
    roles: [ROL_ADMIN, ROL_DOCENTE],
    items: [
      { component: CNavItem, name: 'Gestión de Cursos', to: '/cursos', roles: [ROL_ADMIN, ROL_DOCENTE] },
      { component: CNavItem, name: 'Gestión de Materias', to: '/materias', roles: [ROL_ADMIN, ROL_DOCENTE] },
      { component: CNavItem, name: 'Informes de Cursos', to: '/cursos/informes', icon: <CIcon icon={cilList} customClassName="nav-icon" />, roles: [ROL_ADMIN, ROL_DOCENTE] },
    ],
  },

  // Sub-Menú: PROCESOS ACADÉMICOS
  {
    component: CNavGroup,
    name: 'Procesos Académicos',
    to: '/procesos-academicos',
    icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
    roles: [ROL_ADMIN, ROL_DOCENTE],
    items: [
      { component: CNavItem, name: 'Gestión de Personal (Admin)', to: '/personal', roles: [ROL_ADMIN] },
      { component: CNavItem, name: 'Control de Asistencia (Admin)', to: '/asistencia', roles: [ROL_ADMIN] },
      { component: CNavItem, name: 'Inscripción a Ciclo Lectivo', to: '/inscripcion', roles: [ROL_ADMIN, ROL_DOCENTE] },
      { component: CNavItem, name: 'Informes Académicos Generales', to: '/informes-academicos', icon: <CIcon icon={cilList} customClassName="nav-icon" />, roles: [ROL_ADMIN, ROL_DOCENTE] },
    ],
  },

  // --- CERRAR SESIÓN ---
  {
    component: CNavItem,
    name: 'Cerrar Sesión',
    to: '/logout',
    icon: <CIcon icon={cilAccountLogout} customClassName="nav-icon" />,
    roles: [ROL_ADMIN, ROL_ALUMNO, ROL_DOCENTE],
    // NOTA: La lógica de la sesión siempre debe ser manejada en un Handler o Context,
    // pero se mantiene aquí para replicar la funcionalidad original.
    onClick: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    },
  },
];


// ================================================================================
// 3. LÓGICA DE NAVEGACIÓN (Funciones de Filtrado y Extracción de Roles)
// ================================================================================

/**
 * Filtra el array de navegación basado en un conjunto de roles del usuario.
 * Soporta la limpieza de grupos vacíos y la lógica Multirrol (AL MENOS UN rol coincide).
 * @param {Array} items - El array de ítems de navegación (CNavItem o CNavGroup).
 * @param {Array<string>} userRoles - Array con todos los códigos de rol del usuario logueado.
 * @returns {Array} El array de navegación filtrado.
 */
const filterNavItems = (items, userRoles) => {
  const userRoleSet = new Set(userRoles);

  // 1. Filtrar recursivamente los sub-ítems y crear una copia con los grupos actualizados.
  const itemsWithFilteredChildren = items.map(item => {
    if (item.items) {
      const filteredItems = filterNavItems(item.items, userRoles);
      return { ...item, items: filteredItems };
    }
    return item;
  });

  // 2. Filtrar el ítem principal (y eliminar grupos vacíos).
  return itemsWithFilteredChildren.filter(item => {
    // Regla A: Ocultar si es un grupo sin ítems visibles (limpieza UX).
    if (item.component === CNavGroup && item.items && item.items.length === 0) {
      return false;
    }

    // Regla B: Si no tiene roles definidos (ej. CNavTitle), es siempre visible.
    if (!item.roles || item.roles.length === 0) {
      return true;
    }

    // Regla C (RBAC Multirrol): Es visible si AL MENOS UNO de los roles del ítem
    // coincide con CUALQUIERA de los roles del usuario (en el Set).
    return item.roles.some(requiredRole => userRoleSet.has(requiredRole));
  });
};


/**
 * Obtiene el array de todos los roles del usuario logueado.
 * Prioriza 'rol_sistema' (nuevo) o utiliza 'tipos_usuario' (antiguo/multirrol).
 * @param {object} user - El objeto de usuario de localStorage.
 * @returns {Array<string>} Un array de códigos de rol (ej. ['ADM', 'DOC']).
 */
const getUserRolesFromLocalStorage = (user) => {
    let roles = [];

    if (!user) {
        return roles;
    }

    // 1. Prioridad a la nueva estructura: rol_sistema (String simple)
    if (user.rol_sistema) {
        roles = [user.rol_sistema];
        // console.log('✅ Estructura ROL_SISTEMA (nuevo) detectada.', roles);
    }
    // 2. Fallback / Soporte a la estructura antigua/multirrol: tipos_usuario (Array de objetos)
    else if (user.tipos_usuario && Array.isArray(user.tipos_usuario)) {
        roles = user.tipos_usuario.map(tipo => tipo.cod_tipo_usuario);
        // console.log('⚠️ Estructura MULTI-ROL (tipos_usuario antiguo) detectada.', roles);
    } else {
        // console.log('❌ No se encontró una estructura de rol válida.');
    }

    return roles;
};

/**
 * Función principal para obtener el menú de navegación filtrado.
 * @returns {Array} El array de navegación de CoreUI listo para renderizar.
 */
const getNavItems = () => {
    // 1. Obtener y parsear el usuario
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;

    // 2. Extraer los roles
    const userRoles = getUserRolesFromLocalStorage(user);

    // Logs de Depuración (activar si es necesario)
    // console.log('🔍 _nav.js - Usuario en localStorage:', user);
    // console.log('🔍 _nav.js - Roles detectados (multirrol):', userRoles);
    
    if (userRoles.length === 0) {
        // console.log('❌ No se encontraron roles → Menú vacío');
        return [];
    }

    // 3. Filtrar y retornar el menú
    const finalNavItems = filterNavItems(fullNavigation, userRoles);
    // console.log('✅ Menú filtrado con ítems finales:', finalNavItems.length);

    return finalNavItems;
};


// ================================================================================
// 4. EXPORTACIÓN
// ================================================================================

export default getNavItems;