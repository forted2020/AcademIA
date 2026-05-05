//  AcademIA\src\_nav.js

import React from 'react'
import { CIcon } from '@coreui/icons-react'
import { cilSchool, cilUser, cilAccountLogout, cilBook, cilHome, cilContact, cilDescription } from '@coreui/icons'
import { CNavItem, CNavTitle, CNavGroup } from '@coreui/react'

// Función para generar los ítems del menú de navegación lateral
const getNavItems = () => {

  // Obtenemos el objeto 'user' y accedemos a rol_sistema
  const userJson = localStorage.getItem('user');
  // Si no hay userJson, definimos una estructura por defecto que no romperá al buscar el rol
  const user = userJson ? JSON.parse(userJson) : { rol_sistema: null };

// Definimos rolSistema con la ruta anidada correcta.
  const rolSistema = user ? user.tipo_rol?.tipo_roles_usuarios : null; // 🌟 EL VALOR CLAVE

  // Definimos los roles que son considerados 'Administradores' para mostrar el menú completo
  const IS_ADMIN = rolSistema === 'ADMIN_SISTEMA';


  // Definimos los roles que son considerados 'Estudiantes'
  const IS_ALUMNO = rolSistema === 'ALUMNO_APP';

  // ------------- Ítems base VISIBLES PARA TODOS LOS USUARIOS LOGUEADOS ------------- 
  const baseItems = [
    {
      component: CNavTitle,
      name: 'AcademIA',
    },
    {
      component: CNavItem,
      name: 'Inicio',
      to: '/home',
      icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
    },
  ]


  // ------------- Ítems específicos para Administradores (ADMIN_SISTEMA) ------------- 
  // Estos ítems SOLO se agregarán si IS_ADMIN es true
  const adminItems = [
    {
      component: CNavGroup,
      name: 'Usuarios',
      to: '/usuarios',
      icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
      items: [
        { component: CNavItem, name: 'Gestión de Usuarios', to: '/usuarios' },
        { component: CNavItem, name: 'Informes', to: '/usuarios/informes' },
      ],
    },

    {
      component: CNavGroup,
      name: 'Cursos (ADM)', // Cambiado a (ADM) temporalmente para diferenciar
      to: '/cursos',
      icon: <CIcon icon={cilContact} customClassName="nav-icon" />,
      items: [
        { component: CNavItem, name: 'Gestión de Cursos', to: '/cursos' },
        { component: CNavItem, name: 'Informes', to: '/cursos/informes' },
      ],
    },

    {
      component: CNavGroup,
      name: 'Materias (ADM)', // Cambiado a (ADM) temporalmente para diferenciar
      to: '/materias',
      icon: <CIcon icon={cilContact} customClassName="nav-icon" />,
      items: [
        { component: CNavItem, name: 'Gestión de Materias', to: '/materias' },
        { component: CNavItem, name: 'Informes', to: '/materias/informes' },
      ],
    },

    {
      component: CNavGroup,
      name: 'Docentes',
      to: '/docentes',
      icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
      items: [
        { component: CNavItem, name: 'Gestión de Docentes', to: '/docentes' },
        { component: CNavItem, name: 'Carga de notas', to: '/docentes/cargaNotas' },
        { component: CNavItem, name: 'Informes', to: '/docentes/informes' },
      ],
    },
    {
      component: CNavGroup,
      name: 'Gestión Académica',
      to: '/gestion-academica',
      icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
      items: [
        { component: CNavItem, name: 'Gestión de Personal', to: '/personal' },
        { component: CNavItem, name: 'Asistencia', to: '/asistencia' },
        { component: CNavItem, name: 'Inscripción a ciclo lectivo', to: '/inscripcion' },
        { component: CNavItem, name: 'Informes', to: '/informes-academicos' },
      ],
    },
  ]



  // ------------- Ítems específicos para Estudiantes (ALUMNO_APP) ------------- 
  const studentItems = [
    {
      component: CNavGroup,
      name: 'Mi Trayectoria',
      to: '/estudiante/trayectoria',
      icon: <CIcon icon={cilSchool} customClassName="nav-icon" />,
      items: [
        { component: CNavItem, name: 'Mi Perfil', to: '/estudiante' },
        { component: CNavItem, name: 'Mis Calificaciones', to: '/estudiante/notas' },
        { component: CNavItem, name: 'Mis Cursos', to: '/estudiante/cursos' },
      ],
    },
  ]

  // Ítems de cierre de sesión
  const logoutItem = [
    {
      component: CNavItem,
      name: 'Cerrar Sesión',
      to: '/logout', 
      icon: <CIcon icon={cilAccountLogout} customClassName="nav-icon" />,
      onClick: () => {
        // Limpiamos los datos y forzamos la recarga o redirección al login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      },
    },
  ]



  // Construcción del menú final combinando bloques según el rol del usuario
  let navItems = [...baseItems]

  // Lógica de inclusión basada en rol_sistema

  if (IS_ADMIN) {
    // Si es administrador, agregamos el menú completo de administración
    navItems = [...navItems, ...adminItems];
  } else if (IS_ALUMNO) {
    // Si es estudiante, agregamos su menú específico
    navItems = [...navItems, ...studentItems];
  }
  // NOTA: Si hubiera roles de Docente (DOCENTE_APP), se agregaría su lógica aquí

  // Agregamos el ítem de logout (visible solo si hay un rol definido, es decir, si está logueado)
  if (rolSistema) {
    navItems = [...navItems, ...logoutItem]
  }

  // 🚨 NOTA IMPORTANTE: Los ítems 'generalItems' originales (Estudiantes, Cursos, Materias) que tenías
  // fueron eliminados o clasificados como 'adminItems' o 'studentItems' para evitar duplicidad y 
  // confusiones de acceso. Si un ítem debe ser visible para TODOS (ADM y ALUMNO), agrégalo a `baseItems`.

  return navItems
}

// 🚨 Para asegurarnos de que la navegación se actualice dinámicamente, usaremos una exportación simple
// y llamaremos a la función getNavItems cuando sea necesario en el layout principal.
// O simplemente exportamos la función si tu estructura actual lo maneja bien.
export default getNavItems