//  frontend_AcademiA\src\hooks\UseCrudModalManager\useCrudModalManager.js

import { useState } from 'react';
import { useToast } from '../../context/ToastContext';

export const useCrudModalManager = ({
    createApi,
    updateApi,
    deleteApi,
    setData
}) => {
    const { showSuccess, showError, showInfo } = useToast();

    // Estados para Edición/Creación
    const [editModal, setEditModal] = useState({ visible: false, item: null });
    // Estados para Eliminación
    const [deleteModal, setDeleteModal] = useState({ visible: false, item: null });

    // --- Lógica de Apertura/Cierre ---
    const openEdit = (item = null) => setEditModal({ visible: true, item });
    const closeEdit = () => setEditModal({ visible: false, item: null });

    const openDelete = (item) => setDeleteModal({ visible: true, item });
    const closeDelete = () => setDeleteModal({ visible: false, item: null });

    // --- Acción: Guardar (Create/Update) ---
    // meta: { hayCambios, isEdit } — informado por DynamicForm
    const handleSave = async (formData, meta = {}) => {
        try {
            const itemToEdit = editModal.item;
            const isEdit     = !!itemToEdit;
            const pkValue    = isEdit ? itemToEdit.id_entidad : null;
            const hayCambios = meta.hayCambios ?? true  // En alta siempre hay "cambios"

            const response = isEdit
                ? await updateApi(pkValue, formData)
                : await createApi(formData);

            if (!response?.data) throw new Error('Error en la respuesta de la API');

            setData((prev) =>
                isEdit
                    ? prev.map((i) => (i.id_entidad === pkValue ? response.data : i))
                    : [...prev, response.data]
            );

            // Cierra primero para que el toast no quede atrapado por el stacking context del modal
            closeEdit();

            if (!isEdit) {
                showSuccess('Registro creado con éxito')
            } else if (hayCambios) {
                showSuccess('Cambios guardados correctamente')
            } else {
                showInfo('No se realizaron modificaciones', 'Sin cambios')
            }

            return true;
        } catch (error) {
            console.error('Error al guardar:', error);
            showError('No se pudo guardar. Verificá los datos ingresados.');
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

            showSuccess('Eliminado correctamente');

            return true;
        } catch (error) {
            console.error("Error al eliminar:", error);
            showError('No se pudo eliminar el registro');
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
        handleSave,
        handleDelete
    };
};