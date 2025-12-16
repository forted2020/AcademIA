// src/config/navigation.js

//  Contiene el array estático fullNavigation. Si el menú crece, no afecta el archivo de lógica. 
// Permite que otros módulos (p. ej., un mapa de rutas) consuman esta configuración sin depender de la lógica de CoreUI.

import React from 'react';
import { CIcon } from '@coreui/icons-react';
import {
  cilSchool, cilUser, cilAccountLogout, cilBook, cilHome, cilContact, cilGroup, cilList,
} from '@coreui/icons';
import { CNavItem, CNavTitle, CNavGroup } from '@coreui/react';

// Importamos las constantes de roles (debería existir en src/constants/Roles)
import { ROL_ADMIN, ROL_ALUMNO, ROL_DOCENTE } from '../../constants/Roles';


/**
 * Estructura estática de navegación completa del sistema.
 * Contiene la definición visual y los roles requeridos para cada ítem.
 * Nota: El manejo de onClick para el logout se mantiene aquí por necesidad de componente.
 */
export const fullNavigation = [
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
    roles: [ROL_ADMIN, ROL_DOCENTE],
  },

  // Sub-Menú: USUARIOS
  {
    component: CNavGroup,
    name: 'Usuarios del Sistema',
    to: '/usuarios',
    icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
    roles: [ROL_ADMIN],
    items: [
      { component: CNavItem, name: 'Gestión de Usuarios', to: '/usuarios', roles: [ROL_ADMIN] },
      { component: CNavItem, name: 'Informes de Acceso', to: '/usuarios/informes', icon: <CIcon icon={cilList} customClassName="nav-icon" />, roles: [ROL_ADMIN] },
    ],
  },
  
  // Sub-Menú: DOCENTES (Se asume que hay una gestión separada de la de usuarios)
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
    onClick: () => {
      // Idealmente, esto debería llamar a una función de contexto/global.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    },
  },
];