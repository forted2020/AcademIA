# migrations/run_configuracion_academica_seed.py
# Siembra las claves de configuración académica en t_configuracion_sistema (idempotente).
#
# Claves incorporadas:
#   - Calificaciones: nota_minima, nota_maxima, nota_aprobacion
#   - Inasistencias:  inasistencias_umbral_reincorporacion, inasistencias_umbral_libre
#
# Nota: el "modo de cómputo de inasistencias" reutiliza la clave preexistente
#       'modo_inscripcion' (MATERIA / CURSO), ya implementada en routes_configuracion.
#
# Uso: python migrations/run_configuracion_academica_seed.py

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, localSession
from models import Base, ConfiguracionSistema

# Claves nuevas con sus valores por defecto y descripción
SEED_CONFIG_ACADEMICA = [
    # Calificaciones
    ("nota_minima",     "0",  "Nota mínima permitida en el sistema"),
    ("nota_maxima",     "10", "Nota máxima permitida en el sistema"),
    ("nota_aprobacion", "6",  "Nota mínima para considerar una materia aprobada"),

    # Inasistencias — umbrales normativos
    ("inasistencias_umbral_reincorporacion", "20",
     "Cantidad de inasistencias acumuladas que dispara la generación del Acta de Reincorporación"),
    ("inasistencias_umbral_libre",           "28",
     "Cantidad de inasistencias acumuladas que pasa al alumno a carácter Libre / Libre Concurrente"),
]


def run_seed():
    # Garantiza que la tabla existe (no toca datos ya cargados)
    Base.metadata.create_all(
        bind=engine,
        tables=[ConfiguracionSistema.__table__],
    )

    db = localSession()
    try:
        insertados = 0
        for clave, valor, descripcion in SEED_CONFIG_ACADEMICA:
            existe = db.query(ConfiguracionSistema).filter(
                ConfiguracionSistema.clave == clave
            ).first()
            if not existe:
                db.add(ConfiguracionSistema(
                    clave=clave, valor=valor, descripcion=descripcion
                ))
                insertados += 1

        db.commit()
        print(f"OK Seed de configuración académica completado: {insertados} clave(s) nueva(s).")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
