// frontend_AcademiA\src\components\notificaciones\PanelNotificaciones.jsx
//
// Panel flotante que se despliega al hacer clic en el badge de notificaciones del header.
// Muestra la lista de notificaciones con acciones de marcar leída y eliminar.

import React, { useEffect, useRef } from 'react'
import { CSpinner, CBadge } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBell, cilCheckAlt, cilTrash, cilCheckCircle,
  cilWarning, cilInfo, cilDescription,
} from '@coreui/icons'
import './PanelNotificaciones.css'

// Mapa de icono y color por tipo de notificación
const TIPO_META = {
  nota:        { icon: cilDescription, color: 'primary',   label: 'Nota' },
  inasistencia:{ icon: cilWarning,     color: 'warning',   label: 'Inasistencia' },
  inscripcion: { icon: cilCheckCircle, color: 'success',   label: 'Inscripción' },
  sistema:     { icon: cilInfo,        color: 'secondary', label: 'Sistema' },
}

const formatTimestamp = (ts) => {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Fila de una notificación ────────────────────────────────
const FilaNotificacion = ({ notif, onMarcarLeida, onEliminar }) => {
  const meta = TIPO_META[notif.tipo] ?? TIPO_META.sistema

  return (
    <div
      className={`pn__fila ${notif.leida ? 'pn__fila--leida' : 'pn__fila--nueva'}`}
      onClick={() => !notif.leida && onMarcarLeida([notif.id])}
    >
      <div className="pn__icono">
        <CBadge color={meta.color} className="pn__badge-tipo">
          <CIcon icon={meta.icon} size="sm" />
        </CBadge>
      </div>

      <div className="pn__contenido">
        <p className="pn__mensaje">{notif.mensaje}</p>
        <span className="pn__timestamp">{formatTimestamp(notif.timestamp)}</span>
      </div>

      <button
        className="pn__btn-eliminar"
        title="Eliminar"
        onClick={(e) => { e.stopPropagation(); onEliminar(notif.id) }}
      >
        <CIcon icon={cilTrash} size="sm" />
      </button>
    </div>
  )
}

// ─── Panel principal ──────────────────────────────────────────
const PanelNotificaciones = ({
  notificaciones,
  cargandoPanel,
  onMarcarLeida,
  onMarcarTodasLeidas,
  onEliminar,
  onCerrar,
}) => {
  const panelRef = useRef(null)

  // Cierra el panel si se hace clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onCerrar()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onCerrar])

  const hayNoLeidas = notificaciones.some((n) => !n.leida)

  return (
    <div className="pn__panel" ref={panelRef}>
      {/* Encabezado */}
      <div className="pn__header">
        <span className="pn__titulo">
          <CIcon icon={cilBell} className="me-2" />
          Notificaciones
        </span>
        {hayNoLeidas && (
          <button className="pn__btn-todas" onClick={onMarcarTodasLeidas} title="Marcar todas como leídas">
            <CIcon icon={cilCheckAlt} size="sm" className="me-1" />
            Marcar todas
          </button>
        )}
      </div>

      {/* Cuerpo */}
      <div className="pn__lista">
        {cargandoPanel ? (
          <div className="pn__estado-vacio">
            <CSpinner size="sm" color="primary" />
            <span className="ms-2">Cargando...</span>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="pn__estado-vacio">
            <CIcon icon={cilBell} size="xl" className="text-muted mb-2" />
            <span className="text-muted small">No tenés notificaciones</span>
          </div>
        ) : (
          notificaciones.map((n) => (
            <FilaNotificacion
              key={n.id}
              notif={n}
              onMarcarLeida={onMarcarLeida}
              onEliminar={onEliminar}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default PanelNotificaciones
