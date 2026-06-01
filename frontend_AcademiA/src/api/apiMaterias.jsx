// frontend_AcademiA\src\api\apiMaterias.jsx


// Importamos la instancia configurada de axios (con interceptores, baseURL, etc.)
import api from './api.js'; 

// Endpoint base
const ENDPOINT = '/api'; 

//  Obtiene todos los Ciclos Lectivos [getAll]
export const getCiclosAll = () => api.get(`${ENDPOINT}/ciclos/`);

//  Obtiene todas las materias con datos para la tabla [getMateriasTabla)
export const getMateriasTabla = (config = {}) => api.get(`${ENDPOINT}/materias/tabla/`, config);

//  Obtiene tas las materias de un curso
export const getMateriasCurso = (idCurso) => api.get(`/api/materias/curso/${idCurso}`);

export const getNombresMaterias = ()          => api.get(`${ENDPOINT}/materias/nombres/`);
export const crearMateria       = (data)      => api.post(`${ENDPOINT}/materias/`, data);
export const actualizarMateria  = (id, data)  => api.put(`${ENDPOINT}/materias/${id}`, data);
export const eliminarMateria    = (id)        => api.delete(`${ENDPOINT}/materias/${id}`);

// Exportamos todas las funciones CRUD bajo un objeto para ser consumido por el front
const apiMaterias = {
    getMateriasTabla,
    getCiclosAll,
    getMateriasCurso,
    getNombresMaterias,
    crearMateria,
    actualizarMateria,
    eliminarMateria,
};

export default apiMaterias;