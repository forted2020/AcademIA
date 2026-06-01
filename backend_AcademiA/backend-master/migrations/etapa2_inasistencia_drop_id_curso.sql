-- =============================================================================
-- Migración Etapa 2: Eliminar id_curso de t_inasistencia
-- Fecha: 2026-05-23
-- =============================================================================
-- Propósito: id_curso es redundante — el curso ya está implícito en id_materia
-- (t_materia.id_curso). Tener ambos sin constraint de consistencia permitía
-- guardar inasistencias con materia de un curso e id_curso de otro.
-- El curso se obtiene ahora via JOIN: t_inasistencia → t_materia → t_curso
-- =============================================================================

-- ⚠️  HACER BACKUP ANTES DE EJECUTAR EN PRODUCCIÓN:
-- CREATE TABLE t_inasistencia_backup AS SELECT * FROM t_inasistencia;

-- Verificación previa: confirmar que la columna existe
-- SELECT COUNT(*) FROM information_schema.columns
-- WHERE table_name = 't_inasistencia' AND column_name = 'id_curso';

-- Eliminar FK si existe (MySQL requiere eliminar la FK antes de DROP COLUMN)
-- Reemplazar 'fk_nombre' con el nombre real de la FK si aplica
-- ALTER TABLE t_inasistencia DROP FOREIGN KEY fk_inasistencia_curso;

-- Eliminar la columna
ALTER TABLE t_inasistencia DROP COLUMN id_curso;

-- Verificación post-migración:
-- DESCRIBE t_inasistencia;
-- La columna id_curso no debe aparecer.
