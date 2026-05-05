//  frontend_AcademiA\src\components\informes\hooks\useInformesData.js

// Custom Hook que centraliza la lógica de las peticiones, gestionando los estados de las opciones y lo que el usuario va seleccionando.

import { useState, useEffect } from 'react';
import { getCiclosAll, getMateriasCurso } from '../../../api/apiMaterias';
import { getCursosCiclo } from '../../../api/apiCursos'

// Recibimos "config" comoprop, porque ahí están definidos los filtros.
export const useInformesData = (config) => {

    // Estados para las opciones de los Selects (ej options.ciclo, options.curso, options.materia, etc)
    const [options, setOptions] = useState({});

    // Estados de UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estados dinñamicos para los valores seleccionados
    // Esun useState para por ejemplo, ciclo, curso, materia,etc.
    const [seleccion, setSeleccion] = useState({});

    // Garga las opciones de forma genérica, según venganen el config
    useEffect(() => {
        const filtros = config?.filtros || [];

        filtros.forEach(filtro => {
            // Solo los selects con endpoint
            if (filtro.type !== 'select' || !filtro.endpoint) return;

            const valorSeleccionado = seleccion[filtro.id];

            // Si el filtro depende de otro y aún no hay valor, no cargamos
            if (filtro.dependsOn && !seleccion[filtro.dependsOn]) return;

            const fetchOptions = async () => {
                setLoading(true);
                try {
                    const response = await fetch(filtro.endpoint);
                    const data = await response.json();

                    setOptions(prev => ({
                        ...prev,
                        [filtro.id]: data
                    }));

                } catch (err) {
                    setError(`Error al cargar ${filtro.label}`);
                } finally {
                    setLoading(false);
                }
            };

            // Cargamos solo si aún no hay opciones
            if (!options[filtro.id]) {
                fetchOptions();
            }
        });

    }, [seleccion, config]);

    // Manejador de cambios (cascada)
    const handleCambio = (campo, valor) => {
        setSeleccion(prev => {
            const nuevaSeleccion = { ...prev, [campo]: valor };

            // Reseteo en cascada según el orden de filtros
            const filtros = config.filtros.map(f => f.id);
            const index = filtros.indexOf(campo);

            filtros.slice(index + 1).forEach(f => {
                nuevaSeleccion[f] = '';
            });

            return nuevaSeleccion;
        });
    };
}




