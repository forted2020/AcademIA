# migrations/run_tipos_inasistencia_seed.py
# Carga (idempotente) el catálogo normativo de tipos de inasistencia en t_tipo_inasistencia.
# Los valores reflejan la normativa institucional documentada en docs/informe-funcional-relaciones-datos.md.
#
# Uso: python migrations/run_tipos_inasistencia_seed.py

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, localSession
from models import Base, TipoInasistencia

# (descripción, valor)
# La descripción es la clave de identidad — si ya existe, no se duplica.
SEED_TIPOS = [
    ("Inasistencia",                1.00),
    ("Llegada tarde a la escuela",  0.25),
    ("Llegada tarde al aula",       0.25),
    ("Retiro",                      0.50),
    ("Inasistencia por la tarde",   0.50),
    ("Ingreso fuera de horario",    0.50),
]


def run_seed():
    Base.metadata.create_all(bind=engine, tables=[TipoInasistencia.__table__])

    db = localSession()
    try:
        insertados = 0
        actualizados = 0
        for descripcion, valor in SEED_TIPOS:
            fila = db.query(TipoInasistencia).filter(
                TipoInasistencia.descripcion == descripcion
            ).first()
            if fila is None:
                db.add(TipoInasistencia(descripcion=descripcion, valor=valor))
                insertados += 1
            elif fila.valor != valor:
                # Reconciliamos el valor por si la normativa cambió; la descripción se mantiene.
                fila.valor = valor
                actualizados += 1

        db.commit()
        print(f"OK Tipos de inasistencia normativos: {insertados} nuevo(s), {actualizados} actualizado(s).")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
