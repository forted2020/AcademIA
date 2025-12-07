// src/hooks/useGenericCrud.js
import { useState, useEffect, useMemo } from 'react'
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table'

/**
 * Hook genérico para manejar la lógica CRUD, estado de tabla y modales.
 * @param {object} apiFunctions - Objeto con las funciones de API (getAll, create, update, delete).
 * @param {function} getColumns - Función para obtener la configuración de columnas de TanStack Table.
 * @returns {object} Todos los estados y handlers necesarios.
 */
export const useGenericCrud = (apiFunctions, getColumns) => {
    // ---------- Estados comunes a cualquier entidad ----------
    const [tableData, setTableData] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [columnFilters, setColumnFilters] = useState([])
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
    const [sorting, setSorting] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    // ---------- Estados comunes a modales CRUD ----------
    const [deleteModalVisible, setDeleteModalVisible] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null) // Ahora 'item', no 'student'
    const [editModalVisible, setEditModalVisible] = useState(false)
    const [itemToEdit, setItemToEdit] = useState(null)

    // ---------- 1. Fetch inicial de datos ----------
    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            const response = await apiFunctions.getAll()
            const { data } = response
            if (Array.isArray(data)) {
                setTableData(data)
            } else {
                setTableData([])
            }
        } catch (error) {
            console.error('Error al obtener datos:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // ---------- 2. Handlers de Modales y Acciones ----------
    
    // Función para eliminar el item
    const handleDelete = async () => {
        if (!itemToDelete) return
        try {
            await apiFunctions.delete(itemToDelete)
            setTableData((prev) => prev.filter((item) => item.id !== itemToDelete))
            setItemToDelete(null)
            setDeleteModalVisible(false)
        } catch (error) {
            console.error('Error al eliminar:', error)
        }
    }
    
    // Función para crear o actualizar el item
    const handleSave = async (itemData) => {
        try {
            let response
            if (itemToEdit) {
                // Actualizar
                response = await apiFunctions.update(itemToEdit.id, itemData)
                setTableData((prev) =>
                    prev.map((item) => (item.id === itemToEdit.id ? response.data : item))
                )
            } else {
                // Crear
                response = await apiFunctions.create(itemData)
                setTableData((prev) => [...prev, response.data])
            }
            setItemToEdit(null)
            setEditModalVisible(false)
        } catch (error) {
            console.error('Error al guardar:', error)
            alert(error.response?.data?.detail || 'Error al guardar.')
        }
    }

    // Handlers de UI
    const confirmDelete = (id) => {
        setItemToDelete(id)
        setDeleteModalVisible(true)
    }

    const handleClickEdit = (item) => {
        setItemToEdit(item)
        setEditModalVisible(true)
    }

    const handleClickNew = () => {
        setItemToEdit(null)
        setEditModalVisible(true)
    }

    // ---------- 3. Configuración de TanStack Table ----------
    
    // Las columnas dependen de la entidad, pero las acciones son comunes
    const columns = useMemo(() => getColumns(confirmDelete, handleClickEdit), [getColumns])

    const table = useReactTable({
        data: tableData,
        columns,
        // ... (resto de la configuración de TanStack Table que es idéntica para todos)
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onPaginationChange: setPagination,
        getSortedRowModel: getSortedRowModel(),
        onSortingChange: setSorting,
        getFilteredRowModel: getFilteredRowModel(),
        onGlobalFilterChange: setSearchTerm,
        onColumnFiltersChange: setColumnFilters,
        state: {
            pagination,
            sorting,
            globalFilter: searchTerm,
            columnFilters,
        },
    })
    
    // Retornamos los estados y handlers genéricos
    return {
        table,
        isLoading,
        searchTerm,
        setSearchTerm,
        columnFilters,
        setColumnFilters,
        // Modales y Acciones
        deleteModalVisible,
        setDeleteModalVisible,
        itemToDelete,
        handleDelete,
        editModalVisible,
        setEditModalVisible,
        itemToEdit,
        handleSave,
        handleClickNew,
    }
}