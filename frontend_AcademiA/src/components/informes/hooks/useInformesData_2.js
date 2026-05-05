//  frontend_AcademiA\src\components\informes\hooks\useInformesData.js

// Custom Hook que centraliza la lógica de las peticiones, gestionando los estados de las opciones y lo que el usuario va seleccionando.

import { useState, useEffect } from 'react';
import api from '../../../api/api';

/**
 * HOOK ORQUESTADOR DE FILTROS
 * ---------------------------
 * Responsabilidad:
 * 1. Leer la configuración del informe activo.
 * 2. Ir a buscar las opciones para los combos (ej. lista de Ciclos) a la API.
 * 3. Gestionar la dependencia entre filtros (Si elijo Ciclo X, cargar Cursos de X).
 * 4. Limpiar datos viejos cuando cambia el informe.
 */
export function useInformesData(config) {
    
    // Almacena las opciones disponibles para cada select (ej: { ciclo: [...], curso: [...] })
    const [dataSources, setDataSources] = useState({});
    
    // Almacena lo que el usuario seleccionó (ej: { ciclo: 1, curso: 55 })
    const [seleccion, setSeleccion] = useState({});

    // Estados de control de UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // useEffect para la limpieza maestra
    // Se dispara UNICAMENTE cuando cambia el objeto "config".
    // Es decir, cuando el usuario selecciona un "Tipo de Informe" diferente en el padre.
    // Evita que queden seleccionados cursos o ciclos de un informe anterior.
    useEffect(() => {
        // console.log('🧹 Limpiando estado del hook por cambio de configuración...');
        setSeleccion({});
        setDataSources({});
        setError(null);
    }, [config]); 


    // Effect de carga de opciones (data fetching)
    // Detecta cambios en la selección o en la config para buscar datos nuevos.
    useEffect(() => {
        // Si no hay config o filtros definidos, no hacemos nada.
        if (!config || !config.filters) return;

        const filters = config.filters;

        // Función asíncrona interna para buscar datos de un filtro específico
        const fetchOptions = async (filter) => {
            // OPTIMIZACIÓN: Si ya tenemos datos para este filtro y es estático (no depende de nada), no recargamos.
            if (dataSources[filter.key] && !filter.dependsOn && typeof filter.endpoint !== 'function') return;

            setLoading(true);
            try {
                // LÓGICA DINÁMICA:
                // Si el endpoint es una función (ej: (sel) => `api/cursos/${sel.ciclo}`), la ejecutamos.
                // Si es un string fijo, lo usamos directo.
                const isDynamic = typeof filter.endpoint === 'function';
                const url = isDynamic ? filter.endpoint(seleccion) : filter.endpoint;
                
                // Si la URL es null (porque faltan dependencias), cortamos aquí.
                if (!url) return; 

                // NOTA TÉCNICA: Usamos api.get manual aquí y no un hook genérico (useFetch)
                // porque estamos dentro de un loop lógico. React prohíbe hooks dentro de loops/condicionales.
                const params = isDynamic ? {} : { ...seleccion };
                const response = await api.get(url, { params });
                
                // Actualizamos dataSources preservando lo que ya tenían otros filtros
                setDataSources(prev => ({
                    ...prev,
                    [filter.key]: response.data
                }));
                setError(null);
            } catch (err) {
                console.error(`Error cargando opciones para ${filter.label}:`, err);
                setError(`No se pudieron cargar las opciones de ${filter.label}`);
            } finally {
                setLoading(false);
            }
        };

        // Recorremos los filtros configurados para ver cuál necesita cargar datos
        filters.forEach(filter => {
            // Solo nos interesan los tipo 'select' que tengan endpoint
            if (filter.type === 'select' && filter.endpoint) {
                
                // Si el filtro depende de un padre (ej. Curso depende de Ciclo)
                // y el padre NO está seleccionado en "seleccion", no cargamos nada.
                if (filter.dependsOn && !seleccion[filter.dependsOn]) {
                    return; 
                }
                
                // Si pasa las validaciones, buscamos los datos
                fetchOptions(filter);
            }
        });

    }, [
        config, // Se dispara si cambia la config general
        JSON.stringify(seleccion) // Se dispara si cambia cualquier valor seleccionado
    ]);


    // Manejador de cambios con efecto cascada
    const handleCambio = (key, value) => {
        setSeleccion(prev => {
            // Creamos una copia del estado anterior con el nuevo valor
            const nuevaSeleccion = { ...prev, [key]: value };

            // Si cambio el "Ciclo", el "Curso" seleccionado ya no es válido. Hay que borrarlo.
            if (config && config.filters) {
                config.filters.forEach(f => {
                    // Si algún filtro depende del que acabo de cambiar (key)...
                    if (f.dependsOn === key) {
                        delete nuevaSeleccion[f.key]; // Borramos su selección

                        // Borramos también a los nietos (2 niveles de profundidad)
                        config.filters.forEach(nieto => {
                            if (nieto.dependsOn === f.key) delete nuevaSeleccion[nieto.key];
                        });
                    }
                });
            }
            return nuevaSeleccion;
        });
    };

    return { dataSources, seleccion, handleCambio, loading, error };
}