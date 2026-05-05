//  frontend_AcademiA\src\components\subjectEvaluationHistory\SubjectEvaluationHistory.jsx

import React, { useState, useEffect } from 'react';
import { CCollapse, CRow, CCol } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCheckCircle, cilWarning, cilChevronBottom } from '@coreui/icons';
import SubjectEvaluationHistoryDetail from '../subjectEvaluationHistoryDetail/subjectEvaluationHistoryDetail';
import { useNotasExamenTPEstudiante } from '../../hooks/useNotasExamenTPEstudiante';
import { notasConfig } from '../../../src/constants/Constants';

// Datos de referencia (Fallback)
const MOCK_DETAILS = [
    {
        tipo_nota: '1ER TRIMESTRE',
        nota: 9.0,
        status: 'Aprobado',
        evaluacion: [
            { nomeval: 'Parcial 1', notaeval: 9.5 },
            { nomeval: 'Parcial 2', notaeval: 6.0 },
            { nomeval: 'Trabajo Práctico 1', notaeval: 8.5 },
            { nomeval: 'Trabajo Práctico 2', notaeval: 7.0 }
        ]
    },
    { tipo_nota: '2DO TRIMESTRE', nota: 10.0, status: 'Aprobado', evaluacion: [{ nomeval: 'Parcial 1', notaeval: 9.5 }] },
    { tipo_nota: 'EXAMEN FINAL', nota: 9.5, status: 'Aprobado' }
];


/* Componente que:
    - Recibe los datos brutos (details) del historial de evaluaciones y los mapea en columnas de CoreUI.
        * Recorre el array details (ej., Trimestre 1, Trimestre 2, Examen Final, etc.).
        * Calcula si el ítem está aprobado y define si el primer ítem tiene detalle colapsable (hasCompactDetail).
            
    - Mantiene el estado de colapso interno (isAnyOpen) que controla la visibilidad de las sub-evaluaciones.
        * Se pasa el estado al componente hijo SubjectEvaluationHistoryDetail.
    - Renderiza una alerta de riesgo si alguna de las notas es insuficiente (menor a 6).
*/

const SubjectEvaluationHistory = ({ details: propDetails, contextInfo }) => {

    const details = propDetails;

    console.log(`🔍 [${contextInfo?.idMateria}] Parámetros al montarse SubjectEvaluationHistory: `, {
        details, propDetails, contextInfo
    })

    // // Estado para manejar el acordeón (null = todo cerrado)
    //  activeIndex almacena (monitorea) el índice del elemento que está expandido 
    const [activeIndex, setActiveIndex] = useState(null);

    // Lógica para obtener el detalle del ítem que el usuario abrió, usando el índice actual

    // isAnyOpen: booleano que indica si hay algún detalle abierto
    const isAnyOpen = activeIndex !== null;

    // Si hay algún elemento abierto, obtenemos el objeto específico del array details que coincide 
    // con el activeIndex (es decir, los datos del detalle del el elemento abierto)
    // Es una variable derivada: se actualiza automáticamente cuando cambia activeIndex
    const activeDetail = isAnyOpen ? details[activeIndex] : null;

    // Manejo el Hook useNotasExamenTPEstudiante que pide las notas de exámenes y TPs. 
    // Se ejecuta siempre, pero el hook sólo buscará los datos si isAnyOpen es True (sinó, pasa 'null')
    const { data: notas, loading } = useNotasExamenTPEstudiante(
        activeDetail ? contextInfo?.idAlumno : null,
        activeDetail ? contextInfo?.idMateria : null,
        activeDetail ? contextInfo?.idCurso : null,
        activeDetail ? activeDetail.id_periodo : null // Pasamos el periodo del que está abierto
    );

    console.log("🔍🔍🔍 Parámetros: ", {
        contextInfo, activeDetail
    })
    // Si no hay datos, no mostramos nada
    //if (!details || details.length === 0) return null;

    useEffect(() => {
        console.log("⚡ El activeDetail cambió a:", activeDetail);
    }, [activeDetail]);

    return (
        <div className="bg-light bg-opacity-50 border-top p-4 ps-5">
            <h5 className="fw-bold mb-4 text-dark ">Historial de Evaluaciones</h5>

            {details.length === 0 ? (
                <p className="text-muted">No hay evaluaciones registradas para esta materia.</p>
            ) : (

                <CRow className="g-3">
                    {details.map((detail, idx) => {
                        const evalAprobado = detail.nota >= 6;
                        const evalColor = evalAprobado ? 'success' : 'danger';

                        // Identifica si este detalle tiene el sub-detalle anidado. Para pertmitir el clic
                        //const hasCompactDetail = detail.evaluacion && detail.evaluacion.length > 0;
                        const hasCompactDetail = 1;
                        // Determinamos si ESTE ítem específico debe estar abierto
                        const isOpen = activeIndex === idx;


                        if (isOpen && !loading && notas.length > 0) {
                            console.log("✅ DATOS LISTOS PARA EL HIJO:", {
                                periodo: detail.tipo_nota,
                                detail: detail,         //  Datos recibidos por el padre (subjectEvaluationHistory)
                                examenesYTPs: notas,    //  Datos a enviar al hijo (subjectEvaluationHistoryDetail)
                                evaluacion: detail.evaluacion,
                                nota: detail.nota,
                                isOpen,

                            });
                        }
                        /*
                         console.log(`📤 Pasado al hijo:`,
                             detail.evaluacion,
                             detail.nota,
                             isOpen,
                             (isOpen ? loading : false),
                             (isOpen ? notas : []) // Notas que trae el Hook (Examen/TP)
                         );
                         */

                        return (
                            <CCol md={6} lg={3} key={idx}>
                                <div className="bg-white p-3 rounded-3 shadow-sm border border-light h-100">

                                    {/* Contenedor Clickable para que muestre el DETALLE (Exámenes y TPs) , si tiene */}
                                    <div
                                        //    style={{ cursor: hasCompactDetail ? 'pointer' : 'default' }}
                                        //{/*    onClick={hasCompactDetail ? (e) => { */}

                                        style={{ cursor: 'pointer' }}

                                        onClick={(e) => {
                                            console.log("👌 Datos del Eval. History al clickear: ", {
                                                detail, contextInfo, idx
                                            })
                                            e.stopPropagation();
                                            // Si ya está abierto lo cerramos, sinó lo abrimos (guardamos el idx en el estado).
                                            setActiveIndex(isOpen ? null : idx);
                                        } //: undefined
                                        }
                                    >

                                        {/* Header del ítem de detalle (Trimestre/Parcial/etc) */}
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="text-xs text-uppercase fw-bold text-muted">
                                                {detail.tipo_nota}
                                            </span>

                                            {hasCompactDetail ? (
                                                <CIcon
                                                    icon={cilChevronBottom}
                                                    className={`text-muted ${isOpen ? 'rotate-180' : ''}`}
                                                    size="sm"
                                                    style={{ transition: 'transform 0.2s' }}
                                                />
                                            ) : (
                                                detail.status !== 'No aplica' && (
                                                    <CIcon
                                                        icon={evalAprobado ? cilCheckCircle : cilWarning}
                                                        className={`text-${evalColor}`}
                                                        size="sm"
                                                    />
                                                )
                                            )}
                                        </div>

                                        {/* Nota y estado */}
                                        <div className="mt-2">
                                            <span className="h4 fw-bold text-dark">{detail.nota}</span>
                                            <div className={`small text-${evalColor} fw-semibold`}>
                                                {detail.nota >= notasConfig.minNotaAprobado ? 'Aprobado' : 'No aprobado'}
                                            </div>
                                        </div>
                                    </div>


                                    {/* DETALLE COMPACTO COLAPSABLE ANIDADO */}
                                    {
                                        <SubjectEvaluationHistoryDetail
                                            evaluaciones={notas}
                                            visible={isOpen}
                                            // Pasamos la función para que el hijo pueda "avisar" que quiere cerrarse
                                            // Cuando el hijo "avisa" (la ejecuta), el padre hace "setActiveIndex(null"
                                            onClose={() => setActiveIndex(null)}
                                            loading={isOpen ? loading : false} // Pasa el estado de carga
                                            notasExtra={isOpen ? notas : []} // Notas que trae el Hook (Examen/TP)
                                        />
                                    }

                                </div>
                            </CCol>
                        );
                    })}
                </CRow>
            )}

            {/* Alerta si hay alguna nota insuficiente en el historial */}
            {
                details.some(d => d.nota < 6) && (
                    <div className="mt-4 p-3 bg-danger bg-opacity-10 text-danger rounded-3 border border-danger border-opacity-25 d-flex align-items-center">
                        <CIcon icon={cilWarning} className="me-2" />
                        <small className="fw-semibold">
                            Atención: Materia en riesgo. Consulta fechas de recuperatorio.
                        </small>
                    </div>
                )
            }
        </div >
    );

};

export default SubjectEvaluationHistory;