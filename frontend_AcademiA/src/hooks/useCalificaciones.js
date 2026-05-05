// src/hooks/usePlanillaCalificaciones.js

import { useState, useEffect } from 'react';
import { getPlanillaActa } from '../api/api';

export const usePlanillaCalificaciones = (cicloId, cursoId, materiaId) => {
  // El estado inicial refleja el objeto unificado
  const [data, setData] = useState({ columnas: [], filas: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);



  useEffect(() => {
    // Solo disparamos la búsqueda si tenemos los 3 IDs seleccionados
    if (!cicloId || !cursoId || !materiaId) {
      setData({ columnas: [], filas: [] });
      return;
    }
    
    const fetchData = async () => {
      try {
        setLoading(true);
        // Usamos la función centralizada de api.js
        const response = await getPlanillaActa(cicloId, cursoId, materiaId);
        setData(response.data);
      } catch (err) {
        console.error('Error cargando planilla:', err);
        setError(err);
        setData({ columnas: [], filas: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cicloId, cursoId, materiaId]); // Reacciona al cambio de cualquiera de los 3 filtros

  return { data, loading, error };
};