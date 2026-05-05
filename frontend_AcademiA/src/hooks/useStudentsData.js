//   frontend_AcademiA\src\hooks\useStudentsData.js

import { useState, useEffect, useCallback } from 'react'
import apiEstudiantes from '../api/apiEstudiantes'

export const useStudentsData = () => {

    // Datos de estudiantes obtenidos del backend.
    const [studentsData, setStudentsData] = useState([])


    // Estado de carga (loading) útil para la UI
    const [loading, setLoading] = useState(false)

    // Estado de error(error)
    const [error, setError] = useState(null)

    // Función para obtener datos de estudiantes (fetchEstudiantes)
    // Usamos useCallback para que esta función no se recree en cada renderizado
    const fetchEstudiantes = useCallback(async () => {
        setLoading(true)    // Activamos el modo "cargando"
        setError(null)   // Limpiamos errores previos

        try {
            // Llamada a la API
            const response = await apiEstudiantes.getAll()

            // Lógica de validación
            const { data } = response

            // Info de data. Para depuración
            console.log("--- ESTADO DEL HOOK ---")
            console.log("Cargando:", loading)
            console.log("Datos recibidos (data):", data)


            if (Array.isArray(data)) {
                setStudentsData(data)
            } else {
                console.error('El formato de datos no es un array:', data)
                setStudentsData([])
            }
        } catch (error) {
            console.error('Error al obtener estudiantes:', error)
            if (error.response) {
                console.error('Detalles del error:', error.response.data)
            }
        } finally {
            // Desactivamos el modo "cargando" pase lo que pase
            setLoading(false)
        }
    }, [])

    // useEffect para cargar los datos automáticamente al montar el hook
    // Se jecuta una sola vez, y llama la función fetchEstudiantes automáticamente.
    useEffect(() => {
        fetchEstudiantes()
    }, [fetchEstudiantes])

    // RETORNO: los datos obtenidos de la base de datos
    return {
        studentsData,       // La lista de estudiantes
        setStudentsData,    // IMPORTANTE: Lo devolvemos para que se pueda modificar la tabla desde fuera (ej: al borrar)
        loading,         // Para saber si mostrar el spinner
        error,           // Para saber si falló
        fetchEstudiantes // Por si se desea añadir un botón de "Recargar tabla" manual
    }


}

