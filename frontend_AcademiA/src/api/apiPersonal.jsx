//  frontend_AcademiA\src\api\apiPersonal.jsx

// Importamos la instancia configurada de axios (con interceptores, baseURL, etc.)
import api from './api.js'; 

// Endpoint base
const ENDPOINT = '/api'; 

//  Obtiene todos las entidades tipo Personal [getAll]
export const getPersonalAll = (config = {}) => api.get(`${ENDPOINT}/personal/`, config);

// Exportamos todas las funciones CRUD bajo un objeto para ser consumido por el front
const apiPersonal = {
    getPersonalAll,
};

export default apiPersonal;