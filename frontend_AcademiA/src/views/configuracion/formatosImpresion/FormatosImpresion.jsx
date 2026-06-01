// frontend_AcademiA/src/views/configuracion/formatosImpresion/FormatosImpresion.jsx

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { CCard, CCardHeader, CCardBody, CContainer, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPrint, cilCheck, cilWarning } from '@coreui/icons'

import { TEMPLATES_REGISTRO, getTemplate } from './templates/index'
import FormatoSelector from './components/FormatoSelector'
import FormatoConfigPanel from './components/FormatoConfigPanel'
import FormatoPreviewPanel from './components/FormatoPreviewPanel'

import { getConfigSistema, updateConfigSistema, uploadLogo, deleteLogo, getFormatoConfig, updateFormatoConfig } from '../../../api/apiFormatos'
import { useToast } from '../../../context/ToastContext'

import './FormatosImpresion.css'

const DEFAULTS_GLOBAL = {
  nombre_institucion: 'Institución Educativa',
  subtitulo_institucion: '',
  color_primario: '#0369a1',
  color_encabezado: '#0f172a',
  logo_base64: null,
  logo_mime_type: null,
  logo_nombre_archivo: null,
  logo_ancho_px: null,
  logo_alto_px: null,
  texto_pie_global: '',
}

export default function FormatosImpresion() {
  const { showSuccess, showError } = useToast()

  const [codigoActivo, setCodigoActivo]               = useState(TEMPLATES_REGISTRO[0]?.codigo ?? '')
  const [configGlobal, setConfigGlobal]               = useState(DEFAULTS_GLOBAL)
  const [configGlobalGuardada, setConfigGlobalGuardada] = useState(DEFAULTS_GLOBAL)
  const [configFormatos, setConfigFormatos]           = useState({})
  const [configFormatosGuardada, setConfigFormatosGuardada] = useState({})
  const [loadingInicial, setLoadingInicial]           = useState(true)
  const [guardando, setGuardando]                     = useState(false)

  const cargadosRef = useRef(new Set())
  const template    = useMemo(() => getTemplate(codigoActivo), [codigoActivo])

  // ── Carga inicial: config global ─────────────────────────────────────────
  useEffect(() => {
    getConfigSistema()
      .then((res) => {
        const data = { ...DEFAULTS_GLOBAL, ...res.data.configs }
        setConfigGlobal(data)
        setConfigGlobalGuardada(data)
      })
      .catch(() => {})
      .finally(() => setLoadingInicial(false))
  }, [])

  // ── Carga de config del formato activo (con caché) ───────────────────────
  useEffect(() => {
    if (!codigoActivo || cargadosRef.current.has(codigoActivo)) return
    cargadosRef.current.add(codigoActivo)

    getFormatoConfig(codigoActivo)
      .then((res) => {
        const data = res.data.configs ?? {}
        setConfigFormatos((prev) => ({ ...prev, [codigoActivo]: data }))
        setConfigFormatosGuardada((prev) => ({ ...prev, [codigoActivo]: data }))
      })
      .catch(() => {
        setConfigFormatos((prev) => ({ ...prev, [codigoActivo]: {} }))
        setConfigFormatosGuardada((prev) => ({ ...prev, [codigoActivo]: {} }))
      })
  }, [codigoActivo])

  const configFormatoActivo = configFormatos[codigoActivo] ?? {}

  const handleChangeGlobal  = useCallback((nueva) => setConfigGlobal(nueva), [])
  const handleChangeFormato = useCallback((nueva) => {
    setConfigFormatos((prev) => ({ ...prev, [codigoActivo]: nueva }))
  }, [codigoActivo])

  // ── HTML para el preview con debounce ────────────────────────────────────
  const [htmlPreview, setHtmlPreview] = useState('')
  const timerRef = useRef(null)

  useEffect(() => {
    if (!template) return
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      try {
        const html = template.generarHtml(configGlobal, configFormatoActivo, template.datosMuestra)
        setHtmlPreview(html)
      } catch (e) {
        console.error('[FormatosImpresion] Error generando preview:', e)
      }
    }, 150)
    return () => clearTimeout(timerRef.current)
  }, [template, configGlobal, configFormatoActivo])

  // ── Detecta si hay cambios sin guardar ───────────────────────────────────
  const hayCambios = useMemo(() => {
    const globalCambio  = JSON.stringify(configGlobal) !== JSON.stringify(configGlobalGuardada)
    const formatoCambio = JSON.stringify(configFormatoActivo) !== JSON.stringify(configFormatosGuardada[codigoActivo] ?? {})
    return globalCambio || formatoCambio
  }, [configGlobal, configGlobalGuardada, configFormatoActivo, configFormatosGuardada, codigoActivo])

  // ── Guardado ─────────────────────────────────────────────────────────────
  const handleGuardar = async () => {
    setGuardando(true)
    try {
      const { logo_base64, logo_mime_type, logo_nombre_archivo, logo_ancho_px, logo_alto_px, ...restoGlobal } = configGlobal
      await updateConfigSistema(restoGlobal)

      const logoAnterior = configGlobalGuardada.logo_base64
      if (logo_base64 && logo_base64 !== logoAnterior) {
        await uploadLogo({
          datos_base64: logo_base64,
          mime_type: logo_mime_type ?? 'image/png',
          nombre_archivo: logo_nombre_archivo ?? 'logo.png',
          ancho_px: logo_ancho_px ? parseInt(logo_ancho_px) : null,
          alto_px: logo_alto_px ? parseInt(logo_alto_px) : null,
        })
      } else if (!logo_base64 && logoAnterior) {
        await deleteLogo()
      }

      const configFormato = configFormatos[codigoActivo] ?? {}
      await updateFormatoConfig(codigoActivo, configFormato)

      setConfigGlobalGuardada({ ...configGlobal })
      setConfigFormatosGuardada((prev) => ({ ...prev, [codigoActivo]: { ...configFormato } }))

      showSuccess('Configuración guardada correctamente')
    } catch {
      showError('Error al guardar la configuración. Intente nuevamente.')
    } finally {
      setGuardando(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────
  if (loadingInicial) {
    return (
      <CContainer fluid className="py-3">
        <div className="fmtimpr-loading">
          <CSpinner color="primary" />
          <span>Cargando configuración…</span>
        </div>
      </CContainer>
    )
  }

  return (
    <CContainer fluid className="py-3">
      <CCard className="fmtimpr-card">

        {/* ── Encabezado ── */}
        <CCardHeader className="fmtimpr-card-header">
          <div className="fmtimpr-header-left">
            <div className="fmtimpr-header-brand-icon">
              <CIcon icon={cilPrint} className="fmtimpr-brand-icon" />
            </div>
            <div>
              <h2 className="fmtimpr-header-h2">Formatos de Impresión</h2>
              <p className="fmtimpr-header-sub">Configuración de plantillas de documentos</p>
            </div>
          </div>

          <div className="fmtimpr-header-controls">
            {/* Indicador de cambios sin guardar */}
            {hayCambios && (
              <div className="fmtimpr-unsaved-badge" title="Hay cambios sin guardar">
                <CIcon icon={cilWarning} style={{ width: '0.75rem', height: '0.75rem' }} />
                Sin guardar
              </div>
            )}

            <FormatoSelector
              codigoActivo={codigoActivo}
              onChange={(codigo) => setCodigoActivo(codigo)}
            />

            <button
              className="fmtimpr-btn-guardar"
              onClick={handleGuardar}
              disabled={guardando || !hayCambios}
            >
              {guardando
                ? <CSpinner size="sm" />
                : <CIcon icon={cilCheck} style={{ width: '0.875rem', height: '0.875rem' }} />
              }
              {guardando ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </CCardHeader>

        {/* ── Cuerpo: 2 columnas ── */}
        <CCardBody className="fmtimpr-card-body">

          <FormatoConfigPanel
            template={template}
            configGlobal={configGlobal}
            configFormato={configFormatoActivo}
            onChangeGlobal={handleChangeGlobal}
            onChangeFormato={handleChangeFormato}
          />

          <FormatoPreviewPanel
            htmlContent={htmlPreview}
            labelFormato={template?.nombre ?? ''}
          />

        </CCardBody>

      </CCard>
    </CContainer>
  )
}
