//  frontend_AcademiA\src\views\personal\Personal.jsx

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
  const [tableData, setTableData] = useState([]) // Datos de la tabla de personal
  const [searchTerm, setSearchTerm] = useState('') // Búsqueda global
  const [columnFilters, setColumnFilters] = useState(initialFilters) // Filtros por columna
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 }) // Paginación
  const [sorting, setSorting] = useState([]) // Ordenamiento

  // ---------- Estados para modales ----------
  const [deleteModalVisible, setDeleteModalVisible] = useState(false) // Modal de confirmación de eliminación
  const [docenteToDelete, setDocenteToDelete] = useState(null) // ID a eliminar
  const [editModalVisible, setEditModalVisible] = useState(false) // Modal de edición/creación
  const [docenteToEdit, setDocenteToEdit] = useState(null) // Datos a editar

  // ---------- Obtener listado del personal  al cargar el componente ----------
  useEffect(() => {
    fetchPersonal()
  }, [])

// Obtiene la lista. Llama al endpoint /api/personal que filtra por tipos de entidad

  const fetchPersonal = async () => {
    try {
      const response = await getPersonalAll()

      const { data } = response;

      if (Array.isArray(data)) {
        setTableData(data)
      } else {
        console.error('El formato de datos no es un array:', data);
        setTableData([]);
      }
    } catch (error) {
      console.error('Error al obtener Personal:', error)
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
    state: {
      pagination,
      sorting,
      globalFilter: searchTerm,
      columnFilters,
    },
  })

  return (
    <div style={{ padding: '10px' }}>
      <h1 className="ms-1" >Personal</h1>
      <CContainer>
        <CCard className="mb-1">
          {/* ---------- ENCABEZADO ---------- */}
          <CCardHeader className="py-2 bg-white">
            <CRow className="justify-content-between align-items-center">
              <CCol xs={12} sm="auto">
                <h4 id="titulo" className="mb-0">
                  Gestión de Personal Administrativo
                </h4>
                <div className="small text-body-secondary">
                  Administración del Personal del establecimiento
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
                  Nuevo Administrativo
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
