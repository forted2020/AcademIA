import React, {useState} from 'react'
import { CButton, CCol, CForm, CFormCheck, CFormInput, CFormSelect } from '@coreui/react'
import { CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react'
import FormAltaUsuario from '../components/FormAltaUsuario'; // Importa el componente TextInput FormAltaUsuario.js



const MiPagina = () => {
  
  const [visibleXL, setVisibleXL] = useState(false)

  return (

    <CForm className="row g-3">

      <CCol md={6}>
        <CFormInput type="email" id="inputEmail4" label="Email" />
      </CCol>

      <CCol md={6}>
        <CFormInput type="password" id="inputPassword4" label="Password" />
      </CCol>
      <CCol xs={12}>
        <CFormInput id="inputAddress" label="Address" placeholder="1234 Main St" />
      </CCol>
      <CCol xs={12}>
        <CFormInput
          id="inputAddress2"
          label="Address 2"
          placeholder="Apartment, studio, or floor"
        />
      </CCol>





      <CCol xs={20}>
        <CFormCheck type="checkbox" id="gridCheck" label="Check  1" />
      </CCol>


      <CCol xl={2}>
        <CButton color="primary" type="submit">
          Guardar
        </CButton>
      </CCol>

      <CCol xs={2}>
        <CButton color="primary" type="submit" onClick={() => setVisibleXL(!visibleXL)}>
          Nuevo
        </CButton>
      </CCol>

      <CModal
        size="xl"
        visible={visibleXL}
        onClose={() => setVisibleXL(false)}
        aria-labelledby="OptionalSizesExample1"
      >
        <CModalHeader>
          <CModalTitle id="OptionalSizesExample1">Nuevo usuario</CModalTitle>
        </CModalHeader>
        <CModalBody>
        <FormAltaUsuario id="modalInput1" label="Nuevo Campo 1" placeholder="Escribe algo aquí..." />


        </CModalBody>
      </CModal>
    
    
    
    
    </CForm>
  )
}

export default MiPagina
