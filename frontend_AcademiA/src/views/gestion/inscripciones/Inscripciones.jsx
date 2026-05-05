// frontend_AcademiA\src\views\gestion\inscripciones\Inscripciones.jsx

import React, { useState, useEffect } from 'react'

import { CCard, CCardHeader, CCardBody, CRow, CCol, CFormLabel, CFormSelect, CContainer } from '@coreui/react';
import { InscripcionesConfig } from './InscripcionesConfig';
import GenericEnrollment from '../../../components/enrollment/GenericEnrollment'; 

export default function Inscripciones() {
    // Por defecto seleccionamos el primer modo disponible
    const [selectedModeKey, setSelectedModeKey] = useState(InscripcionesConfig.mainSelector.options[0].value);
    
    const activeConfig = InscripcionesConfig.configs[selectedModeKey];

    return (
        <div className="inscripciones-container" style={{ padding: '10px' }}>
            <h1 className="ms-1">{InscripcionesConfig.title}</h1>
            <CContainer>
                <CCard className="mb-4">
                    <CCardHeader className="py-2 bg-white">
                        <CRow className="justify-content-between align-items-center">
                            <CCol>
                                <h4 className="mb-0">{activeConfig ? activeConfig.title : 'Seleccione Opción'}</h4>
                                <small className="text-muted">{activeConfig?.subtitle}</small>
                            </CCol>
                        </CRow>
                    </CCardHeader>

                    <CCardBody className="px-4 pt-4 pb-2">
                        {/* SELECTOR DE MODO (Si tuvieras más de uno, como exámenes) */}
                        <CRow className="mb-4">
                            <CCol md={4}>
                                <CFormLabel className="fw-bold text-primary">
                                    {InscripcionesConfig.mainSelector.label}
                                </CFormLabel>
                                <CFormSelect
                                    value={selectedModeKey}
                                    onChange={(e) => setSelectedModeKey(e.target.value)}
                                >
                                    {InscripcionesConfig.mainSelector.options.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </CFormSelect>
                            </CCol>
                        </CRow>

                        {/* MOTOR GENÉRICO DE INSCRIPCIÓN */}
                        {activeConfig && (
                            <GenericEnrollment 
                                key={selectedModeKey} // Fuerza reinicio si cambia el modo
                                config={activeConfig} 
                            />
                        )}
                    </CCardBody>
                </CCard>
            </CContainer>
        </div>
    );
}