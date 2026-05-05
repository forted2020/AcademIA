//  ..\components\subjectEvaluationHistoryDetail\subjectEvaluationHistoryDetail.jsx

// Muestra el detalle colapsable de las evaluaciones internas de un detalle (ej. notas de tareas/exámenes dentro de un trimestre).

import React, { useState } from 'react';
import { CCollapse } from '@coreui/react';

const SubjectEvaluationHistoryDetail = ({ evaluaciones, visible, onClose }) => {

    const titulo = (!evaluaciones || evaluaciones.length === 0) ?
        'No existe registro de evaluaciones' : 'Evaluaciones:';

    console.count("✨ HistorialDetail");
    console.log("🔍 Parámetros al montarse el componente subjectEvaluationHistoryDetail: ", {
        evaluaciones, visible
    })


    return (
        <CCollapse
            visible={visible}
            onClick={(e) => {
                e.stopPropagation(); // Evita que el clic afecte a la tarjeta padre
                onClose();           // Ejecuta la función que cierra el detalle (el padre pasó esta función de control)
            }}
        
            // Estilos para el contenedor que maneja la altura (CCollapse)
            style={{
                cursor: 'pointer',  // Indica al usuario que puede hacer clic
                transition: 'height 0.35s cubic-bezier(0.4, 0, 0.2, 1)' // Suaviza la animación de altura
            }}
        >
            <div
                className="mt-2 pt-2 border-top border-light"
                style={{
                    paddingLeft: 0,
                    paddingRight: 0,
                    willChange: 'height, opacity', // Avisa al navegador que se prepare para animar
                    opacity: visible ? 1 : 0,
                    // Combinamos la curva de tiempo para que coincida con la altura
                    transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.4s ease-out',
                    // Ligero desplazamiento hacia arriba al cerrar, para mejorar la sensación de "guardado"
                    transform: visible ? 'translateY(0)' : 'translateY(-5px)',

                }}

            >
                <p className="small fw-bold text-body-secondary mb-1" style={{ fontSize: '0.75rem' }}>{titulo}</p>

                {/* Mapear las evaluaciones específicas */}
                {evaluaciones.map((evalItem, index) => (
                    <div
                        className="d-flex justify-content-between small text-muted"
                        key={index}
                        style={{ fontSize: '0.8rem' }}
                    >
                        <span
                            className="text-truncate text-capitalize"
                            style={{ maxWidth: '70%', fontWeight: '500' }}
                            title={evalItem.tipo_nota} // Muestra el nombre completo al pasar el mouse
                        >
                            {evalItem.tipo_nota.toLowerCase()}
                        </span>
                        <span className="fw-medium text-dark">{evalItem.nota}</span>
                    </div>
                ))}
            </div>
        </CCollapse>
    );
};

export default SubjectEvaluationHistoryDetail;