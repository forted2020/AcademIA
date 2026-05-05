// frontend_AcademiA\src\hooks\useNotasFinalesEstudiante

//  Hook para obtener las notas de Trimestres, Recuperatorios y Final, de una materia de un curso dado, para un estudiante
//  Recibe estudianteId, materiaId y cursoId 

import { useState, useEffect } from 'react';
import { getNotasEstudianteMateria } from '../api/ApiNotas/apiNotas';


export const useNotasFinalesEstudiante = (estudianteId, materiaId, cursoId) => {
  // El estado inicial refleja el objeto unificado
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    console.log("Hook valores recibidos:", { estudianteId, materiaId, cursoId });
    
    // Reseteamos error al cambiar de parámetros
    setError(null);
    // Solo disparamos la búsqueda si tenemos los 3 datos
    if (!estudianteId || !materiaId || !cursoId) {
      setData([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        console.log("📡 Iniciando petición para:", { estudianteId, materiaId, cursoId })

        // Usamos la función centralizada de apiNotas.js
        const response = await getNotasEstudianteMateria(estudianteId, materiaId, cursoId);

        console.log("✅ Datos recibidos del backend:", response.data);

        // Guaramos el dato. Nos aseguramos de guardar un array, para que nunca sea null y rompa
        setData(response.data || []);

      } catch (err) {
        console.error('Error cargando datos:', err);
        setError(err);
        setData([]); // Evitamos que el estado sea undefined en caso de error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [estudianteId, materiaId, cursoId]); // Reacciona al cambio de cualquiera de los filtros

  return { data, loading, error };
};