//  frontend_AcademiA\src\views\personal\Personal.jsx

import React, { useState, useEffect } from 'react'
import { CButton, CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CContainer } from '@coreui/react'
import { cilPlus, cilPeople } from '@coreui/icons'
import { CIcon } from '@coreui/icons-react'
import './Personal.css'
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table'

// Importar componentes reutilizables
import GenericTable from '../../components/usersTable/GenericTable.jsx'
import TablePagination from '../../components/tablePagination/TablePagination.jsx'
import AdvancedFilters from '../../components/advancedFilters/AdvancedFilters.jsx'
import TableActions from '../../components/tableActions/TableActions.jsx'
import ModalConfirmDel from '../../modals/ModalConfirmDel.jsx'
import ModalNewEdit from '../../modals/ModalNewEdit.jsx'

// Importar funciones API
import { getPersonalAll } from '../../api/apiPersonal.jsx'

// Importar configuración de columnas
import { getTableColumns } from '../../utils/columns.js'

// Estado inicial para filtros
const initialFilters = []

/**
 * Componente Docentes
 * Gestiona la visualización y administración de Personal (tbl_entidad donde id_tipo_entidad in (3, 4, 5, 6, 8, 9)
 */
export default function Personal() {

  // ---------- Estados principales ----------
  const [tableData, setTableData] = useState([])
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [columnFilters, setColumnFilters] = useState(initialFilters)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState([])

  // ---------- Estados para modales ----------
  const [deleteModalVisible, setDeleteModalVisible] = useState(false) // Modal de confirmación de eliminación
  const [docenteToDelete, setDocenteToDelete] = useState(null) // ID a eliminar
  const [editModalVisible, setEditModalVisible] = useState(false) // Modal de edición/creación
  const [docenteToEdit, setDocenteToEdit] = useState(null) // Datos a editar

  // ---------- Obtener listado del personal  al cargar el componente ----------
  useEffect(() => {
    const skip = pagination.pageIndex * pagination.pageSize
    const limit = pagination.pageSize
    getPersonalAll({ params: { skip, limit } })
      .then((res) => {
        const payload = res?.data
        const items = Array.isArray(payload) ? payload : (payload?.data ?? [])
        setTableData(items)
        setTotal(payload?.total ?? items.length)
      })
      .catch(console.error)
  }, [pagination.pageIndex, pagination.pageSize])



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



 // ==================== CONFIGURACIÓN ESPECÍFICA DE COLUMNAS  ====================

  const personalColumnsConfig = [
    { accessorKey: 'apellido', header: 'Apellido' },
    { accessorKey: 'nombre', header: 'Nombre' },
    { accessorKey: 'tipo_entidad', header: 'Cargo' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'domicilio', header: 'Domicilio' },
    { accessorKey: 'tel_cel', header: 'Tel/Cel' },
  ]

  // ==================== GENERACIÓN DE COLUMNAS CON FUNCIÓN REUTILIZABLE ====================

  const columns = getTableColumns(
    personalColumnsConfig,
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
      <CCard className="per-card mb-1">
        {/* ---------- ENCABEZADO ---------- */}
        <CCardHeader className="per-card-header">
          {/* Brand: ícono + título + subtítulo */}
          <div className="per-header-left">
            <div className="per-header-brand">
              <div className="per-header-brand-icon">
                <CIcon icon={cilPeople} className="per-brand-icon" />
              </div>
              <div>
                <h2 className="per-header-h2">Gestión de Personal</h2>
                <p className="per-header-sub">Administración del equipo institucional</p>
              </div>
            </div>
          </div>

          {/* Acciones: botón nuevo */}
          <div className="per-header-actions">
            <CButton
              className="per-btn-new"
              onClick={() => handleClickEditar('')}
            >
              <CIcon icon={cilPlus} />
              Nuevo Administrativo
            </CButton>
          </div>
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
        <CCardBody className="per-card-body">
          <GenericTable table={table} />
        </CCardBody>

        {/* ---------- PIE DE PÁGINA CON PAGINACIÓN ---------- */}
        <CCardFooter className="per-card-footer">
          <TablePagination table={table} />
        </CCardFooter>
      </CCard>

      {/* ---------- MODALES ---------- */}

      {/* Modal de edición/creación de personal */}
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
  )

}
