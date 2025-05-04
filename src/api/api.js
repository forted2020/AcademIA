import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',   // BaseURL general para todos los endpoints
  headers: {'Content-Type': 'application/json'}
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


export const getUsers = () => api.get('/api/users');     // Lista todos los usuarios
export const getUser = (id) => api.get(`/api/users/${id}`);       // Obtiene un usuario por ID
export const createUser = (user) => api.post('/api/users/', user);        // Crea un usuario
export const updateUser = (id, user) => api.put(`/api/users/${id}`, user);        // Actualiza un usuario
export const deleteUser = (id) => api.delete(`/api/users/${id}`);     // Elimina un usuario
export const login = (data) => api.post('/api/login', data); // Login de usuario


export default api;