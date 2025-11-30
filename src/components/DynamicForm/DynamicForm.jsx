// Componente de formulario dinámico y reutilizable
// Renderiza campos de input basándose en la configuración recibida via props

import React, { useState, useEffect } from 'react'
import { CForm, CFormInput, CFormLabel, CButton, CRow, CCol } from '@coreui/react'

/**
 * DynamicForm - Formulario genérico configurable
 * 
 * @param {Array} fields - Array de objetos definiendo campos:
 *   { name, label, type, required, placeholder }
 * @param {Object} initialData - Datos iniciales del formulario
 * @param {Function} onSubmit - Callback al guardar (recibe formData)
 * @param {Function} onCancel - Callback al cancelar
 */
const DynamicForm = ({ fields, initialData, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({})

    // Inicializar formData con initialData o valores vacíos
    useEffect(() => {
        const initial = {}
        fields.forEach(field => {
            initial[field.name] = initialData?.[field.name] || ''
        })
        setFormData(initial)
    }, [initialData, fields])

    // Manejar cambio de inputs
    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Manejar submit
    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit(formData)
    }

    return (
        <CForm onSubmit={handleSubmit}>
            <CRow>
                {fields.map((field) => (
                    <CCol xs={12} md={field.fullWidth ? 12 : 6} key={field.name} className="mb-3">
                        <CFormLabel htmlFor={field.name}>
                            {field.label} {field.required && <span className="text-danger">*</span>}
                        </CFormLabel>
                        <CFormInput
                            type={field.type || 'text'}
                            id={field.name}
                            name={field.name}
                            placeholder={field.placeholder || ''}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            required={field.required}
                        />
                    </CCol>
                ))}
            </CRow>

            {/* Botones de acción */}
            <CRow className="mt-3">
                <CCol className="d-flex justify-content-end gap-2">
                    <CButton color="secondary" onClick={onCancel}>
                        Cancelar
                    </CButton>
                    <CButton color="primary" type="submit">
                        Guardar
                    </CButton>
                </CCol>
            </CRow>
        </CForm>
    )
}

export default DynamicForm
