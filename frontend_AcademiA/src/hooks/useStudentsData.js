//   frontend_AcademiA\src\hooks\useStudentsData.js

import { useState, useEffect, useCallback } from 'react'
import apiEstudiantes from '../api/apiEstudiantes'

export const useStudentsData = ({ skip = 0, limit = 10 } = {}) => {
    const [studentsData, setStudentsData] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchEstudiantes = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await apiEstudiantes.getAll({ params: { skip, limit } })
            const { data } = response
            const items = Array.isArray(data) ? data : (data?.data ?? [])
            const totalCount = data?.total ?? items.length
            setStudentsData(items)
            setTotal(totalCount)
        } catch (error) {
            console.error('Error al obtener estudiantes:', error)
            setError(error)
        } finally {
            setLoading(false)
        }
    }, [skip, limit])

    useEffect(() => {
        fetchEstudiantes()
    }, [fetchEstudiantes])

    return {
        studentsData,
        setStudentsData,
        total,
        loading,
        error,
        fetchEstudiantes
    }
}
