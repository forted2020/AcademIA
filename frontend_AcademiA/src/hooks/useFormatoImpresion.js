// frontend_AcademiA/src/hooks/useFormatoImpresion.js
// Hook para leer la configuración guardada de un tipo de documento específico.
// Cachea por código. Nunca bloquea la generación de PDFs: si falla, retorna {}.

import { useState, useEffect } from 'react'
import { getFormatoConfig } from '../api/apiFormatos'

// Caché por código de formato
const _cache = {}
const _promesas = {}

export function useFormatoImpresion(codigo) {
  const [configs, setConfigs] = useState(_cache[codigo] ?? {})
  const [loading, setLoading] = useState(!_cache[codigo])
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!codigo) return

    if (_cache[codigo]) {
      setConfigs(_cache[codigo])
      setLoading(false)
      return
    }

    if (!_promesas[codigo]) {
      _promesas[codigo] = getFormatoConfig(codigo)
        .then((res) => {
          _cache[codigo] = res.data.configs ?? {}
          delete _promesas[codigo]
          return _cache[codigo]
        })
        .catch(() => {
          delete _promesas[codigo]
          return {}
        })
    }

    _promesas[codigo].then((data) => {
      setConfigs(data)
      setLoading(false)
    }).catch(() => {
      setError('No se pudo cargar la configuración del formato.')
      setLoading(false)
    })
  }, [codigo])

  const invalidarCache = () => {
    delete _cache[codigo]
    delete _promesas[codigo]
  }

  return { configs, loading, error, invalidarCache }
}
