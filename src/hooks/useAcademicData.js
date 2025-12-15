//  src\hooks\useAcademicData.js

//  Hook de Datos
//  Se encarga de toda la lógica de la llamada a la API (fetchAcademicData) y de gestionar los estados de loading, error y academicData. 
//  Desacopla completamente el flujo de datos del componente de presentación.

import { useState, useEffect } from 'react';

// --- CONSTANTES ---
const API_BASE_URL = 'http://localhost:8000';
const API_PREFIX = '/api/estudiantes';

/**
 * Hook para obtener los datos académicos de un estudiante.
 * Encapsula la lógica de fetch, carga y manejo de errores.
 * * @param {number | string | null} entityId - ID de la entidad (estudiante) a consultar.
 * @param {string} year - Año académico seleccionado.
 * @returns {{ academicData: object | null, loading: boolean, error: string | null, refetch: () => void }}
 */
const useAcademicData = (entityId, year) => {
    const [academicData, setAcademicData] = useState(null);
    const [loading, setLoading] = useState(false); // Por defecto en false, se activa en useEffect
    const [error, setError] = useState(null);
    const [fetchTrigger, setFetchTrigger] = useState(0); // Para forzar un re-fetch si es necesario

    // FUNCIÓN CENTRAL: hace la llamada a la API y maneja la respuesta
    const fetchData = async (id, selectedYear) => {
        if (!id) {
            setError("Error: ID de Entidad no encontrado. Por favor, vuelva a iniciar sesión.");
            setLoading(false);
            return;
        }

        setLoading(true); // Inicia el spinner
        setError(null);
        setAcademicData(null);

        try {
            // Construye la URL correcta
            const attendanceUrl = `${API_BASE_URL}${API_PREFIX}/${id}/asistencias?year=${selectedYear}`;
            console.log(`API Call (id_entidad): ${attendanceUrl}`);

            const attendanceResponse = await fetch(attendanceUrl);

            if (!attendanceResponse.ok) {
                // Manejo de errores HTTP
                throw new Error(`Error ${attendanceResponse.status}: ${attendanceResponse.statusText}`);
            }

            const attendanceAPI = await attendanceResponse.json();
            
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
            setAcademicData({
                summary: tempSummary,
                subjects: tempSubjects,
                attendance: attendanceAPI, // <-- Datos reales de la API
            });

        } catch (err) {
            console.error("Error al cargar datos académicos:", err);
            setError(`Fallo al cargar datos: ${err.message}.`);
            setAcademicData(null);
        } finally {
            setLoading(false); // Finaliza el spinner
        }
    };

    // Efecto que se dispara cuando cambian el ID o el Año, o cuando se fuerza un re-fetch
    useEffect(() => {
        fetchData(entityId, year);
    }, [entityId, year, fetchTrigger]);
    
    // Función de re-fetch para usar en el botón de búsqueda
    const refetch = () => setFetchTrigger(prev => prev + 1);

    return { academicData, loading, error, refetch };
};

export default useAcademicData;

