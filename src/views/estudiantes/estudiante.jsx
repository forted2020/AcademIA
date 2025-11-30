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

// Importar funciones API para estudiantes
import { getEstudiantes, createEstudiante, updateEstudiante, deleteEstudiante } from '../../api/api.js'

// Importar configuración de columnas (reutilizamos la función de usuarios)
import { getEstudiantesColumns } from '../../utils/columns'

// Estado inicial para filtros
const initialFilters = []

/**
 * Componente Estudiante
 * Gestiona la visualización y administración de estudiantes (tbl_entidad donde tipo_entidad = 'ALU')
 * Reutiliza la misma estructura y componentes de la gestión de usuarios
 */
export default function Estudiante() {
    // ---------- Estados principales ----------
    const [tableData, setTableData] = useState([]) // Datos de la tabla de estudiantes
    const [searchTerm, setSearchTerm] = useState('') // Búsqueda global
    const [columnFilters, setColumnFilters] = useState(initialFilters) // Filtros por columna
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 }) // Paginación
    const [sorting, setSorting] = useState([]) // Ordenamiento

    // ---------- Estados para modales ----------
    const [deleteModalVisible, setDeleteModalVisible] = useState(false) // Modal de confirmación de eliminación
    const [studentToDelete, setStudentToDelete] = useState(null) // ID del estudiante a eliminar
    const [editModalVisible, setEditModalVisible] = useState(false) // Modal de edición/creación
    const [studentToEdit, setStudentToEdit] = useState(null) // Datos del estudiante a editar

    // ---------- Obtener estudiantes al cargar el componente ----------
    useEffect(() => {
        fetchEstudiantes()
    }, [])

    /**
     * Obtiene la lista de estudiantes desde el backend
     * Esta función llama al endpoint /api/estudiantes que filtra por tipo_entidad = 'ALU'
     */
    const fetchEstudiantes = async () => {
        try {
            const response = await getEstudiantes()

            //  Puntos de visualizacion de datos en consola para detectar errores
            // 1. Ver toda la respuesta completa del backend
            console.log('Respuesta completa del backend:', response)

            // 2. Ver solo el cuerpo (lo más importante)
            console.log('Datos recibidos (response.data):', response.data)


            const { data } = response;

            if (Array.isArray(data)) {
                setTableData(data)
            } else {
                console.error('El formato de datos no es un array:', data);
                setTableData([]);
            }
        } catch (error) {
            console.error('Error al obtener estudiantes:', error)
            if (error.response) {
                console.error('Detalles del error:', error.response.data);
                console.error('Status:', error.response.status);
            }
        }
    }

    // ---------- Eliminar estudiante ----------
    const handleDelete = async (id) => {
        try {
            await deleteEstudiante(id)
            // Actualizar la tabla removiendo el estudiante eliminado
            setTableData((prev) => prev.filter((student) => student.id !== id))
            setDeleteModalVisible(false)
            setStudentToDelete(null)
            console.log(`Estudiante con ID ${id} eliminado`)
        } catch (error) {
            console.error('Error al eliminar estudiante:', error)
        }
    }

    // ---------- Abrir modal de confirmación de eliminación ----------
    const confirmDelete = (id) => {
        setStudentToDelete(id)
        setDeleteModalVisible(true)
    }

    // ---------- Abrir modal de edición ----------
    const handleClickEditar = (student) => {
        setStudentToEdit(student)
        setEditModalVisible(true)
    }

    // ---------- Guardar estudiante (crear o actualizar) ----------
    const handleSaveStudent = async (studentData) => {
        try {
            if (studentToEdit) {
                // Actualizar estudiante existente
                const response = await updateEstudiante(studentToEdit.id, studentData)
                setTableData((prev) =>
                    prev.map((student) => (student.id === studentToEdit.id ? response.data : student))
                )
            } else {
                // Crear nuevo estudiante
                const response = await createEstudiante(studentData)
                setTableData((prev) => [...prev, response.data])
            }
            setEditModalVisible(false)
            setStudentToEdit(null)
        } catch (error) {
            console.error('Error al guardar estudiante:', error)
            alert(error.response?.data?.detail || 'Error al guardar estudiante')
        }
    }

    // ---------- Configuración de columnas ----------
    // Usamos la configuración específica para estudiantes
    const columns = getEstudiantesColumns(confirmDelete, handleClickEditar)

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
        <CContainer>
            <CCard className="mb-1">
                {/* ---------- ENCABEZADO ---------- */}
                <CCardHeader className="py-2 bg-white">
                    <CRow className="justify-content-between align-items-center">
                        <CCol xs={12} sm="auto">
                            <h4 id="titulo" className="mb-0">
                                Gestión de Estudiantes
                            </h4>
                            <div className="small text-body-secondary">
                                Administración de alumnos del establecimiento
                            </div>
                        </CCol>

                        {/* Botón para agregar nuevo estudiante */}
                        <CCol xs={12} sm="auto" className="text-md-end">
                            <CButton
                                color="primary"
                                className="shadow-sm"
                                size="sm"
                                onClick={() => handleClickEditar('')} // Abrir modal vacío para crear nuevo
                            >
                                <CIcon icon={cilPlus} className="me-1" />
                                Nuevo Estudiante
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
                    {/* Tabla de estudiantes (reutiliza el componente GenericTable) */}
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

            {/* Modal de edición/creación de estudiante */}
            <ModalNewEdit
                visible={editModalVisible}
                onClose={() => {
                    setEditModalVisible(false)
                    setStudentToEdit(null)
                }}
                title={studentToEdit ? 'Editar Estudiante' : 'Nuevo Estudiante'}
                initialData={studentToEdit || {}}
                onSave={handleSaveStudent}
                fields={[
                    //{ name: 'name', label: 'Apellido y Nombre', type: 'text', required: true, placeholder: 'Ejemplo: Pérez Carlos' },
                    { name: 'name', label: 'Apellido y Nombre', type: 'text', required: true, placeholder: 'Ejemplo: Pérez Carlos' },
                    { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Ejemplo: Carlos' },
                    { name: 'apellido', label: 'Apellido', type: 'text', required: true, placeholder: 'Ejemplo: Pérez' },
                    { name: 'email', label: 'Email', type: 'email', required: false, placeholder: 'ejemplo@mail.com' },
                    { name: 'fec_nac', label: 'Fecha de Nacimiento', type: 'date', required: false },
                    { name: 'domicilio', label: 'Domicilio', type: 'text', required: false, placeholder: 'Calle 123' },
                    { name: 'telefono', label: 'Teléfono', type: 'tel', required: false, placeholder: '1234567890' },
                    { name: 'password', label: 'Contraseña', type: 'password', required: false, placeholder: 'Solo si se crea usuario', fullWidth: true },
                ]}
            />

            {/* Modal de confirmación de eliminación */}
            <ModalConfirmDel
                visible={deleteModalVisible}
                onClose={() => {
                    setDeleteModalVisible(false)
                    setStudentToDelete(null)
                }}
                onConfirm={handleDelete}
                userId={studentToDelete}
            />
        </CContainer>
    )
}
