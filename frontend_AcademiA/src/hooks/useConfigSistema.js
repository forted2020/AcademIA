// frontend_AcademiA/src/hooks/useConfigSistema.js
// Hook para leer la configuración global de la institución.
// Cachea el resultado en memoria para evitar llamadas repetidas en la misma sesión.

import { useState, useEffect } from 'react'
import { getConfigSistema } from '../api/apiFormatos'

// Caché en módulo — persiste entre montajes del componente en la misma sesión
let _cache = null
let _promesaEnCurso = null

const DEFAULTS = {
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
  // Claves académicas (Fase 1) — valores por defecto si la BD no las trae
  nota_minima: '0',
  nota_maxima: '10',
  nota_aprobacion: '6',
  inasistencias_umbral_reincorporacion: '20',
  inasistencias_umbral_libre: '28',
}

// Helper para extraer las claves de calificaciones tipadas como números.
// Se exporta aparte para evitar re-renders innecesarios en consumidores que
// solo necesitan estos tres valores.
export function getRangoNotas(configs) {
  const min = parseFloat(configs?.nota_minima ?? DEFAULTS.nota_minima)
  const max = parseFloat(configs?.nota_maxima ?? DEFAULTS.nota_maxima)
  const apr = parseFloat(configs?.nota_aprobacion ?? DEFAULTS.nota_aprobacion)
  return {
    notaMinima: Number.isFinite(min) ? min : 0,
    notaMaxima: Number.isFinite(max) ? max : 10,
    notaAprobacion: Number.isFinite(apr) ? apr : 6,
  }
}

export function useConfigSistema() {
  const [configs, setConfigs] = useState(_cache ?? DEFAULTS)
  const [loading, setLoading] = useState(!_cache)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (_cache) {
      setConfigs(_cache)
      setLoading(false)
      return
    }

    // Reutiliza la promesa si ya hay una en vuelo (evita race conditions)
    if (!_promesaEnCurso) {
      _promesaEnCurso = getConfigSistema()
        .then((res) => {
          _cache = { ...DEFAULTS, ...res.data.configs }
          _promesaEnCurso = null
          return _cache
        })
        .catch(() => {
          _promesaEnCurso = null
          return DEFAULTS
        })
    }

    _promesaEnCurso.then((data) => {
      setConfigs(data)
      setLoading(false)
    }).catch(() => {
      setError('No se pudo cargar la configuración del sistema.')
      setLoading(false)
    })
  }, [])

  // Permite invalidar el caché después de guardar cambios
  const invalidarCache = () => {
    _cache = null
    _promesaEnCurso = null
  }

  return { configs, loading, error, invalidarCache }
}
