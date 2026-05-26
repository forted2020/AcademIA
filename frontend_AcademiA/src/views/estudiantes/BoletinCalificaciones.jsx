// frontend_AcademiA/src/views/estudiantes/BoletinCalificaciones.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  CContainer, CCard, CCardHeader, CCardBody, CCardFooter,
  CSpinner, CAlert, CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilFile, cilUser, cilSearch, cilSchool, cilPrint,
  cilChevronBottom, cilChevronRight,
} from '@coreui/icons'

import api from '../../api/api.js'
import apiEstudiantes from '../../api/apiEstudiantes.js'
import { getCiclosPorEstudiante } from '../../api/apiEstudiantes.js'
import useAuthUser from '../../hooks/useAuthUser'
import { useConfigSistema, getRangoNotas } from '../../hooks/useConfigSistema'
import { useFormatoImpresion } from '../../hooks/useFormatoImpresion'

import './BoletinCalificaciones.css'

// ─── Hook: informe académico ──────────────────────────────────────────────────
function useInformeAcademico(idEstudiante, cicloId, cursoId) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    console.log('[Informe] ids:', { idEstudiante, cicloId, cursoId })
    if (!idEstudiante || !cicloId || !cursoId) { setData(null); return }
    setLoading(true)
    setError(null)
    api.get(`/api/notas/informe-individual/${idEstudiante}`, {
      params: { ciclo_id: cicloId, curso_id: cursoId },
    })
      .then((res) => {
        console.log('[Informe] respuesta:', res.data)
        setData(res.data)
      })
      .catch((err) => {
        console.error('[Informe] error:', err?.response?.status, err?.response?.data)
        setError(err?.response?.data?.detail || 'Error al cargar informe')
      })
      .finally(() => setLoading(false))
  }, [idEstudiante, cicloId, cursoId])

  return { data, loading, error }
}

// ─── Hook: ciclos del estudiante ─────────────────────────────────────────────
function useCiclosEstudiante(idEstudiante) {
  const [ciclos, setCiclos] = useState([])
  useEffect(() => {
    if (!idEstudiante) { setCiclos([]); return }
    getCiclosPorEstudiante(idEstudiante)
      .then((res) => {
        console.log('[Ciclos] respuesta para', idEstudiante, ':', res.data)
        setCiclos(res.data || [])
      })
      .catch((err) => {
        console.error('[Ciclos] error:', err?.response?.status, err?.response?.data)
        setCiclos([])
      })
  }, [idEstudiante])
  return ciclos
}

// ─── Hook: búsqueda de estudiantes con debounce ───────────────────────────────
function useBusquedaEstudiantes(query) {
  const [resultados, setResultados] = useState([])
  const [buscando, setBuscando]     = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!query || query.trim().length < 2) { setResultados([]); return }
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setBuscando(true)
      apiEstudiantes.getAll({ params: { search: query.trim(), limit: 8, skip: 0 } })
        .then((res) => {
          const payload = res.data
          setResultados(Array.isArray(payload) ? payload : (payload?.data ?? []))
        })
        .catch(() => setResultados([]))
        .finally(() => setBuscando(false))
    }, 350)
    return () => clearTimeout(timerRef.current)
  }, [query])

  return { resultados, buscando }
}

// ─── Generación de PDF ────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

async function generarPDF(data, nombreEstudiante, cicloNombre, download = true, configGlobal = {}, configFormato = {}, notaAprobacion = 6) {
  const jsPDF = (await import('jspdf')).default
  await import('jspdf-autotable')
  const doc = new jsPDF('p', 'pt', 'a4')
  const m   = 40

  // Valores del formato con fallback a los hardcodeados originales
  const nombreInst    = configGlobal.nombre_institucion ?? 'INSTITUCIÓN EDUCATIVA — AcademIA'
  const azul          = hexToRgb(configGlobal.color_primario ?? '#0369a1')
  const navy          = hexToRgb(configGlobal.color_encabezado ?? '#0f172a')
  const titulo        = configFormato.titulo_documento ?? 'BOLETÍN DE CALIFICACIONES'
  const mostrarProm   = configFormato.mostrar_promedio !== '0'
  const textoFirma    = configFormato.texto_firma ?? ''
  const textoPie      = configFormato.texto_pie || configGlobal.texto_pie_global || ''
  const logoDatos     = configGlobal.logo_base64 ?? null
  const logoMime      = configGlobal.logo_mime_type ?? 'image/png'
  const mostrarLogo   = configFormato.mostrar_logo !== '0' && !!logoDatos
  const mostrarFecha  = configFormato.mostrar_fecha_emision !== '0'

  let yPos = 50

  // Logo
  if (mostrarLogo) {
    try {
      doc.addImage(`data:${logoMime};base64,${logoDatos}`, logoMime.split('/')[1].toUpperCase(), m, 20, 60, 30)
      yPos = 60
    } catch (e) { /* logo inválido — continúa sin él */ }
  }

  doc.setFontSize(14); doc.setTextColor(...navy)
  doc.text(nombreInst, mostrarLogo ? m + 70 : m, yPos)
  if (mostrarFecha) {
    doc.setFontSize(9); doc.setTextColor(100)
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}`, mostrarLogo ? m + 70 : m, yPos + 14)
  }
  doc.setDrawColor(...azul); doc.setLineWidth(1.5)
  doc.line(m, yPos + 22, 555, yPos + 22)

  doc.setFontSize(13); doc.setTextColor(...azul)
  doc.text(titulo, m, yPos + 42)
  doc.setFontSize(10); doc.setTextColor(40)
  doc.text(`Alumno: ${nombreEstudiante}`, m, yPos + 60)
  doc.text(`Ciclo Lectivo: ${cicloNombre}`, m, yPos + 74)

  const cols = [
    { title: 'Materia', dataKey: 'materia' },
    ...data.columnas.map((c) => ({ title: c.label, dataKey: `n_${c.id_tipo_nota}` })),
    ...(mostrarProm ? [{ title: 'Promedio', dataKey: 'promedio' }] : []),
  ]
  const rows = data.filas.map((f) => {
    const row = { materia: f.nombre_materia }
    data.columnas.forEach((c) => { row[`n_${c.id_tipo_nota}`] = f.calificaciones[c.id_tipo_nota] ?? '—' })
    if (mostrarProm) row.promedio = f.promedio ?? '—'
    return row
  })

  doc.autoTable({
    columns: cols, body: rows, startY: yPos + 94,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: azul, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 249, 252] },
    margin: { left: m, right: m },
    // Resalta los aplazos en rojo y negrita (Fase 5).
    didParseCell: (hook) => {
      if (hook.section !== 'body') return
      if (hook.column.dataKey === 'materia') return
      const raw = hook.cell.raw
      const num = typeof raw === 'number' ? raw : parseFloat(raw)
      if (Number.isFinite(num) && num < notaAprobacion) {
        hook.cell.styles.textColor = [185, 28, 28]
        hook.cell.styles.fontStyle = 'bold'
      }
    },
  })

  const yFinal = doc.lastAutoTable?.finalY ?? (yPos + 94)
  if (textoFirma) {
    doc.setFontSize(9); doc.setTextColor(40)
    doc.text(textoFirma, 297, yFinal + 40, { align: 'center' })
    doc.line(220, yFinal + 32, 374, yFinal + 32)
  }
  if (textoPie) {
    doc.setFontSize(8); doc.setTextColor(100)
    doc.text(textoPie, 297, yFinal + 60, { align: 'center', maxWidth: 400 })
  }

  if (download) {
    doc.save(`Boletin_${nombreEstudiante.replace(/\s+/g, '_')}_${cicloNombre}.pdf`)
  } else {
    const url = URL.createObjectURL(doc.output('blob'))
    const w = window.open(url, '_blank')
    if (w) w.onload = () => { w.print(); setTimeout(() => URL.revokeObjectURL(url), 1000) }
  }
}

// ─── Tabla de calificaciones ─────────────────────────────────────────────────
function TablaCalificaciones({ data, notaAprobacion = 6 }) {
  if (!data?.filas?.length) return (
    <div className="bol-empty-table">
      <CIcon icon={cilSchool} className="bol-empty-table-icon" />
      <p>Sin calificaciones registradas para esta selección.</p>
    </div>
  )

  // Cada columna de nota recibe el mismo ancho: (100% - ancho materia - ancho promedio) / n
  const colNotaWidth = `${Math.floor((100 - 35 - 8) / data.columnas.length)}%`

  return (
    <div className="bol-table-wrap">
      <table className="bol-table" style={{ tableLayout: 'fixed', width: '100%' }}>
        <colgroup>
          <col style={{ width: '35%' }} />
          {data.columnas.map((c) => (
            <col key={c.id_tipo_nota} style={{ width: colNotaWidth }} />
          ))}
          <col style={{ width: '8%' }} />
        </colgroup>
        <thead>
          <tr>
            <th className="bol-th bol-th-materia">Materia</th>
            {data.columnas.map((c) => (
              <th key={c.id_tipo_nota} className="bol-th bol-th-nota">{c.label}</th>
            ))}
            <th className="bol-th bol-th-promedio">Promedio</th>
          </tr>
        </thead>
        <tbody>
          {data.filas.map((fila) => {
            const prom     = fila.promedio
            const aprobado = prom != null && prom >= notaAprobacion
            return (
              <tr key={fila.id_materia} className="bol-tr">
                <td className="bol-td bol-td-materia">{fila.nombre_materia}</td>
                {data.columnas.map((c) => {
                  const valor = fila.calificaciones[c.id_tipo_nota]
                  const esAplazo = valor != null && Number(valor) < notaAprobacion
                  return (
                    <td key={c.id_tipo_nota} className={`bol-td bol-td-nota${esAplazo ? ' bol-td--aplazo' : ''}`}>
                      {valor != null
                        ? valor
                        : <span className="bol-dash">—</span>
                      }
                    </td>
                  )
                })}
                <td className="bol-td bol-td-promedio">
                  {prom != null
                    ? <span className={`bol-badge ${aprobado ? 'bol-badge--ok' : 'bol-badge--fail'}`}>{prom}</span>
                    : <span className="bol-dash">—</span>
                  }
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Selector de ciclo — dropdown igual al de estudiante ─────────────────────
function CicloDropdown({ ciclos, seleccionado, onChange, disabled }) {
  const [query, setQuery]           = useState('')
  const [showDrop, setShowDrop]     = useState(false)
  const [inputVal, setInputVal]     = useState('')
  const boxRef                      = useRef(null)

  // Sincroniza el input cuando cambia la selección desde afuera (ej: al limpiar)
  useEffect(() => {
    setInputVal(seleccionado?.nombre_ciclo_lectivo ?? '')
    setQuery('')
  }, [seleccionado])

  // Cierra al clic afuera
  useEffect(() => {
    const handler = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setShowDrop(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtrados = ciclos.filter((c) =>
    c.nombre_ciclo_lectivo.toLowerCase().includes(query.toLowerCase())
  )

  const seleccionar = (c) => {
    onChange(c)
    setInputVal(c.nombre_ciclo_lectivo)
    setQuery('')
    setShowDrop(false)
  }

  const limpiar = () => {
    onChange(null)
    setInputVal('')
    setQuery('')
    setShowDrop(false)
  }

  return (
    <div className="bol-search-box" ref={boxRef}>
      <CIcon icon={cilChevronBottom} className="bol-search-icon" />
      <input
        className="bol-search-input"
        type="text"
        placeholder={disabled ? 'Primero seleccioná un estudiante…' : 'Seleccioná un ciclo lectivo…'}
        value={inputVal}
        disabled={disabled}
        readOnly={!!seleccionado}
        onChange={(e) => {
          setInputVal(e.target.value)
          setQuery(e.target.value)
          setShowDrop(true)
        }}
        onFocus={() => { if (!disabled) setShowDrop(true) }}
        autoComplete="off"
      />
      {inputVal && (
        <button className="bol-search-clear" onMouseDown={(e) => { e.preventDefault(); limpiar() }}>×</button>
      )}

      {showDrop && !disabled && (
        <div className="bol-dropdown">
          {filtrados.length === 0 ? (
            <div className="bol-dropdown--empty" style={{ padding: '0.75rem 1rem', fontSize: '0.8125rem', color: '#64748b', fontStyle: 'italic' }}>
              Sin ciclos lectivos registrados.
            </div>
          ) : (
            filtrados.map((c) => (
              <div
                key={c.id_ciclo_lectivo}
                className={`bol-dropdown-item${seleccionado?.id_ciclo_lectivo === c.id_ciclo_lectivo ? ' is-selected' : ''}`}
                onMouseDown={() => seleccionar(c)}
              >
                <div className="bol-dropdown-avatar bol-dropdown-avatar--ciclo">
                  <CIcon icon={cilSchool} style={{ width: '0.9rem', height: '0.9rem', color: '#64748b' }} />
                </div>
                <div className="bol-dropdown-info">
                  <span className="bol-dropdown-name">{c.nombre_ciclo_lectivo}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function BoletinCalificaciones() {
  const { idEntidad: loggedId, rol } = useAuthUser()
  const esAlumno = rol === 'ALUMNO_APP'

  const { configs: configGlobal } = useConfigSistema()
  const { configs: configFormato } = useFormatoImpresion('boletin')
  const { notaAprobacion } = getRangoNotas(configGlobal)

  // Búsqueda de estudiante
  const [searchQuery, setSearchQuery]           = useState('')
  const [busquedaActiva, setBusquedaActiva]     = useState('')   // lo que realmente se envía al hook
  const [showDropdown, setShowDropdown]         = useState(false)
  const [estudianteId, setEstudianteId]         = useState(esAlumno ? loggedId : null)
  const [nombreEstudiante, setNombreEstudiante] = useState('')
  const searchBoxRef = useRef(null)

  const { resultados, buscando } = useBusquedaEstudiantes(esAlumno ? '' : busquedaActiva)

  // Selección de ciclo y curso
  const [cicloSeleccionado, setCicloSeleccionado] = useState(null)
  const [cursoId, setCursoId]                     = useState(null)
  const [isGenerating, setIsGenerating]           = useState(false)

  const ciclos = useCiclosEstudiante(estudianteId)
  const { data, loading, error } = useInformeAcademico(
    estudianteId,
    cicloSeleccionado?.id_ciclo_lectivo,
    cursoId,
  )

  // Cierra dropdown al hacer clic afuera
  useEffect(() => {
    const handler = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Al cambiar ciclo: obtiene el curso_id del alumno en ese ciclo
  useEffect(() => {
    if (!cicloSeleccionado || !estudianteId) return
    setCursoId(null)
    console.log('[Boletin] Buscando curso para:', estudianteId, 'ciclo:', cicloSeleccionado.id_ciclo_lectivo)
    api.get(`/api/estudiantes/${estudianteId}/ciclo/${cicloSeleccionado.id_ciclo_lectivo}/curso`)
      .then((res) => {
        console.log('[Boletin] curso respuesta:', res.data)
        setCursoId(res.data?.id_curso ?? null)
      })
      .catch((err) => {
        console.error('[Boletin] Error buscando curso:', err?.response?.status, err?.response?.data)
        setCursoId(null)
      })
  }, [cicloSeleccionado, estudianteId])

  const seleccionarEstudiante = useCallback((est) => {
    const nombre = `${est.apellido}, ${est.nombre}`
    setEstudianteId(est.id_entidad)
    setNombreEstudiante(nombre)
    setSearchQuery(nombre)
    setBusquedaActiva('')    // detiene nuevas búsquedas
    setShowDropdown(false)
    setCicloSeleccionado(null)
    setCursoId(null)
  }, [])

  const limpiarBusqueda = () => {
    setSearchQuery('')
    setBusquedaActiva('')
    setEstudianteId(null)
    setNombreEstudiante('')
    setCicloSeleccionado(null)
    setCursoId(null)
  }

  const handlePDF = async (download) => {
    if (!data) return
    setIsGenerating(true)
    await generarPDF(data, nombreEstudiante, cicloSeleccionado?.nombre_ciclo_lectivo || '', download, configGlobal, configFormato, notaAprobacion)
    setIsGenerating(false)
  }

  return (
    <CContainer fluid className="py-3">
      <CCard className="bol-card">

        {/* ── Encabezado ── */}
        <CCardHeader className="bol-card-header">
          <div className="bol-header-left">
            <div className="bol-header-brand">
              <div className="bol-header-brand-icon">
                <CIcon icon={cilSchool} className="bol-brand-icon" />
              </div>
              <div>
                <h2 className="bol-header-h2">Boletín de Calificaciones</h2>
                <p className="bol-header-sub">Informe académico por estudiante y ciclo lectivo</p>
              </div>
            </div>
          </div>

          {/* Botones PDF — solo si hay datos */}
          {data && (
            <div className="bol-header-actions">
              <CButton
                color="secondary" variant="outline" size="sm"
                className="bol-action-btn"
                disabled={isGenerating}
                onClick={() => handlePDF(false)}
              >
                {isGenerating
                  ? <CSpinner size="sm" className="me-1" />
                  : <CIcon icon={cilPrint} className="me-1" style={{ width: '0.875rem', height: '0.875rem' }} />
                }
                Imprimir
              </CButton>
              <CButton
                color="secondary" variant="outline" size="sm"
                className="bol-action-btn"
                disabled={isGenerating}
                onClick={() => handlePDF(true)}
              >
                <CIcon icon={cilFile} className="me-1" style={{ width: '0.875rem', height: '0.875rem' }} />
                Exportar PDF
              </CButton>
            </div>
          )}
        </CCardHeader>

        <CCardBody className="bol-card-body">

          {/* ── Stepper de filtros ── */}
          <div className="bol-filters-row">

            {/* Paso 1 — Estudiante (solo admin/docente) */}
            {!esAlumno && (
              <div className="bol-filter-col">
                <div className="bol-search-label">
                  <span className="bol-filter-step is-ready">1</span>
                  Estudiante
                </div>
                <div className="bol-search-box" ref={searchBoxRef}>
                  <CIcon icon={cilSearch} className="bol-search-icon" />
                  <input
                    className="bol-search-input"
                    type="text"
                    placeholder="Buscar por nombre, apellido o DNI…"
                    value={searchQuery}
                    onChange={(e) => {
                      const val = e.target.value
                      setSearchQuery(val)
                      setEstudianteId(null)
                      setNombreEstudiante('')
                      setCicloSeleccionado(null)
                      setCursoId(null)
                      setBusquedaActiva(val)
                      setShowDropdown(true)
                      if (!val) limpiarBusqueda()
                    }}
                    onFocus={() => {
                      if (!estudianteId && searchQuery.length >= 2) setShowDropdown(true)
                    }}
                    autoComplete="off"
                  />
                  {buscando && (
                    <svg className="bol-search-spinner" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="40" strokeDashoffset="15" />
                    </svg>
                  )}
                  {searchQuery && !buscando && (
                    <button className="bol-search-clear" onClick={limpiarBusqueda}>×</button>
                  )}
                  {showDropdown && resultados.length > 0 && (
                    <div className="bol-dropdown">
                      {resultados.map((est) => (
                        <div
                          key={est.id_entidad}
                          className="bol-dropdown-item"
                          onMouseDown={() => seleccionarEstudiante(est)}
                        >
                          <div className="bol-dropdown-avatar">
                            <CIcon icon={cilUser} style={{ width: '0.9rem', height: '0.9rem', color: '#64748b' }} />
                          </div>
                          <div className="bol-dropdown-info">
                            <span className="bol-dropdown-name">{est.apellido}, {est.nombre}</span>
                            {est.dni && <span className="bol-dropdown-dni">DNI {est.dni}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {showDropdown && !buscando && searchQuery.length >= 2 && resultados.length === 0 && (
                    <div className="bol-dropdown bol-dropdown--empty">
                      Sin resultados para "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Divisor entre pasos */}
            {!esAlumno && <div className="bol-step-divider" />}

            {/* Paso 2 — Ciclo lectivo */}
            <div className="bol-filter-col">
              <div className="bol-search-label">
                <span className={`bol-filter-step${estudianteId ? ' is-ready' : ''}`}>
                  {esAlumno ? '1' : '2'}
                </span>
                Ciclo Lectivo
              </div>
              <CicloDropdown
                ciclos={ciclos}
                seleccionado={cicloSeleccionado}
                disabled={!estudianteId}
                onChange={(c) => { setCicloSeleccionado(c); setCursoId(null) }}
              />
            </div>

          </div>

          {/* ── Estado: cargando ── */}
          {loading && (
            <div className="bol-loading">
              <CSpinner color="primary" />
              <span>Cargando calificaciones…</span>
            </div>
          )}

          {/* ── Estado: error ── */}
          {error && !loading && (
            <CAlert color="danger" className="mt-3">{error}</CAlert>
          )}

          {/* ── Tabla ── */}
          {!loading && !error && data && (
            <>
              <div className="bol-table-header">
                <span className="bol-table-title">
                  Calificaciones — {cicloSeleccionado?.nombre_ciclo_lectivo}
                </span>
                <span className="bol-table-count">
                  {data.filas.length} {data.filas.length === 1 ? 'materia' : 'materias'}
                </span>
              </div>
              <TablaCalificaciones data={data} notaAprobacion={notaAprobacion} />
            </>
          )}

          {/* ── Estado vacío inicial ── */}
          {!loading && !error && !data && (
            <div className="bol-placeholder">
              <CIcon icon={cilSchool} className="bol-placeholder-icon" />
              <p className="bol-placeholder-text">
                {!estudianteId
                  ? 'Buscá un estudiante para ver su boletín'
                  : !cicloSeleccionado
                    ? 'Seleccioná un ciclo lectivo'
                    : 'Sin datos para la selección'
                }
              </p>
            </div>
          )}

        </CCardBody>

      </CCard>
    </CContainer>
  )
}
