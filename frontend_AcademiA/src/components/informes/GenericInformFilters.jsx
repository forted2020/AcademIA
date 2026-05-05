// frontend_AcademiA\src\components\informes\GenericInformFilters.jsx

import React from 'react';
import { CContainer, CCard, CCardBody, CRow, CCol, CFormCheck } from '@coreui/react';
import { GenericSelector } from '../../components/genericSelector/genericSelector/GenericSelector';

/**
 * Orquestador de filtros dinámicos.
 * Actúa como "Middleman" (intermediario) entre la configuración/datos crudos y los componentes visuales.
 * * PROPS RECIBIDAS:
 * @param {Object} informesData - Objeto que viene del hook personalizado (useInformesData).
 * - dataSources: { key: [ArrayCrudo] } -> Datos traídos de la API.
 * - seleccion: { key: valor } -> Estado actual de los filtros.
 * - handleCambio: func -> Función para actualizar el estado.
 * @param {Object} config - El objeto de configuración definido en el archivo Config.js (filtros, types, keys).
 *  
 *  * RESPONSABILIDAD:
 * 1. Iterar sobre la configuración de filtros.
 * 2. Calcular dependencias (si un filtro debe estar disabled).
 * 3. NORMALIZAR DATOS: Transformar {id_ciclo, nombre} -> {value, label}.
 * 4. Renderizar el componente correcto (Select o Checkbox).
 */

const GenericInformFilters = ({ informesData, config }) => {
    // Desestructuramos,para facilitar el acceso a los datos
    const {
        dataSources = {},
        seleccion = {},
        handleCambio = () => { }
    } = informesData;

    /** FUNCIÓN HELPER DE NORMALIZACIÓN
     * Transforma cualquier array de datos crudos (API) al formato estándar { value, label }
     * que necesita el GenericSelector.
     * * @param {Array} rawData - Datos tal cual vienen de la base de datos (ej: [{id:1, nombre:'A'}]).
     * @param {Object} filterConfig - La config de este filtro específico (donde dice qué campo es el ID y cuál el Nombre).*/
    const mapToOptions = (rawData, filterConfig) => {
        if (!rawData || !Array.isArray(rawData)) return [];

        // Si no se define optionValue/Label en config, asumimos que ya vienen como value/label
        const valKey = filterConfig.optionValue || 'value';
        const labKey = filterConfig.optionLabel || 'label';

        // Retornamos un nuevo array limpio
        return rawData.map(item => ({
            value: item[valKey],
            label: item[labKey]
        }));
    };

    return (
        <div className="pb-3">
            <CContainer fluid>
                <CCard>
                    <CCardBody>
                        <CRow>
                            {/* BUCLE PRINCIPAL: Generación dinámica de inputs */}
                            {config.filters.map(filter => {

                                // LÓGICA DE DEPENDENCIA:
                                // Si el filtro depende de otro (ej: Curso depende de Ciclo) 
                                // y el padre no tiene valor seleccionado, deshabilitamos este filtro.
                                const isDisabled = filter.dependsOn && !seleccion[filter.dependsOn];

                                // OBTENCIÓN DE DATOS CRUDOS:
                                // Buscamos en 'options' (si es estático) o en 'dataSources' (si viene de API)
                                const rawOptions = filter.options || dataSources[filter.key];

                                // TRANSFORMACIÓN DE DATOS (El paso clave para la reutilización):
                                const normalizedOptions = mapToOptions(rawOptions, filter);

                                // --- CASO A: TIPO SELECT ---

                                if (filter.type === 'select') {
                                    return (
                                        <CCol md={3} key={filter.key}>
                                            <GenericSelector
                                                // Props visuales
                                                label={filter.label}
                                                // Forzamos diseño vertical para que entre en la grilla
                                                layout="stack"

                                                // Props de datos (Estado del padre)
                                                value={seleccion[filter.key] || ''}
                                                onChange={(val) => handleCambio(filter.key, val)}

                                                // Props de contenido: pasamos la lista limpia y estandarizada
                                                options={normalizedOptions}

                                                // Props de estado UI
                                                s disabled={isDisabled}
                                                placeholder={isDisabled ? `Seleccione ${filter.dependsOn}...` : "Seleccione..."}
                                            />
                                        </CCol>
                                    );
                                }

                                // --- CASO B: TIPO CHECKBOX ---
                                // Los checkboxes no usan GenericSelector, usan el nativo de CoreUI
                                if (filter.type === 'checkbox') {
                                    return (
                                        // 'align-items-end' para que el checkbox baje y se alinee con los inputs de texto
                                        <CCol md={3} key={filter.key} className="d-flex align-items-end mb-3">
                                            <CFormCheck
                                                id={filter.key}
                                                label={filter.label}
                                                checked={Boolean(seleccion[filter.key])}
                                                onChange={(e) => handleCambio(filter.key, e.target.checked)}
                                                disabled={isDisabled}
                                            />
                                        </CCol>
                                    );
                                }
                                // Si el tipo no es reconocido, retornamos null para no renderizar nada
                                return null;
                            })}
                        </CRow>
                    </CCardBody>
                </CCard>
            </CContainer>
        </div>
    );
};

export default GenericInformFilters;