import { useState, useEffect } from "react";
import { CTable, CTableBody, CTableHead, CTableRow, CTableHeaderCell, CTableDataCell, CButton, CContainer, CCard, CCardHeader, CCardBody } from "@coreui/react";

// Simulación de datos (reemplazar con API real)
const usersData = [
  { id: 1, name: "Juan Pérez", role: "Admin" },
  { id: 2, name: "María López", role: "Usuario" }
];

const UserList = () => {
  const [users, setUsers] = useState(usersData);

  const handleDelete = (id) => {
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <CContainer>
      <CCard>
        <CCardHeader>Administración de Usuarios</CCardHeader>
        <CCardBody>
          <CTable hover>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>ID</CTableHeaderCell>
                <CTableHeaderCell>Nombre</CTableHeaderCell>
                <CTableHeaderCell>Rol</CTableHeaderCell>
                <CTableHeaderCell>Acciones</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {users.map(user => (
                <CTableRow key={user.id}>
                  <CTableDataCell>{user.id}</CTableDataCell>
                  <CTableDataCell>{user.name}</CTableDataCell>
                  <CTableDataCell>{user.role}</CTableDataCell>
                  <CTableDataCell>
                    <CButton color="danger" onClick={() => handleDelete(user.id)}>Eliminar</CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </CContainer>
  );
};

export default UserList;
