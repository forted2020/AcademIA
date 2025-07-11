import React from 'react'

import { CButton, CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CFormSelect, CFormInput, CFormCheck, CInputGroup, CInputGroupText, CContainer, CModalFooter, CPagination, CPaginationItem, CTableFoot, CAccordion, CAccordionBody, CAccordionHeader, CAccordionItem, } from '@coreui/react'


export default function estudiante() {
    return (
        <CContainer>
            <CCard className="" >       {/* Contenedor que actúa como cuerpo de la tarjeta CCard. Envuelve todo el contenido*/}

                {/* ----------  HEAD --------------- */}
                <CCardHeader className="">
                    <CRow className="j " > {/* Fila en la grilla.*/}
                        <CCol xs={12} sm="auto">    {/* Columna dentro de fila. Ocupa 5 de 12 unidades disponibles. Hereda gutter de CRow*/}
                            <h4 id="titulo" className="mb-0 ">
                                Alumnos
                            </h4>
                            <div className="small text-body-secondary"> Administradores del Alumnos</div>
                        </CCol>
                    </CRow>
                </CCardHeader>

                <CCardBody>

                    <CAccordion flush>
                        
                        <CAccordionItem itemKey={1}>
                            <CAccordionHeader className="my-0" >1er Año</CAccordionHeader>
                            <CAccordionBody className="px-2 py-2" >

                                <CAccordion flush>
                                    <CAccordionItem >
                                        <CAccordionHeader className="py-0">Lengua</CAccordionHeader>
                                        <CAccordionBody>

                                            <CAccordion>
                                                <CAccordionItem >
                                                    <CAccordionHeader>Exámen 1</CAccordionHeader>
                                                    <CAccordionBody>

                                                    </CAccordionBody>
                                                </CAccordionItem>
                                            </CAccordion>

                                        </CAccordionBody>
                                    </CAccordionItem>
                                </CAccordion>




                            </CAccordionBody>
                        </CAccordionItem>

                    </CAccordion>







                </CCardBody>
            </CCard>
        </CContainer>













    )
}
