
// frontend_AcademiA\src\hooks\useFetch.js

// Hook "tonto", que recibe una URL y devolver data.
import { useState, useEffect, useCallback } from 'react';
import api from '../api/api';

export function useFetch(endpoint, params = null, shouldFetch = true) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // useCallback para evitar loops infinitos si endpoint cambia
    const fetchData = useCallback(async () => {
        if (!shouldFetch || !endpoint) return;

        setLoading(true);
        setError(null);
        try {
            const response = await api.get(endpoint, { params });
            setData(response.data);
        } catch (err) {
            setError(err.message || 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }, [endpoint, JSON.stringify(params), shouldFetch]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Devolvemos refetch por si queremos recargar manual
    return { data, loading, error, refetch: fetchData };
}
