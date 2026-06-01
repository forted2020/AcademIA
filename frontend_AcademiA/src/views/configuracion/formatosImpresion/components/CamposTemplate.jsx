// components/CamposTemplate.jsx
// Genera automáticamente el formulario de configuración de un template
// a partir del array template.campos[]. Soporta: text, textarea, boolean, select, color.

import React from 'react'

function CampoText({ campo, valor, onChange }) {
  return (
    <div className="fmtimpr-campo">
      <label className="fmtimpr-label">{campo.label}</label>
      <input
        className="fmtimpr-input"
        type="text"
        value={valor ?? campo.default ?? ''}
        onChange={(e) => onChange(campo.clave, e.target.value)}
        placeholder={campo.placeholder ?? ''}
      />
    </div>
  )
}

function CampoTextarea({ campo, valor, onChange }) {
  return (
    <div className="fmtimpr-campo">
      <label className="fmtimpr-label">{campo.label}</label>
      <textarea
        className="fmtimpr-textarea"
        rows={3}
        value={valor ?? campo.default ?? ''}
        onChange={(e) => onChange(campo.clave, e.target.value)}
        placeholder={campo.placeholder ?? ''}
      />
    </div>
  )
}

function CampoBoolean({ campo, valor, onChange }) {
  // La BD guarda strings '1'/'0'; el default del template puede ser boolean
  const checked = valor !== undefined && valor !== null
    ? valor !== '0' && valor !== false
    : campo.default !== false

  return (
    <div className="fmtimpr-campo fmtimpr-campo--toggle">
      <span className="fmtimpr-label fmtimpr-label--toggle">{campo.label}</span>
      <button
        type="button"
        className={`fmtimpr-toggle${checked ? ' is-on' : ''}`}
        onClick={() => onChange(campo.clave, checked ? '0' : '1')}
        role="switch"
        aria-checked={checked}
      >
        <span className="fmtimpr-toggle-thumb" />
      </button>
    </div>
  )
}

function CampoSelect({ campo, valor, onChange }) {
  return (
    <div className="fmtimpr-campo">
      <label className="fmtimpr-label">{campo.label}</label>
      <select
        className="fmtimpr-select"
        value={valor ?? campo.default ?? ''}
        onChange={(e) => onChange(campo.clave, e.target.value)}
      >
        {(campo.opciones ?? []).map((op) => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>
    </div>
  )
}

function CampoColor({ campo, valor, onChange }) {
  const hex = valor ?? campo.default ?? '#000000'
  return (
    <div className="fmtimpr-campo">
      <label className="fmtimpr-label">{campo.label}</label>
      <div className="fmtimpr-color-row">
        <input
          className="fmtimpr-color-input"
          type="color"
          value={hex}
          onChange={(e) => onChange(campo.clave, e.target.value)}
        />
        <span className="fmtimpr-color-value">{hex}</span>
      </div>
    </div>
  )
}

export default function CamposTemplate({ campos = [], configFormato = {}, onChange }) {
  const handleChange = (clave, valor) => {
    onChange({ ...configFormato, [clave]: valor })
  }

  return (
    <div className="fmtimpr-seccion">
      <div className="fmtimpr-seccion-titulo">Opciones del documento</div>
      {campos.map((campo) => {
        const valor = configFormato[campo.clave]
        const props = { campo, valor, onChange: handleChange }

        switch (campo.tipo) {
          case 'text':     return <CampoText     key={campo.clave} {...props} />
          case 'textarea': return <CampoTextarea key={campo.clave} {...props} />
          case 'boolean':  return <CampoBoolean  key={campo.clave} {...props} />
          case 'select':   return <CampoSelect   key={campo.clave} {...props} />
          case 'color':    return <CampoColor    key={campo.clave} {...props} />
          default:         return null
        }
      })}
    </div>
  )
}
