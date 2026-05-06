// frontend_AcademiA\src\views\estudiantes\ActaExamen.jsx
//
// Acta de examen: muestra las notas finales de todos los estudiantes de un curso y materia.
// Consume el endpoint GET /api/notas/planilla-acta?ciclo_id=&curso_id=&materia_id=
// No modifica ningún componente existente.

import React from 'react'
import {
  CContainer, CCard, CCardHeader, CCardBody, CRow, CCol,
  CSpinner, CAlert, CBadge, CButton
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFile, cilDescription } from '@coreui/icons'
import { Dropdown } from 'primereact/dropdown'

import api from '../../api/api.js'

// ─────────────────────────────────────────────
//  Hooks internos de carga de selectores
// ─────────────────────────────────────────────
const useCiclos = () => {
  const [ciclos, setCiclos] = React.useState([])
  React.useEffect(() => {
    api.get('/api/ciclos/', { params: { skip: 0, limit: 50 } })
      .then((res) => {
        const payload = res?.data
        const items = Array.isArray(payload) ? payload : (payload?.data ?? [])
        setCiclos(items)
      })
      .catch(() => setCiclos([]))
  }, [])
  return ciclos
}

const useCursosPorCiclo = (cicloId) => {
  const [cursos, setCursos] = React.useState([])
  React.useEffect(() => {
    if (!cicloId) { setCursos([]); return }
    api.get(`/api/cursos/por_ciclo/${cicloId}`)
      .then((res) => {
        const items = Array.isArray(res.data) ? res.data : []
        setCursos(items)
      })
      .catch(() => setCursos([]))
  }, [cicloId])
  return cursos
}

const useMateriasPorCurso = (cursoId) => {
  const [materias, setMaterias] = React.useState([])
  React.useEffect(() => {
    if (!cursoId) { setMaterias([]); return }
    api.get(`/api/materias/curso/${cursoId}`)
      .then((res) => setMaterias(res.data || []))
      .catch(() => setMaterias([]))
  }, [cursoId])
  return materias
}

const usePlanillaActa = (cicloId, cursoId, materiaId) => {
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    if (!cicloId || !cursoId || !materiaId) { setData(null); return }
    setLoading(true)
    setError(null)
    api
      .get('/api/notas/planilla-acta', {
        params: { ciclo_id: cicloId, curso_id: cursoId, materia_id: materiaId },
      })
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.detail || 'Error al cargar el acta'))
      .finally(() => setLoading(false))
  }, [cicloId, cursoId, materiaId])

  return { data, loading, error }
}

// ─────────────────────────────────────────────
//  Generación de PDF
// ─────────────────────────────────────────────
const generarPDF = async (data, titulo) => {
  const jsPDF = (await import('jspdf')).default
  await import('jspdf-autotable')

  const doc = new jsPDF('l', 'pt', 'a4') // horizontal para actas anchas
  const margin = 40
  const azul = [50, 31, 219]

  doc.setFontSize(16)
  doc.setTextColor(40)
  doc.text('INSTITUCIÓN EDUCATIVA ACADEMIA', margin, 50)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}`, margin, 65)

  doc.setDrawColor(...azul)
  doc.setLineWidth(2)
  doc.line(margin, 75, 800, 75)

  doc.setFontSize(14)
  doc.setTextColor(...azul)
  doc.text(titulo.toUpperCase(), margin, 100)

  const cols = [
    { title: 'Alumno', dataKey: 'alumno' },
    ...data.columnas.map((c) => ({ title: c.label, dataKey: `nota_${c.id_tipo_nota}` })),
    { title: 'Promedio', dataKey: 'promedio' },
    { title: 'Definitiva', dataKey: 'definitiva' },
  ]

  const rows = data.filas.map((f) => {
    const row = { alumno: f.nombre_completo }
    data.columnas.forEach((c) => {
      row[`nota_${c.id_tipo_nota}`] =
        f.calificaciones[c.id_tipo_nota] != null ? f.calificaciones[c.id_tipo_nota] : '—'
    })
    row.promedio = f.promedio != null ? f.promedio : '—'
    row.definitiva = f.definitiva != null ? f.definitiva : '—'
    return row
  })

  doc.autoTable({
    columns: cols,
    body: rows,
    startY: 120,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 4 },
    headStyles: { fillColor: azul, textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 251] },
    margin: { left: margin, right: margin },
  })

  doc.save(`${titulo.replace(/\s+/g, '_')}.pdf`)
}

// ─────────────────────────────────────────────
//  Tabla del acta
// ─────────────────────────────────────────────
const TablaActa = ({ data }) => {
  if (!data || !data.filas.length) {
    return (
      <div className="text-center py-4 text-muted">
        No hay datos para los filtros seleccionados.
      </div>
    )
  }

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-hover table-sm align-middle">
        <thead className="table-primary">
          <tr>
            <th>Alumno</th>
            {data.columnas.map((c) => (
              <th key={c.id_tipo_nota} className="text-center" style={{ whiteSpace: 'nowrap' }}>
                {c.label}
              </th>
            ))}
            <th className="text-center">Promedio</th>
            <th className="text-center">Definitiva</th>
          </tr>
        </thead>
        <tbody>
          {data.filas.map((fila) => {
            const aprobado = fila.definitiva != null && fila.definitiva >= 6
            return (
              <tr key={fila.id_alumno}>
                <td className="fw-semibold">{fila.nombre_completo}</td>
                {data.columnas.map((c) => (
                  <td key={c.id_tipo_nota} className="text-center">
                    {fila.calificaciones[c.id_tipo_nota] != null
                      ? fila.calificaciones[c.id_tipo_nota]
                      : <span className="text-muted">—</span>}
                  </td>
                ))}
                <td className="text-center">
                  {fila.promedio != null ? fila.promedio : <span className="text-muted">—</span>}
                </td>
                <td className="text-center fw-bold">
                  {fila.definitiva != null ? (
                    <CBadge color={aprobado ? 'success' : 'danger'}>
                      {fila.definitiva}
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
export default function ActaExamen() {
  const [cicloId, setCicloId] = React.useState(null)
  const [cursoId, setCursoId] = React.useState(null)
  const [materiaId, setMateriaId] = React.useState(null)
  const [materiaLabel, setMateriaLabel] = React.useState('')

  const ciclos = useCiclos()
  const cursos = useCursosPorCiclo(cicloId)
  const materias = useMateriasPorCurso(cursoId)
  const { data, loading, error } = usePlanillaActa(cicloId, cursoId, materiaId)

  const ciclosOpciones = ciclos.map((c) => ({
    label: c.nombre_ciclo_lectivo,
    value: c.id_ciclo_lectivo,
  }))
  const cursosOpciones = cursos.map((c) => ({
    label: c.curso,
    value: c.id_curso,
  }))
  const materiasOpciones = materias.map((m) => ({
    label: m.nombre?.nombre_materia || m.nombre_materia || `Materia ${m.id_materia}`,
    value: m.id_materia,
  }))

  const tituloActa = materiaLabel
    ? `Acta de Examen — ${materiaLabel}`
    : 'Acta de Examen'

  return (
    <div style={{ padding: '10px' }}>
      <h1 className="ms-1">Acta de Examen</h1>
      <CContainer>
        <CCard>
          <CCardHeader className="py-2 bg-white">
            <CRow className="justify-content-between align-items-center">
              <CCol xs={12} sm="auto">
                <h4 className="mb-0">
                  <CIcon icon={cilDescription} className="me-2" />
                  Planilla de Calificaciones por Materia
                </h4>
                <div className="small text-body-secondary">
                  Notas de todos los alumnos de un curso y materia
                </div>
              </CCol>
              {data && (
                <CCol xs={12} sm="auto">
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => generarPDF(data, tituloActa)}
                  >
                    <CIcon icon={cilFile} className="me-1" />
                    Exportar PDF
                  </CButton>
                </CCol>
              )}
            </CRow>
          </CCardHeader>

          <CCardBody>
            {/* Filtros */}
            <CRow className="mb-3 g-2">
              <CCol xs={12} sm={4}>
                <label className="form-label fw-semibold small">Ciclo Lectivo</label>
                <Dropdown
                  value={cicloId}
                  options={ciclosOpciones}
                  onChange={(e) => {
                    setCicloId(e.value)
                    setCursoId(null)
                    setMateriaId(null)
                  }}
                  placeholder="Seleccioná un ciclo"
                  className="w-100"
                  style={{ fontSize: '0.875rem' }}
                />
              </CCol>

              <CCol xs={12} sm={4}>
                <label className="form-label fw-semibold small">Curso</label>
                <Dropdown
                  value={cursoId}
                  options={cursosOpciones}
                  onChange={(e) => {
                    setCursoId(e.value)
                    setMateriaId(null)
                  }}
                  placeholder={cicloId ? 'Seleccioná un curso' : 'Primero elegí ciclo'}
                  disabled={!cicloId}
                  className="w-100"
                  style={{ fontSize: '0.875rem' }}
                />
              </CCol>

              <CCol xs={12} sm={4}>
                <label className="form-label fw-semibold small">Materia</label>
                <Dropdown
                  value={materiaId}
                  options={materiasOpciones}
                  onChange={(e) => {
                    setMateriaId(e.value)
                    const found = materiasOpciones.find((m) => m.value === e.value)
                    setMateriaLabel(found?.label || '')
                  }}
                  placeholder={cursoId ? 'Seleccioná una materia' : 'Primero elegí curso'}
                  disabled={!cursoId}
                  className="w-100"
                  style={{ fontSize: '0.875rem' }}
                />
              </CCol>
            </CRow>

            {/* Estados */}
            {loading && (
              <div className="text-center py-4">
                <CSpinner color="primary" />
                <p className="mt-2 text-muted small">Cargando acta...</p>
              </div>
            )}
            {error && <CAlert color="danger">{error}</CAlert>}

            {!loading && !error && data && <TablaActa data={data} />}

            {!loading && !error && !data && !cicloId && (
              <div className="text-center py-5 text-muted">
                Seleccioná ciclo, curso y materia para ver el acta.
              </div>
            )}
          </CCardBody>
        </CCard>
      </CContainer>
    </div>
  )
}
