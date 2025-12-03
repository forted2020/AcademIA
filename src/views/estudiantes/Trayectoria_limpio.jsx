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
                    


                    
                </CCardBody>
            </CCard>
        </CContainer>
    )
}
