// frontend_AcademiA\src\views\estudiantes\estudiantesInformes\EstudiantesInformes.jsx

import React, { useState } from 'react';
import { CContainer } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilChartPie } from '@coreui/icons';

import { GenericSelector } from '../../../components/genericSelector/genericSelector/GenericSelector';
import GenericInform from '../../../components/informes/GenericInform';
import GenericInformFilters from '../../../components/informes/GenericInformFilters';
import { useInformesData } from '../../../components/informes/hooks/useInformesData';
import { EstudiantesInformesConfig } from './EstudiantesInformesConfig';

import '../../users/usuariosInformes/UsuariosInformes.css';


export default function EstudiantesInformes() {

    const [selectedReportKey, setSelectedReportKey] = useState('');

    const ConfigRef = EstudiantesInformesConfig;
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
        <CContainer fluid className="py-3">

            <div className="usr-inf-card mb-1">

                {/* ── Encabezado ── */}
                <div className="usr-inf-card-header">
                    <div className="usr-inf-header-brand">
                        <div className="usr-inf-header-brand-icon">
                            <CIcon icon={cilChartPie} className="usr-inf-brand-icon" />
                        </div>
                        <div>
                            <h2 className="usr-inf-header-h2">Informes de Gestión Académica</h2>
                            <p className="usr-inf-header-sub">Reportes y estadísticas de alumnos</p>
                        </div>
                    </div>
                </div>

                {/* ── Cuerpo ── */}
                <div className="usr-inf-card-body">

                    <div className="usr-inf-selector-wrap">
                        <GenericSelector
                            label={ConfigRef.mainSelector.label}
                            options={ConfigRef.mainSelector.options}
                            value={selectedReportKey}
                            onChange={setSelectedReportKey}
                            infoText={activeConfig ? activeConfig.subtitle : 'Seleccione una opción'}
                        />
                    </div>

                    {activeConfig ? (
                        <div className="usr-inf-workspace animate__animated animate__fadeIn">
                            <div className="usr-inf-filters-section">
                                <p className="usr-inf-filters-title">Filtros de Búsqueda</p>
                                <GenericInformFilters
                                    informesData={informesData}
                                    config={activeConfig}
                                />
                                {errorFiltros && (
                                    <div className="usr-inf-filters-error">{errorFiltros}</div>
                                )}
                            </div>
                            <GenericInform
                                config={activeConfig}
                                endpoint={endpointActivo}
                                params={seleccion}
                            />
                        </div>
                    ) : (
                        <div className="usr-inf-placeholder">
                            Seleccione un tipo de informe para comenzar.
                        </div>
                    )}

                </div>

            </div>

        </CContainer>
    );
}
