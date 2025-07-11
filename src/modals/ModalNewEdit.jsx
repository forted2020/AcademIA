
import React from 'react'
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react'
import FormAltaUsuario from '../../src/components/FormAltaUsuario.jsx'


const ModalNewEdit = ({ visible, onClose, title, initialData, onSave }) => {
    console.log('Props recibidas en ModalNewEdit:', { visible, onClose, title, initialData, onSave });

    
    return (
        <>
            <CModal
                size="xl"
                ackdrop="static"
                visible={visible}           //  Prop "visible": Controla si el modal está abierto o cerrado.
                onClose={onClose}  //  Prop "onClose": Función para cerrar el modal al Cancelar.
                aria-labelledby={`${title}-modal`}
            >
                <CModalHeader>
                    <CModalTitle id={`${title}-modal`}> {title} </CModalTitle>
                </CModalHeader>

                <CModalBody>
                    <FormAltaUsuario 
                        initialData={initialData} 
                        onSubmit={onSave}
                        onCancel={onClose}
                    />      {/* Usa el componente FormAltaUsuario.js */}
                </CModalBody>

            </CModal>
        </>
    )
}

export default ModalNewEdit;

