import React, { useState } from 'react'

import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert, // Para mensajes de éxito/error
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilEnvelopeOpen } from '@coreui/icons'
import axios from 'axios'; // Importamos Axios para solicitudes HTTP al endpoint /api/register.

const Register = () => {
  // Estados para los campos del formulario y mensajes
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Función para manejar cambios en los inputs
   const handleChange = (e) => {
    const { name, value } = e.target;
    setErrorMessage(''); // Limpiar errores al escribir
    setSuccessMessage(''); // Limpiar mensaje de éxito al escribir
    if (name === 'name') setName(value);
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
    if (name === 'repeatPassword') setRepeatPassword(value);
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validaciones en el frontend
    if (!name.trim() || !email.trim() || !password.trim() || !repeatPassword.trim()) {
      setErrorMessage('Por favor, completa todos los campos.');
      return;
    }
    if (password !== repeatPassword) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }

    try {
      const response = await axios.post('/api/register', {
        name,
        email,
        password,
        tipo_usuario: 'EST', // Enviar tipo_usuario fijo como "EST"
      });
      
      // Mostrar mensaje de éxito
      setSuccessMessage('Usuario registrado. Por favor, verifica tu correo.');
      
      // Limpiar formulario
      setName('');
      setEmail('');
      setPassword('');
      setRepeatPassword('');
    } catch (err) {
      if (err.response) {
        const errorDetail = err.response.data?.detail || 'Error desconocido';
        if (err.response.status === 400) {
          setErrorMessage(`Error: ${errorDetail}`); // Ej. "El nombre de usuario ya existe"
        } else {
          setErrorMessage(`Error del servidor: ${errorDetail}`);
        }
      } else {
                setErrorMessage('Error de red. Por favor, verifica tu conexión.');
      }
    }
  };
  

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleSubmit}>
                  <h1>Registro</h1>
                  <p className="text-body-secondary">Cree su cuenta de usuario</p>

                  {/* Mostrar mensajes de éxito o error */}
                  {successMessage && (
                    <CAlert color="success" className="mb-3">
                      {successMessage}
                    </CAlert>
                  )}
                  {errorMessage && (
                    <CAlert color="danger" className="mb-3">
                      {errorMessage}
                    </CAlert>
                  )}

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput 
                      placeholder="Nombre de Usuario" 
                      autoComplete="username"
                      name="name"
                      value={name}  // Vincular con el estado
                      onChange={handleChange} // Manejar cambios
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilEnvelopeOpen} />
                    </CInputGroupText>
                    <CFormInput 
                      type = "emil"
                      placeholder="Correo electrónico" 
                      autoComplete="email"
                      name="email"
                      value={email}
                      onChange={handleChange} 
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Contraseña"
                      autoComplete="new-password"
                      name="password"
                      value={password}  // Vincular con estado
                      onChange={handleChange} // Manejar cambios
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Repetir contraseña"
                      autoComplete="new-password"
                      name="repeatPassword"
                      value={repeatPassword} // Vincular con estado
                      onChange={handleChange} // Manejar cambios
                    />
                  </CInputGroup>


                  <div className="d-grid">
                    <CButton 
                      color="success"
                      type="submit"
                    >
                      Crear cuenta
                    </CButton>

                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
