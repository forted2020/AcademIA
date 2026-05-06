// frontend_AcademiA\src\views\configuracion\ConfiguracionNotificaciones.jsx
//
// Página de configuración completa de notificaciones.
// Permite al usuario activar/desactivar cada tipo de notificación,
// ver el historial completo y marcar o eliminar notificaciones en masa.

import React, { useState, useEffect, useCallback } from 'react'
import {
  CContainer, CCard, CCardHeader, CCardBody, CRow, CCol,
  CSpinner, CAlert, CButton, CBadge, CFormSwitch,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBell, cilCheckAlt, cilTrash, cilSettings,
  cilDescription, cilWarning, cilCheckCircle, cilInfo,
} from '@coreui/icons'

import {
  getNotificaciones,
  getConfigNotificaciones,
  updateConfigNotificaciones,
  marcarLeidas,
  eliminarNotificacion,
} from '../../api/apiNotificaciones'
import { useToast } from '../../context/ToastContext'

// ─── Constantes de tipo ─────────────────────────────────────
const TIPOS = [
  { tipo: 'nota',         label: 'Calificaciones',    icon: cilDescription,  color: 'primary',   descripcion: 'Cuando se carga una nueva nota en una materia.' },
  { tipo: 'inasistencia', label: 'Inasistencias',     icon: cilWarning,      color: 'warning',   descripcion: 'Cuando se registra una inasistencia.' },
  { tipo: 'inscripcion',  label: 'Inscripciones',     icon: cilCheckCircle,  color: 'success',   descripcion: 'Cuando se confirma una inscripción a un ciclo lectivo.' },
  { tipo: 'sistema',      label: 'Mensajes del sistema', icon: cilInfo,      color: 'secondary', descripcion: 'Avisos generales del sistema académico.' },
]

const formatTimestamp = (ts) => {
  if (!ts) return ''
  return new Date(ts).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Sección de preferencias ─────────────────────────────────
const SeccionPreferencias = ({ preferencias, onToggle, guardando }) => (
  <CCard className="mb-4">
    <CCardHeader className="py-2 bg-white">
      <h5 className="mb-0">
        <CIcon icon={cilSettings} className="me-2" />
        Tipos de notificación
      </h5>
      <div className="small text-muted">Elegí cuáles querés recibir en el panel</div>
    </CCardHeader>
    <CCardBody>
      <CRow className="g-3">
        {TIPOS.map(({ tipo, label, icon, color, descripcion }) => {
          const activa = preferencias[tipo] ?? true
          return (
            <CCol xs={12} md={6} key={tipo}>
              <div className="d-flex align-items-start gap-3 p-3 border rounded">
                <CBadge color={color} className="mt-1" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, flexShrink: 0 }}>
                  <CIcon icon={icon} size="sm" />
                </CBadge>
                <div className="flex-grow-1">
                  <div className="fw-semibold">{label}</div>
                  <div className="small text-muted">{descripcion}</div>
                </div>
                <CFormSwitch
                  checked={activa}
                  onChange={() => onToggle(tipo)}
                  disabled={guardando}
                />
              </div>
            </CCol>
          )
        })}
      </CRow>

      <div className="mt-3 d-flex justify-content-end">
        <CButton
          color="primary"
          size="sm"
          onClick={() => onToggle(null)}  // guardar explícito
          disabled={guardando}
        >
          {guardando ? <CSpinner size="sm" className="me-1" /> : null}
          Guardar preferencias
        </CButton>
      </div>
    </CCardBody>
  </CCard>
)

// ─── Tabla de historial ──────────────────────────────────────
const TablaHistorial = ({ notificaciones, cargando, onMarcarLeida, onEliminar, onMarcarTodas }) => {
  const hayNoLeidas = notificaciones.some((n) => !n.leida)

  return (
    <CCard>
      <CCardHeader className="py-2 bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">
              <CIcon icon={cilBell} className="me-2" />
              Historial de notificaciones
            </h5>
            <div className="small text-muted">Tus últimas 50 notificaciones</div>
          </div>
          {hayNoLeidas && (
            <CButton color="light" size="sm" onClick={onMarcarTodas}>
              <CIcon icon={cilCheckAlt} className="me-1" />
              Marcar todas como leídas
            </CButton>
          )}
        </div>
      </CCardHeader>
      <CCardBody className="p-0">
        {cargando ? (
          <div className="text-center py-5">
            <CSpinner color="primary" />
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <CIcon icon={cilBell} size="3xl" className="mb-3" />
            <p>No tenés notificaciones registradas</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover table-sm align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 32 }} />
                  <th>Mensaje</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th style={{ width: 80 }} />
                </tr>
              </thead>
              <tbody>
                {notificaciones.map((n) => {
                  const meta = TIPOS.find((t) => t.tipo === n.tipo) ?? TIPOS[3]
                  return (
                    <tr
                      key={n.id}
                      className={!n.leida ? 'table-primary' : ''}
                      style={{ cursor: n.leida ? 'default' : 'pointer' }}
                      onClick={() => !n.leida && onMarcarLeida([n.id])}
                    >
                      <td>
                        <CBadge color={meta.color} style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}>
                          <CIcon icon={meta.icon} size="sm" />
                        </CBadge>
                      </td>
                      <td className="small">{n.mensaje}</td>
                      <td><span className="badge bg-light text-dark border">{meta.label}</span></td>
                      <td className="small text-muted" style={{ whiteSpace: 'nowrap' }}>{formatTimestamp(n.timestamp)}</td>
                      <td>
                        {n.leida
                          ? <span className="badge bg-secondary">Leída</span>
                          : <CBadge color="primary">Nueva</CBadge>}
                      </td>
                      <td>
                        <CButton
                          color="link"
                          size="sm"
                          className="text-danger p-0"
                          title="Eliminar"
                          onClick={(e) => { e.stopPropagation(); onEliminar(n.id) }}
                        >
                          <CIcon icon={cilTrash} size="sm" />
                        </CButton>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CCardBody>
    </CCard>
  )
}

// ─── Componente principal ────────────────────────────────────
export default function ConfiguracionNotificaciones() {
  const { showSuccess, showError } = useToast()

  const [preferencias, setPreferencias] = useState({})
  const [preferenciasGuardadas, setPreferenciasGuardadas] = useState({})
  const [guardando, setGuardando] = useState(false)

  const [notificaciones, setNotificaciones] = useState([])
  const [cargando, setCargando] = useState(false)

  // Carga inicial
  useEffect(() => {
    const cargar = async () => {
      setCargando(true)
      try {
        const [configRes, notifRes] = await Promise.all([
          getConfigNotificaciones(),
          getNotificaciones({ limit: 50 }),
        ])
        // Convertir lista de config a objeto { tipo: activa }
        const map = {}
        ;(configRes.data ?? []).forEach(({ tipo, activa }) => { map[tipo] = activa })
        // Asegurar que todos los tipos tengan un valor (default true)
        TIPOS.forEach(({ tipo }) => { if (map[tipo] === undefined) map[tipo] = true })
        setPreferencias(map)
        setPreferenciasGuardadas(map)
        setNotificaciones(notifRes.data ?? [])
      } catch {
        showError('Error al cargar configuración de notificaciones')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  // Toggle de un tipo (o guardar si tipo === null)
  const handleToggle = useCallback(async (tipo) => {
    if (tipo === null) {
      // Guardar todas las preferencias actuales
      setGuardando(true)
      try {
        const payload = TIPOS.map(({ tipo: t }) => ({ tipo: t, activa: preferencias[t] ?? true }))
        await updateConfigNotificaciones(payload)
        setPreferenciasGuardadas({ ...preferencias })
        showSuccess('Preferencias guardadas correctamente')
      } catch {
        showError('Error al guardar preferencias')
      } finally {
        setGuardando(false)
      }
      return
    }
    // Solo actualiza el estado local (se guarda al presionar el botón)
    setPreferencias((prev) => ({ ...prev, [tipo]: !prev[tipo] }))
  }, [preferencias, showSuccess, showError])

  const handleMarcarLeida = useCallback(async (ids) => {
    try {
      await marcarLeidas(ids)
      setNotificaciones((prev) => prev.map((n) => ids.includes(n.id) ? { ...n, leida: true } : n))
    } catch {
      showError('Error al marcar notificación')
    }
  }, [showError])

  const handleMarcarTodas = useCallback(async () => {
    const ids = notificaciones.filter((n) => !n.leida).map((n) => n.id)
    if (!ids.length) return
    await handleMarcarLeida(ids)
  }, [notificaciones, handleMarcarLeida])

  const handleEliminar = useCallback(async (id) => {
    try {
      await eliminarNotificacion(id)
      setNotificaciones((prev) => prev.filter((n) => n.id !== id))
    } catch {
      showError('Error al eliminar notificación')
    }
  }, [showError])

  const hayCambiosSinGuardar = JSON.stringify(preferencias) !== JSON.stringify(preferenciasGuardadas)

  return (
    <div style={{ padding: '10px' }}>
      <h1 className="ms-1">Notificaciones</h1>
      <CContainer>
        {hayCambiosSinGuardar && (
          <CAlert color="warning" className="py-2 small mb-3">
            Tenés cambios sin guardar en tus preferencias.
          </CAlert>
        )}

        <SeccionPreferencias
          preferencias={preferencias}
          onToggle={handleToggle}
          guardando={guardando}
        />

        <TablaHistorial
          notificaciones={notificaciones}
          cargando={cargando}
          onMarcarLeida={handleMarcarLeida}
          onMarcarTodas={handleMarcarTodas}
          onEliminar={handleEliminar}
        />
      </CContainer>
    </div>
  )
}
