//  src\api\api.js

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',   // BaseURL general para todos los endpoints
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor para agregar el token a todas las solicitudes, excepto /api/login
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Clave usada en Login.js

    // Usamos config?.url para evitar errores si la URL no está definida por un instante
    // Verificamos que no sea la ruta de login
    if (token && config?.url && !config.url.includes('/api/login')) {

      // Aseguramos de que config.headers exista para no romper la app
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;

      console.log('✓ Token incluido en la solicitud');
    } else {
      console.log('ℹ️ Solicitud sin token (Login o falta de credenciales)');
    }

    return config;
  },
  (error) => {
    // Es vital manejar el error del interceptor también
    return Promise.reject(error);
  }
);

// ==================== USUARIOS DEL SISTEMA ====================
export const getUsers = () => api.get('/api/users');     // Lista todos los usuarios
export const getUser = (id) => api.get(`/api/users/${id}`);       // Obtiene un usuario por ID
export const createUser = (user) => api.post('/api/users/', user);        // Crea un usuario
export const updateUser = (id, user) => api.put(`/api/users/${id}`, user);        // Actualiza un usuario
export const deleteUser = (id) => api.delete(`/api/users/${id}`);     // Elimina un usuario

// ==================== AUTENTICACIÓN ====================
export const login = (data) => api.post('/api/login', data); // Login de usuario


// =====================================================
//  DOCENTES (tbl_entidad con tipo_entidad = 'DOC')
// =====================================================

// Obtener (GET) todos los docentes (tipo_entidad = 'DOC')
export const getDocentes = () => api.get('/api/docentes');

//  Obtener (GET) un Docente específico por ID
export const getDocente = (id_entidad) => api.get(`/api/docentes/${id_entidad}`);

//  Crear (POST) un nuevo Docente
export const createDocente = (docente) => api.post('/api/docentes/', docente);

//  Actualizar (PUT) un Docente
export const updateDocente = (id_entidad, data) => {
  return api.put(`/api/docentes/${id_entidad}`, data);
};
//  export const updateDocente = (id, docente) => api.put(`/api/docentes/${id}`, docente);

//  Eliminar (DELETE) un docente
export const deleteDocente = (id_entidad) => api.delete(`/api/docentes/${id_entidad}`);


export default api;



// ==================== NOTAS (tbl_notas) ====================

//  ====================  Crear notas  ====================
export const createNota = (nota) => api.post('/api/notas/', nota);

//  ====================  Obtener notas  ====================
export const getNotas = (params = {}) => api.get('/api/notas/', { params });

// ==================== PLANILLA DE CALIFICACIONES ====================
export const getPlanillaActa = (cicloId, cursoId, materiaId) =>
  api.get('/api/notas/planilla-acta', {
    params: {
      ciclo_id: cicloId,
      curso_id: cursoId,
      materia_id: materiaId
    }
  });

//  ====================  Para upsert de notas (POST) ====================
export const upsertNota = (payload) => {
  return api.post('/api/notas/upsert', payload);
};
