///  ----------------   PRUEBA    ---------------------
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import '../src/App.css';
///  ----------------   PRUEBA    ---------------------



import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes,  BrowserRouter as Router, useLocation } from 'react-router-dom' //useLocation  - Usado para depurar error
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'

import './scss/examples.scss'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const VerifyEmail = React.lazy(() => import('./views/pages/VerifyEmail/VerifyEmail'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const UserManagement = React.lazy(() => import('./views/UserManagement/UserManagement'));


const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)
  const location = useLocation(); // Obtener la ruta actual - Usado para depurar error

  useEffect(() => {
    console.log('App.js: Ruta solicitada:', location.pathname); // MODIFICACIÓN: Log para mostrar la ruta solicitada
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, [location.pathname]); // Actualizar cuando cambie la ruta  - Usado para depurar error

  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          <Route exact path="/login" name="Login Page" element={<Login />} />   // Ruta para login
          <Route exact path="/register" name="Register Page" element={<Register />} />  // Ruta para registro
          <Route exact path="/verify-email" name="Verify Email" element={<VerifyEmail />} />  // Ruta para verificación de correo
          <Route path="/404" name="Page 404" element={<Page404 />} />  // Ruta para 404
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
          <Route exact path="/usuarios" name="User Management" element={<UserManagement />} /> // Ruta para gestión de usuarios
          <Route exact path="/" name="Home" element={<Login />} />  / Ruta raíz redirige a login
          <Route path="*" name="Not found" element={<Page404 />} />  // Ruta por defecto a 404

        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App


