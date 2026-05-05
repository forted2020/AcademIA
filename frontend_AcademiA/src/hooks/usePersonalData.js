//   frontend_AcademiA\src\hooks\usePersonalData

import { useState, useEffect, useCallback } from 'react'
import apiPersonal from '../api/apiPersonal'

export const usePersonalData = () => {

    // Datos de personal obtenido del backend.
    const [personalData, setPersonalData] = useState([])

    // Estado de carga (loading) útil para la UI
    const [loading, setLoading] = useState(false)

    // Estado de error(error)
    const [error, setError] = useState(null)

    // Función para obtener datos de personal
    // Usamos useCallback para que esta función no se recree en cada renderizado
    const fetchPersonal = useCallback(async () => {
        setLoading(true)    // Activamos el modo "cargando"
        setError(null)   // Limpiamos errores previos

        try {
            // Llamada a la API
            const response = await apiPersonal.getPersonalAll()

            // Lógica de validación
            const { data } = response


            // Info de data. Para depuración
            console.log("--- ESTADO DEL HOOK ---")
            console.log("Cargando:", loading)
            console.log("Datos recibidos (data):", data)


            if (Array.isArray(data)) {
                setPersonalData(data)
            } else {
                console.error('El formato de datos no es un array:', data)
                setPersonalData([])
            }
        } catch (error) {
            console.error('Error al obtener datos del Personal:', error)
            if (error.response) {
                console.error('Detalles del error:', error.response.data)
            }
        } finally {
            // Desactivamos el modo "cargando" pase lo que pase
            setLoading(false)
        }
    }, [])

    // useEffect para cargar los datos automáticamente al montar el hook
    // Se jecuta una sola vez, y llama la función fetchPersonal automáticamente.
    useEffect(() => {
        fetchPersonal()
    }, [fetchPersonal])

    // RETORNO: los datos obtenidos de la base de datos
    return {
        personalData,       // La lista 
        setPersonalData,    // IMPORTANTE: Lo devolvemos para que se pueda modificar la tabla desde fuera (ej: al borrar)
        loading,         // Para saber si mostrar el spinner
        error,           // Para saber si falló
        fetchPersonal // Por si se desea añadir un botón de "Recargar tabla" manual
    }


}

