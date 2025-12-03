import React, { useState, useEffect } from 'react';
import {
    CContainer, CRow, CCol, CCard, CCardBody, CCollapse, CSpinner
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import {
    cilSchool, cilCheckCircle, cilWarning, cilChevronBottom, cilCalendar, cilChartLine
} from '@coreui/icons';
import { academicData } from './data'; // Tu archivo de datos
import '../../css/AdvancedFilters.css'
import AttendanceSection from './AttendanceSection'; // <-- Importa el nuevo co


// --- Sub-componente: Tarjeta de Estadísticas (KPI) ---
const StatCard = ({ title, value, icon, color, subtext }) => (
    <CCard className="card-modern h-100 p-2">
        <CCardBody className="d-flex align-items-center justify-content-between">
            <div>
                <p className="text-label mb-1">{title}</p>
                <h3 className={`fw-bold text-${color} mb-0 display-6`}>{value}</h3>
                {subtext && <small className="text-muted" style={{ fontSize: '0.75rem' }}>{subtext}</small>}
            </div>
            <div className={`bg-${color} bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center`} style={{ width: '60px', height: '60px' }}>
                <CIcon icon={icon} size="xl" className={`text-${color}`} />
            </div>
        </CCardBody>
    </CCard>
);

// --- Sub-componente: Fila de Materia ---
const SubjectCard = ({ subject, isOpen, onToggle }) => {
    const isPassing = subject.grade >= 6.0;
    const statusColor = subject.status === 'aprobado' ? 'success' : (subject.status === 'reprobado' ? 'danger' : 'warning');
    const badgeClass = subject.status === 'aprobado' ? 'badge-soft-success' : 'badge-soft-danger';

    // Calculo visual del progreso
    const progressWidth = `${Math.min(subject.grade * 10, 100)}%`;

    return (
        <CCard className="card-modern card-subject mb-3 cursor-pointer" onClick={onToggle}>
            {/* Indicador lateral de color */}
            <div className={`status-indicator status-${statusColor}`}></div>

            <CCardBody className="p-0">
                {/* Cabecera Clickable */}
                <div className="p-4 d-flex flex-wrap align-items-center gap-3">

                    {/* Info Principal */}
                    <div className="flex-grow-1" style={{ minWidth: '200px' }}>
                        <h5 className="fw-bold text-dark mb-1">{subject.name}</h5>
                        <div className="d-flex align-items-center text-muted small">
                            <CIcon icon={cilSchool} size="sm" className="me-1" />
                            {subject.professor}
                        </div>
                    </div>

                    {/* Visualización de Nota (Desktop) */}
                    <div className="d-none d-lg-block flex-grow-1 mx-4" style={{ maxWidth: '300px' }}>
                        <div className="d-flex justify-content-between mb-1">
                            <span className="text-label">Progreso Académico</span>
                            <span className="fw-bold small">{subject.grade} / 10</span>
                        </div>
                        <div className="progress-modern">
                            <div
                                className={`progress-bar-animated status-${statusColor}`}
                                style={{ width: isOpen ? progressWidth : '0%', width: progressWidth }} // Animación al montar
                            ></div>
                        </div>
                    </div>

                    {/* Nota Grande y Chevron */}
                    <div className="d-flex align-items-center gap-4">
                        <div className="text-end">
                            <span className={`fs-3 fw-bolder text-${statusColor}`}>{subject.grade}</span>
                        </div>
                        <span className={`${badgeClass} d-none d-md-inline-block`}>
                            {subject.status}
                        </span>
                        <CIcon
                            icon={cilChevronBottom}
                            className={`text-muted chevron-icon ${isOpen ? 'rotate-180' : ''}`}
                        />
                    </div>
                </div>

                {/* Detalles Desplegables */}
                <CCollapse visible={isOpen}>
                    <div className="bg-light bg-opacity-50 border-top p-4 ps-5">
                        <h6 className="fw-bold mb-3 text-dark">Historial de Evaluaciones</h6>
                        <CRow className="g-3">
                            {subject.details.map((detail, idx) => (
                                <CCol md={6} lg={3} key={idx}>
                                    <div className="bg-white p-3 rounded-3 shadow-sm border border-light h-100">
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <span className="text-xs text-uppercase fw-bold text-muted">{detail.name}</span>
                                            {detail.status !== 'No aplica' && (
                                                <CIcon icon={detail.grade >= 6 ? cilCheckCircle : cilWarning} className={`text-${detail.grade >= 6 ? 'success' : 'danger'}`} size="sm" />
                                            )}
                                        </div>
                                        <div className="mt-2">
                                            <span className="h4 fw-bold text-dark">{detail.grade}</span>
                                            <div className="small text-muted">{detail.status}</div>
                                        </div>
                                    </div>
                                </CCol>
                            ))}
                        </CRow>
                        {!isPassing && (
                            <div className="mt-3 p-3 bg-danger bg-opacity-10 text-danger rounded-3 border border-danger border-opacity-25 d-flex align-items-center">
                                <CIcon icon={cilWarning} className="me-2" />
                                <small className="fw-semibold">Atención: Materia en riesgo. Consulta fechas de recuperatorio.</small>
                            </div>
                        )}
                    </div>
                </CCollapse>
            </CCardBody>
        </CCard>
    );
};

// --- Componente Principal ---
const AcademicDashboard = () => {
    const [year, setYear] = useState('2025');
    const [loading, setLoading] = useState(false); // UX: Estado de carga
    const [openSubject, setOpenSubject] = useState(null);

    const data = academicData[year];

    // Simular carga de datos para mejor sensación UX
    const handleYearChange = (e) => {
        setLoading(true);
        setYear(e.target.value);
        setOpenSubject(null);
        setTimeout(() => setLoading(false), 600);
    };

    return (
        <div className="dashboard-bg p-3 p-lg-5">
            <CContainer size="xl">

                {/* Cabecera */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5">
                    <div>
                        <h1 className="fw-bolder text-dark mb-1">Tu Rendimiento</h1>
                        <p className="text-muted mb-0">Resumen académico y asistencias</p>
                    </div>

                    <div className="mt-3 mt-md-0 d-flex align-items-center bg-white p-2 rounded-4 shadow-sm">
                        <label className="fw-bold text-muted small me-2 px-2">Año:</label>
                        <select
                            value={year}
                            onChange={handleYearChange}
                            className="form-select border-0 bg-light fw-bold text-primary py-2 ps-3 pe-5 rounded-pill"
                            style={{ cursor: 'pointer', outline: 'none', boxShadow: 'none' }}
                        >
                            <option value="2025">2025 (Actual)</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-5 fade-in">
                        <CSpinner color="primary" variant="grow" />
                        <p className="text-muted mt-3 animate-pulse">Sincronizando registros...</p>
                    </div>
                ) : data ? (
                    <div className="fade-in-up">
                        {/* KPIs / Métricas */}
                        <CRow className="g-4 mb-5">
                            <CCol sm={6} lg={3}>
                                <StatCard
                                    title="Promedio General"
                                    value={data.summary.average}
                                    icon={cilChartLine}
                                    color="primary"
                                    subtext="Escala de 1 a 10"
                                />
                            </CCol>
                            <CCol sm={6} lg={3}>
                                <StatCard
                                    title="Materias Aprobadas"
                                    value={data.summary.approved}
                                    icon={cilCheckCircle}
                                    color="success"
                                />
                            </CCol>
                            <CCol sm={6} lg={3}>
                                <StatCard
                                    title="Asistencia Global"
                                    value={data.summary.attendance}
                                    icon={cilCalendar}
                                    color="info"
                                />
                            </CCol>
                            <CCol sm={6} lg={3}>
                                <StatCard
                                    title="Requieren Atención"
                                    value={data.summary.failed}
                                    icon={cilWarning}
                                    color="danger"
                                />
                            </CCol>
                        </CRow>

                        {/* Listado de Materias */}
                        <div className="mb-4 d-flex align-items-center justify-content-between">
                            <h4 className="fw-bold text-dark m-0">Materias & Calificaciones</h4>
                            <span className="badge bg-white text-dark border shadow-sm rounded-pill">
                                {data.subjects.length} Cursadas
                            </span>
                        </div>

                        <div>
                            {data.subjects.map((sub) => (
                                <SubjectCard
                                    key={sub.id}
                                    subject={sub}
                                    isOpen={openSubject === sub.id}
                                    onToggle={() => setOpenSubject(openSubject === sub.id ? null : sub.id)}
                                />
                            ))}
                        </div>

                        {/* Sección de Asistencia (Extendida del mockup original) */}


                        <div className="mt-5">
                            <h4 className="fw-bold text-dark m-0 mb-3">Registro de Asistencias</h4>
                            <AttendanceSection
                                attendanceData={data.attendance}
                                year={year}
                            />
                        </div>

                    </div>
                ) : (
                    <div className="text-center py-5">
                        <div className="bg-white p-5 rounded-circle shadow-sm d-inline-block mb-3">
                            <CIcon icon={cilSchool} size="4xl" className="text-muted" />
                        </div>
                        <h3 className="text-dark fw-bold">Sin registros para {year}</h3>
                        <p className="text-muted">No se encontraron inscripciones activas en este periodo.</p>
                    </div>
                )}
            </CContainer>
        </div>
    );
};

export default AcademicDashboard;