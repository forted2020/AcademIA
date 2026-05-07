// frontend_AcademiA/src/views/docentes/Docentes.jsx

import React, { useState, useEffect, useRef } from 'react'
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
import { useCrudModalManager } from '../../hooks/UseCrudModalManager/useCrudModalManager.js'
import { getDocentes, createDocente, updateDocente, deleteDocente } from '../../api/api.js'
import { docenteFields } from '../../utils/FormConfigs/formConfigs.js'
import { formatDisplayDate, getTodayDate } from '../../utils/dateUtils/DateUtils.js'

import './Docentes.css'

// ─── Celda con truncado + tooltip nativo ──────────────────────────────────────
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
      className="doc-cell-text"
      title={overflow ? String(value ?? '') : undefined}
    >
      {value ?? '—'}
    </span>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function Docentes() {
  const [tableData, setTableData]       = useState([])
  const [total, setTotal]               = useState(0)
  const [loading, setLoading]           = useState(false)
  const [globalFilter, setGlobalFilter] = useState('')
  const [density, setDensity]           = useState('normal')
  const [pagination, setPagination]     = useState({ first: 0, rows: 10 })
  const [selectedRowData, setSelectedRowData] = useState(null)
  const menuRef = useRef(null)

  const { editModal, deleteModal, openEdit, closeEdit, openDelete, closeDelete, handleSave, handleDelete } =
    useCrudModalManager({
      createApi: createDocente,
      updateApi: updateDocente,
      deleteApi: deleteDocente,
      setData: setTableData,
    })

  // Fetch server-side
  useEffect(() => {
    setLoading(true)
    getDocentes({ params: { skip: pagination.first, limit: pagination.rows } })
      .then((res) => {
        const payload = res?.data
        const items = Array.isArray(payload) ? payload : (payload?.data ?? [])
        setTableData(items)
        setTotal(payload?.total ?? items.length)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [pagination.first, pagination.rows])

  useEffect(() => () => menuRef.current?.hide(), [])

  // ── Menú contextual ───────────────────────────────────────────────────────
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
      className: 'doc-menu-danger',
      command: () => { openDelete(selectedRowData); menuRef.current?.hide() },
    },
  ]

  // ── Templates ─────────────────────────────────────────────────────────────
  const actionsTemplate = (row) => (
    <Button
      icon="pi pi-ellipsis-v"
      rounded text severity="secondary"
      className="doc-action-btn"
      aria-label="Opciones"
      onClick={(e) => {
        e.stopPropagation()
        setSelectedRowData(row)
        menuRef.current?.toggle(e)
      }}
    />
  )

  const fechaTemplate = (row) => (
    <TruncatedCell value={formatDisplayDate(row.fec_nac)} />
  )

  // ── Header de tabla ───────────────────────────────────────────────────────
  const tableHeader = (
    <div className="doc-table-header">
      <div className="doc-density-group" role="group" aria-label="Densidad">
        {[
          { key: 'compact',     label: 'Compacto' },
          { key: 'normal',      label: 'Normal'   },
          { key: 'comfortable', label: 'Amplio'   },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`doc-density-btn${density === key ? ' active' : ''}`}
            onClick={() => setDensity(key)}
            aria-pressed={density === key}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="doc-search-wrap">
        <span className="doc-search-icon pi pi-search" aria-hidden="true" />
        <input
          className="doc-search-input"
          type="text"
          placeholder="Buscar docente..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          aria-label="Buscar docente"
        />
        {globalFilter && (
          <button
            className="doc-search-clear"
            onClick={() => setGlobalFilter('')}
            aria-label="Limpiar búsqueda"
          >
            <span className="pi pi-times" />
          </button>
        )}
      </div>
    </div>
  )

  // ── Paginador ─────────────────────────────────────────────────────────────
  const paginatorTemplate = {
    layout: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport',
    CurrentPageReport: (options) => (
      <span className="doc-paginator-info">
        {options.first}–{options.last} de <strong>{options.totalRecords}</strong> docentes
      </span>
    ),
  }

  // ── Columnas ──────────────────────────────────────────────────────────────
  const columnas = [
    { field: 'apellido', header: 'Apellido',    sortable: true,  width: '20%' },
    { field: 'nombre',   header: 'Nombre',      sortable: true,  width: '20%' },
    { field: 'fec_nac',  header: 'Fecha Nac.',  sortable: true,  width: '120px', body: fechaTemplate },
    { field: 'email',    header: 'Email',        sortable: false, width: '28%' },
    { field: 'tel_cel',  header: 'Tel / Cel',    sortable: false, width: '130px' },
  ]

  return (
    <div className="doc-page">

      {/* ── Título de página ── */}
      <div className="doc-page-title">
        <CIcon icon={cilPeople} className="doc-page-icon" />
        <div>
          <h1 className="doc-h1">Docentes</h1>
          <p className="doc-subtitle">Gestión del cuerpo docente del establecimiento</p>
        </div>
      </div>

      <CContainer fluid className="px-0">
        <CCard className="doc-card">

          {/* ── Encabezado ── */}
          <CCardHeader className="doc-card-header">
            <div className="doc-header-left">
              <span className="doc-header-title">Listado de docentes</span>
              {!loading && (
                <CBadge color="primary" className="doc-total-badge">{total}</CBadge>
              )}
            </div>
            <div className="doc-header-actions">
              <CButton
                color="primary"
                size="sm"
                className="doc-btn-new"
                onClick={() => openEdit()}
              >
                <CIcon icon={cilPlus} className="me-1" />
                Nuevo docente
              </CButton>
            </div>
          </CCardHeader>

          {/* ── Cuerpo ── */}
          <CCardBody className="doc-card-body">

            <TieredMenu
              model={rowMenuItems}
              popup
              ref={menuRef}
              appendTo={document.body}
              onHide={() => setSelectedRowData(null)}
              className="doc-context-menu"
            />

            <div className={`doc-table-wrap density-${density}`}>
              <DataTable
                value={tableData}
                header={tableHeader}
                dataKey="id_entidad"
                loading={loading}
                stripedRows
                removableSort
                sortField="apellido"
                sortOrder={1}
                paginator
                lazy
                totalRecords={total}
                rows={pagination.rows}
                rowsPerPageOptions={[5, 10, 25, 50]}
                paginatorPosition="bottom"
                paginatorTemplate={paginatorTemplate}
                first={pagination.first}
                onPage={(e) => setPagination({ first: e.first, rows: e.rows })}
                globalFilter={globalFilter}
                emptyMessage={
                  <div className="doc-empty">
                    <span className="pi pi-users doc-empty-icon" />
                    <p>No se encontraron docentes.</p>
                    {globalFilter && (
                      <p className="doc-empty-hint">
                        Intentá con otro término o{' '}
                        <button className="doc-empty-clear" onClick={() => setGlobalFilter('')}>
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
                {columnas.map((col) => (
                  <Column
                    key={col.field}
                    field={col.field}
                    header={col.header}
                    sortable={col.sortable}
                    style={{ width: col.width }}
                    body={col.body ?? ((row) => <TruncatedCell value={row[col.field]} />)}
                  />
                ))}

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
          title={editModal.item ? 'Editar docente' : 'Nuevo docente'}
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
    </div>
  )
}
