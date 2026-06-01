// frontend_AcademiA/src/views/gestion/inscripciones/Inscripciones.jsx

import React, { useState } from 'react'
import {
  CCard, CCardHeader, CCardBody,
  CContainer,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople } from '@coreui/icons'

import { InscripcionesConfig } from './InscripcionesConfig'
import GenericEnrollment from '../../../components/enrollment/GenericEnrollment'

import './Inscripciones.css'

export default function Inscripciones() {
  const [selectedModeKey, setSelectedModeKey] = useState(
    InscripcionesConfig.mainSelector.options[0].value
  )

  const activeConfig = InscripcionesConfig.configs[selectedModeKey]

  return (
    <CContainer fluid className="py-3">
      <CCard className="insc-card">

        {/* ── Encabezado ── */}
        <CCardHeader className="insc-card-header">
          <div className="insc-header-left">

            <div className="insc-header-brand">
              <div className="insc-header-brand-icon">
                <CIcon icon={cilPeople} className="insc-brand-icon" />
              </div>
              <div>
                <h2 className="insc-header-h2">Inscripciones</h2>
                <p className="insc-header-sub">Gestión de matriculación a cursos y materias</p>
              </div>
            </div>

            {/* Selector de tipo de inscripción: dropdown debajo del subtítulo */}
            <div className="insc-mode-selector">
              <span className="insc-mode-label">{InscripcionesConfig.mainSelector.label}</span>
              <select
                className="insc-mode-select"
                value={selectedModeKey}
                onChange={(e) => setSelectedModeKey(e.target.value)}
              >
                {InscripcionesConfig.mainSelector.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

          </div>
        </CCardHeader>

        {/* ── Cuerpo ── */}
        <CCardBody className="insc-card-body">
          {activeConfig && (
            <GenericEnrollment
              key={selectedModeKey}
              config={activeConfig}
            />
          )}
        </CCardBody>

      </CCard>
    </CContainer>
  )
}
