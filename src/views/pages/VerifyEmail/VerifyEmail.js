import React, { useEffect, useState } from 'react'; // Para manejar efectos y estados
import { useSearchParams, useNavigate } from 'react-router-dom'; // Para leer parámetros de URL y para redirigir (useNavigate)
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CAlert,
  CButton,
} from '@coreui/react'; // Importar componentes de CoreUI para la UI
import axios from 'axios'; // Para solicitudes HTTP

const VerifyEmail = () => {
  console.log('VerifyEmail: Renderizando componente'); // Log para confirmar renderizado
  const [searchParams] = useSearchParams(); // Obtener parámetros de la URL
  const [successMessage, setSuccessMessage] = useState(''); // Estado para mensaje de éxito
  const [errorMessage, setErrorMessage] = useState(''); // Estado para mensaje de error
  const navigate = useNavigate(); // Hook para redirigir a otras rutas

  // Extrae el token de la URL, envía una solicitud POST a /api/verify-email, y maneja la respuesta (éxito o error). Se ejecuta al cargar el componente
  useEffect(() => {
    console.log('VerifyEmail: Componente cargado'); // Log para confirmar que el componente se ejecuta
    const verifyEmail = async () => {
      const token = searchParams.get('token'); // Extraer el parámetro token de la URL
      console.log('VerifyEmail: Token extraído:', token); // Log para mostrar el token
      if (!token) {
        setErrorMessage('No se proporcionó un token de verificación.'); // Mostrar error si no hay token
        console.log('VerifyEmail: Error: No se proporcionó token'); // Log para error de token
        return;
      }

      try {
        console.log('VerifyEmail: Enviando solicitud a /api/verify-email'); // Log antes de la solicitud
        const response = await axios.post('/api/verify-email', { token }); // Enviar POST a /api/verify-email con el token
        console.log('VerifyEmail: Respuesta recibida:', response.data); // Log para la respuesta
        setSuccessMessage(response.data.detail); // Establecer mensaje de éxito (e.g., "Email verificado correctamente")
        
      } catch (err) {
        console.error('VerifyEmail: Error en la solicitud:', err); // Log para errores
        if (err.response) {
          const errorDetail = err.response.data?.detail || 'Error desconocido'; // Obtener detalle del error
          setErrorMessage(`Error: ${errorDetail}`); // Mostrar error (e.g., "Token inválido")
          console.log('VerifyEmail: Error del servidor:', errorDetail); // Log para error del servidor
        } else {
          setErrorMessage('Error de red. Por favor, verifica tu conexión.'); // Mostrar error de red
          console.log('VerifyEmail: Error de red'); // Log para error de red
        }
      }
    };

    verifyEmail(); // Ejecutar verificación al cargar el componente
  }, [searchParams, navigate]); // Dependencias del useEffect

  //  Función para manejar el clic en el botón Continuar
  const handleContinue = () => {
    console.log('VerifyEmail: Botón Continuar presionado, redirigiendo a /login'); // Log para depuración
    navigate('/login'); // Redirigir al login
  };


  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8} lg={6}>
            <CCard>
              <CCardBody className="p-4">
                <h1>Verificación de Correo</h1> 
                <p className="text-body-secondary">Confirmando dirección de correo</p> 
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
                {(successMessage || errorMessage) && (
                  <CButton color="primary" onClick={handleContinue}>
                    Continuar
                  </CButton>
                )}
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default VerifyEmail;