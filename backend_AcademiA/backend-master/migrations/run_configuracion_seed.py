# migrations/run_configuracion_seed.py
# Crea las tablas t_configuracion_sistema y t_formato_config si no existen,
# y siembra los registros base de configuración del sistema (idempotente).
#
# Uso: python migrations/run_configuracion_seed.py

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, localSession
from models import Base, ConfiguracionSistema, FormatoConfig

# Registros iniciales de configuración del sistema
SEED_CONFIGURACION = [
    ("nombre_institucion",   "Institución Educativa",  "Nombre completo de la institución"),
    ("subtitulo_institucion","",                        "Subtítulo o tipo de institución"),
    ("color_primario",       "#0369a1",                 "Color principal de encabezados y tablas en documentos"),
    ("color_encabezado",     "#0f172a",                 "Color de texto en encabezados de documentos"),
    ("logo_base64",          None,                      "Logo de la institución codificado en base64"),
    ("logo_mime_type",       None,                      "Tipo MIME del logo (image/png, image/jpeg)"),
    ("logo_nombre_archivo",  None,                      "Nombre original del archivo de logo"),
    ("logo_ancho_px",        None,                      "Ancho original del logo en píxeles"),
    ("logo_alto_px",         None,                      "Alto original del logo en píxeles"),
    ("texto_pie_global",     "",                        "Pie de página por defecto para todos los documentos"),
]


def run_seed():
    # Crear solo las tablas nuevas (no toca las existentes)
    Base.metadata.create_all(
        bind=engine,
        tables=[
            ConfiguracionSistema.__table__,
            FormatoConfig.__table__,
        ],
    )
    print("✅ Tablas t_configuracion_sistema y t_formato_config verificadas.")

    db = localSession()
    try:
        insertados = 0
        for clave, valor, descripcion in SEED_CONFIGURACION:
            existe = db.query(ConfiguracionSistema).filter(ConfiguracionSistema.clave == clave).first()
            if not existe:
                db.add(ConfiguracionSistema(clave=clave, valor=valor, descripcion=descripcion))
                insertados += 1

        db.commit()
        print(f"✅ Seed completado: {insertados} registro(s) nuevo(s) en t_configuracion_sistema.")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
