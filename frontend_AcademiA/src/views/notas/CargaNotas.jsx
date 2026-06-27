//  frontend_AcademiA\src\views\notas\CargaNotas.jsx

import React, { useState, useEffect, useMemo } from 'react'
import {
    CCard, CCardHeader, CCardBody,
    CCol, CRow, CFormInput, CFormLabel,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilNotes } from '@coreui/icons'

import GenericTable from '../../components/usersTable/GenericTable.jsx'
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table'

import { upsertNota } from '../../api/api'
import { useAuth } from '../../context/AuthContext.js'
import { useConfigSistema, getRangoNotas } from '../../hooks/useConfigSistema.js'
import { usePlanillaCalificaciones } from '../../hooks/useCalificaciones.js'
import { getTableColumns } from '../../utils/columns.js'
import { EditableCellProvider } from '../../context/editableCellContext/EditableCellContext.jsx'
import apiMaterias from '../../api/apiMaterias.jsx'
import apiCursos from '../../api/apiCursos.jsx'
import CeldaEditable from '../../components/notas/CeldaEditable.jsx'

// 1. Primero, añade la importación al principio de tu archivo (ajusta los "../" si es necesario)
import escudoLogo from '../../assets/brand/Escudo_Esc_CAE-uai-258x327.png';



import './CargaNotas.css'

const initialFilters = []

export default function CargaNotaAlumno() {

    const { sessionData, loadingSessionData } = useAuth();
    const { configs: configSistema } = useConfigSistema();
    const { notaMinima, notaMaxima } = getRangoNotas(configSistema);

    if (loadingSessionData) {
        return null;
    }

    const [unitCharge, setUnitCharge] = useState(false);
    const [formData, setFormData] = useState({
        nota: 8.5,
        alumno: '',
        tipo: ''
    });

    // ---------- Estados para Ciclos ----------
    const [ciclos, setCiclos] = useState([]);
    const [selectedCicloId, setSelectedCicloId] = useState("");

    // ---------- Estados para Cursos ----------
    const [cursos, setCursos] = useState([]);
    const [selectedCursoId, setSelectedCursoId] = useState("");

    // ---------- Estados para Materias ----------
    const [materias, setMaterias] = useState([]);
    const [materiaId, setMateriaId] = useState("");

    const {
        data: tableData,
        loading,
        error
    } = usePlanillaCalificaciones(selectedCicloId, selectedCursoId, materiaId);

    console.log('materiaId:', materiaId);
    console.log('tableData:', tableData);
    console.log('loading:', loading);
    console.log('error:', error);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'nota' ? parseFloat(value) : value,
        }));
    };

    const [searchTerm, setSearchTerm] = useState('')
    const [columnFilters, setColumnFilters] = useState(initialFilters)
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
    const [sorting, setSorting] = useState([])

    // Fecha editable del encabezado de planilla — formato dd/mm/aa
    const hoy = new Date()
    const fechaInicial = `${String(hoy.getDate()).padStart(2, '0')}/${String(hoy.getMonth() + 1).padStart(2, '0')}/${String(hoy.getFullYear()).slice(-2)}`
    const [fechaPlanilla, setFechaPlanilla] = useState(fechaInicial)
    const [editandoFecha, setEditandoFecha] = useState(false)

    // Docente editable — se inicializa desde la sesión, pero puede corregirse manualmente
    const nombreDocenteInicial = sessionData?.user
        ? `${sessionData.user.apellido ?? ''}, ${sessionData.user.nombre ?? ''}`.trim().replace(/^,\s*/, '')
        : ''
    const [docentePlanilla] = useState(nombreDocenteInicial)

    // ==================== CARGAR LOS CICLOS AL MONTAR EL COMPONENTE ====================
    useEffect(() => {
        const fetchCiclos = async () => {
            try {
                const response = await apiMaterias.getCiclosAll();
                const payload = response.data
                setCiclos(Array.isArray(payload) ? payload : (payload?.data ?? []))
            } catch (err) {
                console.error("Error al cargar ciclos lectivos:", err);
            }
        };
        fetchCiclos();
    }, []);

    // ==================== CARGAR LOS CURSOS CADA VEZ QUE selectedCicloId CAMBIA ====================
    useEffect(() => {
        const cargarCursos = async () => {
            if (!selectedCicloId || selectedCicloId === "0") {
                setCursos([]);
                setSelectedCursoId('');
                return;
            }
            try {
                const response = await apiCursos.getCursosCiclo(selectedCicloId);
                setCursos(response.data);
                setSelectedCursoId('');
            } catch (err) {
                console.error("Error al Traer cursos del ciclo:", err);
            }
        };
        cargarCursos();
    }, [selectedCicloId]);

    // ==================== CARGAR LAS MATERIAS CADA VEZ QUE selectedCursoID CAMBIA ====================
    useEffect(() => {
        const cargarMaterias = async () => {
            if (!selectedCursoId || selectedCursoId === "0") {
                setMaterias([]);
                setMateriaId('');
                return;
            }
            try {
                const response = await apiMaterias.getMateriasCurso(selectedCursoId);
                setMaterias(response.data);
                setMateriaId('');
            } catch (err) {
                console.error("Error al Traer Materias del curso:", err);
            }
        };
        cargarMaterias();
    }, [selectedCursoId]);

    // ==================== FUNCIÓN PARA GUARDAR NOTA (UPSERT) ====================
    const handleGuardarNota = async (alumnoId, tipoNotaId, nuevoValor) => {
        // Validación contra el rango configurado en el sistema.
        // Se ejecuta antes de armar el payload para evitar viajes al backend con valores inválidos.
        const valorParseado = nuevoValor === "" || nuevoValor === null || nuevoValor === undefined
            ? null
            : parseFloat(nuevoValor);

        if (valorParseado !== null && (Number.isNaN(valorParseado) || valorParseado < notaMinima || valorParseado > notaMaxima)) {
            alert(`La nota debe estar entre ${notaMinima} y ${notaMaxima}. Ajustá la configuración del sistema si necesitás otro rango.`);
            throw new Error('Nota fuera de rango');
        }

        const payload = {
            id_alumno: alumnoId,
            id_materia: parseInt(materiaId),
            id_ciclo_lectivo: parseInt(selectedCicloId),
            id_curso: parseInt(selectedCursoId),
            id_tipo_nota: tipoNotaId,
            valor: valorParseado,
            id_entidad_carga: sessionData?.user?.id_entidad,
            id_periodo: null
        };

        console.log("%c Enviar al Backend:", "color: #007bff; font-weight: bold", payload);

        try {
            const response = await upsertNota(payload);
            console.log("%c✅ ¡Guardado exitoso!", "color: #28a745; font-weight: bold", response);
            return response;
        } catch (error) {
            console.error("Error al guardar:", error);
            const mensajeBackend = error?.response?.data?.detail;
            alert(mensajeBackend || "No se pudo guardar la nota. Verifique su conexión.");
            throw error;
        }
    };

    // ==================== CONFIGURACIÓN DINÁMICA DE COLUMNAS ====================
    const columns = useMemo(() => {
        if (!tableData?.columnas) return [];

        const baseColumns = [
            { id: 'index', header: 'Nº', cell: ({ row }) => row.index + 1 },
            {
                accessorKey: 'nombre_completo',
                id: 'alumno',
                header: 'Alumno/a',
                cell: ({ getValue }) => <span className="text-nowrap">{getValue()?.toUpperCase()}</span>,
            },
        ];

        const dynamicNotesColumns = (tableData?.columnas || [])
            .filter(col => col.id_tipo_nota !== 7)
            .map(col => {
                const esEditable = col.editable !== false;
                return {
                    id: `nota_${col.id_tipo_nota}`,
                    header: col.label,
                    accessorKey: `calificaciones.${col.id_tipo_nota}`,
                    cell: ({ row, column, table }) => {
                        const val = row.original.calificaciones?.[String(col.id_tipo_nota)];
                        if (!esEditable) {
                            if (val === null || val === undefined || val === "") {
                                return <span className="text-muted opacity-50">-</span>;
                            }
                            return <span className="fw-semibold text-dark">{val}</span>;
                        }
                        return (
                            <CeldaEditable
                                valorInicial={val}
                                editable={esEditable}
                                rowIndex={row.index}
                                columnId={column.id}
                                table={table}
                                alGuardar={(nuevoValor) =>
                                    handleGuardarNota(row.original.id_alumno, col.id_tipo_nota, nuevoValor)
                                }
                            />
                        );
                    }
                };
            });

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

        return getTableColumns(
            [...baseColumns, ...dynamicNotesColumns, ...resultColumns],
            () => { },
            null,
            { showSelection: false, showActions: false }
        );
    }, [tableData]);

    // ---------- Configuración de TanStack Table ----------
    const table = useReactTable({
        data: tableData?.filas || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
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

    // ==================== DATOS DERIVADOS ====================
    const cicloSeleccionado = ciclos.find(c => c.id_ciclo_lectivo === parseInt(selectedCicloId))
    const cursoSeleccionado = cursos.find(c => c.id_curso === parseInt(selectedCursoId))
    const materiaSeleccionada = materias.find(m => m.id_materia === parseInt(materiaId))

    const datosPlanilla = {
        ciclo: cicloSeleccionado?.nombre_ciclo_lectivo || 'Sin seleccionar',
        curso: cursoSeleccionado?.curso || 'Sin seleccionar',
        turno: cursoSeleccionado?.turno || 'Sin seleccionar',
        materia: materiaSeleccionada?.nombre?.nombre_materia || 'Sin seleccionar',
    }

    return (
        <CCard className="cn-card">

            {/* ── Encabezado con filtros ── */}
            <CCardHeader className="cn-card-header">
                <div className="cn-header-left">

                    <div className="cn-header-brand">
                        <div className="cn-header-brand-icon">
                            <CIcon icon={cilNotes} className="cn-brand-icon" />
                        </div>
                        <div>
                            <h2 className="cn-header-h2">Carga de Notas</h2>
                            <p className="cn-header-sub">Registro de calificaciones por materia y curso</p>
                        </div>
                    </div>

                    <div className="cn-filters-row">

                        <div className="cn-filter-field">
                            <label className="cn-filter-label">
                                <span className="cn-filter-step is-ready">1</span>
                                Ciclo Lectivo
                            </label>
                            <select
                                className="cn-filter-select"
                                value={selectedCicloId}
                                onChange={(e) => setSelectedCicloId(e.target.value)}
                            >
                                <option value="">Seleccioná un ciclo</option>
                                {ciclos.map((c) => (
                                    <option key={c.id_ciclo_lectivo} value={c.id_ciclo_lectivo}>
                                        {c.nombre_ciclo_lectivo}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="cn-filter-field">
                            <label className="cn-filter-label">
                                <span className={`cn-filter-step${selectedCicloId ? ' is-ready' : ''}`}>2</span>
                                Curso
                            </label>
                            <select
                                className={`cn-filter-select${!selectedCicloId ? ' is-disabled' : ''}`}
                                value={selectedCursoId}
                                disabled={!selectedCicloId}
                                onChange={(e) => setSelectedCursoId(e.target.value)}
                            >
                                <option value="">
                                    {selectedCicloId ? 'Seleccioná un curso' : 'Primero elegí un ciclo'}
                                </option>
                                {cursos.map((c) => (
                                    <option key={c.id_curso} value={c.id_curso}>{c.curso}</option>
                                ))}
                            </select>
                        </div>

                        <div className="cn-filter-field">
                            <label className="cn-filter-label">
                                <span className={`cn-filter-step${selectedCursoId ? ' is-ready' : ''}`}>3</span>
                                Materia
                            </label>
                            <select
                                className={`cn-filter-select${!selectedCursoId ? ' is-disabled' : ''}`}
                                value={materiaId}
                                disabled={!selectedCursoId}
                                onChange={(e) => setMateriaId(e.target.value)}
                            >
                                <option value="">
                                    {selectedCursoId ? 'Seleccioná una materia' : 'Primero elegí un curso'}
                                </option>
                                {materias.map((m) => (
                                    <option key={m.id_materia} value={m.id_materia}>
                                        {m.nombre.nombre_materia}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="cn-filter-field cn-filter-field--check">
                            <label className="cn-filter-label">&nbsp;</label>
                            <label className="cn-check-label" htmlFor="checkCargaIndividual">
                                <input
                                    className="cn-check-input"
                                    type="checkbox"
                                    id="checkCargaIndividual"
                                    checked={unitCharge}
                                    onChange={(e) => setUnitCharge(e.target.checked)}
                                />
                                Carga individual
                            </label>
                        </div>

                    </div>

                    {unitCharge && (
                        <div className="cn-filters-row cn-filters-row--individual">
                            <div className="cn-filter-field">
                                <label className="cn-filter-label">Alumno</label>
                                <select className="cn-filter-select">
                                    <option>Ruiz, Juan Carlos</option>
                                </select>
                            </div>
                            <div className="cn-filter-field">
                                <label className="cn-filter-label">Tipo</label>
                                <select className="cn-filter-select">
                                    <option>1°T</option>
                                </select>
                            </div>
                            <div className="cn-filter-field">
                                <CFormLabel htmlFor="nota" className="cn-filter-label">
                                    Nota <span className="cn-required">*</span>
                                </CFormLabel>
                                <CFormInput
                                    id="nota"
                                    name="nota"
                                    type="number"
                                    step="0.5"
                                    min="1.0"
                                    max="10.0"
                                    value={formData.nota}
                                    onChange={handleChange}
                                    placeholder="Ej: 8.5"
                                    className="cn-filter-select"
                                />
                            </div>
                        </div>
                    )}

                </div>
            </CCardHeader>

            {/* ── Cuerpo: planilla (estructura interna intacta) ── */}
            {!unitCharge && (
                <CCardBody className="cn-card-body">

                    <div className="border p-3 mx-auto" style={{ minWidth: '800px', backgroundColor: '#fff' }}>

                        {/* ENCABEZADO DE LA PLANILLA — sin modificar */}
                        <CRow className="mb-3 align-items-center">


                            <CCol xs={2} className="text-center">
                                <div 
                                    className="d-flex align-items-center justify-content-center" 
                                    style={{ width: '80px', height: '100px', margin: '0 auto' }}>
                                    <img
                                        src={escudoLogo}
                                        alt="Escudo Escuela"
                                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                    />
                                </div>
                            </CCol>

                     
                            <CCol xs={10}>
                                <h5 className="text-center fw-bold mb-3">PLANILLAS DE CALIFICACIONES - CL: {datosPlanilla.ciclo}</h5>
                                <div className="border">
                                    <CRow className="g-0 border-bottom">
                                        <CCol xs={6} className="p-1 border-end d-flex">
                                            <span className="fw-bold me-2">CURSO Y DIV.:</span>
                                            <span>{datosPlanilla.curso}</span>
                                        </CCol>
                                        <CCol xs={6} className="p-1 d-flex">
                                            <span className="fw-bold me-2">Turno</span>
                                            <span className="fst-italic">{datosPlanilla.turno}</span>
                                        </CCol>
                                    </CRow>
                                    <CRow className="g-0 border-bottom">
                                        <CCol xs={6} className="p-1 border-end d-flex">
                                            <span className="fw-bold me-2">ASIGNATURA:</span>
                                            <span>{datosPlanilla.materia}</span>
                                        </CCol>
                                        <CCol xs={6} className="p-1 d-flex align-items-center">
                                            <span className="fw-bold me-2">Fecha</span>
                                            {editandoFecha ? (
                                                <input
                                                    type="text"
                                                    value={fechaPlanilla}
                                                    autoFocus
                                                    onChange={(e) => setFechaPlanilla(e.target.value)}
                                                    onBlur={() => setEditandoFecha(false)}
                                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setEditandoFecha(false) }}
                                                    style={{ border: 'none', borderBottom: '1px solid #0369a1', outline: 'none', width: '6rem', fontSize: 'inherit', fontFamily: 'inherit', background: 'transparent' }}
                                                />
                                            ) : (
                                                <span
                                                    onClick={() => setEditandoFecha(true)}
                                                    style={{ cursor: 'pointer' }}
                                                    title="Clic para editar"
                                                >
                                                    {fechaPlanilla}
                                                </span>
                                            )}
                                        </CCol>
                                    </CRow>
                                    <CRow className="g-0">
                                        <CCol xs={12} className="p-1 d-flex align-items-center">
                                            <span className="fw-bold me-2">DOCENTE:</span>
                                            <span>{docentePlanilla || 'Sin especificar'}</span>
                                        </CCol>
                                    </CRow>
                                </div>
                            </CCol>
                        </CRow>

                        {/* TABLA DE NOTAS — sin modificar */}
                        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <EditableCellProvider>
                                <GenericTable table={table} />
                            </EditableCellProvider>
                        </div>

                    </div>

                </CCardBody>
            )}

        </CCard>
    )
}
