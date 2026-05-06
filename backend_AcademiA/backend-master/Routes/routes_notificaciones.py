# backend-master/Routes/routes_notificaciones.py
#
# CRUD de notificaciones internas del sistema.
# Endpoints:
#   GET  /notificaciones/               — lista las notificaciones del usuario autenticado
#   GET  /notificaciones/no-leidas      — solo las no leídas (para el badge del header)
#   POST /notificaciones/marcar-leidas  — marca una lista de IDs como leídas
#   DELETE /notificaciones/{id}         — elimina una notificación propia
#   GET  /notificaciones/config         — obtiene la configuración de preferencias del usuario
#   PUT  /notificaciones/config         — guarda las preferencias (upsert)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models, schemas
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/notificaciones", tags=["Notificaciones"])

# Tipos de notificación reconocidos por el sistema
TIPOS_VALIDOS = {'nota', 'inasistencia', 'inscripcion', 'sistema'}


# ─────────────────────────────────────────────────────────────
#  GET /notificaciones/  — todas las notificaciones del usuario
# ─────────────────────────────────────────────────────────────
@router.get("/", response_model=List[schemas.NotificacionResponse])
def listar_notificaciones(
    skip: int = 0,
    limit: int = 50,
    solo_no_leidas: bool = False,
    current_user: schemas.UserAuthData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = (
        db.query(models.Notificacion)
        .filter(models.Notificacion.id_usuario_destino == current_user.id_usuario)
    )
    if solo_no_leidas:
        query = query.filter(models.Notificacion.leida == False)

    return (
        query
        .order_by(models.Notificacion.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ─────────────────────────────────────────────────────────────
#  GET /notificaciones/no-leidas  — contador para el badge
# ─────────────────────────────────────────────────────────────
@router.get("/no-leidas", response_model=dict)
def contar_no_leidas(
    current_user: schemas.UserAuthData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    total = (
        db.query(models.Notificacion)
        .filter(
            models.Notificacion.id_usuario_destino == current_user.id_usuario,
            models.Notificacion.leida == False,
        )
        .count()
    )
    return {"total": total}


# ─────────────────────────────────────────────────────────────
#  POST /notificaciones/marcar-leidas  — marca IDs como leídas
# ─────────────────────────────────────────────────────────────
@router.post("/marcar-leidas", status_code=status.HTTP_200_OK)
def marcar_leidas(
    payload: schemas.MarcarLeidaRequest,
    current_user: schemas.UserAuthData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Solo se pueden marcar las notificaciones propias del usuario
    db.query(models.Notificacion).filter(
        models.Notificacion.id.in_(payload.ids),
        models.Notificacion.id_usuario_destino == current_user.id_usuario,
    ).update({"leida": True}, synchronize_session=False)
    db.commit()
    return {"detail": "Notificaciones marcadas como leídas"}


# ─────────────────────────────────────────────────────────────
#  DELETE /notificaciones/{id}  — elimina una notificación propia
# ─────────────────────────────────────────────────────────────
@router.delete("/{notif_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_notificacion(
    notif_id: int,
    current_user: schemas.UserAuthData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    notif = db.query(models.Notificacion).filter(
        models.Notificacion.id == notif_id,
        models.Notificacion.id_usuario_destino == current_user.id_usuario,
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notificación no encontrada")
    db.delete(notif)
    db.commit()


# ─────────────────────────────────────────────────────────────
#  GET /notificaciones/config  — preferencias del usuario
# ─────────────────────────────────────────────────────────────
@router.get("/config", response_model=List[schemas.NotifConfigResponse])
def obtener_config(
    current_user: schemas.UserAuthData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    configs = (
        db.query(models.NotificacionConfig)
        .filter(models.NotificacionConfig.id_usuario == current_user.id_usuario)
        .all()
    )
    # Si no hay config guardada, devolvemos los defaults (todos activos)
    if not configs:
        return [
            schemas.NotifConfigResponse(
                id=0, id_usuario=current_user.id_usuario, tipo=t, activa=True
            )
            for t in TIPOS_VALIDOS
        ]
    return configs


# ─────────────────────────────────────────────────────────────
#  PUT /notificaciones/config  — guarda preferencias (upsert)
# ─────────────────────────────────────────────────────────────
@router.put("/config", response_model=List[schemas.NotifConfigResponse])
def actualizar_config(
    payload: schemas.NotifConfigUpdate,
    current_user: schemas.UserAuthData = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resultado = []
    for pref in payload.preferencias:
        if pref.tipo not in TIPOS_VALIDOS:
            raise HTTPException(
                status_code=400,
                detail=f"Tipo de notificación inválido: {pref.tipo}",
            )
        existing = (
            db.query(models.NotificacionConfig)
            .filter(
                models.NotificacionConfig.id_usuario == current_user.id_usuario,
                models.NotificacionConfig.tipo == pref.tipo,
            )
            .first()
        )
        if existing:
            existing.activa = pref.activa
            resultado.append(existing)
        else:
            nueva = models.NotificacionConfig(
                id_usuario=current_user.id_usuario,
                tipo=pref.tipo,
                activa=pref.activa,
            )
            db.add(nueva)
            resultado.append(nueva)

    db.commit()
    for r in resultado:
        db.refresh(r)
    return resultado


# ─────────────────────────────────────────────────────────────
#  Función utilitaria para generar notificaciones desde otros routers
#  Uso: from Routes.routes_notificaciones import crear_notificacion_interna
# ─────────────────────────────────────────────────────────────
def crear_notificacion_interna(
    db: Session,
    id_usuario_destino: int,
    mensaje: str,
    tipo: str = "sistema",
):
    """
    Crea una notificación solo si el usuario tiene activo ese tipo en su configuración.
    Se llama internamente desde otros routers al registrar notas, inasistencias, etc.
    """
    # Verificar preferencia del usuario
    config = (
        db.query(models.NotificacionConfig)
        .filter(
            models.NotificacionConfig.id_usuario == id_usuario_destino,
            models.NotificacionConfig.tipo == tipo,
        )
        .first()
    )
    # Si tiene la notificación desactivada explícitamente, no la creamos
    if config is not None and not config.activa:
        return

    notif = models.Notificacion(
        id_usuario_destino=id_usuario_destino,
        mensaje=mensaje,
        tipo=tipo,
    )
    db.add(notif)
    # No hacemos commit aquí; el caller ya lo hace
