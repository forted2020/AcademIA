import React from 'react'

// Importación de componentes
// import UserList from './views/users/UserList'; // (Comentado originalmente, mantener si es necesario o borrar)

// Importación dinámica del Home
const HomeDispatcher = React.lazy(() => import('./views/home/homeDispatcher/HomeDispatcher'));


// Carga perezosa (Lazy loading) de componentes para mejorar el rendimiento
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Usuarios = React.lazy(() => import('../src/views/users/Usuarios'))
const Estilos = React.lazy(() => import('../src/views/users/Estilos'))

// Definición de rutas de la aplicación
const routes = [
  { path: '/', exact: true, name: 'Home', element: HomeDispatcher },
  { path: '/home', name: 'Inicio', element: HomeDispatcher },
  //{ path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/theme', name: 'Theme', element: Colors, exact: true },
  { path: '/theme/colors', name: 'Colors', element: Colors },
  { path: '/usuarios', name: 'Usuarios', element: Usuarios }, // Gestión de usuarios
  { path: '/estilos', name: 'Estilos', element: Estilos }, // Página de estilos
]

export default routes
