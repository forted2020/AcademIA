import React from 'react'
import {CIcon} from '@coreui/icons-react'
import { cilSchool, cilUser, cilAccountLogout, cilBook, cilHome, cilContact, cilDescription} from '@coreui/icons'
import { CNavItem, CNavTitle, CNavGroup} from '@coreui/react'


// Función que genera ítems del menú lateral dinámicamente según tipos_usuario
const getNavItems = () => {
  const user = JSON.parse(localStorage.getItem('user')) || { tipos_usuario: [] };
  const tipos_usuario = user.tipos_usuario || [];

  const navItems = [
    {
      component: CNavTitle,
      name: 'AcademIA',
    },
    {
      component: CNavItem,
      name: 'Inicio',
      to: '/inicio',
      icon: <CIcon icon={cilHome} customClassName="nav-icon" />,
    },
    
    {
      component: CNavGroup,   // Categoría desplegable
      name: 'Estudiantes',
      to: '/estudiante',
      icon: <CIcon icon={cilSchool} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Trayectoria',
          to: '/estudiante',
        },
      ],
    },

    {
      component: CNavGroup,   // Categoría desplegable
      name: 'Cursos',
      to: '/curso',
      icon: <CIcon icon={cilContact} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Gestión de Cursos',
          to: '/curso',
        },
        
      ],
    },


    {
      component: CNavGroup,   // Categoría desplegable
      name: 'Materias',
      to: '/materias',
      icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Gestión de Materias',
          to: '/materia',
        },
        
      ],
    },

    {
      component: CNavItem,
      name: 'Cerrar Sesión',
      to: '#',  // No navega, dispara el modal
      icon: <CIcon icon={cilAccountLogout} customClassName="nav-icon" />,
      onClick: () => window.dispatchEvent(new CustomEvent('logout-request')),   // Dispara evento personalizado
    },
  ];

  
  if (tipos_usuario.includes('ADM')) {
    navItems.splice(2, 0, { // Inserta Usuarios después de AcademIA y antes de Estudiante
      component: CNavGroup,
      name: 'Usuarios',
      to: '/usuarios',
      icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
      items: [          // array con subcategorías CNavItem
        {
          component: CNavItem,
          name: 'Gestión de Usuarios',
          to: '/usuarios',
        },
      ],
    });
  }

  if (tipos_usuario.includes('ADM')) {
    navItems.splice(3, 0, { 
      component: CNavGroup,
      name: 'Docentes',
      to: '/docentes',
      icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
      items: [          // array con subcategorías CNavItem
        {
          component: CNavItem,
          name: 'Gestión de Docentes',
          to: '/docentes',
        },
      ],
    });
  }


  return navItems;
};


export default getNavItems;

