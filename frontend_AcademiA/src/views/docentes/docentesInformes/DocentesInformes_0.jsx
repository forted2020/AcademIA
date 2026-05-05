// frontend_AcademiA\src\views\docentes\docentesInformes\DocentesInformes.jsx

/*
Para elselect principal, se aplica el concept o patrón de "Levantar el Estado" (Lifting State Up):
    El Padre (DocenteInformes) es el "dueño" del estado, porque él decide qué informe mostrar.
    El Hijo (MainSelector) debe ser "tonto" (stateless): solo recibe el valor actual y avisa al padre cuando el usuario cambia la selección.
*/

import React, { useState, useEffect } from 'react'

import { CCard, CCardHeader, CCardBody, CCardFooter, CRow, CCol, CFormLabel, CFormSelect, CContainer, CListGroup, CListGroupItem } from '@coreui/react';

import '../../../css/PersonalStyles.css'

// Componente Genérico
import GenericInform from '../../../components/informes/GenericInform';

// Configuración Jerárquica
import { DocentesInformesConfig } from './DocentesInformesConfig';

import { GenericSelector } from '../../../components/genericSelector/genericSelector/GenericSelector'



export default function DocenteInformes() {

    // Inicializamos en '' (vacío) para que no haya ninguno seleccionado al inicio
    const [selectedReportKey, setSelectedReportKey] = useState('');

    // SELECCIÓN DE LA CONFIGURACIÓN ACTIVA
    // Buscamos dentro del diccionario 'reports' la configuración que coincide con la selección
    const activeConfig = DocentesInformesConfig.reports[selectedReportKey];
    console.log('Valor de activeConfig: ', activeConfig)


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
                                    Informes de Docentes
                                </h4>
                                <div className="small text-body-secondary"> Reportes y listados</div>
                            </CCol>
                        </CRow>
                    </CCardHeader>

                    {/* ----------  /HEAD --------------- */}



                    {/* ----------  BODY --------------- */}

                    <CCardBody className="px-4 pt-1 pb-2 border border-light">
                        <CRow className="align-items-end">
                            <CCol md={10}>
                                <div>
                                    {/* Selector Genérico,para seleccionar tipo de informe */}
                                    <GenericSelector
                                        // Datos estáticos del selector (Label y Opciones)
                                        label={DocentesInformesConfig.mainSelector.label}
                                        options={DocentesInformesConfig.mainSelector.options}

                                        // Estado y Control
                                        value={selectedReportKey}
                                        onChange={setSelectedReportKey}


                                        // Texto dinámico: calcula el subtítulo y lo pasa como string simple
                                        infoText={activeConfig
                                            ? `${activeConfig.subtitle || activeConfig.title}`
                                            : 'Seleccione un informe para comenzar'}
                                    />

                                </div>
                                
                            </CCol>
                        </CRow>

                        {/* MOTOR GENÉRICO */}
                        { console.log('😃 Valor de activeConfig pasado a GenericInform: ', activeConfig)}

                        {activeConfig ? (
                            
                            <GenericInform
                                // CLAVE: key={selectedReportKey}
                                // Al cambiar la key, React destruye el componente anterior y crea uno nuevo. 
                                // Esto limpia automáticamente los filtros viejos y evita errores al cambiar de tipo de informe.
                                key={selectedReportKey}

                                // Pasamos SOLO la sub-configuración elegida
                                config={activeConfig}
                            />
                        ) : (

                            // Renderizado - Mensaje cuando NO hay config (o no se seleccionó nada)
                            <div className="text-center py-5 text-muted bg-light mt-3 rounded border border-dashed">
                                {selectedReportKey === '' ? (
                                    // Caso: No ha seleccionado nada
                                    <div>
                                        <p className="mb-0">Seleccione un <strong>Tipo de Informe</strong> para ver los datos.</p>
                                    </div>
                                ) : (
                                    // Caso: se seleccionó pero falló la config (Error)
                                    <div className="text-danger">
                                        <i className="pi pi-exclamation-triangle me-2"></i>
                                        No se encontró configuración para el informe seleccionado.
                                    </div>
                                )}
                            </div>
                            

                        )
                        }







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