import React, { useState } from 'react'
import { Link, useNavigate  } from 'react-router-dom' // Importa useNavigate para la redirección
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
// import axios from 'axios'; // Importa axios para hacer las peticiones a la API
import { login } from '../../../api/api'; // Importar la función login desde api.js

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('EST'); // Estado para tipo_usuario
  const [error, setError] = useState(''); // Estado para manejar los mensajes de error
  const navigate = useNavigate(); // Inicializa useNavigate para la redirección

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input cambiado: ${name}=${value}`);    // Depuración
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    } else if (name === 'tipo_usuario') { // Manejar cambio de tipo_usuario
      setTipoUsuario(value);
    }
    setError(''); // Limpia el mensaje de error cada vez que cambia un campo
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Limpiar localStorage para evitar datos residuales de sesiones anteriores
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    console.log('Formulario enviado:', { username, password, tipo_usuario: tipoUsuario }); // Depuración
    console.log('username.trim():', username.trim(), 'password.trim():', password.trim()); // Depuración
    
    if (!username.trim() || !password.trim()) {
      setError('Por favor, ingrese usuario y contraseña.');
      console.log('Error establecido: Por favor, ingrese usuario y contraseña.'); // Depuración
      return;
    }

    const loginData = {
      name: username,
      password: password,
      tipo_usuario: tipoUsuario, // Asegura que se usa el valor de tipoUsuario ("EST" o "ADM")
    };
    console.log('Cuerpo de la solicitud a /api/login:', JSON.stringify(loginData));


    try {
      // Llama a la API de login del backend
      console.log('Enviando solicitud a /api/login...');
      // const response = await axios.post('http://localhost:8000/api/login', {
      // const response = await axios.post('/api/login', {
      const response = await login(loginData);

      // Si la autenticación es exitosa, el backend devuelve un token y otra información
      const { access_token, tipos_usuario } = response.data;

      // Almacena el token en localStorage para mantener la sesión
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify({ tipos_usuario }));
      console.log('Token guardado:', localStorage.getItem('token')); // Log para depuración

      // Redirigir después del login según el tipo de usuario 
      console.log('Login exitoso. Redirigiendo...');
      if (tipos_usuario.includes('ADM')) {
        navigate('/usuarios');
      } else if (tipos_usuario.includes('EST')) {
        navigate('/estudiante');
      } else {
        setError('Tipo de usuario no reconocido.');
        return;
      }
      // navigate('/usuarios'); // Redirige a '/dashboard' usando react-router-dom

    } catch (err) {
      console.error('Error completo:', err); // Depuración
      console.error('Respuesta del servidor:', err.response); // Depuración
      // Maneja diferentes tipos de errores de la API
      if (err.response) {
        console.log('Datos de la respuesta:', err.response.data); // Depuración
        // El servidor respondió con un código de error
        const errorDetail = err.response.data?.detail || 'Error desconocido';
        if (err.response.status === 401) {
          setError('Credenciales inválidas. Por favor, intente nuevamente.');
          console.log('Error establecido: Credenciales inválidas.'); // Depuración
        } else if (err.response.status === 403) {
          setError(`Acceso denegado: ${errorDetail}`);
          console.log(`Error establecido: Acceso denegado: ${errorDetail}`); // Depuración
        } else if (err.response.status === 404) {
          setError('Endpoint no encontrado. Verifique la configuración del servidor.');
          console.log('Error establecido: Endpoint no encontrado.'); // Depuración
        } else {
          setError(`Error del servidor: ${err.response.status} - ${errorDetail}`);
          console.log(`Error establecido: Error del servidor: ${err.response.status} - ${errorDetail}`); // Depuración
        }
      } else if (err.request) {
        // La petición no recibió respuesta (error de red)
        setError('Error de red. Por favor, verifique su conexión e intente nuevamente.');
        console.log('Error establecido: Error de red.'); // Depuración
      } else {
        // Error al configurar la petición
        setError('Error al iniciar sesión. Por favor, intente nuevamente.');
        console.log('Error establecido: Error al iniciar sesión.'); // Depuración
      }
    }
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}> {/* Asocia el formulario con la función handleSubmit */}
                    <h1>Iniciar sesión</h1>
                    <p className="text-body-secondary">Inicia sesión en tu cuenta</p>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput 
                        type = "text"
                        name="username" // Agrega el atributo 'name' para el manejo del estado
                        placeholder="Usuario (Email o Nombre)"
                        value={username}
                        onChange={handleChange} // Asocia el input con la función handleChange
                        autoComplete="username" 
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        name="password"  // Atributo 'name' para el manejo del estado
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => {
                          console.log('Password input cambiado:', e.target.value); // Depuración específica
                          handleChange(e);
                        }}
                        autoComplete="current-password"
                      />
                    </CInputGroup>

                    <CInputGroup className="mb-3">
                      <CInputGroupText>Tipo de usuario</CInputGroupText>
                      <CFormSelect
                        name="tipo_usuario"
                        value={tipoUsuario}
                        onChange={handleChange}
                      >
                        <option value="EST">Estudiante</option>
                        <option value="ADM">Administrador</option>
                      </CFormSelect>
                    </CInputGroup>

                    {error ? (
                      <div
                        style={{
                          color: 'red',
                          marginBottom: '1rem',
                          fontWeight: 'bold',
                          minHeight: '1.5rem',
                        }}
                        data-testid="error-message" // Para depuración
                      >
                      {error}
                    </div>
                    ) : (
                      <div style={{ minHeight: '1.5rem' }} /> // Espacio reservado cuando no hay error
                    )}

                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" type="submit" className="px-4">
                          Iniciar sesión
                        </CButton>
                      </CCol>
                      
                      <CCol xs={6} className="text-right">
                        <Link to="/forgot-password">
                          <CButton color="link" className="px-0">
                            Olvidó su contraseña?
                          </CButton>
                        </Link>

                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sistema de Gestión Académica</h2>
                    <p>
                    Bienvenido al Sistema de Gestión Académica. 
                    Por favor, inicie sesión para acceder a su cuenta.
                    </p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Registrarse
                      </CButton>
                    </Link>                  
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
