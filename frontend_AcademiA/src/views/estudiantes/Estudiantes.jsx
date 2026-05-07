// frontend_AcademiA/src/views/estudiantes/Estudiantes.jsx

import React, { useState, useRef, useEffect } from 'react'
import {
  CCard, CCardHeader, CCardBody, CContainer,
  CButton, CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPeople } from '@coreui/icons'

import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { TieredMenu } from 'primereact/tieredmenu'
import { Button } from 'primereact/button'

import ModalConfirmDel from '../../modals/ModalConfirmDel.jsx'
import ModalNewEdit from '../../modals/ModalNewEdit.jsx'
import { useStudentsData } from '../../hooks/useStudentsData.js'
import { useCrudModalManager } from '../../hooks/UseCrudModalManager/useCrudModalManager.js'
import apiEstudiantes from '../../api/apiEstudiantes.js'
import {
  modalNewEditEstudiantesFields,
  columnsTableEstudiantesConfig,
} from './estudiantesFormConfigs/EstudiantesFormConfigs.js'

import './Estudiantes.css'

// ─── Celda con truncado y tooltip nativo ─────────────────────────────────────
const TruncatedCell = ({ value }) => {
  const spanRef = useRef(null)
  const [overflow, setOverflow] = useState(false)

  useEffect(() => {
    const el = spanRef.current
    if (el) setOverflow(el.scrollWidth > el.clientWidth + 1)
  }, [value])

  return (
    <span
      ref={spanRef}
      className="est-cell-text"
      title={overflow ? String(value ?? '') : undefined}
    >
      {value ?? '—'}
    </span>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Estudiantes() {
  const [globalFilter, setGlobalFilter] = useState('')
  const [density, setDensity] = useState('normal')   // 'compact' | 'normal' | 'comfortable'
  const [pagination, setPagination] = useState({ first: 0, rows: 10 })
  const [selectedRowData, setSelectedRowData] = useState(null)
  const [expandedRows, setExpandedRows] = useState(null)
  const menuRef = useRef(null)

  const { studentsData, setStudentsData, total, loading } = useStudentsData({
    skip: pagination.first,
    limit: pagination.rows,
  })

  const { editModal, deleteModal, openEdit, closeEdit, openDelete, closeDelete, handleSave, handleDelete } =
    useCrudModalManager({
      createApi: apiEstudiantes.create,
      updateApi: apiEstudiantes.update,
      deleteApi: apiEstudiantes.remove,
      setData: setStudentsData,
    })

  // Cierra el menú popup al desmontar
  useEffect(() => () => menuRef.current?.hide(), [])

  // ── Menú contextual por fila ──────────────────────────────────────────────
  const rowMenuItems = [
    {
      label: 'Editar',
      icon: 'pi pi-pencil',
      command: () => { openEdit(selectedRowData); menuRef.current?.hide() },
    },
    { separator: true },
    {
      label: 'Eliminar',
      icon: 'pi pi-trash',
      className: 'est-menu-danger',
      command: () => { openDelete(selectedRowData); menuRef.current?.hide() },
    },
  ]

  // ── Templates de columna ─────────────────────────────────────────────────
  const dniBadgeTemplate = (row) => (
    <span className="est-dni-badge">{row.dni ?? '—'}</span>
  )

  const actionsTemplate = (row) => (
    <Button
      icon="pi pi-ellipsis-v"
      rounded
      text
      severity="secondary"
      className="est-action-btn"
      aria-label="Opciones"
      onClick={(e) => {
        e.stopPropagation()
        setSelectedRowData(row)
        menuRef.current?.toggle(e)
      }}
    />
  )

  // ── Template de expansión de fila ────────────────────────────────────────
  const formatDate = (val) => {
    if (!val) return '—'
    const [y, m, d] = String(val).split('-')
    return d && m && y ? `${d}/${m}/${y}` : val
  }

  const rowExpansionTemplate = (row) => {
    const fields = [
      { label: 'Domicilio',     value: row.domicilio    },
      { label: 'Localidad',     value: row.localidad    },
      { label: 'Nacionalidad',  value: row.nacionalidad },
      { label: 'Celular',       value: row.telefono     },
      { label: 'Fecha de Alta', value: formatDate(row.created_at) },
    ]

    const hasAny = fields.some((f) => f.value)

    return (
      <div className="est-expansion-panel">
        {hasAny ? (
          <div className="est-expansion-grid">
            {fields.map(({ label, value }) => (
              <div key={label} className="est-expansion-field">
                <span className="est-expansion-label">{label}</span>
                <span className="est-expansion-value">{value || '—'}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="est-expansion-empty">Sin datos adicionales registrados.</span>
        )}
      </div>
    )
  }

  // ── Header de la tabla ────────────────────────────────────────────────────
  const tableHeader = (
    <div className="est-table-header">
      {/* Selector de densidad */}
      <div className="est-density-group" role="group" aria-label="Densidad de tabla">
        {[
          { key: 'compact', label: 'Compacto' },
          { key: 'normal',  label: 'Normal'   },
          { key: 'comfortable', label: 'Amplio' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`est-density-btn${density === key ? ' active' : ''}`}
            onClick={() => setDensity(key)}
            aria-pressed={density === key}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Buscador global */}
      <div className="est-search-wrap">
        <span className="est-search-icon pi pi-search" aria-hidden="true" />
        <input
          className="est-search-input"
          type="text"
          placeholder="Buscar estudiante..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          aria-label="Buscar estudiante"
        />
        {globalFilter && (
          <button
            className="est-search-clear"
            onClick={() => setGlobalFilter('')}
            aria-label="Limpiar búsqueda"
          >
            <span className="pi pi-times" />
          </button>
        )}
      </div>
    </div>
  )

  // ── Paginador personalizado ───────────────────────────────────────────────
  const paginatorTemplate = {
    layout: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport',
    CurrentPageReport: ({ first, last, totalRecords }) => (
      <span className="est-paginator-info">
        {first}–{last} de <strong>{totalRecords}</strong> estudiantes
      </span>
    ),
  }

  return (
    <div className="est-page">

      {/* ── Page title ── */}
      <div className="est-page-title">
        <CIcon icon={cilPeople} className="est-page-icon" />
        <div>
          <h1 className="est-h1">Estudiantes</h1>
          <p className="est-subtitle">Gestión de alumnos del establecimiento</p>
        </div>
      </div>

      <CContainer fluid className="px-0">
        <CCard className="est-card">

          {/* ── Encabezado ── */}
          <CCardHeader className="est-card-header">
            <div className="est-header-left">
              <span className="est-header-title">Listado de estudiantes</span>
              {!loading && (
                <CBadge color="primary" className="est-total-badge">
                  {total}
                </CBadge>
              )}
            </div>
            <div className="est-header-actions">
              <CButton
                color="primary"
                size="sm"
                className="est-btn-new"
                onClick={() => openEdit()}
              >
                <CIcon icon={cilPlus} className="me-1" />
                Nuevo estudiante
              </CButton>
            </div>
          </CCardHeader>

          {/* ── Cuerpo ── */}
          <CCardBody className="est-card-body">

            <TieredMenu
              model={rowMenuItems}
              popup
              ref={menuRef}
              appendTo={document.body}
              onHide={() => setSelectedRowData(null)}
              className="est-context-menu"
            />

            <div className={`est-table-wrap density-${density}`}>
              <DataTable
                value={studentsData}
                header={tableHeader}
                dataKey="id_entidad"
                loading={loading}
                stripedRows
                removableSort
                sortField="apellido"
                sortOrder={1}
                // Expansión de fila
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data)}
                rowExpansionTemplate={rowExpansionTemplate}
                // Paginación server-side
                paginator
                lazy
                totalRecords={total}
                rows={pagination.rows}
                rowsPerPageOptions={[5, 10, 25, 50]}
                paginatorPosition="bottom"
                paginatorTemplate={paginatorTemplate}
                first={pagination.first}
                onPage={(e) => setPagination({ first: e.first, rows: e.rows })}
                // Búsqueda global client-side sobre la página cargada
                globalFilter={globalFilter}
                emptyMessage={
                  <div className="est-empty">
                    <span className="pi pi-users est-empty-icon" />
                    <p>No se encontraron estudiantes.</p>
                    {globalFilter && (
                      <p className="est-empty-hint">
                        Intentá con otro término o{' '}
                        <button className="est-empty-clear" onClick={() => setGlobalFilter('')}>
                          limpiar la búsqueda
                        </button>.
                      </p>
                    )}
                  </div>
                }
                tableStyle={{ minWidth: '100%', tableLayout: 'fixed' }}
                className="p-datatable-sm"
                rowHover
              >
                {/* Expander de fila */}
                <Column expander style={{ width: '3rem' }} className="est-expander-col" />

                {/* Columnas dinámicas desde config */}
                {columnsTableEstudiantesConfig.map((col) => (
                  <Column
                    key={col.field}
                    field={col.field}
                    header={col.header}
                    sortable={col.sortable}
                    style={{ width: col.width }}
                    body={
                      col.field === 'dni'
                        ? dniBadgeTemplate
                        : col.body
                          ? col.body
                          : (row) => <TruncatedCell value={row[col.field]} />
                    }
                  />
                ))}

                {/* Columna de acciones */}
                <Column
                  header=""
                  body={actionsTemplate}
                  style={{ width: '3.25rem', textAlign: 'center' }}
                  frozen
                  alignFrozen="right"
                />
              </DataTable>
            </div>
          </CCardBody>
        </CCard>

        {/* ── Modales ── */}
        <ModalNewEdit
          visible={editModal.visible}
          onClose={closeEdit}
          title={editModal.item ? 'Editar estudiante' : 'Nuevo estudiante'}
          initialData={editModal.item || {}}
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
    </div>
  )
}
