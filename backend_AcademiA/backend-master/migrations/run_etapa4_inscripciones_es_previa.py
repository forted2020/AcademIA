# migrations/run_etapa4_inscripciones_es_previa.py
# Agrega la columna es_previa a t_inscripciones (Fase 7.2).
# Idempotente: detecta si la columna ya existe antes de intentar crearla.
#
# Uso: python migrations/run_etapa4_inscripciones_es_previa.py

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database import engine


def columna_existe(conn, tabla: str, columna: str) -> bool:
    """Chequeo de existencia compatible con MySQL (information_schema)."""
    sql = text("""
        SELECT COUNT(*) AS cnt
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name   = :tabla
          AND column_name  = :columna
    """)
    res = conn.execute(sql, {"tabla": tabla, "columna": columna}).scalar()
    return (res or 0) > 0


def run():
    with engine.begin() as conn:
        if columna_existe(conn, "t_inscripciones", "es_previa"):
            print("OK Columna es_previa ya existe en t_inscripciones — nada que hacer.")
            return

        conn.execute(text(
            "ALTER TABLE t_inscripciones "
            "ADD COLUMN es_previa TINYINT(1) NOT NULL DEFAULT 0"
        ))
        # Índice para acelerar listados de previas por alumno.
        conn.execute(text(
            "CREATE INDEX IF NOT EXISTS idx_inscripciones_previa "
            "ON t_inscripciones (id_entidad, es_previa)"
        ))
        print("OK Columna es_previa agregada a t_inscripciones + índice idx_inscripciones_previa.")


if __name__ == "__main__":
    run()
