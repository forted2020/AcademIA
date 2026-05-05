//  frontend_AcademiA\src\views\cursos\Curso.jsx

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
import GlobalSearch from '../../components/globalSearch/GlobalSearch.jsx'

// Importar funciones API para Cursoss
import apiCursos from '../../api/apiCursos.jsx'

//  Importar hook para obtener datos de los cursos
import { useCursosCompletoData } from '../../hooks/useCursosCompleto.js'

// Importar configuración de columnas
import { getTableColumns } from '../../utils/columns.js'

// Estado inicial para filtros
const initialFilters = []

export default function Curso() {

    // Traemos los datos de los cursos mediante el hook y los desestructuramos
    const {
        cursosCompletoData: tableData,
        setCursosCompletoData: setTableData,
        loading
    } = useCursosCompletoData()


    // ---------- Estados principales ----------
    const [searchTerm, setSearchTerm] = useState('') // Búsqueda global
    const [columnFilters, setColumnFilters] = useState(initialFilters) // Filtros por columna
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 }) // Paginación
    const [sorting, setSorting] = useState([]) // Ordenamiento

    // ---------- Estados para modales ----------
    const [deleteModalVisible, setDeleteModalVisible] = useState(false) // Modal de confirmación de eliminación
    const [cursoToDelete, setCursoToDelete] = useState(null) // ID del curso a eliminar
    const [editModalVisible, setEditModalVisible] = useState(false) // Modal de edición/creación
    const [cursoToEdit, setCursoToEdit] = useState(null) // Datos del curso a editar



    // ---------- Abrir modal de confirmación de eliminación ----------
    const confirmDelete = (id) => {
        setCursoToDelete(id)
        setDeleteModalVisible(true)
    }

    // ---------- Abrir modal de edición ----------
    const handleClickEditar = (curso) => {
        setCursoToEdit(cursos)
        setEditModalVisible(true)
    }

    const cursoColumnsConfig = [
        { accessorKey: 'curso', header: 'Curso' },
        { accessorKey: 'ciclo.nombre_ciclo_lectivo', header: 'Ciclo lectivo'},
        { accessorKey: 'ciclo.plan.nombre_plan', header: 'Plan de Estudios' },
    ]

    // ==================== GENERACIÓN DE COLUMNAS FINALES CON LA FUNCIÓN REUTILIZABLE ====================

    const columns = getTableColumns(
        cursoColumnsConfig,
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
            <h1 className="ms-1" >Cursos</h1>

            <CContainer>

                <CCard className="mb-1" >       {/* Contenedor que actúa como cuerpo de la tarjeta CCard. Envuelve todo el contenido*/}

                    {/* ----------  HEAD --------------- */}
                    <CCardHeader className="py-2 bg-white ">
                        <CRow className="justify-content-between align-items-center " > {/* Fila en la grilla.*/}
                            <CCol xs={12} sm="auto">    {/* Columna dentro de fila. Ocupa 5 de 12 unidades disponibles. Hereda gutter de CRow*/}
                                <h4 id="titulo" className="mb-0 ">
                                    Administración de Cursos
                                </h4>
                                <div className="small text-body-secondary"> Administradores del sistema</div>
                            </CCol>
                        </CRow>
                    </CCardHeader>
                    {/* ----------  /HEAD --------------- */}


                    {/* ----------  BODY --------------- */}
                    <CCardBody className="px-34 pt-1 pb-2 border border-light">
                        < div className="d-flex justify-content-between align-items-center w-100 pe-2">

                            {/* ----------  BÚSQUEDA GLOBAL ---------- */}
                            <GlobalSearch
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                            />

                            {/* ---------- ACCIONES DE TABLA (Exportar, etc.) ---------- */}
                            <TableActions table={table} />
                        </div>
                        {/* Tabla de Cursos */}
                        <GenericTable table={table} />

                    </CCardBody>

                    {/* ----------  /BODY --------------- */}


                    {/* ----------  FOOTER --------------- */}
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



            </CContainer >

        </div >

    )


}