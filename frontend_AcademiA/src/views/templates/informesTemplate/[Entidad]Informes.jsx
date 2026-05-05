import React, { useState } from 'react';
import { CCard, CCardHeader, CCardBody, CContainer } from '@coreui/react';
import { GenericSelector } from '../../../components/genericSelector/genericSelector/GenericSelector';

// Componentes Core (No modificar)
import GenericInform from '../../../components/informes/GenericInform';
import GenericInformFilters from '../../../components/informes/GenericInformFilters';
import { useInformesData } from '../../../components/informes/hooks/useInformesData';

// Configuración Específica ( CAMBIAR )
import { EntidadInformesConfig } from './EntidadInformesConfig'; 

export default function EntidadInformes() { // (<<<< CAMBIAR NOMBRE COMPONENTE)
    
    const [selectedReportKey, setSelectedReportKey] = useState('');
    
    // Referencia a la Config (<<<< CAMBIAR NOMBRE CONSTANTE)
    const ConfigRef = EntidadInformesConfig; 

    // Lógica Genérica
    const activeConfig = ConfigRef.reports[selectedReportKey] || null;
    const informesData = useInformesData(activeConfig);
    const { seleccion, error: errorFiltros } = informesData;

    const filtrosCompletos = activeConfig 
        ? activeConfig.filters.every(f => !f.required || seleccion[f.key])
        : false;

    const endpointActivo = (activeConfig && filtrosCompletos)
        ? activeConfig.getEndpoint(seleccion)
        : null;

    return (
        <div style={{ padding: '10px' }}>
            <h1 className="ms-1">{ConfigRef.title}</h1> {/* Título Dinámico */}
            <CContainer>
                <CCard className="mb-1">
                    <CCardHeader className="py-2 bg-white">
                        <h4 className="mb-0">{ConfigRef.title}</h4>
                        <div className="small text-muted">{ConfigRef.subtitle}</div>
                    </CCardHeader>

                    <CCardBody className="px-4 pt-3 pb-4 border border-light">
                        {/* Selector de Tipo de Informe */}
                        <div className="mb-4 border-bottom pb-3">
                            <GenericSelector
                                label={ConfigRef.mainSelector.label}
                                options={ConfigRef.mainSelector.options}
                                value={selectedReportKey}
                                onChange={setSelectedReportKey}
                                infoText={activeConfig ? activeConfig.subtitle : 'Seleccione una opción'}
                            />
                        </div>

                        {/* Área de Trabajo */}
                        {activeConfig ? (
                            <div className="animate__animated animate__fadeIn">
                                {/* Filtros */}
                                <div className="bg-light p-3 rounded mb-4 border">
                                    <h6 className="text-primary mb-3 ps-1 border-start border-3 border-primary">
                                        Filtros de Búsqueda
                                    </h6>
                                    <GenericInformFilters 
                                        informesData={informesData} 
                                        config={activeConfig} 
                                    />
                                    {errorFiltros && <div className="text-danger">{errorFiltros}</div>}
                                </div>

                                {/* Resultados */}
                                <GenericInform 
                                    config={activeConfig}
                                    endpoint={endpointActivo}
                                    params={seleccion}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-5 text-muted">
                                Seleccione un tipo de informe para comenzar.
                            </div>
                        )}
                    </CCardBody>
                </CCard>
            </CContainer>
        </div>
    )
}