import React, { useState, useEffect } from 'react'

import { CButton, CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CContainer, CFormInput, CFormLabel, } from '@coreui/react'
import { cilPrint } from '@coreui/icons'

import '../../css/PersonalStyles.css'


export default function DocenteInformes() {

    const [unitCharge, setUnitCharge] = useState(true);

    const [formData, setFormData] = useState({
        nota: 8.5, // Valor inicial
        alumno: '',
        tipo: ''
    });

    // Datos simulados basados en la imagen (PDF)
    const alumnos = [
        { id: 1, nombre: "BUTTA, Clemente Bautista", t1: 7, t2: 8, t3: 8, prom: 7.66, dic: "", feb: "", def: 7.66 },
        { id: 2, nombre: "CASTRO, Catalina", t1: 9, t2: 9, t3: 9, prom: 9.00, dic: "", feb: "", def: 9.00 },
        { id: 3, nombre: "DEMIRYI, Ulises Miguel", t1: 8, t2: 9, t3: 9, prom: 8.66, dic: "", feb: "", def: 8.66 },
        { id: 4, nombre: "DIANA, Fiorella Itatí", t1: 9, t2: 9, t3: 10, prom: 9.33, dic: "", feb: "", def: 9.33 },
        { id: 5, nombre: "DÍAZ, Emilia", t1: 9, t2: 9, t3: 10, prom: 9.33, dic: "", feb: "", def: 9.33 },
        { id: 6, nombre: "DUMÉ BALBI, Benicio", t1: 9, t2: 9, t3: 9, prom: 9.00, dic: "", feb: "", def: 9.00 },
        { id: 7, nombre: "FRAU MEICHTRY, Ana Paula", t1: 9, t2: 9, t3: 9, prom: 9.00, dic: "", feb: "", def: 9.00 },
        { id: 8, nombre: "GALIZZI KOHAN, Amanda", t1: 9, t2: 10, t3: 10, prom: 9.66, dic: "", feb: "", def: 9.66 },
        { id: 9, nombre: "GAMBARO, Marco", t1: 8, t2: 8, t3: 8, prom: 8.00, dic: "", feb: "", def: 8.00 },
    ];
    // Manejador genérico de cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            // Convertir la nota a número si es el campo 'nota'
            [name]: name === 'nota' ? parseFloat(value) : value,
        }));
    };


    return (


        <div style={{ padding: '10px' }}>
            <h1 className="ms-1" >Docentes</h1>

            <CContainer>

                <CCard className="mb-1" >       {/* Contenedor que actúa como cuerpo de la tarjeta CCard. Envuelve todo el contenido*/}

                    {/* ----------  HEAD --------------- */}
                    <CCardHeader className="py-2 bg-white ">
                        <CRow className="justify-content-between align-items-center " > {/* Fila en la grilla.*/}
                            <CCol xs={12} sm="auto">    {/* Columna dentro de fila. Ocupa 5 de 12 unidades disponibles. Hereda gutter de CRow*/}
                                <h4 id="titulo" className="mb-0 ">
                                    Planilla de Calificaciones
                                </h4>
                                <div className="small text-body-secondary">Visualización e impresión de actas</div>
                            </CCol>
                            <CCol xs={12} sm="auto" className="mt-2 mt-sm-0">
                                <CButton color="primary" size="sm" variant="outline">
                                    Exportar PDF
                                </CButton>
                            </CCol>
                        </CRow>
                    </CCardHeader>
                    {/* ----------  /HEAD --------------- */}


                    {/* ----------  BODY --------------- */}
                    <CCardBody className="px-4 pt-1 pb-2 border border-light">

                        {/* CONFIGURACIÓN (Mantenida del estilo original para contexto) */}
                        <CCard className="mb-4 no-print shadow-sm">
                            <CCardHeader className="fw-semibold bg-white">
                                Filtros de Selección
                            </CCardHeader>
                            <CCardBody>
                                <CRow className="g-3">
                                    <CCol md={3}>
                                        <label className="form-label text-uppercase small fw-semibold text-secondary">Curso</label>
                                        <select className="form-select">
                                            <option>5° A</option>
                                        </select>
                                    </CCol>
                                    <CCol md={3}>
                                        <label className="form-label text-uppercase small fw-semibold text-secondary">Asignatura</label>
                                        <select className="form-select">
                                            <option>TIC</option>
                                        </select>
                                    </CCol>
                                    <CCol md={3}>
                                        <label className="form-label text-uppercase small fw-semibold text-secondary">Ciclo Lectivo</label>
                                        <select className="form-select">
                                            <option>2025</option>
                                        </select>
                                    </CCol>
                                    <CCol md={3} className="d-flex align-items-end ">
                                        <div className="form-check mb-0 text-nowrap">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="checkCargaIndividual" 
                                                checked={unitCharge}  // Es mejor controlar el input con 'checked' vinculado al estado
                                                onChange={(e) => setUnitCharge(e.target.checked)} // Forma correcta de actualizar
                                            />
                                            <label
                                                className="form-check-label text-uppercase small fw-semibold text-secondary"
                                                htmlFor="checkCargaIndividual"
                                            >
                                                Carga Individual
                                            </label>
                                        </div>
                                    </CCol>
                                </CRow>
                                {unitCharge && (
                                    <CRow className="g-3">
                                        <CCol md={3}>
                                            <label className="form-label text-uppercase small fw-semibold text-secondary">Alumno</label>
                                            <select className="form-select">
                                                <option>Ruiz, Juan Carlos</option>
                                            </select>
                                        </CCol>
                                        <CCol md={3}>
                                            <label className="form-label text-uppercase small fw-semibold text-secondary">Tipo</label>
                                            <select className="form-select">
                                                <option>1°T</option>
                                            </select>
                                        </CCol>
                                        <CCol md={4}>
                                            <CFormLabel htmlFor="nota">
                                                Nota (Ej: 1.0 a 10.0) <span className="text-danger">*</span>
                                            </CFormLabel>
                                            <CFormInput
                                                id="nota"
                                                name="nota"
                                                type="number"
                                                step="0.5" // Permite notas con medio punto
                                                min="1.0"
                                                max="10.0"
                                                value={formData.nota}
                                                onChange={handleChange}
                                                placeholder="Ej: 8.5"
                                                required
                                            />
                                        </CCol>
                                    </CRow>
                                )}
                            </CCardBody>
                        </CCard>

                        {/* VISTA PREVIA DEL INFORME (REPLICA DE LA IMAGEN) */}
                        {!unitCharge && (
                        <CCard className="shadow-sm">
                            <CCardHeader className="fw-semibold bg-white d-flex justify-content-between">
                                <span>Vista Previa del Acta</span>
                                <span className="text-muted small">Página 1 de 7</span>
                            </CCardHeader>

                            <CCardBody className="p-4" style={{ overflowX: 'auto' }}>

                                {/* Contenedor estilo "Hoja de Papel" */}
                                <div className="border p-3 mx-auto" style={{ minWidth: '800px', backgroundColor: '#fff' }}>

                                    {/* ENCABEZADO DE LA PLANILLA */}
                                    <CRow className="mb-3 align-items-center">
                                        <CCol xs={2} className="text-center">
                                            {/* Placeholder para Logo */}
                                            <div className="bg-light border d-flex align-items-center justify-content-center" style={{ width: '60px', height: '80px', margin: '0 auto' }}>
                                                <small className="text-muted" style={{ fontSize: '10px' }}>LOGO</small>
                                            </div>
                                        </CCol>
                                        <CCol xs={10}>
                                            <h5 className="text-center fw-bold mb-3">PLANILLAS DE CALIFICACIONES - CL: 2025</h5>

                                            {/* Grilla de Datos del Encabezado */}
                                            <div className="border">
                                                <CRow className="g-0 border-bottom">
                                                    <CCol xs={6} className="p-1 border-end d-flex">
                                                        <span className="fw-bold me-2">CURSO Y DIV.:</span>
                                                        <span>5A</span>
                                                    </CCol>
                                                    <CCol xs={6} className="p-1 d-flex">
                                                        <span className="fw-bold me-2">Turno</span>
                                                        <span className="fst-italic">Mañana</span>
                                                    </CCol>
                                                </CRow>
                                                <CRow className="g-0 border-bottom">
                                                    <CCol xs={6} className="p-1 border-end d-flex">
                                                        <span className="fw-bold me-2">ASIGNATURA:</span>
                                                        <span>5A - TIC</span>
                                                    </CCol>
                                                    <CCol xs={6} className="p-1 d-flex">
                                                        <span className="fw-bold me-2">Fecha</span>
                                                        <span>23/05/2025</span>
                                                    </CCol>
                                                </CRow>
                                                <CRow className="g-0">
                                                    <CCol xs={12} className="p-1 d-flex">
                                                        <span className="fw-bold me-2">DOCENTE:</span>
                                                        <span>Pablo S. Pannone</span>
                                                    </CCol>
                                                </CRow>
                                            </div>
                                        </CCol>
                                    </CRow>

                                    {/* TABLA DE NOTAS */}
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-sm align-middle text-center" style={{ fontSize: '0.9rem' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: '#ffc107' }}> {/* Color Amarillo similar a la imagen */}
                                                    <th className="bg-warning text-dark" style={{ width: '40px' }}>Nº</th>
                                                    <th className="bg-warning text-dark text-start" style={{ width: '30%' }}>Alumno/a</th>
                                                    <th className="bg-warning text-dark">1º T</th>
                                                    <th className="bg-warning text-dark">2º T</th>
                                                    <th className="bg-warning text-dark">3º T</th>
                                                    <th className="bg-warning text-dark">Prom.</th>
                                                    <th className="bg-warning text-dark">DIC.</th>
                                                    <th className="bg-warning text-dark">FEB.</th>
                                                    <th className="bg-warning text-dark fw-bold" style={{ lineHeight: '1.1' }}>CALIF.<br />DEF.</th>
                                                    <th className="bg-warning text-dark">OBSERVACIONES</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {alumnos.map((alumno) => (
                                                    <tr key={alumno.id}>
                                                        <td>{alumno.id}</td>
                                                        <td className="text-start text-uppercase">{alumno.nombre}</td>
                                                        <td>{alumno.t1}</td>
                                                        <td>{alumno.t2}</td>
                                                        <td>{alumno.t3}</td>
                                                        <td className="bg-light fw-semibold">{alumno.prom}</td>
                                                        <td>{alumno.dic}</td>
                                                        <td>{alumno.feb}</td>
                                                        <td className="fw-bold">{alumno.def}</td>
                                                        <td className="bg-light"></td>
                                                    </tr>
                                                ))}
                                                {/* Filas vacías para completar estilo visual si fuera necesario */}
                                                {[...Array(3)].map((_, i) => (
                                                    <tr key={`empty-${i}`}>
                                                        <td>{alumnos.length + 1 + i}</td>
                                                        <td className="text-start"></td>
                                                        <td></td><td></td><td></td>
                                                        <td className="bg-light"></td>
                                                        <td></td><td></td><td></td>
                                                        <td className="bg-light"></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                </div>
                            </CCardBody>
                        </CCard>
                        )}

                    </CCardBody>
                    {/* ----------  /BODY --------------- */}


                    {/* ----------  FOOTER --------------- */}
                    <CCardFooter
                        className="bg-white border-top px-3 py-1" >

                        <div className="d-flex justify-content-between align-items-center">
                            <span className="small text-muted">Sistema de Gestión Académica</span>
                            <span className="small text-muted">Impreso el: {new Date().toLocaleDateString()}</span>
                        </div>

                    </CCardFooter>

                </CCard>



            </CContainer >

        </div>

    )


}