// views/cursos/ModalCurso.jsx
// Modal de creación/edición de un curso.
// En modo edición: checklist de todas las materias disponibles para agregar/quitar,
// con selector de docente por fila. El guardado de materias ocurre al presionar
// "Guardar cambios" en el footer junto con los datos del curso.

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSchool, cilX, cilCheckAlt, cilBook, cilWarning, cilSearch,
} from '@coreui/icons'
import { CSpinner } from '@coreui/react'
import api from '../../api/api'
import { useToast } from '../../context/ToastContext'
import './ModalCurso.css'

// ── Fila de materia en el checklist ──────────────────────────
function MateriaCheckItem({ nombre, checked, idDocente, docentesOpts, onToggle, onDocenteChange }) {
  return (
    <div
      className={`mc-chk-row${checked ? ' mc-chk-row--checked' : ''}`}
      onClick={() => onToggle(!checked)}
    >
      {/* Checkbox visual */}
      <div className={`mc-chk-box${checked ? ' mc-chk-box--on' : ''}`}>
        {checked && <CIcon icon={cilCheckAlt} style={{ width: '0.7rem', height: '0.7rem' }} />}
      </div>

      {/* Nombre de la materia */}
      <span className="mc-chk-label">{nombre}</span>

      {/* Selector de docente — solo visible si está seleccionada */}
      {checked && (
        <select
          className="mc-chk-docente-select"
          value={idDocente ?? ''}
          onChange={(e) => {
            e.stopPropagation()
            onDocenteChange(e.target.value ? Number(e.target.value) : null)
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <option value="">Sin asignar</option>
          {docentesOpts.map((d) => (
            <option key={d.id_entidad} value={d.id_entidad}>
              {d.apellido}, {d.nombre}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────
export default function ModalCurso({ curso, onClose, onSaved }) {
  const esEdicion = !!curso?.id_curso
  const { showSuccess, showError } = useToast()

  // ── Campos del curso ─────────────────────────────────────
  const [nombre, setNombre]         = useState(curso?.curso ?? '')
  const [idCiclo, setIdCiclo]       = useState(curso?.ciclo?.id_ciclo_lectivo ?? curso?.id_ciclo_lectivo ?? '')
  const [guardando, setGuardando]   = useState(false)
  const [errNombre, setErrNombre]   = useState('')
  const [errCiclo, setErrCiclo]     = useState('')

  // ── Catálogos ────────────────────────────────────────────
  const [ciclos, setCiclos]             = useState([])
  const [nombresOpts, setNombresOpts]   = useState([])   // todas las materias disponibles
  const [docentesOpts, setDocentesOpts] = useState([])
  const [loadingCatalogos, setLoadingCatalogos] = useState(true)

  // ── Estado del checklist de materias ─────────────────────
  // seleccion: Map<id_nombre_materia, { idDocente: number|null, id_materia: number|null }>
  // id_materia = null si es nueva (no existe en BD aún), número si ya existía
  const [seleccion, setSeleccion] = useState(new Map())
  const [loadingMaterias, setLoadingMaterias] = useState(esEdicion)

  // Buscador dentro del checklist
  const [busqueda, setBusqueda] = useState('')

  const inputRef = useRef(null)

  // ── Carga de catálogos + materias del curso en paralelo ──
  useEffect(() => {
    const promesas = [
      api.get('/api/ciclos/'),
      api.get('/api/materias/nombres/'),
      api.get('/api/docentes/'),
    ]
    if (esEdicion) promesas.push(api.get(`/api/materias/curso/${curso.id_curso}`))

    Promise.all(promesas)
      .then(([ciclosRes, nombresRes, docentesRes, materiasRes]) => {
        setCiclos(ciclosRes.data?.data ?? ciclosRes.data ?? [])
        setNombresOpts(nombresRes.data ?? [])
        setDocentesOpts(docentesRes.data?.data ?? docentesRes.data ?? [])

        if (esEdicion && materiasRes) {
          const mapa = new Map()
          for (const m of (materiasRes.data ?? [])) {
            mapa.set(m.id_nombre_materia, {
              idDocente: m.id_entidad ?? null,
              id_materia: m.id_materia,
            })
          }
          setSeleccion(mapa)
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoadingCatalogos(false)
        setLoadingMaterias(false)
        inputRef.current?.focus()
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Escape cierra
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // ── Helpers del checklist ────────────────────────────────
  const toggleMateria = useCallback((idNombre, checked) => {
    setSeleccion((prev) => {
      const next = new Map(prev)
      if (checked) {
        // Nueva entrada: sin docente por defecto, sin id_materia en BD aún
        next.set(idNombre, { idDocente: null, id_materia: null })
      } else {
        next.delete(idNombre)
      }
      return next
    })
  }, [])

  const cambiarDocente = useCallback((idNombre, idDocente) => {
    setSeleccion((prev) => {
      const next = new Map(prev)
      const entry = next.get(idNombre)
      if (entry) next.set(idNombre, { ...entry, idDocente })
      return next
    })
  }, [])

  // Lista filtrada por búsqueda
  const nombresFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return nombresOpts
    return nombresOpts.filter((n) => n.nombre_materia.toLowerCase().includes(q))
  }, [nombresOpts, busqueda])

  // ── Validación del formulario ────────────────────────────
  const validar = () => {
    let ok = true
    if (!nombre.trim()) { setErrNombre('El nombre del curso es obligatorio.'); ok = false }
    else setErrNombre('')
    if (!idCiclo) { setErrCiclo('Seleccioná un ciclo lectivo.'); ok = false }
    else setErrCiclo('')
    return ok
  }

  // ── Guardado ─────────────────────────────────────────────
  const handleGuardar = async () => {
    if (!validar()) return
    setGuardando(true)
    try {
      // 1. Guardar datos del curso
      const payload = { curso: nombre.trim(), id_ciclo_lectivo: Number(idCiclo) }
      let res
      if (esEdicion) {
        res = await api.put(`/api/cursos/${curso.id_curso}`, payload)
      } else {
        res = await api.post('/api/cursos/', payload)
      }
      const idCursoFinal = res.data.id_curso ?? curso?.id_curso

      // 2. Sincronizar materias (solo en edición o si se seleccionó alguna)
      if (esEdicion && idCursoFinal) {
        // Materias actuales en BD antes de editar
        const materiasActualesRes = await api.get(`/api/materias/curso/${idCursoFinal}`)
        const materiasActuales = materiasActualesRes.data ?? []
        const mapaActual = new Map(materiasActuales.map((m) => [m.id_nombre_materia, m]))

        const operaciones = []

        // Crear las que están en seleccion pero no en BD
        for (const [idNombre, { idDocente, id_materia }] of seleccion) {
          if (!mapaActual.has(idNombre)) {
            // Nueva materia
            operaciones.push(
              api.post('/api/materias/', {
                id_nombre_materia: idNombre,
                id_curso: idCursoFinal,
                id_entidad: idDocente ?? null,
              })
            )
          } else if (id_materia) {
            // Existente: actualizar docente si cambió
            const actual = mapaActual.get(idNombre)
            if ((actual.id_entidad ?? null) !== idDocente) {
              operaciones.push(
                api.put(`/api/materias/${id_materia}`, {
                  id_nombre_materia: idNombre,
                  id_entidad: idDocente ?? null,
                })
              )
            }
          }
        }

        // Eliminar las que estaban en BD pero se quitaron del checklist
        for (const m of materiasActuales) {
          if (!seleccion.has(m.id_nombre_materia)) {
            operaciones.push(api.delete(`/api/materias/${m.id_materia}`))
          }
        }

        if (operaciones.length > 0) await Promise.all(operaciones)
      }

      showSuccess(esEdicion ? 'Curso actualizado correctamente.' : 'Curso creado correctamente.')
      onSaved(res.data)
      if (!esEdicion) onClose()
    } catch (e) {
      const msg = e?.response?.data?.detail
      showError(typeof msg === 'string' ? msg : 'Error al guardar el curso.')
    } finally {
      setGuardando(false)
    }
  }

  const cantSeleccionadas = seleccion.size

  return (
    <div className="mc-overlay" onClick={onClose}>
      <div
        className={`mc-modal${esEdicion ? ' mc-modal--wide' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="mc-header">
          <div className="mc-header-icon">
            <CIcon icon={cilSchool} className="mc-header-icon-svg" />
          </div>
          <div className="mc-header-info">
            <h2 className="mc-header-titulo">
              {esEdicion ? `Editar curso — ${curso.curso}` : 'Nuevo curso'}
            </h2>
            <p className="mc-header-sub">
              {esEdicion
                ? 'Modificá los datos del curso y seleccioná sus materias.'
                : 'Completá los datos para crear el curso.'}
            </p>
          </div>
          <button className="mc-close" onClick={onClose} title="Cerrar (Esc)">
            <CIcon icon={cilX} className="mc-close-icon" />
          </button>
        </div>

        {/* ── Cuerpo ── */}
        <div className="mc-body">

          {/* Sección: datos del curso */}
          <div className="mc-seccion">
            <div className="mc-seccion-titulo">Datos del curso</div>

            <div className="mc-form-grid">
              <div className="mc-field">
                <label className="mc-label">Nombre del curso <span className="mc-req">*</span></label>
                <input
                  ref={inputRef}
                  className={`mc-input${errNombre ? ' is-error' : ''}`}
                  type="text"
                  placeholder="Ej: 1° A, 2° B…"
                  value={nombre}
                  onChange={(e) => { setNombre(e.target.value); setErrNombre('') }}
                />
                {errNombre && <span className="mc-field-error">{errNombre}</span>}
              </div>

              <div className="mc-field">
                <label className="mc-label">Ciclo lectivo <span className="mc-req">*</span></label>
                {loadingCatalogos ? (
                  <div className="mc-loading-inline"><CSpinner size="sm" /> Cargando…</div>
                ) : (
                  <select
                    className={`mc-select${errCiclo ? ' is-error' : ''}`}
                    value={idCiclo}
                    onChange={(e) => { setIdCiclo(e.target.value); setErrCiclo('') }}
                  >
                    <option value="">Seleccioná un ciclo lectivo…</option>
                    {ciclos.map((c) => (
                      <option key={c.id_ciclo_lectivo} value={c.id_ciclo_lectivo}>
                        {c.nombre_ciclo_lectivo}
                      </option>
                    ))}
                  </select>
                )}
                {errCiclo && <span className="mc-field-error">{errCiclo}</span>}
              </div>
            </div>
          </div>

          {/* Sección: checklist de materias (solo edición) */}
          {esEdicion && (
            <div className="mc-seccion mc-seccion--materias">
              <div className="mc-seccion-header">
                <div className="mc-seccion-titulo">
                  <CIcon icon={cilBook} style={{ width: '0.875rem', height: '0.875rem' }} />
                  Materias del curso
                  {!loadingMaterias && (
                    <span className="mc-badge">{cantSeleccionadas}</span>
                  )}
                </div>
                {!loadingMaterias && nombresOpts.length > 0 && (
                  <span className="mc-chk-hint">
                    {cantSeleccionadas} de {nombresOpts.length} seleccionadas
                  </span>
                )}
              </div>

              {loadingMaterias || loadingCatalogos ? (
                <div className="mc-loading-center">
                  <CSpinner size="sm" color="primary" />
                  <span>Cargando materias…</span>
                </div>
              ) : (
                <>
                  {/* Buscador */}
                  {nombresOpts.length > 6 && (
                    <div className="mc-chk-search">
                      <CIcon icon={cilSearch} className="mc-chk-search-icon" />
                      <input
                        className="mc-chk-search-input"
                        type="text"
                        placeholder="Filtrar materias…"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                      />
                      {busqueda && (
                        <button className="mc-chk-search-clear" onClick={() => setBusqueda('')}>×</button>
                      )}
                    </div>
                  )}

                  {/* Lista */}
                  <div className="mc-chk-list">
                    {nombresFiltrados.length === 0 ? (
                      <div className="mc-materias-empty">
                        <span>No hay materias que coincidan con la búsqueda.</span>
                      </div>
                    ) : (
                      nombresFiltrados.map((n) => {
                        const entry = seleccion.get(n.id_nombre_materia)
                        const checked = !!entry
                        return (
                          <MateriaCheckItem
                            key={n.id_nombre_materia}
                            nombre={n.nombre_materia}
                            checked={checked}
                            idDocente={entry?.idDocente ?? null}
                            docentesOpts={docentesOpts}
                            onToggle={(val) => toggleMateria(n.id_nombre_materia, val)}
                            onDocenteChange={(val) => cambiarDocente(n.id_nombre_materia, val)}
                          />
                        )
                      })
                    )}
                  </div>

                  {/* Aviso sobre eliminación */}
                  <div className="mc-aviso">
                    <CIcon icon={cilWarning} className="mc-aviso-icon" />
                    <span>No se puede quitar una materia con alumnos inscriptos activos. Si intentás guardar ese cambio verás un error.</span>
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="mc-footer">
          <button className="mc-btn-cerrar" onClick={onClose}>
            Cerrar
          </button>
          <button
            className="mc-btn-guardar"
            onClick={handleGuardar}
            disabled={guardando || loadingCatalogos}
          >
            {guardando
              ? <><CSpinner size="sm" /> Guardando…</>
              : <><CIcon icon={cilCheckAlt} style={{ width: '0.875rem', height: '0.875rem' }} /> {esEdicion ? 'Guardar cambios' : 'Crear curso'}</>
            }
          </button>
        </div>

      </div>
    </div>
  )
}
