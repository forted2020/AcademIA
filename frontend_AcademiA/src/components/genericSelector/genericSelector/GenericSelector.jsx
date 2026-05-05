// frontend_AcademiA\src\components\genericSelector\genericSelector\GenericSelector.jsx

import React from 'react';
import { CRow, CCol, CFormLabel, CFormSelect } from '@coreui/react';


/**
 * Componente presentacional puro para renderizar un <select>.
 * Es agnóstico a la lógica de negocio; solo entiende de "labels" y "values".
 * * PROPS RECIBIDAS:
 * @param {string} label       - Etiqueta o título del input.
 * @param {string|number} value - El valor actualmente seleccionado.
 * @param {function} onChange  - Función que recibe el NUEVO valor directo (no el evento completo).
 * @param {Array} options      - ARRAY NORMALIZADO obligatoriamente: [{ label: 'Texto', value: '1' }]
 * @param {string} infoText    - (Opcional) Texto de ayuda o descripción pequeña.
 * @param {string} layout      - 'row' (Horizontal, para cabeceras) | 'stack' (Vertical, para formularios/filtros).
 * @param {boolean} disabled   - Si el control está deshabilitado.
 * @param {string} placeholder - Texto de la opción vacía inicial.
 * * @returns {JSX.Element} Renderiza un Select adaptable en diseño horizontal o vertical.
 */

export const GenericSelector = ({
    label,
    value,
    onChange,
    options = [], /// IMPORTANTE: Aquí ya deben llegar los datos limpios {label, value}
    infoText,
    layout = 'row', // 'row' (Cabecera) o 'stack' (Filtros)
    disabled = false,
    placeholder = "Seleccione..."
}) => {

    // Helper interno para evitar duplicar código HTML.
    // Dibuja el Label + el Select. Se reutiliza en ambos layouts.
    const renderSelect = () => (
        <>
            <CFormLabel className="fw-bold text-primary mb-1">{label}</CFormLabel>
            <CFormSelect
                value={value}
                // Interceptor: extraemos el valor del evento para que el "padre" reciba el dato limpio
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
            >
                {/* Opción por defecto */}
                <option value="">{placeholder}</option>

                {/* Mapeo: options debe tener la estructura correcta */}
                {options.map((opt, idx) => (
                    <option key={opt.value || idx} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </CFormSelect>
        </>
    );

    // Layout Horizontal (Para el encabezados o selectores principales)
    // Select a la izquierda (pequeño) y descripción a la derecha.
    if (layout === 'row') {
        return (
            <CRow className="align-items-end">
                <CCol md={4} lg={3}>{renderSelect()}</CCol>
                <CCol md={8} lg={9}>
                    <div className="text-muted small mb-1 ms-2"> {infoText}</div>
                </CCol>
            </CRow>
        );
    }

    // Layout Vertical (Para formularios estándar y barras de filtros)
    // Devuelve un div simple, dejando que el contenedor padre decida el ancho (CCol).
    return <div className="mb-3">
        {renderSelect()}
        {/* Si hay infoText, lo mostramos debajo del select */}
        {infoText && <div className="text-muted small mt-1">{infoText} otro </div>}
    </div>;
}