//  api.js
 
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',   // BaseURL general para todos los endpoints
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor para agregar el token a todas las solicitudes, excepto /api/login
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Clave usada en Login.js
  if (token && !config.url.includes('/api/login')) {    // OBS: No agrega token si la URL es /api/login
    config.headers.Authorization = `Bearer ${token}`;
    console.log('Token incluido en la solicitud:', token); // Log para depuración
  } else {
    console.log('No se encontró token en localStorage');
  }
  return config;
});

// ==================== USUARIOS DEL SISTEMA ====================
export const getUsers = () => api.get('/api/users');     // Lista todos los usuarios
export const getUser = (id) => api.get(`/api/users/${id}`);       // Obtiene un usuario por ID
export const createUser = (user) => api.post('/api/users/', user);        // Crea un usuario
export const updateUser = (id, user) => api.put(`/api/users/${id}`, user);        // Actualiza un usuario
export const deleteUser = (id) => api.delete(`/api/users/${id}`);     // Elimina un usuario

// ==================== AUTENTICACIÓN ====================
export const login = (data) => api.post('/api/login', data); // Login de usuario



// ==================== DOCENTES (tbl_entidad con tipo_entidad = 'DOC') ====================
/**
 * Obtiene todos los docentes (entidades con tipo_entidad = 'DOC')
 * El backend debe filtrar automáticamente por tipo_entidad = 'DOC'
 */
export const getDocentes = () => api.get('/api/docentes');


/**
 * Obtiene un Docente específico por ID
 * @param {number} id - ID del Docente
 */
export const getDocente = (id) => api.get(`/api/docentes/${id}`);

/**
 * Crea un nuevo Docente
 * El backend debe asignar automáticamente tipo_entidad = 'DOC'
 * @param {object} docente - Datos del Docente
 */
export const createDocente = (docente) => api.post('/api/docentes/', docente);

/**
 * Actualiza un docente existente
 * @param {number} id - ID del docente
 * @param {object} docente - Datos actualizados del docente
 */
export const updateDocente = (id, docente) => api.put(`/api/docentes/${id}`, docente);

/**
 * Elimina un docente
 * @param {number} id - ID del docente a eliminar
 */
export const deleteDocente = (id) => api.delete(`/api/docentes/${id}`);




export default api;