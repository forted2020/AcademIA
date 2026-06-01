-- =============================================================================
-- Migración Etapa 1: Agregar id_ciclo_lectivo a t_nota
-- Fecha: 2026-05-22
-- =============================================================================
-- Propósito: denormalizar el ciclo lectivo en t_nota para evitar doble JOIN
-- (materia → curso → ciclo) en cada consulta y garantizar contexto temporal
-- propio por nota, independiente de cambios futuros en materias o cursos.
-- =============================================================================

-- Paso 1: Agregar la columna nullable (no rompe datos existentes)
ALTER TABLE t_nota
    ADD COLUMN id_ciclo_lectivo INT NULL,
    ADD CONSTRAINT fk_nota_ciclo_lectivo
        FOREIGN KEY (id_ciclo_lectivo)
        REFERENCES t_ciclo_lectivo(id_ciclo_lectivo);

-- Paso 2: Backfill — derivar el ciclo de cada nota existente
-- Ruta: t_nota.id_materia → t_materia.id_curso → t_curso.id_ciclo_lectivo
UPDATE t_nota n
JOIN t_materia m ON n.id_materia = m.id_materia
JOIN t_curso   c ON m.id_curso   = c.id_curso
SET n.id_ciclo_lectivo = c.id_ciclo_lectivo
WHERE n.id_ciclo_lectivo IS NULL;

-- Verificación post-migración (ejecutar manualmente para confirmar):
-- SELECT COUNT(*) AS total, SUM(id_ciclo_lectivo IS NULL) AS sin_ciclo FROM t_nota;
-- Resultado esperado: sin_ciclo = 0
