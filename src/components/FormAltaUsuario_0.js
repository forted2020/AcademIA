
// FormAltaUsuario.js

import React,  { useState, useEffect }  from 'react'
import { useNavigate, useParams } from 'react-router-dom';

import { CFormInput, CForm, CCol, CRow, CFormSelect, CButton, CContainer, CCard, CCardBody, CCardFooter } from '@coreui/react';
import { CInputGroup, CInputGroupText,CDropdown,CDropdownMenu, CDropdownItem, CDropdownToggle,} from '@coreui/react';

import { createUser, updateUser, getUser } from '../api/api'

const FormAltaUsuario = ({ label, placeholder,name, password, setName, setPassword, handleSaveUser, editId, resetForm  }) => {
  
  const navigate = useNavigate(); // para redirigir al usuario tras guardar los datos
  const { id } = useParams(); // Obtiene parámetros dinámicos de la URL (el id en este caso) si está presente
  
  const [dataForm, setDataForm] = useState({
    nombre: '',
    password: '',
  })

// Carga de datos cuando id está presente
  // Si hay un id en la URL, se llama a getUser(id) para obtener los datos del usuario y llenar el formulario.
    useEffect(() => {
    const loadUser = async () => {
      if (id) {
        const { data } = await getUser(id);
        setFormData(data);
      }
    };
    loadUser();
  }, [id]);

  

  // Función para manejar los cambios en los inputs
  const handleInputNombre = (e) => {      
    const {name, value} = e.target          // Obtiene el name y el value del input
    setDataForm((prevData) => ({
      ...prevData,   // Mantiene los valores anteriores
      [name]: value,   // Actualiza solo el campo correspondiente
    }))}
    
   // Manejar cambios en los campos originales
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDataForm((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

    // Manejar el envío del formulario
    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log('Datos enviados a la API:', dataForm);

      try {
        if (id) {
          await updateUser(id, dataForm);
        } else {
          await createUser(dataForm);
        }
        navigate('/');
      } catch (error) {
        alert(error.response?.data?.detail || 'Error al guardar');
        console.error('Error en la solicitud:', error);
      }
      
      const systemUserData = { name, password }; // Define solo los datos que quieres enviar
      console.log('Datos enviados a la API:', systemUserData); // Corrige el log
      console.log('Datos de usuario de sistema:', systemUserData); // Usa la misma variable para consistencia
      //handleSaveUser(systemUserData); // Envía solo name y password


    };


  // Manejar el botón "Cancelar" o "Reiniciar"
  const handleReset = () => {
    setDataForm({
      nombre: '',
      password: ''
    });
    if (editId) {
      resetForm(); // Si está en modo edición, limpia también name y password
    } else {
      setName(''); // Limpia los campos de usuario de sistema
      setPassword('');
    }
  };

  
  return (
    <CContainer className="mb-4 ">
      <CCard className="mb-4 ">
      <h2>{id ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
        <CForm className="row g-3 " onSubmit={() => {handleSubmit}}>    {/* No aplicar estilos al CForm*/}
          
          <CCardBody className="p-3 ">
    
          <c-input-group className="shadow-sm border-0 mb-0 size=sm">
            <CInputGroup className="mb-3">
              <CInputGroupText id="inputGTNombre">Apellido y Nombre</CInputGroupText>
              <CFormInput 
                placeholder="" 
                aria-label="Nombre"
                name='nombre'
                aria-describedby="basic-addon1"
                value={dataForm.nombre}
                onChange={handleInputNombre} // Actualiza el estado con cada cambio
              />
            </CInputGroup>

            <CInputGroup className="mb-3">
              <CInputGroupText id="inputGTNombre">Contraseña</CInputGroupText>
              <CFormInput 
                placeholder="" 
                aria-label="Password"
                name='password'
                aria-describedby="basic-addon1"
                value={dataForm.password}
                onChange={handleInputNombre} // Actualiza el estado con cada cambio
              />
            </CInputGroup>
          </c-input-group>

          <hr /> {/* Separador visual */}
            <h5>Datos de Usuario de Sistema</h5>
        </CCardBody>

      <CCardFooter className="px-4 py-0 bg-light"> {/* Fondo claro  */}
        <CRow className="mb-3">
          <CCol>
            <div className="d-flex justify-content-end">
          
              <CButton 
                className="text-white me-2 ms-2 mt-3 mb-3"  
                color="success" 
                type="submit"
              >
              {/*{editId ? 'Actualizar' : 'Guardar'} */}
              Guardar
              </CButton>
            
              <CButton 
                className="text-white me-2 ms-2 mt-3 mb-3" 
                color="danger" 
                //onClick={editId ? resetForm : handleReset}
                onClick={handleReset}
              >
                Cancelar
              </CButton>
          
              <CButton 
                className="me-2 ms-2 mt-3 mb-3" 
                color="secondary" 
                type="reset"
                onClick={handleReset}
              >
                Reiniciar
              </CButton>
            
            </div>
         
          </CCol>
        </CRow>
      </CCardFooter>
      </CForm >




      
      
      
      



      
      </CCard>
    </CContainer>
  );
};

export default FormAltaUsuario;

