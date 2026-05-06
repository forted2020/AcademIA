-- Migración 2.4: Índices de performance
-- t_nota: consultas frecuentes por estudiante + materia + período
CREATE INDEX IF NOT EXISTS idx_nota_estudiante_materia_periodo
    ON t_nota (id_entidad_estudiante, id_materia, id_periodo);

-- t_inscripciones: consultas frecuentes por entidad + ciclo lectivo
CREATE INDEX IF NOT EXISTS idx_inscripciones_entidad_ciclo
    ON t_inscripciones (id_entidad, id_ciclo_lectivo);

-- t_inasistencia: consultas frecuentes por entidad + fecha
CREATE INDEX IF NOT EXISTS idx_inasistencia_entidad_fecha
    ON t_inasistencia (id_entidad, fecha_inasistencia);
