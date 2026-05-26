//  frontend_AcademiA\src\views\users\usuariosInformes\UsuarioInformes.jsx

import React, { useState } from 'react';
import { CContainer } from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilChart } from '@coreui/icons';
import { GenericSelector } from '../../../components/genericSelector/genericSelector/GenericSelector';
import './UsuariosInformes.css';

// Componentes Core (No cambiar)
import GenericInform from '../../../components/informes/GenericInform';
import GenericInformFilters from '../../../components/informes/GenericInformFilters';
import { useInformesData } from '../../../components/informes/hooks/useInformesData';

// Configuración Específica (<<<< CAMBIAR ESTO)
import { UsuariosInformesConfig } from './UsuariosInformesConfig';

export default function UsuariosInformes() { // (<<<< CAMBIAR NOMBRE COMPONENTE)

    const [selectedReportKey, setSelectedReportKey] = useState('');

    // Referencia a la Config (<<<< CAMBIAR NOMBRE CONSTANTE)
    const ConfigRef = UsuariosInformesConfig;

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
        <CContainer fluid className="py-3">

            {/* ── Card principal ──────────────────────────────────── */}
            <div className="usr-inf-card mb-1">

                {/* ── Encabezado ────────────────────────────────────── */}
                <div className="usr-inf-card-header">
                    <div className="usr-inf-header-brand">
                        <div className="usr-inf-header-brand-icon">
                            <CIcon icon={cilChart} className="usr-inf-brand-icon" />
                        </div>
                        <div>
                            <h2 className="usr-inf-header-h2">Informes de Usuarios</h2>
                            <p className="usr-inf-header-sub">Reportes y estadísticas</p>
                        </div>
                    </div>
                </div>
                {/* ── /Encabezado ───────────────────────────────────── */}

                {/* ── Cuerpo ────────────────────────────────────────── */}
                <div className="usr-inf-card-body">

                    {/* Selector principal de tipo de informe */}
                    <div className="usr-inf-selector-wrap">
                        <GenericSelector
                            label={ConfigRef.mainSelector.label}
                            options={ConfigRef.mainSelector.options}
                            value={selectedReportKey}
                            onChange={setSelectedReportKey}
                            infoText={activeConfig ? activeConfig.subtitle : 'Seleccione una opción'}
                        />
                    </div>

                    {/* Área de trabajo: filtros + resultados */}
                    {activeConfig ? (
                        <div className="usr-inf-workspace animate__animated animate__fadeIn">

                            {/* Sección de filtros */}
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

                            {/* Resultados del informe */}
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
                {/* ── /Cuerpo ───────────────────────────────────────── */}

            </div>
            {/* ── /Card principal ─────────────────────────────────── */}

        </CContainer>
    )
}