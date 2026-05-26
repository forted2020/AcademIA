// views/configuracion/ConfiguracionGeneral/ConfiguracionGeneral.jsx

import React, { useState, useEffect, useCallback } from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSettings, cilBuilding, cilHistory, cilWarning,
  cilCheckCircle, cilCheck, cilPhone, cilAt, cilLocationPin,
  cilUser, cilPeople, cilEducation, cilCalendar,
} from '@coreui/icons'
import {
  CContainer, CCard, CCardHeader, CCardBody,
  CNav, CNavItem, CNavLink, CTabContent, CTabPane,
  CRow, CCol, CSpinner,
} from '@coreui/react'

import {
  getConfigSistema, updateConfigSistema, uploadLogo, deleteLogo,
  getModoInscripcion, updateModoInscripcion, getHistorialModoInscripcion,
} from '../../../api/apiFormatos'
import SeccionInstitucion from '../formatosImpresion/components/SeccionInstitucion'
import './ConfiguracionGeneral.css'

// Campos agrupados para mejor jerarquía visual
const GRUPOS_INSTITUCION = [
  {
    titulo: 'Identificación',
    campos: [
      { clave: 'cue_institucion', label: 'CUE', placeholder: 'Código Único de Establecimiento', icon: cilBuilding },
    ],
  },
  {
    titulo: 'Contacto y ubicación',
    campos: [
      { clave: 'domicilio_inst',  label: 'Domicilio',    placeholder: 'Av. Siempre Viva 742',          icon: cilLocationPin },
      { clave: 'localidad_inst',  label: 'Localidad',    placeholder: 'Ciudad Autónoma de Buenos Aires', icon: cilLocationPin },
      { clave: 'telefono_inst',   label: 'Teléfono',     placeholder: '(011) 4000-0000',                icon: cilPhone },
      { clave: 'email_inst',      label: 'Email institucional', placeholder: 'secretaria@escuela.edu.ar', icon: cilAt },
    ],
  },
  {
    titulo: 'Autoridades',
    campos: [
      { clave: 'director_nombre',    label: 'Director/a',    placeholder: 'Juan García',  icon: cilUser },
      { clave: 'secretario_nombre',  label: 'Secretario/a',  placeholder: 'María López',  icon: cilPeople },
    ],
  },
]

const DEFAULTS_CONFIG = {
  nombre_institucion: '',
  subtitulo_institucion: '',
  color_primario: '#0369a1',
  color_encabezado: '#0f172a',
  logo_base64: null,
  logo_mime_type: null,
  logo_nombre_archivo: null,
  logo_ancho_px: null,
  logo_alto_px: null,
  texto_pie_global: '',
  cue_institucion: '',
  domicilio_inst: '',
  localidad_inst: '',
  telefono_inst: '',
  email_inst: '',
  director_nombre: '',
  secretario_nombre: '',
  // Configuración académica (Fase 1)
  nota_minima: '0',
  nota_maxima: '10',
  nota_aprobacion: '6',
  inasistencias_umbral_reincorporacion: '20',
  inasistencias_umbral_libre: '28',
}

// Claves académicas — separadas para guardado y validación independiente
const CLAVES_ACADEMICAS = [
  'nota_minima',
  'nota_maxima',
  'nota_aprobacion',
  'inasistencias_umbral_reincorporacion',
  'inasistencias_umbral_libre',
]

const MODOS = [
  {
    value: 'MATERIA',
    label: 'Instituto',
    sublabel: 'Por materia',
    descripcion: 'Inasistencias por materia individual. Permite dar de baja a un alumno de una materia específica.',
    colorClass: 'cfggen-modo-card--materia',
  },
  {
    value: 'CURSO',
    label: 'Escuela',
    sublabel: 'Por curso',
    descripcion: 'Inasistencias por curso completo. No se permite la baja individual de materias.',
    colorClass: 'cfggen-modo-card--curso',
  },
]

const CONSECUENCIAS = {
  MATERIA: [
    'Las inasistencias pasarán a registrarse por materia individual.',
    'Se habilitará la baja individual de alumnos de una materia específica.',
    'Los reportes mostrarán inasistencias desglosadas por materia.',
  ],
  CURSO: [
    'Las inasistencias pasarán a registrarse por curso completo.',
    'Se deshabilitará la baja individual de materias.',
    'Los reportes mostrarán inasistencias agrupadas por curso.',
  ],
}

// Componente de alerta inline sin depender de CAlert
function InlineAlert({ type, children }) {
  return (
    <div className={`cfggen-inline-alert cfggen-inline-alert--${type}`}>
      <CIcon
        icon={type === 'success' ? cilCheckCircle : cilWarning}
        className="cfggen-inline-alert-icon"
      />
      <span>{children}</span>
    </div>
  )
}

export default function ConfiguracionGeneral() {
  const [pestana, setPestana] = useState('institucion')

  // — Pestaña Institución —
  const [config, setConfig]               = useState(DEFAULTS_CONFIG)
  const [configGuardada, setConfigGuardada] = useState(DEFAULTS_CONFIG)
  const [cargandoConfig, setCargandoConfig] = useState(true)
  const [guardandoConfig, setGuardandoConfig] = useState(false)
  const [errorConfig, setErrorConfig]     = useState(null)
  const [okConfig, setOkConfig]           = useState(false)

  // — Pestaña Académico —
  const [guardandoAcademico, setGuardandoAcademico] = useState(false)
  const [errorAcademico, setErrorAcademico] = useState(null)
  const [okAcademico, setOkAcademico] = useState(false)

  // — Pestaña Sistema —
  const [modoActual, setModoActual]         = useState(null)
  const [modoSeleccionado, setModoSeleccionado] = useState(null)
  const [motivoCambio, setMotivoCambio]     = useState('')
  const [historial, setHistorial]           = useState([])
  const [cargandoModo, setCargandoModo]     = useState(true)
  const [guardandoModo, setGuardandoModo]   = useState(false)
  const [errorModo, setErrorModo]           = useState(null)
  const [okModo, setOkModo]               = useState(null)

  // — Modal —
  const [modalVisible, setModalVisible] = useState(false)

  useEffect(() => {
    cargarConfig()
    cargarModo()
  }, [])

  // Cerrar modal con Escape
  useEffect(() => {
    if (!modalVisible) return
    const handler = (e) => { if (e.key === 'Escape') setModalVisible(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [modalVisible])

  const cargarConfig = async () => {
    setCargandoConfig(true)
    setErrorConfig(null)
    try {
      const res = await getConfigSistema()
      const datos = { ...DEFAULTS_CONFIG, ...(res.data?.configs ?? {}) }
      setConfig(datos)
      setConfigGuardada(datos)
    } catch {
      setErrorConfig('No se pudo cargar la configuración.')
    } finally {
      setCargandoConfig(false)
    }
  }

  const cargarModo = async () => {
    setCargandoModo(true)
    try {
      const [resModo, resHist] = await Promise.all([
        getModoInscripcion(),
        getHistorialModoInscripcion(),
      ])
      const modo = resModo.data?.configs?.modo_inscripcion ?? 'MATERIA'
      setModoActual(modo)
      setModoSeleccionado(modo)
      setHistorial(resHist.data ?? [])
    } catch {
      setModoActual('MATERIA')
      setModoSeleccionado('MATERIA')
    } finally {
      setCargandoModo(false)
    }
  }

  const guardarConfig = async () => {
    setGuardandoConfig(true)
    setErrorConfig(null)
    setOkConfig(false)
    try {
      const { logo_base64, logo_mime_type, logo_nombre_archivo, logo_ancho_px, logo_alto_px, ...resto } = config
      // Las claves académicas se persisten por separado desde la pestaña "Académico".
      CLAVES_ACADEMICAS.forEach((k) => delete resto[k])
      await updateConfigSistema(resto)

      const logoModificado = logo_base64 !== configGuardada.logo_base64
      if (logoModificado) {
        if (logo_base64) {
          await uploadLogo({
            datos_base64: logo_base64,
            mime_type: logo_mime_type,
            nombre_archivo: logo_nombre_archivo,
            ancho_px: logo_ancho_px ? parseInt(logo_ancho_px) : null,
            alto_px: logo_alto_px ? parseInt(logo_alto_px) : null,
          })
        } else {
          await deleteLogo()
        }
      }

      setConfigGuardada(config)
      setOkConfig(true)
      setTimeout(() => setOkConfig(false), 4000)
    } catch (e) {
      setErrorConfig(e?.response?.data?.detail ?? 'Error al guardar la configuración.')
    } finally {
      setGuardandoConfig(false)
    }
  }

  // Valida coherencia entre las claves académicas antes de persistirlas.
  const validarAcademico = () => {
    const nMin = parseFloat(config.nota_minima)
    const nMax = parseFloat(config.nota_maxima)
    const nApr = parseFloat(config.nota_aprobacion)
    const uRei = parseInt(config.inasistencias_umbral_reincorporacion, 10)
    const uLib = parseInt(config.inasistencias_umbral_libre, 10)

    if ([nMin, nMax, nApr].some((v) => Number.isNaN(v))) {
      return 'Las notas mínima, máxima y de aprobación deben ser números.'
    }
    if (nMin >= nMax) {
      return 'La nota mínima debe ser menor que la nota máxima.'
    }
    if (nApr < nMin || nApr > nMax) {
      return `La nota de aprobación debe estar entre ${nMin} y ${nMax}.`
    }
    if ([uRei, uLib].some((v) => Number.isNaN(v) || v < 1)) {
      return 'Los umbrales de inasistencias deben ser enteros mayores a cero.'
    }
    if (uRei >= uLib) {
      return 'El umbral de reincorporación debe ser menor al umbral de pase a Libre.'
    }
    return null
  }

  const guardarAcademico = async () => {
    setErrorAcademico(null)
    setOkAcademico(false)

    const error = validarAcademico()
    if (error) {
      setErrorAcademico(error)
      return
    }

    setGuardandoAcademico(true)
    try {
      const payload = {}
      CLAVES_ACADEMICAS.forEach((k) => { payload[k] = String(config[k] ?? '').trim() })
      await updateConfigSistema(payload)

      setConfigGuardada((prev) => ({ ...prev, ...payload }))
      setOkAcademico(true)
      setTimeout(() => setOkAcademico(false), 4000)
    } catch (e) {
      setErrorAcademico(e?.response?.data?.detail ?? 'Error al guardar la configuración académica.')
    } finally {
      setGuardandoAcademico(false)
    }
  }

  const solicitarCambioModo = () => {
    if (modoSeleccionado === modoActual) return
    setErrorModo(null)
    setModalVisible(true)
  }

  const confirmarCambioModo = async () => {
    setModalVisible(false)
    setGuardandoModo(true)
    setErrorModo(null)
    setOkModo(null)
    try {
      await updateModoInscripcion({ modo: modoSeleccionado, motivo: motivoCambio || null })
      setModoActual(modoSeleccionado)
      setMotivoCambio('')
      setOkModo('Modo actualizado correctamente.')
      const resHist = await getHistorialModoInscripcion()
      setHistorial(resHist.data ?? [])
      setTimeout(() => setOkModo(null), 4000)
    } catch (e) {
      setErrorModo(e?.response?.data?.detail ?? 'Error al cambiar el modo.')
    } finally {
      setGuardandoModo(false)
    }
  }

  // Comparación que excluye las claves académicas (tienen su propio botón de guardar)
  const _sinAcademicas = (obj) => {
    const copia = { ...obj }
    CLAVES_ACADEMICAS.forEach((k) => delete copia[k])
    return copia
  }
  const hayCambiosConfig = JSON.stringify(_sinAcademicas(config)) !== JSON.stringify(_sinAcademicas(configGuardada))
  const hayCambiosAcademico = CLAVES_ACADEMICAS.some((k) => String(config[k] ?? '') !== String(configGuardada[k] ?? ''))
  const hayCambiosModo   = modoSeleccionado !== modoActual

  const labelModo = (v) => MODOS.find((m) => m.value === v)?.label ?? v

  return (
    <CContainer fluid className="py-3">
      <CCard className="cfggen-card">

        {/* ── HEADER ── */}
        <CCardHeader className="cfggen-card-header">
          <div className="cfggen-header-left">
            <div className="cfggen-header-brand-icon">
              <CIcon icon={cilSettings} className="cfggen-brand-icon" />
            </div>
            <div>
              <h2 className="cfggen-header-h2">Configuración General</h2>
              <p className="cfggen-header-sub">Datos de la institución y parámetros del sistema</p>
            </div>
          </div>
        </CCardHeader>

        <CCardBody className="cfggen-card-body">

          {/* ── PESTAÑAS ── */}
          <CNav variant="tabs" className="cfggen-tabs">
            <CNavItem>
              <CNavLink
                active={pestana === 'institucion'}
                onClick={() => setPestana('institucion')}
                className="cfggen-tab-link"
              >
                <CIcon icon={cilBuilding} className="cfggen-tab-icon" />
                Institución
                {hayCambiosConfig && <span className="cfggen-tab-dot" title="Cambios sin guardar" />}
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={pestana === 'academico'}
                onClick={() => setPestana('academico')}
                className="cfggen-tab-link"
              >
                <CIcon icon={cilEducation} className="cfggen-tab-icon" />
                Académico
                {hayCambiosAcademico && <span className="cfggen-tab-dot" title="Cambios sin guardar" />}
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={pestana === 'sistema'}
                onClick={() => setPestana('sistema')}
                className="cfggen-tab-link"
              >
                <CIcon icon={cilSettings} className="cfggen-tab-icon" />
                Sistema
                {hayCambiosModo && <span className="cfggen-tab-dot" title="Cambios sin guardar" />}
              </CNavLink>
            </CNavItem>
          </CNav>

          <CTabContent className="cfggen-tab-content">

            {/* ══ PESTAÑA INSTITUCIÓN ══ */}
            <CTabPane visible={pestana === 'institucion'}>
              {cargandoConfig ? (
                <div className="cfggen-loading">
                  <CSpinner size="sm" /> Cargando configuración...
                </div>
              ) : (
                <>
                  {errorConfig && <InlineAlert type="error">{errorConfig}</InlineAlert>}
                  {okConfig    && <InlineAlert type="success">Configuración guardada correctamente.</InlineAlert>}

                  <CRow className="g-3">
                    {/* Columna izquierda: marca visual + logo + colores */}
                    <CCol md={5}>
                      <SeccionInstitucion configGlobal={config} onChange={setConfig} />
                    </CCol>

                    {/* Columna derecha: datos institucionales agrupados */}
                    <CCol md={7}>
                      {GRUPOS_INSTITUCION.map((grupo) => (
                        <div className="cfggen-grupo" key={grupo.titulo}>
                          <div className="cfggen-grupo-titulo">{grupo.titulo}</div>
                          <div className="cfggen-grupo-campos">
                            {grupo.campos.map(({ clave, label, placeholder, icon }) => (
                              <div className="cfggen-campo" key={clave}>
                                <label className="cfggen-label">{label}</label>
                                <div className="cfggen-input-wrap">
                                  {icon && (
                                    <CIcon icon={icon} className="cfggen-input-icon" />
                                  )}
                                  <input
                                    className={`cfggen-input${icon ? ' cfggen-input--with-icon' : ''}`}
                                    type={clave === 'email_inst' ? 'email' : 'text'}
                                    value={config[clave] ?? ''}
                                    onChange={(e) => setConfig(prev => ({ ...prev, [clave]: e.target.value }))}
                                    placeholder={placeholder}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CCol>
                  </CRow>

                  <div className="cfggen-footer">
                    <button
                      className="cfggen-btn-guardar"
                      onClick={guardarConfig}
                      disabled={guardandoConfig || !hayCambiosConfig}
                    >
                      {guardandoConfig
                        ? <><CSpinner size="sm" className="cfggen-spinner" /> Guardando...</>
                        : <><CIcon icon={cilCheck} style={{ width: '0.875rem', height: '0.875rem' }} /> Guardar cambios</>
                      }
                    </button>
                    {!hayCambiosConfig && !okConfig && (
                      <span className="cfggen-sin-cambios">Sin cambios pendientes</span>
                    )}
                  </div>
                </>
              )}
            </CTabPane>

            {/* ══ PESTAÑA ACADÉMICO ══ */}
            <CTabPane visible={pestana === 'academico'}>
              {cargandoConfig ? (
                <div className="cfggen-loading">
                  <CSpinner size="sm" /> Cargando configuración...
                </div>
              ) : (
                <>
                  {errorAcademico && <InlineAlert type="error">{errorAcademico}</InlineAlert>}
                  {okAcademico    && <InlineAlert type="success">Configuración académica guardada correctamente.</InlineAlert>}

                  {/* — Bloque Calificaciones — */}
                  <div className="cfggen-seccion">
                    <div className="cfggen-seccion-titulo">
                      <CIcon icon={cilEducation} className="cfggen-seccion-icon" />
                      Calificaciones
                    </div>
                    <p className="cfggen-seccion-desc">
                      Definen el rango válido para cargar notas y el umbral de aprobación usado en
                      planillas, boletines y cálculo de materias previas.
                    </p>

                    <div className="cfggen-grupo-campos">
                      <div className="cfggen-campo">
                        <label className="cfggen-label">Nota mínima</label>
                        <input
                          className="cfggen-input"
                          type="number" step="0.01" min="0" max="100"
                          value={config.nota_minima ?? ''}
                          onChange={(e) => setConfig((p) => ({ ...p, nota_minima: e.target.value }))}
                        />
                      </div>
                      <div className="cfggen-campo">
                        <label className="cfggen-label">Nota máxima</label>
                        <input
                          className="cfggen-input"
                          type="number" step="0.01" min="0" max="100"
                          value={config.nota_maxima ?? ''}
                          onChange={(e) => setConfig((p) => ({ ...p, nota_maxima: e.target.value }))}
                        />
                      </div>
                      <div className="cfggen-campo">
                        <label className="cfggen-label">Nota de aprobación</label>
                        <input
                          className="cfggen-input"
                          type="number" step="0.01" min="0" max="100"
                          value={config.nota_aprobacion ?? ''}
                          onChange={(e) => setConfig((p) => ({ ...p, nota_aprobacion: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  {/* — Bloque Inasistencias — */}
                  <div className="cfggen-seccion">
                    <div className="cfggen-seccion-titulo">
                      <CIcon icon={cilCalendar} className="cfggen-seccion-icon" />
                      Inasistencias — Umbrales normativos
                    </div>
                    <p className="cfggen-seccion-desc">
                      Cantidad de inasistencias acumuladas que dispara cada acción institucional.
                      El modo de cómputo (por materia o por curso) se configura en la pestaña Sistema.
                    </p>

                    <div className="cfggen-grupo-campos">
                      <div className="cfggen-campo">
                        <label className="cfggen-label">Umbral de Acta de Reincorporación</label>
                        <input
                          className="cfggen-input"
                          type="number" step="1" min="1"
                          value={config.inasistencias_umbral_reincorporacion ?? ''}
                          onChange={(e) => setConfig((p) => ({ ...p, inasistencias_umbral_reincorporacion: e.target.value }))}
                        />
                      </div>
                      <div className="cfggen-campo">
                        <label className="cfggen-label">Umbral de pase a Libre / Libre Concurrente</label>
                        <input
                          className="cfggen-input"
                          type="number" step="1" min="1"
                          value={config.inasistencias_umbral_libre ?? ''}
                          onChange={(e) => setConfig((p) => ({ ...p, inasistencias_umbral_libre: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="cfggen-footer">
                    <button
                      className="cfggen-btn-guardar"
                      onClick={guardarAcademico}
                      disabled={guardandoAcademico || !hayCambiosAcademico}
                    >
                      {guardandoAcademico
                        ? <><CSpinner size="sm" className="cfggen-spinner" /> Guardando...</>
                        : <><CIcon icon={cilCheck} style={{ width: '0.875rem', height: '0.875rem' }} /> Guardar configuración académica</>
                      }
                    </button>
                    {!hayCambiosAcademico && !okAcademico && (
                      <span className="cfggen-sin-cambios">Sin cambios pendientes</span>
                    )}
                  </div>
                </>
              )}
            </CTabPane>

            {/* ══ PESTAÑA SISTEMA ══ */}
            <CTabPane visible={pestana === 'sistema'}>
              {cargandoModo ? (
                <div className="cfggen-loading">
                  <CSpinner size="sm" /> Cargando configuración del sistema...
                </div>
              ) : (
                <>
                  {errorModo && <InlineAlert type="error">{errorModo}</InlineAlert>}
                  {okModo    && <InlineAlert type="success">{okModo}</InlineAlert>}

                  <div className="cfggen-seccion">
                    <div className="cfggen-seccion-header">
                      <div>
                        <div className="cfggen-seccion-titulo">Modo de inscripción y asistencia</div>
                        <p className="cfggen-seccion-desc">
                          Define cómo el sistema registra inasistencias y gestiona inscripciones.
                          Este parámetro solo debería modificarse entre ciclos lectivos.
                        </p>
                      </div>
                      {modoActual && (
                        <span className={`cfggen-modo-badge-activo cfggen-modo-badge-activo--${modoActual}`}>
                          Activo: {labelModo(modoActual)}
                        </span>
                      )}
                    </div>

                    <div className="cfggen-modos">
                      {MODOS.map((m) => {
                        const isSelected = modoSeleccionado === m.value
                        const isActual   = modoActual === m.value
                        return (
                          <button
                            key={m.value}
                            className={`cfggen-modo-card ${m.colorClass}${isSelected ? ' is-selected' : ''}${isActual ? ' is-active' : ''}`}
                            onClick={() => setModoSeleccionado(m.value)}
                          >
                            <div className="cfggen-modo-top">
                              <div>
                                <span className="cfggen-modo-label">{m.label}</span>
                                <span className="cfggen-modo-sublabel">{m.sublabel}</span>
                              </div>
                              {isSelected && (
                                <div className="cfggen-modo-check">
                                  <CIcon icon={cilCheck} style={{ width: '0.75rem', height: '0.75rem' }} />
                                </div>
                              )}
                            </div>
                            <p className="cfggen-modo-desc">{m.descripcion}</p>
                          </button>
                        )
                      })}
                    </div>

                    {hayCambiosModo && (
                      <div className="cfggen-cambio-aviso">
                        <CIcon icon={cilWarning} className="cfggen-cambio-aviso-icon" />
                        <span>Cambiando de <strong>{labelModo(modoActual)}</strong> a <strong>{labelModo(modoSeleccionado)}</strong>. Este cambio afecta toda la institución.</span>
                      </div>
                    )}

                    {hayCambiosModo && (
                      <div className="cfggen-campo cfggen-campo--motivo">
                        <label className="cfggen-label">
                          Motivo del cambio <span className="cfggen-label-opcional">(opcional pero recomendado)</span>
                        </label>
                        <textarea
                          className="cfggen-textarea"
                          rows={2}
                          value={motivoCambio}
                          onChange={(e) => setMotivoCambio(e.target.value)}
                          placeholder="Ej: Cambio institucional para el ciclo 2027"
                        />
                      </div>
                    )}

                    <div className="cfggen-footer">
                      <button
                        className="cfggen-btn-guardar"
                        onClick={solicitarCambioModo}
                        disabled={guardandoModo || !hayCambiosModo}
                      >
                        {guardandoModo
                          ? <><CSpinner size="sm" className="cfggen-spinner" /> Guardando...</>
                          : <><CIcon icon={cilCheck} style={{ width: '0.875rem', height: '0.875rem' }} /> Aplicar cambio de modo</>
                        }
                      </button>
                      {!hayCambiosModo && (
                        <span className="cfggen-sin-cambios">Sin cambios pendientes</span>
                      )}
                    </div>
                  </div>

                  {/* ── Historial ── */}
                  <div className="cfggen-seccion">
                    <div className="cfggen-seccion-titulo">
                      <CIcon icon={cilHistory} className="cfggen-seccion-icon" />
                      Historial de cambios de modo
                    </div>

                    {historial.length === 0 ? (
                      <div className="cfggen-historial-vacio">
                        <CIcon icon={cilHistory} style={{ width: '1.5rem', height: '1.5rem', opacity: 0.2 }} />
                        <p>Sin cambios registrados aún.</p>
                      </div>
                    ) : (
                      <div className="cfggen-historial">
                        {historial.map((entry) => (
                          <div key={entry.id_log} className="cfggen-historial-item">
                            <div className="cfggen-historial-header">
                              <span className="cfggen-historial-cambio">
                                <span className={`cfggen-badge-modo cfggen-badge-${entry.valor_anterior}`}>
                                  {entry.valor_anterior ?? '—'}
                                </span>
                                <span className="cfggen-historial-flecha">→</span>
                                <span className={`cfggen-badge-modo cfggen-badge-${entry.valor_nuevo}`}>
                                  {entry.valor_nuevo}
                                </span>
                              </span>
                              <span className="cfggen-historial-meta">
                                <span className="cfggen-historial-usuario">{entry.nombre_usuario}</span>
                                <span className="cfggen-historial-fecha">
                                  {new Date(entry.timestamp).toLocaleString('es-AR', {
                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                  })}
                                </span>
                              </span>
                            </div>
                            {entry.motivo && (
                              <p className="cfggen-historial-motivo">"{entry.motivo}"</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CTabPane>

          </CTabContent>
        </CCardBody>
      </CCard>

      {/* ── MODAL DE CONFIRMACIÓN ── */}
      {modalVisible && (
        <div className="cfggen-modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="cfggen-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cfggen-modal-header">
              <div className="cfggen-modal-header-icon">
                <CIcon icon={cilWarning} className="cfggen-modal-warn-icon" />
              </div>
              <div>
                <h3 className="cfggen-modal-title">Confirmar cambio de modo</h3>
                <p className="cfggen-modal-subtitle">Este cambio afecta toda la institución</p>
              </div>
            </div>

            <div className="cfggen-modal-body">
              <div className="cfggen-modal-cambio">
                <span className={`cfggen-badge-modo cfggen-badge-${modoActual}`}>
                  {labelModo(modoActual)}
                </span>
                <span className="cfggen-modal-flecha">→</span>
                <span className={`cfggen-badge-modo cfggen-badge-${modoSeleccionado}`}>
                  {labelModo(modoSeleccionado)}
                </span>
              </div>

              <div className="cfggen-modal-consecuencias">
                <div className="cfggen-modal-consecuencias-titulo">Qué cambia con esto</div>
                <ul>
                  {(CONSECUENCIAS[modoSeleccionado] ?? []).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                  <li>El cambio quedará registrado en el historial de auditoría.</li>
                </ul>
              </div>
            </div>

            <div className="cfggen-modal-footer">
              <button className="cfggen-modal-btn-cancelar" onClick={() => setModalVisible(false)}>
                Cancelar
              </button>
              <button className="cfggen-modal-btn-confirmar" onClick={confirmarCambioModo}>
                <CIcon icon={cilWarning} style={{ width: '0.875rem', height: '0.875rem' }} />
                Sí, cambiar modo
              </button>
            </div>
          </div>
        </div>
      )}
    </CContainer>
  )
}
