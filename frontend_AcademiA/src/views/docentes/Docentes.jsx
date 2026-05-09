// frontend_AcademiA/src/views/docentes/Docentes.jsx

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  CButton, CCard, CCardHeader, CCardBody, CCardFooter,
  CCol, CRow, CContainer, CSpinner,
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
} from '@coreui/react'
import {
  cilPlus, cilSchool, cilSearch, cilPrint, cilCloudDownload,
  cilChevronBottom, cilChevronRight, cilArrowTop, cilArrowBottom, cilSwapVertical,
  cilPencil, cilTrash,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  useReactTable, getCoreRowModel, getPaginationRowModel,
  getSortedRowModel, getFilteredRowModel, flexRender,
} from '@tanstack/react-table'

import { useCrudModalManager } from '../../hooks/UseCrudModalManager/useCrudModalManager.js'
import { getTableColumns } from '../../utils/columns'
import { formatDisplayDate, getTodayDate } from '../../utils/dateUtils/DateUtils.js'
import api, { getDocentes, createDocente, updateDocente, deleteDocente } from '../../api/api.js'
import { docenteFields } from '../../utils/FormConfigs/formConfigs.js'

import TablePagination from '../../components/tablePagination/TablePagination.jsx'
import { generateTablePDF } from '../../components/tableActions/PDFService'
import ModalConfirmDel from '../../modals/ModalConfirmDel.jsx'
import ModalNewEdit from '../../modals/ModalNewEdit.jsx'

import './Docentes.css'

// ─── Campos extra que se muestran en el panel de expansión ───────────────────
const EXPANSION_FIELDS = [
  { key: 'domicilio',    label: 'Domicilio'    },
  { key: 'localidad',    label: 'Localidad'    },
  { key: 'nacionalidad', label: 'Nacionalidad' },
  { key: 'cel',          label: 'Celular'      },
  { key: 'dni',          label: 'Documento'    },
  { key: 'created_at',   label: 'Fecha de Alta', format: 'date' },
]

const fmtDate = (val) => {
  if (!val) return '—'
  const datePart = String(val).split('T')[0]
  const [y, m, d] = datePart.split('-')
  return d && m && y ? `${d}/${m}/${y}` : datePart
}

// ─── Panel animado: se monta siempre, la altura se anima con CSS ─────────────
function AnimatedExpansion({ isOpen, children }) {
  const wrapRef  = useRef(null)
  const innerRef = useRef(null)

  useEffect(() => {
    const wrap  = wrapRef.current
    const inner = innerRef.current
    if (!wrap || !inner) return

    if (isOpen) {
      // Abre: de 0 → altura real del contenido
      wrap.style.height  = '0px'
      wrap.style.opacity = '0'
      // Fuerza un reflow para que la transición arranque desde 0
      void wrap.offsetHeight
      wrap.style.height  = `${inner.scrollHeight}px`
      wrap.style.opacity = '1'
      const onEnd = () => { wrap.style.height = 'auto' }
      wrap.addEventListener('transitionend', onEnd, { once: true })
    } else {
      // Cierra: fija la altura actual antes de animar a 0
      wrap.style.height  = `${wrap.scrollHeight}px`
      void wrap.offsetHeight
      wrap.style.height  = '0px'
      wrap.style.opacity = '0'
    }
  }, [isOpen])

  return (
    <div ref={wrapRef} className="doc-expansion-animated">
      <div ref={innerRef}>
        {children}
      </div>
    </div>
  )
}

// ─── Contenido del panel ─────────────────────────────────────────────────────
function ExpansionPanel({ row, isOpen }) {
  const [materiasData, setMateriasData] = useState(null) // null = no cargado aún

  // Carga las materias la primera vez que el panel se abre
  useEffect(() => {
    if (!isOpen || materiasData !== null) return
    api.get(`/api/docentes/${row.id_entidad}/materias-actuales`)
      .then((res) => setMateriasData(res.data))
      .catch(() => setMateriasData({ ciclo: null, materias: [] }))
  }, [isOpen, row.id_entidad, materiasData])

  const hasAny = EXPANSION_FIELDS.some((f) => row[f.key])

  return (
    <div className="doc-expansion-panel">
      <div className="doc-expansion-grid">
        {EXPANSION_FIELDS.map(({ key, label, format }) => (
          <div key={key} className="doc-expansion-field">
            <span className="doc-expansion-label">{label}</span>
            <span className="doc-expansion-value">
              {format === 'date' ? fmtDate(row[key]) : (row[key] || '—')}
            </span>
          </div>
        ))}

        {/* Materias del ciclo actual */}
        <div className="doc-expansion-field doc-expansion-field--materias">
          <span className="doc-expansion-label">
            Materias actuales
            {materiasData?.ciclo && (
              <span className="doc-expansion-ciclo-badge">{materiasData.ciclo}</span>
            )}
          </span>
          {materiasData === null ? (
            <span className="doc-expansion-value doc-expansion-loading">
              <CSpinner size="sm" style={{ width: '0.75rem', height: '0.75rem' }} />
            </span>
          ) : materiasData.materias.length > 0 ? (
            <div className="doc-expansion-materias">
              {materiasData.materias.map((m) => (
                <span key={m} className="doc-materia-chip">{m}</span>
              ))}
            </div>
          ) : (
            <span className="doc-expansion-value">Sin materias asignadas</span>
          )}
        </div>
      </div>

      {!hasAny && materiasData?.materias?.length === 0 && (
        <span className="doc-expansion-empty">Sin datos adicionales registrados.</span>
      )}
    </div>
  )
}

// ─── Tabla con expansión ─────────────────────────────────────────────────────
function DocentesTable({ table, expandedRows, onToggleRow, onEdit, onDelete }) {
  const colCount = table.getHeaderGroups()[0]?.headers.length ?? 1

  return (
    <div className="doc-table-inline-wrap">
      <CTable hover className="doc-table-inline mb-0">

        <CTableHead>
          {table.getHeaderGroups().map((hg) => (
            <CTableRow key={hg.id}>
              {/* Columna expander */}
              <CTableHeaderCell className="doc-th doc-th-expander" />

              {hg.headers.map((header) => (
                <CTableHeaderCell
                  key={header.id}
                  className="doc-th"
                  onClick={header.column.getToggleSortingHandler?.()}
                  style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                >
                  <span className="doc-th-inner">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="doc-sort-icon">
                        {{
                          asc:  <CIcon icon={cilArrowTop}    size="sm" />,
                          desc: <CIcon icon={cilArrowBottom} size="sm" />,
                        }[header.column.getIsSorted()] ?? (
                          <CIcon icon={cilSwapVertical} size="sm" className="doc-sort-neutral" />
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
              <CTableDataCell colSpan={colCount + 1} className="doc-empty-cell">
                <div className="doc-empty">
                  <CIcon icon={cilSchool} className="doc-empty-icon" />
                  <p>No se encontraron docentes.</p>
                </div>
              </CTableDataCell>
            </CTableRow>
          ) : (
            table.getRowModel().rows.map((row) => {
              const isExpanded = !!expandedRows[row.id]
              return (
                <React.Fragment key={row.id}>
                  {/* Fila principal */}
                  <CTableRow
                    className={`doc-data-row${isExpanded ? ' doc-row-expanded' : ''}`}
                    onClick={() => onToggleRow(row.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Indicador visual — solo decorativo */}
                    <CTableDataCell className="doc-td doc-td-expander">
                      <CIcon
                        icon={isExpanded ? cilChevronBottom : cilChevronRight}
                        className={`doc-expander-icon${isExpanded ? ' is-open' : ''}`}
                      />
                    </CTableDataCell>

                    {row.getVisibleCells().map((cell) => {
                      if (cell.column.id === 'select') return null
                      const isActions = cell.column.id === 'actions'
                      return (
                        <CTableDataCell
                          key={cell.id}
                          className={`doc-td${isActions ? ' doc-td-actions' : ''}`}
                          onClick={isActions ? (e) => e.stopPropagation() : undefined}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </CTableDataCell>
                      )
                    })}
                  </CTableRow>

                  {/* Fila de expansión — siempre en el DOM para poder animar */}
                  <CTableRow className="doc-expansion-row">
                    <CTableDataCell colSpan={colCount + 1} className="doc-expansion-cell">
                      <AnimatedExpansion isOpen={isExpanded}>
                        <ExpansionPanel row={row.original} isOpen={isExpanded} />
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

// ─── Componente principal ────────────────────────────────────────────────────
export default function Docentes() {
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
    { showSelection: false },
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
        setExpandedRows({})   // Cierra expansiones al cambiar de página
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

      <CCard className="doc-card">

        {/* ── Encabezado ── */}
        <CCardHeader className="doc-card-header-main">
          <div className="doc-header-left-col">

            {/* Ícono + título + subtítulo */}
            <div className="doc-header-brand">
              <div className="doc-header-brand-icon">
                <CIcon icon={cilSchool} className="doc-brand-icon" />
              </div>
              <div>
                <h2 className="doc-header-h2">Gestión Docente</h2>
                <p className="doc-header-sub">Administración del cuerpo docente</p>
              </div>
            </div>

            {/* Buscador debajo del subtítulo */}
            <div className="doc-search-box doc-search-box--header">
              <CIcon icon={cilSearch} className="doc-search-icon-inline" />
              <input
                className="doc-search-field"
                type="text"
                placeholder="Buscar por nombre, email, teléfono…"
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

          </div>

          {/* Acciones — derecha */}
          <div className="doc-header-actions-col">

            {/* Badge total */}
            <span className="doc-total-pill">
              {total} {total === 1 ? 'docente' : 'docentes'}
            </span>

            <div className="doc-header-divider" />

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

            <div className="doc-header-divider" />

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
        </CCardHeader>

        {/* ── Cuerpo ── */}
        <CCardBody className="p-0">
          <DocentesTable
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
