import React from 'react';
import { CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CButton } from '@coreui/react';

// Componente de modal para confirmar logout
const LogoutModal = ({ visible, onClose, onConfirm }) => {
  return (
    <CModal visible={visible} onClose={onClose} backdrop="static">
      <CModalHeader>
        <CModalTitle>Confirmar Cierre de Sesión</CModalTitle>
      </CModalHeader>
      <CModalBody>
        ¿Estás seguro de que deseas cerrar sesión?
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={onClose}>
          Cancelar
        </CButton>
        <CButton color="primary" onClick={onConfirm}>
          Cerrar Sesión
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default LogoutModal;