# Routes/routes_configuracion.py
# Endpoints para leer y actualizar la configuración global de la institución.
# Los datos se almacenan en t_configuracion_sistema como pares clave/valor.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from typing import List

from database import localSession
from models import ConfiguracionSistema, ConfiguracionCambioLog, CicloLectivo
from schemas import (
    ConfigSistemaResponse, ConfigSistemaUpdate, LogoUpload,
    ModoInscripcionUpdate, ConfigCambioLogResponse,
)
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
        raise HTTPException(status_code=403, detail="Solo el administrador puede modificar la configuración del sistema.")


def _filas_a_dict(filas: list[ConfiguracionSistema]) -> dict:
    return {f.clave: f.valor for f in filas}


# GET /api/configuracion/sistema
# Retorna todas las claves de configuración como dict {clave: valor}.
@router.get("/sistema", response_model=ConfigSistemaResponse)
def get_config_sistema(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    filas = db.query(ConfiguracionSistema).all()
    return ConfigSistemaResponse(configs=_filas_a_dict(filas))


# PUT /api/configuracion/sistema
# Upsert de una o varias claves. Solo ADMIN_SISTEMA.
@router.put("/sistema", response_model=ConfigSistemaResponse)
def update_config_sistema(
    payload: ConfigSistemaUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    _solo_admin(current_user)

    for clave, valor in payload.configs.items():
        fila = db.query(ConfiguracionSistema).filter(ConfiguracionSistema.clave == clave).first()
        if fila:
            fila.valor = valor
        else:
            db.add(ConfiguracionSistema(clave=clave, valor=valor))

    db.commit()
    filas = db.query(ConfiguracionSistema).all()
    return ConfigSistemaResponse(configs=_filas_a_dict(filas))


# POST /api/configuracion/sistema/logo
# Guarda el logo como registros individuales en t_configuracion_sistema.
@router.post("/sistema/logo", response_model=ConfigSistemaResponse)
def upload_logo(
    payload: LogoUpload,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    _solo_admin(current_user)

    campos_logo = {
        "logo_base64": payload.datos_base64,
        "logo_mime_type": payload.mime_type,
        "logo_nombre_archivo": payload.nombre_archivo,
        "logo_ancho_px": str(payload.ancho_px) if payload.ancho_px else None,
        "logo_alto_px": str(payload.alto_px) if payload.alto_px else None,
    }

    for clave, valor in campos_logo.items():
        fila = db.query(ConfiguracionSistema).filter(ConfiguracionSistema.clave == clave).first()
        if fila:
            fila.valor = valor
        else:
            db.add(ConfiguracionSistema(clave=clave, valor=valor))

    db.commit()
    filas = db.query(ConfiguracionSistema).all()
    return ConfigSistemaResponse(configs=_filas_a_dict(filas))


# PUT /api/configuracion/modo-inscripcion
# Cambia el modo de inscripción (MATERIA o CURSO).
# Solo permitido si no hay un ciclo lectivo activo con inasistencias ya cargadas.
# Registra el cambio en t_configuracion_cambio_log con usuario, timestamp y motivo.
@router.put("/modo-inscripcion", response_model=ConfigSistemaResponse)
def update_modo_inscripcion(
    payload: ModoInscripcionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    _solo_admin(current_user)

    # Leer el modo actual
    fila_modo = db.query(ConfiguracionSistema).filter(
        ConfiguracionSistema.clave == "modo_inscripcion"
    ).first()
    modo_actual = fila_modo.valor if fila_modo else "MATERIA"

    if modo_actual == payload.modo:
        raise HTTPException(
            status_code=400,
            detail=f"El sistema ya está en modo '{payload.modo}'. No hay nada que cambiar.",
        )

    # Detectar si hay un ciclo lectivo activo hoy
    hoy = date.today()
    ciclo_activo = db.query(CicloLectivo).filter(
        CicloLectivo.fecha_inicio_cl <= hoy,
        CicloLectivo.fecha_fin_cl >= hoy,
    ).first()

    if ciclo_activo:
        # Verificar si ya hay inasistencias cargadas en ese ciclo activo
        # Una inasistencia pertenece al ciclo si su materia pertenece a un curso de ese ciclo
        from models import Inasistencia, Materia, Curso
        inasistencias_en_ciclo = (
            db.query(Inasistencia)
            .join(Materia, Materia.id_materia == Inasistencia.id_materia)
            .join(Curso, Curso.id_curso == Materia.id_curso)
            .filter(Curso.id_ciclo_lectivo == ciclo_activo.id_ciclo_lectivo)
            .first()
        )

        if inasistencias_en_ciclo:
            raise HTTPException(
                status_code=409,
                detail=(
                    f"No se puede cambiar el modo durante un ciclo lectivo activo "
                    f"('{ciclo_activo.nombre_ciclo_lectivo}') que ya tiene inasistencias cargadas. "
                    f"El cambio solo puede realizarse entre ciclos lectivos."
                ),
            )

    # Aplicar el cambio
    if fila_modo:
        fila_modo.valor = payload.modo
    else:
        db.add(ConfiguracionSistema(
            clave="modo_inscripcion",
            valor=payload.modo,
            descripcion="Modo de inscripción: MATERIA (instituto) o CURSO (escuela).",
        ))

    # Registrar en el log de auditoría
    db.add(ConfiguracionCambioLog(
        clave="modo_inscripcion",
        valor_anterior=modo_actual,
        valor_nuevo=payload.modo,
        id_usuario=current_user.id_usuario,
        nombre_usuario=current_user.name,
        motivo=payload.motivo,
    ))

    db.commit()
    filas = db.query(ConfiguracionSistema).all()
    return ConfigSistemaResponse(configs=_filas_a_dict(filas))


# GET /api/configuracion/modo-inscripcion/historial
# Devuelve el historial completo de cambios del modo de inscripción.
@router.get("/modo-inscripcion/historial", response_model=List[ConfigCambioLogResponse])
def get_historial_modo_inscripcion(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    _solo_admin(current_user)
    logs = (
        db.query(ConfiguracionCambioLog)
        .filter(ConfiguracionCambioLog.clave == "modo_inscripcion")
        .order_by(ConfiguracionCambioLog.timestamp.desc())
        .all()
    )
    return logs


# DELETE /api/configuracion/sistema/logo
# Pone en NULL las cinco claves del logo.
@router.delete("/sistema/logo", response_model=ConfigSistemaResponse)
def delete_logo(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    _solo_admin(current_user)

    claves_logo = ["logo_base64", "logo_mime_type", "logo_nombre_archivo", "logo_ancho_px", "logo_alto_px"]
    for clave in claves_logo:
        fila = db.query(ConfiguracionSistema).filter(ConfiguracionSistema.clave == clave).first()
        if fila:
            fila.valor = None

    db.commit()
    filas = db.query(ConfiguracionSistema).all()
    return ConfigSistemaResponse(configs=_filas_a_dict(filas))
