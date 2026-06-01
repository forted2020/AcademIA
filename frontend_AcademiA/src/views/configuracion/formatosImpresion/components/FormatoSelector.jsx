// components/FormatoSelector.jsx
// Dropdown estilizado para seleccionar el tipo de documento a configurar.

import React from 'react'
import { TEMPLATES_REGISTRO } from '../templates/index'

export default function FormatoSelector({ codigoActivo, onChange }) {
  return (
    <div className="fmtimpr-selector-wrap">
      <label className="fmtimpr-selector-label">Tipo de documento</label>
      <select
        className="fmtimpr-selector-select"
        value={codigoActivo}
        onChange={(e) => onChange(e.target.value)}
      >
        {TEMPLATES_REGISTRO.map((t) => (
          <option key={t.codigo} value={t.codigo}>
            {t.nombre}
          </option>
        ))}
      </select>
    </div>
  )
}
