import React from 'react'

//import Usuarios from './views/users/Usuarios';
import UserList from './views/users/UserList';


const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))
const Usuarios = React.lazy(() => import('../src/views/users/Usuarios'))



const routes = [
  { path: '/', exact: true, name: 'Home', element: Usuarios },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/theme', name: 'Theme', element: Colors, exact: true },
  { path: '/theme/colors', name: 'Colors', element: Colors },
  { path: '/theme/typography', name: 'Typography', element: Typography },
  { path: '/usuarios', name: 'Usuarios', element: Usuarios }, // Nueva página
 
  
  /*{ path: '/Usuario', name: 'Usuario', element: UserList },  // Nueva ruta*/
]

export default routes
