import React, { useState } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CProgress,
  CCollapse,
  CBadge,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect,
  CButton
} from '@coreui/react';
import { cilChevronBottom, cilCheckCircle, cilXCircle, cilWarning } from '@coreui/icons';
import CIcon from '@coreui/icons-react';

const AcademicDashboard = () => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [openSubject, setOpenSubject] = useState(null);
  const [openAttendance, setOpenAttendance] = useState(false);

  // Estado para los detalles internos de cada período
  const [openPeriodDetails, setOpenPeriodDetails] = useState({});

  const toggleSubject = (id) => {
    setOpenSubject(openSubject === id ? null : id);
  };

  const togglePeriod = (subjectId, periodKey) => {
    setOpenPeriodDetails(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [periodKey]: !prev[subjectId]?.[periodKey]
      }
    }));
  };

  const years = [
    { value: '2025', label: '2025 (Actual)' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' }
  ];

  const subjects = {
    '2025': [
      {
        id: 'calc-dif',
        name: 'Cálculo Diferencial',
        teacher: 'Dra. Elena Castro',
        finalGrade: 9.5,
        status: 'aprobado',
        periods: [
          { name: 'Primer Cuatrimestre', grade: 9.0, status: 'aprobado', details: [
            { label: 'Examen Parcial 1 (50%)', grade: 9.2 },
            { label: 'Trabajo Práctico 1 (50%)', grade: 8.8 }
          ]},
          { name: 'Segundo Cuatrimestre', grade: 10.0, status: 'aprobado', details: [
            { label: 'Examen Final (70%)', grade: 10.0 },
            { label: 'Trabajo Práctico 2 (30%)', grade: 10.0 }
          ]},
          { name: 'Recuperatorio Diciembre', grade: 'N/A', status: 'na' },
          { name: 'Recuperatorio Marzo', grade: 'N/A', status: 'na' }
        ]
      },
      {
        id: 'prog-avanzada',
        name: 'Programación Avanzada',
        teacher: 'Ing. Ricardo Gómez',
        finalGrade: 5.8,
        status: 'reprobado',
        periods: [
          { name: 'Primer Cuatrimestre', grade: 5.5, status: 'reprobado', details: [
            { label: 'Examen Parcial 1 (70%)', grade: 4.0 },
            { label: 'Trabajo Práctico A (30%)', grade: 8.5 }
          ]},
          { name: 'Segundo Cuatrimestre', grade: 6.0, status: 'aprobado', details: [
            { label: 'Examen Parcial 2 (50%)', grade: 6.0 },
            { label: 'Trabajo Práctico B (50%)', grade: 6.0 }
          ]},
          { name: 'Recuperatorio Dic.', grade: 5.8, status: 'pendiente', details: [
            { label: 'Examen Global Único', grade: 5.8 }
          ]},
          { name: 'Recuperatorio Mar.', grade: '--', status: 'proximo', details: [
            { label: 'Estado', text: 'Requiere inscripción. Fecha límite: 15 de Febrero.' }
          ]}
        ]
      }
    ],
    '2024': [
      {
        id: 'etica-2024',
        name: 'Ética Profesional',
        teacher: 'Mgtr. Ana Mendieta',
        finalGrade: 7.5,
        status: 'aprobado',
        periods: [
          { name: 'Primer Cuatrimestre', grade: 6.5, status: 'aprobado', details: [
            { label: 'Examen 1 (60%)', grade: 6.0 },
            { label: 'Trabajo Final (40%)', grade: 7.2 }
          ]},
          { name: 'Segundo Cuatrimestre', grade: 8.5, status: 'aprobado', details: [
            { label: 'Examen Final (100%)', grade: 8.5 }
          ]},
          { name: 'Recuperatorio Dic.', grade: 'N/A', status: 'na' },
          { name: 'Recuperatorio Mar.', grade: 'N/A', status: 'na' }
        ]
      }
    ]
  };

  const attendanceData = [
    { date: '15/03/2025', type: 'Completa (1.0)', justified: true, reason: 'Exámenes médicos de rutina.' },
    { date: '01/04/2025', type: 'Media (0.5)', justified: false, reason: 'Llegada tarde por tráfico.' },
    { date: '10/05/2025', type: 'Cuarta (0.25)', justified: true, reason: 'Permiso de salida anticipada.' },
    { date: '03/06/2025', type: 'Completa (1.0)', justified: true, reason: 'Licencia por enfermedad (Parte 1).' },
    { date: '04/06/2025', type: 'Completa (1.0)', justified: true, reason: 'Licencia por enfermedad (Parte 2).' },
    { date: '05/06/2025', type: 'Completa (1.0)', justified: true, reason: 'Licencia por enfermedad (Parte 3).' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'aprobado': return 'success';
      case 'reprobado': return 'danger';
      case 'pendiente': return 'warning';
      case 'proximo': return 'primary';
      default: return 'secondary';
    }
  };

  const getGradeColor = (grade) => {
    if (grade === 'N/A' || grade === '--') return 'secondary';
    if (grade >= 6.0) return 'success';
    return 'danger';
  };

  return (
    <div className="p-4" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <header className="mb-5">
        <h1 className="display-5 fw-bold">Historial Académico</h1>
        <p className="text-muted">Visualización de calificaciones, asistencias y detalles de evaluación.</p>

        <CCard className="mt-4 border-primary border-top border-4 border-bottom-0 border-start-0 border-end-0">
          <CCardBody className="py-4">
            <CRow className="align-items-center">
              <CCol xs="auto">
                <strong>Año Académico:</strong>
              </CCol>
              <CCol xs="12" sm="auto">
                <CFormSelect
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  style={{ minWidth: '200px' }}
                >
                  {years.map(y => (
                    <option key={y.value} value={y.value}>{y.label}</option>
                  ))}
                </CFormSelect>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </header>

      {/* Summary Cards */}
      <CRow className="mb-5">
        <CCol sm="6" lg="3">
          <CCard className="text-center shadow-sm">
            <CCardBody>
              <p className="text-muted small">Promedio {selectedYear}</p>
              <h2 className="text-primary fw-bold">8.9</h2>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm="6" lg="3">
          <CCard className="text-center shadow-sm">
            <CCardBody>
              <p className="text-muted small">Aprobadas</p>
              <h2 className="text-success fw-bold">6</h2>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm="6" lg="3">
          <CCard className="text-center shadow-sm">
            <CCardBody>
              <p className="text-muted small">Asistencia General {selectedYear}</p>
              <h2 className="text-info fw-bold">90%</h2>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm="6" lg="3">
          <CCard className="text-center shadow-sm">
            <CCardBody>
              <p className="text-muted small">Atención</p>
              <h2 className="text-danger fw-bold">1</h2>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Subjects */}
      <section className="mb-5">
        <h2 className="h4 fw-semibold mb-4">Materias Cursadas</h2>

        {subjects[selectedYear] ? subjects[selectedYear].map(subject => (
          <CCard key={subject.id} className={`mb-3 border-start border-4 border-${getStatusColor(subject.status)}`}>
            <CCardHeader
              className="cursor-pointer bg-light-hover"
              onClick={() => toggleSubject(subject.id)}
            >
              <CRow className="align-items-center">
                <CCol>
                  <h5 className="mb-0">{subject.name}</h5>
                  <small className="text-muted">{subject.teacher}</small>
                </CCol>
                <CCol xs="auto" className="d-none d-lg-block">
                  <div style={{ width: '200px' }}>
                    <small>Promedio Final ({subject.finalGrade} / 10.0)</small>
                    <CProgress height={8} value={subject.finalGrade * 10} color={getStatusColor(subject.status)} className="mt-1" />
                    <small className="text-muted">Mínimo requerido: 6.0</small>
                  </div>
                </CCol>
                <CCol xs="auto">
                  <h3 className={`mb-0 text-${getStatusColor(subject.status)}`}>{subject.finalGrade}</h3>
                  <CBadge color={getStatusColor(subject.status)} className="d-none d-sm-inline-block">
                    {subject.status.toUpperCase()}
                  </CBadge>
                  <CIcon
                    icon={cilChevronBottom}
                    className={`ms-3 transition-transform ${openSubject === subject.id ? 'rotate-180' : ''}`}
                  />
                </CCol>
              </CRow>
            </CCardHeader>

            <CCollapse show={openSubject === subject.id}>
              <CCardBody className="bg-light">
                <h6 className="fw-bold">Detalle de Calificaciones por Período</h6>
                <CRow xs={{ cols: 2 }} lg={{ cols: 4 }} className="g-3 mt-3">
                  {subject.periods.map((period, idx) => (
                    <CCol key={idx}>
                      <CCard className={`h-100 border-${period.status === 'aprobado' ? 'success' : period.status === 'reprobado' ? 'danger' : 'warning'} border-start border-4`}>
                        <CCardBody className="p-3">
                          <div className="d-flex justify-content-between align-items-start cursor-pointer" onClick={() => togglePeriod(subject.id, idx)}>
                            <div>
                              <small className="text-muted">{period.name}</small>
                              <h4 className={`mb-0 text-${getGradeColor(period.grade)}`}>{period.grade}</h4>
                              {period.status !== 'na' && (
                                <small className={`text-${getStatusColor(period.status)}`}>{period.status.toUpperCase()}</small>
                              )}
                            </div>
                            {(period.details && period.details.length > 0) && (
                              <CIcon icon={cilChevronBottom} className={`small transition-transform ${openPeriodDetails[subject.id]?.[idx] ? 'rotate-180' : ''}`} />
                            )}
                          </div>

                          {period.details && period.details.length > 0 && (
                            <CCollapse show={openPeriodDetails[subject.id]?.[idx]}>
                              <div className="mt-3 pt-3 border-top small">
                                {period.details.map((det, i) => (
                                  <div key={i} className="d-flex justify-content-between text-muted">
                                    <span>{det.label || det.text}</span>
                                    <strong>{det.grade || ''}</strong>
                                  </div>
                                ))}
                              </div>
                            </CCollapse>
                          )}
                        </CCardBody>
                      </CCard>
                    </CCol>
                  ))}
                </CRow>

                {subject.id === 'prog-avanzada' && (
                  <p className="mt-3 text-danger small fw-bold">
                    Nota: El promedio final es 5.8, requiere aprobar el recuperatorio de Marzo para alcanzar el mínimo de 6.0.
                  </p>
                )}
              </CCardBody>
            </CCollapse>
          </CCard>
        )) : (
          <CCard className="text-center p-5">
            <p className="text-muted">No hay datos de calificaciones disponibles para el año {selectedYear}.</p>
          </CCard>
        )}
      </section>

      {/* Attendance */}
      <section>
        <h2 className="h4 fw-semibold mb-4">Registro de Asistencias</h2>

        {selectedYear === '2025' ? (
          <CCard className="border-start border-primary border-4">
            <CCardHeader className="cursor-pointer bg-light-hover" onClick={() => setOpenAttendance(!openAttendance)}>
              <CRow className="align-items-center">
                <CCol>
                  <h5 className="mb-0">Total de Inasistencias (Año {selectedYear})</h5>
                  <small className="text-muted">El detalle se mide en días completos o fracciones.</small>
                </CCol>
                <CCol xs="auto">
                  <div className="text-end me-4">
                    <small className="text-muted">Días Perdidos</small>
                    <h3 className="text-danger mb-0">10.5</h3>
                  </div>
                  <div className="text-end me-4 d-none d-sm-block">
                    <small className="text-muted">Justificadas</small>
                    <h3 className="text-success mb-0">6.0</h3>
                  </div>
                  <CIcon icon={cilChevronBottom} className={openAttendance ? 'rotate-180' : ''} />
                </CCol>
              </CRow>
            </CCardHeader>

            <CCollapse show={openAttendance}>
              <CCardBody className="bg-light">
                <h6 className="fw-bold mb-3">Detalle de Inasistencias por Fecha</h6>
                <CTable hover responsive>
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell>Fecha</CTableHeaderCell>
                      <CTableHeaderCell>Tipo de Ausencia</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Justificación</CTableHeaderCell>
                      <CTableHeaderCell className="d-none d-sm-table-cell">Motivo / Detalle</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {attendanceData.map((row, i) => (
                      <CTableRow key={i}>
                        <CTableDataCell className="fw-medium">{row.date}</CTableDataCell>
                        <CTableDataCell>
                          <span className={`fw-semibold text-${row.type.includes('Completa') ? 'danger' : row.type.includes('Media') ? 'warning' : 'info'}`}>
                            {row.type}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge color={row.justified ? 'success' : 'danger'}>
                            {row.justified ? <CIcon icon={cilCheckCircle} size="sm" /> : <CIcon icon={cilXCircle} size="sm" />} {' '}
                            {row.justified ? 'Sí' : 'No'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="d-none d-sm-table-cell text-muted">{row.reason}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
                <p className="text-muted small mt-3">
                  Nota: El total de inasistencias acumuladas es de 10.5 días completos.
                </p>
              </CCardBody>
            </CCollapse>
          </CCard>
        ) : (
          <CCard className="text-center p-5 text-muted">
            No hay registro detallado de inasistencias disponible para el año {selectedYear}.
          </CCard>
        )}
      </section>
    </div>
  );
};

export default AcademicDashboard;