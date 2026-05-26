// frontend_AcademiA/src/views/estudiantes/Estudiantes.jsx

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  CButton, CCard, CCardHeader, CCardBody, CCardFooter,
  CContainer, CSpinner,
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
} from '@coreui/react'
import {
  cilPlus, cilPeople, cilSearch, cilPrint, cilCloudDownload,
  cilChevronBottom, cilChevronRight, cilArrowTop, cilArrowBottom, cilSwapVertical,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  useReactTable, getCoreRowModel, getPaginationRowModel,
  getSortedRowModel, getFilteredRowModel, flexRender,
} from '@tanstack/react-table'

import { useCrudModalManager } from '../../hooks/UseCrudModalManager/useCrudModalManager.js'
import { getTableColumns } from '../../utils/columns'
import { formatDisplayDate, getTodayDate } from '../../utils/dateUtils/DateUtils.js'
import apiEstudiantes from '../../api/apiEstudiantes.js'
import { modalNewEditEstudiantesFields } from './estudiantesFormConfigs/EstudiantesFormConfigs.js'

import TablePagination from '../../components/tablePagination/TablePagination.jsx'
import { generateTablePDF } from '../../components/tableActions/PDFService'
import ModalConfirmDel from '../../modals/ModalConfirmDel.jsx'
import ModalNewEdit from '../../modals/ModalNewEdit.jsx'

import './Estudiantes.css'

// ─── Campos del panel de expansión ───────────────────────────────────────────
const EXPANSION_FIELDS = [
  { key: 'domicilio',    label: 'Domicilio'     },
  { key: 'localidad',    label: 'Localidad'     },
  { key: 'nacionalidad', label: 'Nacionalidad'  },
  { key: 'telefono',     label: 'Celular'       },
  { key: 'dni',          label: 'Documento'     },
  { key: 'created_at',   label: 'Fecha de Alta', format: 'date' },
]

const fmtDate = (val) => {
  if (!val) return '—'
  const datePart = String(val).split('T')[0]
  const [y, m, d] = datePart.split('-')
  return d && m && y ? `${d}/${m}/${y}` : datePart
}

// ─── Panel animado ────────────────────────────────────────────────────────────
function AnimatedExpansion({ isOpen, children }) {
  const wrapRef  = useRef(null)
  const innerRef = useRef(null)

  useEffect(() => {
    const wrap  = wrapRef.current
    const inner = innerRef.current
    if (!wrap || !inner) return

    if (isOpen) {
      wrap.style.height  = '0px'
      wrap.style.opacity = '0'
      void wrap.offsetHeight
      wrap.style.height  = `${inner.scrollHeight}px`
      wrap.style.opacity = '1'
      const onEnd = () => { wrap.style.height = 'auto' }
      wrap.addEventListener('transitionend', onEnd, { once: true })
    } else {
      wrap.style.height  = `${wrap.scrollHeight}px`
      void wrap.offsetHeight
      wrap.style.height  = '0px'
      wrap.style.opacity = '0'
    }
  }, [isOpen])

  return (
    <div ref={wrapRef} className="est-expansion-animated">
      <div ref={innerRef}>
        {children}
      </div>
    </div>
  )
}

// ─── Panel de expansión ───────────────────────────────────────────────────────
function ExpansionPanel({ row }) {
  const hasAny = EXPANSION_FIELDS.some((f) => row[f.key])
  return (
    <div className="est-expansion-panel">
      {hasAny ? (
        <div className="est-expansion-grid">
          {EXPANSION_FIELDS.map(({ key, label, format }) => (
            <div key={key} className="est-expansion-field">
              <span className="est-expansion-label">{label}</span>
              <span className="est-expansion-value">
                {format === 'date' ? fmtDate(row[key]) : (row[key] || '—')}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <span className="est-expansion-empty">Sin datos adicionales registrados.</span>
      )}
    </div>
  )
}

// ─── Tabla con expansión ──────────────────────────────────────────────────────
function EstudiantesTable({ table, expandedRows, onToggleRow }) {
  const colCount = table.getHeaderGroups()[0]?.headers.length ?? 1

  return (
    <div className="est-table-inline-wrap">
      <CTable hover className="est-table-inline mb-0">

        <CTableHead>
          {table.getHeaderGroups().map((hg) => (
            <CTableRow key={hg.id}>
              <CTableHeaderCell className="est-th est-th-expander" />
              {hg.headers.map((header) => (
                <CTableHeaderCell
                  key={header.id}
                  className="est-th"
                  onClick={header.column.getToggleSortingHandler?.()}
                  style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                >
                  <span className="est-th-inner">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="est-sort-icon">
                        {{
                          asc:  <CIcon icon={cilArrowTop}    size="sm" />,
                          desc: <CIcon icon={cilArrowBottom} size="sm" />,
                        }[header.column.getIsSorted()] ?? (
                          <CIcon icon={cilSwapVertical} size="sm" className="est-sort-neutral" />
                        )}
                      </span>
                    )}
                  </span>
                </CTableHeaderCell>
              ))}
            </CTableRow>
          ))}
        </CTableHead>

        <CTableBody>
          {table.getRowModel().rows.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan={colCount + 1} className="est-empty-cell">
                <div className="est-empty">
                  <CIcon icon={cilPeople} className="est-empty-icon" />
                  <p>No se encontraron estudiantes.</p>
                </div>
              </CTableDataCell>
            </CTableRow>
          ) : (
            table.getRowModel().rows.map((row) => {
              const isExpanded = !!expandedRows[row.id]
              return (
                <React.Fragment key={row.id}>
                  <CTableRow
                    className={`est-data-row${isExpanded ? ' est-row-expanded' : ''}`}
                    onClick={() => onToggleRow(row.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <CTableDataCell className="est-td est-td-expander">
                      <CIcon
                        icon={isExpanded ? cilChevronBottom : cilChevronRight}
                        className={`est-expander-icon${isExpanded ? ' is-open' : ''}`}
                      />
                    </CTableDataCell>

                    {row.getVisibleCells().map((cell) => {
                      if (cell.column.id === 'select') return null
                      const isActions = cell.column.id === 'actions'
                      return (
                        <CTableDataCell
                          key={cell.id}
                          className={`est-td${isActions ? ' est-td-actions' : ''}`}
                          onClick={isActions ? (e) => e.stopPropagation() : undefined}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </CTableDataCell>
                      )
                    })}
                  </CTableRow>

                  <CTableRow className="est-expansion-row">
                    <CTableDataCell colSpan={colCount + 1} className="est-expansion-cell">
                      <AnimatedExpansion isOpen={isExpanded}>
                        <ExpansionPanel row={row.original} />
                      </AnimatedExpansion>
                    </CTableDataCell>
                  </CTableRow>
                </React.Fragment>
              )
            })
          )}
        </CTableBody>
      </CTable>
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Estudiantes() {
  const [tableData, setTableData]       = useState([])
  const [total, setTotal]               = useState(0)
  const [searchTerm, setSearchTerm]     = useState('')
  const [pagination, setPagination]     = useState({ pageIndex: 0, pageSize: 10 })
  const [isGenerating, setIsGenerating] = useState(false)
  const [expandedRows, setExpandedRows] = useState({})

  const toggleRow = useCallback((rowId) => {
    setExpandedRows((prev) => ({ [rowId]: !prev[rowId] }))
  }, [])

  const {
    editModal, deleteModal,
    openEdit, closeEdit,
    openDelete, closeDelete,
    handleSave, handleDelete,
  } = useCrudModalManager({
    createApi: apiEstudiantes.create,
    updateApi: apiEstudiantes.update,
    deleteApi: apiEstudiantes.remove,
    setData: setTableData,
  })

  const columns = useMemo(() => getTableColumns(
    [
      { accessorKey: 'apellido', header: 'Apellido'  },
      { accessorKey: 'nombre',   header: 'Nombre'    },
      {
        accessorKey: 'fec_nac',
        header: 'Fecha Nac.',
        cell: (info) => formatDisplayDate(info.getValue()),
      },
      { accessorKey: 'email',    header: 'Email'     },
      { accessorKey: 'telefono', header: 'Tel/Cel'   },
    ],
    openDelete,
    openEdit,
    { showSelection: false },
  ), [])

  useEffect(() => {
    const skip  = pagination.pageIndex * pagination.pageSize
    const limit = pagination.pageSize
    apiEstudiantes.getAll({ params: { skip, limit } })
      .then((res) => {
        const payload = res?.data
        const items   = Array.isArray(payload) ? payload : (payload?.data ?? [])
        setTableData(items)
        setTotal(payload?.total ?? items.length)
        setExpandedRows({})
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
    const blob = await generateTablePDF({ table, title: 'Listado de Estudiantes', download })
    if (!download && blob) {
      const url = URL.createObjectURL(blob)
      const w = window.open(url, '_blank')
      if (w) w.onload = () => { w.print(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
    }
    setIsGenerating(false)
  }

  return (
    <CContainer fluid className="py-3">

      <CCard className="est-card">

        {/* ── Encabezado ── */}
        <CCardHeader className="est-card-header-main">
          <div className="est-header-left-col">

            <div className="est-header-brand">
              <div className="est-header-brand-icon">
                <CIcon icon={cilPeople} className="est-brand-icon" />
              </div>
              <div>
                <h2 className="est-header-h2">Gestión de Estudiantes</h2>
                <p className="est-header-sub">Administración del alumnado</p>
              </div>
            </div>

            <div className="est-search-box est-search-box--header">
              <CIcon icon={cilSearch} className="est-search-icon-inline" />
              <input
                className="est-search-field"
                type="text"
                placeholder="Buscar por nombre, email, teléfono…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Buscar estudiante"
              />
              {searchTerm && (
                <button className="est-search-x" onClick={() => setSearchTerm('')} aria-label="Limpiar">
                  ×
                </button>
              )}
            </div>

          </div>

          <div className="est-header-actions-col">

            <span className="est-total-pill">
              {total} {total === 1 ? 'estudiante' : 'estudiantes'}
            </span>

            <div className="est-header-divider" />

            <CButton
              color="secondary"
              variant="outline"
              size="sm"
              disabled={isGenerating}
              onClick={() => handlePDF(false)}
              className="est-action-btn-top"
            >
              {isGenerating
                ? <CSpinner size="sm" className="me-1" />
                : <CIcon icon={cilPrint} className="me-1" style={{ width: '0.875rem', height: '0.875rem' }} />
              }
              Imprimir
            </CButton>

            <CButton
              color="secondary"
              variant="outline"
              size="sm"
              disabled={isGenerating}
              onClick={() => handlePDF(true)}
              className="est-action-btn-top"
            >
              <CIcon icon={cilCloudDownload} className="me-1" style={{ width: '0.875rem', height: '0.875rem' }} />
              Exportar
            </CButton>

            <div className="est-header-divider" />

            <CButton
              color="primary"
              size="sm"
              className="est-btn-new-top"
              onClick={() => openEdit()}
            >
              <CIcon icon={cilPlus} className="me-1" style={{ width: '0.875rem', height: '0.875rem' }} />
              Nuevo Estudiante
            </CButton>

          </div>
        </CCardHeader>

        {/* ── Cuerpo ── */}
        <CCardBody className="p-0">
          <EstudiantesTable
            table={table}
            expandedRows={expandedRows}
            onToggleRow={toggleRow}
            onEdit={openEdit}
            onDelete={openDelete}
          />
        </CCardBody>

        {/* ── Footer con paginación ── */}
        <CCardFooter
          className="bg-white border-top px-3 py-1"
          style={{ position: 'sticky', bottom: 0, zIndex: 1, boxShadow: '0 -2px 5px rgba(0,0,0,0.1)' }}
        >
          <TablePagination table={table} />
        </CCardFooter>

      </CCard>

      {/* ── Modales ── */}
      <ModalNewEdit
        visible={editModal.visible}
        onClose={closeEdit}
        title={editModal.item ? 'Editar Estudiante' : 'Nuevo Estudiante'}
        initialData={editModal.item || { created_at: getTodayDate() }}
        onSave={handleSave}
        fields={modalNewEditEstudiantesFields}
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
