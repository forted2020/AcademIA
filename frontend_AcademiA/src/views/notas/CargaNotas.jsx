//  frontend_AcademiA\src\views\notas\CargaNotas.jsx

import React, { useState, useEffect, useMemo } from 'react'
import { CButton, CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CContainer, CFormInput, CFormLabel, } from '@coreui/react'

import GenericTable from '../../components/usersTable/GenericTable.jsx'
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table'


//  Importamos upsertNota
import { upsertNota, } from '../../api/api';

// Importar el hook para acceder a los datos de la sesión almacenados en AuthProvider
import { useAuth } from '../../context/AuthContext.js';


//   Para cargar la planilla modelo
import ModeloPlanilla from './Modelo_Planilla.jsx'

//  Importar hook para obtener notas de los estudiantes
import { usePlanillaCalificaciones } from '../../hooks/useCalificaciones.js';

// Importar configuración de columnas
import { getTableColumns } from '../../utils/columns.js'

//  Importamos contexto para las celdas de la tabla
import { EditableCellProvider } from '../../context/editableCellContext/EditableCellContext.jsx';


//  Importamos el servicio apiMaterias que contiene las funciones getCiclosAll y getMateriasCurso
import apiMaterias, { getCiclosAll, getMateriasCurso } from '../../api/apiMaterias.jsx'

//  Importamos el servicio apiCursos
import apiCursos, { getCursosAll, getCursosCiclo } from '../../api/apiCursos.jsx'


//  Importamos el componente para editar una celda de la tabla Notas
import CeldaEditable from '../../components/notas/CeldaEditable.jsx'



// Estado inicial para filtros
const initialFilters = []

// Importar componentes reutilizables
import TablePagination from '../../components/tablePagination/TablePagination.jsx'
import AdvancedFilters from '../../components/advancedFilters/AdvancedFilters.jsx'
import TableActions from '../../components/tableActions/TableActions.jsx'
import ModalConfirmDel from '../../modals/ModalConfirmDel.jsx'
import ModalNewEdit from '../../modals/ModalNewEdit.jsx'

import '../../css/PersonalStyles.css'

export default function CargaNotaAlumno() {

    const { sessionData, loadingSessionData } = useAuth();
    if (loadingSessionData) {
        return null; // o spinner
    }



    const [unitCharge, setUnitCharge] = useState(false);
    const [formData, setFormData] = useState({
        nota: 8.5, // Valor inicial
        alumno: '',
        tipo: ''
    });

    // ---------- Estados para Ciclos ----------
    const [ciclos, setCiclos] = useState([]);   //  Guardamos los datos obtenidos de la api ciclos
    const [selectedCicloId, setSelectedCicloId] = useState(""); // Guardamos el ciclo seleccionado

    // ---------- Estados para Cursos ----------
    const [cursos, setCursos] = useState([]);   //  Lista de Cursos para el Select
    const [selectedCursoId, setSelectedCursoId] = useState("");   //  Lista de Cursos para el Select

    // ---------- Estados para Materias ----------
    const [materias, setMaterias] = useState([]);   //  Lista de Materias para el Select
    const [materiaId, setMateriaId] = useState("");   //  ID Materia Seleccionada


    const {
        data: tableData,
        loading,
        error
    } = usePlanillaCalificaciones(selectedCicloId, selectedCursoId, materiaId);

    console.log('materiaId:', materiaId);
    console.log('tableData:', tableData);
    console.log('loading:', loading);
    console.log('error:', error);


    // Manejador genérico de cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            // Convertir la nota a número si es el campo 'nota'
            [name]: name === 'nota' ? parseFloat(value) : value,
        }));
    };

    // ---------- Estados principales ----------
    const [searchTerm, setSearchTerm] = useState('') // Búsqueda global
    const [columnFilters, setColumnFilters] = useState(initialFilters) // Filtros por columna
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 }) // Paginación
    const [sorting, setSorting] = useState([]) // Ordenamiento


    // ==================== CARGAR LOS CICLOS AL MONTAR EL COMPONENTE ====================
    useEffect(() => {
        const fetchCiclos = async () => {
            try {
                const response = await apiMaterias.getCiclosAll();  // Ejecuto la apiMaterias.getCiclos
                setCiclos(response.data);   // Guardo los datos en la variable ciclos
            } catch (err) {
                console.error("Error al cargar ciclos lectivos:", err);
            }
        };
        fetchCiclos();
    }, []);

    // ==================== CARGAR LOS CURSOS CADA VEZ QUE selectedCicloId CAMBIA     ====================
    useEffect(() => {
        const cargarCursos = async () => {

            // Si el usuario selecciona "Seleccionar Ciclo" (valor ""), limpiamos cursos
            if (!selectedCicloId || selectedCicloId === "0") {
                setCursos([]);
                setSelectedCursoId('');
                return;
            }

            try {
                // Ejecuto la apiCursos.getCursosCiclo pasando como parámetro el selectedCicloId
                const response = await apiCursos.getCursosCiclo(selectedCicloId);
                setCursos(response.data);   // Guardo los datos en la variable Cursos
                setSelectedCursoId(''); // Reseteamos el cursoId al cambiar de ciclo
            } catch (err) {
                console.error("Error al Traer cursos del ciclo:", err);
            }
        };
        cargarCursos();
    }, [selectedCicloId]); // <--- La "llave" que dispara el efecto


    // ==================== CARGAR LAS MATERIAS CADA VEZ QUE selectedCursoID CAMBIA     ====================
    useEffect(() => {
        const cargarMaterias = async () => {

            // Si el usuario selecciona "Seleccionar Curso" (valor ""), limpiamos Materias
            if (!selectedCursoId || selectedCursoId === "0") {
                setMaterias([]);
                setMateriaId('');
                return;
            }

            try {
                // Ejecuto la api routes_materias.get_materias_curso pasando como parámetro el selectedCursoId
                const response = await apiMaterias.getMateriasCurso(selectedCursoId);
                setMaterias(response.data);   // Guardo los datos en la variable
                setMateriaId(''); // Reseteamos materiaId al cambiar de curso
            } catch (err) {
                console.error("Error al Traer Matrerias del curso:", err);
            }
        };
        cargarMaterias();
    }, [selectedCursoId]);


    // ==================== FUNCIÓN PARA GUARDAR NOTA (UPSERT) ====================
    const handleGuardarNota = async (alumnoId, tipoNotaId, nuevoValor) => {
        // 1. Preparamos el objeto con los datos
        const payload = {
            id_alumno: alumnoId,
            id_materia: parseInt(materiaId), // Viene del estado del selector de arriba
            id_ciclo_lectivo: parseInt(selectedCicloId), // Contexto del Ciclo
            id_curso: parseInt(selectedCursoId),    // Contexto del Curso
            id_tipo_nota: tipoNotaId,
            valor: nuevoValor === "" ? null : parseFloat(nuevoValor),
            id_entidad_carga: sessionData?.user?.id_entidad,
            id_periodo: null // Si es opcional
        };

        console.log("%c Enviar al Backend:", "color: #007bff; font-weight: bold", payload);

        try {
            //  Llamada  a la API:
            const response = await upsertNota(payload);
            console.log("%c✅ ¡Guardado exitoso!", "color: #28a745; font-weight: bold", response);

            // IMPORTANTE: Retornar la respuesta para que CeldaEditable sepa que terminó
            return response;

        } catch (error) {
            console.error("Error al guardar:", error);
            alert("No se pudo guardar la nota. Verifique su conexión.");
            // Acá se podría recargar los datos originales para "limpiar" el error
            // IMPORTANTE: Re-lanzar el error para que CeldaEditable NO navegue
            throw error;

        }
    };



    // ==================== CONFIGURACIÓN DINÁMICA DE COLUMNAS PARA CARGA NOTAS ====================
    const columns = useMemo(() => {
        if (!tableData?.columnas) return [];

        // Columnas Base (Nº y Nombre)
        const baseColumns = [
            { id: 'index', header: 'Nº', cell: ({ row }) => row.index + 1 },
            {
                accessorKey: 'nombre_completo',
                id: 'alumno',
                header: 'Alumno/a',
                //  cell: ({ getValue }) => getValue()?.toUpperCase(),  //  ver si queda mejor el de abajo. Sino, cambiarlo
                cell: ({ getValue }) => <span className="text-nowrap">{getValue()?.toUpperCase()}</span>,
            },
        ];


        // Columnas Dinámicas de Notas (vienen del endpoint)
        const dynamicNotesColumns = (tableData?.columnas || [])
            .filter(col => col.id_tipo_nota !== 7) // Excluir Calif. Definitiva
            .map(col => {
                // Supongamos que el backend nos envía 'editable: false' en el JSON de columnas
                const esEditable = col.editable !== false;

                return {
                    id: `nota_${col.id_tipo_nota}`,
                    header: col.label,
                    accessorKey: `calificaciones.${col.id_tipo_nota}`,
                    cell: ({ row, column, table }) => {

                        // Acceder directamente al valor desde row.original
                        const val = row.original.calificaciones?.[String(col.id_tipo_nota)];

                        // Si no es editable, renderizamos texto plano con un estilo gris
                        if (!esEditable) {
                            if (val === null || val === undefined || val === "") {
                                return <span className="text-muted opacity-50">-</span>;
                            }
                            return <span className="fw-semibold text-dark">{val}</span>;
                        }

                        // Si es editable, usamos nuestro nuevo componente (que crearemos a continuación)
                        return (
                            <CeldaEditable
                                valorInicial={val}
                                editable={esEditable} // Pasamos la prop de control
                                rowIndex={row.index}
                                columnId={column.id}
                                table={table}
                                alGuardar={(nuevoValor) => {
                                    // Llamamos a la función global pasando los IDs correspondientes
                                    return handleGuardarNota(
                                        row.original.id_alumno,
                                        col.id_tipo_nota,
                                        nuevoValor
                                    );
                                }
                                }
                            />
                        );
                    }
                };
            });

        // Columnas de Resultados (Promedio y Definitiva)
        const resultColumns = [
            {
                accessorKey: 'promedio',
                header: 'Prom.',
                cell: ({ getValue }) => <strong className="text-dark">{getValue() || '-'}</strong>
            },
            {
                accessorKey: 'definitiva',
                header: 'Calif. Def.',
                cell: ({ getValue }) => <strong className="text-primary">{getValue() || '-'}</strong>
            },
            { accessorKey: 'observaciones', header: 'Observaciones' },
        ];

        // Unimos todas las piezas
        const finalConfig = [...baseColumns, ...dynamicNotesColumns, ...resultColumns];

        return getTableColumns(
            finalConfig,
            () => { },
            null,
            { showSelection: false, showActions: false }
        );
    }, [tableData]); // Se recalcula si cambian los datos o las columnas


    // ---------- Configuración de TanStack Table ----------
    const table = useReactTable({
        data: tableData?.filas || [], // tableData es un objeto { columnas: [], filas: [] }
        columns,
        getCoreRowModel: getCoreRowModel(),
        // getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setSearchTerm,
        onColumnFiltersChange: setColumnFilters,
        state: {
            pagination,
            sorting,
            globalFilter: searchTerm,
            columnFilters,
        },
    })



    // ==================== DATOS DERIVADOS PARA MOSTRAR E ====================
    const cicloSeleccionado = ciclos.find(c => c.id_ciclo_lectivo === parseInt(selectedCicloId))
    const cursoSeleccionado = cursos.find(c => c.id_curso === parseInt(selectedCursoId))
    const materiaSeleccionada = materias.find(m => m.id_materia === parseInt(materiaId))

    // Extraemos los valores que vamos a mostrar
    const datosPlanilla = {
        ciclo: cicloSeleccionado?.nombre_ciclo_lectivo || 'Sin seleccionar',
        curso: cursoSeleccionado?.curso || 'Sin seleccionar',
        turno: cursoSeleccionado?.turno || 'Sin seleccionar',
        materia: materiaSeleccionada?.nombre_rel?.nombre_materia || 'Sin seleccionar',
        // Se pueden agregar más datos según se necesite
        // docente: materiaSeleccionada?.docente || 'Sin asignar',
        fecha: new Date().toLocaleDateString()
    }



    return (
        <div>

            {/* ----------  BODY --------------- */}
            <CCard className="mb-4 no-print shadow-sm">
                <CCardHeader className="fw-semibold bg-white">
                    Filtros de Selección
                </CCardHeader>
                <CCardBody>
                    <CRow className="g-3">

                        <CCol md={3}>
                            <label className="form-label text-uppercase small fw-semibold text-secondary">Ciclo Lectivo</label>
                            {/* Select Dinámico con los datos de la DB */}
                            <select
                                className="form-select"
                                value={selectedCicloId}
                                onChange={(e) => setSelectedCicloId(e.target.value)}
                            >
                                {/*  Primera opcióndel select */}
                                <option value="">Seleccionar Ciclo</option>

                                {/*  Mapeo las opciones restantes del select */}
                                {ciclos.map((ciclos) => (
                                    <option
                                        key={ciclos.id_ciclo_lectivo}
                                        value={ciclos.id_ciclo_lectivo}
                                    >
                                        {ciclos.nombre_ciclo_lectivo}
                                    </option>
                                ))}
                            </select>
                        </CCol>


                        <CCol md={3}>
                            <label className="form-label text-uppercase small fw-semibold text-secondary">Curso</label>
                            {/* Select Dinámico con los datos de la DB */}
                            <select
                                className="form-select"
                                value={selectedCursoId} // El estado que guarda el curso seleccionado
                                onChange={(e) => setSelectedCursoId(e.target.value)} // Actualiza el ID del curso al elegir
                                disabled={cursos.length === 0} // Se deshabilita si la lista está vacía
                            >
                                {/* Opción por defecto dinámica */}
                                <option value="">
                                    {cursos.length > 0 ? (
                                        "Seleccione el Curso") : "Primero elija un Ciclo"}
                                </option>

                                {/* Mapeo de los cursos traídos del endpoint */}
                                {cursos.map((item) => (
                                    <option
                                        key={item.id_curso}
                                        value={item.id_curso}>
                                        {item.curso}
                                    </option>
                                ))}
                            </select>
                        </CCol>


                        <CCol md={3}>
                            <label className="form-label text-uppercase small fw-semibold text-secondary">Materia</label>
                            <select
                                className="form-select"
                                value={materiaId} // El estado que guarda la materia seleccionada
                                onChange={(e) => setMateriaId(e.target.value)}
                                disabled={materias.length === 0} // Se deshabilita si la lista está vacía
                            >
                                {/* Opción por defecto dinámica */}
                                <option value="">
                                    {materias.length > 0 ? "Seleccionar Materia" : "Primero elija un Curso"}
                                </option>

                                {/* Mapeo de las materias traídas del endpoint */}
                                {materias.map((item) => (
                                    <option
                                        key={item.id_materia}
                                        value={item.id_materia}>
                                        {item.nombre.nombre_materia}
                                    </option>
                                ))}
                            </select>
                        </CCol>


                        <CCol md={3} className="d-flex align-items-end ">
                            <div className="form-check mb-0 text-nowrap">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="checkCargaIndividual"
                                    checked={unitCharge}  // Es mejor controlar el input con 'checked' vinculado al estado
                                    onChange={(e) => setUnitCharge(e.target.checked)} // Forma correcta de actualizar
                                />
                                <label
                                    className="form-check-label text-uppercase small fw-semibold text-secondary"
                                    htmlFor="checkCargaIndividual"
                                >
                                    Carga Individual
                                </label>
                            </div>
                        </CCol>
                    </CRow>
                    {unitCharge && (
                        <CRow className="g-3">
                            <CCol md={3}>
                                <label className="form-label text-uppercase small fw-semibold text-secondary">Alumno</label>
                                <select className="form-select">
                                    <option>Ruiz, Juan Carlos</option>
                                </select>
                            </CCol>
                            <CCol md={3}>
                                <label className="form-label text-uppercase small fw-semibold text-secondary">Tipo</label>
                                <select className="form-select">
                                    <option>1°T</option>
                                </select>

                            </CCol>
                            <CCol md={4}>
                                <CFormLabel htmlFor="nota">
                                    Nota (Ej: 1.0 a 10.0) <span className="text-danger">*</span>
                                </CFormLabel>
                                <CFormInput
                                    id="nota"
                                    name="nota"
                                    type="number"
                                    step="0.5" // Permite notas con medio punto
                                    min="1.0"
                                    max="10.0"
                                    value={formData.nota}
                                    onChange={handleChange}
                                    placeholder="Ej: 8.5"
                                    required
                                />
                            </CCol>
                        </CRow>
                    )}
                </CCardBody>
            </CCard>

            {!unitCharge && (
                <CCard className="shadow-sm">
                    <CCardHeader className="fw-semibold bg-white d-flex justify-content-between">
                        <span>Vista Previa del Acta</span>
                        <span className="text-muted small">Página 1 de 7</span>
                    </CCardHeader>

                    <CCardBody className="p-4" style={{ overflowX: 'auto' }}>

                        {/* Contenedor estilo "Hoja de Papel" */}
                        <div className="border p-3 mx-auto" style={{ minWidth: '800px', backgroundColor: '#fff' }}>

                            {/* ENCABEZADO DE LA PLANILLA */}
                            <CRow className="mb-3 align-items-center">
                                <CCol xs={2} className="text-center">
                                    {/* Placeholder para Logo */}
                                    <div className="bg-light border d-flex align-items-center justify-content-center" style={{ width: '60px', height: '80px', margin: '0 auto' }}>
                                        <small className="text-muted" style={{ fontSize: '10px' }}>LOGO</small>
                                    </div>
                                </CCol>
                                <CCol xs={10}>
                                    <h5 className="text-center fw-bold mb-3">PLANILLAS DE CALIFICACIONES - CL: {datosPlanilla.ciclo}</h5>

                                    {/* Grilla de Datos del Encabezado */}
                                    <div className="border">
                                        <CRow className="g-0 border-bottom">
                                            <CCol xs={6} className="p-1 border-end d-flex">
                                                <span className="fw-bold me-2">CURSO Y DIV.:</span>
                                                <span>{datosPlanilla.curso}</span>
                                            </CCol>
                                            <CCol xs={6} className="p-1 d-flex">
                                                <span className="fw-bold me-2">Turno</span>
                                                <span className="fst-italic">Mañana</span>
                                            </CCol>
                                        </CRow>

                                        <CRow className="g-0 border-bottom">
                                            <CCol xs={6} className="p-1 border-end d-flex">
                                                <span className="fw-bold me-2">ASIGNATURA:</span>
                                                <span>{datosPlanilla.materia} </span>
                                            </CCol>

                                            <CCol xs={6} className="p-1 d-flex">
                                                <span className="fw-bold me-2">Fecha</span>
                                                <span>{datosPlanilla.fecha}</span>
                                            </CCol>
                                        </CRow>

                                        <CRow className="g-0">
                                            <CCol xs={12} className="p-1 d-flex">
                                                <span className="fw-bold me-2">DOCENTE:</span>
                                                <span>Pablo S. Pannone</span>
                                            </CCol>
                                        </CRow>
                                    </div>
                                </CCol>
                            </CRow>

                            {/* TABLA DE NOTAS */}
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {/* Tabla de estudiantes. Lo envolvemos en el contexto, 
                                para manejar el foco de las celdas */}
                                <EditableCellProvider>
                                    <GenericTable table={table} />
                                </EditableCellProvider>
                            </div>
                        </div>

                    </CCardBody>
                </CCard>
            )}

            {/* ----------  /BODY --------------- */}


            {/* ----------  FOOTER --------------- */}
            <CCardFooter
                className="bg-white border-top px-3 py-1" >

                <div className="d-flex justify-content-between align-items-center">
                    <span className="small text-muted">Sistema de Gestión Académica</span>
                    <span className="small text-muted">Impreso el: {new Date().toLocaleDateString()}</span>
                </div>

            </CCardFooter>

        </div>





    )


}