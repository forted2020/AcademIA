///  ----------------   PRUEBA    ---------------------
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserList from './components/UserList';         // Eliminar tambiñen el archivo
import UserForm from './components/UserForm';         // Eliminar tambiñen el archivo
import UserDetail from './components/UserDetail';     // Eliminar tambiñen el archivo
import FormAltaUsuario from './components/FormAltaUsuario.jsx';     // Eliminar tambiñen el archivo
import '../src/App.css';
///  ----------------   PRUEBA    ---------------------






import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes,  BrowserRouter as Router } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'

// We use those styles to show code examples, you should remove them in your application.
import './scss/examples.scss'

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const UserManagement = React.lazy(() => import('./views/UserManagement/UserManagement'));


const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }

    if (isColorModeSet()) {
      return
    }

    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
          
          <Route exact path="/login" name="Login Page" element={<Login />} />
          <Route exact path="/register" name="Register Page" element={<Register />} />
          <Route exact path="/404" name="Page 404" element={<Page404 />} />
          <Route exact path="/500" name="Page 500" element={<Page500 />} />
         

          {/*  ----------------   PRUEBA    ---------------------  */}
          <Route path="/usuariosapi" element={<UserList />} />

          {/*
          <Route path="/create" element={<UserForm />} />
          <Route path="/edit/:id" element={<UserForm />} />
          */}

          <Route path="/create" element={<FormAltaUsuario />} />
          <Route path="/edit/:id" element={<FormAltaUsuario />} />

          <Route path="/user/:id" element={<UserDetail />} />
          {/*  ----------------   PRUEBA    ---------------------  */}


          <Route path="*" name="Home" element={<DefaultLayout />} />
          
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App
