// frontend_AcademiA\src\views\cursos\cursosInformes\CursosInformes.jsx


import React, { useState } from 'react'
import { CCard, CCardHeader, CCardBody, CContainer, CRow, CCol } from '@coreui/react';
import { GenericSelector } from '../../../components/genericSelector/genericSelector/GenericSelector'

// Importamos los componentes hijos 
import GenericInform from '../../../components/informes/GenericInform';
import GenericInformFilters from '../../../components/informes/GenericInformFilters'; 

// Importamos la lógica y configuración
import { CursosInformesConfig } from './CursosInformesConfig';
import { useInformesData } from '../../../components/informes/hooks/useInformesData'; 

export default function CursosInformes() {

    // Estado local solo para saber QUÉ informe quiere ver el usuario (la "key")
    const [selectedReportKey, setSelectedReportKey] = useState('');
    
    // Obtenemos la configuración completa del informe seleccionado (o undefined si no hay nada)
    const activeConfig = CursosInformesConfig.reports[selectedReportKey] || null;

    // Invocación del hook (lifting state up)
    // Instanciamos el hook AQUÍ en el padre. 
    // Le pasamos 'activeConfig', para que el el hook sepa qué filtros buscar.
    // Si activeConfig cambia, el hook se resetea solo (gracias al useEffect interno).
    const informesData = useInformesData(activeConfig);
    
    // Desestructuramos lo que necesitamos para la UI
    const { seleccion, error: errorFiltros } = informesData;


    // Lógica de validación de pre-render
    // Verificamos: ¿Están todos los filtros obligatorios llenos?
    // "every" devuelve true solo si TODOS cumplen la condición.
    const filtrosCompletos = activeConfig 
        ? activeConfig.filters.every(f => !f.required || seleccion[f.key])
        : false;

    // Calculamos el Endpoint Final solo si tenemos configuración y filtros listos.
    // Si no, endpointActivo es null (y GenericInform sabrá que debe esperar).
    const endpointActivo = (activeConfig && filtrosCompletos)
        ? activeConfig.getEndpoint(seleccion)
        : null;

    return (
        <div style={{ padding: '10px' }}>
            <h1 className="ms-1">Cursos</h1>
            <CContainer>
                <CCard className="mb-1">
                    
                    {/* CABECERA ESTÁTICA */}
                    <CCardHeader className="py-2 bg-white">
                        <CRow className="justify-content-between align-items-center">
                            <CCol xs={12} sm="auto">
                                <h4 className="mb-0">Informes de Cursos</h4>
                                <div className="small text-muted">Reportes y gestión académica</div>
                            </CCol>
                        </CRow>
                    </CCardHeader>

                    <CCardBody className="px-4 pt-3 pb-4 border border-light">
                        
                        {/* SELECCIÓN DEL TIPO DE INFORME */}
                        <div className="mb-2 pb-1">
                            <GenericSelector
                                label={CursosInformesConfig.mainSelector.label}
                                options={CursosInformesConfig.mainSelector.options}
                                value={selectedReportKey}
                                onChange={setSelectedReportKey}
                                // Mostramos subtítulo dinámico según selección
                                infoText={activeConfig ? activeConfig.subtitle : 'Seleccione una opción'}
                            />
                        </div>

                        {/* Solo renderizamos el área de trabajo si hay un informe seleccionado */}
                        {activeConfig ? (
                            <div className="animate__animated animate__fadeIn">
                                
                                {/* ÄREA DE FILTROS (Gestionada por el padre, renderizada por el hijo) */}
                                <div className="bg-light p-3 rounded mb-4 border">
                                    <h6 className="text-primary mb-2 ps-1 border-3 border-primary">
                                        Filtros de Búsqueda
                                    </h6>
                                    
                                    <GenericInformFilters 
                                        informesData={informesData} // Pasamos la data del hook
                                        config={activeConfig}       // Pasamos la config para que sepa qué pintar
                                    />
                                    
                                    {/* Mensaje de error específico de carga de filtros (ej. falló API Cursos) */}
                                    {errorFiltros && (
                                        <div className="alert alert-warning mt-2 py-2">
                                            <i className="pi pi-exclamation-triangle me-2"></i>
                                            {errorFiltros}
                                        </div>
                                    )}
                                </div>

                                {/* 3. ÁREA DE RESULTADOS */}
                                <GenericInform 
                                    config={activeConfig}
                                    endpoint={endpointActivo} // Pasamos null o la URL válida
                                    params={seleccion}        // Pasamos los filtros para el request
                                />
                            </div>
                        ) : (
                            // Placeholder cuando no hay nada seleccionado
                            <div className="text-center py-5 text-muted">
                                <i className="cil-chart-line display-4 mb-3 text-secondary"></i>
                                <p>Por favor, seleccione un tipo de informe para comenzar.</p>
                            </div>
                        )}

                    </CCardBody>
                </CCard>
            </CContainer>
        </div>
    )
}