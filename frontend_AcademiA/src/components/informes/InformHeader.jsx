// frontend_AcademiA\src\components\informes\InformHeader.jsx

import React from 'react';
import { CRow, CCol } from '@coreui/react';

const InformHeader = ({ title, subtitle }) => {
    const today = new Date().toLocaleDateString();

    return (
        <div className="border-bottom pb-3">
            <CRow className="align-items-center">
                <CCol md={8}>
                    <h3 className="mb-1 text-primary fw-bold">{title}</h3>
                    <div className="text-body-secondary fw-semibold">
                        {subtitle}
                    </div>
                    <div className="small text-muted">
                        Institución Educativa AcademIA
                    </div>
                </CCol>
                <CCol md={4} className="text-md-end mt-3 mt-md-0">
                    <small className="text-uppercase text-muted d-block">Fecha Informe</small>
                    <div className="fw-bold fs-5">{today}</div>
                </CCol>
            </CRow>
        </div>
    );
};

export default InformHeader;