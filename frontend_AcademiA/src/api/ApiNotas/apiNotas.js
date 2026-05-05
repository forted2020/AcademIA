//  frontend_AcademiA\src\api\ApiNotas\apiNotas.js


// Importamos la instancia configurada de axios (con interceptores, baseURL, etc.)
import api from '../api.js'; 

// Endpoint base
const ENDPOINT = '/api/notas'; 

//  Obtiene todas las notas de Trimestre, Recuperatorios y Finales de un estudiente, materia y curso
export const getNotasEstudianteMateria = (estudianteId, materiaId, cursoId) => 
    api.get(`${ENDPOINT}/estudiante-materia-curso/${estudianteId}/${materiaId}/${cursoId}`);

//  Obtiene las notas de Exámen o TP de un estudiente, materia, curso y período
export const getNotasEstudianteMateriaTipo = (estudianteId, materiaId, cursoId, periodoId) => 
    api.get(`${ENDPOINT}/estudiante-materia-curso-tnota/${estudianteId}/${materiaId}/${cursoId}/${periodoId}`);

// Exportamos todas las funciones bajo un objeto para ser consumido por el front
const apiCursos = {
    getNotasEstudianteMateria,
};

export default apiCursos;