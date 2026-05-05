//  frontend_AcademiA\src\hooks\UseCrudModalManager\useCrudModalManager.js

import { useState } from 'react';

export const useCrudModalManager = ({
    createApi,
    updateApi,
    deleteApi,
    setData
}) => {
    // Estados para Edición/Creación
    const [editModal, setEditModal] = useState({ visible: false, item: null });
    // Estados para Eliminación
    const [deleteModal, setDeleteModal] = useState({ visible: false, item: null });

    // --- Lógica de Apertura/Cierre ---
    const openEdit = (item = null) => setEditModal({ visible: true, item });
    const closeEdit = () => setEditModal({ visible: false, item: null });

    const openDelete = (item) => setDeleteModal({ visible: true, item });
    const closeDelete = () => setDeleteModal({ visible: false, item: null });

    // Estado para el mensaje temporal del toast
    const [toast, setToast] = useState(null);

    // --- Acción: Guardar (Create/Update) ---
    const handleSave = async (formData) => {
        try {
            // Capturamos la referencia actual para evitar problemas que justo cambie antes de responder. 
            const itemToEdit = editModal.item;

            const isEdit = !!editModal.item;

            // Extraemos el ID una sola vez
            const pkValue = isEdit ? itemToEdit.id_entidad : null;

            const response = isEdit
                ? await updateApi(pkValue, formData)
                : await createApi(formData);

            if (!response?.data) throw new Error("Error en la respuesta de la API");

            setData((prev) =>
                isEdit
                    ? prev.map((i) => (i.id_entidad === pkValue ? response.data : i))
                    : [...prev, response.data]
            );

            setToast({
                title: isEdit ? 'Actualización' : 'Éxito',
                message: isEdit ? 'Docente actualizado correctamente' : 'Docente creado con éxito',
                color: 'success'
            });


            closeEdit();
            return true;
        } catch (error) {
            console.error("Error al guardar:", error);
            throw error;
        }
    };

    // --- Acción: Eliminar ---
    const handleDelete = async () => {
        // Validación de seguridad por si está vacío
        if (!deleteModal.item) return;

        try {
            // Extraemos el ID del Objeto (se debe recibir 'deleteModal.item', el objeto completo).
            const idToDelete = deleteModal.item.id_entidad;

            // Validación de seguridad por si el objeto vino mal formado
            if (!idToDelete) {
                console.error("Error: El objeto no tiene 'id_entidad'", deleteModal.item);
                setToast({ title: 'Error', message: 'No se identificó el ID del registro', color: 'danger' });
                return;
            }

            // Llamada a la API
            await deleteApi(idToDelete);

            // Actualización de la Tabla Local
            setData((prev) => prev.filter((i) => i.id_entidad !== idToDelete));

            closeDelete();

            setToast({ title: 'Éxito', message: 'Eliminado correctamente', color: 'success' });

            return true;
        } catch (error) {
            console.error("Error al eliminar:", error);
            setToast({ title: 'Error', message: 'No se pudo eliminar el registro', color: 'danger' });
            throw error;
        }
    };

    return {
        editModal,
        deleteModal,
        openEdit,
        closeEdit,
        openDelete,
        closeDelete,
        toast,
        setToast, // Para poder resetearlo
        handleSave,
        handleDelete
    };
};