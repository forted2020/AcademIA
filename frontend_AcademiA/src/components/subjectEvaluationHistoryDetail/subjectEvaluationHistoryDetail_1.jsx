import React from 'react';
import { CCollapse } from '@coreui/react';

/**
 * Muestra el detalle colapsable de las evaluaciones internas (ej. Parciales/TPs).
 * @param {Array} evaluaciones - Lista de objetos {nomeval, notaeval}.
 * @param {boolean} visible - Controla la visibilidad del colapso.
 */
const SubjectEvaluationHistoryDetail = ({ evaluaciones = [], visible }) => {
    if (!evaluaciones || evaluaciones.length === 0) {
        return null;
    }

    return (
        <CCollapse visible={visible}>
            <div className="mt-2 pt-2 border-top border-light" style={{ paddingLeft: 0, paddingRight: 0 }}>
                <p className="small fw-semibold text-body-secondary mb-1" style={{ fontSize: '0.75rem' }}>
                    Evaluaciones:
                </p>

                {evaluaciones.map((evalItem, index) => (
                    <div
                        className="d-flex justify-content-between small text-muted py-1"
                        key={index}
                        style={{ fontSize: '0.8rem' }}
                    >
                        <span
                            className="text-truncate text-capitalize"
                            style={{ maxWidth: '70%', fontWeight: '500' }}
                            title={evalItem.nomeval}
                        >
                            {evalItem.nomeval.toLowerCase()}
                        </span>
                        <span className="fw-medium text-dark">{evalItem.notaeval}</span>
                    </div>
                ))}
            </div>
        </CCollapse>
    );
};

export default SubjectEvaluationHistoryDetail;