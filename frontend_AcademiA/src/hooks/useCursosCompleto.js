//   frontend_AcademiA\src\hooks\useCursosFull.js

import { useState, useEffect, useCallback } from 'react'
import apiCursos from '../api/apiCursos'

export const useCursosCompletoData = () => {

    // Datos de cursos obtenidos del backend.
    const [cursosCompletoData, setCursosCompletoData] = useState([])

    // Estado de carga (loading) útil para la UI
    const [loading, setLoading] = useState(false)

    // Estado de error(error)
    const [error, setError] = useState(null)

    // Función para obtener datos de cursos con Ciclo y Periodo (fetchCursosFull)
    // Usamos useCallback para que esta función no se recree en cada renderizado
    const fetchCursosCompleto = useCallback(async () => {
        setLoading(true)    // Activamos el modo "cargando"
        setError(null)   // Limpiamos errores previos

        try {
            // Llamada a la API
            const response = await apiCursos.getCursosCompleto()

            // Lógica de validación
            const { data } = response


            // Info de data. Para depuración
            console.log("--- ESTADO DEL HOOK ---")
            console.log("Cargando:", loading)
            console.log("Datos recibidos (data):", data)


            if (Array.isArray(data)) {
                setCursosCompletoData(data)
            } else {
                console.error('El formato de datos no es un array:', data)
                setCursosCompletoData([])
            }
        } catch (error) {
            console.error('Error al obtener Curos:', error)
            if (error.response) {
                console.error('Detalles del error:', error.response.data)
            }
        } finally {
            // Desactivamos el modo "cargando" pase lo que pase
            setLoading(false)
        }
    }, [])

    // useEffect para cargar los datos automáticamente al montar el hook
    // Se jecuta una sola vez, y llama la función fetchCursos automáticamente.
    useEffect(() => {
        fetchCursosCompleto()
    }, [fetchCursosCompleto])

    // RETORNO: los datos obtenidos de la base de datos
    return {
        cursosCompletoData,       // La lista de cursos
        setCursosCompletoData,    // IMPORTANTE: Lo devolvemos para que se pueda modificar la tabla desde fuera (ej: al borrar)
        loading,         // Para saber si mostrar el spinner
        error,           // Para saber si falló
        fetchCursosCompleto // Por si se desea añadir un botón de "Recargar tabla" manual
    }


}

