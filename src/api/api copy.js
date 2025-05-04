import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/users/',
  headers: {'Content-Type': 'application/json'}
});

export const getUsers = () => api.get('/');     // Lista todos los usuarios
export const getUser = (id) => api.get(`/${id}`);       // Obtiene un usuario por ID
export const createUser = (user) => api.post('/', user);        // Crea un usuario
export const updateUser = (id, user) => api.put(`/${id}`, user);        // Actualiza un usuario
export const deleteUser = (id) => api.delete(`/${id}`);     // Elimina un usuario