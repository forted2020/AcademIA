// components/statCard/StatCard.jsx
// Tarjeta KPI con dos variantes visuales:
//   classic — borde lateral coloreado + ícono circular (CoreUI-style, default)
//   minimal — número grande + label uppercase + línea de acento inferior

import React from 'react'
import { CCard, CCardBody } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import './StatCard.css'

// Mapa de colores Bootstrap → valor hex para la línea de acento del variant minimal
const COLOR_MAP = {
  primary:   '#0d6efd',
  success:   '#198754',
  danger:    '#dc3545',
  warning:   '#b45309',
  info:      '#0891b2',
  secondary: '#6c757d',
  dark:      '#212529',
  light:     '#6c757d',
}

const StatCard = ({ title, value, icon, color = 'primary', subtext, variant = 'classic', onClick }) => {
  if (variant === 'minimal') {
    const accentColor = COLOR_MAP[color] || COLOR_MAP.primary
    return (
      <div
        className={`stat-card stat-card--minimal stat-card-${color}`}
        style={{ '--stat-c': accentColor }}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <div className="stat-card__value">{value}</div>
        <p className="stat-card__title">{title}</p>
        {subtext && <p className="stat-card__subtext">{subtext}</p>}
      </div>
    )
  }

  // classic — JSX original con CCard de CoreUI
  return (
    <CCard
      className={`stat-card stat-card-${color} shadow-sm border-0 h-100 p-2`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <CCardBody className="d-flex align-items-center justify-content-between">
        <div>
          <p className="text-label mb-1">{title}</p>
          <h3 className={`fw-bold text-${color} mb-0 display-6`}>{value}</h3>
          {subtext && <small className="text-muted" style={{ fontSize: '0.75rem' }}>{subtext}</small>}
        </div>
        {icon && (
          <div className={`bg-${color} bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center`} style={{ width: '60px', height: '60px' }}>
            <CIcon icon={icon} size="xl" className={`text-${color}`} />
          </div>
        )}
      </CCardBody>
    </CCard>
  )
}

export default StatCard
