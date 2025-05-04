/*  Componente maneje la lógica de los usuarios */


import React, { useEffect, useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../api/api.js';
import Usuarios from '../users/Usuarios.jsx';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    getUsers()
      .then(response => setUsers(response.data))
      .catch(error => console.error('Error al obtener usuarios:', error));
  }, []);


  const handleSaveUser = () => {
    const userData = { name, password };
    if (editId) {
      updateUser(editId, userData)
        .then(response => {
          setUsers(users.map(user => (user.id === editId ? response.data : user)));
          resetForm();
        })
        .catch(error => console.error('Error al actualizar:', error));
    } else {
      createUser(userData)
        .then(response => {
          setUsers([...users, response.data]);
          resetForm();
        })
        .catch(error => console.error('Error al crear:', error));
    }
  };


  const handleDeleteUser = (id) => {
    deleteUser(id)
      .then(() => {
        setUsers(users.filter(user => user.id !== id));
      })
      .catch(error => console.error('Error al eliminar:', error));
  };


  const handleEditUser = (user) => {
    setName(user.name);
    setPassword(user.password);
    setEditId(user.id);
  };


  const resetForm = () => {
    setName('');
    setPassword('');
    setEditId(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Gestión de Usuarios</h1>

      <Usuarios
        users={users}
        handleEditUser={handleEditUser}
        handleDeleteUser={handleDeleteUser}
      />
    </div>
  );
}

export default UserManagement;