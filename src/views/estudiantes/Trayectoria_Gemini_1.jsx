import React, { useState } from 'react';
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CFormSelect,
  CProgress,
  CProgressBar,
  CCollapse,
  CBadge,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilChartPie, cilCheckCircle, cilWarning, cilXCircle, cilChevronBottom } from '@coreui/icons';
import { academicData } from './data'; // Importamos los datos del paso 1
import '../../css/AdvancedFilters.css'

const AcademicDashboard = () => {
  const [selectedYear, setSelectedYear] = useState('2025');
  const [activeKey, setActiveKey] = useState(null); // Para controlar qué materia se expande (Accordion)

  const currentData = academicData[selectedYear];

  // Función para alternar la expansión de detalles
  const toggleDetails = (key) => {
    setActiveKey(activeKey === key ? null : key);
  };

  // Ayudante para colores según estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'aprobado': return 'success';
      case 'reprobado': return 'danger';
      case 'pendiente': return 'warning';
      default: return 'primary';
    }
  };

  return (
    <div className="bg-light min-vh-100 p-4">
      <CContainer size="xl">
        
        {/* CABECERA Y FILTRO */}
        <div className="mb-5">
          <h1 className="display-5 fw-bold text-dark">Historial Académico</h1>
          <p className="text-medium-emphasis mb-4">Visualización de calificaciones, asistencias y detalles de evaluación.</p>

          <CCard className="border-top-primary border-top-3 shadow-sm">
            <CCardBody className="d-flex align-items-center gap-3">
              <label htmlFor="yearSelect" className="fw-semibold text-nowrap">Año Académico:</label>
              <CFormSelect 
                id="yearSelect" 
                value={selectedYear} 
                onChange={(e) => { setSelectedYear(e.target.value); setActiveKey(null); }}
                style={{ maxWidth: '200px' }}
              >
                <option value="2025">2025 (Actual)</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </CFormSelect>
            </CCardBody>
          </CCard>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        {currentData ? (
          <>
            {/* TARJETAS DE RESUMEN (KPIs) */}
            <CRow className="g-4 mb-5">
              <CCol sm={6} lg={3}>
                <CCard className="shadow-sm h-100 border-0">
                  <CCardBody className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-medium-emphasis small">Promedio {selectedYear}</div>
                      <div className="fs-2 fw-bold text-primary">{currentData.summary.average}</div>
                    </div>
                    <CIcon icon={cilChartPie} size="3xl" className="text-primary opacity-25" />
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol sm={6} lg={3}>
                <CCard className="shadow-sm h-100 border-0">
                  <CCardBody className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-medium-emphasis small">Aprobadas</div>
                      <div className="fs-2 fw-bold text-success">{currentData.summary.approved}</div>
                    </div>
                    <CIcon icon={cilCheckCircle} size="3xl" className="text-success opacity-25" />
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol sm={6} lg={3}>
                <CCard className="shadow-sm h-100 border-0">
                  <CCardBody className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-medium-emphasis small">Asistencia</div>
                      <div className="fs-2 fw-bold text-info">{currentData.summary.attendance}</div>
                    </div>
                    <CIcon icon={cilCheckCircle} size="3xl" className="text-info opacity-25" />
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol sm={6} lg={3}>
                <CCard className="shadow-sm h-100 border-0">
                  <CCardBody className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="text-medium-emphasis small">Atención</div>
                      <div className="fs-2 fw-bold text-danger">{currentData.summary.failed}</div>
                    </div>
                    <CIcon icon={cilWarning} size="3xl" className="text-danger opacity-25" />
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>

            {/* LISTA DE MATERIAS */}
            <h2 className="h4 fw-bold text-dark mb-4">Materias Cursadas</h2>
            <div className="d-flex flex-column gap-3">
              {currentData.subjects.map((subject) => (
                <CCard 
                  key={subject.id} 
                  className={`border-0 shadow-sm status-card border-start-${getStatusColor(subject.status)}`}
                >
                  {/* Cabecera de la Materia (Clickable) */}
                  <div 
                    onClick={() => toggleDetails(subject.id)} 
                    className="p-4 d-flex flex-wrap align-items-center justify-content-between hover-bg-light rounded"
                  >
                    {/* Info Materia */}
                    <div className="me-3 mb-2 mb-md-0" style={{ minWidth: '200px' }}>
                      <h5 className="fw-bold mb-0 text-dark">{subject.name}</h5>
                      <small className="text-medium-emphasis">{subject.professor}</small>
                    </div>

                    {/* Barra de Progreso (Oculta en móviles muy pequeños) */}
                    <div className="d-none d-lg-block flex-grow-1 mx-5">
                      <div className="d-flex justify-content-between small mb-1">
                        <span className="fw-semibold">Promedio Final ({subject.grade} / 10.0)</span>
                      </div>
                      <CProgress height={8} className="mb-1">
                        <CProgressBar 
                          color={getStatusColor(subject.status)} 
                          value={subject.grade * 10} 
                        />
                      </CProgress>
                      <small className="text-muted">Mínimo requerido: 6.0</small>
                    </div>

                    {/* Nota y Estado */}
                    <div className="d-flex align-items-center gap-3">
                      <span className={`display-6 fw-bold text-${getStatusColor(subject.status)}`}>
                        {subject.grade}
                      </span>
                      <CBadge color={getStatusColor(subject.status)} shape="rounded-pill" className="d-none d-sm-inline-block">
                        {subject.status.toUpperCase()}
                      </CBadge>
                      <CIcon 
                        icon={cilChevronBottom} 
                        size="lg" 
                        className={`text-medium-emphasis transition-transform ${activeKey === subject.id ? 'rotate-180' : ''}`}
                        style={{ transition: 'transform 0.3s' }}
                      />
                    </div>
                  </div>

                  {/* Detalles Desplegables */}
                  <CCollapse visible={activeKey === subject.id}>
                    <div className="bg-light p-4 border-top">
                      <h6 className="fw-bold text-dark mb-3">Detalle de Calificaciones por Período</h6>
                      <CRow>
                        {subject.details.map((detail, index) => (
                          <CCol md={6} lg={3} key={index} className="mb-3">
                            <CCard className={`h-100 border-${getStatusColor(detail.status.toLowerCase())} border-top-0 border-end-0 border-bottom-0 border-start-3`}>
                              <CCardBody className="p-3">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <small className="text-medium-emphasis fw-bold">{detail.name}</small>
                                </div>
                                <div className="d-flex align-items-end gap-2">
                                  <span className={`fs-4 fw-bold text-${detail.grade >= 6 ? 'success' : 'danger'}`}>
                                    {detail.grade}
                                  </span>
                                  <small className={`text-${detail.status === 'APROBADO' ? 'success' : 'muted'} fw-semibold mb-1`}>
                                    {detail.status}
                                  </small>
                                </div>
                              </CCardBody>
                            </CCard>
                          </CCol>
                        ))}
                      </CRow>
                      
                      {subject.grade < 6.0 && (
                        <div className="mt-2 text-danger small fw-bold">
                          Nota: El promedio final no alcanza el mínimo aprobatorio. Revisa las fechas de recuperatorio.
                        </div>
                      )}
                    </div>
                  </CCollapse>
                </CCard>
              ))}
            </div>
          </>
        ) : (
          /* Estado Vacío (Empty State) */
          <div className="text-center py-5">
             <CIcon icon={cilXCircle} size="4xl" className="text-medium-emphasis mb-3" />
             <h4 className="text-medium-emphasis">No hay datos disponibles para el año {selectedYear}.</h4>
          </div>
        )}

      </CContainer>
    </div>
  );
};

export default AcademicDashboard;