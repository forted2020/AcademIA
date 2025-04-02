
/*
    En este componente se definen dos funciones: 
         - onClose: para cerrar el modal (cancelar).
         - onConfirm: para confirmar la eliminación (llamará a handleDelete).



*/


import React from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react'

const ModalConfirmDel = ({visible, onClose, onConfirm, userId}) => {
  return (
    <>
      <CModal
        backdrop="static"
        visible={visible}           //  Prop "visible": Controla si el modal está abierto o cerrado.
        onClose={() => onClose()}   //  Prop "onClose": Función para cerrar el modal al Cancelar.
        aria-labelledby="StaticBackdropExampleLabel"
      >
        <CModalHeader>
          <CModalTitle> Confirmar eliminación.</CModalTitle>
        </CModalHeader>

        <CModalBody>
          Seguro que desea eiminar el usuario con ID {userId}? <br/>
          Este cambio no se puede revertir.
        </CModalBody>

        <CModalFooter>
            <CButton color="secondary" 
                onClick={() => onClose()}>
                Cancelar
            </CButton>
            <CButton 
                color="danger"
                onClick={() => onConfirm(userId)}   //  Prop "onConfirm": Función para confirmar la eliminación (llama a handleDelete).
            >
            Eliminar
            </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ModalConfirmDel;
