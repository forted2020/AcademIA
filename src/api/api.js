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

// ==================== ESTUDIANTES (tbl_entidad con tipo_entidad = 'ALU') ====================
/**
 * Obtiene todos los estudiantes (entidades con tipo_entidad = 'ALU')
 * El backend debe filtrar automáticamente por tipo_entidad = 'ALU'
 */
export const getEstudiantes = () => api.get('/api/estudiantes');


/**
 * Obtiene un estudiante específico por ID
 * @param {number} id - ID del estudiante
 */
export const getEstudiante = (id) => api.get(`/api/estudiantes/${id}`);

/**
 * Crea un nuevo estudiante
 * El backend debe asignar automáticamente tipo_entidad = 'ALU'
 * @param {object} estudiante - Datos del estudiante
 */
export const createEstudiante = (estudiante) => api.post('/api/estudiantes/', estudiante);

/**
 * Actualiza un estudiante existente
 * @param {number} id - ID del estudiante
 * @param {object} estudiante - Datos actualizados del estudiante
 */
export const updateEstudiante = (id, estudiante) => api.put(`/api/estudiantes/${id}`, estudiante);

/**
 * Elimina un estudiante
 * @param {number} id - ID del estudiante a eliminar
 */
export const deleteEstudiante = (id) => api.delete(`/api/estudiantes/${id}`);


export default api;