// frontend_AcademiA\src\views\estudiantes\estudiantesInformes\EstudiantesInformes.jsx

// Controla el Estado: Usa useState para recordar qué opción eligió el usuario en el primer select.
// Extrae la Sub-Configuración: Usa EstudiantesInformesConfig.reports[clave] para sacar solo los datos del informe que necesitamos (ej. solo los datos de "Notas" o solo los de "Datos Personales").
// Reinicia completamente cada vez que se cambia la opción principal. Asegura que no se mezclen los datos.

import React, { useState } from 'react';
import { CCard, CCardHeader, CCardBody, CCardFooter, CRow, CCol, CFormLabel, CFormSelect, CContainer, CListGroup, CListGroupItem } from '@coreui/react';
import './EstudiantesInformes.css';

// Componente Genérico
import GenericInform from '../../../components/informes/GenericInform';
// Configuración Jerárquica
import { EstudiantesInformesConfig } from './EstudiantesInformesConfig';

export default function EstudiantesInformes() {

    // Inicializamos en '' (vacío) para que no haya ninguno seleccionado al inicio
    const [selectedReportKey, setSelectedReportKey] = useState('');

    // SELECCIÓN DE LA CONFIGURACIÓN ACTIVA
    // Buscamos dentro del diccionario 'reports' la configuración que coincide con la selección
    const activeConfig = EstudiantesInformesConfig.reports[selectedReportKey];
    console.log('Valor de activeConfig: ', activeConfig)

    return (
        <div className="estudiantes-informes-container" style={{ padding: '10px' }}>
            <h1 className="ms-1" >Estudiantes</h1>

            <CContainer>
                {/*SELECTOR MAESTRO (Siempre visible)*/}
                {/* <CCard className="mb-4 shadow-sm border-top-primary border-top-3"> */}

                <CCard className="mb-1">

                    {/* ---------- ENCABEZADO ---------- */}
                    <CCardHeader className="py-2 bg-white">
                        <CRow className="justify-content-between align-items-center">
                            <CCol xs={12} sm="auto">

                                <h4 id="titulo" className="mb-0">
                                    Informes
                                </h4>

                                <div className="small text-body-secondary">
                                    Informes de alumnos del establecimiento
                                </div>
                            </CCol>
                        </CRow>
                    </CCardHeader>

                    {/* <CCardBody > */}
                    <CCardBody className="px-4 pt-1 pb-2 border border-light">
                        <CRow className="align-items-end">
                            <CCol md={4}>
                                <CFormLabel className="fw-bold text-primary">
                                    {EstudiantesInformesConfig.mainSelector.label}
                                </CFormLabel>
                                <CFormSelect
                                    value={selectedReportKey}
                                    onChange={(e) => setSelectedReportKey(e.target.value)}
                                >
                                    {/* Opción por defecto */}
                                    <option value="">Seleccione...</option>

                                    {EstudiantesInformesConfig.mainSelector.options.map((opt) => (
                                        <option
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.label}
                                        </option>
                                    ))}
                                </CFormSelect>
                            </CCol>

                            <CCol md={8}>
                                {/* Pequeña descripción visual para confirmar qué se está viendo */}
                                <div className="text-muted small mb-1 ms-3">
                                    {activeConfig
                                        ? `Mostrando: ${activeConfig.subtitle || activeConfig.title}`
                                        : 'Seleccione un informe'}
                                </div>
                            </CCol>

                        </CRow>

                        {/* MOTOR GENÉRICO */}
                        {activeConfig ? (

                            <div className="pb-5">


                                <GenericInform
                                    // CLAVE: key={selectedReportKey}
                                    // Al cambiar la key, React destruye el componente anterior y crea uno nuevo. 
                                    // Esto limpia automáticamente los filtros viejos y evita errores al cambiar de tipo de informe.
                                    key={selectedReportKey}

                                    // Pasamos SOLO la sub-configuración elegida
                                    config={activeConfig}
                                />
                            </div>


                        ) : (
                            // Renderizado cuando NO hay config (o no se seleccionó nada)
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
                        )}

                    </CCardBody>
                </CCard>
            </CContainer >
        </div>
    );
}

