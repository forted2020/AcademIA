// frontend_AcademiA/src/components/enrollment/GenericEnrollment.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { CSpinner, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilUser, cilArrowRight, cilArrowLeft,
  cilChevronDoubleRight, cilChevronDoubleLeft,
  cilCheckAlt, cilWarning,
} from '@coreui/icons'

import api from '../../api/api.js'
import { useToast } from '../../context/ToastContext'
import './GenericEnrollment.css'

// ── Select con indicador de paso ──────────────────────────
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
function AlumnoItem({ item, selected, onClick, yaInscripto }) {
  return (
    <div
      className={`enr-item${selected ? ' is-selected' : ''}${yaInscripto ? ' is-ya-inscripto' : ''}`}
      onClick={onClick}
      title={yaInscripto ? 'Este alumno ya está inscripto en el curso destino' : undefined}
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
      <div className="enr-item-badges">
        <EstadoBadge estado={item.estado} />
        {yaInscripto && (
          <span className="enr-ya-inscripto-badge">Ya inscripto</span>
        )}
      </div>
    </div>
  )
}

// ── Panel de lista ────────────────────────────────────────
function ListPanel({ title, count, items, selectedIds, onToggle, searchPlaceholder, emptyText, yaInscriptosIds }) {
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
              yaInscripto={yaInscriptosIds?.has(item.id_entidad)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// ── Indicador de progreso de pasos ───────────────────────
function ProgresoFiltros({ origenCompleto, destinoCompleto }) {
  const pasos = [
    { label: 'Elegí el origen', done: origenCompleto },
    { label: 'Seleccioná alumnos', done: origenCompleto },
    { label: 'Elegí el destino', done: destinoCompleto },
    { label: 'Confirmá', done: false },
  ]
  const activo = pasos.findIndex((p) => !p.done)

  return (
    <div className="enr-progreso">
      {pasos.map((p, i) => (
        <React.Fragment key={i}>
          <div className={`enr-progreso-paso${p.done ? ' is-done' : i === activo ? ' is-active' : ''}`}>
            <div className="enr-progreso-circulo">
              {p.done ? <i className="pi pi-check" style={{ fontSize: '0.6rem' }} /> : i + 1}
            </div>
            <span className="enr-progreso-label">{p.label}</span>
          </div>
          {i < pasos.length - 1 && (
            <div className={`enr-progreso-linea${p.done ? ' is-done' : ''}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────
export default function GenericEnrollment({ config }) {
  const { showSuccess, showError, showWarn } = useToast()

  const [selections, setSelections]     = useState({})
  const [optionsMap, setOptionsMap]     = useState({})
  const [sourceList, setSourceList]     = useState([])
  const [targetList, setTargetList]     = useState([])
  const [selectedSource, setSelectedSource] = useState(new Set())
  const [selectedTarget, setSelectedTarget] = useState(new Set())
  const [loadingSource, setLoadingSource]   = useState(false)
  const [yaInscriptosIds, setYaInscriptosIds] = useState(new Set())
  const [confirmando, setConfirmando]   = useState(false)

  const filters = config.filters ?? []

  // ── Cargar opciones de selectores (respeta dependencias) ──
  // Separado del trigger de alumnos para evitar recargas innecesarias
  useEffect(() => {
    filters.forEach((f) => {
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

  // ── Cargar alumnos del curso ORIGEN (solo cuando curso_origen cambia) ──
  const cursoOrigenRef = useRef(null)
  useEffect(() => {
    const cursoOrigen = selections.curso_origen
    if (cursoOrigen === cursoOrigenRef.current) return
    cursoOrigenRef.current = cursoOrigen

    const endpoint = config.getSourceEndpoint?.(selections)
    if (!endpoint) {
      setSourceList([])
      setTargetList([])
      return
    }
    setLoadingSource(true)
    api.get(`/${endpoint}`)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? [])
        setSourceList(data)
        setTargetList([])
        setSelectedSource(new Set())
        setSelectedTarget(new Set())
      })
      .catch(() => setSourceList([]))
      .finally(() => setLoadingSource(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections.curso_origen])

  // ── Cargar alumnos ya inscriptos en el DESTINO ──────────
  useEffect(() => {
    const endpoint = config.getYaInscriptosEndpoint?.(selections)
    if (!endpoint) {
      setYaInscriptosIds(new Set())
      return
    }
    api.get(`/${endpoint}`)
      .then((res) => {
        setYaInscriptosIds(new Set(res.data?.ids ?? []))
      })
      .catch(() => setYaInscriptosIds(new Set()))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections.curso_destino, selections.ciclo_destino])

  const handleSelect = (key, value) => {
    setSelections((prev) => {
      const next = { ...prev, [key]: value }
      filters.forEach((f) => {
        if (f.dependsOn === key) next[f.key] = null
      })
      return next
    })
  }

  // ── Movimientos ───────────────────────────────────────
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

  // ── Confirmar inscripción ─────────────────────────────
  const handleConfirmar = async () => {
    const cicloDest = Number(selections.ciclo_destino)
    const cursoDest = Number(selections.curso_destino)
    const tipoInsc  = Number(selections.id_tipo_insc)

    if (!cicloDest || !cursoDest || !tipoInsc) {
      showWarn('Completá todos los filtros de destino antes de confirmar.')
      return
    }
    if (targetList.length === 0) return

    setConfirmando(true)
    try {
      const res = await api.post(`/${config.postEndpoint}`, {
        alumnos: targetList.map((a) => ({ id_entidad: a.id_entidad })),
        id_ciclo_lectivo: cicloDest,
        id_curso_destino: cursoDest,
        id_tipo_insc: tipoInsc,
      })
      const { inscripciones_creadas, inscripciones_omitidas } = res.data
      showSuccess(
        `${inscripciones_creadas} inscripción${inscripciones_creadas !== 1 ? 'es' : ''} creada${inscripciones_creadas !== 1 ? 's' : ''}.` +
        (inscripciones_omitidas > 0 ? ` ${inscripciones_omitidas} ya existían.` : '')
      )
      // Devolver los inscriptos al origen y actualizar ya-inscriptos
      setSourceList((prev) => [...prev, ...targetList])
      setTargetList([])
      setSelectedSource(new Set())
      setSelectedTarget(new Set())
      // Recargar ya-inscriptos para que los badges se actualicen
      const endpointYa = config.getYaInscriptosEndpoint?.(selections)
      if (endpointYa) {
        api.get(`/${endpointYa}`)
          .then((r) => setYaInscriptosIds(new Set(r.data?.ids ?? [])))
          .catch(() => {})
      }
    } catch (err) {
      const raw = err?.response?.data?.detail
      const msg = Array.isArray(raw)
        ? raw.map((e) => `${e.campo ?? ''}: ${e.mensaje ?? e.msg ?? ''}`).join(' | ')
        : (typeof raw === 'string' ? raw : 'Error al confirmar la inscripción.')
      showError(msg)
    } finally {
      setConfirmando(false)
    }
  }

  // ── Helpers de render ─────────────────────────────────
  const isEnabled = (f) => !f.dependsOn || !!selections[f.dependsOn]

  const filtersByGroup = filters.reduce((acc, f) => {
    const g = f.group ?? '__flat__'
    if (!acc[g]) acc[g] = []
    acc[g].push(f)
    return acc
  }, {})

  const renderFilterSelect = (f, stepLabel) => {
    const opts = (optionsMap[f.key] ?? []).map((item) => ({
      value: item[f.optionValue],
      label: item[f.optionLabel],
    }))
    const enabled = isEnabled(f)
    const prevLabel = f.dependsOn
      ? filters.find((x) => x.key === f.dependsOn)?.label?.toLowerCase() ?? 'el anterior'
      : ''
    return (
      <FilterSelect
        key={f.key}
        step={stepLabel}
        label={f.label}
        value={selections[f.key] ?? ''}
        onChange={(val) => handleSelect(f.key, val)}
        options={opts}
        placeholder={enabled ? `Seleccioná ${f.label.toLowerCase()}` : `Primero elegí ${prevLabel}`}
        disabled={!enabled}
      />
    )
  }

  const origenCompleto = !!(selections.ciclo_origen && selections.curso_origen)
  const destinoCompleto = !!(selections.ciclo_destino && selections.curso_destino && selections.id_tipo_insc)
  const destinoIncompleto = !destinoCompleto && targetList.length > 0

  const yaInscriptosEnTarget = targetList.filter((a) => yaInscriptosIds.has(a.id_entidad)).length

  return (
    <div className="enr-wrapper">

      {/* ── Barra de progreso ── */}
      <ProgresoFiltros origenCompleto={origenCompleto} destinoCompleto={destinoCompleto} />

      {/* ── Filtros: Origen y Destino alineados con el picklist ── */}
      <div className="enr-filter-groups">
        {/* Grupo Origen */}
        <div className="enr-filter-group">
          <span className="enr-filter-group-label">Origen</span>
          <div className="enr-filter-group-fields">
            {(filtersByGroup['origen'] ?? []).map((f, i) => renderFilterSelect(f, i + 1))}
          </div>
        </div>

        <div className="enr-filter-groups-spacer" />

        {/* Grupo Destino */}
        <div className="enr-filter-group">
          <span className="enr-filter-group-label">Destino</span>
          <div className="enr-filter-group-fields enr-filter-group-fields--destino">
            {(filtersByGroup['destino'] ?? []).map((f, i) => renderFilterSelect(f, i + 1))}
          </div>
        </div>
      </div>

      {/* ── Aviso si hay alumnos ya inscriptos en el destino ── */}
      {yaInscriptosIds.size > 0 && sourceList.length > 0 && (
        <div className="enr-aviso-inscriptos">
          <CIcon icon={cilWarning} className="enr-aviso-icon" />
          <span>
            <strong>{yaInscriptosIds.size}</strong> alumno{yaInscriptosIds.size !== 1 ? 's' : ''} del
            curso origen {yaInscriptosIds.size !== 1 ? 'ya están inscriptos' : 'ya está inscripto'} en
            el curso destino y se marcan en naranja.
          </span>
        </div>
      )}

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
            emptyText="Seleccioná un curso de origen para ver los alumnos."
            yaInscriptosIds={yaInscriptosIds}
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
            yaInscriptosIds={yaInscriptosIds}
          />
        </div>
      )}

      {/* ── Footer — botón confirmar ── */}
      <div className="enr-footer">
        <div className="enr-footer-info">
          {targetList.length > 0 ? (
            <>
              <strong>{targetList.length}</strong> alumno{targetList.length !== 1 ? 's' : ''} listo{targetList.length !== 1 ? 's' : ''} para inscribir
              {yaInscriptosEnTarget > 0 && (
                <span className="enr-footer-warn">
                  <CIcon icon={cilWarning} style={{ width: '0.8rem', height: '0.8rem' }} />
                  {yaInscriptosEnTarget} ya inscripto{yaInscriptosEnTarget !== 1 ? 's' : ''} (se omitirán)
                </span>
              )}
            </>
          ) : (
            'Seleccioná los alumnos a inscribir'
          )}
        </div>

        <CButton
          className="enr-btn-confirm"
          disabled={targetList.length === 0 || confirmando || !destinoCompleto}
          onClick={handleConfirmar}
          title={destinoIncompleto ? 'Completá el ciclo, curso y tipo de inscripción de destino' : undefined}
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
