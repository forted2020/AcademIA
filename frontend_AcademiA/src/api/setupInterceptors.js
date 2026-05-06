// src/api/setupInterceptors.js
import api from './api'

export const setupInterceptors = ({ showWarn, showError, onUnauthorized }) => {
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            const status = error?.response?.status
            if (status === 401) {
                onUnauthorized()
            } else if (status === 403) {
                showWarn('No tenés permisos para realizar esta acción', 'Sin permisos')
            } else if (status >= 500) {
                showError('Error interno del servidor. Intentá de nuevo.', 'Error')
            }
            return Promise.reject(error)
        }
    )
}
