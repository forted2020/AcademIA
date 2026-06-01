"""
Migración Etapa 2: Eliminar id_curso de t_inasistencia.
Ejecutar una sola vez. Es seguro re-ejecutar: verifica antes de actuar.
⚠️  Hace backup automático en t_inasistencia_bak antes de modificar.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from database import engine
from sqlalchemy import text


def run():
    with engine.connect() as conn:
        # Verificar si la columna todavía existe
        existe_columna = conn.execute(text(
            "SELECT COUNT(*) FROM information_schema.columns "
            "WHERE table_schema = DATABASE() "
            "AND table_name = 't_inasistencia' AND column_name = 'id_curso'"
        )).scalar()

        if existe_columna == 0:
            print("La columna id_curso ya no existe en t_inasistencia. Nada que hacer.")
            return

        # Backup preventivo
        existe_bak = conn.execute(text(
            "SELECT COUNT(*) FROM information_schema.tables "
            "WHERE table_schema = DATABASE() AND table_name = 't_inasistencia_bak'"
        )).scalar()

        if existe_bak == 0:
            print("Creando backup en t_inasistencia_bak...")
            conn.execute(text(
                "CREATE TABLE t_inasistencia_bak AS SELECT * FROM t_inasistencia"
            ))
            conn.commit()
            print("✓ Backup creado.")
        else:
            print("Ya existe t_inasistencia_bak. Saltando creación de backup.")

        # Verificar si hay FK sobre id_curso y eliminarla primero
        fk_nombre = conn.execute(text(
            "SELECT constraint_name FROM information_schema.key_column_usage "
            "WHERE table_schema = DATABASE() "
            "AND table_name = 't_inasistencia' AND column_name = 'id_curso' "
            "AND referenced_table_name IS NOT NULL "
            "LIMIT 1"
        )).scalar()

        if fk_nombre:
            print(f"Eliminando FK '{fk_nombre}' antes de DROP COLUMN...")
            conn.execute(text(f"ALTER TABLE t_inasistencia DROP FOREIGN KEY `{fk_nombre}`"))
            conn.commit()
            print(f"✓ FK '{fk_nombre}' eliminada.")

        # Eliminar la columna
        print("Eliminando columna id_curso de t_inasistencia...")
        conn.execute(text("ALTER TABLE t_inasistencia DROP COLUMN id_curso"))
        conn.commit()
        print("✓ Columna id_curso eliminada.")

        # Verificación
        existe_post = conn.execute(text(
            "SELECT COUNT(*) FROM information_schema.columns "
            "WHERE table_schema = DATABASE() "
            "AND table_name = 't_inasistencia' AND column_name = 'id_curso'"
        )).scalar()

        if existe_post == 0:
            print("✓ Migración exitosa. La columna id_curso ya no existe en t_inasistencia.")
        else:
            print("✗ Error: la columna id_curso sigue presente.")


if __name__ == "__main__":
    run()
