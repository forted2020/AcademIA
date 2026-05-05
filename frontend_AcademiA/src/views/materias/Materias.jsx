//  frontend_AcademiA\src\views\materias\Materias.jsx
import React, { useState, useEffect } from 'react'
import { CButton, CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CContainer } from '@coreui/react'
import { cilPlus } from '@coreui/icons'
import { CIcon } from '@coreui/icons-react'
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
    const [tableData, setTableData] = useState([]) // Datos de la tabla de docentes
    const [searchTerm, setSearchTerm] = useState('') // Búsqueda global
    const [columnFilters, setColumnFilters] = useState(initialFilters) // Filtros por columna
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 }) // Paginación
    const [sorting, setSorting] = useState([]) // Ordenamiento

    // ---------- Estados para modales ----------
    const [deleteModalVisible, setDeleteModalVisible] = useState(false) // Modal de confirmación de eliminación
    const [docenteToDelete, setDocenteToDelete] = useState(null) // ID del docente a eliminar
    const [editModalVisible, setEditModalVisible] = useState(false) // Modal de edición/creación
    const [docenteToEdit, setDocenteToEdit] = useState(null) // Datos del docente a editar

    // Función auxiliar para obtener la fecha actual en formato YYYY-MM-DD
    const getTodayDate = () => new Date().toISOString().split('T')[0];

    // ---------- Obtener docentes al cargar el componente ----------
    useEffect(() => {
        fetchMaterias()
    }, [])


    // Obtiene la lista de docentes desde el backend, llamando al endpoint /api/docentes que filtra por tipo_entidad = 'DOC'

    const fetchMaterias = async () => {
        try {
            const response = await getMateriasTabla()

            const { data } = response;

            if (Array.isArray(data)) {
                setTableData(data)
            } else {
                console.error('El formato de datos no es un array:', data);
                setTableData([]);
            }
        } catch (error) {
            console.error('Error al obtener docentes:', error)
            if (error.response) {
                console.error('Detalles del error:', error.response.data);
                console.error('Status:', error.response.status);
            }
        }
    }



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
        state: {
            pagination,
            sorting,
            globalFilter: searchTerm,
            columnFilters,
        },
    })

    return (
        <div style={{ padding: '10px' }}>
            <h1 className="ms-1" >Materias</h1>
            <CContainer>
                <CCard className="mb-1">
                    {/* ---------- ENCABEZADO ---------- */}
                    <CCardHeader className="py-2 bg-white">
                        <CRow className="justify-content-between align-items-center">
                            <CCol xs={12} sm="auto">
                                <h4 id="titulo" className="mb-0">
                                    Gestión de Materias
                                </h4>
                                <div className="small text-body-secondary">
                                    Administración de Materias
                                </div>
                            </CCol>

                            {/* Botón para agregar nuevo Docente */}
                            <CCol xs={12} sm="auto" className="text-md-end">
                                <CButton
                                    color="primary"
                                    className="shadow-sm"
                                    size="sm"
                                    onClick={() => {
                                        setDocenteToEdit(null); // Aseguramos que está limpio
                                        setEditModalVisible(true);
                                    }}
                                >
                                    <CIcon icon={cilPlus} className="me-1" />
                                    Nuevo
                                </CButton>
                            </CCol>
                        </CRow>
                    </CCardHeader>

                    {/* ---------- FILTROS AVANZADOS Y BÚSQUEDA GLOBAL ---------- */}
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

                    {/* ---------- ACCIONES DE TABLA (Exportar, etc.) ---------- */}
                    <TableActions table={table} />

                    {/* ---------- CUERPO DE LA TABLA ---------- */}
                    <CCardBody className="px-4 pt-1 pb-2 border border-light">
                        {/* Tabla de docentes (reutiliza el componente GenericTable) */}
                        <GenericTable table={table} />
                    </CCardBody>

                    {/* ---------- PIE DE PÁGINA CON PAGINACIÓN ---------- */}
                    <CCardFooter
                        className="bg-white border-top px-3 py-1"
                        style={{
                            position: 'sticky',
                            bottom: 0,
                            zIndex: 1,
                            boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
                        }}
                    >
                        <TablePagination table={table} />
                    </CCardFooter>
                </CCard>

                {/* ---------- MODALES ---------- */}

                {/* Modal de edición/creación de docente */}
                <ModalNewEdit
                    visible={editModalVisible}
                    onClose={handleCloseModal}
                    title={docenteToEdit ? 'Editar Docente' : 'Nuevo Docente'}
                    // Si docenteToEdit es null (nuevo), creamos un objeto con la fecha de hoy
                    initialData={docenteToEdit ? docenteToEdit : { created_at: getTodayDate() }}
                    onSave={handleSaveDocente}
                    fields={docenteFields} // <-- Usa la constante de configuración
                />

                {/* Modal de confirmación de eliminación. Se activa al presional el tacho de basura  */}
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
        </div >
    )

}
