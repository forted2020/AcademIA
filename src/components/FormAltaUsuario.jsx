
// FormAltaUsuario.js

import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom';

import { CFormInput, CForm, CCol, CRow, CFormSelect, CButton, CContainer, CCard, CCardBody, CCardFooter } from '@coreui/react';
import { CInputGroup, CInputGroupText, CDropdown, CDropdownMenu, CDropdownItem, CDropdownToggle, } from '@coreui/react';

import { createUser, updateUser, getUser } from '../api/api'


const FormAltaUsuario = ({ initialData, onSubmit, onCancel }) => {       // maneja datos iniciales initialData = {} y onSubmit 
  console.log('Props recibidas en FormAltaUsuario:', { initialData, onSubmit, onCancel });

  const defaultFormData = {     //  Porque si no trae algún dato, queda en null y se rompe.
    name: '',
    domicilio: '',
    telefono: '',
    email: '',
    password: '',
  };

  const { id } = useParams(); // Obtiene parámetros dinámicos de la URL (el id en este caso) si está presente. Es para editar.

  const [formData, setFormData] = useState({ ...defaultFormData, ...initialData})

  // Actualizar formData cuando cambie initialData, asegurando valores definidos

  useEffect(() => {
    setFormData({...defaultFormData, ...initialData });
  }, [initialData]);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Estado para el modal



  // Carga de datos cuando id está presente. Es decir, se está editando un registro ya existente (con id)
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
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };



  // Manejar el envío del formulario al Backend 
  const handleSubmit = (e) => {
    e.preventDefault(); 
    console.log('Entró');
    if (!formData.name || !formData.password) {
      alert('Por favor, completa todos los campos');
      return;
    }
      console.log('Datos enviados a onSubmit:', formData);
      onSubmit(formData); // Llama a la función pasada desde Dashboard
  };

  const handleClear = () => {
    setFormData(defaultFormData);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <CForm
      onSubmit={handleSubmit}
    >
      <CCard>
        <CCardBody className="p-3 ">

          <CInputGroup className="mb-3">
            <CInputGroupText id="inputGTNombre">Apellido y Nombreeeeeeeeeeeeeee</CInputGroupText>
            <CFormInput
              placeholder=""
              aria-label="Nombre"
              name='name'
              aria-describedby="basic-addon1"
              value={formData.name || ''}
              onChange={handleChange} // Actualiza el estado
            />
          </CInputGroup>

          <CInputGroup className="mb-3">
            <CInputGroupText id="inputGTNombre">Mail</CInputGroupText>
            <CFormInput
              placeholder=""
              aria-label="Mail"
              name='email'
              aria-describedby="basic-addon1"
              value={formData.email || ''}
              onChange={handleChange} // Actualiza el estado
            />
          </CInputGroup>

          <CInputGroup className="mb-3">
            <CInputGroupText id="inputGTNombre">Domicilio</CInputGroupText>
            <CFormInput
              placeholder=""
              aria-label="Domicilio"
              name='domicilio'
              aria-describedby="basic-addon1"
              value={formData.domicilio || ''}
              onChange={handleChange} // Actualiza el estado
            />
          </CInputGroup>

          <CInputGroup className="mb-3">
            <CInputGroupText id="inputGTNombre">Teléfonooo</CInputGroupText>
            <CFormInput
              placeholder=""
              aria-label="Telefono"
              name='telefono'
              aria-describedby="basic-addon1"
              value={formData.telefono || ''}
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
              value={formData.password || ''}
              onChange={handleChange} // Actualiza el estado.
            />
          </CInputGroup>

          <hr /> {/* Separador visual */}

        </CCardBody>
      

      <CCardFooter>
        <div className="d-flex gap-2">
          <CButton
            color="primary"
            type="submit"

          >
            Guardar
          </CButton>
          <CButton color="secondary" onClick={handleClear}>
            Limpiar
          </CButton>
          <CButton color="danger" onClick={handleCancel}>
            Cancelar
          </CButton>
        </div>
      </CCardFooter>
      </CCard>
    </CForm>
  );

}



export default FormAltaUsuario;

