//  ..\components\subjectEvaluationHistoryDetail\subjectEvaluationHistoryDetail.jsx
import React from 'react';
import { CCollapse } from '@coreui/react';

/**
 * Muestra el detalle colapsable de las evaluaciones internas de un detalle (ej. notas de tareas/exámenes dentro de un trimestre).
 * * @param {Array<object>} evaluaciones - Array de objetos con {nomeval, notaeval}.
 * @param {boolean} visible - Estado para controlar si el CCollapse está abierto o cerrado.
 */
const CompactEvaluationList = ({ evaluaciones = [], visible }) => {
    // Solo renderizamos si hay evaluaciones y si el flag 'visible' se lo permite
    if (!evaluaciones || evaluaciones.length === 0) {
        return null;
    }

    return (
        <CCollapse visible={visible}>
            <div className="mt-2 pt-2 border-top border-light" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <p className="small fw-semibold text-body-secondary mb-1" style={{ fontSize: '0.75rem' }}>Evaluaciones:</p>

                {/* Mapear las evaluaciones específicas */}
                {evaluaciones.map((evalItem, index) => (
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
    );
};

export default CompactEvaluationList;