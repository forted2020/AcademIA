//  frontend_AcademiA\src\components\informes\GenericInform.jsx

// Vista genérica de informes basada en configuración declarativa 

import React from 'react';
import {
    CContainer, CCard, CCardBody, CAlert,
    CRow, CCol, CFormSelect, CFormCheck, CFormLabel
} from '@coreui/react';

import InformMain from '../../components/informes/InformMain';
import { useInforme } from '../../components/informes/useInform';
import { useInformesData } from '../../components/informes/hooks/useInformesData';

export default function GenericInform({ config }) {

    // Para verificar si llegan bien los filtros
    console.log('🤷‍♂️ [GenericInform] Configuraciones recibidas:', config);
    console.log('🤷‍♂️🤷‍♂️ [GenericInform] filters recibidos:', config?.filters);

    // Hook genérico de datos de filtros
    const informesData = useInformesData(config) || {};
    const {
        dataSources = {},
        seleccion = {},
        handleCambio = () => { },
        loading: loadingFiltros = false,
        error: errorFiltros = null
    } = informesData;

    // Validación automática: Recorre los filtros declarados y verifica required
    const filtrosCompletos = config.filters.every(f =>
        !f.required || Boolean(seleccion[f.key])
    );
    console.log('✔ Filtros completos?: ',filtrosCompletos)

    // Endpoint solo se genera si todos los filtros configurados, están completos
    const endpointActivo = filtrosCompletos
        ? config.getEndpoint(seleccion)
        : null;
    console.log('✔✔ endpointActivo: ',endpointActivo)

    const { data, loading, error } = useInforme(
        endpointActivo,
        seleccion,
        config.mapper,
        config.summaryCalculator
    );
    console.log('✔✔✔ Devuelto por useInforme: ',useInforme)


    return (
        <div className="informes-wrapper pb-5"> 1
            <CContainer fluid>2

                {/* Título del informe */}
                {/* <h2 className="fw-bold mb-3">{config.title}</h2> */}

                {/* Filtros */}
                <CCard className="mb-4"> 3
                    <CCardBody> 4
                        <CRow className="g-3"> 
                            5

                            {/* Render dinámico de filtros */}
                            {config.filters.map(filter => {
                                console.log('🔑Filter key:', filter, filter.key, 'Type:', filter.type);

                                const disabled =
                                    filter.dependsOn &&
                                    !seleccion[filter.dependsOn];

                                // Si el tipo es SELECT: 
                                if (filter.type === 'select') {
                                    const options =
                                        filter.options ||
                                        dataSources[filter.key] ||
                                        [];
                                    console.log('🔑🔑 options en select:', options);
                                    return (
                                        <CCol md={3} key={filter.key}>
                                            <CFormLabel>{filter.label}</CFormLabel>
                                            <CFormSelect
                                                value={seleccion[filter.key] || ''}
                                                disabled={disabled}
                                                onChange={(e) =>
                                                    handleCambio(filter.key, e.target.value)
                                                }
                                            >
                                                <option key="__default" value="">
                                                    Seleccione...
                                                </option>

                                                {options.map((opt, idx) => (
                                                    <option
                                                        key={opt[filter.optionValue] || `opt-${idx}`}
                                                        value={opt[filter.optionValue]}
                                                    >
                                                        {opt[filter.optionLabel]}
                                                    </option>
                                                ))}
                                            </CFormSelect>
                                        </CCol>
                                    );
                                }

                                // Si el tipo es un CHECKBOX: 
                                if (filter.type === 'checkbox') {
                                    console.log('🔑🔑🔑 Checkbox: ', filter.key);
                                    return (
                                        <CCol md={3} key={filter.key}>
                                            <CFormCheck
                                                label={filter.label}
                                                checked={Boolean(seleccion[filter.key])}
                                                onChange={(e) =>
                                                    handleCambio(filter.key, e.target.checked)
                                                }
                                            />
                                        </CCol>
                                    );
                                }
                                // Si no es un tipo reconocido, no renderizar nada
                                // pero devolvemos un fragmento vacío CON key para evitar warnings
                                return <React.Fragment key={filter.key} />;
                            })}
                            55
                        </CRow>
                        44
                    </CCardBody>
                    33
                </CCard>

                {/* Errores */}
                {(error || errorFiltros) && (
                    <CAlert color="danger">
                        {error || errorFiltros}
                    </CAlert>
                )}

                {/* Informe */}
                <InformMain
                    config={config}
                    data={data}
                    loading={loading}
                />

            22</CContainer>
        11</div>
    );
}
