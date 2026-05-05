// frontend_AcademiA\src\components\informes\GenericInformFilters.jsx


import React from 'react';
import {
    CContainer, CCard, CCardBody, CAlert,
    CRow, CCol, CFormSelect, CFormCheck, CFormLabel
} from '@coreui/react';

import InformMain from '../../components/informes/InformMain';
import { useInforme } from '../../components/informes/useInform';
import { useInformesData } from '../../components/informes/hooks/useInformesData';


const GenericInformFilters = ({ informesData, config }) => {
    console.log('🎁 Recibido al montar el componente: ', informesData, config)

   // Desestructuramos informesData
    const {
        dataSources = {},           // Objeto con los datos de cada filtro (ciclos, carreras, etc.)
        seleccion = {},             // Objeto con los valores seleccionados actualmente
        handleCambio = () => { }    // Función psara manejar cambios en los filtros
    } = informesData;

    return (
        <div className="pb-5">
            <CContainer fluid>

                {/* Inicio selección de Filtros */}

                {/* Título del informe */}
                {/* <h2 className="fw-bold mb-3">{config.title}</h2> */}

                {/* Filtros */}
                
                <CCard >
                    <CCardBody>
                        <CRow > 
                            <div>1111111111111111111111111111111111111111111 </div>
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
                                            <div>,,,,,,,,,,,,,,,,,,,,,,,,,,    </div>
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
                                            <div>,,,,,,,,,,,,,,,,,,,,,,,,,,    </div>
                                            
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
<div>1111111111111111111111111111111111111111111 </div>
                        </CRow>

                    </CCardBody>

                </CCard>
                {/* FIN selección de Filtros */}

            </CContainer>
        </div>
    );
};
export default GenericInformFilters;
