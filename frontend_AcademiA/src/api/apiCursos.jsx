//  frontend_AcademiA\src\api\apiCursos.jsx


// Importamos la instancia configurada de axios (con interceptores, baseURL, etc.)
import api from './api.js'; 

// Endpoint base
const ENDPOINT = '/api'; 

//  Obtiene todos los Cursos [getAll]
export const getCursosAll = () => api.get(`${ENDPOINT}/cursos/`);

//  Obtiene todos los Cursos con Ciclo y Plan
export const getCursosCompleto = () => api.get(`${ENDPOINT}/cursos/completo/`);

// Obtiene todos los Cursos de un Ciclo Lectivo. 
// Recibe el 'id' como parámetro para armar la URL dinámica
export const getCursosCiclo = (id) => api.get(`${ENDPOINT}/cursos/por_ciclo/${id}`);

// Exportamos todas las funciones CRUD bajo un objeto para ser consumido por el front
const apiCursos = {
    getCursosAll,
    getCursosCiclo,
    getCursosCompleto
};

export default apiCursos;