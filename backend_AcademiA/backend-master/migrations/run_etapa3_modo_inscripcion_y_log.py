"""
Migración Etapa 3: Crear t_configuracion_cambio_log y seed de modo_inscripcion.
Seguro re-ejecutar: usa CREATE TABLE IF NOT EXISTS e INSERT IGNORE.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from database import engine
from sqlalchemy import text


def run():
    with engine.connect() as conn:
        # Crear tabla de auditoría
        existe = conn.execute(text(
            "SELECT COUNT(*) FROM information_schema.tables "
            "WHERE table_schema = DATABASE() "
            "AND table_name = 't_configuracion_cambio_log'"
        )).scalar()

        if existe == 0:
            print("Creando tabla t_configuracion_cambio_log...")
            conn.execute(text("""
                CREATE TABLE t_configuracion_cambio_log (
                    id_log          INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    clave           VARCHAR(80)  NOT NULL,
                    valor_anterior  VARCHAR(500) NULL,
                    valor_nuevo     VARCHAR(500) NOT NULL,
                    id_usuario      INT          NOT NULL,
                    nombre_usuario  VARCHAR(100) NOT NULL,
                    motivo          VARCHAR(500) NULL,
                    timestamp       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_log_clave     (clave),
                    INDEX idx_log_usuario   (id_usuario),
                    INDEX idx_log_timestamp (timestamp),
                    CONSTRAINT fk_log_usuario
                        FOREIGN KEY (id_usuario) REFERENCES t_usuarios(id_usuario)
                )
            """))
            conn.commit()
            print("✓ Tabla t_configuracion_cambio_log creada.")
        else:
            print("La tabla t_configuracion_cambio_log ya existe. Saltando CREATE TABLE.")

        # Seed de modo_inscripcion
        ya_existe = conn.execute(text(
            "SELECT COUNT(*) FROM t_configuracion_sistema WHERE clave = 'modo_inscripcion'"
        )).scalar()

        if ya_existe == 0:
            print("Insertando valor inicial de modo_inscripcion...")
            conn.execute(text(
                "INSERT INTO t_configuracion_sistema (clave, valor, descripcion) VALUES ("
                "    'modo_inscripcion', 'MATERIA',"
                "    'Modo de inscripción: MATERIA (instituto) o CURSO (escuela). "
                "Solo puede cambiarse entre ciclos lectivos.'"
                ")"
            ))
            conn.commit()
            print("✓ Seed de modo_inscripcion insertado con valor 'MATERIA'.")
        else:
            valor_actual = conn.execute(text(
                "SELECT valor FROM t_configuracion_sistema WHERE clave = 'modo_inscripcion'"
            )).scalar()
            print(f"modo_inscripcion ya existe con valor '{valor_actual}'. Sin cambios.")

        print("\n✓ Migración Etapa 3 completada.")


if __name__ == "__main__":
    run()
