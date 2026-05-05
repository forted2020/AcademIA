// Ejemplo de componente de Informes (con informes para Alumnos)

import React, { useState } from 'react';
import { CCard, CCardHeader, CCardBody, CContainer, CRow, CCol } from '@coreui/react';
import { GenericSelector } from '../../../components/genericSelector/genericSelector/GenericSelector';

// --- IMPORTACIONES GENÉRICAS (¡Esto no cambia!) ---
import GenericInform from '../../../components/informes/GenericInform';
import GenericInformFilters from '../../../components/informes/GenericInformFilters';
import { useInformesData } from '../../../components/informes/hooks/useInformesData';

// --- IMPORTACIÓN ESPECÍFICA (¡ESTO ES LO ÚNICO QUE CAMBIA!) ---
import { AlumnosInformesConfig } from './AlumnosInformesConfig'; // <--- CAMBIO AQUÍ

export default function AlumnosInformes() {
    const [selectedReportKey, setSelectedReportKey] = useState('');

    // Usamos la Config de ALUMNOS
    const activeConfig = AlumnosInformesConfig.reports[selectedReportKey] || null;

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
                        <h4 className="mb-0">{AlumnosInformesConfig.title}</h4>
                        <div className="small text-muted">{AlumnosInformesConfig.subtitle}</div>
                    </CCardHeader>

                    <CCardBody className="px-4 pt-3 pb-4 border border-light">
                        {/* Selector Principal */}
                        <div className="mb-4 border-bottom pb-3">
                            <GenericSelector
                                label={AlumnosInformesConfig.mainSelector.label}
                                options={AlumnosInformesConfig.mainSelector.options}
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