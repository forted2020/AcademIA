import React,  { useState, useEffect }  from 'react'
import classNames from 'classnames'

import { CButton, CCard, CCardBody, CCardFooter, CCol, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CFormSelect, CFormInput, CInputGroup,  CInputGroupText, CContainer, CModalFooter, CPagination, CPaginationItem, CTableFoot, CCardHeader} from '@coreui/react'

import { cilTrash, cilPencil, cilArrowTop, cilArrowBottom, cilSwapVertical} from '@coreui/icons'

import { CIcon } from '@coreui/icons-react';

import FormAltaUsuario from '../../components/FormAltaUsuario'; // Importa el componente TextInput FormAltaUsuario.js
import { CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react'

import { CSVLink } from "react-csv";

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { saveAs } from 'file-saver'; // Para descargar el archivo
import { PDFViewer } from '@react-pdf/renderer';

import ReactDOM from 'react-dom';

import { compactStyles,detailedStyles } from '../dashboard/pdfFormats/pdfStyles';

import '../../css/PersonalStyles.css'   /* Oculta todo excepto la tabla */


import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table'






 
const Dashboard = () => {
 
    

  return (
    <CContainer>
      <h3>CContainer</h3>
      Los contenedores son un componente fundamental de CoreUI para React.js que contienen, rellenan y alinean su contenido dentro de un dispositivo o ventana gráfica determinados.
     
      <CCard > CCard
        <CCardHeader >
          CCardHeader
        </CCardHeader>
        
        <CCardBody>  
        <CRow className=" d-flex gap-3">
  <CCol sm={6} className="border">Columna 1</CCol>
  <CCol sm={6} className="border">Columna 2</CCol>
</CRow>
          <CRow className='gx-3 align-self-center'>
            <CCol sm={3} className="border border-primary border-1" >border border-primary border-1</CCol>
            <CCol sm={3}className='border border-danger border-2'>border border-danger border-2</CCol>
            <CCol sm={3} className='border border-primary bg-light text-center'>border border-primary bg-light text-center</CCol>
          </CRow>
          <CRow> 
            <CCol sm={4} className="border border-success text-end" >CCol border border-success text-end </CCol>
            <CCol sm={4}className='border border-dark mt-3 mb-2 ms-0 text-start bg-light'>CCol border border-dark mt-3 mb-2 ms-0 text-start bg-light</CCol>
            <CCol sm={4} className='border border-dark mt-3 mb-2 pt-5 pb-3 ps-5 bg-light'>CCol border border-dark mt-3 mb-2 pt-5 pb-3 ps-10 bg-light</CCol>
          </CRow>

        </CCardBody>
        
          <CCardFooter className="px-4 py-2 bg-light"> {/* Fondo claro y padding */}
            

            
          </CCardFooter >

        <CCardBody className="justify-content-center py-1 ">

         

          
        </CCardBody>
        
        <CCardFooter>
          
        </CCardFooter>


      </CCard>
    </CContainer>
  )
}

export default Dashboard
