import React, { Suspense, useEffect } from 'react'; // Importar React y hooks
import { HashRouter, Route, Routes, Navigate, useLocation } from 'react-router-dom'; // Importar componentes de enrutamiento
import { useSelector } from 'react-redux'; // Importar useSelector para Redux
import { CSpinner, useColorModes } from '@coreui/react'; // Importar componentes de CoreUI
import './scss/style.scss'; // Importar estilos principales
import './scss/examples.scss'; // Importar estilos de ejemplos

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout')); // Importar layout principal

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login')); // Importar Login
const Register = React.lazy(() => import('./views/pages/register/Register')); // Importar Register
const VerifyEmail = React.lazy(() => import('./views/pages/VerifyEmail/VerifyEmail')); // Importar VerifyEmail
const Page404 = React.lazy(() => import('./views/pages/page404/Page404')); // Importar Page404
const Page500 = React.lazy(() => import('./views/pages/page500/Page500')); // Importar Page500
const UserManagement = React.lazy(() => import('./views/UserManagement/UserManagement')); // Importar UserManagement
const Estudiante = React.lazy(() => import('./views/pages/estudiante/estudiante')); // Importar estudiante.jsx
const Docentes = React.lazy(() => import('./views/pages/docentes/Docentes')); // Importar Docentes.jsx



// Componente para manejar useLocation dentro de HashRouter
const RouterContent = () => {
  const location = useLocation(); // Obtener ruta actual
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme'); // Hook para temas
  const storedTheme = useSelector((state) => state.theme); // Obtener tema desde Redux

  useEffect(() => {
    console.log('App.js: Ruta solicitada:', location.pathname, 'Search:', location.search); // Log para depuración
    const urlParams = new URLSearchParams(location.search); // MODIFICACIÓN: Usar location.search
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]; // Extraer tema
    if (theme) {
      setColorMode(theme); // Establecer tema
    }

    if (isColorModeSet()) {
      return; // Salir si el tema está configurado
    }

    setColorMode(storedTheme); // Aplicar tema almacenado
  }, [location.pathname, location.search]); // Dependencias con search

  return (
    <Suspense
      fallback={
        <div className="pt-3 text-center">
          <CSpinner color="primary" variant="grow" /> // Spinner de carga
        </div>
      }
    >
      <Routes>
        <Route exact path="/login" name="Login Page" element={<Login />} /> // Ruta para login
        <Route exact path="/register" name="Register Page" element={<Register />} /> // Ruta para registro
        <Route exact path="/verify-email" name="Verify Email" element={<VerifyEmail />} /> // Ruta para verificación
        <Route exact path="/404" name="Page 404" element={<Page404 />} /> // Ruta para 404
        <Route exact path="/500" name="Page 500" element={<Page500 />} /> // Ruta para 500
        <Route exact path="/" name="Home" element={<Login />} /> // Ruta raíz a login

        <Route path="*" element={<DefaultLayout />}>   Anidados asegura que se rendericen con Menú lateral AppSidebar
          <Route path="Docentes" element={      // Ruta para docentes.jsx
            <ProtectedRoute>
              <Docentes />
            </ProtectedRoute>
          }
          />
          <Route path="estudiante" element={      // Ruta para estudiante.jsx
            <ProtectedRoute>
              <Estudiante />
            </ProtectedRoute>
          }
          />
          <Route path="usuarios" element={    // Ruta para usuarios
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
          />
          <Route path="*" element={<Page404 />} />  // Ruta por defecto (o no definidas) a 404
        </Route>
      </Routes>
    </Suspense>
  );
};

// Componente para proteger rutas
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Verifica si hay token
  return token ? children : <Navigate to="/login" replace />; // Si no hay token, redirige a /login
};

const App = () => {
  return (
    <HashRouter>
      <RouterContent />
    </HashRouter>
  );
};

export default App;