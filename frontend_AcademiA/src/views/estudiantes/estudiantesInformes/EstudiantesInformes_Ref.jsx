import React, { useState, useEffect } from 'react'

import { CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CContainer } from '@coreui/react'

export default function EstudiantesInformes() {

    return (

        <div style={{ padding: '10px' }}>
            <h1 className="ms-1" >Estudiantes</h1>

            <CContainer>

                <CCard className="mb-1" >       {/* Contenedor que actúa como cuerpo de la tarjeta CCard. Envuelve todo el contenido*/}

                    {/* ----------  HEAD --------------- */}
                    <CCardHeader className="py-2 bg-white ">
                        <CRow className="justify-content-between align-items-center " > {/* Fila en la grilla.*/}
                            <CCol xs={12} sm="auto">    {/* Columna dentro de fila. Ocupa 5 de 12 unidades disponibles. Hereda gutter de CRow*/}
                                <h4 id="titulo" className="mb-0 ">
                                    Informes Estudiantes
                                </h4>
                                <div className="small text-body-secondary"> Reportes y listados</div>
                            </CCol>
                        </CRow>
                    </CCardHeader>
                    {/* ----------  /HEAD --------------- */}


                    {/* ----------  BODY --------------- */}
                    <CCardBody className="px-4 pt-1 pb-2 border border-light">

                        {/* INFORMES */}

                        {/* CONFIGURACIÓN DEL INFORME */}
                        <CCard className="mb-4 no-print shadow-sm">
                            <CCardHeader className="fw-semibold bg-white">
                                Configuración del Informe
                            </CCardHeader>
                            <CCardBody>
                                <CRow className="g-4 align-items-end">

                                    <CCol xl={3}>
                                        <label className="form-label text-uppercase small fw-semibold text-secondary">
                                            Tipo de informe
                                        </label>
                                        <select className="form-select">
                                            <option>Listado de alumnos por curso</option>
                                            <option>Trayectoria académica de un alumno</option>
                                            <option>Notas finales y condición de aprobación</option>
                                        </select>
                                    </CCol>

                                    <CCol xl={2}>
                                        <label className="form-label text-uppercase small fw-semibold text-secondary">
                                            Alcance
                                        </label>
                                        <select className="form-select">
                                            <option>Alumno</option>
                                            <option>Curso</option>
                                        </select>
                                    </CCol>

                                    <CCol xl={2}>
                                        <label className="form-label text-uppercase small fw-semibold text-secondary">
                                            Curso
                                        </label>
                                        <select className="form-select">
                                            <option>1° A</option>
                                            <option>2° B</option>
                                        </select>
                                    </CCol>

                                    <CCol xl={2}>
                                        <label className="form-label text-uppercase small fw-semibold text-secondary">
                                            Alumno
                                        </label>
                                        <select className="form-select">
                                            <option>Juan Pérez</option>
                                            <option>Ana Gómez</option>
                                        </select>
                                    </CCol>

                                    <CCol xl={1}>
                                        <label className="form-label text-uppercase small fw-semibold text-secondary">
                                            Año
                                        </label>
                                        <select className="form-select">
                                            <option>2025</option>
                                            <option>2024</option>
                                        </select>
                                    </CCol>

                                    <CCol xl={2} className="d-flex gap-2">
                                        <button className="btn btn-primary w-100">
                                            Vista previa
                                        </button>
                                        <button className="btn btn-success w-100">
                                            PDF
                                        </button>
                                    </CCol>

                                    <CCol xs={12} className="pt-2">
                                        <div className="form-check form-check-inline">
                                            <input className="form-check-input" type="checkbox" defaultChecked />
                                            <label className="form-check-label">Asistencias</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input className="form-check-input" type="checkbox" defaultChecked />
                                            <label className="form-check-label">Calificaciones</label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input className="form-check-input" type="checkbox" />
                                            <label className="form-check-label">Observaciones</label>
                                        </div>
                                    </CCol>

                                </CRow>
                            </CCardBody>
                        </CCard>

                        {/* VISTA PREVIA DEL INFORME */}
                        <CCard className="shadow-sm">
                            <CCardHeader className="fw-semibold bg-white">
                                Vista previa del informe
                            </CCardHeader>
                            <CCardBody>

                                {/* ENCABEZADO */}
                                <div className="border-bottom pb-3 mb-4">
                                    <CRow className="align-items-center">
                                        <CCol md={8}>
                                            <h3 className="mb-1">Informe Académico</h3>
                                            <div className="text-body-secondary">
                                                Curso 1° A · Año lectivo 2025
                                            </div>
                                            <div className="text-body-secondary">
                                                Institución Educativa
                                            </div>
                                        </CCol>
                                        <CCol md={4} className="text-md-end mt-3 mt-md-0">
                                            <small className="text-body-secondary">Fecha de emisión</small>
                                            <div className="fw-bold">15/03/2025</div>
                                        </CCol>
                                    </CRow>
                                </div>

                                {/* INDICADORES */}
                                <CRow className="g-4 mb-4 text-center">
                                    <CCol md={3}>
                                        <CCard className="border-0 shadow-sm">
                                            <CCardBody>
                                                <small className="text-uppercase text-body-secondary">Promedio</small>
                                                <div className="fs-3 fw-bold text-primary">7.5</div>
                                            </CCardBody>
                                        </CCard>
                                    </CCol>
                                    <CCol md={3}>
                                        <CCard className="border-0 shadow-sm">
                                            <CCardBody>
                                                <small className="text-uppercase text-body-secondary">Aprobados</small>
                                                <div className="fs-3 fw-bold text-success">18</div>
                                            </CCardBody>
                                        </CCard>
                                    </CCol>
                                    <CCol md={3}>
                                        <CCard className="border-0 shadow-sm">
                                            <CCardBody>
                                                <small className="text-uppercase text-body-secondary">Pendientes</small>
                                                <div className="fs-3 fw-bold text-warning">2</div>
                                            </CCardBody>
                                        </CCard>
                                    </CCol>
                                    <CCol md={3}>
                                        <CCard className="border-0 shadow-sm">
                                            <CCardBody>
                                                <small className="text-uppercase text-body-secondary">Inasistencias</small>
                                                <div className="fs-3 fw-bold text-danger">6.5</div>
                                            </CCardBody>
                                        </CCard>
                                    </CCol>
                                </CRow>

                                {/* TABLA */}
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Alumno</th>
                                                <th className="text-center">Nota final</th>
                                                <th className="text-center">Condición</th>
                                                <th>Observaciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Juan Pérez</td>
                                                <td className="text-center">8</td>
                                                <td className="text-center">
                                                    <span className="badge bg-success">Aprobado</span>
                                                </td>
                                                <td>Buen desempeño general</td>
                                            </tr>
                                            <tr>
                                                <td>Ana Gómez</td>
                                                <td className="text-center">5</td>
                                                <td className="text-center">
                                                    <span className="badge bg-warning text-dark">Pendiente</span>
                                                </td>
                                                <td>Debe reforzar contenidos</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CCardBody>
                        </CCard>
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