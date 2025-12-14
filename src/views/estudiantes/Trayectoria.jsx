//  AcademIA\src\views\estudiantes\Trayectoria.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { CContainer, CRow, CCol, CCard, CCardBody, CCollapse, CSpinner, CAlert } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSchool, cilCheckCircle, cilWarning, cilChevronBottom, cilCalendar, cilChartLine } from '@coreui/icons';
//  import { academicData } from './data'; // Archivo de datos. 
import '../../css/AdvancedFilters.css'

//  IMporto componentes modularizados
import AttendanceSection from './AttendanceSection'; // <-- Importa el componente de asistencias
import SubjectCard from '../../components/subjectCard/SubjectCard'; // Importa el componente de Fila materias
import StatCard from '../../components/statCard/statCard'; // Importa el componente de Tarjeta Estadística


import { getMateriasPorEstudiante } from '../../api/apiEstudiantes';  // 
//import { CSpinner, CAlert } from '@coreui/react';

// --- CONSTANTES ---
const API_BASE_URL = 'http://localhost:8000';
const API_PREFIX = '/api/estudiantes'; // <--- Prefijo del nuevo endpoint (de attendance_estudiante)

// Roles definidos para la lógica de visualización
const ADMIN_ROLES = ['ADMIN_SISTEMA', 'DOCENTE_APP'];
const STUDENT_ROLE = 'ALUMNO_APP'; // <-- Ya está implícito, pero lo definimos.

// --- Función para obtener el ID de la ENTIDAD logueada y el ROL ---
const getLoggedUserInfo = () => {
    try {
        const userString = localStorage.getItem('user');
        if (userString) {
            const user = JSON.parse(userString);
            return {
                idEntidad: user.id_entidad, // <--- Extraer id_entidad
                rol: user.tipo_rol?.cod_tipo_usuario || user.rol_sistema,
            };
        }
        return { idEntidad: null, rol: null };
    } catch (e) {
        console.error("Error al parsear el usuario del localStorage", e);
        return { idEntidad: null, rol: null };
    }
};

/*
// --- Función para obtener el ID de la ENTIDAD logueada ---
const getEntidadIdFromStorage = () => {
    try {
        const userString = localStorage.getItem('user');
        if (userString) {
            const user = JSON.parse(userString);
            return user.id_entidad; // <--- Extraer id_entidad
        }
        return null;
    } catch (e) {
        console.error("Error al parsear el usuario del localStorage", e);
        return null;
    }
};
*/

// --- Componente Principal ---
const AcademicDashboard = () => {

    // Usamos useMemo para obtener el ID de la entidad y el rol
    const loggedUserInfo = useMemo(() => getLoggedUserInfo(), []);

    // Lógica para determinar el rol del usuario logueado
    const isTeacherOrAdmin = useMemo(() => {
        return ADMIN_ROLES.includes(loggedUserInfo.rol);
    }, [loggedUserInfo.rol]);

    // ID del estudiante por defecto (el propio ID del usuario si es alumno)
    const initialEntityId = loggedUserInfo.idEntidad || '';


    const [year, setYear] = useState('2025');
    const [loading, setLoading] = useState(true); // Inicia la carga en TRUE, ya que la API se llama al montar
    const [openSubject, setOpenSubject] = useState(null);
    const [academicData, setAcademicData] = useState(null);
    const [error, setError] = useState(null);

    // ESTADOS para Docentes/Admins:

    // ID de Entidad ingresado en el input (solo Docente/Admin)
    const [inputEntityId, setInputEntityId] = useState('');

    // ID de Entidad usado para disparar la API (se actualiza con el botón)
    const [currentEntityId, setCurrentEntityId] = useState(initialEntityId);



    // FUNCIÓN CENTRAL: hace la llamada a la API y maneja la respuesta (JSON), obteniendo datos de la API
    const fetchAcademicData = async (id, selectedYear) => {
        if (!id) {
            setError("Error: ID de Entidad no encontrado. Por favor, vuelva a iniciar sesión.");
            setLoading(false);
            return;
        }

        setLoading(true); // Inicia el spinner
        setError(null);
        setAcademicData(null);

        try {
            // Construye la URL correcta: http://localhost:8000/estudiantes/{id_entidad}/asistencias?year={year}
            //  Ej: http://localhost:8000/api/estudiantes/1/asistencias?year=2025
            const attendanceUrl = `${API_BASE_URL}${API_PREFIX}/${id}/asistencias?year=${selectedYear}`;
            console.log(`API Call (id_entidad): ${attendanceUrl}`);

            const attendanceResponse = await fetch(attendanceUrl);

            if (!attendanceResponse.ok) {
                // Manejo de errores HTTP 
                throw new Error(`Error ${attendanceResponse.status}: ${attendanceResponse.statusText}`);
            }

            const attendanceAPI = await attendanceResponse.json();

            // --------------------------------------------------------------------------
            // 🔑 NOTA: Aquí solo tenemos los datos de asistencia. Mantenemos mockups
            //          temporales para que el resto de tu vista funcione (StatCards).
            // --------------------------------------------------------------------------
            const tempSummary = {
                average: 7.0,
                approved: 5,
                attendance: attendanceAPI ? `${(100 - (attendanceAPI.totalDaysLost * 10)).toFixed(0)}%` : 'N/A',
                failed: 2
            };
            const tempSubjects = [];

            // Almacena los datos en el estado
            setAcademicData({
                summary: tempSummary,
                subjects: tempSubjects,
                attendance: attendanceAPI, // <-- Datos reales de la API
            });

        } catch (err) {
            console.error("Error al cargar datos académicos:", err);
            setError(`Fallo al cargar datos: ${err.message}.`);
            setAcademicData(null);
        } finally {
            setLoading(false); // Finaliza el spinner
        }
    };


    // Handler para el input text (solo para docentes/admins)
    const handleStudentIdChange = (e) => {
        setInputEntityId(e.target.value);
    };

    // Handler para el botón de búsqueda (solo para docentes/admins)
    const handleSearchClick = () => {
        // Al hacer clic, actualizamos el ID que dispara el useEffect
        setCurrentEntityId(inputEntityId);
        setOpenSubject(null);
    };

    // Handler para el cambio de año (usa currentEntityId)
    const handleYearChange = (e) => {
        setYear(e.target.value);
        setOpenSubject(null);   // El useEffect se encargará de disparar la API.
    };



    // ----------- HOOK DE EFECTO para llamar a la API --------------------------
    useEffect(() => {
        // Depende del `currentEntityId` que puede ser el propio (alumno) 
        // o el que se ingresó y se confirmó con el botón (docente/admin)
        fetchAcademicData(currentEntityId, year);
    }, [year, currentEntityId]);




    const data = academicData   //  data es el estado

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

                        {/* 1. Bloque de Búsqueda de Alumno (Fila horizontal, visible solo para Admin/Docente) */}
                        {isTeacherOrAdmin && (
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

                        {/* 2. Bloque del Año (Fila horizontal) - Queda automáticamente debajo del bloque 1 */}
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

                {loading ? (
                    //  Bloque de Carga
                    <div className="text-center py-5 fade-in">
                        <CSpinner color="primary" variant="grow" />
                        <p className="text-muted mt-3 animate-pulse">Sincronizando registros...</p>
                    </div>
                ) : data ? (
                    //  Bloque de contenido
                    <div className="fade-in-up">

                        {/* KPIs / Métricas  - Uso de statCards */}
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
                                {data.subjects.length} Cursadass
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

