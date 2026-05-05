// src\api\apiEstudiantes.js

import api from './api.js'; // Importamos la instancia configurada de axios (con interceptores, baseURL, etc.)

const ENDPOINT = '/api/estudiantes'; // Endpoint base específico
/*  Usar una constante como ENDPOINT en lugar de escribir la cadena de texto en cada función (getAll, create, update, remove) es una buena práctica. 
Si el backend decide cambiar la ruta base de Estudiantes a, por ejemplo, /api/alumnos, solo tienes que cambiar la constante en un solo lugar (ApiEstudiantes.js), en lugar de cambiarla en cuatro o cinco funciones.
*/

//   ---------- Funciones CRUD para Estudiantes (Usando Nombres Genéricos)    ----------

//  Obtiene todos los estudiantes [getAll]
export const getAll = () => api.get(ENDPOINT);

//   Obtiene un estudiante específico por ID [get]
//  Nota: Esta función no es usada por useGenericCrud, pero es buena práctica incluirla.
export const get = (id) => api.get(`${ENDPOINT}/${id}`);

//   Crea un nuevo estudiante [create]
export const create = (estudianteData) => api.post(`${ENDPOINT}/`, estudianteData);

//  Actualiza un estudiante existente [update]
export const update = (id, estudianteData) => api.put(`${ENDPOINT}/${id}`, estudianteData);

//  Elimina un estudiante [remove] 
export const remove = (id) => api.delete(`${ENDPOINT}/${id}`);


//  ----------   Funciones Especiales (Específicas de la entidad Estudiante)  ----------

//  Obtiene las materias en las que está inscripto un estudiante [getMateriasPorEstudiante]
export const getMateriasPorEstudiante = (estudianteId) => 
    api.get(`${ENDPOINT}/${estudianteId}/materias`);

//  Obtiene las materias en las que está inscripto un estudiante en un ciclo lectivo  [get_materias_ciclo_por_estudiante]
export const get_materias_ciclo_por_estudiante = (cicloId, estudianteId) => 
    api.get(`${ENDPOINT}/${cicloId}/${estudianteId}/materias`);


//  Obtiene los Ciclos Lectivos en los cuales un estudiante cursó alguna materia [getMateriasPorEstudiante]
export const getCiclosPorEstudiante = (estudianteId) => 
    api.get(`${ENDPOINT}/${estudianteId}/ciclos`);

// Exportamos todas las funciones CRUD bajo un objeto para ser consumido por useGenericCrud
const apiEstudiantes = {
    getAll,
    get,
    create,
    update,
    remove,
    getMateriasPorEstudiante, // También puedes exportar funciones especiales
    getCiclosPorEstudiante,
    get_materias_ciclo_por_estudiante,
};

export default apiEstudiantes;

