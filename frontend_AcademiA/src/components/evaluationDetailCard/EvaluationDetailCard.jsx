//  ..\components\evaluationDetailCard\EvaluationDetailCard.jsx

/*  
Componente responsable de encapsular la vista completa de una única unidad de evaluación (como un Trimestre, un Parcial o una Instancia de Recuperatorio).
Es el intermediario entre el orquestador (SubjectEvaluationHistory) y el listado de sub-evaluaciones (CompactEvaluationList), gestionando la presentación, el estado de colapso interno y la interacción del usuario para esa tarjeta específica.

*/

import React from 'react';
import { CCol } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCheckCircle, cilWarning, cilChevronBottom } from '@coreui/icons';

// Importamos el componente de listado anidado
import CompactEvaluationList from '../subjectEvaluationHistoryDetail/subjectEvaluationHistoryDetail'; 

/**
 * Muestra una tarjeta de detalle individual de evaluación (Trimestre/Parcial).
 * @param {object} detail - Los datos de la evaluación (detail.name, detail.grade, etc.)
 * @param {boolean} hasCompactDetail - Indica si este detalle tiene evaluaciones anidadas (detail.evaluacion).
 * @param {boolean} isCompactDetailOpen - Estado de colapso del detalle anidado.
 * @param {function} onToggleCompactDetail - Función para cambiar el estado de colapso.
 */
const EvaluationDetailCard = ({ 
    detail, 
    hasCompactDetail, 
    isCompactDetailOpen, 
    onToggleCompactDetail 
}) => {
    const evalPassing = detail.grade >= 6;
    const evalColor = evalPassing ? 'success' : 'danger';

    const handleToggle = (e) => {
        if (hasCompactDetail) {
            e.stopPropagation(); // ¡Importante! Evita que el clic se propague al SubjectCard principal
            onToggleCompactDetail();
        }
    };

    return (
        <CCol md={6} lg={3}>
            <div className="bg-white p-3 rounded-3 shadow-sm border border-light h-100">

                {/* Contenedor Clickable para la cabecera del detalle */}
                <div
                    style={{ cursor: hasCompactDetail ? 'pointer' : 'default' }}
                    onClick={handleToggle}
                >
                    {/* Header: Nombre y Chevron/Icono de estado */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-xs text-uppercase fw-bold text-muted">
                            {detail.name}
                        </span>

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

                {/* INCLUSIÓN DEL COMPONENTE DE LISTADO COLAPSABLE ANIDADO */}
                {hasCompactDetail && (
                    <CompactEvaluationList 
                        evaluaciones={detail.evaluacion} 
                        visible={isCompactDetailOpen} 
                    />
                )}
            </div>
        </CCol>
    );
};

export default EvaluationDetailCard;