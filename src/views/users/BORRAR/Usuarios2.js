import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, deleteUser } from '../../api/api' 
//  /services/api';

const UserList = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const { data } = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar usuario?')) {
      await deleteUser(id);
      fetchUsers();
    }
  };

  return (
    <div className="user-list">
      <h2>Usuarios2</h2>
      <Link to="/create" className="new-user-link">Nuevo Usuario</Link>
      
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Contraseña</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              {/* Para enmascarar los password en los listados. <td>{user.password?.substring(0, 6)}****</td>  */}
              <td>{user.password}</td> 
              <td>
                <Link to={`/user/${user.id}`} className="action-link">Ver</Link>
                <Link to={`/edit/${user.id}`} className="action-link">Editar</Link>
                <button onClick={() => handleDelete(user.id)} className="delete-btn">Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;