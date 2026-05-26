// components/actionTile/ActionTile.jsx
// Botón de acceso rápido con ícono, label, sublabel y flecha animada.
// Usado en los tres dashboards (admin, docente, alumno).

import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilArrowRight } from '@coreui/icons'
import './ActionTile.css'

export default function ActionTile({ icon, label, sub, onClick }) {
  return (
    <button type="button" className="action-tile" onClick={onClick}>
      {icon && (
        <span className="action-tile__icon">
          <CIcon icon={icon} />
        </span>
      )}
      <span className="action-tile__body">
        <span className="action-tile__label">{label}</span>
        {sub && <span className="action-tile__sub">{sub}</span>}
      </span>
      <CIcon icon={cilArrowRight} className="action-tile__arrow" />
    </button>
  )
}
