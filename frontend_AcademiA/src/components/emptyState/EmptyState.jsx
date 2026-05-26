// components/emptyState/EmptyState.jsx
// Estado vacío genérico con ícono circular, título y subtítulo.
// iconVariant: 'success' (verde, default) | 'warn' (ámbar)

import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle } from '@coreui/icons'
import './EmptyState.css'

export default function EmptyState({ icon = cilCheckCircle, iconVariant = 'success', title, sub }) {
  return (
    <div className="empty-state">
      <div className={`empty-state__icon${iconVariant === 'warn' ? ' empty-state__icon--warn' : ''}`}>
        <CIcon icon={icon} />
      </div>
      {title && <p className="empty-state__title">{title}</p>}
      {sub && <p className="empty-state__sub">{sub}</p>}
    </div>
  )
}
