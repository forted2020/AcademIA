//  src\views\pages\login\Login.js
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom' // Importa useNavigate para la redirección
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

import { login } from '../../../api/api'; // Importar la función login desde api.js

import { useAuth } from '../../../context/AuthContext'; // Importamos el hook para obtener los datos de 

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Estado para manejar los mensajes de error
  const navigate = useNavigate(); // Inicializa useNavigate para la redirección

  // Obtenemos la función del contexto. Se llama login en el useAuth, por eso 
  // la llamamos 'authLogin', para que no choque con la función 'Login' que se importa de la API
  const { login: authLogin } = useAuth(); 


  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input cambiado: ${name}=${value}`);    // Depuración
    if (name === 'username') {
      setUsername(value);
    } else if (name === 'password') {
      setPassword(value);
    }
    setError(''); // Limpia el mensaje de error cada vez que cambia un campo
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Limpiar localStorage para evitar datos residuales de sesiones anteriores
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    console.log('username.trim():', username.trim(), 'password.trim():', password.trim()); // Depuración

    if (!username.trim() || !password.trim()) {
      setError('Por favor, ingrese usuario y contraseña.');
      console.log('Error establecido: Por favor, ingrese usuario y contraseña.'); // Depuración
      return;
    }

    const loginData = {
      name: username,
      password: password,
    };
    console.log('Cuerpo de la solicitud a /api/login:', JSON.stringify(loginData));


    try {
      // Llama a la API de login del backend
      console.log('Enviando solicitud a /api/login...');
      
      //  Llamada a la API
      const response = await login(loginData);

      // Captura de datos. El backend devuelve 'user'
      const { access_token, user } = response.data; // 🌟 CAPTURAMOS el objeto 'user'

      // El rol está en la lista user.rol_sistema, y la clave es cod_tipo_usuario.
      //  const rolSistema = user.tipo_rol.cod_tipo_usuario; // EXTRAEMOS el valor final del rol
      const rolSistema = user.rol_sistema; // EXTRAEMOS el valor final del rol

      // Almacena el token en localStorage para mantener la sesión
      localStorage.setItem('token', access_token);

      // Guardamos el objeto 'user' completo (incluye id_entidad)
      localStorage.setItem('user', JSON.stringify(user));
      console.log('Token guardado:', localStorage.getItem('token'));
      console.log('Usuario guardado:', localStorage.getItem('user'));

      // Lógica de redirección basada en rol_sistema
      console.log('Login exitoso. Rol:', rolSistema, 'Redirigiendo...');

      if (rolSistema === 'ADMIN' || rolSistema === 'ADMIN_SISTEMA') {
        navigate('/home');
      } else if (rolSistema === 'ALUMNO' || rolSistema === 'ALUMNO_APP') {
        navigate('/home');
      } else if (rolSistema === 'DOCENTE'|| rolSistema === 'DOCENTE_APP') {
        navigate('/home'); // o la ruta que corresponda para docentes
      } else {
        setError('Rol de usuario no reconocido. Contacte a soporte.');
        localStorage.removeItem('token'); // Limpiar token si el rol es inválido
        localStorage.removeItem('user');
        return;
      }

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
                        type="text"
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


                    {/*}  Bloque de selección de ROL - eliminado
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
                  */}

                    {/* Bloque de Error */}
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
