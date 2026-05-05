//  frontend_AcademiA\src\modals\ModalConfirmDel.jsx
/*
    En este componente se definen dos funciones: 
         - onClose: para cerrar el modal (cancelar).
         - onConfirm: para confirmar la eliminación (llamará a handleDelete).
*/


import { React, useState, useEffect } from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react'
import { CIcon } from '@coreui/icons-react';
import { cilTrash, cilCheckCircle } from '@coreui/icons';

const ModalConfirmDel = ({ visible, onClose, onConfirm, docente }) => {

  const [isSuccess, setIsSuccess] = useState(false) //  Para controlar la modal de Exito
  const [loading, setLoading] = useState(false)

  // Resetear la fase de éxito cada vez que la modal se abre/cierra
  useEffect(() => {
    if (!visible) {
      setIsSuccess(false)
      setLoading(false)
    }
  }, [visible])


  const handleConfirmAction = async () => {
    setLoading(true)
    try {
      await onConfirm() // Ejecuta handleDelete del padre
      setIsSuccess(true) // Si sale bien, pasamos a la pantalla de éxito
    } catch (error) {
      console.error("Error al eliminar:", error)

    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <CModal
        backdrop="static"
        visible={visible}           //  Prop "visible": Controla si el modal está abierto o cerrado.
        onClose={() => onClose()}   //  Prop "onClose": Función para cerrar el modal al Cancelar.
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalHeader 
          className={`bg-light fw-bold ${isSuccess ? 'text-success' : 'text-danger'}`}
        >
          {isSuccess ? 'Operación Exitosa' : 'Confirmar Eliminación'}
        </CModalHeader>

        <CModalBody className="text-center p-4">
          {!isSuccess ? (
            <>
              <CIcon icon={cilTrash} size="3xl" className="text-danger mb-3" />
              <p>
                ¿Está seguro de que desea eliminar al docente <br />
                <strong>{docente?.apellido}, {docente?.nombre}</strong>?
              </p>
              <span className="text-muted small">Este cambio no se puede revertir.</span>
            </>
          ) : (
            <>
              <CIcon icon={cilCheckCircle} size="3xl" className="text-success mb-3" />
              <h5>¡Eliminado!</h5>
              <p>El registro ha sido removido correctamente.</p>
            </>
          )}
        </CModalBody>


        <CModalFooter className="justify-content-center">
          {!isSuccess ? (
            <>
              <CButton color="secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </CButton>
              <CButton color="danger" onClick={handleConfirmAction} disabled={loading}>
                {loading ? 'Eliminando...' : 'Eliminar'}
              </CButton>
            </>
          ) : (
            <CButton color="success" className="text-white px-4" onClick={onClose}>
              Aceptar
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ModalConfirmDel;
