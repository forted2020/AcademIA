// frontend_AcademiA\src\views\gestion\inscripciones\Inscripciones.jsx

import React, { useState, useEffect } from 'react'

import { CCard, CCardHeader, CCardBody, CCardFooter, CRow, CCol, CFormLabel, CFormSelect, CContainer, CListGroup, CListGroupItem } from '@coreui/react';


// Componente Genérico
import GenericInform from '../../../components/informes/GenericInform';


export default function InscripcionCicloLectivo() {

// Inicializamos en '' (vacío) para que no haya ninguno seleccionado al inicio
    const [selectedReportKey, setSelectedReportKey] = useState('');

    // SELECCIÓN DE LA CONFIGURACIÓN ACTIVA
    // Buscamos dentro del diccionario 'reports' la configuración que coincide con la selección

    return (

        <div style={{ padding: '10px' }}>
            <h1 className="ms-1" >Gestión Académica </h1>

            <CContainer>

                <CCard className="mb-1" >       {/* Contenedor que actúa como cuerpo de la tarjeta CCard. Envuelve todo el contenido*/}

                    {/* ----------  HEAD --------------- */}
                    <CCardHeader className="py-2 bg-white ">
                        <CRow className="justify-content-between align-items-center " > {/* Fila en la grilla.*/}
                            <CCol xs={12} sm="auto">    {/* Columna dentro de fila. Ocupa 5 de 12 unidades disponibles. Hereda gutter de CRow*/}
                                <h4 id="titulo" className="mb-0 ">
                                    Inscripciones
                                </h4>
                                <div className="small text-body-secondary"> Inscripciones a Ciclos Lectivos y Exámenes</div>
                            </CCol>
                        </CRow>
                    </CCardHeader>

                    {/* ----------  /HEAD --------------- */}



                    {/* ----------  BODY --------------- */}

                    <CCardBody className="px-4 pt-1 pb-2 border border-light">
                        <CRow className="align-items-end">
                            <CCol md={4}>
                                <CFormLabel className="fw-bold text-primary">
                                    DocentesInformesConfig.mainSelector.label
                                </CFormLabel>
                                <CFormSelect
                                    value={selectedReportKey}
                                    onChange={(e) => setSelectedReportKey(e.target.value)}
                                >
                                    {/* Opción por defecto */}
                                    <option value="">Seleccione...</option>

                                   
                                </CFormSelect>
                            </CCol>

                            <CCol md={8}>
                                {/* Pequeña descripción visual para confirmar qué se está viendo */}
                                <div className="text-muted small mb-1 ms-3">
                                    activeConfig
                                        ? `Mostrando: `
                                        : 'Seleccione un informe'
                                </div>
                            </CCol>

                        </CRow>

                        {/* MOTOR GENÉRICO */}
                            <div className="text-center py-5 text-muted bg-light mt-3 rounded border border-dashed">
                                selectedReportKey === '' 
                                    <div>
                                        <p className="mb-0">Seleccione un <strong>Tipo de Informe</strong> para ver los datos.</p>
                                    </div>
                                    // Caso: se seleccionó pero falló la config (Error)
                                    <div className="text-danger">
                                        <i className="pi pi-exclamation-triangle me-2"></i>
                                        No se encontró configuración para el informe seleccionado.
                                    </div>
                                
                            </div>
                        )







                    </CCardBody>
                    {/* ----------  /BODY --------------- */}


                    {/* ----------  FOOTER --------------- */}
                    <CCardFooter
                        className="bg-white border-top px-3 py-1" >

                        FOOTER

                    </CCardFooter>

                </CCard>



            </CContainer >

        </div>

    )


}