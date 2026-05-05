//  frontend_AcademiA\src\modals\ModalNewEdit.jsx

import React from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody } from '@coreui/react'
import DynamicForm from '../components/DynamicForm/DynamicForm'

const ModalNewEdit = ({ visible, onClose, title, initialData, onSave, fields }) => {
  return (
    
    <CModal 
      size="lg" 
      alignment="center" 
      backdrop="static" 
      visible={visible} 
      onClose={onClose}
      className="shadow-lg"
    >

      <CModalHeader className="bg-light">
        <CModalTitle className="fw-bold text-primary">{title}</CModalTitle>
      </CModalHeader>
      <CModalBody className="p-4">
        <DynamicForm 
          fields={fields} 
          initialData={initialData} 
          onSubmit={onSave} 
          onCancel={onClose} 
        />
      </CModalBody>
    </CModal>
  )
}

export default ModalNewEdit