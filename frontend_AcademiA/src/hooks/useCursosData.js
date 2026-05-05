//   frontend_AcademiA\src\hooks\useStudentsData.js

import { useState, useEffect, useCallback } from 'react'
import apiCursos from '../api/apiCursos'

export const useCursosData = () => {

    // Datos de cursos obtenidos del backend.
    const [cursosData, setCursosData] = useState([])

    // Estado de carga (loading) útil para la UI
    const [loading, setLoading] = useState(false)

    // Estado de error(error)
    const [error, setError] = useState(null)

    // Función para obtener datos de cursos (fetchCursos)
    // Usamos useCallback para que esta función no se recree en cada renderizado
    const fetchCursos = useCallback(async () => {
        setLoading(true)    // Activamos el modo "cargando"
        setError(null)   // Limpiamos errores previos

        try {
            // Llamada a la API
            const response = await apiCursos.getCursosAll()

            // Lógica de validación
            const { data } = response


            // Info de data. Para depuración
            console.log("--- ESTADO DEL HOOK ---")
            console.log("Cargando:", loading)
            console.log("Datos recibidos (data):", data)


            if (Array.isArray(data)) {
                setCursosData(data)
            } else {
                console.error('El formato de datos no es un array:', data)
                setCursosData([])
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
        fetchCursos()
    }, [fetchCursos])

    // RETORNO: los datos obtenidos de la base de datos
    return {
        cursosData,       // La lista de cursos
        setCursosData,    // IMPORTANTE: Lo devolvemos para que se pueda modificar la tabla desde fuera (ej: al borrar)
        loading,         // Para saber si mostrar el spinner
        error,           // Para saber si falló
        fetchCursos // Por si se desea añadir un botón de "Recargar tabla" manual
    }


}

