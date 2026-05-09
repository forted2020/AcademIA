// frontend_AcademiA/src/components/enrollment/GenericEnrollment.jsx

import React, { useState, useEffect } from 'react'
import {
  CSpinner, CButton, CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilUser, cilArrowRight, cilArrowLeft,
  cilChevronDoubleRight, cilChevronDoubleLeft,
  cilCheckAlt,
} from '@coreui/icons'

import api from '../../api/api.js'
import './GenericEnrollment.css'

// ── Select con el mismo formato que ActaExamen ────────────
function FilterSelect({ label, value, onChange, options, placeholder, disabled, step }) {
  const isReady = !disabled
  return (
    <div className="acta-filter-field">
      <label className="acta-filter-label">
        <span className={`acta-filter-step${isReady ? ' is-ready' : ''}`}>{step}</span>
        {label}
      </label>
      <select
        className={`acta-filter-select${!isReady ? ' is-disabled' : ''}`}
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value ? e.target.value : null)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ── Badge de estado del alumno ────────────────────────────
const ESTADO_COLOR = {
  Regular:    { bg: '#dcfce7', color: '#166534' },
  Recursante: { bg: '#fef9c3', color: '#854d0e' },
  Libre:      { bg: '#fee2e2', color: '#991b1b' },
}

function EstadoBadge({ estado }) {
  const style = ESTADO_COLOR[estado] ?? { bg: '#f1f5f9', color: '#475569' }
  return (
    <span className="enr-estado-badge" style={{ background: style.bg, color: style.color }}>
      {estado ?? 'Sin estado'}
    </span>
  )
}

// ── Item de alumno ────────────────────────────────────────
function AlumnoItem({ item, selected, onClick }) {
  return (
    <div
      className={`enr-item${selected ? ' is-selected' : ''}`}
      onClick={onClick}
    >
      <div className="enr-item-avatar">
        <CIcon icon={cilUser} className="enr-item-avatar-icon" />
      </div>
      <div className="enr-item-info">
        <span className="enr-item-name">{item.apellido}, {item.nombre}</span>
        <span className="enr-item-dni">
          <i className="pi pi-id-card" style={{ fontSize: '0.7rem' }} />
          {item.dni}
        </span>
      </div>
      <EstadoBadge estado={item.estado} />
    </div>
  )
}

// ── Panel de lista ────────────────────────────────────────
function ListPanel({ title, count, items, selectedIds, onToggle, searchPlaceholder, emptyText }) {
  const [search, setSearch] = useState('')

  const filtered = items.filter((i) => {
    const q = search.toLowerCase()
    return (
      i.apellido?.toLowerCase().includes(q) ||
      i.nombre?.toLowerCase().includes(q) ||
      String(i.dni ?? '').includes(q)
    )
  })

  return (
    <div className="enr-panel">
      <div className="enr-panel-header">
        <span className="enr-panel-title">{title}</span>
        <span className="enr-panel-count">{count}</span>
      </div>

      <div className="enr-panel-search-wrap">
        <i className="pi pi-search enr-panel-search-icon" />
        <input
          className="enr-panel-search"
          type="text"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button className="enr-panel-search-clear" onClick={() => setSearch('')}>×</button>
        )}
      </div>

      <div className="enr-panel-list">
        {filtered.length === 0 ? (
          <div className="enr-panel-empty">
            <i className="pi pi-users" style={{ fontSize: '1.75rem', opacity: 0.2 }} />
            <span>{search ? 'Sin resultados para la búsqueda.' : emptyText}</span>
          </div>
        ) : (
          filtered.map((item) => (
            <AlumnoItem
              key={item.id_entidad}
              item={item}
              selected={selectedIds.has(item.id_entidad)}
              onClick={() => onToggle(item.id_entidad)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────
export default function GenericEnrollment({ config }) {
  // ── Valores de los selectores ──────────────────────────
  const [selections, setSelections] = useState({})

  // ── Datos cargados para cada selector ─────────────────
  const [optionsMap, setOptionsMap] = useState({})

  // ── PickList ───────────────────────────────────────────
  const [sourceList, setSourceList] = useState([])
  const [targetList, setTargetList] = useState([])
  const [selectedSource, setSelectedSource] = useState(new Set())
  const [selectedTarget, setSelectedTarget] = useState(new Set())
  const [loadingSource, setLoadingSource] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const [resultado, setResultado] = useState(null) // { tipo: 'success'|'error', mensaje: '' }

  const filters = config.filters ?? []

  // Carga las opciones de cada filtro, respetando dependencias
  useEffect(() => {
    filters.forEach((f) => {
      // Si depende de otro selector y ese no tiene valor, limpiar y salir
      if (f.dependsOn && !selections[f.dependsOn]) {
        setOptionsMap((prev) => ({ ...prev, [f.key]: [] }))
        return
      }

      const endpoint = typeof f.endpoint === 'function'
        ? f.endpoint(selections)
        : f.endpoint

      if (!endpoint) return

      api.get(`/${endpoint}`)
        .then((res) => {
          const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
          setOptionsMap((prev) => ({ ...prev, [f.key]: data }))
        })
        .catch(() => setOptionsMap((prev) => ({ ...prev, [f.key]: [] })))
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selections)])

  const handleSelect = (key, value) => {
    setSelections((prev) => {
      const next = { ...prev, [key]: value }
      // Limpiar selectores que dependen del que cambió
      filters.forEach((f) => {
        if (f.dependsOn === key) {
          next[f.key] = null
        }
      })
      return next
    })
  }

  // Carga alumnos cuando los filtros necesarios están completos
  useEffect(() => {
    const endpoint = config.getSourceEndpoint?.(selections)
    if (!endpoint) {
      setSourceList([])
      return
    }
    setLoadingSource(true)
    api.get(`/${endpoint}`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
        setSourceList(data)
      })
      .catch(() => setSourceList([]))
      .finally(() => setLoadingSource(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selections)])

  // ── Movimientos del PickList ───────────────────────────
  const toggleSelected = (set, setFn, id) => {
    setFn((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const moveToTarget = () => {
    const moving = sourceList.filter((i) => selectedSource.has(i.id_entidad))
    setTargetList((prev) => [...prev, ...moving])
    setSourceList((prev) => prev.filter((i) => !selectedSource.has(i.id_entidad)))
    setSelectedSource(new Set())
  }

  const moveToSource = () => {
    const moving = targetList.filter((i) => selectedTarget.has(i.id_entidad))
    setSourceList((prev) => [...prev, ...moving])
    setTargetList((prev) => prev.filter((i) => !selectedTarget.has(i.id_entidad)))
    setSelectedTarget(new Set())
  }

  const moveAllToTarget = () => {
    setTargetList((prev) => [...prev, ...sourceList])
    setSourceList([])
    setSelectedSource(new Set())
  }

  const moveAllToSource = () => {
    setSourceList((prev) => [...prev, ...targetList])
    setTargetList([])
    setSelectedTarget(new Set())
  }

  // ── Confirmar inscripción ──────────────────────────────
  const handleConfirmar = async () => {
    if (!config.postEndpoint || targetList.length === 0) return

    const cicloDest = Number(selections.ciclo_destino)
    const cursoDest = Number(selections.curso_destino)
    const tipoInsc  = Number(selections.id_tipo_insc)

    if (!cicloDest || !cursoDest || !tipoInsc) {
      setResultado({ tipo: 'warning', mensaje: 'Completá todos los filtros de destino antes de confirmar.' })
      return
    }

    setConfirmando(true)
    setResultado(null)

    const payload = {
      alumnos: targetList.map((a) => ({ id_entidad: a.id_entidad })),
      id_ciclo_lectivo: cicloDest,
      id_curso_destino: cursoDest,
      id_tipo_insc: tipoInsc,
    }

    try {
      const res = await api.post(`/${config.postEndpoint}`, payload)
      const { inscripciones_creadas, inscripciones_omitidas, mensaje } = res.data
      setResultado({ tipo: 'success', mensaje })
      // Limpiar lista destino y devolver alumnos al origen
      setSourceList((prev) => [...prev, ...targetList])
      setTargetList([])
      setSelectedSource(new Set())
      setSelectedTarget(new Set())
    } catch (err) {
      const raw = err?.response?.data?.detail
      let detalle
      if (Array.isArray(raw)) {
        detalle = raw.map((e) => `${e.campo ?? ''}: ${e.mensaje ?? e.msg ?? ''}`).join(' | ')
      } else if (typeof raw === 'string') {
        detalle = raw
      } else {
        detalle = 'Error al confirmar la inscripción.'
      }
      setResultado({ tipo: 'danger', mensaje: detalle })
    } finally {
      setConfirmando(false)
    }
  }

  // ── Determina si un selector está habilitado ───────────
  const isEnabled = (f) => {
    if (!f.dependsOn) return true
    return !!selections[f.dependsOn]
  }

  // ── Step number por posición ───────────────────────────
  const stepNumber = (idx) => idx + 1

  return (
    <div className="enr-wrapper">

      {/* ── Filtros con el mismo formato de ActaExamen ── */}
      <div className="acta-filters-row">
        {filters.map((f, idx) => {
          const opts = (optionsMap[f.key] ?? []).map((item) => ({
            value: item[f.optionValue],
            label: item[f.optionLabel],
          }))
          const enabled = isEnabled(f)
          const hasValue = !!selections[f.key]

          return (
            <FilterSelect
              key={f.key}
              step={stepNumber(idx)}
              label={f.label}
              value={selections[f.key] ?? ''}
              onChange={(val) => handleSelect(f.key, val)}
              options={opts}
              placeholder={enabled ? `Seleccioná ${f.label.toLowerCase()}` : `Primero elegí ${filters[idx - 1]?.label?.toLowerCase() ?? 'el anterior'}`}
              disabled={!enabled}
            />
          )
        })}
      </div>

      {/* ── PickList ── */}
      {loadingSource ? (
        <div className="enr-loading">
          <CSpinner color="primary" />
        </div>
      ) : (
        <div className="enr-picklist">

          <ListPanel
            title={config.pickListConfig?.headerSource ?? 'Disponibles'}
            count={sourceList.length}
            items={sourceList}
            selectedIds={selectedSource}
            onToggle={(id) => toggleSelected(selectedSource, setSelectedSource, id)}
            searchPlaceholder="Buscar por nombre o DNI…"
            emptyText="Completá los filtros para ver los alumnos disponibles."
          />

          <div className="enr-controls">
            <button
              className="enr-ctrl-btn"
              onClick={moveAllToTarget}
              disabled={sourceList.length === 0}
              title="Mover todos →"
            >
              <CIcon icon={cilChevronDoubleRight} style={{ width: '0.9rem', height: '0.9rem' }} />
            </button>
            <button
              className="enr-ctrl-btn enr-ctrl-btn--primary"
              onClick={moveToTarget}
              disabled={selectedSource.size === 0}
              title="Mover seleccionados →"
            >
              <CIcon icon={cilArrowRight} style={{ width: '0.9rem', height: '0.9rem' }} />
            </button>
            <button
              className="enr-ctrl-btn enr-ctrl-btn--primary"
              onClick={moveToSource}
              disabled={selectedTarget.size === 0}
              title="← Devolver seleccionados"
            >
              <CIcon icon={cilArrowLeft} style={{ width: '0.9rem', height: '0.9rem' }} />
            </button>
            <button
              className="enr-ctrl-btn"
              onClick={moveAllToSource}
              disabled={targetList.length === 0}
              title="← Devolver todos"
            >
              <CIcon icon={cilChevronDoubleLeft} style={{ width: '0.9rem', height: '0.9rem' }} />
            </button>
          </div>

          <ListPanel
            title={config.pickListConfig?.headerTarget ?? 'A inscribir'}
            count={targetList.length}
            items={targetList}
            selectedIds={selectedTarget}
            onToggle={(id) => toggleSelected(selectedTarget, setSelectedTarget, id)}
            searchPlaceholder="Buscar en seleccionados…"
            emptyText="Seleccioná alumnos del panel izquierdo."
          />

        </div>
      )}

      {/* ── Resultado de la operación ── */}
      {resultado && (
        <CAlert
          color={resultado.tipo}
          dismissible
          onClose={() => setResultado(null)}
          style={{ marginBottom: 0, fontSize: '0.875rem' }}
        >
          {resultado.mensaje}
        </CAlert>
      )}

      {/* ── Botón confirmar ── */}
      <div className="enr-footer">
        <span className="enr-footer-info">
          {targetList.length > 0
            ? <><strong>{targetList.length}</strong> {targetList.length === 1 ? 'alumno listo' : 'alumnos listos'} para inscribir</>
            : 'Seleccioná los alumnos a inscribir'
          }
        </span>
        <CButton
          className="enr-btn-confirm"
          disabled={targetList.length === 0 || confirmando}
          onClick={handleConfirmar}
        >
          {confirmando
            ? <CSpinner size="sm" className="me-2" />
            : <CIcon icon={cilCheckAlt} className="me-2" style={{ width: '0.9rem', height: '0.9rem' }} />
          }
          {confirmando ? 'Inscribiendo…' : 'Confirmar Inscripción'}
        </CButton>
      </div>

    </div>
  )
}
