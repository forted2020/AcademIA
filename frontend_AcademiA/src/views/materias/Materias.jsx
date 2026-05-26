//  frontend_AcademiA\src\views\materias\Materias.jsx
import React, { useState, useEffect } from 'react'
import { CContainer } from '@coreui/react'
import { cilPlus, cilDescription } from '@coreui/icons'
import { CIcon } from '@coreui/icons-react'
import './Materias.css'
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table'

// Importar componentes reutilizables
import GenericTable from '../../components/usersTable/GenericTable.jsx'
import TablePagination from '../../components/tablePagination/TablePagination.jsx'
import AdvancedFilters from '../../components/advancedFilters/AdvancedFilters.jsx'
import TableActions from '../../components/tableActions/TableActions.jsx'
import ModalConfirmDel from '../../modals/ModalConfirmDel.jsx'
import ModalNewEdit from '../../modals/ModalNewEdit.jsx'

// Importar funciones API para Docentes
import { getMateriasTabla } from '../../api/apiMaterias.jsx'

// Importar configuración de columnas
import { getTableColumns } from '../../utils/columns.js'

// Importar datos de configuracion de modal
import { docenteFields } from '../../utils/FormConfigs/formConfigs.js'

// Estado inicial para filtros
const initialFilters = []

export default function Materias() {

    //# Maneja la lógica de la modal de edición
    const handleCloseModal = () => {
        setEditModalVisible(false);
        setDocenteToEdit(null);
    };



    // ---------- Estados principales ----------
    const [tableData, setTableData] = useState([])
    const [total, setTotal] = useState(0)
    const [searchTerm, setSearchTerm] = useState('')
    const [columnFilters, setColumnFilters] = useState(initialFilters)
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
    const [sorting, setSorting] = useState([])

    // ---------- Estados para modales ----------
    const [deleteModalVisible, setDeleteModalVisible] = useState(false) // Modal de confirmación de eliminación
    const [docenteToDelete, setDocenteToDelete] = useState(null) // ID del docente a eliminar
    const [editModalVisible, setEditModalVisible] = useState(false) // Modal de edición/creación
    const [docenteToEdit, setDocenteToEdit] = useState(null) // Datos del docente a editar

    // Función auxiliar para obtener la fecha actual en formato YYYY-MM-DD
    const getTodayDate = () => new Date().toISOString().split('T')[0];

    // ---------- Obtener docentes al cargar el componente ----------
    useEffect(() => {
        const skip = pagination.pageIndex * pagination.pageSize
        const limit = pagination.pageSize
        getMateriasTabla({ params: { skip, limit } })
            .then((res) => {
                const payload = res?.data
                const items = Array.isArray(payload) ? payload : (payload?.data ?? [])
                setTableData(items)
                setTotal(payload?.total ?? items.length)
            })
            .catch(console.error)
    }, [pagination.pageIndex, pagination.pageSize])



    // ---------- Eliminar docentes ----------
    const handleDelete = async () => {
        // Verificamos que haya un docente seleccionado en el estado
        if (!docenteToDelete) return;
        // Extraemos el ID del objeto guardado
        const id = docenteToDelete.id;
        console.log(`Docente a eliminar: ${docenteToDelete.nombre}`)
        try {
            // Llamada a la API
            await deleteDocente(id)
            // Actualizar la tabla removiendo el docente eliminado
            //setTableData((prev) => prev.filter((docente) => docente.id !== id))
            setTableData((prev) => prev.filter((doc) => doc.id !== docenteToDelete.id))
            // Limpiar
            setDocenteToDelete(null)
            // Indicamos éxito a la modal
            console.log(`Docente ${docenteToDelete.nombre} eliminado`)
            return true
        } catch (error) {
            console.error('Error al eliminar docente:', error)
            // Lanzamos el error para que la modal no pase a fase "éxito"
            throw error
        }
    }

    // ---------- Abrir modal de confirmación de eliminación ----------
    const confirmDelete = (docente) => {
        console.log("Docente capturado para eliminar:", docente)

        setDocenteToDelete(docente)
        setDeleteModalVisible(true)
    }

    // ---------- Abrir modal de edición ----------
    const handleClickEditar = (docente) => {
        setDocenteToEdit(docente)
        setEditModalVisible(true)
    }

    // ---------- Guardar docente (crear o actualizar) ----------
    const handleSaveDocente = async (docenteData) => {

        console.log('🟡 handleSaveDocente ejecutado en Docentes.jsx')
        console.log('📦 docenteData recibida:', docenteData)
        console.log('🔍 docenteToEdit:', docenteToEdit)

        try {
            if (docenteToEdit) {
                console.log('✏️ Modo: EDITAR docente ID:', docenteToEdit.id)
                // Actualizar docente existente
                const response = await updateDocente(docenteToEdit.id, docenteData)

                // Validamos que la respuesta traiga datos
                const updatedDocente = response?.data;
                if (!updatedDocente) throw new Error("La API no devolvió el objeto actualizado");

                setTableData((prev) =>
                    prev.map((docente) => (docente.id === docenteToEdit.id ? response.data : docente))
                )
                console.log("Docente actualizado con éxito");

            } else {
                console.log('➕ Modo: CREAR nuevo docente')
                // Crear nuevo docente
                const response = await createDocente(docenteData)

                const newDocente = response?.data;
                if (!newDocente) throw new Error("La API no devolvió el objeto creado");

                setTableData((prev) => [...prev, response.data])

                console.log("Docente creado con éxito");

            }
            // Al retornar true, la ModalNewEdit pone showSuccess en true.
            return true;

        } catch (error) {
            console.error('❌ Error al guardar docente:', error)
            throw error; // Es importante lanzarlo por si se quiere  manejar errores en la modal
        }
    }

    // ==================== CONFIGURACIÓN ESPECÍFICA DE COLUMNAS PARA MATERIAS ====================

    const materiasColumnsConfig = [
        { accessorKey: 'nombre.nombre_materia', header: 'Materia' },
        { accessorKey: 'curso.curso', header: 'Curso' },

        {
            accessorKey: 'curso.ciclo.nombre_ciclo_lectivo', header: 'Ciclo Lectivo', 
            meta: { className: 'text-center' },
        },
        { accessorKey: 'curso.ciclo.plan.nombre_plan', header: 'Plan' },
        { accessorKey: 'docente_nombre_completo', header: 'Docente' },
    ]

    // ==================== GENERACIÓN DE COLUMNAS CON FUNCIÓN REUTILIZABLE ====================

    const columns = getTableColumns(
        materiasColumnsConfig,
        confirmDelete,
        handleClickEditar
    )

    // ---------- Configuración de TanStack Table ----------
    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setSearchTerm,
        onColumnFiltersChange: setColumnFilters,
        manualPagination: true,
        rowCount: total,
        state: {
            pagination,
            sorting,
            globalFilter: searchTerm,
            columnFilters,
        },
    })

    return (
        <CContainer fluid className="py-3">

            {/* ── Card principal ─────────────────────────────────── */}
            <div className="mat-card mb-1">

                {/* ── Encabezado ──────────────────────────────────── */}
                <div className="mat-card-header">

                    {/* Columna izquierda: brand */}
                    <div className="mat-header-left">
                        <div className="mat-header-brand">
                            <div className="mat-header-brand-icon">
                                <CIcon icon={cilDescription} className="mat-brand-icon" />
                            </div>
                            <div>
                                <h2 className="mat-header-h2">Gestión de Materias</h2>
                                <p className="mat-header-sub">Configuración del plan académico</p>
                            </div>
                        </div>
                    </div>

                    {/* Columna derecha: botón nuevo */}
                    <div className="mat-header-actions">
                        <button
                            className="mat-btn-new"
                            onClick={() => {
                                setDocenteToEdit(null); // Aseguramos que está limpio antes de abrir
                                setEditModalVisible(true);
                            }}
                        >
                            <CIcon icon={cilPlus} style={{ width: '0.85rem', height: '0.85rem' }} />
                            Nueva Materia
                        </button>
                    </div>

                </div>
                {/* ── /Encabezado ─────────────────────────────────── */}

                {/* Filtros avanzados y barra de acciones de tabla */}
                <AdvancedFilters
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    columnFilters={columnFilters}
                    setColumnFilters={setColumnFilters}
                    filterOptions={[
                        { value: 'nombre', label: 'Nombre' },
                        { value: 'apellido', label: 'Apellido' },
                        { value: 'email', label: 'Email' },
                        { value: 'domicilio', label: 'Domicilio' },
                        { value: 'telefono', label: 'Teléfono' },
                    ]}
                />

                <TableActions table={table} />

                {/* ── Cuerpo ──────────────────────────────────────── */}
                <div className="mat-card-body">
                    <GenericTable table={table} />
                </div>
                {/* ── /Cuerpo ─────────────────────────────────────── */}

                {/* ── Footer sticky con paginación ────────────────── */}
                <div className="mat-card-footer">
                    <TablePagination table={table} />
                </div>

            </div>
            {/* ── /Card principal ─────────────────────────────────── */}

            {/* ── Modales ─────────────────────────────────────────── */}

            {/* Modal de edición/creación de docente.
                Si docenteToEdit es null (nuevo), crea un objeto con la fecha de hoy. */}
            <ModalNewEdit
                visible={editModalVisible}
                onClose={handleCloseModal}
                title={docenteToEdit ? 'Editar Docente' : 'Nuevo Docente'}
                initialData={docenteToEdit ? docenteToEdit : { created_at: getTodayDate() }}
                onSave={handleSaveDocente}
                fields={docenteFields}
            />

            {/* Modal de confirmación de eliminación */}
            <ModalConfirmDel
                visible={deleteModalVisible}
                docente={docenteToDelete}
                onConfirm={handleDelete}
                onClose={() => {
                    setDeleteModalVisible(false)
                    setDocenteToDelete(null)
                }}
            />

        </CContainer>
    )

}
