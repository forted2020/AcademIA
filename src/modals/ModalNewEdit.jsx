
import React from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody } from '@coreui/react'
import DynamicForm from '../components/DynamicForm/DynamicForm.jsx'

/**
 * Modal genérico para crear/editar registros
 * 
 * @param {Boolean} visible - Controla visibilidad del modal
 * @param {Function} onClose - Callback para cerrar
 * @param {String} title - Título del modal
 * @param {Object} initialData - Datos iniciales del formulario
 * @param {Function} onSave - Callback al guardar (recibe formData)
 * @param {Array} fields - Configuración de campos del formulario
 *   Ejemplo: [{ name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Ingrese nombre' }]
 */
const ModalNewEdit = ({ visible, onClose, title, initialData, onSave, fields }) => {
    return (
        <CModal
            size="xl"
            backdrop="static"
            visible={visible}
            onClose={onClose}
            aria-labelledby={`${title}-modal`}
        >
            <CModalHeader>
                <CModalTitle id={`${title}-modal`}>{title}</CModalTitle>
            </CModalHeader>

            <CModalBody>
                {/* Formulario dinámico configurable via props */}
                <DynamicForm
                    fields={fields || []}
                    initialData={initialData}
                    onSubmit={onSave}
                    onCancel={onClose}
                />
            </CModalBody>
        </CModal>
    )
}

export default ModalNewEdit
