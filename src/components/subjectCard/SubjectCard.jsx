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

                {/* Sección colapsable: Historial de evaluaciones (Detalle Largo) */}
                <CCollapse visible={isOpen}>
                    <div className="bg-light bg-opacity-50 border-top p-4 ps-5">
                        <h5 className="fw mb-8 text-dark ">Historial de Evaluaciones</h5>
                       
                        <CRow className="g-3">
                            {subject.details.map((detail, idx) => {
                                // Lógica para cada tarjeta de detalle (Trimestre, Parcial, etc.)
                                const evalPassing = detail.grade >= 6;
                                const evalColor = evalPassing ? 'success' : 'danger';
                                
                                // Determina si este es el ítem que contiene el detalle anidado (el "1ER TRIMESTRE")
                                const hasCompactDetail = idx === 0 && detail.evaluacion; 

                                return (
                                    <CCol md={6} lg={3} key={idx}>
                                        <div className="bg-white p-3 rounded-3 shadow-sm border border-light h-100">
                                            
                                            {/* 2. ✅ CORREGIDO: Nuevo contenedor para el área de clic interno */}
                                            <div
                                                style={{cursor: hasCompactDetail ? 'pointer' : 'default'}}
                                                onClick={hasCompactDetail ? (e) => { 
                                                    e.stopPropagation(); // <-- Detiene el clic aquí para que NO colapse la tarjeta principal
                                                    setIsCompactDetailOpen(!isCompactDetailOpen); 
                                                } : undefined}
                                            >
                                                {/* Header del ítem de detalle */}
                                                <div className="d-flex justify-content-between align-items-center mb-2"> 
                                                    <span className="text-xs text-uppercase fw-bold text-muted">
                                                        {detail.name}
                                                    </span>
                                                    
                                                    {/* Icono de estado principal (o Chevron si tiene el detalle compacto) */}
                                                    {hasCompactDetail ? (
                                                        <CIcon 
                                                            icon={cilChevronBottom} 
                                                            // Rota el ícono si está expandido para indicar el estado
                                                            className={`text-muted ${isCompactDetailOpen ? 'rotate-180' : ''}`} 
                                                            size="sm" 
                                                        />
                                                    ) : (
                                                        detail.status !== 'No aplica' && (
                                                            <CIcon
                                                                icon={evalPassing ? cilCheckCircle : cilWarning}
                                                                className={`text-${evalColor}`}
                                                                size="sm"
                                                            />
                                                        )
                                                    )}
                                                </div>
                                                
                                                {/* Nota y estado */}
                                                <div className="mt-2">
                                                    <span className="h4 fw-bold text-dark">{detail.grade}</span>
                                                    <div className={`small text-${evalColor} fw-semibold`}>
                                                        {detail.status}
                                                    </div>
                                                </div>
                                            </div> {/* <-- Fin del área de clic interno */}

                                            {/* ✅ DETALLE COMPACTO COLAPSABLE */}
                                            {hasCompactDetail && (
                                                <CCollapse visible={isCompactDetailOpen}> 
                                                    <div className="mt-2 pt-2 border-top border-light" style={{ paddingLeft: 0, paddingRight: 0 }}>
                                                        <p className="small fw-semibold text-body-secondary mb-1" style={{ fontSize: '0.75rem' }}>Evaluaciones:</p>
                                                        
                                                        {/* Mapear las evaluaciones específicas del trimestre (detail.evaluacion) */}
                                                        {detail.evaluacion.map((evalItem, index) => (
                                                            <div 
                                                                className="d-flex justify-content-between small text-muted" 
                                                                key={index} 
                                                                style={{ fontSize: '0.8rem' }}
                                                            >
                                                                <span>{evalItem.nomeval}</span>
                                                                <span className="fw-medium text-dark">{evalItem.notaeval}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CCollapse>
                                            )}
                                            {/* ======================================================= */}
                                            
                                        </div>
                                    </CCol>
                                );
                            })}
                        </CRow>

                        {/* Alerta si la materia está en riesgo */}
                        {!isPassing && (
                            <div className="mt-4 p-3 bg-danger bg-opacity-10 text-danger rounded-3 border border-danger border-opacity-25 d-flex align-items-center">
                                <CIcon icon={cilWarning} className="me-2" />
                                <small className="fw-semibold">
                                    Atención: Materia en riesgo. Consulta fechas de recuperatorio.
                                </small>
                            </div>
                        )}
                    </div>
                </CCollapse>
            </CCardBody>
        </CCard>
    );
};

export default SubjectCard;