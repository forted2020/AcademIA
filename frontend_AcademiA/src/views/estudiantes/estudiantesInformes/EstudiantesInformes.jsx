// frontend_AcademiA\src\views\estudiantes\estudiantesInformes\EstudiantesInformes.jsx


import React, { useState } from 'react';
import { CCard, CCardHeader, CCardBody, CContainer, CRow, CCol } from '@coreui/react';
import { GenericSelector } from '../../../components/genericSelector/genericSelector/GenericSelector';

// --- IMPORTACIONES GENÉRICAS  ---
// Componente Genérico
import GenericInform from '../../../components/informes/GenericInform';
import GenericInformFilters from '../../../components/informes/GenericInformFilters';
import { useInformesData } from '../../../components/informes/hooks/useInformesData';

// --- IMPORTACIÓN ESPECÍFICA ---
// Configuración Jerárquica
import { EstudiantesInformesConfig } from './EstudiantesInformesConfig';

import './EstudiantesInformes.css';  // Ver si lo usa


export default function EstudiantesInformes() {

    // Inicializamos en '' (vacío) para que no haya ninguno seleccionado al inicio
    const [selectedReportKey, setSelectedReportKey] = useState('');

    // Usamos la Config de ALUMNOS
    const activeConfig = EstudiantesInformesConfig.reports[selectedReportKey] || null;
    console.log('Valor de activeConfig: ', activeConfig)

    // Instanciamos el hook
    const informesData = useInformesData(activeConfig);
    const { seleccion, error: errorFiltros } = informesData;

    // Validaciones standard
    const filtrosCompletos = activeConfig
        ? activeConfig.filters.every(f => !f.required || seleccion[f.key])
        : false;

    const endpointActivo = (activeConfig && filtrosCompletos)
        ? activeConfig.getEndpoint(seleccion)
        : null;



    return (
        <div style={{ padding: '10px' }}>
            <h1 className="ms-1">Gestión de Alumnos</h1>
            <CContainer>
                <CCard className="mb-1">
                    <CCardHeader className="py-2 bg-white">
                         {/* Títulos dinámicos desde la config */}
                        <h4 className="mb-0">{EstudiantesInformesConfig.title}</h4>
                        <div className="small text-muted">{EstudiantesInformesConfig.subtitle}</div>
                    </CCardHeader>

                    <CCardBody className="px-4 pt-3 pb-4 border border-light">
                        {/* Selector Principal */}
                        <div className="mb-4 border-bottom pb-3">
                            <GenericSelector
                                label={EstudiantesInformesConfig.mainSelector.label}
                                options={EstudiantesInformesConfig.mainSelector.options}
                                value={selectedReportKey}
                                onChange={setSelectedReportKey}
                                infoText={activeConfig ? activeConfig.subtitle : 'Seleccione un reporte'}
                            />
                        </div>

                        {/* Motor de Informe */}
                        {activeConfig ? (
                            <div className="animate__animated animate__fadeIn">
                                <div className="bg-light p-3 rounded mb-4 border">
                                    <h6 className="text-primary mb-3 ps-1 border-start border-3 border-primary">
                                        Filtros
                                    </h6>
                                    <GenericInformFilters 
                                        informesData={informesData} 
                                        config={activeConfig} 
                                    />
                                    {errorFiltros && <div className="text-danger">{errorFiltros}</div>}
                                </div>

                                <GenericInform 
                                    config={activeConfig}
                                    endpoint={endpointActivo}
                                    params={seleccion}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-5 text-muted">
                                Seleccione un tipo de informe.
                            </div>
                        )}
                    </CCardBody>
                </CCard>
            </CContainer>
        </div>
    )
}
