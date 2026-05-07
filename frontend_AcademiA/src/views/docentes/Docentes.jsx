// frontend_AcademiA/src/views/docentes/Docentes.jsx

import React, { useState, useEffect, useMemo } from 'react'
import {
  CButton, CCard, CCardHeader, CCardBody, CCardFooter,
  CCol, CRow, CContainer, CSpinner,
} from '@coreui/react'
import { cilPlus, cilSchool, cilSearch, cilPrint, cilCloudDownload } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  useReactTable, getCoreRowModel, getPaginationRowModel,
  getSortedRowModel, getFilteredRowModel,
} from '@tanstack/react-table'

import { useCrudModalManager } from '../../hooks/UseCrudModalManager/useCrudModalManager.js'
import { getTableColumns } from '../../utils/columns'
import { formatDisplayDate, getTodayDate } from '../../utils/dateUtils/DateUtils.js'
import { getDocentes, createDocente, updateDocente, deleteDocente } from '../../api/api.js'
import { docenteFields } from '../../utils/FormConfigs/formConfigs.js'

import GenericTable from '../../components/usersTable/GenericTable.jsx'
import TablePagination from '../../components/tablePagination/TablePagination.jsx'
import { generateTablePDF } from '../../components/tableActions/PDFService'
import ModalConfirmDel from '../../modals/ModalConfirmDel.jsx'
import ModalNewEdit from '../../modals/ModalNewEdit.jsx'

import './Docentes.css'

export default function Docentes() {
  const [tableData, setTableData]     = useState([])
  const [total, setTotal]             = useState(0)
  const [searchTerm, setSearchTerm]   = useState('')
  const [pagination, setPagination]   = useState({ pageIndex: 0, pageSize: 10 })
  const [isGenerating, setIsGenerating] = useState(false)

  const {
    editModal, deleteModal,
    openEdit, closeEdit,
    openDelete, closeDelete,
    handleSave, handleDelete,
  } = useCrudModalManager({
    createApi: createDocente,
    updateApi: updateDocente,
    deleteApi: deleteDocente,
    setData: setTableData,
  })

  const columns = useMemo(() => getTableColumns(
    [
      { accessorKey: 'apellido', header: 'Apellido' },
      { accessorKey: 'nombre',   header: 'Nombre' },
      {
        accessorKey: 'fec_nac',
        header: 'Fecha Nac.',
        cell: (info) => formatDisplayDate(info.getValue()),
      },
      { accessorKey: 'email',   header: 'Email' },
      { accessorKey: 'tel_cel', header: 'Tel/Cel' },
    ],
    openDelete,
    openEdit,
  ), [])

  // Fetch server-side
  useEffect(() => {
    const skip  = pagination.pageIndex * pagination.pageSize
    const limit = pagination.pageSize
    getDocentes({ params: { skip, limit } })
      .then((res) => {
        const payload = res?.data
        const items   = Array.isArray(payload) ? payload : (payload?.data ?? [])
        setTableData(items)
        setTotal(payload?.total ?? items.length)
      })
      .catch(console.error)
  }, [pagination.pageIndex, pagination.pageSize])

  const table = useReactTable({
    data: tableData,
    columns,
    getRowId: (row) => row.id_entidad,
    state: { globalFilter: searchTerm, pagination },
    onGlobalFilterChange: setSearchTerm,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    rowCount: total,
  })

  const handlePDF = async (download = false) => {
    setIsGenerating(true)
    const blob = await generateTablePDF({ table, title: 'Listado de Docentes', download })
    if (!download && blob) {
      const url = URL.createObjectURL(blob)
      const w = window.open(url, '_blank')
      if (w) w.onload = () => { w.print(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
    }
    setIsGenerating(false)
  }

  return (
    <CContainer fluid className="py-3">

      <h1>Docentes</h1>

      <CCard className="shadow-sm">

        {/* ── Encabezado ── */}
        <CCardHeader className="py-2 bg-white">
          <CRow className="justify-content-between align-items-center g-2">

            {/* Título + ícono */}
            <CCol xs={12} sm="auto">
              <div className="d-flex align-items-center gap-2">
                <CIcon icon={cilSchool} className="text-primary" style={{ width: '1.1rem', height: '1.1rem', flexShrink: 0 }} />
                <div>
                  <h4 className="mb-0 lh-1">Gestión de Docentes</h4>
                  <div className="small text-body-secondary mt-1">
                    Administración del cuerpo docente
                  </div>
                </div>
              </div>
            </CCol>

            {/* Buscador + acciones */}
            <CCol xs={12} sm="auto">
              <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">

                {/* Buscador dinámico */}
                <div className="doc-search-box">
                  <CIcon icon={cilSearch} className="doc-search-icon-inline" />
                  <input
                    className="doc-search-field"
                    type="text"
                    placeholder="Buscar docente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Buscar docente"
                  />
                  {searchTerm && (
                    <button className="doc-search-x" onClick={() => setSearchTerm('')} aria-label="Limpiar">
                      ×
                    </button>
                  )}
                </div>

                {/* Imprimir */}
                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  disabled={isGenerating}
                  onClick={() => handlePDF(false)}
                  className="doc-action-btn-top"
                >
                  {isGenerating
                    ? <CSpinner size="sm" className="me-1" />
                    : <CIcon icon={cilPrint} className="me-1" style={{ width: '0.875rem', height: '0.875rem' }} />
                  }
                  Imprimir
                </CButton>

                {/* Exportar PDF */}
                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  disabled={isGenerating}
                  onClick={() => handlePDF(true)}
                  className="doc-action-btn-top"
                >
                  <CIcon icon={cilCloudDownload} className="me-1" style={{ width: '0.875rem', height: '0.875rem' }} />
                  Exportar
                </CButton>

                {/* Nuevo docente */}
                <CButton
                  color="primary"
                  size="sm"
                  className="doc-btn-new-top"
                  onClick={() => openEdit()}
                >
                  <CIcon icon={cilPlus} className="me-1" style={{ width: '0.875rem', height: '0.875rem' }} />
                  Nuevo Docente
                </CButton>

              </div>
            </CCol>
          </CRow>
        </CCardHeader>

        {/* ── Cuerpo ── */}
        <CCardBody className="px-4 pt-1 pb-2 border border-light">
          <GenericTable table={table} />
        </CCardBody>

        {/* ── Footer con paginación ── */}
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

      {/* ── Modales ── */}
      <ModalNewEdit
        visible={editModal.visible}
        onClose={closeEdit}
        title={editModal.item ? 'Editar Docente' : 'Nuevo Docente'}
        initialData={editModal.item || { created_at: getTodayDate() }}
        onSave={handleSave}
        fields={docenteFields}
      />

      <ModalConfirmDel
        visible={deleteModal.visible}
        onClose={closeDelete}
        onConfirm={handleDelete}
        userId={deleteModal.id}
      />

    </CContainer>
  )
}
