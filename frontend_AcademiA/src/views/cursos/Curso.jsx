// frontend_AcademiA/src/views/cursos/Curso.jsx

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  CButton, CCard, CCardHeader, CCardBody, CCardFooter,
  CContainer, CSpinner,
  CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell,
} from '@coreui/react'
import {
  cilPlus, cilSearch, cilPrint, cilCloudDownload,
  cilChevronBottom, cilChevronRight, cilArrowTop, cilArrowBottom, cilSwapVertical,
  cilSchool, cilPeople,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  useReactTable, getCoreRowModel, getPaginationRowModel,
  getSortedRowModel, getFilteredRowModel, flexRender,
} from '@tanstack/react-table'

import { getTableColumns } from '../../utils/columns'
import { useCursosCompletoData } from '../../hooks/useCursosCompleto.js'

import TablePagination from '../../components/tablePagination/TablePagination.jsx'
import { generateTablePDF } from '../../components/tableActions/PDFService'
import ModalCurso from './ModalCurso.jsx'
import ModalDetalleCurso from './ModalDetalleCurso.jsx'

import './Cursos.css'

// ─── Campos extra en el panel de expansión ───────────────────
const EXPANSION_FIELDS = [
  { key: 'ciclo.nombre_ciclo_lectivo', label: 'Ciclo Lectivo'    },
  { key: 'ciclo.plan.nombre_plan',     label: 'Plan de Estudios' },
]

const getNestedValue = (obj, path) =>
  path.split('.').reduce((acc, key) => acc?.[key], obj) ?? '—'

// ─── Panel animado ────────────────────────────────────────────
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
    <div ref={wrapRef} className="cur-expansion-animated">
      <div ref={innerRef}>{children}</div>
    </div>
  )
}

// ─── Panel de expansión con stats + detalle ───────────────────
function ExpansionPanel({ row, onVerDetalle }) {
  const hasAny = EXPANSION_FIELDS.some((f) => getNestedValue(row, f.key) !== '—')
  return (
    <div className="cur-expansion-panel">
      <div className="cur-expansion-inner">
        {/* Campos de texto */}
        {hasAny && (
          <div className="cur-expansion-grid">
            {EXPANSION_FIELDS.map(({ key, label }) => (
              <div key={key} className="cur-expansion-field">
                <span className="cur-expansion-label">{label}</span>
                <span className="cur-expansion-value">{getNestedValue(row, key)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Stats inline */}
        <div className="cur-expansion-stats">
          <div className="cur-exp-stat">
            <span className="cur-exp-stat-value">{row.total_alumnos ?? '—'}</span>
            <span className="cur-exp-stat-label">Alumnos inscriptos</span>
          </div>
          <div className="cur-exp-stat-sep" />
          <div className="cur-exp-stat">
            <span className="cur-exp-stat-value">{row.total_materias ?? '—'}</span>
            <span className="cur-exp-stat-label">Materias</span>
          </div>
        </div>

        {/* Botón ver detalle */}
        <button
          className="cur-btn-ver-detalle"
          onClick={(e) => { e.stopPropagation(); onVerDetalle(row) }}
        >
          <CIcon icon={cilPeople} style={{ width: '0.8rem', height: '0.8rem' }} />
          Ver alumnos y materias
        </button>
      </div>
    </div>
  )
}

// ─── Tabla con expansión ──────────────────────────────────────
function CursosTable({ table, expandedRows, onToggleRow, onVerDetalle }) {
  const colCount = table.getHeaderGroups()[0]?.headers.length ?? 1

  return (
    <div className="cur-table-inline-wrap">
      <CTable hover className="cur-table-inline mb-0">

        <CTableHead>
          {table.getHeaderGroups().map((hg) => (
            <CTableRow key={hg.id}>
              <CTableHeaderCell className="cur-th cur-th-expander" />
              {hg.headers.map((header) => (
                <CTableHeaderCell
                  key={header.id}
                  className="cur-th"
                  onClick={header.column.getToggleSortingHandler?.()}
                  style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                >
                  <span className="cur-th-inner">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      <span className="cur-sort-icon">
                        {{
                          asc:  <CIcon icon={cilArrowTop}    size="sm" />,
                          desc: <CIcon icon={cilArrowBottom} size="sm" />,
                        }[header.column.getIsSorted()] ?? (
                          <CIcon icon={cilSwapVertical} size="sm" className="cur-sort-neutral" />
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
              <CTableDataCell colSpan={colCount + 1} className="cur-empty-cell">
                <div className="cur-empty">
                  <CIcon icon={cilSchool} className="cur-empty-icon" />
                  <p>No se encontraron cursos.</p>
                </div>
              </CTableDataCell>
            </CTableRow>
          ) : (
            table.getRowModel().rows.map((row) => {
              const isExpanded = !!expandedRows[row.id]
              return (
                <React.Fragment key={row.id}>
                  <CTableRow
                    className={`cur-data-row${isExpanded ? ' cur-row-expanded' : ''}`}
                    onClick={() => onToggleRow(row.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <CTableDataCell className="cur-td cur-td-expander">
                      <CIcon
                        icon={isExpanded ? cilChevronBottom : cilChevronRight}
                        className={`cur-expander-icon${isExpanded ? ' is-open' : ''}`}
                      />
                    </CTableDataCell>

                    {row.getVisibleCells().map((cell) => {
                      if (cell.column.id === 'select') return null
                      const isActions = cell.column.id === 'actions'
                      return (
                        <CTableDataCell
                          key={cell.id}
                          className={`cur-td${isActions ? ' cur-td-actions' : ''}`}
                          onClick={isActions ? (e) => e.stopPropagation() : undefined}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </CTableDataCell>
                      )
                    })}
                  </CTableRow>

                  <CTableRow className="cur-expansion-row">
                    <CTableDataCell colSpan={colCount + 1} className="cur-expansion-cell">
                      <AnimatedExpansion isOpen={isExpanded}>
                        <ExpansionPanel row={row.original} onVerDetalle={onVerDetalle} />
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

// ─── Componente principal ─────────────────────────────────────
export default function Curso() {
  const {
    cursosCompletoData: tableData,
    loading,
    fetchCursosCompleto,
  } = useCursosCompletoData()

  const [total, setTotal]               = useState(0)
  const [searchTerm, setSearchTerm]     = useState('')
  const [pagination, setPagination]     = useState({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting]           = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [expandedRows, setExpandedRows] = useState({})
  const [cursoDetalle, setCursoDetalle] = useState(null)
  const [modalCurso, setModalCurso]     = useState(null) // null = cerrado, {} = nuevo, {curso} = edición

  useEffect(() => {
    setTotal(tableData?.length ?? 0)
  }, [tableData])

  const toggleRow = useCallback((rowId) => {
    setExpandedRows((prev) => ({ [rowId]: !prev[rowId] }))
  }, [])

  // Recarga la tabla tras crear/editar un curso
  const handleCursoSaved = useCallback(() => {
    fetchCursosCompleto()
  }, [fetchCursosCompleto])

  const columns = useMemo(() => getTableColumns(
    [
      { accessorKey: 'curso',                      header: 'Curso'            },
      { accessorKey: 'ciclo.nombre_ciclo_lectivo', header: 'Ciclo Lectivo'    },
      { accessorKey: 'ciclo.plan.nombre_plan',     header: 'Plan de Estudios' },
      {
        accessorKey: 'total_alumnos',
        header: 'Alumnos',
        cell: ({ getValue }) => {
          const v = getValue()
          return (
            <span className="cur-stat-pill cur-stat-pill--alumnos">
              <CIcon icon={cilPeople} style={{ width: '0.7rem', height: '0.7rem' }} />
              {v ?? '—'}
            </span>
          )
        },
      },
      {
        accessorKey: 'total_materias',
        header: 'Materias',
        cell: ({ getValue }) => {
          const v = getValue()
          return (
            <span className="cur-stat-pill cur-stat-pill--materias">
              {v ?? '—'}
            </span>
          )
        },
      },
    ],
    // confirmDelete — sin modal independiente: vacío por ahora
    () => {},
    // handleClickEditar — abre el ModalCurso con la fila completa
    (row) => setModalCurso(row),
    { showSelection: false },
  ), [setModalCurso])

  const table = useReactTable({
    data: tableData || [],
    columns,
    state: { globalFilter: searchTerm, pagination, sorting },
    onGlobalFilterChange: setSearchTerm,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const handlePDF = async (download = false) => {
    setIsGenerating(true)
    const blob = await generateTablePDF({ table, title: 'Listado de Cursos', download })
    if (!download && blob) {
      const url = URL.createObjectURL(blob)
      const w = window.open(url, '_blank')
      if (w) w.onload = () => { w.print(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
    }
    setIsGenerating(false)
  }

  return (
    <CContainer fluid className="py-3">

      <CCard className="cur-card">

        {/* ── Encabezado ── */}
        <CCardHeader className="cur-card-header-main">
          <div className="cur-header-left-col">
            <div className="cur-header-brand">
              <div className="cur-header-brand-icon">
                <CIcon icon={cilSchool} className="cur-brand-icon" />
              </div>
              <div>
                <h2 className="cur-header-h2">Gestión de Cursos</h2>
                <p className="cur-header-sub">Administración de cursos y ciclos lectivos</p>
              </div>
            </div>

            <div className="cur-search-box">
              <CIcon icon={cilSearch} className="cur-search-icon-inline" />
              <input
                className="cur-search-field"
                type="text"
                placeholder="Buscar por curso, ciclo, plan…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Buscar curso"
              />
              {searchTerm && (
                <button className="cur-search-x" onClick={() => setSearchTerm('')} aria-label="Limpiar">×</button>
              )}
            </div>
          </div>

          <div className="cur-header-actions-col">
            <span className="cur-total-pill">
              {total} {total === 1 ? 'curso' : 'cursos'}
            </span>
            <div className="cur-header-divider" />
            <CButton color="secondary" variant="outline" size="sm" disabled={isGenerating} onClick={() => handlePDF(false)} className="cur-action-btn-top">
              {isGenerating ? <CSpinner size="sm" className="me-1" /> : <CIcon icon={cilPrint} className="me-1" style={{ width: '0.875rem', height: '0.875rem' }} />}
              Imprimir
            </CButton>
            <CButton color="secondary" variant="outline" size="sm" disabled={isGenerating} onClick={() => handlePDF(true)} className="cur-action-btn-top">
              <CIcon icon={cilCloudDownload} className="me-1" style={{ width: '0.875rem', height: '0.875rem' }} />
              Exportar
            </CButton>
            <div className="cur-header-divider" />
            <CButton color="primary" size="sm" className="cur-btn-new-top" onClick={() => setModalCurso({})}>
              <CIcon icon={cilPlus} className="me-1" style={{ width: '0.875rem', height: '0.875rem' }} />
              Nuevo Curso
            </CButton>
          </div>
        </CCardHeader>

        {/* ── Cuerpo ── */}
        <CCardBody className="p-0">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <CSpinner color="primary" />
            </div>
          ) : (
            <CursosTable
              table={table}
              expandedRows={expandedRows}
              onToggleRow={toggleRow}
              onVerDetalle={setCursoDetalle}
            />
          )}
        </CCardBody>

        {/* ── Footer con paginación ── */}
        <CCardFooter
          className="bg-white border-top px-3 py-1"
          style={{ position: 'sticky', bottom: 0, zIndex: 1, boxShadow: '0 -2px 5px rgba(0,0,0,0.1)' }}
        >
          <TablePagination table={table} />
        </CCardFooter>

      </CCard>

      {/* ── Modal crear/editar curso ── */}
      {modalCurso !== null && (
        <ModalCurso
          curso={modalCurso?.id_curso ? modalCurso : null}
          onClose={() => setModalCurso(null)}
          onSaved={handleCursoSaved}
        />
      )}

      {/* ── Modal detalle de curso ── */}
      {cursoDetalle && (
        <ModalDetalleCurso
          curso={cursoDetalle}
          onClose={() => setCursoDetalle(null)}
        />
      )}

    </CContainer>
  )
}
