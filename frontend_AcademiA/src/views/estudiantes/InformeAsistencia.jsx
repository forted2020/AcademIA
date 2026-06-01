// frontend_AcademiA/src/views/estudiantes/InformeAsistencia.jsx
//
// Informe de asistencia por ciclo → curso → alumno.
// Mismo patrón de filtros en cascada que PlanillaCalificaciones.

import React from 'react'
import {
  CContainer, CCard, CCardHeader, CCardBody,
  CSpinner, CFormSelect, CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCalendar, cilCloudDownload, cilCheckCircle, cilXCircle, cilDescription,
} from '@coreui/icons'

import api from '../../api/api.js'
import useAuthUser from '../../hooks/useAuthUser'
import { useConfigSistema } from '../../hooks/useConfigSistema'
import { useFormatoImpresion } from '../../hooks/useFormatoImpresion'
import './InformeAsistencia.css'

// ─── Helpers de rol ───────────────────────────────────────
function getRolSistema() {
  try {
    const u = JSON.parse(localStorage.getItem('user') || '{}')
    return u.rol_sistema ?? null
  } catch { return null }
}

// ─── Hooks de datos en cascada ────────────────────────────

const useCiclos = (docenteId) => {
  const [ciclos, setCiclos] = React.useState([])
  const rol = getRolSistema()
  React.useEffect(() => {
    if (rol === 'DOCENTE_APP') {
      if (!docenteId) return
      api.get(`/api/docentes/${docenteId}/ciclos`)
        .then((r) => setCiclos(Array.isArray(r.data) ? r.data : []))
        .catch(() => setCiclos([]))
    } else {
      api.get('/api/ciclos/', { params: { skip: 0, limit: 50 } })
        .then((r) => {
          const p = r?.data
          setCiclos(Array.isArray(p) ? p : (p?.data ?? []))
        })
        .catch(() => setCiclos([]))
    }
  }, [docenteId, rol])
  return ciclos
}

const useCursosPorCiclo = (cicloId, docenteId) => {
  const [cursos, setCursos] = React.useState([])
  const rol = getRolSistema()
  React.useEffect(() => {
    if (!cicloId) { setCursos([]); return }
    if (rol === 'DOCENTE_APP') {
      if (!docenteId) return
      api.get(`/api/docentes/${docenteId}/ciclos/${cicloId}/cursos`)
        .then((r) => setCursos(Array.isArray(r.data) ? r.data : []))
        .catch(() => setCursos([]))
    } else {
      api.get(`/api/cursos/por_ciclo/${cicloId}`)
        .then((r) => {
          console.log('[useCursosPorCiclo] cicloId:', cicloId, '| respuesta:', r.data)
          setCursos(Array.isArray(r.data) ? r.data : [])
        })
        .catch((e) => { console.error('[useCursosPorCiclo] error:', e); setCursos([]) })
    }
  }, [cicloId, docenteId, rol])
  return cursos
}

const useAlumnosPorCurso = (cursoId, cicloId) => {
  const [alumnos, setAlumnos] = React.useState([])
  React.useEffect(() => {
    if (!cursoId) { setAlumnos([]); return }
    const params = cicloId ? { id_ciclo: cicloId } : {}
    api.get(`/api/cursos/${cursoId}/alumnos`, { params })
      .then((r) => setAlumnos(Array.isArray(r.data) ? r.data : []))
      .catch(() => setAlumnos([]))
  }, [cursoId, cicloId])
  return alumnos
}

const useInasistencias = (alumnoId, cicloId) => {
  const [data, setData]       = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError]     = React.useState(null)
  React.useEffect(() => {
    if (!alumnoId || !cicloId) { setData(null); return }
    setLoading(true); setError(null)
    api.get(`/api/estudiantes/inasistencias/${alumnoId}/ciclo/${cicloId}`)
      .then((r) => setData(r.data))
      .catch((e) => setError(e?.response?.data?.detail || 'Error al cargar asistencias'))
      .finally(() => setLoading(false))
  }, [alumnoId, cicloId])
  return { data, loading, error }
}

// ─── Generación de PDF ────────────────────────────────────
function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]
}

const generarPDF = async (data, nombreAlumno, nombreCiclo, configGlobal = {}, configFormato = {}) => {
  const jsPDF = (await import('jspdf')).default
  await import('jspdf-autotable')

  const doc    = new jsPDF('p', 'pt', 'a4')
  const margin = 40
  const azul   = hexToRgb(configGlobal.color_primario   ?? '#0369a1')
  const navy   = hexToRgb(configGlobal.color_encabezado ?? '#0f172a')
  const verde  = [40, 167, 69]
  const rojo   = [220, 53, 69]

  const nombreInst   = configGlobal.nombre_institucion ?? 'INSTITUCIÓN EDUCATIVA ACADEMIA'
  const titulo       = configFormato.titulo_documento  ?? 'INFORME DE ASISTENCIA'
  const textoFirma   = configFormato.texto_firma       ?? ''
  const textoPie     = configFormato.texto_pie || configGlobal.texto_pie_global || ''
  const mostrarFecha = configFormato.mostrar_fecha_emision !== '0'
  const logoDatos    = configGlobal.logo_base64  ?? null
  const logoMime     = configGlobal.logo_mime_type ?? 'image/png'
  const mostrarLogo  = configFormato.mostrar_logo !== '0' && !!logoDatos

  let yPos = 50
  if (mostrarLogo) {
    try { doc.addImage(`data:${logoMime};base64,${logoDatos}`, logoMime.split('/')[1].toUpperCase(), margin, 18, 60, 28); yPos = 60 } catch (e) {}
  }

  doc.setFontSize(14); doc.setTextColor(...navy)
  doc.text(nombreInst, mostrarLogo ? margin + 70 : margin, yPos)
  if (mostrarFecha) { doc.setFontSize(9); doc.setTextColor(100); doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}`, mostrarLogo ? margin + 70 : margin, yPos + 13) }
  doc.setDrawColor(...azul); doc.setLineWidth(2); doc.line(margin, yPos + 22, 555, yPos + 22)
  doc.setFontSize(13); doc.setTextColor(...azul); doc.text(titulo, margin, yPos + 42)
  doc.setFontSize(10); doc.setTextColor(40)
  doc.text(`Alumno: ${nombreAlumno}`, margin, yPos + 60)
  doc.text(`Ciclo: ${nombreCiclo}`, margin, yPos + 74)

  const injust = (data.totalInasistencia - data.totalInasistenciaJustif).toFixed(2)
  doc.setFontSize(9)
  doc.text(`Total: ${data.totalInasistencia}`, margin, yPos + 96)
  doc.text(`Justificadas: ${data.totalInasistenciaJustif}`, margin + 160, yPos + 96)
  doc.text(`Sin justificar: ${injust}`, margin + 310, yPos + 96)

  const rows = (data.detailedRecords || []).map((r) => ({
    date: r.date, type: r.type, value: r.value,
    justified: r.justified ? 'Sí' : 'No', reason: r.reason || '—',
  }))

  doc.autoTable({
    columns: [
      { title: 'Fecha', dataKey: 'date' }, { title: 'Tipo', dataKey: 'type' },
      { title: 'Valor', dataKey: 'value' }, { title: 'Justificada', dataKey: 'justified' },
      { title: 'Motivo', dataKey: 'reason' },
    ],
    body: rows,
    startY: yPos + 112,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: azul, textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 251] },
    margin: { left: margin, right: margin },
    didParseCell: (h) => {
      if (h.column.dataKey === 'justified' && h.section === 'body') {
        h.cell.styles.textColor = h.cell.raw === 'Sí' ? verde : rojo
        h.cell.styles.fontStyle = 'bold'
      }
    },
  })

  const yFinal = doc.lastAutoTable?.finalY ?? (yPos + 112)
  if (textoFirma) { doc.setFontSize(9); doc.setTextColor(40); doc.text(textoFirma, 297, yFinal + 40, { align: 'center' }); doc.line(220, yFinal + 32, 374, yFinal + 32) }
  if (textoPie)   { doc.setFontSize(8); doc.setTextColor(100); doc.text(textoPie, 297, yFinal + 60, { align: 'center', maxWidth: 400 }) }

  doc.save(`Asistencia_${nombreAlumno.replace(/\s+/g, '_')}_${nombreCiclo}.pdf`)
}

// ─── FilterSelect (mismo patrón que PlanillaCalificaciones) ──
function FilterSelect({ label, value, onChange, options, placeholder, disabled, step }) {
  return (
    <div className="acta-filter-field">
      <label className="acta-filter-label">
        <span className={`acta-filter-step${!disabled ? ' is-ready' : ''}`}>{step}</span>
        {label}
      </label>
      <CFormSelect
        className={`acta-filter-select${disabled ? ' is-disabled' : ''}`}
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

// ─── Tarjetas de resumen ──────────────────────────────────
const ResumenAsistencia = ({ data }) => {
  const injust    = parseFloat((data.totalInasistencia - data.totalInasistenciaJustif).toFixed(2))
  const enRiesgo  = !!data.requiereActaReincorporacion || !!data.caracterLibre

  return (
    <div className="asis-inf-resumen-grid">
      <div className="asis-inf-stat-card">
        <span className="asis-inf-stat-label">Total Inasistencias</span>
        <span className={`asis-inf-stat-value ${enRiesgo ? 'asis-inf-stat-value--riesgo' : 'asis-inf-stat-value--total'}`}>
          {data.totalInasistencia.toFixed(1)}
        </span>
        {data.caracterLibre         && <span className="asis-inf-badge-riesgo">Carácter Libre</span>}
        {!data.caracterLibre && data.requiereActaReincorporacion && (
          <span className="asis-inf-badge-riesgo">Requiere reincorporación</span>
        )}
      </div>
      <div className="asis-inf-stat-card">
        <span className="asis-inf-stat-label">Justificadas</span>
        <span className="asis-inf-stat-value asis-inf-stat-value--justif">{data.totalInasistenciaJustif}</span>
      </div>
      <div className="asis-inf-stat-card">
        <span className="asis-inf-stat-label">Sin Justificar</span>
        <span className="asis-inf-stat-value asis-inf-stat-value--sinjust">{injust}</span>
      </div>
    </div>
  )
}

// ─── Banner normativo ─────────────────────────────────────
const AlertaNormativa = ({ data }) => {
  if (!data.requiereActaReincorporacion && !data.caracterLibre) return null
  const injust = (data.totalInasistencia - data.totalInasistenciaJustif).toFixed(2)
  const esLibre = !!data.caracterLibre
  return (
    <div className={`asis-inf-alerta asis-inf-alerta--${esLibre ? 'critica' : 'advertencia'}`}>
      <CIcon icon={cilXCircle} className="asis-inf-alerta-icon" />
      <div className="asis-inf-alerta-text">
        <strong>
          {esLibre
            ? `El alumno alcanzó ${injust} inasistencias computables — pasa a carácter Libre / Libre Concurrente.`
            : `El alumno alcanzó ${injust} inasistencias computables — corresponde generar el Acta de Reincorporación.`}
        </strong>
        <span>
          {esLibre
            ? `Umbral configurado: ${data.umbralLibre ?? 28} inasistencias para pase a Libre.`
            : `Umbral configurado: ${data.umbralReincorporacion ?? 20} inasistencias para reincorporación.`}
        </span>
      </div>
    </div>
  )
}

// ─── Tabla de detalle ─────────────────────────────────────
const TablaDetalle = ({ registros }) => {
  if (!registros?.length) {
    return (
      <div className="acta-empty">
        <CIcon icon={cilDescription} className="acta-empty-icon" />
        <p>No hay registros de inasistencias para este período.</p>
      </div>
    )
  }
  return (
    <div className="asis-inf-table-wrap">
      <table className="asis-inf-table">
        <thead>
          <tr>
            <th className="asis-inf-th">Fecha</th>
            <th className="asis-inf-th">Tipo</th>
            <th className="asis-inf-th asis-inf-th--center">Valor</th>
            <th className="asis-inf-th asis-inf-th--center">Justificada</th>
            <th className="asis-inf-th">Motivo</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((r, i) => (
            <tr key={i} className={`asis-inf-tr${i % 2 !== 0 ? ' asis-inf-tr--alt' : ''}`}>
              <td className="asis-inf-td" style={{ fontWeight: 600 }}>{r.date}</td>
              <td className="asis-inf-td">{r.type}</td>
              <td className="asis-inf-td asis-inf-td--center">{r.value}</td>
              <td className="asis-inf-td asis-inf-td--center">
                {r.justified
                  ? <span className="asis-inf-justif-si"><CIcon icon={cilCheckCircle} style={{ width: '0.875rem', height: '0.875rem' }} />Sí</span>
                  : <span className="asis-inf-justif-no"><CIcon icon={cilXCircle}     style={{ width: '0.875rem', height: '0.875rem' }} />No</span>}
              </td>
              <td className="asis-inf-td asis-inf-td--muted">{r.reason || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────
export default function InformeAsistencia() {
  const { idEntidad: loggedId, rol } = useAuthUser()
  const esAlumno = rol === 'ALUMNO_APP'

  const { configs: configGlobal } = useConfigSistema()
  const { configs: configFormato } = useFormatoImpresion('informe_asistencia')

  const [cicloId,   setCicloId]   = React.useState(null)
  const [cursoId,   setCursoId]   = React.useState(null)
  const [alumnoId,  setAlumnoId]  = React.useState(esAlumno ? loggedId : null)
  const [exporting, setExporting] = React.useState(false)

  // Para ALUMNO_APP: el ciclo activo se carga automáticamente
  const [cicloActivoId, setCicloActivoId] = React.useState(null)
  React.useEffect(() => {
    if (!esAlumno) return
    api.get('/api/ciclos/activo')
      .then((r) => {
        const id = r.data?.id_ciclo_lectivo
        if (id) { setCicloId(id); setCicloActivoId(id) }
      })
      .catch(() => {})
  }, [esAlumno])

  const ciclos  = useCiclos(loggedId)
  const cursos  = useCursosPorCiclo(cicloId, loggedId)
  const alumnos = useAlumnosPorCurso(cursoId, cicloId)

  // Alumno seleccionado: si es alumno usa su propio id, si no usa el dropdown
  const idEfectivo = esAlumno ? loggedId : alumnoId

  const { data, loading, error } = useInasistencias(idEfectivo, cicloId)

  const ciclosOpciones = ciclos.map((c) => ({ label: c.nombre_ciclo_lectivo, value: c.id_ciclo_lectivo }))
  const cursosOpciones = cursos.map((c) => ({ label: c.curso, value: c.id_curso }))
  const alumnosOpciones = alumnos.map((a) => ({
    label: `${a.apellido}, ${a.nombre}`,
    value: a.id_entidad,
  }))

  const nombreAlumno = esAlumno
    ? 'Mi informe'
    : (alumnos.find((a) => a.id_entidad === alumnoId)
        ? `${alumnos.find((a) => a.id_entidad === alumnoId).apellido}, ${alumnos.find((a) => a.id_entidad === alumnoId).nombre}`
        : 'Alumno')

  const nombreCiclo = ciclos.find((c) => c.id_ciclo_lectivo === cicloId)?.nombre_ciclo_lectivo ?? ''

  const filtrosCompletos = esAlumno ? !!cicloId : (!!cicloId && !!cursoId && !!alumnoId)

  return (
    <CContainer fluid className="py-3">
      <CCard className="acta-card">

        {/* ── Encabezado ── */}
        <CCardHeader className="acta-card-header">
          <div className="acta-header-left">
            <div className="acta-header-brand">
              <div className="acta-header-brand-icon">
                <CIcon icon={cilCalendar} className="acta-brand-icon" />
              </div>
              <div>
                <h2 className="acta-header-h2">Informe de Asistencia</h2>
                <p className="acta-header-sub">Registro de inasistencias por ciclo lectivo</p>
              </div>
            </div>

            {/* Filtros en cascada */}
            <div className="acta-filters-row">

              {/* Paso 1: Ciclo */}
              {!esAlumno && (
                <FilterSelect
                  step="1"
                  label="Ciclo Lectivo"
                  value={cicloId}
                  options={ciclosOpciones}
                  placeholder="Seleccioná un ciclo"
                  disabled={false}
                  onChange={(v) => { setCicloId(v); setCursoId(null); setAlumnoId(null) }}
                />
              )}

              {/* Paso 2: Curso (solo admin/docente) */}
              {!esAlumno && (
                <FilterSelect
                  step="2"
                  label="Curso"
                  value={cursoId}
                  options={cursosOpciones}
                  placeholder={cicloId ? 'Seleccioná un curso' : 'Primero elegí un ciclo'}
                  disabled={!cicloId}
                  onChange={(v) => { setCursoId(v); setAlumnoId(null) }}
                />
              )}

              {/* Paso 3: Alumno (solo admin/docente) */}
              {!esAlumno && (
                <FilterSelect
                  step="3"
                  label="Alumno"
                  value={alumnoId}
                  options={alumnosOpciones}
                  placeholder={cursoId ? 'Seleccioná un alumno' : 'Primero elegí un curso'}
                  disabled={!cursoId}
                  onChange={(v) => setAlumnoId(v)}
                />
              )}

              {/* Botón exportar alineado con los filtros */}
              <div className="acta-filter-field acta-filter-field--action">
                <span className="acta-filter-label">&nbsp;</span>
                <CButton
                  className="acta-btn-export"
                  disabled={exporting || !data}
                  onClick={async () => {
                    setExporting(true)
                    try { await generarPDF(data, nombreAlumno, nombreCiclo, configGlobal, configFormato) }
                    finally { setExporting(false) }
                  }}
                >
                  {exporting
                    ? <CSpinner size="sm" className="me-2" style={{ borderWidth: '0.15rem' }} />
                    : <CIcon icon={cilCloudDownload} className="me-2" style={{ width: '0.9rem', height: '0.9rem' }} />}
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
              <span className="acta-loading-text">Cargando inasistencias…</span>
            </div>
          )}

          {error && (
            <div className="acta-error">
              <span className="acta-error-icon">⚠</span>
              {error}
            </div>
          )}

          {!loading && !error && data && (
            <>
              <AlertaNormativa data={data} />
              <ResumenAsistencia data={data} />
              <p className="asis-inf-table-section-title">
                Detalle de registros ({data.detailedRecords?.length ?? 0})
              </p>
              <TablaDetalle registros={data.detailedRecords} />
            </>
          )}

          {/* Estado inicial: guía de pasos */}
          {!loading && !error && !data && (
            <div className="acta-placeholder">
              <div className="acta-placeholder-steps">
                {(esAlumno
                  ? [{ paso: '1', label: 'Cargando tu ciclo activo…', done: !!cicloId }]
                  : [
                      { paso: '1', label: 'Elegí un ciclo lectivo', done: !!cicloId  },
                      { paso: '2', label: 'Seleccioná el curso',    done: !!cursoId  },
                      { paso: '3', label: 'Elegí el alumno',        done: !!alumnoId },
                    ]
                ).map(({ paso, label, done }) => (
                  <div key={paso} className={`acta-step${done ? ' is-done' : ''}`}>
                    <span className="acta-step-num">{done ? '✓' : paso}</span>
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
