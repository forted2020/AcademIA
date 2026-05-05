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
// import { getEstudiantes, createEstudiante, updateEstudiante, deleteEstudiante } from '../../api/apiEstudiantes.js'
import apiEstudiantes from '../../api/apiEstudiantes.js'

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
            const response = await apiEstudiantes.getAll()


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

        <div style={{ padding: '10px' }}>
            <h1 className="ms-1" >Estudiantes</h1>
            <CContainer className="Contenedor Principal" >
                CContainer Principal

                {/* --------- CCard que envuelve todo el contenido del Contenedor Principal --------- */}
                <CCard className="mb-1">
                    CCard Principal

                    {/* --------- Encabezado del CCard --------- */}
                    <CCardHeader className="py-2 bg-white">
                        Encabezado CCard Principal
                    </CCardHeader>

                    {/* ---------- CUERPO DE LA TABLA ---------- */}
                    <CCardBody className="px-4 pt-1 pb-2 border border-light">
                        CCard Body
                        <p />
                        <p />
                        <p />
                        <p />
                        Fin CCard Body
                    </CCardBody>

                    {/* ---------- PIE DE PÁGINA ---------- */}
                    <CCardFooter
                        className="bg-white border-top px-3 py-1 color=red"
                        style={{
                            position: 'sticky',
                            bottom: 0,
                            zIndex: 1,
                            boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
                        }}
                    >
                        <p > CCard Footer </p>

                        Fin CCard Footer
                    </CCardFooter>
                    <p />
                    Fin CCard Principal
                </CCard>

                Fin CContainer Principal
            </CContainer>
        </div>)
}
