# backend-master/Services/config_service.py
# Helpers para leer claves de t_configuracion_sistema con tipado y default seguro,
# y validar valores académicos (rango de notas, umbrales) en endpoints y servicios.

from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from models import ConfiguracionSistema


# Defaults de seguridad usados cuando una clave no existe en la base.
# Replican los del seed run_configuracion_academica_seed.py.
DEFAULTS_ACADEMICA = {
    "nota_minima":     "0",
    "nota_maxima":     "10",
    "nota_aprobacion": "6",
    "inasistencias_umbral_reincorporacion": "20",
    "inasistencias_umbral_libre":           "28",
}


def get_config_valor(db: Session, clave: str, default: Optional[str] = None) -> Optional[str]:
    """Lee una clave de t_configuracion_sistema; retorna default si no existe o está vacía."""
    fila = db.query(ConfiguracionSistema).filter(ConfiguracionSistema.clave == clave).first()
    if not fila or fila.valor is None or str(fila.valor).strip() == "":
        return default
    return fila.valor


def get_config_float(db: Session, clave: str, default: float) -> float:
    """Variante numérica: lee y castea a float; si falla, usa default."""
    valor = get_config_valor(db, clave, str(default))
    try:
        return float(valor)
    except (TypeError, ValueError):
        return default


def get_config_int(db: Session, clave: str, default: int) -> int:
    """Variante entera: lee y castea a int; si falla, usa default."""
    valor = get_config_valor(db, clave, str(default))
    try:
        return int(float(valor))
    except (TypeError, ValueError):
        return default


def get_rango_notas(db: Session) -> tuple[float, float, float]:
    """Devuelve (nota_minima, nota_maxima, nota_aprobacion) desde la config."""
    nota_min = get_config_float(db, "nota_minima",     float(DEFAULTS_ACADEMICA["nota_minima"]))
    nota_max = get_config_float(db, "nota_maxima",     float(DEFAULTS_ACADEMICA["nota_maxima"]))
    nota_apr = get_config_float(db, "nota_aprobacion", float(DEFAULTS_ACADEMICA["nota_aprobacion"]))
    return nota_min, nota_max, nota_apr


def validar_nota_o_lanzar(db: Session, valor: Optional[float]) -> None:
    """
    Valida que `valor` esté dentro del rango [nota_minima, nota_maxima] configurado.
    Lanza HTTPException 400 si está fuera de rango. Acepta None (no valida — el caller
    decide si una nota nula es aceptable, por ejemplo al limpiar una celda).
    """
    if valor is None:
        return

    try:
        valor_f = float(valor)
    except (TypeError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="El valor de la nota debe ser numérico.",
        )

    nota_min, nota_max, _ = get_rango_notas(db)

    if valor_f < nota_min or valor_f > nota_max:
        raise HTTPException(
            status_code=400,
            detail=(
                f"La nota {valor_f} está fuera del rango permitido "
                f"({nota_min} a {nota_max}). Ajustá la configuración del sistema si necesitás otro rango."
            ),
        )
