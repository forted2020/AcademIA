//  AcademIA\src\views\estudiantes\Trayectoria.jsx

import React, { useState } from 'react';
import { CCard, CCardBody, CContainer, CRow } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilChartLine, cilSearch } from '@coreui/icons';

// Componentes modulares
import AttendanceSection from './AttendanceSection'; // <-- Componente de asistencias
import SubjectCard from '../../components/subjectCard/SubjectCard'; // Componente de Fila materias
import StatCard from '../../components/statCard/StatCard'; // Componente de Tarjeta Estadística

import GradesSection from '../../components/gradesSection/GradesSection';

import StatsCardsOverview from '../statsCards/StatsCardsOverview';

import { getMateriasPorEstudiante } from '../../api/apiEstudiantes';

// Componente que trae los ciclos lectivos en los cuales el alumno cursó alguna materia
import SelectorCicloLectivo from '../../components/SelectorCicloLectivo/SelectorCicloLectivo';

// Hooks Modulares
import useAuthUser from '../../hooks/useAuthUser'; // <-- Hook de Usuario
import useInasistenciaData from '../../hooks/useInasistenciaData'; // <-- Hook de Datos de API

// Estilos del sistema de diseño
import './Trayectoria.css';

// Roles definidos para la lógica de visualización
const ADMIN_ROLES = ['ADMIN_SISTEMA', 'DOCENTE_APP'];


// --- Componente Principal ---
const AcademicDashboard = () => {

    // Obtención de datos del usuario autenticado desde localStorage, usando el Hook useAuthUser().
    const { idEntidad: loggedEntityId, isAdmin, rol } = useAuthUser();

    // Depuración en consola
    console.log('=== Datos del usuario autenticado (useAuthUser) ===');
    console.log('Objeto completo devuelto por useAuthUser:', useAuthUser());
    console.log('id_entidad del usuario logueado: ', useAuthUser().idEntidad);

    const id_usuario_logueado = useAuthUser().idEntidad;


    // ESTADOS LOCALES DE LA INTERFAZ
    const [year, setYear] = useState('2025');

    const [openSubject, setOpenSubject] = useState(null);
    // Estados para búsqueda (solo admins/docentes)
    const [inputEntityId, setInputEntityId] = useState('');

    // Determinar el Rol del usuario
    const esAlumno = rol === 'ALUMNO_APP';
    const esDocenteOAdmin = rol === 'ADMIN_SISTEMA' || rol === 'DOCENTE_APP';

    // Estados para el ciclo lectivo seleccionado
    const [ciclo, setCiclo] = useState(null);
    const [cicloId, setCicloId] = useState(null);


    // ID de Entidad usado para cargar datos
    // - Alumno: usa su propio ID automáticamente
    // - Docente/Admin: empieza vacío (null), hasta que busque
    const [currentEntityId, setCurrentEntityId] = useState(esAlumno ? loggedEntityId : null);

    // Hook para obtener los datos de la base
    //   * currentEntityId: ID del estudiante a buscar
    //   * ciclo: Ciclo lectivo de datos a buscar
    const { inasistenciaData, loading, error, refetch } = useInasistenciaData(currentEntityId, year);
    console.log("📡 Parámetros para obtener datos de inasistencia: ", { currentEntityId, year });

    //  -----   HANDLERS DE INTERFAZ    -----

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

    // Handler para el cambio de Ciclo
    const handleCicloChange = (c) => {
        // Evitamos que el código siga ejecutándose si no hay datos.
        if (!c) return;

        setCiclo(c.nombre_ciclo_lectivo);
        setCicloId(c.id_ciclo_lectivo);

        setOpenSubject(null);   // Para "limpiar" la interfaz.

        console.log("🔄 Cambio de ciclo detectado:");
        console.log("ID capturado para el backend:", c.id_ciclo_lectivo);
        console.log("Nombre para la interfaz:", c.nombre_ciclo_lectivo);
    };


    // Lógica para alternar la apertura/cierre de la tarjeta de materia
    const toggleSubject = (id) => setOpenSubject(openSubject === id ? null : id);

    // Lógica para mostrar mensaje de "esperando búsqueda"
    // Solo para docentes y admins, cuando aún no buscaron
    const isAwaitingSearch = esDocenteOAdmin && !loading && !error && !inasistenciaData && currentEntityId === null;

    const id_alumno = (currentEntityId || id_usuario_logueado);
    console.log("ID Alumno final:", id_alumno);


    return (
        <CContainer fluid className="py-3">
            <CCard className="tray-card">

                {/* ── Encabezado ── */}
                <div className="tray-card-header">

                    {/* Columna izquierda: brand */}
                    <div className="tray-header-left">
                        <div className="tray-header-brand">
                            <div className="tray-header-brand-icon">
                                <CIcon icon={cilChartLine} className="tray-brand-icon" />
                            </div>
                            <div>
                                <h2 className="tray-header-h2">Historial Académico</h2>
                                <p className="tray-header-sub">Trayectoria escolar por ciclo lectivo</p>
                            </div>
                        </div>
                    </div>

                    {/* Columna derecha: buscador de alumno + selector de ciclo */}
                    <div className="tray-header-right">

                        {/* Buscador de Alumno (visible solo para Admin/Docente) */}
                        {esDocenteOAdmin && (
                            <div className="tray-search-row">
                                <label className="tray-search-label">ID Alumno</label>
                                <input
                                    type="text"
                                    value={inputEntityId}
                                    onChange={handleStudentIdChange}
                                    placeholder="ID Entidad"
                                    className="tray-search-input"
                                />
                                <button
                                    onClick={handleSearchClick}
                                    className="tray-search-btn"
                                    title="Buscar estudiante"
                                >
                                    Buscar
                                </button>
                            </div>
                        )}

                        {/* Selector de Ciclo Lectivo con label + step badge */}
                        <div className="tray-filter-field">
                            <label className="tray-filter-label">
                                <span className={`tray-filter-step${ciclo ? ' is-ready' : ''}`}>1</span>
                                Ciclo lectivo
                            </label>
                            <SelectorCicloLectivo
                                id_entidad={currentEntityId || id_usuario_logueado}
                                onCicloChange={handleCicloChange}
                                variant={'EstiloForm'}
                            />
                        </div>

                    </div>
                </div>
                {/* ── /Encabezado ── */}

                {/* ── Cuerpo ── */}
                <CCardBody className="tray-card-body">

                    <div className="fade-in-up">

                        {/* ── KPIs / Métricas ── */}
                        <div className="tray-stats-row">
                            <CRow className="g-4">
                                <StatsCardsOverview />
                            </CRow>
                        </div>

                        {/* ── Materias & Calificaciones ── */}
                        <CRow>
                            <div className="tray-section-header">
                                <h4 className="tray-section-title">Materias &amp; Calificaciones</h4>
                                <span className="tray-section-badge">
                                    {inasistenciaData?.subjects?.length ?? 0} Cursadas
                                </span>
                            </div>

                            <div>
                                {/* Llamada al componente de visualización de notas */}
                                <GradesSection
                                    id_alumno={id_alumno}
                                    ciclo={cicloId}
                                />
                            </div>

                            {/* Sección de Asistencia */}
                            <div className="mt-5">
                                <div className="tray-section-header">
                                    <h4 className="tray-section-title">Registro de Asistencias</h4>
                                </div>
                                <AttendanceSection
                                    attendanceData={inasistenciaData?.attendance}
                                    year={ciclo}
                                />
                            </div>
                        </CRow>

                    </div>

                </CCardBody>
                {/* ── /Cuerpo ── */}

            </CCard>
        </CContainer>
    );
};

export default AcademicDashboard;
