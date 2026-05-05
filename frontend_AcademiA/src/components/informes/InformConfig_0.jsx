//  frontend_AcademiA\src\components\informes\informesConfig\InformesConfig.jsx

import React, { useState, useEffect } from 'react'

import { CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CContainer } from '@coreui/react'

export default function InformesConfig() {

    return (
        <>

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
    </>
    )
    
}