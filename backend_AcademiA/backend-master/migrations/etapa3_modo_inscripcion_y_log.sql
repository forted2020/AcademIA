-- =============================================================================
-- Migración Etapa 3 (Modo Inscripción): crear tabla de auditoría y seed inicial
-- Fecha: 2026-05-23
-- =============================================================================

-- Tabla de auditoría de cambios en configuraciones sensibles
CREATE TABLE IF NOT EXISTS t_configuracion_cambio_log (
    id_log            INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    clave             VARCHAR(80)   NOT NULL,
    valor_anterior    VARCHAR(500)  NULL,
    valor_nuevo       VARCHAR(500)  NOT NULL,
    id_usuario        INT           NOT NULL,
    nombre_usuario    VARCHAR(100)  NOT NULL,
    motivo            VARCHAR(500)  NULL,
    timestamp         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_log_clave     (clave),
    INDEX idx_log_usuario   (id_usuario),
    INDEX idx_log_timestamp (timestamp),

    CONSTRAINT fk_log_usuario
        FOREIGN KEY (id_usuario) REFERENCES t_usuarios(id_usuario)
);

-- Seed: valor inicial del modo de inscripción
-- INSERT IGNORE para no duplicar si ya existe
INSERT IGNORE INTO t_configuracion_sistema (clave, valor, descripcion)
VALUES (
    'modo_inscripcion',
    'MATERIA',
    'Modo de inscripción y registro de inasistencias: MATERIA (por materia individual, modo instituto) o CURSO (por curso completo, modo escuela). Solo puede cambiarse entre ciclos lectivos.'
);

-- Verificación:
-- SELECT * FROM t_configuracion_cambio_log;
-- SELECT * FROM t_configuracion_sistema WHERE clave = 'modo_inscripcion';
