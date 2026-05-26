// frontend_AcademiA\src\views\asistencia\Asistencia.jsx
//
// Página de Gestión de Asistencia — módulo en construcción.
// Muestra un placeholder visual consistente con el sistema de diseño del proyecto.

import React from 'react'
import { CContainer, CCard, CCardHeader, CCardBody } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCalendar } from '@coreui/icons'
import './Asistencia.css'

/**
 * Asistencia
 * Vista placeholder para el módulo de registro diario de presencia.
 * La funcionalidad estará disponible en fases posteriores del plan.
 */
export default function Asistencia() {
  return (
    <CContainer fluid className="py-3">
      <CCard className="asis-card">

        {/* ── Encabezado brand ───────────────────────────── */}
        <CCardHeader className="asis-card-header">
          <div className="asis-header-brand">
            <div className="asis-header-brand-icon">
              <CIcon icon={cilCalendar} className="asis-brand-icon" />
            </div>
            <div>
              <h2 className="asis-header-h2">Gestión de Asistencia</h2>
              <p className="asis-header-sub">Registro diario de presencia</p>
            </div>
          </div>
        </CCardHeader>

        {/* ── Cuerpo: estado en construcción ─────────────── */}
        <CCardBody className="asis-card-body">
          <div className="asis-construction">
            <CIcon icon={cilCalendar} className="asis-construction-icon" />
            <p className="asis-construction-title">Módulo en construcción</p>
            <p className="asis-construction-sub">
              Esta funcionalidad estará disponible próximamente.
            </p>
          </div>
        </CCardBody>

      </CCard>
    </CContainer>
  )
}
