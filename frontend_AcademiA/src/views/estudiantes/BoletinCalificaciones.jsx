// frontend_AcademiA\src\views\estudiantes\BoletinCalificaciones.jsx
//
// Boletín de calificaciones por estudiante y ciclo lectivo.
// Consume el endpoint GET /api/notas/informe-individual/{id_estudiante}
// No modifica Trayectoria.jsx ni ningún componente existente.

import React, { useState, useCallback } from 'react'
import {
  CContainer, CCard, CCardHeader, CCardBody, CRow, CCol,
  CSpinner, CAlert, CBadge, CButton
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFile, cilUser, cilSchool } from '@coreui/icons'
import { Dropdown } from 'primereact/dropdown'

import api from '../../api/api.js'
import { getCiclosPorEstudiante } from '../../api/apiEstudiantes.js'
import useAuthUser from '../../hooks/useAuthUser'

// ─────────────────────────────────────────────
//  Hook interno: carga el informe del estudiante
// ─────────────────────────────────────────────
const useInformeAcademico = (idEstudiante, cicloId, cursoId) => {
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    if (!idEstudiante || !cicloId || !cursoId) {
      setData(null)
      return
    }
    setLoading(true)
    setError(null)
    api
      .get(`/api/notas/informe-individual/${idEstudiante}`, {
        params: { ciclo_id: cicloId, curso_id: cursoId },
      })
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.detail || 'Error al cargar informe'))
      .finally(() => setLoading(false))
  }, [idEstudiante, cicloId, cursoId])

  return { data, loading, error }
}

// ─────────────────────────────────────────────
//  Hook interno: carga los ciclos del estudiante
// ─────────────────────────────────────────────
const useCiclosEstudiante = (idEstudiante) => {
  const [ciclos, setCiclos] = React.useState([])

  React.useEffect(() => {
    if (!idEstudiante) return
    getCiclosPorEstudiante(idEstudiante)
      .then((res) => setCiclos(res.data || []))
      .catch(() => setCiclos([]))
  }, [idEstudiante])

  return ciclos
}

// ─────────────────────────────────────────────
//  Generación de PDF con jsPDF
// ─────────────────────────────────────────────
const generarPDF = async (data, nombreEstudiante, cicloNombre) => {
  const jsPDF = (await import('jspdf')).default
  await import('jspdf-autotable')

  const doc = new jsPDF('p', 'pt', 'a4')
  const margin = 40
  const azul = [50, 31, 219]

  // Encabezado
  doc.setFontSize(16)
  doc.setTextColor(40)
  doc.text('INSTITUCIÓN EDUCATIVA ACADEMIA', margin, 50)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}`, margin, 65)

  doc.setDrawColor(...azul)
  doc.setLineWidth(2)
  doc.line(margin, 75, 555, 75)

  doc.setFontSize(14)
  doc.setTextColor(...azul)
  doc.text('BOLETÍN DE CALIFICACIONES', margin, 100)

  doc.setFontSize(11)
  doc.setTextColor(40)
  doc.text(`Alumno: ${nombreEstudiante}`, margin, 120)
  doc.text(`Ciclo Lectivo: ${cicloNombre}`, margin, 135)

  // Columnas dinámicas: Materia + un col por cada tipo de nota + Promedio
  const cols = [
    { title: 'Materia', dataKey: 'materia' },
    ...data.columnas.map((c) => ({ title: c.label, dataKey: `nota_${c.id_tipo_nota}` })),
    { title: 'Promedio', dataKey: 'promedio' },
  ]

  const rows = data.filas.map((f) => {
    const row = { materia: f.nombre_materia }
    data.columnas.forEach((c) => {
      row[`nota_${c.id_tipo_nota}`] =
        f.calificaciones[c.id_tipo_nota] != null ? f.calificaciones[c.id_tipo_nota] : '—'
    })
    row.promedio = f.promedio != null ? f.promedio : '—'
    return row
  })

  doc.autoTable({
    columns: cols,
    body: rows,
    startY: 155,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: azul, textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 251] },
    margin: { left: margin, right: margin },
  })

  doc.save(`Boletin_${nombreEstudiante.replace(/\s+/g, '_')}_${cicloNombre}.pdf`)
}

// ─────────────────────────────────────────────
//  Tabla de calificaciones
// ─────────────────────────────────────────────
const TablaCalificaciones = ({ data }) => {
  if (!data || !data.filas.length) {
    return (
      <div className="text-center py-4 text-muted">
        No hay calificaciones registradas para este ciclo y curso.
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-hover table-sm align-middle">
        <thead className="table-primary">
          <tr>
            <th>Materia</th>
            {data.columnas.map((c) => (
              <th key={c.id_tipo_nota} className="text-center" style={{ whiteSpace: 'nowrap' }}>
                {c.label}
              </th>
            ))}
            <th className="text-center">Promedio</th>
          </tr>
        </thead>
        <tbody>
          {data.filas.map((fila) => {
            const aprobado = fila.promedio != null && fila.promedio >= 6
            return (
              <tr key={fila.id_materia}>
                <td className="fw-semibold">{fila.nombre_materia}</td>
                {data.columnas.map((c) => (
                  <td key={c.id_tipo_nota} className="text-center">
                    {fila.calificaciones[c.id_tipo_nota] != null
                      ? fila.calificaciones[c.id_tipo_nota]
                      : <span className="text-muted">—</span>}
                  </td>
                ))}
                <td className="text-center fw-bold">
                  {fila.promedio != null ? (
                    <CBadge color={aprobado ? 'success' : 'danger'}>
                      {fila.promedio}
                    </CBadge>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─────────────────────────────────────────────
//  Componente principal
// ─────────────────────────────────────────────
export default function BoletinCalificaciones() {
  const { idEntidad: loggedId, isAdmin, rol } = useAuthUser()
  const esAlumno = rol === 'ALUMNO_APP'

  // Para admin/docente: permite ingresar ID manualmente
  const [inputId, setInputId] = React.useState('')
  const [estudianteId, setEstudianteId] = React.useState(esAlumno ? loggedId : null)
  const [nombreEstudiante, setNombreEstudiante] = React.useState(esAlumno ? 'Alumno' : '')

  // Selección de ciclo y curso
  const [cicloSeleccionado, setCicloSeleccionado] = React.useState(null)
  const [cursoId, setCursoId] = React.useState(null)

  const ciclos = useCiclosEstudiante(estudianteId)
  const { data, loading, error } = useInformeAcademico(
    estudianteId,
    cicloSeleccionado?.id_ciclo_lectivo,
    cursoId
  )

  // Cuando cambia el ciclo, buscar el curso_id del estudiante en ese ciclo
  React.useEffect(() => {
    if (!cicloSeleccionado || !estudianteId) return
    // El endpoint /cicloId/estudianteId/materias devuelve materias con curso anidado
    api
      .get(`/api/estudiantes/${cicloSeleccionado.id_ciclo_lectivo}/${estudianteId}/materias`)
      .then((res) => {
        const materias = res.data || []
        if (materias.length > 0) setCursoId(materias[0]?.curso?.id_curso ?? null)
      })
      .catch(() => setCursoId(null))
  }, [cicloSeleccionado, estudianteId])

  const handleBuscar = () => {
    const id = parseInt(inputId.trim(), 10)
    if (!id) return
    setEstudianteId(id)
    setNombreEstudiante(`Estudiante ID ${id}`)
    setCicloSeleccionado(null)
    setCursoId(null)
  }

  const handleExportarPDF = () => {
    if (!data) return
    generarPDF(data, nombreEstudiante, cicloSeleccionado?.nombre_ciclo_lectivo || '')
  }

  const ciclosOpciones = ciclos.map((c) => ({
    label: c.nombre_ciclo_lectivo,
    value: c,
  }))

  return (
    <div style={{ padding: '10px' }}>
      <h1 className="ms-1">Boletín de Calificaciones</h1>
      <CContainer>
        <CCard>
          <CCardHeader className="py-2 bg-white">
            <CRow className="justify-content-between align-items-center">
              <CCol xs={12} sm="auto">
                <h4 className="mb-0">
                  <CIcon icon={cilSchool} className="me-2" />
                  Boletín Académico
                </h4>
                <div className="small text-body-secondary">
                  Calificaciones por materia y período
                </div>
              </CCol>

              {/* Botón PDF — visible solo si hay datos */}
              {data && (
                <CCol xs={12} sm="auto">
                  <CButton color="danger" size="sm" onClick={handleExportarPDF}>
                    <CIcon icon={cilFile} className="me-1" />
                    Exportar PDF
                  </CButton>
                </CCol>
              )}
            </CRow>
          </CCardHeader>

          <CCardBody>
            {/* Búsqueda por ID (solo admin/docente) */}
            {!esAlumno && (
              <CRow className="mb-3 align-items-end">
                <CCol xs={12} sm={4}>
                  <label className="form-label fw-semibold small">ID Estudiante</label>
                  <div className="d-flex gap-2">
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Ingresá el ID"
                      value={inputId}
                      onChange={(e) => setInputId(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                    />
                    <CButton color="primary" size="sm" onClick={handleBuscar}>
                      <CIcon icon={cilUser} className="me-1" />
                      Buscar
                    </CButton>
                  </div>
                </CCol>
              </CRow>
            )}

            {/* Selector de Ciclo Lectivo */}
            {estudianteId && (
              <CRow className="mb-3">
                <CCol xs={12} sm={4}>
                  <label className="form-label fw-semibold small">Ciclo Lectivo</label>
                  <Dropdown
                    value={cicloSeleccionado}
                    options={ciclosOpciones}
                    onChange={(e) => {
                      setCicloSeleccionado(e.value)
                      setCursoId(null)
                    }}
                    placeholder="Seleccioná un ciclo"
                    className="w-100"
                    style={{ fontSize: '0.875rem' }}
                  />
                </CCol>
              </CRow>
            )}

            {/* Estados */}
            {loading && (
              <div className="text-center py-4">
                <CSpinner color="primary" />
                <p className="mt-2 text-muted small">Cargando calificaciones...</p>
              </div>
            )}
            {error && <CAlert color="danger">{error}</CAlert>}

            {/* Tabla */}
            {!loading && !error && data && (
              <TablaCalificaciones data={data} />
            )}

            {/* Estado vacío inicial */}
            {!loading && !error && !data && estudianteId && cicloSeleccionado && (
              <div className="text-center py-4 text-muted">
                No se encontraron datos para la selección indicada.
              </div>
            )}
            {!estudianteId && !esAlumno && (
              <div className="text-center py-5 text-muted">
                Ingresá el ID de un estudiante para ver el boletín.
              </div>
            )}
          </CCardBody>
        </CCard>
      </CContainer>
    </div>
  )
}
