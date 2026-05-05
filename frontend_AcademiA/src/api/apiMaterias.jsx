// frontend_AcademiA\src\api\apiMaterias.jsx


// Importamos la instancia configurada de axios (con interceptores, baseURL, etc.)
import api from './api.js'; 

// Endpoint base
const ENDPOINT = '/api'; 

//  Obtiene todos los Ciclos Lectivos [getAll]
export const getCiclosAll = () => api.get(`${ENDPOINT}/ciclos/`);

//  Obtiene todas las materias con datos para la tabla [getMateriasTabla)
export const getMateriasTabla = () => api.get(`${ENDPOINT}/materias/tabla/`);

//  Obtiene tas las materias de un curso
export const getMateriasCurso = (idCurso) => api.get(`/api/materias/curso/${idCurso}`);

// Exportamos todas las funciones CRUD bajo un objeto para ser consumido por el front
const apiMaterias = {
    getMateriasTabla,
    getCiclosAll,
    getMateriasCurso,
};

export default apiMaterias;