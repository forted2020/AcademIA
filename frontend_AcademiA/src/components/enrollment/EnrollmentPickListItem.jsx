//  frontend_AcademiA\src\components\enrollment\EnrollmentPickListItem.jsx

import React, { useState, useEffect } from 'react';
import { CRow, CCol, CFormLabel, CFormSelect, CButton, CSpinner, CBadge } from '@coreui/react';
import { PickList } from 'primereact/picklist';
import { Toast } from 'primereact/toast';
import api from '../../api/api'; // Tu cliente axios configurado
import CIcon from '@coreui/icons-react';
import { cilUser, cilArrowRight } from '@coreui/icons';
import './GenericEnrollment.css';


export default function EnrollmentPickListItem({ item }) {
    return (
        <div className="d-flex flex-wrap p-2 align-items-center gap-3 border-bottom border-light">

            {/* AVATAR / ICONO (Izquierda) */}
            <div className="d-flex align-items-center justify-content-center bg-light rounded-circle border" style={{ width: '3rem', height: '3rem' }}>
                <CIcon icon={cilUser} size="xl" className="text-secondary" />
            </div>

            {/* INFO PRINCIPAL (Centro) */}
            <div className="flex-fill d-flex flex-column gap-1">
                <span className="fw-bold text-dark">
                    {item.apellido}, {item.nombre}
                </span>
                <div className="d-flex align-items-center gap-2">
                    <i className="pi pi-id-card text-muted" style={{ fontSize: '0.8rem' }}></i>
                    <span className="small text-muted">{item.dni}</span>
                </div>
            </div>

            {/* INFO SECUNDARIA / ESTADO (Derecha) */}
            <div className="d-flex flex-column align-items-end">
                <span
                    className="fw text-primary mt-1"
                    color={item.estado === 'Regular' ? 'success' : 'warning'}
                >Regular</span>
                {/* 
                    <CBadge color={item.estado === 'Regular' ? 'success' : 'warning'} shape="rounded-pill">
                        {item.estado}
                    </CBadge>
                    */}
                {/* <span className="fw-bold text-primary mt-1">$5000</span> */}
            </div>
        </div>
    );
}