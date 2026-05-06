// frontend_AcademiA\src\views\estudiantes\InformeAsistencia.jsx
//
// Informe de asistencia por estudiante y año.
// Consume el endpoint GET /api/estudiantes/inasistencias/{id_entidad}/{year}
// No modifica AttendanceSection.jsx ni ningún componente existente.

import React from 'react'
import {
  CContainer, CCard, CCardHeader, CCardBody, CRow, CCol,
  CSpinner, CAlert, CBadge, CButton, CTable, CTableHead,
  CTableRow, CTableHeaderCell, CTableBody, CTableDataCell
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFile, cilUser, cilCheckCircle, cilXCircle } from '@coreui/icons'
import { Dropdown } from 'primereact/dropdown'

import api from '../../api/api.js'
import useAuthUser from '../../hooks/useAuthUser'

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
//  Tarjeta de resumen
// ─────────────────────────────────────────────
const ResumenAsistencia = ({ data }) => {
  const injust = parseFloat((data.totalInasistencia - data.totalInasistenciaJustif).toFixed(2))
  const enRiesgo = data.totalInasistencia >= 15

  return (
    <CRow className="mb-4 g-3">
      <CCol xs={12} sm={4}>
        <div className="p-3 bg-light rounded text-center">
          <div className="small text-muted mb-1">Total Inasistencias</div>
          <div className={`fs-2 fw-bold ${enRiesgo ? 'text-danger' : 'text-success'}`}>
            {data.totalInasistencia.toFixed(1)}
          </div>
          {enRiesgo && (
            <CBadge color="danger" className="mt-1">En riesgo</CBadge>
          )}
        </div>
      </CCol>
      <CCol xs={12} sm={4}>
        <div className="p-3 bg-light rounded text-center">
          <div className="small text-muted mb-1">Justificadas</div>
          <div className="fs-2 fw-bold text-success">{data.totalInasistenciaJustif}</div>
        </div>
      </CCol>
      <CCol xs={12} sm={4}>
        <div className="p-3 bg-light rounded text-center">
          <div className="small text-muted mb-1">Sin Justificar</div>
          <div className="fs-2 fw-bold text-danger">{injust}</div>
        </div>
      </CCol>
    </CRow>
  )
}

// ─────────────────────────────────────────────
//  Tabla de detalle
// ─────────────────────────────────────────────
const TablaDetalle = ({ registros }) => {
  if (!registros || registros.length === 0) {
    return (
      <div className="text-center py-3 text-muted">
        No hay registros de inasistencias para este período.
      </div>
    )
  }

  return (
    <CTable hover responsive bordered className="table-sm align-middle">
      <CTableHead className="table-primary">
        <CTableRow>
          <CTableHeaderCell>Fecha</CTableHeaderCell>
          <CTableHeaderCell>Tipo</CTableHeaderCell>
          <CTableHeaderCell className="text-center">Valor</CTableHeaderCell>
          <CTableHeaderCell className="text-center">Justificada</CTableHeaderCell>
          <CTableHeaderCell>Motivo</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {registros.map((r, i) => (
          <CTableRow key={i}>
            <CTableDataCell className="fw-semibold">{r.date}</CTableDataCell>
            <CTableDataCell>{r.type}</CTableDataCell>
            <CTableDataCell className="text-center">{r.value}</CTableDataCell>
            <CTableDataCell className="text-center">
              {r.justified ? (
                <span className="d-inline-flex align-items-center gap-1 text-success fw-semibold">
                  <CIcon icon={cilCheckCircle} size="sm" /> Sí
                </span>
              ) : (
                <span className="d-inline-flex align-items-center gap-1 text-danger fw-semibold">
                  <CIcon icon={cilXCircle} size="sm" /> No
                </span>
              )}
            </CTableDataCell>
            <CTableDataCell className="text-muted small">
              {r.reason || '—'}
            </CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
    </CTable>
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
  const aniosOpciones = Array.from({ length: 5 }, (_, i) => ({
    label: String(anioActual - i),
    value: anioActual - i,
  }))
  const [year, setYear] = React.useState(anioActual)

  const { data, loading, error } = useInasistencias(estudianteId, year)

  const handleBuscar = () => {
    const id = parseInt(inputId.trim(), 10)
    if (!id) return
    setEstudianteId(id)
    setNombreEstudiante(`Estudiante ID ${id}`)
  }

  return (
    <div style={{ padding: '10px' }}>
      <h1 className="ms-1">Informe de Asistencia</h1>
      <CContainer>
        <CCard>
          <CCardHeader className="py-2 bg-white">
            <CRow className="justify-content-between align-items-center">
              <CCol xs={12} sm="auto">
                <h4 className="mb-0">Registro de Inasistencias</h4>
                <div className="small text-body-secondary">
                  Detalle de asistencias por estudiante y año
                </div>
              </CCol>
              {data && (
                <CCol xs={12} sm="auto">
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => generarPDF(data, nombreEstudiante, year)}
                  >
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

            {/* Selector de Año */}
            {estudianteId && (
              <CRow className="mb-3">
                <CCol xs={12} sm={3}>
                  <label className="form-label fw-semibold small">Año</label>
                  <Dropdown
                    value={year}
                    options={aniosOpciones}
                    onChange={(e) => setYear(e.value)}
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
                <p className="mt-2 text-muted small">Cargando inasistencias...</p>
              </div>
            )}
            {error && <CAlert color="danger">{error}</CAlert>}

            {/* Contenido */}
            {!loading && !error && data && (
              <>
                <ResumenAsistencia data={data} />
                <h6 className="fw-semibold mb-2">
                  Detalle de registros ({data.detailedRecords?.length ?? 0})
                </h6>
                <TablaDetalle registros={data.detailedRecords} />
              </>
            )}

            {/* Estado inicial */}
            {!loading && !error && !data && !esAlumno && !estudianteId && (
              <div className="text-center py-5 text-muted">
                Ingresá el ID de un estudiante para ver el informe de asistencia.
              </div>
            )}
            {!loading && !error && !data && estudianteId && (
              <div className="text-center py-4 text-muted">
                No hay datos de inasistencias para el año {year}.
              </div>
            )}
          </CCardBody>
        </CCard>
      </CContainer>
    </div>
  )
}
