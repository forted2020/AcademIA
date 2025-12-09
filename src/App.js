//  App.js
// Es el punto de entrada de la aplicación

import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'

//  ----------  Páginas  ----------  
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))  //Layoult Principal, por defecto
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const VerifyEmail = React.lazy(() => import('./views/pages/VerifyEmail/VerifyEmail'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const UserManagement = React.lazy(() => import('./views/UserManagement/UserManagement'))
const Home = React.lazy(() => import('./views/home/Home'))
const Estudiante = React.lazy(() => import('./views/estudiantes/Estudiantes'))
const EstudiantesInformes = React.lazy(() => import('./views/estudiantes/EstudiantesInformes'))
const Trayectoria = React.lazy(() => import('./views/estudiantes/Trayectoria'))
const Curso = React.lazy(() => import('./views/cursos/Curso'))
const CursoInformes = React.lazy(() => import('./views/cursos/CursoInformes'))
const Materias = React.lazy(() => import('./views/materias/Materias'))
const MateriasInformes = React.lazy(() => import('./views/materias/MateriasInformes'))
const Docentes = React.lazy(() => import('./views/docentes/Docentes'))
const DocenteInformes = React.lazy(() => import('./views/docentes/DocenteInformes'))
const DocenteCargaNotas = React.lazy(() => import('./views/docentes/DocenteCargaNotas'))

//  Usar React.lazy permite cargar el código de las páginas sólo cuando se vsite por el usuario. Mejora el tiempo de carga inicial de la aplicación.


// Hook personalizado para sincronizar el modo de color o tema desde la URL o Redux (Ligth o Dark)
const useThemeSync = () => {
  const location = useLocation()
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const themeFromUrl = urlParams.get('theme')

    if (themeFromUrl) {
      // Validar que el tema sea alfanumérico básico para evitar inyecciones
      const cleanTheme = themeFromUrl.match(/^[A-Za-z0-9\s]+/)?.[0]
      if (cleanTheme) {
        setColorMode(cleanTheme)
        return
      }
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, [location.search, isColorModeSet, setColorMode, storedTheme])
}

// Componente que contiene el contenido del Router y usa el hook de tema
//  Componente principal del enrutamiento.
const RouterContent = () => {
  useThemeSync() // Sincronizar tema. Aplica el tema antes de renderizar las rutas.

  return (
    <Suspense   // Envuelve todo el enrutamiento en un <Suspense > para mostrar el indicador (CSpinner) miestras se carga
      fallback={
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      }
    >
      {/* Rutas púbilcas / singulares.  Tienen acceso directo, sin usar el DefaultLayout */}
      <Routes>
        <Route exact path="/login" name="Login Page" element={<Login />} />
        <Route exact path="/register" name="Register Page" element={<Register />} />
        <Route exact path="/verify-email" name="Verify Email" element={<VerifyEmail />} />
        <Route exact path="/404" name="Page 404" element={<Page404 />} />
        <Route exact path="/500" name="Page 500" element={<Page500 />} />
        <Route exact path="/" name="Home" element={<Login />} />

        {/* Rutas protegidas anidadas bajo el Layout Principal (DefaultLayout) */}
        {/* Actúa como el contenedor principal para todas las demás rutas. Asegura que páginas como /home, /docentes, /estudiante, etc., se rendericen dentro del DefaultLayout (es decir, con el encabezado, el pie de página y el menú lateral de CoreUI). */}

        {/* Estructura del enrutamiento
          <Route: Componente que le "dice" al router que componente renderizar cuando la URL coincide con el path especificado
          path="estudiante" : Define el segmento de URL que activará esta ruta. En este caso será, /estudiante 
          element: Define el elemento (componente) que se debe renderizar cuando el path coincide. En este caso "Estudiante"
          <ProtectedRoute>: El componente a renderizar se "envuelve" en ProtectedRoute, que verifica si el usuario está autenticado.
          <Estudiante />: Componente que contiene la interfaz a renderizar. Tiene que haber sido importado con React.lazy()  
        */}


        <Route path="*" element={<DefaultLayout />}>

          <Route path="home" element={<ProtectedRoute> <Home /> </ProtectedRoute>} />

          <Route path="docentes" element={<ProtectedRoute>  <Docentes />  </ProtectedRoute>} />
          <Route path="docentes/informes" element={<ProtectedRoute> <DocenteInformes /> </ProtectedRoute>} />
          <Route path="docentes/cargaNotas" element={<ProtectedRoute> <DocenteCargaNotas /> </ ProtectedRoute>} />

          <Route path="estudiante" element={<ProtectedRoute> <Estudiante /> </ProtectedRoute>} />
          <Route path="estudiante/trayectoria" element={<ProtectedRoute> <Trayectoria /> </ProtectedRoute>} />
          <Route path="estudiante/informes" element={<ProtectedRoute> <EstudiantesInformes /> </ProtectedRoute>} />

          <Route path="cursos" element={<ProtectedRoute> <Curso /> </ProtectedRoute>} />
          <Route path="cursos/informes" element={<ProtectedRoute> <CursoInformes /> </ProtectedRoute>} />

          <Route path="materias" element={<ProtectedRoute> <Materias /> </ProtectedRoute>} />
          <Route path="materias/informes" element={<ProtectedRoute> <MateriasInformes /> </ProtectedRoute>} />

          <Route path="usuarios" element={<ProtectedRoute> <UserManagement /> </ProtectedRoute>} />

          {/* Ruta por defecto para cualquier otra URL no coincidente dentro del layout */}
          <Route path="*" element={<Page404 />} />

        </Route>
      </Routes>
    </Suspense>
  )
}

// Componente para proteger rutas (requiere token Y rol)
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  // Verificar Autenticación (Token)
  const token = localStorage.getItem('token')
  // Si no hay token, redirige al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Si el token existe, verificar Autorización (Rol)
  // Obtener los datos del usuario del localStorage
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const rolSistema = user?.rol_sistema; // Usamos optional chaining por seguridad

  // Si la ruta no requiere roles específicos, permitir el acceso (e.g., /home)
  if (requiredRoles.length === 0) {
    return children;
  }

  // Si la ruta requiere roles, verificar si el rol del usuario está incluido
  if (rolSistema && requiredRoles.includes(rolSistema)) {
    return children;
  }

  // Si el usuario está autenticado pero no tiene el rol requerido
  // NOTA: Podrías redirigir a una página 403 (No Autorizado) en lugar de /404
  console.log('Acceso denegado. Rol:', rolSistema, 'Roles requeridos:', requiredRoles);
  return <Navigate to="/404" replace />;

}

const App = () => {
  return (
    <HashRouter>
      <RouterContent />
    </HashRouter>
  )
}

export default App