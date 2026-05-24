// views/cursos/ModalDetalleCurso.jsx
// Modal de detalle de un curso: alumnos inscriptos y materias.
// Incluye sub-panel de inscripción rápida desde la pestaña de alumnos.

import React, { useState, useEffect, useRef, useCallback } from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilUser, cilBook, cilX, cilSearch, cilSchool,
  cilPlus, cilCheckAlt, cilWarning, cilArrowLeft,
} from '@coreui/icons'
import { CSpinner } from '@coreui/react'
import api from '../../api/api'
import { useToast } from '../../context/ToastContext'
import './ModalDetalleCurso.css'

// ── Tab button ────────────────────────────────────────────
function TabButton({ active, onClick, icon, label, count }) {
  return (
    <button className={`mdc-tab${active ? ' is-active' : ''}`} onClick={onClick}>
      <CIcon icon={icon} className="mdc-tab-icon" />
      {label}
      {count != null && (
        <span className={`mdc-tab-badge${active ? ' is-active' : ''}`}>{count}</span>
      )}
    </button>
  )
}

// ── Fila de alumno inscripto ──────────────────────────────
function AlumnoRow({ alumno, index }) {
  return (
    <div className={`mdc-alumno-row${index % 2 === 0 ? ' is-even' : ''}`}>
      <div className="mdc-alumno-avatar">
        {alumno.apellido?.[0]?.toUpperCase() ?? '?'}
      </div>
      <div className="mdc-alumno-info">
        <span className="mdc-alumno-nombre">{alumno.apellido}, {alumno.nombre}</span>
        <span className="mdc-alumno-meta">
          DNI {alumno.dni}
          {alumno.legajo && <> · Leg. {alumno.legajo}</>}
          {alumno.email && <> · {alumno.email}</>}
        </span>
      </div>
      <span className="mdc-alumno-index">#{index + 1}</span>
    </div>
  )
}

// ── Fila de materia ───────────────────────────────────────
function MateriaRow({ materia, index }) {
  return (
    <div className={`mdc-materia-row${index % 2 === 0 ? ' is-even' : ''}`}>
      <div className="mdc-materia-icon-wrap">
        <CIcon icon={cilBook} className="mdc-materia-icon" />
      </div>
      <div className="mdc-materia-info">
        <span className="mdc-materia-nombre">{materia.nombre_materia}</span>
        <span className="mdc-materia-docente">{materia.docente}</span>
      </div>
    </div>
  )
}

// ── Resultado de búsqueda para inscripción ────────────────
function AlumnoBuscadoRow({ alumno, seleccionado, onClick }) {
  return (
    <button
      className={`mdc-insc-result${seleccionado ? ' is-selected' : ''}`}
      onClick={onClick}
    >
      <div className="mdc-alumno-avatar mdc-alumno-avatar--sm">
        {alumno.apellido?.[0]?.toUpperCase() ?? '?'}
      </div>
      <div className="mdc-alumno-info">
        <span className="mdc-alumno-nombre">{alumno.apellido}, {alumno.nombre}</span>
        <span className="mdc-alumno-meta">DNI {alumno.dni}{alumno.legajo ? ` · Leg. ${alumno.legajo}` : ''}</span>
      </div>
      {seleccionado && (
        <CIcon icon={cilCheckAlt} className="mdc-insc-check" />
      )}
    </button>
  )
}

// ── Panel de inscripción rápida ───────────────────────────
function PanelInscripcionRapida({ curso, onVolver, onInscripto }) {
  const { showSuccess, showError } = useToast()

  const [query, setQuery]             = useState('')
  const [resultados, setResultados]   = useState([])
  const [buscando, setBuscando]       = useState(false)
  const [seleccionado, setSeleccionado] = useState(null)
  const [tipos, setTipos]             = useState([])
  const [idTipoInsc, setIdTipoInsc]   = useState('')
  const [inscribiendo, setInscribiendo] = useState(false)
  const debounceRef = useRef(null)
  const inputRef    = useRef(null)

  // Cargar tipos de inscripción al montar
  useEffect(() => {
    api.get('/api/inscripciones/tipos/')
      .then((r) => {
        setTipos(r.data ?? [])
        if (r.data?.length === 1) setIdTipoInsc(String(r.data[0].id_tipo_insc))
      })
      .catch(() => {})
    inputRef.current?.focus()
  }, [])

  // Búsqueda con debounce de 350ms
  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResultados([])
      return
    }
    setBuscando(true)
    debounceRef.current = setTimeout(() => {
      api.get(`/api/estudiantes/?search=${encodeURIComponent(query.trim())}&limit=20`)
        .then((r) => {
          const data = Array.isArray(r.data) ? r.data : (r.data?.data ?? [])
          setResultados(data)
        })
        .catch(() => setResultados([]))
        .finally(() => setBuscando(false))
    }, 350)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  const handleInscribir = async () => {
    if (!seleccionado || !idTipoInsc) return
    setInscribiendo(true)
    try {
      const res = await api.post('/api/inscripciones/inscribir-lote', {
        alumnos: [{ id_entidad: seleccionado.id_entidad }],
        id_ciclo_lectivo: curso.ciclo?.id_ciclo_lectivo,
        id_curso_destino: curso.id_curso,
        id_tipo_insc: Number(idTipoInsc),
      })
      const { inscripciones_creadas, inscripciones_omitidas } = res.data
      if (inscripciones_creadas > 0) {
        showSuccess(`${seleccionado.apellido}, ${seleccionado.nombre} inscripto/a correctamente.`)
        onInscripto()   // recarga la lista de alumnos del padre
        onVolver()
      } else {
        showError('El alumno ya está inscripto en este curso.')
      }
    } catch (e) {
      const msg = e?.response?.data?.detail
      showError(typeof msg === 'string' ? msg : 'Error al inscribir el alumno.')
    } finally {
      setInscribiendo(false)
    }
  }

  const puedeInscribir = seleccionado && idTipoInsc

  return (
    <div className="mdc-insc-panel">

      {/* Sub-header */}
      <div className="mdc-insc-subheader">
        <button className="mdc-insc-volver" onClick={onVolver}>
          <CIcon icon={cilArrowLeft} style={{ width: '0.8rem', height: '0.8rem' }} />
          Volver
        </button>
        <span className="mdc-insc-titulo">Inscribir alumno en <strong>{curso.curso}</strong></span>
      </div>

      <div className="mdc-insc-content">

        {/* Paso 1: Buscar alumno */}
        <div className="mdc-insc-paso">
          <div className="mdc-insc-paso-label">
            <span className="mdc-insc-paso-num">1</span>
            Buscar alumno
          </div>

          {seleccionado ? (
            /* Alumno ya elegido: muestra chip con opción de cambiar */
            <div className="mdc-insc-seleccionado">
              <CIcon icon={cilCheckAlt} className="mdc-insc-seleccionado-icon" />
              <span><strong>{seleccionado.apellido}, {seleccionado.nombre}</strong> — DNI {seleccionado.dni}</span>
              <button
                className="mdc-search-clear"
                style={{ marginLeft: 'auto' }}
                onClick={() => { setSeleccionado(null); setQuery(''); setResultados([]); setTimeout(() => inputRef.current?.focus(), 50) }}
                title="Cambiar alumno"
              >×</button>
            </div>
          ) : (
            /* Sin selección: muestra el buscador y los resultados */
            <>
              <div className="mdc-insc-search-wrap">
                <CIcon icon={cilSearch} className="mdc-search-icon" />
                <input
                  ref={inputRef}
                  className="mdc-search"
                  type="text"
                  placeholder="Nombre, apellido o DNI…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button className="mdc-search-clear" onClick={() => { setQuery(''); setResultados([]) }}>×</button>
                )}
              </div>

              <div className="mdc-insc-results">
                {buscando && (
                  <div className="mdc-insc-results-loading">
                    <CSpinner size="sm" /> Buscando…
                  </div>
                )}
                {!buscando && query.trim().length >= 2 && resultados.length === 0 && (
                  <div className="mdc-insc-results-empty">Sin resultados para "{query}"</div>
                )}
                {!buscando && resultados.map((a) => (
                  <AlumnoBuscadoRow
                    key={a.id_entidad}
                    alumno={a}
                    seleccionado={false}
                    onClick={() => { setSeleccionado(a); setResultados([]) }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Paso 2: Tipo de inscripción */}
        <div className="mdc-insc-paso">
          <div className="mdc-insc-paso-label">
            <span className="mdc-insc-paso-num">2</span>
            Tipo de inscripción
          </div>
          <select
            className="mdc-insc-select"
            value={idTipoInsc}
            onChange={(e) => setIdTipoInsc(e.target.value)}
          >
            <option value="">Seleccioná un tipo…</option>
            {tipos.map((t) => (
              <option key={t.id_tipo_insc} value={t.id_tipo_insc}>{t.nombre_tip_insc}</option>
            ))}
          </select>
        </div>

        {/* Aviso: el alumno se inscribe en todas las materias del curso */}
        {seleccionado && (
          <div className="mdc-insc-aviso">
            <CIcon icon={cilWarning} className="mdc-insc-aviso-icon" />
            <span>
              Se inscribirá a <strong>{seleccionado.apellido}, {seleccionado.nombre}</strong> en
              todas las materias del curso <strong>{curso.curso}</strong>.
            </span>
          </div>
        )}

      </div>

      {/* Footer de acción */}
      <div className="mdc-insc-footer">
        <button className="mdc-insc-btn-cancelar" onClick={onVolver}>
          Cancelar
        </button>
        <button
          className="mdc-insc-btn-confirmar"
          disabled={!puedeInscribir || inscribiendo}
          onClick={handleInscribir}
        >
          {inscribiendo
            ? <><CSpinner size="sm" /> Inscribiendo…</>
            : <><CIcon icon={cilCheckAlt} style={{ width: '0.875rem', height: '0.875rem' }} /> Confirmar inscripción</>
          }
        </button>
      </div>

    </div>
  )
}

// ── Componente principal ──────────────────────────────────
export default function ModalDetalleCurso({ curso, onClose }) {
  const [tab, setTab]                 = useState('alumnos')
  const [alumnos, setAlumnos]         = useState([])
  const [materias, setMaterias]       = useState([])
  const [loadingAlumnos, setLoadingAlumnos]   = useState(true)
  const [loadingMaterias, setLoadingMaterias] = useState(true)
  const [search, setSearch]           = useState('')
  const [modoInscripcion, setModoInscripcion] = useState(false)

  const cargarAlumnos = useCallback(() => {
    if (!curso) return
    setLoadingAlumnos(true)
    api.get(`/api/cursos/${curso.id_curso}/alumnos`)
      .then((r) => setAlumnos(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingAlumnos(false))
  }, [curso?.id_curso])

  useEffect(() => {
    if (!curso) return
    cargarAlumnos()
    setLoadingMaterias(true)
    api.get(`/api/cursos/${curso.id_curso}/materias`)
      .then((r) => setMaterias(r.data ?? []))
      .catch(() => {})
      .finally(() => setLoadingMaterias(false))
  }, [curso?.id_curso])

  // Escape + lock de scroll del body mientras el modal está abierto
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        if (modoInscripcion) setModoInscripcion(false)
        else onClose()
      }
    }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose, modoInscripcion])

  const alumnosFiltrados = alumnos.filter((a) => {
    const q = search.toLowerCase()
    return (
      a.apellido?.toLowerCase().includes(q) ||
      a.nombre?.toLowerCase().includes(q) ||
      String(a.dni ?? '').includes(q) ||
      (a.legajo ?? '').toLowerCase().includes(q)
    )
  })

  if (!curso) return null

  const cicloNombre = curso.ciclo?.nombre_ciclo_lectivo ?? '—'
  const planNombre  = curso.ciclo?.plan?.nombre_plan ?? '—'

  return (
    <div className="mdc-overlay">
      <div className="mdc-modal" onClick={(e) => e.stopPropagation()}>

        {/* ── Header ── */}
        <div className="mdc-header">
          <div className="mdc-header-icon">
            <CIcon icon={cilSchool} className="mdc-header-icon-svg" />
          </div>
          <div className="mdc-header-info">
            <h2 className="mdc-header-titulo">{curso.curso}</h2>
            <div className="mdc-header-meta">
              <span className="mdc-meta-chip">{cicloNombre}</span>
              {planNombre !== '—' && <span className="mdc-meta-chip mdc-meta-chip--plan">{planNombre}</span>}
            </div>
          </div>

          <div className="mdc-header-stats">
            <div className="mdc-stat">
              <span className="mdc-stat-value">{loadingAlumnos ? '…' : alumnos.length}</span>
              <span className="mdc-stat-label">Alumnos</span>
            </div>
            <div className="mdc-stat-sep" />
            <div className="mdc-stat">
              <span className="mdc-stat-value">{loadingMaterias ? '…' : materias.length}</span>
              <span className="mdc-stat-label">Materias</span>
            </div>
          </div>

          <button className="mdc-close" onClick={onClose} title="Cerrar (Esc)">
            <CIcon icon={cilX} className="mdc-close-icon" />
          </button>
        </div>

        {/* ── Tabs (ocultos en modo inscripción) ── */}
        {!modoInscripcion && (
          <div className="mdc-tabs">
            <TabButton
              active={tab === 'alumnos'}
              onClick={() => setTab('alumnos')}
              icon={cilUser}
              label="Alumnos inscriptos"
              count={loadingAlumnos ? null : alumnos.length}
            />
            <TabButton
              active={tab === 'materias'}
              onClick={() => setTab('materias')}
              icon={cilBook}
              label="Materias"
              count={loadingMaterias ? null : materias.length}
            />
          </div>
        )}

        {/* ── Cuerpo ── */}
        <div className="mdc-body">

          {/* MODO INSCRIPCIÓN RÁPIDA */}
          {modoInscripcion ? (
            <PanelInscripcionRapida
              curso={curso}
              onVolver={() => setModoInscripcion(false)}
              onInscripto={cargarAlumnos}
            />
          ) : (
            <>
              {/* TAB ALUMNOS */}
              {tab === 'alumnos' && (
                <>
                  <div className="mdc-search-wrap">
                    <CIcon icon={cilSearch} className="mdc-search-icon" />
                    <input
                      className="mdc-search"
                      type="text"
                      placeholder="Buscar por nombre, apellido, DNI o legajo…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      autoFocus
                    />
                    {search && (
                      <button className="mdc-search-clear" onClick={() => setSearch('')}>×</button>
                    )}
                  </div>

                  {loadingAlumnos ? (
                    <div className="mdc-loading">
                      <CSpinner color="primary" size="sm" />
                      <span>Cargando alumnos…</span>
                    </div>
                  ) : alumnosFiltrados.length === 0 ? (
                    <div className="mdc-empty">
                      <CIcon icon={cilUser} className="mdc-empty-icon" />
                      <span>{search ? 'Sin resultados para la búsqueda.' : 'No hay alumnos inscriptos en este curso.'}</span>
                    </div>
                  ) : (
                    <div className="mdc-list">
                      {search && alumnos.length !== alumnosFiltrados.length && (
                        <div className="mdc-list-hint">
                          Mostrando {alumnosFiltrados.length} de {alumnos.length} alumnos
                        </div>
                      )}
                      {alumnosFiltrados.map((a, i) => (
                        <AlumnoRow key={a.id_entidad} alumno={a} index={i} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* TAB MATERIAS */}
              {tab === 'materias' && (
                loadingMaterias ? (
                  <div className="mdc-loading">
                    <CSpinner color="primary" size="sm" />
                    <span>Cargando materias…</span>
                  </div>
                ) : materias.length === 0 ? (
                  <div className="mdc-empty">
                    <CIcon icon={cilBook} className="mdc-empty-icon" />
                    <span>No hay materias registradas para este curso.</span>
                  </div>
                ) : (
                  <div className="mdc-list">
                    {materias.map((m, i) => (
                      <MateriaRow key={m.id_materia} materia={m} index={i} />
                    ))}
                  </div>
                )
              )}
            </>
          )}

        </div>

        {/* ── Footer ── */}
        {!modoInscripcion && (
          <div className="mdc-footer">
            <span className="mdc-footer-info">
              {tab === 'alumnos'
                ? `${alumnos.length} alumno${alumnos.length !== 1 ? 's' : ''} inscripto${alumnos.length !== 1 ? 's' : ''}`
                : `${materias.length} materia${materias.length !== 1 ? 's' : ''} registrada${materias.length !== 1 ? 's' : ''}`
              }
            </span>
            <div className="mdc-footer-acciones">
              {tab === 'alumnos' && (
                <button
                  className="mdc-footer-btn-inscribir"
                  onClick={() => setModoInscripcion(true)}
                >
                  <CIcon icon={cilPlus} style={{ width: '0.8rem', height: '0.8rem' }} />
                  Inscribir alumno
                </button>
              )}
              <button className="mdc-footer-btn" onClick={onClose}>Cerrar</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
