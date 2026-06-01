// frontend_AcademiA/src/views/materias/Materias.jsx

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  CButton, CCard, CCardHeader, CCardBody, CCardFooter,
  CContainer, CSpinner,
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
} from '@coreui/react'
import {
  cilPlus, cilSearch, cilPrint, cilCloudDownload,
  cilChevronBottom, cilChevronRight, cilArrowTop, cilArrowBottom, cilSwapVertical,
  cilBook, cilPencil, cilTrash,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  useReactTable, getCoreRowModel, getPaginationRowModel,
  getSortedRowModel, getFilteredRowModel, flexRender,
} from '@tanstack/react-table'
import { createColumnHelper } from '@tanstack/react-table'

import { getMateriasTabla } from '../../api/apiMaterias.jsx'
import TablePagination from '../../components/tablePagination/TablePagination.jsx'
import { generateTablePDF } from '../../components/tableActions/PDFService'
import ModalConfirmDel from '../../modals/ModalConfirmDel.jsx'
import ModalNewEdit from '../../modals/ModalNewEdit.jsx'
import { docenteFields } from '../../utils/FormConfigs/formConfigs.js'

import './Materias.css'

// ─── Campos del panel de expansión ──────────────────────────────────────────
const EXPANSION_FIELDS = [
  { key: 'curso.ciclo.nombre_ciclo_lectivo', label: 'Ciclo Lectivo' },
  { key: 'curso.ciclo.plan.nombre_plan',     label: 'Plan de Estudios' },
  { key: 'curso.curso',                      label: 'Curso' },
]

const getNestedValue = (obj, path) =>
  path.split('.').reduce((acc, k) => acc?.[k], obj) ?? '—'

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
    <div ref={wrapRef} className="mat-expansion-animated">
      <div ref={innerRef}>{children}</div>
    </div>
  )
}

// ─── Panel de expansión ───────────────────────────────────────────────────────
function ExpansionPanel({ row }) {
  return (
    <div className="mat-expansion-panel">
      <div className="mat-expansion-grid">
        {EXPANSION_FIELDS.map(({ key, label }) => (
          <div key={key} className="mat-expansion-field">
            <span className="mat-expansion-label">{label}</span>
            <span className="mat-expansion-value">{getNestedValue(row, key)}</span>
          </div>
        ))}
        <div className="mat-expansion-field">
          <span className="mat-expansion-label">Docente</span>
          <span className="mat-expansion-value">{row.docente_nombre_completo ?? '—'}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Columnas ────────────────────────────────────────────────────────────────
const columnHelper = createColumnHelper()

function buildColumns(onEdit, onDelete) {
  return [
    columnHelper.accessor('nombre.nombre_materia', {
      header: 'Materia',
      cell:   (info) => info.getValue() ?? '—',
    }),
    columnHelper.accessor('curso.curso', {
      header: 'Curso',
      cell:   (info) => info.getValue() ?? '—',
    }),
    columnHelper.accessor('curso.ciclo.nombre_ciclo_lectivo', {
      header: 'Ciclo Lectivo',
      cell:   (info) => info.getValue() ?? '—',
    }),
    columnHelper.accessor('curso.ciclo.plan.nombre_plan', {
      header: 'Plan',
      cell:   (info) => info.getValue() ?? '—',
    }),
    columnHelper.accessor('docente_nombre_completo', {
      header: 'Docente',
      cell:   (info) => info.getValue() ?? '—',
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div style={{ textAlign: 'center' }}>Acción</div>,
      cell: ({ row }) => (
        <div className="mat-td-actions-wrap">
          <button
            className="mat-action-btn"
            title="Editar"
            onClick={(e) => { e.stopPropagation(); onEdit(row.original) }}
          >
            <CIcon icon={cilPencil} style={{ width: '0.875rem', height: '0.875rem' }} />
          </button>
          <button
            className="mat-action-btn mat-action-btn--danger"
            title="Eliminar"
            onClick={(e) => { e.stopPropagation(); onDelete(row.original) }}
          >
            <CIcon icon={cilTrash} style={{ width: '0.875rem', height: '0.875rem' }} />
          </button>
        </div>
      ),
      enableSorting: false,
    }),
  ]
}

// ─── Tabla con expansión ──────────────────────────────────────────────────────
function MateriasTable({ table, expandedRows, onToggleRow }) {
  const colCount = table.getHeaderGroups()[0]?.headers.length ?? 1

  return (
    <div className="mat-table-inline-wrap">
      <CTable hover className="mat-table-inline mb-0">

        <CTableHead>
          {table.getHeaderGroups().map((hg) => (
            <CTableRow key={hg.id}>
              <CTableHeaderCell className="mat-th mat-th-expander" />
              {hg.headers.map((header) => (
                <CTableHeaderCell
                  key={header.id}
                  className="mat-th"
                  onClick={header.column.getToggleSortingHandler?.()}
                  style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                >
                  <span className="mat-th-inner">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="mat-sort-icon">
                        {{
                          asc:  <CIcon icon={cilArrowTop}    size="sm" />,
                          desc: <CIcon icon={cilArrowBottom} size="sm" />,
                        }[header.column.getIsSorted()] ?? (
                          <CIcon icon={cilSwapVertical} size="sm" className="mat-sort-neutral" />
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
              <CTableDataCell colSpan={colCount + 1} className="mat-empty-cell">
                <div className="mat-empty">
                  <CIcon icon={cilBook} className="mat-empty-icon" />
                  <p>No se encontraron materias.</p>
                </div>
              </CTableDataCell>
            </CTableRow>
          ) : (
            table.getRowModel().rows.map((row) => {
              const isExpanded = !!expandedRows[row.id]
              return (
                <React.Fragment key={row.id}>
                  <CTableRow
                    className={`mat-data-row${isExpanded ? ' mat-row-expanded' : ''}`}
                    onClick={() => onToggleRow(row.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <CTableDataCell className="mat-td mat-td-expander">
                      <CIcon
                        icon={isExpanded ? cilChevronBottom : cilChevronRight}
                        className={`mat-expander-icon${isExpanded ? ' is-open' : ''}`}
                      />
                    </CTableDataCell>
                    {row.getVisibleCells().map((cell) => {
                      const isActions = cell.column.id === 'actions'
                      return (
                        <CTableDataCell
                          key={cell.id}
                          className={`mat-td${isActions ? ' mat-td-actions' : ''}`}
                          onClick={isActions ? (e) => e.stopPropagation() : undefined}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </CTableDataCell>
                      )
                    })}
                  </CTableRow>

                  <CTableRow className="mat-expansion-row">
                    <CTableDataCell colSpan={colCount + 1} className="mat-expansion-cell">
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
export default function Materias() {
  const [tableData, setTableData]       = useState([])
  const [total, setTotal]               = useState(0)
  const [searchTerm, setSearchTerm]     = useState('')
  const [pagination, setPagination]     = useState({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting]           = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [expandedRows, setExpandedRows] = useState({})

  const [editModalVisible, setEditModalVisible]     = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [itemToEdit, setItemToEdit]                 = useState(null)
  const [itemToDelete, setItemToDelete]             = useState(null)

  const toggleRow = useCallback((rowId) => {
    setExpandedRows((prev) => ({ [rowId]: !prev[rowId] }))
  }, [])

  const openEdit   = useCallback((item = null) => { setItemToEdit(item); setEditModalVisible(true) }, [])
  const openDelete = useCallback((item) => { setItemToDelete(item); setDeleteModalVisible(true) }, [])

  // Fetch server-side
  useEffect(() => {
    const skip  = pagination.pageIndex * pagination.pageSize
    const limit = pagination.pageSize
    getMateriasTabla({ params: { skip, limit } })
      .then((res) => {
        const payload = res?.data
        const items   = Array.isArray(payload) ? payload : (payload?.data ?? [])
        setTableData(items)
        setTotal(payload?.total ?? items.length)
        setExpandedRows({})
      })
      .catch(console.error)
  }, [pagination.pageIndex, pagination.pageSize])

  const columns = useMemo(() => buildColumns(openEdit, openDelete), [openEdit, openDelete])

  const table = useReactTable({
    data: tableData,
    columns,
    getRowId: (row) => String(row.id_materia),
    state: { globalFilter: searchTerm, pagination, sorting },
    onGlobalFilterChange: setSearchTerm,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    rowCount: total,
  })

  const handlePDF = async (download = false) => {
    setIsGenerating(true)
    const blob = await generateTablePDF({ table, title: 'Listado de Materias', download })
    if (!download && blob) {
      const url = URL.createObjectURL(blob)
      const w = window.open(url, '_blank')
      if (w) w.onload = () => { w.print(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
    }
    setIsGenerating(false)
  }

  const handleSave = async () => {
    // Recarga la tabla tras guardar
    const skip  = pagination.pageIndex * pagination.pageSize
    const limit = pagination.pageSize
    const res   = await getMateriasTabla({ params: { skip, limit } })
    const payload = res?.data
    const items   = Array.isArray(payload) ? payload : (payload?.data ?? [])
    setTableData(items)
    setTotal(payload?.total ?? items.length)
    return true
  }

  const handleDelete = async () => {
    // Por ahora solo cierra — la lógica real requiere endpoint DELETE /materias/{id}
    setDeleteModalVisible(false)
    setItemToDelete(null)
  }

  return (
    <CContainer fluid className="py-3">

      <CCard className="mat-card">

        {/* ── Encabezado ── */}
        <CCardHeader className="mat-card-header-main">
          <div className="mat-header-left-col">
            <div className="mat-header-brand">
              <div className="mat-header-brand-icon">
                <CIcon icon={cilBook} className="mat-brand-icon" />
              </div>
              <div>
                <h2 className="mat-header-h2">Gestión de Materias</h2>
                <p className="mat-header-sub">Configuración del plan académico</p>
              </div>
            </div>

            <div className="mat-search-box">
              <CIcon icon={cilSearch} className="mat-search-icon-inline" />
              <input
                className="mat-search-field"
                type="text"
                placeholder="Buscar por materia, curso, docente…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Buscar materia"
              />
              {searchTerm && (
                <button className="mat-search-x" onClick={() => setSearchTerm('')} aria-label="Limpiar">×</button>
              )}
            </div>
          </div>

          <div className="mat-header-actions-col">
            <span className="mat-total-pill">
              {total} {total === 1 ? 'materia' : 'materias'}
            </span>
            <div className="mat-header-divider" />
            <CButton color="secondary" variant="outline" size="sm" disabled={isGenerating} onClick={() => handlePDF(false)} className="mat-action-btn-top">
              {isGenerating ? <CSpinner size="sm" className="me-1" /> : <CIcon icon={cilPrint} className="me-1" style={{ width: '0.875rem', height: '0.875rem' }} />}
              Imprimir
            </CButton>
            <CButton color="secondary" variant="outline" size="sm" disabled={isGenerating} onClick={() => handlePDF(true)} className="mat-action-btn-top">
              <CIcon icon={cilCloudDownload} className="me-1" style={{ width: '0.875rem', height: '0.875rem' }} />
              Exportar
            </CButton>
            <div className="mat-header-divider" />
            <CButton color="primary" size="sm" className="mat-btn-new-top" onClick={() => openEdit()}>
              <CIcon icon={cilPlus} className="me-1" style={{ width: '0.875rem', height: '0.875rem' }} />
              Nueva Materia
            </CButton>
          </div>
        </CCardHeader>

        {/* ── Cuerpo ── */}
        <CCardBody className="p-0">
          <MateriasTable
            table={table}
            expandedRows={expandedRows}
            onToggleRow={toggleRow}
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

      <ModalNewEdit
        visible={editModalVisible}
        onClose={() => { setEditModalVisible(false); setItemToEdit(null) }}
        title={itemToEdit ? 'Editar Materia' : 'Nueva Materia'}
        initialData={itemToEdit || {}}
        onSave={handleSave}
        fields={docenteFields}
      />

      <ModalConfirmDel
        visible={deleteModalVisible}
        onClose={() => { setDeleteModalVisible(false); setItemToDelete(null) }}
        onConfirm={handleDelete}
        userId={itemToDelete?.id_materia}
      />

    </CContainer>
  )
}
