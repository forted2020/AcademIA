
// SubjectCard.jsx
import React, { useState } from 'react';
import {
    CCard,
    CCardBody,
    CCollapse,
    CRow,
    CCol
} from '@coreui/react';

import CIcon from '@coreui/icons-react';


import {
    cilSchool,
    cilCheckCircle,
    cilWarning,
    cilChevronBottom
} from '@coreui/icons';



// --- Sub-componente: Fila de Materia ---
const SubjectCard = ({ subject, isOpen, onToggle }) => {
    const [evaluationsOpen, setEvaluationsOpen] = useState(false)  //  Estado controla si las evaluaciones está abierta o cerrada 

    const isPassing = subject.grade >= 6.0;
    const statusColor = subject.status === 'aprobado' ? 'success' : (subject.status === 'reprobado' ? 'danger' : 'warning');
    const badgeClass = subject.status === 'aprobado' ? 'badge-soft-success' : 'badge-soft-danger';

    // Calculo visual del progreso
    const progressWidth = `${Math.min(subject.grade * 10, 100)}%`;

    // Estado individual para cada detalle (período)
    // Usamos un objeto donde la clave es el índice (o id si tienes), valor es true/false
    const [openDetails, setOpenDetails] = useState({});

    // Función para alternar el colapso de un detalle específico
    const toggleDetail = (idx) => {
        setOpenDetails(prev => ({
            ...prev,
            [idx]: !prev[idx]
        }));
    };


    return (
        <CCard className="card-modern card-subject mb-3 cursor-pointer" onClick={onToggle}>
            {/* Indicador lateral de color */}
            <div className={`status-indicator status-${statusColor}`}></div>

            <CCardBody className="p-0">
                {/* Cabecera Clickable, siempre visible */}
                <div className="p-4 d-flex flex-wrap align-items-center gap-3">

                    {/* Info Principal */}
                    <div className="flex-grow-1" style={{ minWidth: '200px' }}>
                        <h5 className="fw-bold text-dark mb-1">{subject.name}</h5>
                        <div className="d-flex align-items-center text-muted small">
                            <CIcon icon={cilSchool} size="sm" className="me-1" />
                            {subject.professor}
                        </div>
                    </div>

                    {/* Visualización de Nota (Desktop) */}
                    <div className="d-none d-lg-block flex-grow-1 mx-4" style={{ maxWidth: '300px' }}>
                        <div className="d-flex justify-content-between mb-1">
                            <span className="text-label">Progreso Académico</span>
                            <span className="fw-bold small">{subject.grade} / 10</span>
                        </div>
                        <div className="progress-modern">
                            <div
                                className={`progress-bar-animated status-${statusColor}`}

                                // style={{ width: isOpen ? progressWidth : '0%', width: progressWidth }} // Animación al montar
                                style={{ width: progressWidth }}

                            ></div>
                        </div>
                    </div>

                    {/* Nota Grande y Chevron */}
                    <div className="d-flex align-items-center gap-4">
                        <div className="text-end">
                            <span className={`fs-3 fw-bolder text-${statusColor}`}>{subject.grade}</span>
                        </div>
                        <span className={`${badgeClass} d-none d-md-inline-block`}>
                            {subject.status}
                        </span>
                        <CIcon
                            icon={cilChevronBottom}
                            className={`text-muted chevron-icon ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                </div>

                {/* Detalles Desplegables */}
                <CCollapse visible={isOpen}>
                    <div className="bg-light bg-opacity-50 border-top p-4 ps-5">
                        <h6 className="fw-bold mb-3 text-dark">Historial de Evaluaciones</h6>
                        <CRow className="g-3">

                            {/* Card con información de cada período: promedio, exámenes, notas, etc } */}
                            {subject.details.map((detail, idx) => (
                                <CCol md={6} lg={3} key={idx}>
                                    <div className="bg-white p-3 rounded-3 shadow-sm border border-light h-100">
                                        <div className="d-flex justify-content-between align-items-start mb-2">


                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Evita cerrar la tarjeta principal
                                                    setEvaluationsOpen(!evaluationsOpen);
                                                }}
                                            >



                                                <span className="text-xs text-uppercase fw-bold text-muted">{detail.name}</span>
                                                {detail.status !== 'No aplica' && (
                                                    <CIcon icon={detail.grade >= 6 ? cilCheckCircle : cilWarning} className={`text-${detail.grade >= 6 ? 'success' : 'danger'}`} size="sm" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <span className="h4 fw-bold text-dark">{detail.grade}</span>
                                            <div className="small text-muted-${statusColor}">{detail.status}</div>
                                        </div>

                                        <hr className="my-4" />

                                        {/* === SECCIÓN QUE SE COLAPSA: Solo las evaluaciones === */}
                                        <CCollapse visible={evaluationsOpen}>
                                            <div className="ps-3">
                                                <h6 className="fw-bold text-dark mb-3">Evaluaciones:</h6>
                                                {subject.details.map((detail, idx) => (
                                                    <div key={idx} className="d-flex justify-content-between align-items-center py-2">
                                                        <span className="text-dark">
                                                            {detail.name} {detail.percentage ? `(${detail.percentage}%)` : ''}
                                                        </span>
                                                        <span className="fw-bold text-dark">{detail.grade}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CCollapse>







                                    </div>
                                </CCol>
                            ))}

                        </CRow>
                        {!isPassing && (
                            <div className="mt-3 p-3 bg-danger bg-opacity-10 text-danger rounded-3 border border-danger border-opacity-25 d-flex align-items-center">
                                <CIcon icon={cilWarning} className="me-2" />
                                <small className="fw-semibold">Atención: Materia en riesgo. Consulta fechas de recuperatorio.</small>
                            </div>
                        )}
                    </div>
                </CCollapse>
            </CCardBody>
        </CCard>
    );
};

export default SubjectCard;
