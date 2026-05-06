"""
Migración 2.4 — Agrega índices de performance en t_nota, t_inscripciones y t_inasistencia.
Ejecutar desde la carpeta backend-master:
    python migrations/run_indexes_2_4.py
"""

import sys
from pathlib import Path

# Permite importar database.py desde la carpeta padre
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from database import engine
from sqlalchemy import text

INDEXES = [
    (
        "idx_nota_estudiante_materia_periodo",
        "CREATE INDEX idx_nota_estudiante_materia_periodo ON t_nota (id_entidad_estudiante, id_materia, id_periodo)",
    ),
    (
        "idx_inscripciones_entidad_ciclo",
        "CREATE INDEX idx_inscripciones_entidad_ciclo ON t_inscripciones (id_entidad, id_ciclo_lectivo)",
    ),
    (
        "idx_inasistencia_entidad_fecha",
        "CREATE INDEX idx_inasistencia_entidad_fecha ON t_inasistencia (id_entidad, fecha_inasistencia)",
    ),
]

def index_exists(conn, index_name: str, table_name: str) -> bool:
    result = conn.execute(
        text("SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = :table AND index_name = :index"),
        {"table": table_name, "index": index_name},
    )
    return result.scalar() > 0

TABLE_FOR_INDEX = {
    "idx_nota_estudiante_materia_periodo": "t_nota",
    "idx_inscripciones_entidad_ciclo": "t_inscripciones",
    "idx_inasistencia_entidad_fecha": "t_inasistencia",
}

def run():
    with engine.connect() as conn:
        for index_name, sql in INDEXES:
            table = TABLE_FOR_INDEX[index_name]
            if index_exists(conn, index_name, table):
                print(f"  [skip] {index_name} ya existe")
            else:
                conn.execute(text(sql))
                conn.commit()
                print(f"  [ok]   {index_name} creado")

if __name__ == "__main__":
    print("Aplicando migración 2.4 — índices de performance...")
    run()
    print("Listo.")
