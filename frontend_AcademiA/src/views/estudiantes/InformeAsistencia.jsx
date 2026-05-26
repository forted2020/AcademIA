// frontend_AcademiA\src\views\estudiantes\InformeAsistencia.jsx
//
// Informe de asistencia por estudiante y año.
// Consume el endpoint GET /api/estudiantes/inasistencias/{id_entidad}/{year}
// No modifica AttendanceSection.jsx ni ningún componente existente.

import React from 'react'
import {
  CContainer, CCard, CCardHeader, CCardBody,
  CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCalendar, cilFile, cilUser, cilCheckCircle, cilXCircle } from '@coreui/icons'

import api from '../../api/api.js'
import useAuthUser from '../../hooks/useAuthUser'
import { useConfigSistema } from '../../hooks/useConfigSistema'
import { useFormatoImpresion } from '../../hooks/useFormatoImpresion'
import './InformeAsistencia.css'

// ─────────────────────────────────────────────
//  Hook: carga inasistencias
// ─────────────────────────────────────────────
const useInasistencias = (idEstudiante, year) => {
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    if (!idEstudiante || !year) { setData(null); return }
    setLoading(true)
    setError(null)
    api
      .get(`/api/estudiantes/inasistencias/${idEstudiante}/${year}`)
      .then((res) => setData(res.data))
      .catch((err) => setError(err?.response?.data?.detail || 'Error al cargar asistencias'))
      .finally(() => setLoading(false))
  }, [idEstudiante, year])

  return { data, loading, error }
}

// ─────────────────────────────────────────────
//  Generación de PDF
// ─────────────────────────────────────────────
function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]
}

const generarPDF = async (data, nombreEstudiante, year, configGlobal = {}, configFormato = {}) => {
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

  // Encabezado
  doc.setFontSize(14); doc.setTextColor(...navy)
  doc.text(nombreInst, mostrarLogo ? margin + 70 : margin, yPos)
  if (mostrarFecha) { doc.setFontSize(9); doc.setTextColor(100); doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}`, mostrarLogo ? margin + 70 : margin, yPos + 13) }
  doc.setDrawColor(...azul); doc.setLineWidth(2); doc.line(margin, yPos + 22, 555, yPos + 22)
  doc.setFontSize(13); doc.setTextColor(...azul); doc.text(titulo, margin, yPos + 42)
  doc.setFontSize(10); doc.setTextColor(40)
  doc.text(`Alumno: ${nombreEstudiante}`, margin, yPos + 60)
  doc.text(`Año: ${year}`, margin, yPos + 74)

  // Resumen
  const injust = (data.totalInasistencia - data.totalInasistenciaJustif).toFixed(2)
  doc.setFontSize(9)
  doc.text(`Total inasistencias: ${data.totalInasistencia}`, margin, yPos + 96)
  doc.text(`Justificadas: ${data.totalInasistenciaJustif}`, margin + 160, yPos + 96)
  doc.text(`Sin justificar: ${injust}`, margin + 310, yPos + 96)

  // Tabla detalle
  const cols = [
    { title: 'Fecha', dataKey: 'date' },
    { title: 'Tipo', dataKey: 'type' },
    { title: 'Valor', dataKey: 'value' },
    { title: 'Justificada', dataKey: 'justified' },
    { title: 'Motivo', dataKey: 'reason' },
  ]

  const rows = (data.detailedRecords || []).map((r) => ({
    date: r.date,
    type: r.type,
    value: r.value,
    justified: r.justified ? 'Sí' : 'No',
    reason: r.reason || '—',
  }))

  doc.autoTable({
    columns: cols,
    body: rows,
    startY: yPos + 112,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: azul, textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 251] },
    margin: { left: margin, right: margin },
    didParseCell: (hookData) => {
      if (hookData.column.dataKey === 'justified' && hookData.section === 'body') {
        hookData.cell.styles.textColor = hookData.cell.raw === 'Sí' ? verde : rojo
        hookData.cell.styles.fontStyle = 'bold'
      }
    },
  })

  const yFinal = doc.lastAutoTable?.finalY ?? (yPos + 112)
  if (textoFirma) { doc.setFontSize(9); doc.setTextColor(40); doc.text(textoFirma, 297, yFinal + 40, { align: 'center' }); doc.line(220, yFinal + 32, 374, yFinal + 32) }
  if (textoPie)   { doc.setFontSize(8); doc.setTextColor(100); doc.text(textoPie, 297, yFinal + 60, { align: 'center', maxWidth: 400 }) }

  doc.save(`Asistencia_${nombreEstudiante.replace(/\s+/g, '_')}_${year}.pdf`)
}

// ─────────────────────────────────────────────
//  Tarjetas de resumen (reestilizadas)
// ─────────────────────────────────────────────
const ResumenAsistencia = ({ data }) => {
  const injust = parseFloat((data.totalInasistencia - data.totalInasistenciaJustif).toFixed(2))

  // Flags normativos provistos por el backend (Fase 3). Si el endpoint todavía no los
  // expone (servidor viejo), caen a false y se desactiva la alerta automáticamente.
  const requiereActa = !!data.requiereActaReincorporacion
  const esLibre      = !!data.caracterLibre
  const enRiesgo     = requiereActa || esLibre

  return (
    <div className="asis-inf-resumen-grid">
      {/* Total */}
      <div className="asis-inf-stat-card">
        <span className="asis-inf-stat-label">Total Inasistencias</span>
        <span className={`asis-inf-stat-value ${enRiesgo ? 'asis-inf-stat-value--riesgo' : 'asis-inf-stat-value--total'}`}>
          {data.totalInasistencia.toFixed(1)}
        </span>
        {esLibre && <span className="asis-inf-badge-riesgo">Carácter Libre</span>}
        {!esLibre && requiereActa && <span className="asis-inf-badge-riesgo">Requiere reincorporación</span>}
      </div>

      {/* Justificadas */}
      <div className="asis-inf-stat-card">
        <span className="asis-inf-stat-label">Justificadas</span>
        <span className="asis-inf-stat-value asis-inf-stat-value--justif">
          {data.totalInasistenciaJustif}
        </span>
      </div>

      {/* Sin justificar */}
      <div className="asis-inf-stat-card">
        <span className="asis-inf-stat-label">Sin Justificar</span>
        <span className="asis-inf-stat-value asis-inf-stat-value--sinjust">
          {injust}
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  Banner de alerta normativa (Fase 3)
// ─────────────────────────────────────────────
const AlertaNormativa = ({ data }) => {
  const requiereActa = !!data.requiereActaReincorporacion
  const esLibre      = !!data.caracterLibre
  if (!requiereActa && !esLibre) return null

  const umbralReinc = data.umbralReincorporacion ?? 20
  const umbralLibre = data.umbralLibre ?? 28
  const injust = (data.totalInasistencia - data.totalInasistenciaJustif).toFixed(2)

  // El caso más grave gana (Libre eclipsa Reincorporación).
  const titulo = esLibre
    ? `El alumno alcanzó ${injust} inasistencias computables — pasa a carácter Libre / Libre Concurrente.`
    : `El alumno alcanzó ${injust} inasistencias computables — corresponde generar el Acta de Reincorporación.`

  const detalle = esLibre
    ? `Umbral configurado: ${umbralLibre} inasistencias para pase a Libre.`
    : `Umbral configurado: ${umbralReinc} inasistencias para reincorporación.`

  return (
    <div className={`asis-inf-alerta asis-inf-alerta--${esLibre ? 'critica' : 'advertencia'}`}>
      <CIcon icon={cilXCircle} className="asis-inf-alerta-icon" />
      <div className="asis-inf-alerta-text">
        <strong>{titulo}</strong>
        <span>{detalle}</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
//  Tabla de detalle (reestilizada)
// ─────────────────────────────────────────────
const TablaDetalle = ({ registros }) => {
  if (!registros || registros.length === 0) {
    return (
      <div className="asis-inf-table-empty">
        No hay registros de inasistencias para este período.
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
                {r.justified ? (
                  <span className="asis-inf-justif-si">
                    <CIcon icon={cilCheckCircle} style={{ width: '0.875rem', height: '0.875rem' }} />
                    Sí
                  </span>
                ) : (
                  <span className="asis-inf-justif-no">
                    <CIcon icon={cilXCircle} style={{ width: '0.875rem', height: '0.875rem' }} />
                    No
                  </span>
                )}
              </td>
              <td className="asis-inf-td asis-inf-td--muted">{r.reason || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─────────────────────────────────────────────
//  Componente principal
// ─────────────────────────────────────────────
export default function InformeAsistencia() {
  const { idEntidad: loggedId, rol } = useAuthUser()
  const esAlumno = rol === 'ALUMNO_APP'

  const { configs: configGlobal } = useConfigSistema()
  const { configs: configFormato } = useFormatoImpresion('informe_asistencia')

  const [inputId, setInputId] = React.useState('')
  const [estudianteId, setEstudianteId] = React.useState(esAlumno ? loggedId : null)
  const [nombreEstudiante, setNombreEstudiante] = React.useState(esAlumno ? 'Alumno' : '')

  // Año: opciones de los últimos 5 años
  const anioActual = new Date().getFullYear()
  const aniosOpciones = Array.from({ length: 5 }, (_, i) => anioActual - i)
  const [year, setYear] = React.useState(anioActual)

  const { data, loading, error } = useInasistencias(estudianteId, year)

  const handleBuscar = () => {
    const id = parseInt(inputId.trim(), 10)
    if (!id) return
    setEstudianteId(id)
    setNombreEstudiante(`Estudiante ID ${id}`)
  }

  return (
    <CContainer fluid className="py-3">
      <CCard className="asis-inf-card">

        {/* ── Encabezado ─────────────────────────────────── */}
        <CCardHeader className="asis-inf-card-header">
          {/* Brand */}
          <div className="asis-inf-header-left">
            <div className="asis-inf-header-brand">
              <div className="asis-inf-header-brand-icon">
                <CIcon icon={cilCalendar} className="asis-inf-brand-icon" />
              </div>
              <div>
                <h2 className="asis-inf-header-h2">Informe de Asistencia</h2>
                <p className="asis-inf-header-sub">Registro de presencia por estudiante</p>
              </div>
            </div>
          </div>

          {/* Botón exportar PDF (visible solo cuando hay datos) */}
          {data && (
            <div className="asis-inf-header-actions">
              <button
                className="asis-inf-btn-pdf"
                onClick={() => generarPDF(data, nombreEstudiante, year, configGlobal, configFormato)}
              >
                <CIcon icon={cilFile} style={{ width: '0.875rem', height: '0.875rem' }} />
                Exportar PDF
              </button>
            </div>
          )}
        </CCardHeader>

        {/* ── Cuerpo ─────────────────────────────────────── */}
        <CCardBody className="asis-inf-card-body">

          {/* Búsqueda por ID (solo admin/docente) */}
          {!esAlumno && (
            <div className="asis-inf-filter-row">
              <div className="asis-inf-filter-field">
                <label className="asis-inf-filter-label">ID Estudiante</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    className="asis-inf-input"
                    placeholder="Ingresá el ID"
                    value={inputId}
                    onChange={(e) => setInputId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
                  />
                  <button className="asis-inf-btn-buscar" onClick={handleBuscar}>
                    <CIcon icon={cilUser} style={{ width: '0.875rem', height: '0.875rem' }} />
                    Buscar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Selector de año (select nativo) */}
          {estudianteId && (
            <div className="asis-inf-filter-row">
              <div className="asis-inf-filter-field">
                <label className="asis-inf-filter-label">Año</label>
                <select
                  className="asis-inf-select"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                >
                  {aniosOpciones.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Estado: cargando */}
          {loading && (
            <div className="asis-inf-loading">
              <CSpinner color="primary" />
              <span className="asis-inf-loading-text">Cargando inasistencias...</span>
            </div>
          )}

          {/* Estado: error */}
          {error && (
            <div className="asis-inf-error">{error}</div>
          )}

          {/* Contenido principal */}
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

          {/* Estado inicial: sin estudiante seleccionado */}
          {!loading && !error && !data && !esAlumno && !estudianteId && (
            <div className="asis-inf-empty">
              Ingresá el ID de un estudiante para ver el informe de asistencia.
            </div>
          )}

          {/* Sin datos para el año seleccionado */}
          {!loading && !error && !data && estudianteId && (
            <div className="asis-inf-empty">
              No hay datos de inasistencias para el año {year}.
            </div>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}
