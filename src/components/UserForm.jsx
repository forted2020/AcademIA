import React, { useState, useEffect } from 'react';

import { useNavigate, useParams } from 'react-router-dom'; // useNavigate permite redirigir al usuario a otra página, y useParams obtiene parámetros de la URL (ej el id del usuario a editar).

import { createUser, updateUser, getUser } from '../api/api' // Funciones que interactuan con el backend (FastAPI) para crear, actualizar u obtener datos de un usuario.

//  /services/api';


const UserForm = () => {
  const navigate = useNavigate();   // Redirije al usuario a otra página (como la página principal '/').
  
  const { id } = useParams();     //  Si hay un id en la URL (ej /users/5), lo captura. Indica si se edita un usuario existente.

  const [formData, setFormData] = useState({ name: '', password: '' }); //  Guarda los datos del formulario (name y password).


  useEffect(() => {                           //   Se usa para cargar datos al editar (si existe un id).
    const loadUser = async () => {
      if (id) {                               // Si el dato tiene id:
        const { data } = await getUser(id);   // Llama a getUser(id) para pedir los datos del usuario al backend.
        setFormData(data);                    //  Cuando llegan los datos (data), los guarda en formData. 
      }                                       // Los campos del  formulario se completan con la info actual del usuario.
    };
    loadUser();           //  Indica que el código se ejecuta al cargar el componente.
  }, [id]);               //  El efecto se ejecute solo si el id cambia.



// ----------   Actualizar los campos del formulario    ---------- //
const handleChange = ({ target: { name, value } }) => {   
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  // --------------------   Enviar el formulario al Backend    -------------------- //
  const handleSubmit = async (e) => {
    e.preventDefault();                                 //   Evita que la página se recargue 
    console.log('Datos enviados a la API:', formData); 
    try {
      if (id) {                             //  Si hay id, llama a updateUser para actualizar el usuario existente.
        await updateUser(id, formData);     //  Envía id y formData al backend (FastAPI).
      } else {                              //  Si no hay id, llama a createUser para crear uno nuevo.
        await createUser(formData);         //  Envía formData al backend (FastAPI).
      }                            
      navigate('/');        //  Si todo sale bien, redirige a la página principal (navigate('/').
    } catch (error) {
      alert(error.response?.data?.detail || 'Error al guardar');  // Si hay  error, muestra alerta con mensaje del backend o genérico.
      console.error('Error en la solicitud:', error); 
    }
  };



  return (
    <div className="form-container">
      <h2>{id ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Contraseña:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          {id ? 'Actualizar' : 'Crear'}
        </button>
      </form>
    </div>
  );
};

export default UserForm;