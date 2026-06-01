// frontend_AcademiA/src/views/estudiantes/PlanillaCalificaciones.jsx
// (renombrado desde ActaExamen.jsx — Fase 4. La clave de t_formato_config
// sigue siendo "acta_examen" por compatibilidad con la BD.)

import React from 'react'
import {
  CContainer, CCard, CCardHeader, CCardBody,
  CSpinner, CButton, CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilDescription, cilCloudDownload } from '@coreui/icons'

import api from '../../api/api.js'
import { useConfigSistema, getRangoNotas } from '../../hooks/useConfigSistema'
import { useFormatoImpresion } from '../../hooks/useFormatoImpresion'
import useAuthUser from '../../hooks/useAuthUser'
import './PlanillaCalificaciones.css'

// Devuelve el rol del sistema del usuario logueado
function getRolSistema() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    return u.rol_sistema ?? null
  } catch { return null }
}

// ─── Hooks de datos ──────────────────────────────────────

// Ciclos: si es DOCENTE_APP devuelve solo los ciclos en que dictó materias;
// si es ADMIN_SISTEMA devuelve todos los ciclos.
const useCiclos = (docenteId) => {
  const [ciclos, setCiclos] = React.useState([])
  const rol = getRolSistema()
  React.useEffect(() => {
    if (rol === 'DOCENTE_APP') {
      if (!docenteId) return
      api.get(`/api/docentes/${docenteId}/ciclos`)
        .then((res) => setCiclos(Array.isArray(res.data) ? res.data : []))
        .catch(() => setCiclos([]))
    } else {
      api.get('/api/ciclos/', { params: { skip: 0, limit: 50 } })
        .then((res) => {
          const payload = res?.data
          setCiclos(Array.isArray(payload) ? payload : (payload?.data ?? []))
        })
        .catch(() => setCiclos([]))
    }
  }, [docenteId, rol])
  return ciclos
}

// Cursos: si es docente, solo los cursos del ciclo en que dio clases.
const useCursosPorCiclo = (cicloId, docenteId) => {
  const [cursos, setCursos] = React.useState([])
  const rol = getRolSistema()
  React.useEffect(() => {
    if (!cicloId) { setCursos([]); return }
    if (rol === 'DOCENTE_APP') {
      if (!docenteId) return
      api.get(`/api/docentes/${docenteId}/ciclos/${cicloId}/cursos`)
        .then((res) => setCursos(Array.isArray(res.data) ? res.data : []))
        .catch(() => setCursos([]))
    } else {
      api.get(`/api/cursos/por_ciclo/${cicloId}`)
        .then((res) => setCursos(Array.isArray(res.data) ? res.data : []))
        .catch(() => setCursos([]))
    }
  }, [cicloId, docenteId, rol])
  return cursos
}

// Materias: si es docente, solo las que dicta en ese curso y ciclo.
const useMateriasPorCurso = (cicloId, cursoId, docenteId) => {
  const [materias, setMaterias] = React.useState([])
  const rol = getRolSistema()
  React.useEffect(() => {
    if (!cursoId) { setMaterias([]); return }
    if (rol === 'DOCENTE_APP') {
      if (!docenteId || !cicloId) return
      api.get(`/api/docentes/${docenteId}/ciclos/${cicloId}/cursos/${cursoId}/materias`)
        .then((res) => setMaterias(Array.isArray(res.data) ? res.data : []))
        .catch(() => setMaterias([]))
    } else {
      api.get(`/api/materias/curso/${cursoId}`)
        .then((res) => setMaterias(res.data || []))
        .catch(() => setMaterias([]))
    }
  }, [cicloId, cursoId, docenteId, rol])
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
function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]
}

const generarPDF = async (data, titulo, configGlobal = {}, configFormato = {}, notaAprobacion = 6) => {
  const { jsPDF } = await import('jspdf')
  const { autoTable } = await import('jspdf-autotable')

  const orientacion   = configFormato.orientacion ?? 'landscape'
  const doc           = new jsPDF(orientacion === 'landscape' ? 'l' : 'p', 'pt', 'a4')
  const margin        = 40
  const pageW         = orientacion === 'landscape' ? 841 : 595
  const navy          = hexToRgb(configGlobal.color_encabezado ?? '#0f172a')
  const blue          = hexToRgb(configGlobal.color_primario   ?? '#0369a1')
  const nombreInst    = configGlobal.nombre_institucion ?? 'INSTITUCIÓN EDUCATIVA ACADEMIA'
  const titDoc        = configFormato.titulo_documento ?? titulo.toUpperCase()
  const mostrarDef    = configFormato.mostrar_columna_definitiva !== '0'
  const textoLegal    = configFormato.texto_legal ?? ''
  const textoFirma    = configFormato.texto_firma ?? ''
  const mostrarFecha  = configFormato.mostrar_fecha_emision !== '0'
  const logoDatos     = configGlobal.logo_base64 ?? null
  const logoMime      = configGlobal.logo_mime_type ?? 'image/png'
  const mostrarLogo   = configFormato.mostrar_logo !== '0' && !!logoDatos

  let yPos = 50
  if (mostrarLogo) {
    try { doc.addImage(`data:${logoMime};base64,${logoDatos}`, logoMime.split('/')[1].toUpperCase(), margin, 18, 60, 28); yPos = 60 } catch (e) {}
  }

  doc.setFontSize(14); doc.setTextColor(...navy)
  doc.text(nombreInst, mostrarLogo ? margin + 70 : margin, yPos)
  if (mostrarFecha) { doc.setFontSize(9); doc.setTextColor(100); doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}`, mostrarLogo ? margin + 70 : margin, yPos + 13) }
  doc.setDrawColor(...blue); doc.setLineWidth(2); doc.line(margin, yPos + 22, pageW - margin, yPos + 22)
  doc.setFontSize(13); doc.setTextColor(...blue); doc.text(titDoc, margin, yPos + 42)

  const cols = [
    { header: 'Alumno', dataKey: 'alumno' },
    ...data.columnas.map((c) => ({ header: c.label, dataKey: `nota_${c.id_tipo_nota}` })),
    { header: 'Promedio', dataKey: 'promedio' },
    ...(mostrarDef ? [{ header: 'Definitiva', dataKey: 'definitiva' }] : []),
  ]
  const rows = data.filas.map((f) => {
    const row = { alumno: f.nombre_completo }
    data.columnas.forEach((c) => { row[`nota_${c.id_tipo_nota}`] = f.calificaciones[c.id_tipo_nota] != null ? f.calificaciones[c.id_tipo_nota] : '—' })
    row.promedio   = f.promedio   != null ? f.promedio   : '—'
    if (mostrarDef) row.definitiva = f.definitiva != null ? f.definitiva : '—'
    return row
  })

  autoTable(doc, {
    columns: cols, body: rows, startY: yPos + 60,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 4, font: 'helvetica' },
    headStyles: { fillColor: navy, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    margin: { left: margin, right: margin },
    // Resalta los aplazos en rojo y negrita para coincidir con la planilla en pantalla.
    didParseCell: (hook) => {
      if (hook.section !== 'body') return
      const key = hook.column.dataKey
      if (key === 'alumno') return
      const raw = hook.cell.raw
      const num = typeof raw === 'number' ? raw : parseFloat(raw)
      if (Number.isFinite(num) && num < notaAprobacion) {
        hook.cell.styles.textColor = [185, 28, 28]
        hook.cell.styles.fontStyle = 'bold'
      }
    },
  })

  const yFinal = doc.lastAutoTable?.finalY ?? (yPos + 60)
  if (textoFirma) { doc.setFontSize(9); doc.setTextColor(40); doc.text(textoFirma, pageW / 2, yFinal + 40, { align: 'center' }); doc.line(pageW / 2 - 80, yFinal + 32, pageW / 2 + 80, yFinal + 32) }
  if (textoLegal) { doc.setFontSize(8); doc.setTextColor(100); doc.text(textoLegal, margin, yFinal + 60, { maxWidth: pageW - margin * 2 }) }

  doc.save(`${titDoc.replace(/\s+/g, '_')}.pdf`)
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
// `notaAprobacion` proviene de t_configuracion_sistema.nota_aprobacion (Fase 1).
// El umbral intermedio "en proceso" se ubica un 33% por debajo de la aprobación
// para mantener la escala visual original (aprob=6 → proceso=4).
function DefinitivaBadge({ value, notaAprobacion = 6 }) {
  if (value == null) return <span className="acta-dash">—</span>
  const umbralProceso = notaAprobacion * (4 / 6)
  const cls = value >= notaAprobacion ? ' is-aprobado'
            : value >= umbralProceso  ? ' is-proceso'
            : ' is-reprobado'
  return <span className={`acta-definitiva-badge${cls}`}>{value}</span>
}

// ─── Tabla del acta ───────────────────────────────────────
function TablaActa({ data, notaAprobacion = 6 }) {
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
  const umbralProceso = notaAprobacion * (4 / 6)
  const conDef    = data.filas.filter((f) => f.definitiva != null)
  const aprobados = conDef.filter((f) => f.definitiva >= notaAprobacion).length
  const proceso   = conDef.filter((f) => f.definitiva >= umbralProceso && f.definitiva < notaAprobacion).length
  const reprobados= conDef.filter((f) => f.definitiva < umbralProceso).length
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
                {data.columnas.map((c) => {
                  const valor = fila.calificaciones[c.id_tipo_nota]
                  // Marca aplazos: nota numérica menor que la configurada como aprobación.
                  const esAplazo = valor != null && Number(valor) < notaAprobacion
                  return (
                    <td key={c.id_tipo_nota} className={`acta-td acta-td--center${esAplazo ? ' acta-td--aplazo' : ''}`}>
                      {valor != null ? valor : <span className="acta-dash">—</span>}
                    </td>
                  )
                })}
                <td className={`acta-td acta-td--center${fila.promedio != null && Number(fila.promedio) < notaAprobacion ? ' acta-td--aplazo' : ''}`}>
                  {fila.promedio != null ? fila.promedio : <span className="acta-dash">—</span>}
                </td>
                <td className="acta-td acta-td--center">
                  <DefinitivaBadge value={fila.definitiva} notaAprobacion={notaAprobacion} />
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
export default function PlanillaCalificaciones() {
  const [cicloId,        setCicloId]        = React.useState(null)
  const [cursoId,        setCursoId]        = React.useState(null)
  const [materiaId,      setMateriaId]      = React.useState(null)
  const [materiaLabel,   setMateriaLabel]   = React.useState('')
  const [exporting,      setExporting]      = React.useState(false)

  const { configs: configGlobal } = useConfigSistema()
  const { configs: configFormato } = useFormatoImpresion('acta_examen')
  const { notaAprobacion } = getRangoNotas(configGlobal)
  const { idEntidad } = useAuthUser()

  const ciclos   = useCiclos(idEntidad)
  const cursos   = useCursosPorCiclo(cicloId, idEntidad)
  const materias = useMateriasPorCurso(cicloId, cursoId, idEntidad)
  const { data, loading, error } = usePlanillaActa(cicloId, cursoId, materiaId)

  // Normaliza opciones independientemente de si vienen del endpoint admin o del de docente
  const ciclosOpciones   = ciclos.map((c)  => ({
    label: c.nombre_ciclo_lectivo,
    value: c.id_ciclo_lectivo,
  }))
  const cursosOpciones   = cursos.map((c)  => ({
    label: c.curso,
    value: c.id_curso,
  }))
  const materiasOpciones = materias.map((m) => ({
    label: m.nombre?.nombre_materia || m.nombre_materia || `Materia ${m.id_materia}`,
    value: m.id_materia,
  }))

  const tituloActa = materiaLabel ? `Planilla de Calificaciones — ${materiaLabel}` : 'Planilla de Calificaciones'
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
                <h2 className="acta-header-h2">Planilla de Calificaciones</h2>
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
                    try { await generarPDF(data, tituloActa, configGlobal, configFormato, notaAprobacion) }
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

          {!loading && !error && data && <TablaActa data={data} notaAprobacion={notaAprobacion} />}

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
