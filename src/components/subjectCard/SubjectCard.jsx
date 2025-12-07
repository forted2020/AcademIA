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

import SubjectEvaluationHistory from '../subjectEvaluationHistory/SubjectEvaluationHistory'
const SubjectCard = ({ subject, isOpen, onToggle }) => {
    // Inicia en 'true' para que se muestre expandido por defecto
    const [isCompactDetailOpen, setIsCompactDetailOpen] = useState(false);

    // Variables principales de la materia
    const isPassing = subject.grade >= 6.0;
    const statusColor = subject.status === 'aprobado' ? 'success' : (subject.status === 'reprobado' ? 'danger' : 'warning');
    const badgeClass = subject.status === 'aprobado' ? 'badge-soft-success' : 'badge-soft-danger';

    // Barra de progreso
    const progressWidth = `${Math.min(subject.grade * 10, 100)}%`;

    return (
        // El clic en la tarjeta principal  colapsa/expande la materia completa
        <CCard className="card-modern card-subject mb-3 cursor-pointer" onClick={onToggle}>
            {/* Indicador lateral de color */}
            <div className={`status-indicator status-${statusColor}`}></div>

            <CCardBody className="p-0">
                {/* Cabecera clickable */}
                <div className="p-4 d-flex flex-wrap align-items-center gap-3">

                    {/* Nombre y profesor */}
                    <div className="flex-grow-1" style={{ minWidth: '200px' }}>
                        <h5 className="fw-bold text-dark mb-1">{subject.name}</h5>
                        <div className="d-flex align-items-center text-muted small">
                            <CIcon icon={cilSchool} size="sm" className="me-1" />
                            {subject.professor}
                        </div>
                    </div>

                    {/* Barra de progreso (solo desktop) */}
                    <div className="d-none d-lg-block flex-grow-1 mx-4" style={{ maxWidth: '300px' }}>
                        <div className="d-flex justify-content-between mb-1">
                            <span className="text-label">Progreso Académico</span>
                            <span className="fw-bold small">{subject.grade} / 10</span>
                        </div>
                        <div className="progress-modern">
                            <div
                                className={`progress-bar-animated status-${statusColor}`}
                                style={{ width: progressWidth }}
                            ></div>
                        </div>
                    </div>

                    {/* Nota grande, badge y chevron */}
                    <div className="d-flex align-items-center gap-4">
                        <div className="text-end">
                            <span className={`fs-3 fw-bolder text-${statusColor}`}>
                                {subject.grade}
                            </span>
                        </div>

                        <span className={`${badgeClass} d-none d-md-inline-block`}>
                            {subject.status.toUpperCase()}
                        </span>
                        <CIcon
                            icon={cilChevronBottom}
                            className={`text-muted chevron-icon ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                </div>

                {/* ---------- Sección colapsable: Historial de evaluaciones (Detalle Largo) --------- */}
                <CCollapse visible={isOpen}>
                    
                    <SubjectEvaluationHistory   //   Historial de evaluaciones
                        details={subject.details} 
                        isPassing={isPassing} 
                    />
                    
                </CCollapse>
                {/* ---------- Fin Sección colapsable: Historial de evaluaciones (Detalle Largo) --------- */}

            </CCardBody>
        </CCard>
    );
};

export default SubjectCard;