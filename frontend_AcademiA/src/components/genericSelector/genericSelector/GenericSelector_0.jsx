/*
Se aplica el concepto o patrón de "Levantar el Estado" (Lifting State Up).
El Hijo (MainSelector) es "tonto" (stateless): solo recibe el valor actual y avisa al padre cuando el usuario cambia la selección.
*/

// frontend_AcademiA\src\components\mainSelector\MainSelector.jsx

import React, { useState, useEffect } from 'react'
import { CCard, CCardHeader, CCardBody, CCardFooter, CRow, CCol, CFormLabel, CFormSelect, CContainer, CListGroup, CListGroupItem } from '@coreui/react';

// import { DocentesInformesConfig } from '../../views/docentes/docentesInformes/DocentesInformesConfig'

// Recibimos:
// - label: El título del select
// - options: Array de opciones [{label, value}]
// - value: El valor seleccionado
// - onChange: Función para cambiar
// - infoText: El texto pequeño de abajo (El padre decide qué dice)

export const GenericSelector = ({ label, options, value, onChange, infoText }) => {
    return (

        <CRow className="align-items-end">
            <div > ----------------------------- </div>

            {/* Columna del Label y Select */}
            <CCol md={4} lg={3}>

                <CFormLabel className="fw-bold text-primary">
                    {label}
                </CFormLabel>

                <CFormSelect
                    // El valor lo controla el padre
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {/* Opción por defecto */}
                    <option value="">Seleccione...</option>

                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </CFormSelect>
            </CCol>

            {/* Columna texto descrptivo. Alineado al fondo gracias a 'align-items-end' en el Row */}
            <CCol md={8} lg={9}>

                <div className="text-muted small mb-1 ms-2">
                    {infoText || 'Seleccione una opción'}
                </div>
            </CCol>
            <div >
                ---------------------------------
            </div>
        </CRow>

    )
}
