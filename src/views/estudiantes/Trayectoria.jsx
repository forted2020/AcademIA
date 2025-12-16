//  AcademIA\src\views\estudiantes\Trayectoria.jsx

import React, { useState, useMemo  } from 'react';
import { CContainer, CRow, CCol, CCard, CCardBody, CCollapse, CSpinner, CAlert } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSchool, cilCheckCircle, cilWarning, cilChevronBottom, cilCalendar, cilChartLine, cilSearch } from '@coreui/icons';
//  import { academicData } from './data'; // Archivo de datos. 
import '../../css/AdvancedFilters.css'

// Componentes modulares
import AttendanceSection from './AttendanceSection'; // <-- Cmponente de asistencias
import SubjectCard from '../../components/subjectCard/SubjectCard'; // Componente de Fila materias
import StatCard from '../../components/statCard/StatCard'; // Componente de Tarjeta Estadística

import { getMateriasPorEstudiante } from '../../api/apiEstudiantes';  // 
//import { CSpinner, CAlert } from '@coreui/react';

// Hooks Modulares
import useAuthUser from '../../hooks/useAuthUser'; // <-- Hook de Usuario
import useAcademicData from '../../hooks/useAcademicData'; // <-- Hook de Datos de API

//  Roles desde archivo
import { ROL_ADMIN, ROL_ALUMNO, ROL_DOCENTE } from '../../constants/Roles';

// Roles definidos para la lógica de visualización
const ADMIN_ROLES = ['ADMIN_SISTEMA', 'DOCENTE_APP'];
//  const STUDENT_ROLE = 'ALUMNO_APP'; // <-- Ya está implícito, pero lo definimos.


// --- Componente Principal ---
const AcademicDashboard = () => {

    // Obtención de datos del usuario autenticado desde localStorage, usando el Hook useAuthUser().
    const { idEntidad: loggedEntityId, isAdmin, rol } = useAuthUser();

    // Líneas de depuración en consola
    console.log('=== Datos del usuario autenticado (useAuthUser) ===');
    console.log('Objeto completo devuelto por useAuthUser:', useAuthUser());


    // ESTADOS LOCALES DE LA INTERFAZ
    const [year, setYear] = useState('2025');
    const [openSubject, setOpenSubject] = useState(null);
    // Estados para búsqueda (solo admins/docentes)
    const [inputEntityId, setInputEntityId] = useState('');

    // Determinar el Rol del usuario 
    const esAlumno = useMemo(() => rol === ROL_ALUMNO, [rol]);  //  Usa el hook usememo, para memorizar el valor
    const esDocenteOAdmin = useMemo(() => rol === ROL_ADMIN || rol === ROL_DOCENTE, [rol]);

    // ID de Entidad usado para cargar datos 
    // - Alumno: usa su propio ID automáticamente
    // - Docente/Admin: empieza vacío (null), hasta que busque
    const [currentEntityId, setCurrentEntityId] = useState(esAlumno ? loggedEntityId : null);

    // Usamos el hook useAcademicData para obtener los datos de la base
    //   * currentEntityId: ID del estudiante a buscar
    //   * year: Año de datos a buscar
    //   * academicData: guarda los datos del estudiante (asistencia, promedios, materias, etc)
    //   * loading: booleano para indicar si se están cargando los datos
    //   * error: mensaje de error si API falla o null si está todo OK.
    //    *refectch: llama la función de forma manual, cuando por ejemplo, se presiona el botón "Buscar"
    const { academicData, loading, error, refetch } = useAcademicData(currentEntityId, year);

    //  -----   HANDLERS DE INTERFAZ    -----
    // Handler para el input text (solo para docentes/admins)
    const handleStudentIdChange = (e) => setInputEntityId(e.target.value);

    // Handler para el botón de búsqueda (solo para docentes/admins)
    const handleSearchClick = () => {
        const id = inputEntityId.trim();
        if (id) {
            setCurrentEntityId(id);
            refetch();
        }
    };

    // Handler para el cambio de año (usa currentEntityId)
    const handleYearChange = (e) => {
        setYear(e.target.value);
        setOpenSubject(null);   // El useEffect se encargará de disparar la API.
    };

    // Lógica para alternar la apertura/cierre de la tarjeta de materia
    const toggleSubject = (id) => setOpenSubject(openSubject === id ? null : id);

    // Lógica para mostrar mensaje de "esperando búsqueda"
    // Solo para docentes y admins, cuando aún no buscaron
    const isAwaitingSearch = esDocenteOAdmin && !loading && !error && !academicData && currentEntityId === null;


    return (
        <div className="dashboard-bg p-3 p-lg-5">
            <CContainer size="xl">

                {/* Cabecera */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5">
                    <div>
                        <h1 className="fw-bolder text-dark mb-1">Historial académico</h1>
                        <p className="text-muted mb-0">Visualización de calificaciones, asistencias y evaluaciones</p>
                    </div>

                    {/* Contenedor Principal: APILA los elementos (Alumno y Año) y los ALINEA a la derecha */}
                    <div className="mt-3 mt-md-0 d-flex flex-column align-items-end">

                        {/* Bloque de Búsqueda de Alumno (Fila horizontal, visible solo para Admin/Docente) */}
                        {esDocenteOAdmin && (
                            <div className="d-flex align-items-center bg-white p-1 rounded-4 shadow-sm mb-2">
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

                        {/* Selector de Año (Siempre visible) */}
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

                {/* Estados de la carga */}
                {loading ? (
                    <div className="text-center py-5 fade-in">
                        <CSpinner color="primary" variant="grow" />
                        <p className="text-muted mt-3 animate-pulse">Sincronizando registros...</p>
                    </div>
                ) : error ? (
                    // Bloque de Error HTTP o Auth (Alumnos sin ID válido) 
                    <div className="text-center py-5">
                        <h3 className="text-danger fw-bold">⚠️ Error de Carga</h3>
                        <p className="text-muted">{error}</p>
                    </div>
                ) : isAwaitingSearch ? (
                    // Mensaje para Admin/Docente cuando aún no hay ID ingresado
                    <div className="text-center py-5">
                        <div className="bg-white p-5 rounded-circle shadow-sm d-inline-block mb-3 border border-primary">
                            <CIcon icon={cilSearch} size="4xl" className="text-primary" />
                        </div>
                        <h3 className="text-dark fw-bold">Búsqueda de Expediente</h3>
                        <p className="text-muted">
                            Por favor, ingrese el ID del estudiante para visualizar su historial académico en el año <strong>{year} </strong>.
                        </p>
                    </div>
                ) : academicData ? (
                    //  Bloque de contenido
                    <div className="fade-in-up">
                        {/* KPIs / Métricas  - Uso de statCards */}
                        <CRow className="g-4 mb-5">
                            <CCol sm={6} lg={3}>
                                <StatCard
                                    title="Promedio General"
                                    value={academicData.summary.average}
                                    icon={cilChartLine}
                                    color="primary"
                                    subtext="Escala de 1 a 10"
                                />
                            </CCol>
                            <CCol sm={6} lg={3}>
                                <StatCard
                                    title="Materias Aprobadas" value={academicData.summary.approved}
                                    icon={cilCheckCircle} color="success"
                                />
                            </CCol>
                            <CCol sm={6} lg={3}>
                                <StatCard
                                    title="Asistencia Global"
                                    value={academicData.summary.attendance}
                                    icon={cilCalendar}
                                    color="info"
                                />
                            </CCol>
                            <CCol sm={6} lg={3}>
                                <StatCard
                                    title="Requieren Atención"
                                    value={academicData.summary.failed}
                                    icon={cilWarning}
                                    color="danger"
                                />
                            </CCol>
                        </CRow>

                        {/* Listado de Materias */}
                        <div className="mb-4 d-flex align-items-center justify-content-between">
                            <h4 className="fw-bold text-dark m-0">Materias & Calificaciones</h4>
                            <span className="badge bg-white text-dark border shadow-sm rounded-pill">
                                {academicData.subjects.length} Cursadas
                            </span>
                        </div>

                        <div>
                            {academicData.subjects.length > 0 ? (
                                academicData.subjects.map((sub) => (
                                    <SubjectCard
                                        key={sub.id}
                                        subject={sub}
                                        isOpen={openSubject === sub.id}
                                        onToggle={() => toggleSubject(sub.id)} // COMENTARIO: Se usa el handler local toggleSubject
                                    />
                                ))
                            ) : (
                                <p className="text-muted fst-italic p-3 bg-white border rounded">No hay materias registradas para este periodo.</p>
                            )}
                        </div>



                        {/* Sección de Asistencia (Extendida del mockup original) */}
                        <div className="mt-5">
                            <h4 className="fw-bold text-dark m-0 mb-3">Registro de Asistencias</h4>
                            <AttendanceSection
                                attendanceData={academicData.attendance}
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