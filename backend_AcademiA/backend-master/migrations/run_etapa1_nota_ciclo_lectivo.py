"""
Migración Etapa 1: Agregar id_ciclo_lectivo a t_nota y hacer backfill.
Ejecutar una sola vez. Es seguro re-ejecutar: los pasos tienen guards.
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from database import engine
from sqlalchemy import text

def run():
    with engine.connect() as conn:
        # Verificar si la columna ya existe
        resultado = conn.execute(text(
            "SELECT COUNT(*) FROM information_schema.columns "
            "WHERE table_name = 't_nota' AND column_name = 'id_ciclo_lectivo'"
        )).scalar()

        if resultado == 0:
            print("Agregando columna id_ciclo_lectivo a t_nota...")
            conn.execute(text(
                "ALTER TABLE t_nota "
                "ADD COLUMN id_ciclo_lectivo INT NULL, "
                "ADD CONSTRAINT fk_nota_ciclo_lectivo "
                "FOREIGN KEY (id_ciclo_lectivo) "
                "REFERENCES t_ciclo_lectivo(id_ciclo_lectivo)"
            ))
            conn.commit()
            print("✓ Columna agregada.")
        else:
            print("La columna id_ciclo_lectivo ya existe. Saltando ALTER TABLE.")

        # Backfill: derivar ciclo desde materia → curso
        print("Ejecutando backfill de id_ciclo_lectivo en notas existentes...")
        resultado = conn.execute(text(
            "UPDATE t_nota n "
            "JOIN t_materia m ON n.id_materia = m.id_materia "
            "JOIN t_curso   c ON m.id_curso   = c.id_curso "
            "SET n.id_ciclo_lectivo = c.id_ciclo_lectivo "
            "WHERE n.id_ciclo_lectivo IS NULL"
        ))
        conn.commit()
        print(f"✓ Backfill completado. Filas actualizadas: {resultado.rowcount}")

        # Verificación
        sin_ciclo = conn.execute(text(
            "SELECT COUNT(*) FROM t_nota WHERE id_ciclo_lectivo IS NULL"
        )).scalar()
        print(f"Notas sin id_ciclo_lectivo: {sin_ciclo}")
        if sin_ciclo > 0:
            print("⚠️  Atención: hay notas sin ciclo lectivo. "
                  "Pueden ser notas de materias sin curso asignado.")
        else:
            print("✓ Migración exitosa. Todas las notas tienen id_ciclo_lectivo.")

if __name__ == "__main__":
    run()
