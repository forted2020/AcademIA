// components/SeccionInstitucion.jsx
// Panel de configuración de datos globales de la institución.
// Incluye upload de logo con drag-and-drop y redimensión automática.

import React, { useRef, useState } from 'react'
import CIcon from '@coreui/icons-react'
import { cilImage, cilTrash } from '@coreui/icons'

// Estilos .fmtimpr-* viven en FormatosImpresion.css. Los importamos acá para que
// el componente arrastre su look y no dependa de qué vista lo monte (antes
// fallaba al abrir ConfiguracionGeneral sin pasar primero por Formatos).
import '../FormatosImpresion.css'

// Redimensiona la imagen si supera maxWidth px, usando canvas nativo
function redimensionarImagen(file, maxWidth = 400) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const img = new Image()
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, 1)
      canvas.width  = Math.round(img.width  * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve({
        base64: canvas.toDataURL('image/png').split(',')[1],
        mime: 'image/png',
        ancho: canvas.width,
        alto: canvas.height,
      })
    }
    img.src = URL.createObjectURL(file)
  })
}

// `variant`:
//   - 'standalone' (default): se renderiza el panel completo con su propio título y
//     todos los campos. Lo usa la pantalla de Formatos de Impresión.
//   - 'embedded': ConfiguracionGeneral lo embebe dentro de su propio panel "Marca visual".
//     En ese modo se ocultan el título, el nombre/subtítulo y el pie de página global
//     porque esos campos se manejan en bloques separados de ConfiguracionGeneral.
export default function SeccionInstitucion({ configGlobal, onChange, variant = 'standalone' }) {
  const isEmbedded = variant === 'embedded'
  const inputRef    = useRef(null)
  const [dragging, setDragging] = useState(false)

  const set = (clave, valor) => onChange({ ...configGlobal, [clave]: valor })

  const procesarArchivo = async (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const resultado = await redimensionarImagen(file, 400)
    onChange({
      ...configGlobal,
      logo_base64: resultado.base64,
      logo_mime_type: resultado.mime,
      logo_nombre_archivo: file.name,
      logo_ancho_px: String(resultado.ancho),
      logo_alto_px: String(resultado.alto),
    })
  }

  const eliminarLogo = () => {
    onChange({
      ...configGlobal,
      logo_base64: null,
      logo_mime_type: null,
      logo_nombre_archivo: null,
      logo_ancho_px: null,
      logo_alto_px: null,
    })
  }

  const tieneLogoPreview = !!configGlobal.logo_base64

  return (
    <div className={`fmtimpr-seccion${isEmbedded ? ' fmtimpr-seccion--embedded' : ''}`}>
      {!isEmbedded && <div className="fmtimpr-seccion-titulo">Institución</div>}

      {!isEmbedded && (
        <div className="fmtimpr-campo">
          <label className="fmtimpr-label">Nombre de la institución</label>
          <input
            className="fmtimpr-input"
            type="text"
            value={configGlobal.nombre_institucion ?? ''}
            onChange={(e) => set('nombre_institucion', e.target.value)}
            placeholder="Ej: Escuela Secundaria N° 12"
          />
        </div>
      )}

      {!isEmbedded && (
        <div className="fmtimpr-campo">
          <label className="fmtimpr-label">Subtítulo</label>
          <input
            className="fmtimpr-input"
            type="text"
            value={configGlobal.subtitulo_institucion ?? ''}
            onChange={(e) => set('subtitulo_institucion', e.target.value)}
            placeholder="Ej: Educación Secundaria Obligatoria"
          />
        </div>
      )}

      {/* Los dos selectores de color se renderizan en fila para aprovechar
          el ancho del panel y mantenerlos visualmente asociados. */}
      <div className="fmtimpr-colores-fila">
        <div className="fmtimpr-campo">
          <label className="fmtimpr-label">Color principal</label>
          <div className="fmtimpr-color-row">
            <input
              className="fmtimpr-color-input"
              type="color"
              value={configGlobal.color_primario ?? '#0369a1'}
              onChange={(e) => set('color_primario', e.target.value)}
            />
            <span className="fmtimpr-color-value">{configGlobal.color_primario ?? '#0369a1'}</span>
          </div>
        </div>

        <div className="fmtimpr-campo">
          <label className="fmtimpr-label">Color de encabezado</label>
          <div className="fmtimpr-color-row">
            <input
              className="fmtimpr-color-input"
              type="color"
              value={configGlobal.color_encabezado ?? '#0f172a'}
              onChange={(e) => set('color_encabezado', e.target.value)}
            />
            <span className="fmtimpr-color-value">{configGlobal.color_encabezado ?? '#0f172a'}</span>
          </div>
        </div>
      </div>

      <div className="fmtimpr-campo">
        <label className="fmtimpr-label">Logo de la institución</label>

        {tieneLogoPreview ? (
          <div className="fmtimpr-logo-preview">
            <img
              src={`data:${configGlobal.logo_mime_type ?? 'image/png'};base64,${configGlobal.logo_base64}`}
              alt="Logo"
              className="fmtimpr-logo-img"
            />
            <div className="fmtimpr-logo-meta">
              <span className="fmtimpr-logo-nombre">{configGlobal.logo_nombre_archivo ?? 'logo.png'}</span>
              <button className="fmtimpr-logo-eliminar" onClick={eliminarLogo} title="Eliminar logo">
                <CIcon icon={cilTrash} style={{ width: '0.875rem', height: '0.875rem' }} />
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`fmtimpr-logo-dropzone${dragging ? ' is-dragging' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragging(false)
              procesarArchivo(e.dataTransfer.files[0])
            }}
          >
            <CIcon icon={cilImage} className="fmtimpr-logo-dropzone-icon" />
            <span className="fmtimpr-logo-dropzone-text">
              Arrastrá una imagen o <span className="fmtimpr-logo-link">hacé clic para seleccionar</span>
            </span>
            <span className="fmtimpr-logo-dropzone-hint">PNG, JPG — máx. recomendado 400×200 px</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => procesarArchivo(e.target.files[0])}
        />
      </div>

      {!isEmbedded && (
        <div className="fmtimpr-campo">
          <label className="fmtimpr-label">Pie de página global</label>
          <textarea
            className="fmtimpr-textarea"
            rows={2}
            value={configGlobal.texto_pie_global ?? ''}
            onChange={(e) => set('texto_pie_global', e.target.value)}
            placeholder="Texto que aparece al pie de todos los documentos"
          />
        </div>
      )}
    </div>
  )
}
