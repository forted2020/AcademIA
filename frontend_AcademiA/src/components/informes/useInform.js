// frontend_AcademiA\src\components\informes\useInform.js

// Hook genérico. Se encarga del ciclo de vida de la petición: Carga -> Petición -> Validación -> Formateo -> Estado Final.

import { useState, useEffect, useCallback } from 'react';
import api from '../../api/api' // Tu servicio de API con Axios/Fetch ya configurado


export const useInforme = (
    endpoint,
    params = {},
    dataMapper = null,  //   usamos dataMapper para "inyectar" datos calculados al data
    summaryCalculator = null,    // Campos calculados
    transformResponse = null,    // Función para extraer la lista de respuestas anidadas (ej: {alumnos: [...]})
) => {
    const [data, setData] = useState({ summary: {}, list: [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    console.log("endPoint que recibe useInforms: ", endpoint)
    console.log("Params que recibe useInforms: ", params)



    const fetchInforme = useCallback(async () => {
        // Evitamos peticiones si no hay endpoint
        if (!endpoint) return;

        setLoading(true);
        setError(null);

        try {
            // FastAPI recibirá estos params como Query Parameters
            const response = await api.get(endpoint, { params });
            console.log(" 😉 Respuesta de la api: ", response.data)

            // Acá se puede aplicar lógica de formateo genérica, de ser necesario. 
            // Suponemos que el backend devuelve { summary: {...}, list: [...] }
            const result = response.data;

            //  -------  efinimos campos calculados  -------
            // Normalizamos la lista "cruda".
            // Prioridad:
            //   1) transformResponse explícito de la config (si lo configuraron)
            //   2) array directo
            //   3) claves convencionales del backend (list / data / alumnos)
            let listaRaw
            if (typeof transformResponse === 'function') {
                listaRaw = transformResponse(result) || []
            } else if (Array.isArray(result)) {
                listaRaw = result
            } else {
                listaRaw = result.list || result.data || result.alumnos || []
            }

            // Aplicamos el mapper si nos lo pasaron, transformando los datos
            // Esto transforma los datos (ej: agrega 'condicion_texto') ANTES de guardarlos en el estado
            const listaProcesada = dataMapper
                ? listaRaw.map(item => dataMapper(item))
                : listaRaw;

            // Campos calculados
            // Si hay datos calculador, lo usamos. Si no, usamos el summary que venga del backend.
            // Usamos además una condición para contemplar que la API mande una lista directa o un objeto
            const summaryFinal = summaryCalculator ? summaryCalculator(listaProcesada) : (result.summary || {});

            setData({
                summary: summaryFinal,
                list: listaProcesada // Guardamos la lista con datos calculados
            });

        } catch (err) {
            console.error("Error en el informe:", err);
            setError(err.response?.data?.detail || "Error al cargar el informe");
        } finally {
            setLoading(false);
        }
    }, [endpoint, JSON.stringify(params)]); // Se dispara cuando cambia el endpoint o los filtros


    useEffect(() => {
        fetchInforme();
    }, [fetchInforme]);

    console.log("🤷‍♀️ data antes del return:", data)

    return { data, loading, error, refetch: fetchInforme };
};