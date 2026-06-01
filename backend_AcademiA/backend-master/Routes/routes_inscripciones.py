# Routes/routes_inscripciones.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import Inscripcion, Materia, TipoInscripcion, Curso, Entidad, NombreMateria
from schemas import UserAuthData
from auth import get_current_user
from datetime import date
from typing import List
from pydantic import BaseModel

router = APIRouter(
    prefix="/inscripciones",
    tags=["Inscripciones"],
)


class InscripcionLoteItem(BaseModel):
    id_entidad: int


class InscripcionLotePayload(BaseModel):
    alumnos: List[InscripcionLoteItem]
    id_ciclo_lectivo: int
    id_curso_destino: int
    id_tipo_insc: int
    fecha_insc: date = None


@router.post("/inscribir-lote", status_code=status.HTTP_201_CREATED)
def inscribir_lote(
    payload: InscripcionLotePayload,
    db: Session = Depends(get_db),
    current_user: UserAuthData = Depends(get_current_user),
):
    if current_user.rol_sistema not in ["ADMIN_SISTEMA", "DOCENTE_APP"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permisos para inscribir alumnos.")

    # Verificar que el curso destino pertenezca al ciclo destino
    curso_destino = db.query(Curso).filter(
        Curso.id_curso == payload.id_curso_destino,
        Curso.id_ciclo_lectivo == payload.id_ciclo_lectivo,
    ).first()

    if not curso_destino:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El curso destino no pertenece al ciclo lectivo seleccionado.",
        )

    # Obtener las materias del curso destino
    materias = db.query(Materia).filter(
        Materia.id_curso == payload.id_curso_destino,
    ).all()

    if not materias:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El curso destino no tiene materias registradas.",
        )

    tipo_insc = db.query(TipoInscripcion).filter(
        TipoInscripcion.id_tipo_insc == payload.id_tipo_insc
    ).first()
    if not tipo_insc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tipo de inscripción no encontrado.")

    fecha = payload.fecha_insc or date.today()

    creadas = 0
    omitidas = 0

    for alumno in payload.alumnos:
        for materia in materias:
            existe = db.query(Inscripcion).filter(
                Inscripcion.id_entidad == alumno.id_entidad,
                Inscripcion.id_materia == materia.id_materia,
                Inscripcion.id_ciclo_lectivo == payload.id_ciclo_lectivo,
                Inscripcion.deleted_at.is_(None),
            ).first()

            if existe:
                omitidas += 1
                continue

            nueva = Inscripcion(
                id_entidad=alumno.id_entidad,
                id_materia=materia.id_materia,
                id_tipo_insc=payload.id_tipo_insc,
                fecha_insc=fecha,
                id_ciclo_lectivo=payload.id_ciclo_lectivo,
            )
            db.add(nueva)
            creadas += 1

    db.commit()

    return {
        "inscripciones_creadas": creadas,
        "inscripciones_omitidas": omitidas,
        "mensaje": f"Se inscribieron {creadas} combinaciones alumno-materia. {omitidas} ya existían.",
    }


@router.get("/tipos/")
def get_tipos_inscripcion(db: Session = Depends(get_db)):
    tipos = db.query(TipoInscripcion).all()
    return [{"id_tipo_insc": t.id_tipo_insc, "nombre_tip_insc": t.nombre_tip_insc or ""} for t in tipos]


# Devuelve los id_entidad de alumnos ya inscriptos activamente en un curso+ciclo.
# El frontend lo usa para marcar visualmente a los alumnos ya inscriptos antes de confirmar.
@router.get("/ya-inscriptos")
def get_ya_inscriptos(
    id_curso: int,
    id_ciclo_lectivo: int,
    db: Session = Depends(get_db),
    current_user: UserAuthData = Depends(get_current_user),
):
    if current_user.rol_sistema not in ["ADMIN_SISTEMA", "DOCENTE_APP"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Sin permisos.")

    # Buscar entidades que tienen al menos una inscripción activa en una materia
    # de ese curso y ciclo
    ids = (
        db.query(Inscripcion.id_entidad)
        .join(Materia, Materia.id_materia == Inscripcion.id_materia)
        .filter(
            Materia.id_curso == id_curso,
            Inscripcion.id_ciclo_lectivo == id_ciclo_lectivo,
            Inscripcion.deleted_at.is_(None),
        )
        .distinct()
        .all()
    )

    return {"ids": [row.id_entidad for row in ids]}
