// frontend_AcademiA/src/api/apiDashboard.jsx

import api from './api.js'

const ENDPOINT = '/api/dashboard'

// Resumen general para el panel admin: KPIs, alumnos por curso, previas top 5
export const getDashboardResumen = () => api.get(`${ENDPOINT}/resumen`)

const apiDashboard = { getDashboardResumen }
export default apiDashboard
