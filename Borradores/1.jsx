import React, { useState } from 'react';
import { CContainer, CRow, CCol, CSpinner } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSchool, cilCheckCircle, cilWarning, cilCalendar, cilChartLine } from '@coreui/icons';

// Hooks Modulares
import useAuthUser from '../../hooks/useAuthUser'; // <-- NUEVO Hook de Usuario
import useAcademicData from '../../hooks/useAcademicData'; // <-- NUEVO Hook de Datos (Fetch API)

// Componentes modulares
import AttendanceSection from './AttendanceSection'; 
import SubjectCard from '../../components/subjectCard/SubjectCard';
import StatCard from '../../components/statCard/statCard';

// Componente Principal
const AcademicDashboard = () => {
    // 1. OBTENCIÓN DE DATOS DEL USUARIO (Usando el Hook)
    const { idEntidad: loggedEntityId, isAdmin } = useAuthUser(); // <-- Simplificado

    // 2. ESTADOS LOCALES DE LA INTERFAZ
    const [year, setYear] = useState('2025');
    const [openSubject, setOpenSubject] = useState(null);

    // Estados para Docentes/Admins:
    const [inputEntityId, setInputEntityId] = useState('');
    // El ID inicial del estudiante a buscar es el del propio usuario logueado (si es alumno)
    const [currentEntityId, setCurrentEntityId] = useState(loggedEntityId || '');


    // 3. OBTENCIÓN DE DATOS ACADÉMICOS (Usando el Hook)
    const { academicData, loading, error } = useAcademicData(currentEntityId, year);

    // 4. HANDLERS DE INTERFAZ
    const handleStudentIdChange = (e) => {
        setInputEntityId(e.target.value);
    };

    const handleSearchClick = () => {
        // Actualiza el ID que dispara el useAcademicData (vía useEffect interno)
        setCurrentEntityId(inputEntityId);
        setOpenSubject(null);
    };

    const handleYearChange = (e) => {
        setYear(e.target.value);
        setOpenSubject(null);
    };
    
    // 5. LÓGICA DE RENDERIZADO
    const data = academicData;

    // Lógica para alternar la apertura/cierre de la tarjeta de materia
    const toggleSubject = (id) => setOpenSubject(openSubject === id ? null : id);


    return (
        <div className="dashboard-bg p-3 p-lg-5">
            <CContainer size="xl">
                {/* Cabecera */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5">
                    <div>
                        <h1 className="fw-bolder text-dark mb-1">Historial académico</h1>
                        <p className="text-muted mb-0">Visualización de calificaciones, asistencias y evaluaciones</p>
                    </div>

                    {/* Controles de Búsqueda y Filtro */}
                    <div className="mt-3 mt-md-0 d-flex flex-column align-items-end">

                        {/* Bloque de Búsqueda de Alumno (Solo para Admin/Docente) */}
                        {isAdmin && (
                            <div className="d-flex align-items-center bg-white p-1 rounded-4 shadow-sm mb-2">
                                {/* ... (Input y botón de búsqueda, sin cambios) ... */}
                                <label className="fw-bold text-muted small me-2 px-2">ID Alumno:</label>
                                <input
                                    type="text"
                                    value={inputEntityId}
                                    onChange={handleStudentIdChange}
                                    placeholder="ID Entidad"
                                    className="form-select border-0 bg-light fw-bold text-primary py-2 ps-3 pe-3 rounded-pill me-2"
                                    style={{ cursor: 'text', outline: 'none', boxShadow: 'none', minWidth: '130px' }}
                                />
                                <button
                                    onClick={handleSearchClick}
                                    className="btn btn-primary d-flex align-items-center justify-content-center rounded-pill px-3 py-2 shadow-sm"
                                    title="Buscar"
                                >
                                    Buscar
                                </button>
                            </div>
                        )}

                        {/* Bloque del Año */}
                        <div className="d-flex align-items-center bg-white p-2 rounded-4 shadow-sm">
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
                </div>

                {/* Contenido Condicional: Carga, Error o Datos */}
                {loading && (
                    <div className="text-center py-5 fade-in">
                        <CSpinner color="primary" variant="grow" />
                        <p className="text-muted mt-3 animate-pulse">Sincronizando registros...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="text-center py-5">
                        <h3 className="text-danger fw-bold">⚠️ Error de Carga</h3>
                        <p className="text-muted">{error}</p>
                    </div>
                )}
                
                {!loading && data ? (
                    // Bloque de contenido con datos cargados
                    <div className="fade-in-up">

                        {/* KPIs / Métricas - Uso de statCards */}
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
                            {data.subjects.length > 0 ? (
                                data.subjects.map((sub) => (
                                    <SubjectCard
                                        key={sub.id}
                                        subject={sub}
                                        isOpen={openSubject === sub.id}
                                        onToggle={() => toggleSubject(sub.id)} // Uso de la función simplificada
                                    />
                                ))
                            ) : (
                                <p className="text-muted fst-italic p-3 bg-white border rounded">No hay materias registradas para {year}.</p>
                            )}
                        </div>

                        {/* Sección de Asistencia */}
                        <div className="mt-5">
                            <h4 className="fw-bold text-dark m-0 mb-3">Registro de Asistencias</h4>
                            <AttendanceSection
                                attendanceData={data.attendance}
                                year={year}
                            />
                        </div>

                    </div>
                ) : (!loading && !error && (
                    // Bloque de "Sin Datos" si no está cargando y no hay error
                    <div className="text-center py-5">
                        <div className="bg-white p-5 rounded-circle shadow-sm d-inline-block mb-3">
                            <CIcon icon={cilSchool} size="4xl" className="text-muted" />
                        </div>
                        <h3 className="text-dark fw-bold">Sin registros para {year}</h3>
                        <p className="text-muted">No se encontraron inscripciones activas en este periodo.</p>
                    </div>
                ))}
            </CContainer>
        </div>
    );
};

export default AcademicDashboard;