//  frontend_AcademiA\src\views\docentes\Docentes.jsx
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
import { getDocentes, createDocente, updateDocente, deleteDocente } from '../../api/api.js'

// Importar configuración de columnas
import { getTableColumns } from '../../utils/columns.js'

// Estado inicial para filtros
const initialFilters = []

/**
 * Componente Docentes
 * Gestiona la visualización y administración de docentes (tbl_entidad donde tipo_entidad = 'DOC')
 */
export default function Docentes() {

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

  // ---------- Obtener docentes al cargar el componente ----------
  useEffect(() => {
    fetchDocentes()
  }, [])

  /*
     * Obtiene la lista de docentes desde el backend
     * Esta función llama al endpoint /api/docentes que filtra por tipo_entidad = 'DOC'
  */

  const fetchDocentes = async () => {
    try {
      const response = await getDocentes()

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
  const handleDelete = async (id) => {
    try {
      await deleteDocente(id)
      // Actualizar la tabla removiendo el docente eliminado
      setTableData((prev) => prev.filter((docente) => docente.id !== id))
      setDeleteModalVisible(false)
      setDocenteToDelete(null)
      console.log(`Docente con ID ${id} eliminado`)
    } catch (error) {
      console.error('Error al eliminar docente:', error)
    }
  }

  // ---------- Abrir modal de confirmación de eliminación ----------
  const confirmDelete = (id) => {
    setDocenteToDelete(id)
    setDeleteModalVisible(true)
  }

  // ---------- Abrir modal de edición ----------
  const handleClickEditar = (docente) => {
    setDocenteToEdit(docente)
    setEditModalVisible(true)
  }

  // ---------- Guardar docente (crear o actualizar) ----------
  const handleSaveDocente = async (docenteData) => {
    try {
      if (docenteToEdit) {
        // Actualizar docente existente
        const response = await updateDocente(docenteToEdit.id, docenteData)
        setTableData((prev) =>
          prev.map((docente) => (docente.id === docenteToEdit.id ? response.data : docente))
        )
      } else {
        // Crear nuevo docente
        const response = await createDocente(docenteData)
        setTableData((prev) => [...prev, response.data])
      }
      setEditModalVisible(false)
      setDocenteToEdit(null)
    } catch (error) {
      console.error('Error al guardar docente:', error)
      alert(error.response?.data?.detail || 'Error al guardar docente')
    }
  }



 // ==================== CONFIGURACIÓN ESPECÍFICA DE COLUMNAS PARA DOCENTES ====================

  const docentesColumnsConfig = [
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'apellido', header: 'Apellido' },
    {
      accessorKey: 'fec_nac',
      header: 'Fecha Nac.',
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

  // ==================== GENERACIÓN DE COLUMNAS CON FUNCIÓN REUTILIZABLE ====================

  const columns = getTableColumns(
    docentesColumnsConfig,
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
      <h1 className="ms-1" >Docentes</h1>
      <CContainer>
        <CCard className="mb-1">
          {/* ---------- ENCABEZADO ---------- */}
          <CCardHeader className="py-2 bg-white">
            <CRow className="justify-content-between align-items-center">
              <CCol xs={12} sm="auto">
                <h4 id="titulo" className="mb-0">
                  Gestión de Docentes
                </h4>
                <div className="small text-body-secondary">
                  Administración de Docentel establecimiento
                </div>
              </CCol>

              {/* Botón para agregar nuevo Docente */}
              <CCol xs={12} sm="auto" className="text-md-end">
                <CButton
                  color="primary"
                  className="shadow-sm"
                  size="sm"
                  onClick={() => handleClickEditar('')} // Abrir modal vacío para crear nuevo
                >
                  <CIcon icon={cilPlus} className="me-1" />
                  Nuevo Docente
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
          onClose={() => {
            setEditModalVisible(false)
            setDocenteToEdit(null)
          }}
          title={docenteToEdit ? 'Editar Docente' : 'Nuevo Docente'}
          initialData={docenteToEdit || {}}
          onSave={handleSaveDocente}
          fields={[
            //{ name: 'name', label: 'Apellido y Nombre', type: 'text', required: true, placeholder: 'Ejemplo: Pérez Carlos' },
            // { name: 'name', label: 'Apellido y Nombre', type: 'text', required: true, placeholder: 'Ejemplo: Pérez Carlos' },
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
            setDocenteToDelete(null)
          }}
          onConfirm={handleDelete}
          userId={docenteToDelete}
        />
      </CContainer>
    </div>
  )

}
