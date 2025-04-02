
// FormAltaUsuario.js

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

import { CFormInput, CForm, CCol, CRow, CFormSelect, CButton, CContainer, CCard, CCardBody, CCardFooter } from '@coreui/react';
import { CInputGroup, CInputGroupText, CDropdown, CDropdownMenu, CDropdownItem, CDropdownToggle, } from '@coreui/react';

import { createUser, updateUser, getUser } from '../api/api'


const FormAltaUsuario = () => {

  const navigate = useNavigate(); // para redirigir al usuario tras guardar los datos

  const { id } = useParams(); // Obtiene parámetros dinámicos de la URL (el id en este caso) si está presente

  const [formData, setFormData] = useState({
    name: '',
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



  // ----------   Actualizar los campos del formulario    ---------- //
  const handleChange = ({ target: { name, value } }) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  // Manejar el envío del formulario al Backend 
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Datos enviados a la API:', formData);

    try {
      if (id) {
        await updateUser(id, formData);
      } else {
        await createUser(formData);
      }
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.detail || 'Error al guardar');
      console.error('Error en la solicitud:', error);
    }

    console.log('Datos enviados a la API:', formData); // Corrige el log


    // Manejar el botón "Cancelar" o "Reiniciar"
    const handleReset = () => {
      setFormData({
        name: '',
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
          <CForm
            className="row g-3 "
            onSubmit={handleSubmit}
          >
            <CCardBody className="p-3 ">


              <CInputGroup className="mb-3">
                <CInputGroupText id="inputGTNombre">Apellido y Nombre</CInputGroupText>
                <CFormInput
                  placeholder=""
                  aria-label="Nombre"
                  name='name'
                  aria-describedby="basic-addon1"
                  value={formData.name}
                  onChange={handleChange} // Actualiza el estado
                />
              </CInputGroup>

              <CInputGroup className="mb-3">
                <CInputGroupText id="inputGTNombre">Contraseña</CInputGroupText>
                <CFormInput
                  placeholder=""
                  aria-label="Password"
                  name='password'
                  aria-describedby="basic-addon1"
                  value={formData.password}
                  onChange={handleChange} // Actualiza el estado.
                />
              </CInputGroup>

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
                      {id ? 'Actualizar' : 'Guardar'}
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
}

export default FormAltaUsuario;

