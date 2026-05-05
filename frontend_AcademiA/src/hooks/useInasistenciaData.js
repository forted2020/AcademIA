//  src\hooks\useInasistenciaData.js

import { useState, useEffect } from 'react';

// Importamos la función específica
import { getInasisteniasPorEstudiante } from '../api/ApiInasistencia/apiInasistencia';

//  Hook para obtener los datos académicos de un estudiante.
// Encapsula la lógica de fetch, carga y manejo de errores.

const useInasistenciaData = (entityId, year) => {
    const [inasistenciaData, setInasistenciaData] = useState(null);
    const [loading, setLoading] = useState(false); // Por defecto en false, se activa en useEffect
    const [error, setError] = useState(null);
    const [fetchTrigger, setFetchTrigger] = useState(0);


    // FUNCIÓN CENTRAL: hace la llamada a la API y maneja la respuesta
    const fetchData = async (id, selectedYear) => {
        // Si el ID es null o vacío, y estamos en modo "esperando búsqueda"
        // NO lanzamos error, simplemente limpiamos todo y salimos.
        if (id === null || id === '' || id === undefined) {
            setInasistenciaData(null);
            setError(null);        // ← No mostramos error
            setLoading(false);
            return;
        }

        // Si llegamos acá, es que hay un ID válido → intentamos cargar
        setLoading(true); // Inicia el spinner
        setError(null);

        try {
            const response = await getInasisteniasPorEstudiante(entityId, year);
            const attendanceAPI = response.data;

            // --------------------------------------------------------------------------
            // 🔑 NOTA: Mocks temporales. En producción, aquí harías otras llamadas 
            //          a la API para obtener promedio, aprobadas, reprobadas, y materias.
            // --------------------------------------------------------------------------
            const attendancePercentage = attendanceAPI?.totalDaysAttended && attendanceAPI?.totalDaysScheduled
                ? `${((attendanceAPI.totalDaysAttended / attendanceAPI.totalDaysScheduled) * 100).toFixed(0)}%`
                : 'N/A';

            const tempSummary = {
                average: 7.0, // MOCK
                approved: 5, // MOCK
                attendance: attendancePercentage, // CALCULADO
                failed: 2 // MOCK
            };

            // Simula las materias (vacío, ya que la API solo trajo asistencias)
            const tempSubjects = [];

            // Almacena los datos en el estado
            setInasistenciaData({
                summary: tempSummary,
                subjects: tempSubjects,
                attendance: attendanceAPI, // <-- Datos reales de la API
            });

        } catch (err) {
            console.error("Error al cargar datos:", err);
            // Axios captura el error del backend automáticamente
            setError(err.response?.data?.detail || "Error al conectar con el servidor");
        } finally {
            setLoading(false);
        }
    };

    // Efecto que se dispara cuando cambian el ID o el Año, o cuando se fuerza un re-fetch
    useEffect(() => {
        fetchData(entityId, year);
    }, [entityId, year, fetchTrigger]);

    // Función de re-fetch para usar en el botón de búsqueda
    const refetch = () => setFetchTrigger(prev => prev + 1);

    return { inasistenciaData, loading, error, refetch };
};

export default useInasistenciaData;
