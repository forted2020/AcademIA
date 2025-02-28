import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilExternalLink,
  cilNotes,
  cilPencil,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilUser,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: 'CNavTitle',
    name: 'Administración',
  },

  {
    component: 'CNavItem',
    name: 'Usuarios',
    to: '/Usuarios',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },  

  {
    component: 'CNavItem',
    name: 'UsuariosLista',
    to: '/UserList',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  },  

 
]

export default _nav
