import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUser } from '../api/api' 
//  /services/api';

const UserDetail = () => {
  const [user, setUser] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await getUser(id);
      setUser(data);
    };
    loadUser();
  }, [id]);

  if (!user) return <div>Cargando...</div>;

  return (
    <div className="user-detail">
      <h2>Detalles del Usuario</h2>
      <p><strong>ID:</strong> {user.id}</p>
      <p><strong>Nombre:</strong> {user.name}</p>
      <p><strong>Contraseña:</strong> {user.password}</p>
      <Link to="/" className="back-link">Volver al listado</Link>
    </div>
  );
};

export default UserDetail;