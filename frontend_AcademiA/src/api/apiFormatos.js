// frontend_AcademiA/src/api/apiFormatos.js
// Funciones de acceso a los endpoints de configuración del sistema y formatos de impresión.

import api from './api'

// ── Configuración global del sistema ────────────────────────────────────────

export const getConfigSistema = () =>
  api.get('/api/configuracion/sistema')

export const updateConfigSistema = (configs) =>
  api.put('/api/configuracion/sistema', { configs })

export const uploadLogo = ({ datos_base64, mime_type, nombre_archivo, ancho_px, alto_px }) =>
  api.post('/api/configuracion/sistema/logo', { datos_base64, mime_type, nombre_archivo, ancho_px, alto_px })

export const deleteLogo = () =>
  api.delete('/api/configuracion/sistema/logo')

// ── Modo de inscripción ──────────────────────────────────────────────────────

export const getModoInscripcion = () =>
  api.get('/api/configuracion/sistema')

export const updateModoInscripcion = ({ modo, motivo }) =>
  api.put('/api/configuracion/modo-inscripcion', { modo, motivo })

export const getHistorialModoInscripcion = () =>
  api.get('/api/configuracion/modo-inscripcion/historial')

// ── Permisos de navegación por rol ──────────────────────────────────────────
// Los permisos se guardan como JSON string en t_configuracion_sistema
// bajo la clave "nav_permisos_{ROL}" (ej: "nav_permisos_ADMIN_SISTEMA").

export const getNavPermisos = () =>
  api.get('/api/configuracion/sistema')

export const updateNavPermisos = (rol, permisosMapa) =>
  api.put('/api/configuracion/sistema', {
    configs: { [`nav_permisos_${rol}`]: JSON.stringify(permisosMapa) },
  })

// ── Configuración específica de cada tipo de documento ──────────────────────

export const getFormatoConfig = (codigo) =>
  api.get(`/api/formatos-impresion/${codigo}`)

export const updateFormatoConfig = (codigo, configs) =>
  api.put(`/api/formatos-impresion/${codigo}`, { configs })
