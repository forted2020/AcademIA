
import React, { useState, useEffect } from 'react'
import { CButton, CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CContainer, } from '@coreui/react'
import '../../css/PersonalStyles.css'
import CargarNotas from '../notas/CargaNotas'

// Importamos el hook para leer datos de alumnos de la BD
import { useStudentsData } from '../../hooks/useStudentsData'

export default function DocenteCargaNotas() {
    const { studentsData, setstudentsData, loading } = useStudentsData()

    // Usamos el hook para traer datos y los desestructuramos
    const {
        studentsData: tableData,
        setStudentsData: setTableData,
    } = useStudentsData()

    return (

        <div style={{ padding: '10px' }}>
            <h1 className="ms-1" >Docentes</h1>

            <CContainer>

                <CCard className="mb-1" >       {/* Contenedor que actúa como cuerpo de la tarjeta CCard. Envuelve todo el contenido*/}

                    {/* ----------  HEAD --------------- */}
                    <CCardHeader className="py-2 bg-white ">
                        <CRow className="justify-content-between align-items-center " > {/* Fila en la grilla.*/}
                            <CCol xs={12} sm="auto">    {/* Columna dentro de fila. Ocupa 5 de 12 unidades disponibles. Hereda gutter de CRow*/}
                                <h4 id="titulo" className="mb-0 ">
                                    Carga de Notas
                                </h4>
                                <div className="small text-body-secondary"> Carga de notas de los estudiantes</div>
                            </CCol>
                        </CRow>
                    </CCardHeader>

                    {/* ----------  BODY --------------- */}
                    <CCardBody className="px-4 pt-1 pb-2 border border-light">
                        <CargarNotas />
                    </CCardBody>

                    {/* ----------  FOOTER --------------- */}
                    <CCardFooter
                        className="bg-white border-top px-3 py-1" >
                        FOOTER
                    </CCardFooter>

                </CCard>



            </CContainer >

        </div >

    )


}