//  frontend_AcademiA\src\views\estudiantes\estudiantesHome\EstudiantesHome.jsx

import React, { useState, useEffect } from 'react'
import { CButton, CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CContainer } from '@coreui/react'
import Dashboard from '../../dashboard/Dashboard'
import MainChart from '../../dashboard/MainChart'



export default function EstudiantesHome() {

    return (
        <CContainer>
            <CCard className="mb-1">

                {/* ---------- HEADER ---------- */}
                <CCardHeader className="py-2 bg-white">
                    <CRow className="justify-content-between align-items-center">
                        <CCol xs={12} sm="auto">
                            <h4 id="titulo" className="mb-0">
                                Homee
                            </h4>
                            <div className="small text-body-secondary">
                                Panel inicial Estudiantes

                            </div>
                        </CCol>
                    </CRow>
                </CCardHeader>

                 {/* ---------- BODY ---------- */}
                <CCardBody className="p-0">
                    <CRow className="justify-content-between align-items-center px-4 pt-1 pb-2  border-light">
                        {/* <Dashboard />  */} 
                    </CRow>

                    <CRow className="justify-content-between align-items-center px-4 pt-1 pb-2  border-light">
                       {/* <MainChart />  */} 
                    </CRow>
                </CCardBody>

                 {/* ---------- FOOTER ---------- */}
                <CCardFooter>
                    Footer
                </CCardFooter>
            </CCard>


        </CContainer >
    )
}
