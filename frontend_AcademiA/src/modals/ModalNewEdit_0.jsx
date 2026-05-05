import React, { useState, useEffect } from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton, CAlert } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilWarning } from '@coreui/icons'
import DynamicForm from '../components/DynamicForm/DynamicForm'

const ModalNewEdit = ({ visible, onClose, title, initialData, onSave, fields }) => {

  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorApi, setErrorApi] = useState(null) // Para mostrar errores

  // Limpiar estados cuando el modal se abre/cierra desde afuera
  useEffect(() => {
    if (!visible) {
      setShowConfirm(false)
      setShowSuccess(false)
      setErrorApi(null)
      setFormData(null)
    }
  }, [visible])

  const handleSubmitForm = (data) => {
    setFormData(data)
    setShowConfirm(true)
  }

  const handleConfirmSave = async () => {
    if (loading) return
    setLoading(true)

    try {
      await onSave(formData)
      setShowConfirm(false)
      setShowSuccess(true)

    } catch (error) {
      console.error('❌ Error en handleConfirmSave:', error)
      setShowConfirm(false) // Cerramos la confirmación para volver al formulario

      // Capturamos el mensaje: {"detail":"El email ya está registrado"}
      const msg = error.response?.data?.detail || "Error al procesar la solicitud."
      setErrorApi(msg)

    } finally {
      setLoading(false)
    }
  }

  const handleCancelConfirm = () => {
    setShowConfirm(false)
  }

  const handleFinalClose = () => {
    setShowSuccess(false)
    setShowConfirm(false)
    setFormData(null)
    setLoading(false)
    onClose()
  }

  // Manejador especial para modal principal
  const handleMainModalClose = () => {
    // Solo cerramos si NO estamos mostrando éxito
    if (!showSuccess) {
      handleFinalClose()
    }
  }

  return (
    <>
      {/* MODAL PRINCIPAL */}
      <CModal
        size="lg"
        alignment="center"
        backdrop="static"
        visible={visible && !showConfirm && !showSuccess}
        onClose={handleMainModalClose} 
      >
        <CModalHeader className="bg-light">
          <CModalTitle className="fw-bold text-primary">{title}</CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4">
          {errorApi && (
            <CAlert color="danger" className="d-flex align-items-center mb-4">
              <CIcon icon={cilWarning} className="me-2" />
              {errorApi}
            </CAlert>
          )}
          <DynamicForm
            fields={fields}
            initialData={initialData}
            onSubmit={handleSubmitForm}
            onCancel={handleFinalClose}
          />
        </CModalBody>
      </CModal>

      {/* MODAL DE CONFIRMACIÓN */}
      <CModal
        size="sm"
        alignment="center"
        visible={showConfirm}
        onClose={handleCancelConfirm}
        backdrop="static"
        style={{ zIndex: 1060 }}
      >
        <CModalHeader>
          <CModalTitle>¿Confirmar guardado?</CModalTitle>
        </CModalHeader>
        <CModalBody>
          ¿Está seguro de que desea guardar estos datos?
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="ghost"
            onClick={handleCancelConfirm}
            disabled={loading}
          >
            Cancelar
          </CButton>
          <CButton
            color="primary"
            onClick={handleConfirmSave}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Aceptar'}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* MODAL DE ÉXITO */}
      {/* Esta modal NO depende de visible */}
      <CModal
        size="sm"
        alignment="center"
        visible={showSuccess} // Depende de showSuccess
        onClose={handleFinalClose}
        backdrop="static"
      >
        <CModalBody className="text-center p-4">
          <CIcon icon={cilCheckCircle} size="3xl" className="text-success mb-3" />
          <h5 className="mb-3">Registro guardado con éxito</h5>
          <CButton color="success" onClick={handleFinalClose}>
            Entendido
          </CButton>
        </CModalBody>
      </CModal>
    </>
  )
}

export default ModalNewEdit