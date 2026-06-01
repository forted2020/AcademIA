# Routes/routes_formatos.py
# Endpoints para leer y guardar la configuración específica de cada tipo de documento.
# Los tipos de documento existen en el catálogo del frontend (templates JS).
# La BD solo almacena los valores que el admin configuró para cada código conocido.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import localSession
from models import FormatoConfig
from schemas import FormatoConfigResponse, FormatoConfigUpdate
from auth import get_current_user

router = APIRouter()


def get_db():
    db = localSession()
    try:
        yield db
    finally:
        db.close()


def _solo_admin(current_user):
    if current_user.rol_sistema != "ADMIN_SISTEMA":
        raise HTTPException(status_code=403, detail="Solo el administrador puede modificar los formatos de impresión.")


def _filas_a_dict(filas: list[FormatoConfig]) -> dict:
    return {f.clave: f.valor for f in filas}


# GET /api/formatos-impresion/{codigo}
# Retorna la config guardada de un formato como dict {clave: valor}.
# Cualquier usuario autenticado puede leerla (la necesitan los documentos al generar PDFs).
@router.get("/{codigo}", response_model=FormatoConfigResponse)
def get_formato_config(
    codigo: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    filas = db.query(FormatoConfig).filter(FormatoConfig.codigo_formato == codigo).all()
    return FormatoConfigResponse(codigo=codigo, configs=_filas_a_dict(filas))


# PUT /api/formatos-impresion/{codigo}
# Upsert de las configs del formato (merge con las existentes). Solo ADMIN_SISTEMA.
@router.put("/{codigo}", response_model=FormatoConfigResponse)
def update_formato_config(
    codigo: str,
    payload: FormatoConfigUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    _solo_admin(current_user)

    for clave, valor in payload.configs.items():
        fila = (
            db.query(FormatoConfig)
            .filter(FormatoConfig.codigo_formato == codigo, FormatoConfig.clave == clave)
            .first()
        )
        if fila:
            fila.valor = valor
        else:
            db.add(FormatoConfig(codigo_formato=codigo, clave=clave, valor=valor))

    db.commit()
    filas = db.query(FormatoConfig).filter(FormatoConfig.codigo_formato == codigo).all()
    return FormatoConfigResponse(codigo=codigo, configs=_filas_a_dict(filas))
