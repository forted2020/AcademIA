//  frontend_AcademiA\src\components\informes\hooks\useInformesData.js

// Custom Hook que centraliza la lógica de las peticiones, gestionando los estados de las opciones y lo que el usuario va seleccionando.

import { useState, useEffect } from 'react';
import api from '../../../api/api';

// Recibimos "config" como prop, porque ahí están definidos los filtros.
export function useInformesData(config) {
    console.log('config recibido al montar el componente: ', config)
    // Evitamos "crashes".

    const [dataSources, setDataSources] = useState({});
    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Estados dinñamicos para los valores seleccionados
    // Esun useState para por ejemplo, ciclo, curso, materia,etc.
    const [seleccion, setSeleccion] = useState({});

    // Effect para limpieza al cambiar de informe
    useEffect(() => {
        // El hook se ejecuta siempre, pero si no hay config, no hace nada útil.
        setSeleccion({});
        setDataSources({});
        setError(null);
    }, [config]);


    // Effect para carga de datos
    // Garga opciones dinámicas, de forma genérica, según venganen el config
    useEffect(() => {
        // Validación interna: si no hay config, cortamos la ejecución, 
        // pero el useEffect YA FUE REGISTRADO por React.
        if (!config || !config.filters) return;

        const filters = config.filters;
        console.log('💚Config de filtros recibidos: ', config?.filters || [])

        const fetchOptions = async (filter) => {
            // Validación de optimización
            if (dataSources[filter.key] && !filter.dependsOn && typeof filter.endpoint !== 'function') return;

            setLoading(true);

            try {

                // Obtenemos la URL del endpoint
                // Detectamos primero si es dinámica (función) o estática (string)
                const isDynamic = typeof filter.endpoint === 'function';

                // Definimos URL y Params,medianteoperadores ternarios
                const url = isDynamic ? filter.endpoint(seleccion) : filter.endpoint;

                // Si la URL es dinámica y faltan parámetros, url puede ser null/undefined
                if (!url) return;

                const params = isDynamic ? {} : { ...seleccion };

                console.log('🎁 endpoint: ', 'api.get', url, params)

                //  Hacemos la petición a la URL calculada
                // Usamos 'api.get' (en lugar de 'fetch') para que incluya el TOKEN automáticamente
                const response = await api.get(url, { params });

                // Normaliza respuesta paginada { data: [], total } o array directo
                const payload = response.data;
                const items = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : payload);
                setDataSources(prev => ({
                    ...prev,
                    [filter.key]: items
                }));
                console.log('🎁🎁 Datos recibidos: ', response.data)

                // Limpiamos errores previos si hubo éxito
                setError(null);

            } catch (err) {
                console.error(`Error cargando ${filter.label}:`, err);
                setError(`Error al cargar ${filter.label}`);
            } finally {
                setLoading(false);
            }
        };


        filters.forEach(filter => {

            // Si ya tenemos datos para este filtro Y NO depende de nada (es estático, como Ciclos), no recargamos
            if (dataSources[filter.key] && !filter.dependsOn && !typeof filter.endpoint === 'function') {
                return;
            }

            // Si  es select y tiene endpoint
            if (filter.type === 'select' && filter.endpoint) {
                // Si el filtro depende de otro y aún no hay valor seleccionado del padre, no cargamos
                if (filter.dependsOn && !seleccion[filter.dependsOn]) return;
                // Cargamos solo si aún no hay opciones
                fetchOptions(filter);
            }

        });
        // if (filter.type !== 'select' || !filter.endpoint) return;
    }, [
        // El useEffect se dispara cuando cambia la configuración o cuando el usuario selecciona algo nuevo.
        // JSON.stringify ayuda a comparar el objeto seleccion por valor y no por referencia
        config,      // Si no anda, habilitar y deshabilitar el config.filters
        JSON.stringify(seleccion),  // Dependencias
        //config.filters  // config.filters solo, para queno se dispare muchas veces
    ]);

    // LOGICA AUXILIAR
    // HandleCambio con "Efecto Cascada" (Limpieza de hijos)
    const handleCambio = (key, value) => {
        if (!config) return;

        setSeleccion(prevSeleccion => {
            const nuevaSeleccion = { ...prevSeleccion, [key]: value };

            // Lógica de limpieza: Si cambio 'ciclo', debo borrar 'curso' y 'materia' de la selección.
            // Recorremos los filtros para ver quién depende de la key que acaba de cambiar.
            if (config.filters) {
                config.filters.forEach(f => {
                    if (f.dependsOn === key) {
                        // Borramos el valor seleccionado del hijo
                        delete nuevaSeleccion[f.key];
                        // Recursividad simple: Si borro por ej curso, también debería buscar quién depende de curso.
                        // Para hacerlo simple a 1 nivel:
                        config.filters.forEach(nieto => {
                            if (nieto.dependsOn === f.key) {
                                delete nuevaSeleccion[nieto.key];
                            }
                        });
                    }
                });
                return nuevaSeleccion;
            }
        });
    }
    console.log('datasources: ', dataSources, ' seleccion: ', seleccion)

    return {
        dataSources,
        seleccion,
        handleCambio,
        loading,
        error
    };
}




