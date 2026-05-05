// frontend_AcademiA\src\components\informes\InformConfig.jsx

import React from 'react';
import { CRow, CCol, CFormSelect, CFormCheck, CFormLabel } from '@coreui/react';

const InformConfig = ({ config, onChange }) => {
    
    const handleInputChange = (id, value) => {
        // Notificamos al padre que un filtro cambió
        onChange(prev => ({ ...prev, [id]: value }));
    };

    return (
        <CRow className="g-3 align-items-end">
            {config.map((filtro) => (
                <CCol key={filtro.id} xs={12} md={filtro.type === 'checkbox' ? 'auto' : 3}>
                    {filtro.type === 'select' && (
                        <>
                            <CFormLabel className="small fw-bold">{filtro.label}</CFormLabel>
                            <CFormSelect 
                                size="sm" 
                                onChange={(e) => handleInputChange(filtro.id, e.target.value)}
                            >
                                <option value="">Seleccionar...</option>
                                {filtro.options?.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </CFormSelect>
                        </>
                    )}

                    {filtro.type === 'checkbox' && (
                        <CFormCheck 
                            className="mb-2"
                            id={filtro.id}
                            label={filtro.label}
                            onChange={(e) => handleInputChange(filtro.id, e.target.checked)}
                        />
                    )}
                </CCol>
            ))}
        </CRow>
    );
};

export default InformConfig;
