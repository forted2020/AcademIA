//  frontend_AcademiA\src\components\SelectorCicloLectivo\SelectorCicloLectivo.jsx

//  Componente que devuelve un selector dinámico que recibe el id de un alumno (id_entidad), y renderiza un selector dinámico, donde las opciones son los ciclos lectivos donde el alumno cursó alguna materia, y devuelve el ciclo seleccionado.

import React, { useState, useEffect } from 'react';
import { CFormSelect } from '@coreui/react'; 
import axios from 'axios';

const SelectorCicloLectivo = ({ id_entidad, onCicloChange }) => {
  const [ciclos, setCiclos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCiclos = async () => {
      if (!id_entidad) return;
      
      try {
        setLoading(true);
        // URL de la API que trae los ciclos en que el estudiante curs{o alguna materia
        //  CAMBIAR POR UNA API
        const response = await axios.get(`http://localhost:8000/api/estudiantes/${id_entidad}/ciclos`);
        setCiclos(response.data);
        setError(null);
      } catch (err) {
        console.error("Error al cargar ciclos:", err);
        setError("No se pudieron cargar los años.");
      } finally {
        setLoading(false);
      }
    };

    fetchCiclos();
  }, [id_entidad]);

  const handleChange = (e) => {
    const selectedId = e.target.value;
    // Buscamos el objeto completo por si el padre necesita el nombre
    const cicloCompleto = ciclos.find(c => c.id_ciclo_lectivo === parseInt(selectedId));
    onCicloChange(cicloCompleto); 
  };

  if (loading) return <span>Cargando años...</span>;
  if (error) return <span className="text-danger">{error}</span>;

  return (
    <CFormSelect onChange={handleChange} aria-label="Seleccionar Ciclo Lectivo">
      <option value="">Seleccione Año</option>
      {ciclos.map((ciclo) => (
        <option key={ciclo.id_ciclo_lectivo} value={ciclo.id_ciclo_lectivo}>
          {ciclo.nombre_ciclo_lectivo}
        </option>
      ))}
    </CFormSelect>
  );
};

export default SelectorCicloLectivo;