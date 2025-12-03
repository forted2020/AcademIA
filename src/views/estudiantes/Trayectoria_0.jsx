import React from 'react'
import { CCard, CCardHeader, CCardBody, CCol, CRow, CContainer, CAccordion, CAccordionBody, CAccordionHeader, CAccordionItem } from '@coreui/react'

/**
 * Componente Trayectoria
 * Muestra la trayectoria académica del estudiante organizada por años, materias y exámenes
 */
export default function Trayectoria() {
    return (
        <CContainer>
            <CCard className="">
                {/* ----------  HEAD - Encabezado de la página --------------- */}
                <CCardHeader className="">
                    <CRow className="j">
                        <CCol xs={12} sm="auto">
                            <h4 id="titulo" className="mb-0">
                                Trayectoria Académica
                            </h4>
                            <div className="small text-body-secondary">
                                Historial académico de los estudiantes
                            </div>
                        </CCol>
                    </CRow>
                </CCardHeader>

                {/* ----------  BODY - Contenido principal --------------- */}
                <CCardBody>
                    {/* Accordion principal: Años académicos */}
                    <CAccordion flush>
                        {/* Primer año */}
                        <CAccordionItem itemKey={1}>
                            <CAccordionHeader className="my-0">1er Año</CAccordionHeader>
                            <CAccordionBody className="px-2 py-2">
                                {/* Accordion secundario: Materias del año */}
                                <CAccordion flush>
                                    {/* Materia: Lengua */}
                                    <CAccordionItem>
                                        <CAccordionHeader className="py-0">Lengua</CAccordionHeader>
                                        <CAccordionBody>
                                            {/* Accordion terciario: Exámenes de la materia */}
                                            <CAccordion>
                                                <CAccordionItem>
                                                    <CAccordionHeader>Exámen 1</CAccordionHeader>
                                                    <CAccordionBody>
                                                        {/* Aquí se pueden agregar detalles del examen: fecha, nota, observaciones */}
                                                        <p className="mb-1">
                                                            <strong>Fecha:</strong> 15/03/2024
                                                        </p>
                                                        <p className="mb-1">
                                                            <strong>Nota:</strong> 8
                                                        </p>
                                                        <p className="mb-0">
                                                            <strong>Observaciones:</strong> Buen desempeño
                                                        </p>
                                                    </CAccordionBody>
                                                </CAccordionItem>

                                                {/* Examen 2 */}
                                                <CAccordionItem>
                                                    <CAccordionHeader>Exámen 2</CAccordionHeader>
                                                    <CAccordionBody>
                                                        <p className="mb-1">
                                                            <strong>Fecha:</strong> 20/06/2024
                                                        </p>
                                                        <p className="mb-1">
                                                            <strong>Nota:</strong> 7
                                                        </p>
                                                        <p className="mb-0">
                                                            <strong>Observaciones:</strong> Aprobado
                                                        </p>
                                                    </CAccordionBody>
                                                </CAccordionItem>
                                            </CAccordion>
                                        </CAccordionBody>
                                    </CAccordionItem>

                                    {/* Materia: Matemática */}
                                    <CAccordionItem>
                                        <CAccordionHeader className="py-0">Matemática</CAccordionHeader>
                                        <CAccordionBody>
                                            <CAccordion>
                                                <CAccordionItem>
                                                    <CAccordionHeader>Exámen 1</CAccordionHeader>
                                                    <CAccordionBody>
                                                        <p className="mb-1">
                                                            <strong>Fecha:</strong> 18/03/2024
                                                        </p>
                                                        <p className="mb-1">
                                                            <strong>Nota:</strong> 9
                                                        </p>
                                                        <p className="mb-0">
                                                            <strong>Observaciones:</strong> Excelente
                                                        </p>
                                                    </CAccordionBody>
                                                </CAccordionItem>
                                            </CAccordion>
                                        </CAccordionBody>
                                    </CAccordionItem>
                                </CAccordion>
                            </CAccordionBody>
                        </CAccordionItem>

                        {/* Segundo año */}
                        <CAccordionItem itemKey={2}>
                            <CAccordionHeader className="my-0">2do Año</CAccordionHeader>
                            <CAccordionBody className="px-2 py-2">
                                <CAccordion flush>
                                    <CAccordionItem>
                                        <CAccordionHeader className="py-0">Historia</CAccordionHeader>
                                        <CAccordionBody>
                                            <CAccordion>
                                                <CAccordionItem>
                                                    <CAccordionHeader>Exámen 1</CAccordionHeader>
                                                    <CAccordionBody>
                                                        <p className="mb-1">
                                                            <strong>Fecha:</strong> 10/04/2024
                                                        </p>
                                                        <p className="mb-1">
                                                            <strong>Nota:</strong> 6
                                                        </p>
                                                        <p className="mb-0">
                                                            <strong>Observaciones:</strong> Aprobado
                                                        </p>
                                                    </CAccordionBody>
                                                </CAccordionItem>
                                            </CAccordion>
                                        </CAccordionBody>
                                    </CAccordionItem>
                                </CAccordion>
                            </CAccordionBody>
                        </CAccordionItem>
                    </CAccordion>
                </CCardBody>
            </CCard>
        </CContainer>
    )
}
