import React from 'react'

//import Usuarios from './views/users/Usuarios';
import UserList from './views/users/UserList';


const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
//  const Typography = React.lazy(() => import('./views/theme/typography/Typography'))  BORRAR
const Usuarios = React.lazy(() => import('../src/views/users/Usuarios'))
//const Usuarios2 = React.lazy(() => import('./views/users/Usuarios2'))
const Estilos = React.lazy(() => import('../src/views/users/Estilos'))




const routes = [
  { path: '/', exact: true, name: 'Home', element: Usuarios },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/theme', name: 'Theme', element: Colors, exact: true },
  { path: '/theme/colors', name: 'Colors', element: Colors },
  //  { path: '/theme/typography', name: 'Typography', element: Typography },  BORRAR
  { path: '/usuarios', name: 'Usuarios', element: Usuarios }, // Nueva página
 // { path: '/usuarios2', name: 'Usuarios2', element: Usuarios2 }, // Usuarios 2(para pruebas)
  { path: '/estilos', name: 'Estilos', element: Estilos }, //  página Estilos
 
  
  /*{ path: '/Usuario', name: 'Usuario', element: UserList },  // Nueva ruta*/
]

export default routes
