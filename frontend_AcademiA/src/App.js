//  App.js
// Es el punto de entrada de la aplicación

import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'

import { isTokenExpired } from './utils/isTokenExpired'

// Estilos de PrimeReact
import "primereact/resources/themes/lara-light-blue/theme.css"; // Tema
import "primereact/resources/primereact.min.css";           // Core
import "primeicons/primeicons.css";                         // Iconos


//  ----------  Páginas  ----------  
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))  //Layoult Principal, por defecto
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const VerifyEmail = React.lazy(() => import('./views/pages/VerifyEmail/VerifyEmail'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

//const Home = React.lazy(() => import('./views/home/Home'))
const Home = React.lazy(() => import('./views/home/homeDispatcher/HomeDispatcher'))

const UserManagement = React.lazy(() => import('./views/UserManagement/UserManagement'))
const UsuariosInformes = React.lazy(() => import('./views/users/usuariosInformes/UsuariosInformes'))

const InscripcionCicloLectivo = React.lazy(() => import('./views/gestion/inscripciones/Inscripciones'))

const EstudiantesHome = React.lazy(() => import('./views/estudiantes/estudiantesHome/EstudiantesHome'))
const Estudiante = React.lazy(() => import('./views/estudiantes/Estudiantes'))
const EstudiantesInformes = React.lazy(() => import('./views/estudiantes/estudiantesInformes/EstudiantesInformes'))
const Trayectoria = React.lazy(() => import('./views/estudiantes/Trayectoria'))

const Curso = React.lazy(() => import('./views/cursos/Curso'))
const CursoInformes = React.lazy(() => import('./views/cursos/cursosInformes/CursosInformes'))

const Materias = React.lazy(() => import('./views/materias/Materias'))

const GestionInformes = React.lazy(() => import('./views/gestion/gestionInformes/GestionInformes')) 

const MateriasInformes = React.lazy(() => import('./views/materias/MateriasInformes'))
const Docentes = React.lazy(() => import('./views/docentes/Docentes'))
const DocentesInformes = React.lazy(() => import('./views/docentes/docentesInformes/DocentesInformes'))
const DocenteCargaNotas = React.lazy(() => import('./views/docentes/DocenteCargaNotas'))
const Personal = React.lazy(() => import('./views/personal/Personal'))

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
        <Route exact path="/" element={<Navigate to="/login" replace />} />
        <Route exact path="/login" name="Login Page" element={<Login />} />
        <Route exact path="/register" name="Register Page" element={<Register />} />
        <Route exact path="/verify-email" name="Verify Email" element={<VerifyEmail />} />
        <Route exact path="/404" name="Page 404" element={<Page404 />} />
        <Route exact path="/500" name="Page 500" element={<Page500 />} />

        <Route path="*" element={<DefaultLayout />}>
          <Route path="home" element={<ProtectedRoute> <Home /> </ProtectedRoute>} />

          <Route path="docentes" element={<ProtectedRoute>  <Docentes />  </ProtectedRoute>} />
          <Route path="docentes/informes" element={<ProtectedRoute> <DocentesInformes /> </ProtectedRoute>} />
          <Route path="docentes/cargaNotas" element={<ProtectedRoute> <DocenteCargaNotas /> </ ProtectedRoute>} />

          <Route path="inscripcion" element={<ProtectedRoute> <InscripcionCicloLectivo /> </ ProtectedRoute>} />
          <Route path="gestion/informes" element={<ProtectedRoute> <GestionInformes /> </ ProtectedRoute>} />

          <Route path="estudiante/home" element={<ProtectedRoute> <EstudiantesHome /> </ProtectedRoute>} />
          <Route path="estudiante" element={<ProtectedRoute> <Estudiante /> </ProtectedRoute>} />
          <Route path="estudiante/trayectoria" element={<ProtectedRoute> <Trayectoria /> </ProtectedRoute>} />
          <Route path="estudiante/informes" element={<ProtectedRoute> <EstudiantesInformes /> </ProtectedRoute>} />

          <Route path="cursos" element={<ProtectedRoute> <Curso /> </ProtectedRoute>} />
          <Route path="cursos/informes" element={<ProtectedRoute> <CursoInformes /> </ProtectedRoute>} />
          <Route path="materias" element={<ProtectedRoute> <Materias /> </ProtectedRoute>} />
          <Route path="materias/informes" element={<ProtectedRoute> <MateriasInformes /> </ProtectedRoute>} />
          <Route path="personal" element={<ProtectedRoute> <Personal /> </ProtectedRoute>} />

          <Route path="usuarios" element={
            <ProtectedRoute requiredRoles={['ADMIN_SISTEMA']}> <UserManagement /> </ProtectedRoute>} />
          <Route path="usuarios/informes" element={
            <ProtectedRoute requiredRoles={['ADMIN_SISTEMA']}> <UsuariosInformes /> </ProtectedRoute>} />

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
  let user = null
  try {
    user = JSON.parse(localStorage.getItem('user'))
  } catch {
    localStorage.clear()
    return <Navigate to="/login" replace />
  }



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
  useEffect(() => {
    const token = localStorage.getItem('token')

    // Se limpia sólo si el token existe pero está expirado
    if (token && isTokenExpired(token)) {
      localStorage.clear()
    }
  }, [])

  return (
    <HashRouter>
      <RouterContent />
    </HashRouter>
  )

}

export default App