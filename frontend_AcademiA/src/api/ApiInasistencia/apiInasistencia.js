//  frontend_AcademiA\src\api\ApiAsistencia\apiInasistencia.js

import api from '../api'; // Importamos la instancia configurada de axios (con interceptores, baseURL, etc.)

const ENDPOINT = '/api/estudiantes/inasistencias'; // Endpoint base específico

//  Obtiene las inasistencias de un estudiante [getInasisteniasPorEstudiante]
//  La URL final será: /api/estudiantes/inasistencias/{id}/{year}
export const getInasisteniasPorEstudiante = (estudianteId, year) =>
    api.get(`${ENDPOINT}/${estudianteId}/${year}`);

export default getInasisteniasPorEstudiante;
