// frontend_AcademiA/src/views/estudiantes/ActaExamen.jsx

import React from 'react'
import {
  CContainer, CCard, CCardHeader, CCardBody,
  CSpinner, CButton, CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilDescription, cilCloudDownload } from '@coreui/icons'

import api from '../../api/api.js'
import './ActaExamen.css'

// ─── Hooks de datos ──────────────────────────────────────
const useCiclos = () => {
  const [ciclos, setCiclos] = React.useState([])
  React.useEffect(() => {
    api.get('/api/ciclos/', { params: { skip: 0, limit: 50 } })
      .then((res) => {
        const payload = res?.data
        setCiclos(Array.isArray(payload) ? payload : (payload?.data ?? []))
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
      .then((res) => setCursos(Array.isArray(res.data) ? res.data : []))
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
    api.get('/api/notas/planilla-acta', {
      params: { ciclo_id: cicloId, curso_id: cursoId, materia_id: materiaId },
    })
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.detail || 'Error al cargar el acta'))
      .finally(() => setLoading(false))
  }, [cicloId, cursoId, materiaId])

  return { data, loading, error }
}

// ─── Generación de PDF ────────────────────────────────────
const generarPDF = async (data, titulo) => {
  const { jsPDF } = await import('jspdf')
  const { autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF('l', 'pt', 'a4')
  const margin = 40
  const navy = [15, 23, 42]
  const blue = [3, 105, 161]

  doc.setFontSize(16)
  doc.setTextColor(...navy)
  doc.text('INSTITUCIÓN EDUCATIVA ACADEMIA', margin, 50)

  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}`, margin, 65)

  doc.setDrawColor(...blue)
  doc.setLineWidth(2)
  doc.line(margin, 75, 800, 75)

  doc.setFontSize(14)
  doc.setTextColor(...blue)
  doc.text(titulo.toUpperCase(), margin, 100)

  const cols = [
    { header: 'Alumno', dataKey: 'alumno' },
    ...data.columnas.map((c) => ({ header: c.label, dataKey: `nota_${c.id_tipo_nota}` })),
    { header: 'Promedio', dataKey: 'promedio' },
    { header: 'Definitiva', dataKey: 'definitiva' },
  ]

  const rows = data.filas.map((f) => {
    const row = { alumno: f.nombre_completo }
    data.columnas.forEach((c) => {
      row[`nota_${c.id_tipo_nota}`] =
        f.calificaciones[c.id_tipo_nota] != null ? f.calificaciones[c.id_tipo_nota] : '—'
    })
    row.promedio   = f.promedio   != null ? f.promedio   : '—'
    row.definitiva = f.definitiva != null ? f.definitiva : '—'
    return row
  })

  autoTable(doc, {
    columns: cols,
    body: rows,
    startY: 120,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 4, font: 'helvetica' },
    headStyles: { fillColor: navy, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin: { left: margin, right: margin },
  })

  doc.save(`${titulo.replace(/\s+/g, '_')}.pdf`)
}

// ─── Select con label ─────────────────────────────────────
function FilterSelect({ label, value, onChange, options, placeholder, disabled, step }) {
  const isReady = !disabled
  return (
    <div className="acta-filter-field">
      <label className="acta-filter-label">
        <span className={`acta-filter-step${isReady ? ' is-ready' : ''}`}>{step}</span>
        {label}
      </label>
      <CFormSelect
        className={`acta-filter-select${!isReady ? ' is-disabled' : ''}`}
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </CFormSelect>
    </div>
  )
}

// ─── Badge de nota definitiva con 3 variantes ─────────────
function DefinitivaBadge({ value }) {
  if (value == null) return <span className="acta-dash">—</span>
  const cls = value >= 6 ? ' is-aprobado' : value >= 4 ? ' is-proceso' : ' is-reprobado'
  return <span className={`acta-definitiva-badge${cls}`}>{value}</span>
}

// ─── Tabla del acta ───────────────────────────────────────
function TablaActa({ data }) {
  const [sortKey, setSortKey]   = React.useState(null)  // 'alumno' | 'promedio' | 'definitiva' | nota_id
  const [sortDir, setSortDir]   = React.useState('asc')

  if (!data?.filas?.length) {
    return (
      <div className="acta-empty">
        <CIcon icon={cilDescription} className="acta-empty-icon" />
        <p>No hay datos para los filtros seleccionados.</p>
      </div>
    )
  }

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const getValue = (fila, key) => {
    if (key === 'alumno')     return fila.nombre_completo?.toLowerCase() ?? ''
    if (key === 'promedio')   return fila.promedio   ?? -1
    if (key === 'definitiva') return fila.definitiva ?? -1
    return fila.calificaciones?.[key] ?? -1
  }

  const filas = [...data.filas].sort((a, b) => {
    if (!sortKey) return 0
    const va = getValue(a, sortKey)
    const vb = getValue(b, sortKey)
    const cmp = va < vb ? -1 : va > vb ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  // ── Estadísticas ─────────────────────────────────────────
  const conDef    = data.filas.filter((f) => f.definitiva != null)
  const aprobados = conDef.filter((f) => f.definitiva >= 6).length
  const proceso   = conDef.filter((f) => f.definitiva >= 4 && f.definitiva < 6).length
  const reprobados= conDef.filter((f) => f.definitiva < 4).length
  const promGeneral = conDef.length
    ? (conDef.reduce((s, f) => s + f.definitiva, 0) / conDef.length).toFixed(1)
    : null

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <span className="acta-sort-icon acta-sort-icon--neutral">⇅</span>
    return <span className="acta-sort-icon">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const SortableTh = ({ col, className, children }) => (
    <th
      className={`acta-th acta-th--sortable ${className}`}
      onClick={() => toggleSort(col)}
    >
      <span className="acta-th-inner">
        <span className="acta-th-text">{children}</span>
        <SortIcon col={col} />
      </span>
    </th>
  )

  return (
    <div className="acta-table-outer">
      <div className="acta-table-wrap">
        <table className="acta-table">
          <thead>
            <tr>
              <SortableTh col="alumno" className="acta-th--alumno">Alumno</SortableTh>
              {data.columnas.map((c) => (
                <SortableTh key={c.id_tipo_nota} col={c.id_tipo_nota} className="acta-th--nota">
                  {c.label}
                </SortableTh>
              ))}
              <SortableTh col="promedio"   className="acta-th--nota">Promedio</SortableTh>
              <SortableTh col="definitiva" className="acta-th--definitiva">Definitiva</SortableTh>
            </tr>
          </thead>
          <tbody>
            {filas.map((fila, i) => (
              <tr key={fila.id_alumno} className={`acta-tr${i % 2 === 1 ? ' acta-tr--alt' : ''}`}>
                <td className="acta-td acta-td--alumno">{fila.nombre_completo}</td>
                {data.columnas.map((c) => (
                  <td key={c.id_tipo_nota} className="acta-td acta-td--center">
                    {fila.calificaciones[c.id_tipo_nota] != null
                      ? fila.calificaciones[c.id_tipo_nota]
                      : <span className="acta-dash">—</span>}
                  </td>
                ))}
                <td className="acta-td acta-td--center">
                  {fila.promedio != null ? fila.promedio : <span className="acta-dash">—</span>}
                </td>
                <td className="acta-td acta-td--center">
                  <DefinitivaBadge value={fila.definitiva} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Resumen estadístico ── */}
      {conDef.length > 0 && (
        <div className="acta-stats">
          <div className="acta-stats-item">
            <span className="acta-stats-label">Total</span>
            <span className="acta-stats-value">{data.filas.length}</span>
          </div>
          <div className="acta-stats-divider" />
          <div className="acta-stats-item">
            <span className="acta-stats-dot is-aprobado" />
            <span className="acta-stats-label">Aprobados</span>
            <span className="acta-stats-value is-aprobado">{aprobados}</span>
          </div>
          <div className="acta-stats-item">
            <span className="acta-stats-dot is-proceso" />
            <span className="acta-stats-label">En proceso</span>
            <span className="acta-stats-value is-proceso">{proceso}</span>
          </div>
          <div className="acta-stats-item">
            <span className="acta-stats-dot is-reprobado" />
            <span className="acta-stats-label">Reprobados</span>
            <span className="acta-stats-value is-reprobado">{reprobados}</span>
          </div>
          {promGeneral && (
            <>
              <div className="acta-stats-divider" />
              <div className="acta-stats-item">
                <span className="acta-stats-label">Promedio general</span>
                <span className="acta-stats-value acta-stats-prom">{promGeneral}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────
export default function ActaExamen() {
  const [cicloId,        setCicloId]        = React.useState(null)
  const [cursoId,        setCursoId]        = React.useState(null)
  const [materiaId,      setMateriaId]      = React.useState(null)
  const [materiaLabel,   setMateriaLabel]   = React.useState('')
  const [exporting,      setExporting]      = React.useState(false)

  const ciclos   = useCiclos()
  const cursos   = useCursosPorCiclo(cicloId)
  const materias = useMateriasPorCurso(cursoId)
  const { data, loading, error } = usePlanillaActa(cicloId, cursoId, materiaId)

  const ciclosOpciones   = ciclos.map((c)  => ({ label: c.nombre_ciclo_lectivo, value: c.id_ciclo_lectivo }))
  const cursosOpciones   = cursos.map((c)  => ({ label: c.curso, value: c.id_curso }))
  const materiasOpciones = materias.map((m) => ({
    label: m.nombre?.nombre_materia || m.nombre_materia || `Materia ${m.id_materia}`,
    value: m.id_materia,
  }))

  const tituloActa = materiaLabel ? `Acta de Examen — ${materiaLabel}` : 'Acta de Examen'
  const filtrosCompletos = cicloId && cursoId && materiaId

  return (
    <CContainer fluid className="py-3">
      <CCard className="acta-card">

        {/* ── Encabezado ── */}
        <CCardHeader className="acta-card-header">

          <div className="acta-header-left">
            <div className="acta-header-brand">
              <div className="acta-header-brand-icon">
                <CIcon icon={cilDescription} className="acta-brand-icon" />
              </div>
              <div>
                <h2 className="acta-header-h2">Acta de Examen</h2>
                <p className="acta-header-sub">Planilla de calificaciones por materia y curso</p>
              </div>
            </div>

            {/* Filtros + botón en la misma fila */}
            <div className="acta-filters-row">
              <FilterSelect
                step="1"
                label="Ciclo Lectivo"
                value={cicloId}
                options={ciclosOpciones}
                placeholder="Seleccioná un ciclo"
                disabled={false}
                onChange={(v) => { setCicloId(v); setCursoId(null); setMateriaId(null) }}
              />
              <FilterSelect
                step="2"
                label="Curso"
                value={cursoId}
                options={cursosOpciones}
                placeholder={cicloId ? 'Seleccioná un curso' : 'Primero elegí un ciclo'}
                disabled={!cicloId}
                onChange={(v) => { setCursoId(v); setMateriaId(null) }}
              />
              <FilterSelect
                step="3"
                label="Materia"
                value={materiaId}
                options={materiasOpciones}
                placeholder={cursoId ? 'Seleccioná una materia' : 'Primero elegí un curso'}
                disabled={!cursoId}
                onChange={(v) => {
                  setMateriaId(v)
                  setMateriaLabel(materiasOpciones.find((m) => m.value === v)?.label || '')
                }}
              />

              {/* Botón exportar alineado con los filtros */}
              <div className="acta-filter-field acta-filter-field--action">
                <span className="acta-filter-label">&nbsp;</span>
                <CButton
                  className="acta-btn-export"
                  disabled={exporting || !data}
                  onClick={async () => {
                    setExporting(true)
                    try { await generarPDF(data, tituloActa) }
                    finally { setExporting(false) }
                  }}
                >
                  {exporting
                    ? <CSpinner size="sm" className="me-2" style={{ borderWidth: '0.15rem' }} />
                    : <CIcon icon={cilCloudDownload} className="me-2" style={{ width: '0.9rem', height: '0.9rem' }} />
                  }
                  {exporting ? 'Generando…' : 'Exportar PDF'}
                </CButton>
              </div>
            </div>
          </div>

        </CCardHeader>

        {/* ── Cuerpo ── */}
        <CCardBody className="acta-card-body">

          {loading && (
            <div className="acta-loading">
              <CSpinner style={{ width: '2rem', height: '2rem', borderWidth: '0.2rem', color: 'var(--acad-blue, #0369a1)' }} />
              <span className="acta-loading-text">Cargando acta…</span>
            </div>
          )}

          {error && (
            <div className="acta-error">
              <span className="acta-error-icon">⚠</span>
              {error}
            </div>
          )}

          {!loading && !error && data && <TablaActa data={data} />}

          {!loading && !error && !data && (
            <div className="acta-placeholder">
              <div className="acta-placeholder-steps">
                {[
                  { n: '1', label: 'Elegí un ciclo lectivo',  done: !!cicloId   },
                  { n: '2', label: 'Seleccioná el curso',     done: !!cursoId   },
                  { n: '3', label: 'Elegí la materia',        done: !!materiaId },
                ].map(({ n, label, done }) => (
                  <div key={n} className={`acta-step${done ? ' is-done' : ''}`}>
                    <span className="acta-step-num">{done ? '✓' : n}</span>
                    <span className="acta-step-label">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </CCardBody>

      </CCard>
    </CContainer>
  )
}
