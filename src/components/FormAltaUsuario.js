
// FormAltaUsuario.js
import React from 'react';
import { CFormInput, CForm, CCol, CRow, CFormSelect, CButton, CContainer, CCard, CCardBody, CCardFooter } from '@coreui/react';
import { CInputGroup, CInputGroupText,CDropdown,CDropdownMenu, CDropdownItem, CDropdownToggle,} from '@coreui/react';



const FormAltaUsuario = ({ id, label, placeholder }) => {

  const guardar = () => {
  //Leemos los datos de data/datos.json
    useEffect(() => {
      // Realizar la solicitud fetch
      fetch('../../../data/datos.json')
        .then(response => response.json())  // Convertimos la respuesta a formato JSON
        .then(data => {
          setTableData(data);  // Actualizamos el estado con los datos cargados
          })
        .catch(error => {
          console.error('Error al cargar los datos:', error);
          });
        }
  
  





  return (
    <CContainer>
      <CCard className="mb-4">
      <CForm className="row g-3">
        <CCardBody className="p-3" >
      

      <c-input-group className="shadow-sm border-0 mb-0 size=sm">

        <CInputGroup className="mb-3">
          <CInputGroupText id="inputNombre">Apellido y Nombre</CInputGroupText>
          <CFormInput placeholder="" aria-label="Nombre" aria-describedby="basic-addon1" />
        </CInputGroup>

        <CInputGroup className="mb-3">
          <CInputGroupText id="inputDomicilio">Domicilio</CInputGroupText>
          <CFormInput placeholder="" aria-label="Domicilio" aria-describedby="basic-addon1" />
        </CInputGroup>

        <CInputGroup className="mb-3">
          <CInputGroupText id="inputProvincia" aria-label="Provincia" >Provincia</CInputGroupText>
          <CFormSelect id="inputGroupSelect01" >
              <option> Seleccione una provincia</option>
              <option value='1'>Entre Ríos</option>
              <option value='2'>Santa Fé</option>
              <option value='3'>Mendoza</option>
          </CFormSelect>
        </CInputGroup>

        <CInputGroup className="mb-3">
          <CInputGroupText id="inputLocalidad" aria-label="Localidad" >Localidad</CInputGroupText>
          <CFormSelect id="inputGroupSelect01" >
              <option> Seleccione una localidad</option>
              <option value='1'>Paraná</option>
              <option value='2'>Nogoyá</option>
              <option value='3'>Viale</option>
          </CFormSelect>
        </CInputGroup>

        <CInputGroup className="mb-3">
          <CInputGroupText id="inputDNI">Documento de Identidad</CInputGroupText>
          <CFormInput placeholder="" aria-label="DNI" aria-describedby="basic-addon1" />
        </CInputGroup>

        <CInputGroup className="mb-3">
          <CInputGroupText id="inputFecNac">Fecha de Nacimiento</CInputGroupText>
          <CFormInput placeholder="" aria-label="Fecha de nacimiento" type="date" aria-describedby="basic-addon1" />
        </CInputGroup>

        <CInputGroup className="mb-3">
          <CInputGroupText id="inputEmail">Email</CInputGroupText>
          <CFormInput placeholder="" aria-label="Email" type="email" aria-describedby="basic-addon1" />
        </CInputGroup>


        </c-input-group>
      </CCardBody>
      </CForm>


      <CCardFooter className="px-4 py-0 bg-light"> {/* Fondo claro  */}


        <CRow className="mb-3">
          <CCol>
            <div className="d-flex justify-content-end">
          
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
      </CCardFooter>




      
      
      
      



      
      </CCard>
    </CContainer>
  );
};

export default FormAltaUsuario;

