//  frontend_AcademiA\src\views\estudiantes\Estudiantes.jsx

import React, { useState, useEffect, } from 'react'
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
import apiEstudiantes from '../../api/apiEstudiantes.js'

//  Importar hook para obtener datos de los estudiantes
import { useStudentsData } from '../../hooks/useStudentsData.js'

// Importar configuración de columnas
import { getTableColumns } from '../../utils/columns.js'


// Estado inicial para filtros
const initialFilters = []

/**
 * Componente Estudiante
 * Gestiona la visualización y administración de estudiantes (tbl_entidad donde tipo_entidad = 'ALU')
 */
export default function Estudiante() {

    // Usamos el hook para traer datos y los desestructuramos
    const {
        studentsData: tableData,
        setStudentsData: setTableData,
        loading
    } = useStudentsData()


    // ---------- Estados principales ----------
    const [searchTerm, setSearchTerm] = useState('') // Búsqueda global
    const [columnFilters, setColumnFilters] = useState(initialFilters) // Filtros por columna
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 }) // Paginación
    const [sorting, setSorting] = useState([]) // Ordenamiento

    // ---------- Estados para modales ----------
    const [deleteModalVisible, setDeleteModalVisible] = useState(false) // Modal de confirmación de eliminación
    const [studentToDelete, setStudentToDelete] = useState(null) // ID del estudiante a eliminar
    const [editModalVisible, setEditModalVisible] = useState(false) // Modal de edición/creación
    const [studentToEdit, setStudentToEdit] = useState(null) // Datos del estudiante a editar


    // ---------- Eliminar estudiante ----------
    const handleDelete = async (id) => {
        try {
            await apiEstudiantes.remove(id)
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
                const response = await apiEstudiantes.update(studentToEdit.id, studentData)

                setTableData((prev) =>
                    prev.map((student) => (student.id === studentToEdit.id ? response.data : student))
                )
            } else {
                // Crear nuevo estudiante
                const response = await apiEstudiantes.create(studentData)
                setTableData((prev) => [...prev, response.data])
            }
            setEditModalVisible(false)
            setStudentToEdit(null)
        } catch (error) {
            console.error('Error al guardar estudiante:', error)
            alert(error.response?.data?.detail || 'Error al guardar estudiante')
        }
    }

    const estudiantesColumnsConfig = [
        { accessorKey: 'nombre', header: 'Nombre' },
        { accessorKey: 'apellido', header: 'Apellido' },
        {
            accessorKey: 'fec_nac',
            header: 'Fecha Nac.',
            // Formateamos la fecha del formato YYYY-MM-DD a DD/MM/YYYY
            cell: (info) => {
                const dateValue = info.getValue()
                if (!dateValue) return '-'
                const [year, month, day] = dateValue.split('-')
                return `${day}/${month}/${year}`
            },
        },
        { accessorKey: 'email', header: 'Email' },
        { accessorKey: 'domicilio', header: 'Domicilio' },
        { accessorKey: 'telefono', header: 'Teléfono' },
    ]

    // ==================== GENERACIÓN DE COLUMNAS FINALES CON LA FUNCIÓN REUTILIZABLE ====================

    const columns = getTableColumns(
        estudiantesColumnsConfig,
        confirmDelete,      // para el botón borrar
        handleClickEditar   // para el botón editar
    )


    // ---------- Configuración de TanStack Table ----------
    const table = useReactTable({
        data: tableData || [], // Por seguridad, por si los datos son nulos
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
            <h1 className="ms-1" >Estudiantes</h1>
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



                    {/* ---------- CUERPO ---------- */}
                    <CCardBody className="px-4 pt-1 pb-2 border border-light">

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

                        {/* Tabla de estudiantes */}
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
                        { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Ejemplo: Carlos' },
                        { name: 'apellido', label: 'Apellido', type: 'text', required: true, placeholder: 'Ejemplo: Pérez' },
                        { name: 'email', label: 'Email', type: 'email', required: false, placeholder: 'ejemplo@mail.com' },
                        { name: 'fec_nac', label: 'Fecha de Nacimiento', type: 'date', required: false },
                        { name: 'domicilio', label: 'Domicilio', type: 'text', required: false, placeholder: 'Calle 123' },
                        { name: 'telefono', label: 'Teléfono', type: 'tel', required: false, placeholder: '1234567890' },
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
        </div>)
}
