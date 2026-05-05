//  AcademIA\src\views\estudiantes\Trayectoria.jsx

import React, { useState } from 'react';
import { CContainer, CRow, CCol, CCard, CCardBody, CCollapse, CSpinner, CAlert } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSchool, cilCheckCircle, cilWarning, cilChevronBottom, cilCalendar, cilChartLine, cilSearch } from '@coreui/icons';
import '../../css/AdvancedFilters.css'


// Componentes modulares
import AttendanceSection from './AttendanceSection'; // <-- Cmponente de asistencias
import SubjectCard from '../../components/subjectCard/SubjectCard'; // Componente de Fila materias
import StatCard from '../../components/statCard/StatCard'; // Componente de Tarjeta Estadística

import GradesSection from '../../components/gradesSection/GradesSection';

import StatsCardsOverview from '../statsCards/StatsCardsOverview'


import { getMateriasPorEstudiante } from '../../api/apiEstudiantes';  // 
//import { CSpinner, CAlert } from '@coreui/react';

//  Componente que trae los ciclos lectivos en los cuales el alumno cursó alguna materia
import SelectorCicloLectivo from '../../components/SelectorCicloLectivo/SelectorCicloLectivo'

// Hooks Modulares
import useAuthUser from '../../hooks/useAuthUser'; // <-- Hook de Usuario
import useInasistenciaData from '../../hooks/useInasistenciaData'; // <-- Hook de Datos de API

// Roles definidos para la lógica de visualización
const ADMIN_ROLES = ['ADMIN_SISTEMA', 'DOCENTE_APP'];
//  const STUDENT_ROLE = 'ALUMNO_APP'; // <-- Ya está implícito, pero lo definimos.


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




    // Inicializamos currentEntityId según el rol
    // Solo si es ALUMNO, usamos su propio ID. 
    // Si es docente o admin, empezamos en null → muestra mensaje de búsqueda
    //  const initialEntityId = (rol === 'ALUMNO_APP') ? loggedEntityId : null;


    // ID de Entidad usado para cargar datos 
    // - Alumno: usa su propio ID automáticamente
    // - Docente/Admin: empieza vacío (null), hasta que busque
    const [currentEntityId, setCurrentEntityId] = useState(esAlumno ? loggedEntityId : null);

    // Usamos el hook   para obtener los datos de la base
    //   * currentEntityId: ID del estudiante a buscar
    //   * ciclo: Ciclo lectivo de datos a buscar
    //   * inasistenciaDData: guarda los datos del estudiante (asistencia, promedios, materias, etc)
    //   * loading: booleano para indicar si se están cargando los datos
    //   * error: mensaje de error si API falla o null si está todo OK.
    //    *refectch: llama la función de forma manual, cuando por ejemplo, se presiona el botón "Buscar"
    const { inasistenciaData, loading, error, refetch } = useInasistenciaData(currentEntityId, year);
    console.log("📡 Paráametros para obtener datos de inasistencia: ", { currentEntityId, year })

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

    // Handler para el cambio de Ciclo 
    const handleCicloChange = (c) => {
        // Evitamos que el código siga ejecutándose si no hay datos.
        if (!c) return;

        setCiclo(c.nombre_ciclo_lectivo);
        setCicloId(c.id_ciclo_lectivo);

        setOpenSubject(null);   // Para "limpiar" la interfaz.

        console.log("🔄 Cambio de ciclo detectado:");
        console.log("ID capturado para el backend:", c.id_ciclo_lectivo);
        console.log("Nombre para la interfaz:", c.nombre_ciclo_lectivo);
    }


    // Lógica para alternar la apertura/cierre de la tarjeta de materia
    const toggleSubject = (id) => setOpenSubject(openSubject === id ? null : id);

    // Lógica para mostrar mensaje de "esperando búsqueda"
    // Solo para docentes y admins, cuando aún no buscaron
    const isAwaitingSearch = esDocenteOAdmin && !loading && !error && !inasistenciaData && currentEntityId === null;

    const id_alumno = (currentEntityId || id_usuario_logueado);
     console.log("ID Alumno final:", id_alumno);    


    return (
        <div className="dashboard-bg p-3 p-lg-5">
            <CContainer size="xl">

                {/* Cabecera */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5">
                    <div>
                        <h1 className="fw-bolder text-dark mb-1">Historial académico</h1>
                        <p className="text-muted mb-0">Visualización de calificaciones, asistencias y evaluaciones</p>
                    </div>

                    {/* Contenedor de busquedas */}
                    <div className="mt-3 mt-md-0 d-flex flex-column align-items-end">

                        {/*Bloque de Búsqueda de Alumno (visible solo para Admin/Docente) */}
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

                        {/* Selector de Año , con Renderizado condiconal*/}
                        <div className="d-flex align-items-center bg-white p-2 rounded-4 shadow-sm">
                            <label className="fw-bold text-muted small me-2 px-2">Año:</label>

                            <SelectorCicloLectivo
                                id_entidad={currentEntityId || id_usuario_logueado}
                                onCicloChange={handleCicloChange}
                                variant={'EstiloForm'}
                            />
                            {ciclo ? (
                                <p> {ciclo.id_ciclo_lectivo}</p>
                            ) : (
                                <p></p>
                            )}

                        </div>
                    </div>
                </div>

                <div className="fade-in-up">

                    {/* ------------ KPIs / Métricas - Uso de statCards ------------  */}
                    <CRow className="g-4 mb-5 ">
                        <StatsCardsOverview />
                    </CRow>

                    <CRow>
                        {/* Listado de Materias */}
                        <div className="mt-0 d-flex align-items-center justify-content-between">
                            <h4 className="fw-bold text-dark m-0 mb-0" >Materias & Calificaciones</h4>
                            <span className="badge bg-white text-dark border shadow-sm rounded-pill">
                                {inasistenciaData?.subjects?.length} Cursadas
                            </span>
                        </div>

                        <div>
                            {/* Llamada al componente de visuaización de notas */}
                            <GradesSection
                                id_alumno={id_alumno}
                                ciclo={cicloId} 
                                />
                        </div>

                        {/* Sección de Asistencia */}
                        <div className="mt-5">
                            <h4 className="fw-bold text-dark m-0 mb-3">Registro de Asistencias</h4>
                            <AttendanceSection
                                attendanceData={inasistenciaData?.attendance}
                                year={ciclo}
                            />
                        </div>
                    </CRow>



                </div>

                {/* 
                ) : (
                    <div className="text-center py-5">
                        <div className="bg-white p-5 rounded-circle shadow-sm d-inline-block mb-3">
                            <CIcon icon={cilSchool} size="4xl" className="text-muted" />
                        </div>
                        <h3 className="text-dark fw-bold">Sin registros para {ciclo}</h3>
                        <p className="text-muted">No se encontraron inscripciones activas en este periodo.</p>
                    </div>
                )}
                    */}
            </CContainer>
        </div>
    );
};

export default AcademicDashboard;