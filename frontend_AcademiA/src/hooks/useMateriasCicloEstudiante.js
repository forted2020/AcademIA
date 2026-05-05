// frontend_AcademiA\src\hooks\useMateriasCicloEstudiante.js

//  Hook para obtener las materias en las que est{a inscripto un estudiante, en un ciclo lectivo}
//  Recibe cicloId, estudianteId, y devuelve 

import { useState, useEffect } from 'react';
import { get_materias_ciclo_por_estudiante } from '../api/apiEstudiantes';



export const useMateriasCicloEstudiante = (cicloId, estudianteId) => {
  // El estado inicial refleja el objeto unificado
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    // Reseteamos error al cambiar de parámetros
    setError(null);
    // Solo disparamos la búsqueda si tenemos los 2 IDs seleccionados
    if (!cicloId || !estudianteId) {
      setData();
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        console.log("📡 Iniciando petición para:", { cicloId, estudianteId})

        // Usamos la función centralizada de api.js
        const response = await get_materias_ciclo_por_estudiante(cicloId, estudianteId);

        console.log("✅ Datos recibidos del backend:", response.data);

        setData(response.data);

      } catch (err) {
        console.error('Error cargando datos:', err);
        setError(err);
        setData();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cicloId, estudianteId]); // Reacciona al cambio de cualquiera de los filtros

  return { data, loading, error };
};