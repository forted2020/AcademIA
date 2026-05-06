// frontend_AcademiA\src\api\apiNotificaciones.js

import api from './api.js'

const BASE = '/api/notificaciones'

// Lista todas las notificaciones del usuario autenticado
export const getNotificaciones = (params = {}) =>
  api.get(`${BASE}/`, { params })

// Retorna { total: N } — no leídas para el badge del header
export const getContadorNoLeidas = () => api.get(`${BASE}/no-leidas`)

// Marca una lista de IDs como leídas
export const marcarLeidas = (ids) => api.post(`${BASE}/marcar-leidas`, { ids })

// Elimina una notificación propia
export const eliminarNotificacion = (id) => api.delete(`${BASE}/${id}`)

// Obtiene la configuración de preferencias del usuario
export const getConfigNotificaciones = () => api.get(`${BASE}/config`)

// Guarda las preferencias (upsert). Recibe array [{ tipo, activa }]
export const updateConfigNotificaciones = (preferencias) =>
  api.put(`${BASE}/config`, { preferencias })

const apiNotificaciones = {
  getNotificaciones,
  getContadorNoLeidas,
  marcarLeidas,
  eliminarNotificacion,
  getConfigNotificaciones,
  updateConfigNotificaciones,
}

export default apiNotificaciones
