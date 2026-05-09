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
//  Generación de PDF (lógica intacta)
// ─────────────────────────────────────────────
const generarPDF = async (data, nombreEstudiante, year) => {
  const jsPDF = (await import('jspdf')).default
  await import('jspdf-autotable')

  const doc = new jsPDF('p', 'pt', 'a4')
  const margin = 40
  const azul = [50, 31, 219]
  const verde = [40, 167, 69]
  const rojo = [220, 53, 69]

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
  doc.text('INFORME DE ASISTENCIA', margin, 100)

  doc.setFontSize(11)
  doc.setTextColor(40)
  doc.text(`Alumno: ${nombreEstudiante}`, margin, 120)
  doc.text(`Año: ${year}`, margin, 135)

  // Resumen
  const injust = (data.totalInasistencia - data.totalInasistenciaJustif).toFixed(2)
  doc.setFontSize(10)
  doc.text(`Total inasistencias: ${data.totalInasistencia}`, margin, 160)
  doc.text(`Justificadas: ${data.totalInasistenciaJustif}`, margin + 160, 160)
  doc.text(`Sin justificar: ${injust}`, margin + 310, 160)

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
    startY: 175,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: azul, textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 251] },
    margin: { left: margin, right: margin },
    didParseCell: (hookData) => {
      if (hookData.column.dataKey === 'justified' && hookData.section === 'body') {
        hookData.cell.styles.textColor =
          hookData.cell.raw === 'Sí' ? verde : rojo
        hookData.cell.styles.fontStyle = 'bold'
      }
    },
  })

  doc.save(`Asistencia_${nombreEstudiante.replace(/\s+/g, '_')}_${year}.pdf`)
}

// ─────────────────────────────────────────────
//  Tarjetas de resumen (reestilizadas)
// ─────────────────────────────────────────────
const ResumenAsistencia = ({ data }) => {
  const injust = parseFloat((data.totalInasistencia - data.totalInasistenciaJustif).toFixed(2))
  const enRiesgo = data.totalInasistencia >= 15

  return (
    <div className="asis-inf-resumen-grid">
      {/* Total */}
      <div className="asis-inf-stat-card">
        <span className="asis-inf-stat-label">Total Inasistencias</span>
        <span className={`asis-inf-stat-value ${enRiesgo ? 'asis-inf-stat-value--riesgo' : 'asis-inf-stat-value--total'}`}>
          {data.totalInasistencia.toFixed(1)}
        </span>
        {enRiesgo && <span className="asis-inf-badge-riesgo">En riesgo</span>}
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
                onClick={() => generarPDF(data, nombreEstudiante, year)}
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
