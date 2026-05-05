import React, { useState, useEffect } from 'react'

import { CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CContainer } from '@coreui/react'

export default function NombreMenú() {

    return (

        <div style={{ padding: '10px' }}>
            <h1 className="ms-1" > Nombre Menú </h1>

            <CContainer>

                <CCard className="mb-1" >       {/* Contenedor que actúa como cuerpo de la tarjeta CCard. Envuelve todo el contenido*/}

                    {/* ----------  HEAD --------------- */}
                    <CCardHeader className="py-2 bg-white ">
                        <CRow className="justify-content-between align-items-center " > 
                            <CCol xs={12} sm="auto">
                                <h4 id="titulo" className="mb-0 ">
                                    Nombre Submenú (ítem)
                                </h4>
                                <div className="small text-body-secondary"> Subtítulo del Item </div>
                            </CCol>
                        </CRow>
                    </CCardHeader>
                    {/* ----------  /HEAD --------------- */}


                    {/* ----------  BODY --------------- */}
                    <CCardBody className="px-4 pt-1 pb-2 border border-light">

                        BODY

                    </CCardBody>
                    {/* ----------  /BODY --------------- */}


                    {/* ----------  FOOTER --------------- */}
                    <CCardFooter
                        className="bg-white border-top px-3 py-1" >

                        FOOTER

                    </CCardFooter>

                </CCard>



            </CContainer >

        </div>

    )


}