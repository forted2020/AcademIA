import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'

// Contenedores
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Páginas
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const VerifyEmail = React.lazy(() => import('./views/pages/VerifyEmail/VerifyEmail'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const UserManagement = React.lazy(() => import('./views/UserManagement/UserManagement'))
const Estudiante = React.lazy(() => import('./views/estudiantes/estudiante'))
const Trayectoria = React.lazy(() => import('./views/estudiantes/Trayectoria'))
const Docentes = React.lazy(() => import('./views/docentes/Docentes'))

// Hook personalizado para sincronizar el tema desde la URL o Redux
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
const RouterContent = () => {
  useThemeSync() // Sincronizar tema

  return (
    <Suspense
      fallback={
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" />
        </div>
      }
    >
      <Routes>
        <Route exact path="/login" name="Login Page" element={<Login />} />
        <Route exact path="/register" name="Register Page" element={<Register />} />
        <Route exact path="/verify-email" name="Verify Email" element={<VerifyEmail />} />
        <Route exact path="/404" name="Page 404" element={<Page404 />} />
        <Route exact path="/500" name="Page 500" element={<Page500 />} />
        <Route exact path="/" name="Home" element={<Login />} />

        {/* Rutas protegidas anidadas bajo el Layout Principal */}
        <Route path="*" element={<DefaultLayout />}>
          <Route
            path="Docentes"
            element={
              <ProtectedRoute>
                <Docentes />
              </ProtectedRoute>
            }
          />
          <Route
            path="estudiante"
            element={
              <ProtectedRoute>
                <Estudiante />
              </ProtectedRoute>
            }
          />
          <Route
            path="estudiante/trayectoria"
            element={
              <ProtectedRoute>
                <Trayectoria />
              </ProtectedRoute>
            }
          />
          <Route
            path="usuarios"
            element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          {/* Ruta por defecto para cualquier otra URL no coincidente dentro del layout */}
          <Route path="*" element={<Page404 />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

// Componente para proteger rutas (requiere token)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  // Si no hay token, redirige al login
  return token ? children : <Navigate to="/login" replace />
}

const App = () => {
  return (
    <HashRouter>
      <RouterContent />
    </HashRouter>
  )
}

export default App