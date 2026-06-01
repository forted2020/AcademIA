// components/FormatoPreviewPanel.jsx
// Panel derecho: iframe sandboxed con controles de zoom y área ampliada.

import React, { useEffect, useRef, useState, useCallback } from 'react'
import CIcon from '@coreui/icons-react'
import { cilZoomIn, cilZoomOut } from '@coreui/icons'

const A4_W = 794
const A4_H = 1123

const ZOOM_STEPS = [0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 1.0]
const ZOOM_DEFAULT_IDX = 2   // 0.55

export default function FormatoPreviewPanel({ htmlContent, labelFormato = '' }) {
  const iframeRef   = useRef(null)
  const wrapRef     = useRef(null)
  const [zoomIdx, setZoomIdx] = useState(ZOOM_DEFAULT_IDX)

  const scale = ZOOM_STEPS[zoomIdx]
  const pctLabel = Math.round(scale * 100) + '%'

  // Escribe el HTML en el iframe cada vez que cambia el contenido
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (!doc) return
    doc.open()
    doc.write(htmlContent)
    doc.close()
  }, [htmlContent])

  const zoomOut = useCallback(() => setZoomIdx((i) => Math.max(0, i - 1)), [])
  const zoomIn  = useCallback(() => setZoomIdx((i) => Math.min(ZOOM_STEPS.length - 1, i + 1)), [])
  const zoomReset = useCallback(() => setZoomIdx(ZOOM_DEFAULT_IDX), [])

  // Zoom con rueda del mouse sobre el panel
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const handler = (e) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      if (e.deltaY < 0) setZoomIdx((i) => Math.min(ZOOM_STEPS.length - 1, i + 1))
      else              setZoomIdx((i) => Math.max(0, i - 1))
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  const frameH = Math.round(A4_H * scale)
  const frameW = Math.round(A4_W * scale)

  return (
    <div className="fmtimpr-preview-panel">

      {/* ── Barra superior: label + controles de zoom ── */}
      <div className="fmtimpr-preview-topbar">
        <div className="fmtimpr-preview-topbar-left">
          <span className="fmtimpr-preview-label">Vista previa</span>
          {labelFormato && (
            <span className="fmtimpr-preview-doc-name">{labelFormato}</span>
          )}
        </div>

        <div className="fmtimpr-zoom-controls">
          <button
            className="fmtimpr-zoom-btn"
            onClick={zoomOut}
            disabled={zoomIdx === 0}
            title="Reducir zoom"
          >
            <CIcon icon={cilZoomOut} style={{ width: '0.9rem', height: '0.9rem' }} />
          </button>

          <button
            className="fmtimpr-zoom-pct"
            onClick={zoomReset}
            title="Restablecer zoom"
          >
            {pctLabel}
          </button>

          <button
            className="fmtimpr-zoom-btn"
            onClick={zoomIn}
            disabled={zoomIdx === ZOOM_STEPS.length - 1}
            title="Aumentar zoom"
          >
            <CIcon icon={cilZoomIn} style={{ width: '0.9rem', height: '0.9rem' }} />
          </button>
        </div>
      </div>

      {/* ── Área de scroll con el documento ── */}
      <div className="fmtimpr-preview-scroll" ref={wrapRef}>
        <div
          className="fmtimpr-preview-canvas"
          style={{ width: frameW, height: frameH }}
        >
          <div
            className="fmtimpr-preview-page"
            style={{
              width: A4_W,
              height: A4_H,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <iframe
              ref={iframeRef}
              title="Vista previa del formato"
              sandbox="allow-same-origin"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          </div>
        </div>
      </div>

      <div className="fmtimpr-preview-hint">
        Datos de muestra · Ctrl+rueda para hacer zoom
      </div>

    </div>
  )
}
