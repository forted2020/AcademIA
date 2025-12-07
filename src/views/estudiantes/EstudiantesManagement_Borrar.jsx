// src/pages/estudiantes/EstudiantesManagements.jsx
import React from 'react';
import { CButton, CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CContainer } from '@coreui/react';
import { cilPlus } from '@coreui/icons';
import { CIcon } from '@coreui/icons-react';

import GenericTable from '../../components/usersTable/GenericTable.jsx';
import TablePagination from '../../components/tablePagination/TablePagination.jsx';
import AdvancedFilters from '../../components/advancedFilters/AdvancedFilters.jsx';
import TableActions from '../../components/tableActions/TableActions.jsx';
import ModalConfirmDel from '../../modals/ModalConfirmDel.jsx';
import ModalNewEdit from '../../modals/ModalNewEdit.jsx';

export default function EstudiantesManagement({
  table,
  searchTerm,
  setSearchTerm,
  columnFilters,
  setColumnFilters,
  onNewStudent,

  editModalVisible,
  studentToEdit,
  onCloseEditModal,
  onSaveStudent,

  deleteModalVisible,
  studentToDelete,
  onCloseDeleteModal,
  onConfirmDelete,
}) {
  return (
    <div style={{ padding: '10px' }}>
      <h1 className="ms-1">Estudiantes</h1>
      <CContainer>
        <CCard className="mb-1">
          <CCardHeader className="py-2 bg-white">
            <CRow className="justify-content-between align-items-center">
              <CCol xs={12} sm="auto">
                <h4 className="mb-0">Gestión de Estudiantes</h4>
                <div className="small text-body-secondary">
                  Administración de alumnos del establecimiento
                </div>
              </CCol>
              <CCol xs={12} sm="auto" className="text-md-end">
                <CButton color="primary" size="sm" onClick={onNewStudent}>
                  <CIcon icon={cilPlus} className="me-1" />
                  Nuevo Estudiante
                </CButton>
              </CCol>
            </CRow>
          </CCardHeader>

          <AdvancedFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
            filterOptions={[
              { value: 'nombre', label: 'Nombre' },
              { value: 'apellido', label: 'Apellido' },
              { value: 'email', label: 'Email' },
              { value: 'domicilio', label: 'Domicilio' },
              { value: 'telefono', label: 'Teléfono' },
            ]}
          />

          <TableActions table={table} />

          <CCardBody className="px-4 pt-1 pb-2 border border-light">
            <GenericTable table={table} />
          </CCardBody>

          <CCardFooter
            className="bg-white border-top px-3 py-1"
            style={{ position: 'sticky', bottom: 0, zIndex: 1, boxShadow: '0 -2px 5px rgba(0,0,0,0.1)' }}
          >
            <TablePagination table={table} />
          </CCardFooter>
        </CCard>

        {/* Modal Editar/Crear */}
        <ModalNewEdit
          visible={editModalVisible}
          onClose={onCloseEditModal}
          title={studentToEdit ? 'Editar Estudiante' : 'Nuevo Estudiante'}
          initialData={studentToEdit || {}}
          onSave={onSaveStudent}
          fields={[
            { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Ejemplo: Carlos' },
            { name: 'apellido', label: 'Apellido', type: 'text', required: true, placeholder: 'Ejemplo: Pérez' },
            { name: 'email', label: 'Email', type: 'email', required: false, placeholder: 'ejemplo@mail.com' },
            { name: 'fec_nac', label: 'Fecha de Nacimiento', type: 'date', required: false },
            { name: 'domicilio', label: 'Domicilio', type: 'text', required: false, placeholder: 'Calle 123' },
            { name: 'telefono', label: 'Teléfono', type: 'tel', required: false, placeholder: '1234567890' },
            { name: 'password', label: 'Contraseña', type: 'password', required: false, placeholder: 'Solo si se crea usuario', fullWidth: true },
          ]}
        />

        {/* Modal Confirmar Eliminación */}
        <ModalConfirmDel
          visible={deleteModalVisible}
          onClose={onCloseDeleteModal}
          onConfirm={onConfirmDelete}
          userId={studentToDelete}  // o el prop que espere tu modal (puede ser id, studentId, etc.)
        />
      </CContainer>
    </div>
  );
}