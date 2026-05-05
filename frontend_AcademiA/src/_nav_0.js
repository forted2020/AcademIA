//  AcademIA\src\_nav.js

import React from 'react'
import { CIcon } from '@coreui/icons-react'
import { cilSchool, cilUser, cilAccountLogout, cilBook, cilHome, cilContact, cilDescription } from '@coreui/icons'
import { CNavItem, CNavTitle, CNavGroup } from '@coreui/react'

// Función para generar los ítems del menú de navegación lateral
const getNavItems = () => {
  
  // Obtener usuario del localStorage o definir estructura por defecto, para decidir que items mostrar !!!IMPORTANTE!!!!!
  const user = JSON.parse(localStorage.getItem('user')) || { tipos_usuario: [] }
  const tipos_usuario = user.tipos_usuario || []

  // ------------- Ítems base VISIBLES PARA TODOS LOS USUARIOS ------------- 
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

 
  // ------------- Ítems específicos para Administradores (ADM) ------------- 
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
      name: 'Cursos',
      to: '/cursos',
      icon: <CIcon icon={cilContact} customClassName="nav-icon" />,
      items: [
        { component: CNavItem, name: 'Gestión de Cursos', to: '/cursos' }, // "Cuando seleccione el ítem 'Gestión de Cursos", le agregue '/   cursos/ a la URL y me lleve ahí. 
        { component: CNavItem, name: 'Informes', to: '/cursos/informes' },
      ],
    },

    {
      component: CNavGroup,
      name: 'Materias',
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
      to: '/gestion-academica', // Corregido path genérico
      icon: <CIcon icon={cilBook} customClassName="nav-icon" />, // Icono actualizado
      items: [
        { component: CNavItem, name: 'Gestión de Personal', to: '/personal' },
        { component: CNavItem, name: 'Asistencia', to: '/asistencia' },
        { component: CNavItem, name: 'Inscripción a ciclo lectivo', to: '/inscripcion' },
        { component: CNavItem, name: 'Informes', to: '/informes-academicos' },
      ],
    },
  ]



  // ------------- Ítems generales PARA TODOS LOS LOGUEADOS (Estudiantes, Cursos, Materias)  ------------- 
  // ------------- POR EL MOMENTO SE USA EL DEL ADM. hAY QUE REVISAR ESTO CUANDO SE IMPLEMENTEN LOS PERFILES  ------------- 
  const generalItems = [
    {
      component: CNavGroup,
      name: 'Estudiantes',
      to: '/estudiante',
      icon: <CIcon icon={cilSchool} customClassName="nav-icon" />,
      items: [
        { component: CNavItem, name: 'Gestión de Estudiantes', to: '/estudiante' },
        { component: CNavItem, name: 'Trayectoria', to: '/estudiante/trayectoria' },
        { component: CNavItem, name: 'Informes', to: '/estudiante/informes' },
      ],
    },
    {
      component: CNavGroup,
      name: 'Cursos',
      to: '/cursos',
      icon: <CIcon icon={cilContact} customClassName="nav-icon" />,
      items: [
        { component: CNavItem, name: 'Gestión de Cursos', to: '/cursos' },
        { component: CNavItem, name: 'Informes', to: '/cursos/informes' },
      ],
    },
    {
      component: CNavGroup,
      name: 'Materias',
      to: '/materias',
      icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
      items: [
        { component: CNavItem, name: 'Gestión de Materias', to: '/materias' },
        { component: CNavItem, name: 'Informes', to: '/materias/informes' },
      ],
    },
  ]

  // Ítems de cierre de sesión
  const logoutItem = [
    {
      component: CNavItem,
      name: 'Cerrar Sesión',
      to: '#',
      icon: <CIcon icon={cilAccountLogout} customClassName="nav-icon" />,
      onClick: () => window.dispatchEvent(new CustomEvent('logout-request')),
    },
  ]

  
  
  // Construcción del menú final combinando bloques según el tipo de usuario
  let navItems = [...baseItems]

  // Si es administrador, agregamos sus opciones
  if (tipos_usuario.includes('ADM')) {
    navItems = [...navItems, ...adminItems]
  }

  // Agregamos ítems generales y logout
  navItems = [...navItems, ...generalItems, ...logoutItem]

  return navItems
}

export default getNavItems


