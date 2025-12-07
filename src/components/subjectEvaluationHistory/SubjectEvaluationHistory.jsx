//  ../subjectEvaluationHistory/SubjectEvaluationHistory.jsx

/*  Componente que:
    -   Recibe los datos brutos (details) del historial de evaluaciones de la materia y los mapea en tarjetas individuales      (EvaluationDetailCard).
            *   Rcorre el array details (ej., Trimestre 1, Trimestre 2, Examen Final, etc.) y renderiza un componente EvaluationDetailCard por cada ítem.
            * Calcula las variables específicas de cada detalle que son necesarias para el hijo (evalPassing, evalColor) o define si el ítem actual (idx === 0) es el que debe tener el detalle compacto (hasCompactDetail).
            
    -   Mantiene el estado de colapso interno (isCompactDetailOpen) que controla la visibilidad de las sub-evaluaciones (los exámenes específicos dentro de un trimestre, por ejemplo).
            *   Declara y actualiza el hook useState(isCompactDetailOpen), que se pasa como prop a los componentes hijos para controlar si se ven las sub-evaluaciones anidadas.
            *   Utiliza la prop isPassing (aprobación general de la materia) para renderizar la alerta de riesgo en la parte inferior de la sección.
*/

import React, { useState } from 'react';
import { CCollapse, CRow, CCol } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCheckCircle, cilWarning, cilChevronBottom } from '@coreui/icons';

// Asume que 'details' es subject.details y 'isPassing' es la aprobación general de la materia.
const SubjectEvaluationHistory = ({ details = [], isPassing = true }) => {

    // Estado para manejar la apertura/cierre del detalle compacto (por ejemplo, evaluaciones internas del trimestre)
    // Se mantiene aquí para que sea independiente de la tarjeta principal
    const [isCompactDetailOpen, setIsCompactDetailOpen] = useState(false);

    // Función que se pasa al componente hijo para que controle su estado de colapso interno.
    const handleToggleCompactDetail = () => {
        setIsCompactDetailOpen(prev => !prev);
    };


    // Si no hay detalles, no se renderiza nada
    if (!details || details.length === 0) {
        return null;
    }

    return (
        <div className="bg-light bg-opacity-50 border-top p-4 ps-5">
            <h5 className="fw mb-8 text-dark ">Historial de Evaluaciones</h5>

            <CRow className="g-3">
                {details.map((detail, idx) => {

                    const evalPassing = detail.grade >= 6;
                    const evalColor = evalPassing ? 'success' : 'danger';
                    // Identifica si este detalle tiene el sub-detalle anidado (como el "1ER TRIMESTRE")
                    const hasCompactDetail = idx === 0 && detail.evaluacion;

                    return (
                        <CCol md={6} lg={3} key={idx}>
                            <div className="bg-white p-3 rounded-3 shadow-sm border border-light h-100">

                                {/* Contenedor Clickable para el detalle (si tiene sub-detalles) */}
                                <div
                                    style={{ cursor: hasCompactDetail ? 'pointer' : 'default' }}
                                    onClick={hasCompactDetail ? (e) => {
                                        e.stopPropagation(); // Evita que se colapse la tarjeta principal de la materia
                                        setIsCompactDetailOpen(!isCompactDetailOpen);
                                    } : undefined}
                                >
                                    {/* Header del ítem de detalle (Trimestre/Parcial/etc) */}
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-xs text-uppercase fw-bold text-muted">
                                            {detail.name}
                                        </span>

                                        {/* Icono de estado principal (o Chevron si tiene el detalle compacto) */}
                                        {hasCompactDetail ? (
                                            <CIcon
                                                icon={cilChevronBottom}
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
                                </div>

                                {/* DETALLE COMPACTO COLAPSABLE ANIDADO  */}
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
    );
};

export default SubjectEvaluationHistory;