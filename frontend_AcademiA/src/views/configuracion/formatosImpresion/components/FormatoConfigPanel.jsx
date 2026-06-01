// components/FormatoConfigPanel.jsx
// Panel izquierdo: contiene SeccionInstitucion (datos globales) y CamposTemplate (opciones del doc).

import React from 'react'
import SeccionInstitucion from './SeccionInstitucion'
import CamposTemplate from './CamposTemplate'

export default function FormatoConfigPanel({
  template,
  configGlobal,
  configFormato,
  onChangeGlobal,
  onChangeFormato,
}) {
  return (
    <div className="fmtimpr-config-panel">
      <SeccionInstitucion
        configGlobal={configGlobal}
        onChange={onChangeGlobal}
      />
      <CamposTemplate
        campos={template?.campos ?? []}
        configFormato={configFormato}
        onChange={onChangeFormato}
      />
    </div>
  )
}
