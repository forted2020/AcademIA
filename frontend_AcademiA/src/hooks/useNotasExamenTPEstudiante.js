// frontend_AcademiA\src\hooks\useNotasExamenTPEstudiante.js

//  Hook para obtener las notas de Exámenes y Trabajos Prácticos, de una materia de un curso dado y un período para un estudiante
//  Recibe estudianteId, materiaId, cursoId y período

import { useState, useEffect } from 'react';
import { getNotasEstudianteMateriaTipo } from '../api/ApiNotas/apiNotas';


export const useNotasExamenTPEstudiante = (estudianteId, materiaId, cursoId, periodoId) => {
  // El estado inicial refleja el objeto unificado
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    console.log("Hook valores recibidos:", { estudianteId, materiaId, cursoId, periodoId });
    
    // Reseteamos error al cambiar de parámetros
    setError(null);
    // Solo disparamos la búsqueda si tenemos los 4 datos
    if (!estudianteId || !materiaId || !cursoId || !periodoId) {
      setData([]);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        console.log("📡📡 Iniciando petición para:", { estudianteId, materiaId, cursoId, periodoId })

        // Usamos la función centralizada de apiNotas.js
        const response = await getNotasEstudianteMateriaTipo(estudianteId, materiaId, cursoId, periodoId );

        console.log("✅ Datos recibidos del backend getNotasEstudianteMateriaTipo:", response.data);

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
  }, [estudianteId, materiaId, cursoId, periodoId]); // Reacciona al cambio de cualquiera de los filtros

  return { data, loading, error };
};