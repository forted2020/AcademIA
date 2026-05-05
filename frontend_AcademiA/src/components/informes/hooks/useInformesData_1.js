//  frontend_AcademiA\src\components\informes\hooks\useInformesData.js

// Custom Hook que centraliza la lógica de las peticiones, gestionando los estados de las opciones y lo que el usuario va seleccionando.

import { useState, useEffect } from 'react';

// Recibimos "config" comoprop, porque ahí están definidos los filtros.
export function useInformesData(config) {

    // Evitamos "crashes".
    if (!config) {
        return {
            dataSources: {},
            seleccion: {},
            handleCambio: () => { },
            loading: false,
            error: null
        };
    }

    const [dataSources, setDataSources] = useState({});

    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estados dinñamicos para los valores seleccionados
    // Esun useState para por ejemplo, ciclo, curso, materia,etc.
    const [seleccion, setSeleccion] = useState({});

    // Garga las opciones de forma genérica, según venganen el config
    useEffect(() => {
        const filters = config?.filters || [];

        filters.forEach(filter => {
            // Solo los selects con endpoint
            if (filter.type !== 'select' || !filter.endpoint) return;

            // Si el filtro depende de otro y aún no hay valor, no cargamos
            if (filter.dependsOn && !seleccion[filter.dependsOn]) return;

            const fetchOptions = async () => {
                setLoading(true);
                try {
                    const response = await fetch(filter.endpoint);
                    const data = await response.json();

                    setDataSources(prev => ({
                        ...prev,
                        [filter.key]: data
                    }));

                } catch (err) {
                    setError(`Error al cargar ${filter.label}`);
                } finally {
                    setLoading(false);
                }
            };

            // Cargamos solo si aún no hay opciones
            if (!dataSources[filter.key]) {
                fetchOptions();
            }
        });

    }, [seleccion, config.filters]);    // config.filters solo, para queno se dispare muchas veces

    // Manejador de cambios (cascada)
    const handleCambio = (key, value) => {
        setSeleccion(prev => ({
            ...prev,
            [key]: value
        }));
    };


    return {
        dataSources,
        seleccion,
        handleCambio,
        loading,
        error
    };
}




