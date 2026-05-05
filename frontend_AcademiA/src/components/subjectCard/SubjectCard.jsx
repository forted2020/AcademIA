// frontend_AcademiA\src\components\subjectCard\SubjectCard.jsx

import React, { useState, memo } from 'react';
import { CCard, CCardBody, CCollapse, CRow, CCol } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSchool, cilCheckCircle, cilWarning, cilChevronBottom } from '@coreui/icons';

import SubjectEvaluationHistory from '../subjectEvaluationHistory/SubjectEvaluationHistory'
import { useNotasFinalesEstudiante } from '../../hooks/useNotasFinalesEstudiante'

//const SubjectCard = ({ subject, isOpen, onToggle }) => {
const SubjectCard = ({ idAlumno, idMateria, nombreMateria, nombreDocente, notaMateria, idCurso, curso, isOpen, onToggle }) => {

    console.log("🔍 Parámetros al montarse SubjectCard: ", {
        idAlumno, idMateria, nombreMateria, nombreDocente, notaMateria, idCurso, curso, isOpen, onToggle
    })

    // Inicia en 'true' para que se muestre expandido por defecto
    const [isCompactDetailOpen, setIsCompactDetailOpen] = useState(false);

    // Variables principales de la materia
    const isPassing = notaMateria >= 6.0;
    const statusColor = 'success'
    //  subject.status === 'aprobado' ? 'success' : (subject.status === 'reprobado' ? 'danger' : 'warning');

    const badgeClass = 'aprobado'
    //  subject.status === 'aprobado' ? 'badge-soft-success' : 'badge-soft-danger';

    // Barra de progreso
    const progressWidth = `${Math.min(notaMateria * 10, 100)}%`;

    // Manejo el Hook useNotasFinalesEstudiante que pide las notas. 
    // Se ejecuta siempre, pero el hook sólo buscará los datos si isOpen es True (se despliega el detalle)
    const { data: notas, loading } = useNotasFinalesEstudiante(
        isOpen ? idAlumno : null,
        isOpen ? idMateria : null,
        isOpen ? idCurso : null
    );

    console.log("🔍 Parámetros obtenidos del hook: ", {
        notas
    })


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
                        <h5 className="fw-bold text-dark mb-1">{nombreMateria}</h5>
                        <div className="d-flex align-items-center text-muted small">
                            <CIcon icon={cilSchool} size="sm" className="me-1" />
                            {nombreDocente}
                        </div>
                    </div>


                    {/* Barra de progreso (solo desktop) */}
                    <div className="d-none d-lg-block flex-grow-1 mx-4" style={{ maxWidth: '300px' }}>
                        <div className="d-flex justify-content-between mb-1">
                            <span className="text-label">Progreso Académico</span>
                            <span className="fw-bold small">{notaMateria} / 10</span>
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
                                {notaMateria}
                            </span>
                        </div>

                        <span className={`${badgeClass} d-none d-md-inline-block`}>
                            {'Aprobado'}    {/* HARDCODEADO */}
                            {/* {subject.status.toUpperCase()} */}

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
                        details={notas || []}   // Pasamos el array 'data' renombrado como 'notas'
                        contextInfo={{          //  Pasamos los datos del contexto (Curso, materia, alumno)
                            idAlumno: idAlumno,
                            idMateria: idMateria,
                            idCurso: idCurso
                        }}
                    /> 

                </CCollapse>
                {/* ---------- Fin Sección colapsable: Historial de evaluaciones (Detalle Largo) --------- */}

            </CCardBody>
        </CCard>
    );
};

// React.memo evita que el componente se re-ejecute, 
// a menos que sus props (idMateria, isOpen, etc.) cambien realmente.
export default memo(SubjectCard);