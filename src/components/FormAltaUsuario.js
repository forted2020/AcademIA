
// FormAltaUsuario.js
import React from 'react';
import { CFormInput, CForm, CCol, CRow, CFormSelect, CButton } from '@coreui/react';



const FormAltaUsuario = ({ id, label, placeholder }) => {
  
  
  return (
    <>
      
      <CForm className="row g-3">
        
        <CCol md={6}>
                <CFormInput type="text" id="inputApellido" label="Apellido" />
        </CCol>

        <CCol md={6}>
                <CFormInput type="text" id="inputNombre" label="Nombre" />
        </CCol>

        <CRow className="mt-4">
          <CCol md={6}>
            <CFormInput type="text" id="inputDomicilio" label="Domicilio" />
          </CCol>
        </CRow>

        <CCol md={6}>
          <CFormSelect
            id="inputProvincia" 
            label="Provincia" 
            aria-label="Selec una provincia"
            options={[
              { label: 'Seleccione una provincia' },
              { label: 'One', value: '1' },
              { label: 'Two', value: '2' },
              { label: 'Three', value: '3'},
            ]}
          />        
        </CCol>
                
        <CCol md={6}>
          <CFormSelect
            id="inputLocalidad" 
            label="Localidad" 
            aria-label="Selec localidad"
            options={[
              { label: 'Seleccione localidad' },
              { label: 'One', value: '1' },
              { label: 'Two', value: '2' },
              { label: 'Three', value: '3'},
            ]}
          />
        </CCol>

        <CCol md={4}>
                <CFormInput type="number" id="inputDNI" label="DNI" />
        </CCol>

        <CCol md={4}>
                <CFormInput type="date" id="inputFecNac" label="Fecha Nacimiento" />
        </CCol>
        
        <div>
        <CCol md={4}>
                <CFormInput type="email" id="Email" label="Email" />
        </CCol>
        </div>

        
        <CRow className="mb-3">
          <CCol>
            <div className="d-flex justify-content-start">
          
              <CButton className="text-white me-2 ms-2 mt-3 mb-3"  color="success" type="submit">
                Guardar
              </CButton>
            
              <CButton className="text-white me-2 ms-2 mt-3 mb-3" color="danger" type="button">
                Cancelar
              </CButton>
          
              <CButton className="me-2 ms-2 mt-3 mb-3" color="secondary" type="reset">
                Reiniciar
              </CButton>
            
            </div>
         
          </CCol>
        </CRow>




      
      
      </CForm>
      



    

    </>
  );
};

export default FormAltaUsuario;

