//  frontend_AcademiA\src\components\DynamicForm\DynamicForm.jsx

import React, { useState, useEffect } from 'react'
import { CRow, CCol, CForm, CFormLabel, CFormInput, CButton, CInputGroup, CInputGroupText, CFormSelect } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilEnvelopeOpen, cilCalendar, cilPhone, cilLockLocked, cilList } from '@coreui/icons'

const DynamicForm = ({ fields, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({})

  // Detectamos si es edición (si el registro ya tiene un ID o PK)
  // Sirve para distintas opciones si es modal de edicion o de alta
  const isEdit = !!initialData?.id_entidad;


  // Sincroniza el estado del formulario con los datos recibidos cuando cambian los datos iniciales
    //  Formatea las fechas (YYYY-MM-DD) para que el navegador pueda mostrarlas correctamente si viene tipo datetime

    /*
  useEffect(() => {
    setFormData(initialData || {})
  }, [initialData])
  */
  useEffect(() => {
  if (initialData) {
    const sanitizedData = { ...initialData };
    
    // Recorremos los campos para ver cuáles son de tipo fecha
    fields.forEach(field => {
      if (field.type === 'date' && sanitizedData[field.name]) {
        // Cortamos el string para que solo quede YYYY-MM-DD
        sanitizedData[field.name] = sanitizedData[field.name].split('T')[0];
      }
    });
    
    setFormData(sanitizedData);
  } else {
    setFormData({});
  }
}, [initialData, fields]);



  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('🟢 DynamicForm handleSubmit ejecutado')
    console.log('📦 formData:', formData)
    console.log('🔧 onSubmit recibido?:', typeof onSubmit, onSubmit)

    if (typeof onSubmit === 'function') {
      onSubmit(formData)
    } else {
      console.error('❌ onSubmit NO es una función!')
    }
  }

  // Lógica para elegir icono según el nombre del campo
  const getIcon = (name) => {
    const n = name.toLowerCase()
    if (n.includes('email')) return cilEnvelopeOpen
    if (n.includes('pass')) return cilLockLocked
    if (n.includes('fec') || n.includes('date')) return cilCalendar
    if (n.includes('tel') || n.includes('cel')) return cilPhone
    if (n.includes('tipo') || n.includes('id_')) return cilList
    return cilUser
  }

  return (
    <CForm onSubmit={handleSubmit}>
      <CRow className="g-3">
        {fields
          .filter(field => !(isEdit && field.hideOnEdit)) // Filtramos si es edicion o Alta, para mostrar o no el campo.
          .map((field) => (
            <CCol md={field.fullWidth ? 12 : 6} key={field.name}>
              <CFormLabel className="small text-muted fw-bold">{field.label}</CFormLabel>
              <CInputGroup className="shadow-sm">
                <CInputGroupText><CIcon icon={getIcon(field.name)} /></CInputGroupText>

                {/* Renderizado condicional: Select o Input */}
                {field.type === 'select' ? (
                  <CFormSelect    //  Si el campo es de tipo Select
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required}
                  >
                    <option value="">Seleccionar...</option>
                    {field.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </CFormSelect>
                ) : (
                  <CFormInput //  Si el campo es de tipo Input
                    type={field.type || 'text'}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                    readOnly={isEdit && field.readOnlyOnEdit} // Sólo lectura según sea Edit o New
                    disabled={isEdit && field.readOnlyOnEdit}  // Texto normal, sin tipo campo. No editable.
                  />
                )}
              </CInputGroup>
            </CCol>
          ))}
      </CRow>
      <div className="mt-4 d-flex justify-content-end gap-2 border-top pt-3">
        <CButton color="secondary" variant="ghost" onClick={onCancel}>Cancelar</CButton>
        <CButton color="primary" type="submit" className="px-4 shadow">Guardar</CButton>
      </div>
    </CForm>
  )
}

export default DynamicForm
