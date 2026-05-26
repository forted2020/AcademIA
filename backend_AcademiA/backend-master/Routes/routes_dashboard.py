# Routes/routes_dashboard.py
# Endpoint de resumen para el dashboard del administrador.
# Consolida KPIs globales, distribución de alumnos y previas top 5 en una sola llamada.

from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import (
    Entidad, TipoEntidad, CicloLectivo, Curso,
    Inscripcion, Materia, NombreMateria,
)
from schemas import UserAuthData
from auth import get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


# ────────────────────────────────────────────────────────────────────
# Schemas de respuesta
# ────────────────────────────────────────────────────────────────────

class AlumnosPorCurso(BaseModel):
    label: str
    value: int


class PreviasPorMateria(BaseModel):
    materia: str
    curso: str
    cantidad: int


class ResumenDashboard(BaseModel):
    ciclo_activo: str
    id_ciclo_activo: Optional[int]
    ciclo_anterior: Optional[str]
    total_alumnos: int
    total_alumnos_prev: int
    total_docentes: int
    total_docentes_prev: int
    total_inscripciones: int
    total_inscripciones_prev: int
    total_previas: int
    total_previas_prev: int
    cursos_activos: int
    alumnos_por_curso: List[AlumnosPorCurso]
    previas_por_materia: List[PreviasPorMateria]


# ────────────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────────────

def _ciclo_activo(db: Session) -> Optional[CicloLectivo]:
    """Ciclo cuyo rango de fechas incluye hoy; fallback al de mayor id."""
    hoy = date.today()
    ciclo = db.query(CicloLectivo).filter(
        CicloLectivo.fecha_inicio_cl <= hoy,
        CicloLectivo.fecha_fin_cl   >= hoy,
    ).first()
    if not ciclo:
        ciclo = db.query(CicloLectivo).order_by(CicloLectivo.id_ciclo_lectivo.desc()).first()
    return ciclo


def _ciclo_anterior(db: Session, id_actual: int) -> Optional[CicloLectivo]:
    """Ciclo inmediatamente anterior al activo, por id."""
    return (
        db.query(CicloLectivo)
        .filter(CicloLectivo.id_ciclo_lectivo < id_actual)
        .order_by(CicloLectivo.id_ciclo_lectivo.desc())
        .first()
    )


def _count_entidad(db: Session, tipo: str) -> int:
    return db.query(Entidad).join(TipoEntidad).filter(
        TipoEntidad.tipo_entidad == tipo,
        Entidad.deleted_at.is_(None),
    ).count()


def _count_inscripciones(db: Session, id_ciclo: Optional[int]) -> int:
    if id_ciclo is None:
        return 0
    return db.query(Inscripcion).filter(
        Inscripcion.id_ciclo_lectivo == id_ciclo,
        Inscripcion.deleted_at.is_(None),
    ).count()


def _count_previas(db: Session, id_ciclo: Optional[int]) -> int:
    if id_ciclo is None:
        return 0
    return db.query(Inscripcion).filter(
        Inscripcion.id_ciclo_lectivo == id_ciclo,
        Inscripcion.es_previa.is_(True),
        Inscripcion.deleted_at.is_(None),
    ).count()


def _count_cursos(db: Session, id_ciclo: Optional[int]) -> int:
    if id_ciclo is None:
        return 0
    return db.query(Curso).filter(Curso.id_ciclo_lectivo == id_ciclo).count()


def _alumnos_por_curso(db: Session, id_ciclo: Optional[int]) -> List[AlumnosPorCurso]:
    """Cuenta alumnos únicos inscriptos por curso en el ciclo dado."""
    if id_ciclo is None:
        return []

    filas = (
        db.query(Curso.curso, func.count(func.distinct(Inscripcion.id_entidad)).label("qty"))
        .join(Materia, Materia.id_curso == Curso.id_curso)
        .join(Inscripcion, Inscripcion.id_materia == Materia.id_materia)
        .filter(
            Curso.id_ciclo_lectivo == id_ciclo,
            Inscripcion.deleted_at.is_(None),
        )
        .group_by(Curso.id_curso, Curso.curso)
        .order_by(Curso.curso)
        .all()
    )
    return [AlumnosPorCurso(label=f.curso, value=f.qty) for f in filas]


def _previas_top5(db: Session, id_ciclo: Optional[int]) -> List[PreviasPorMateria]:
    """Top 5 materias con más previas en el ciclo dado."""
    if id_ciclo is None:
        return []

    filas = (
        db.query(
            NombreMateria.nombre_materia,
            Curso.curso,
            func.count(Inscripcion.id_inscripcion).label("qty"),
        )
        .join(Materia, Materia.id_nombre_materia == NombreMateria.id_nombre_materia)
        .join(Curso, Curso.id_curso == Materia.id_curso)
        .join(Inscripcion, Inscripcion.id_materia == Materia.id_materia)
        .filter(
            Inscripcion.id_ciclo_lectivo == id_ciclo,
            Inscripcion.es_previa.is_(True),
            Inscripcion.deleted_at.is_(None),
        )
        .group_by(NombreMateria.id_nombre_materia, NombreMateria.nombre_materia, Curso.id_curso, Curso.curso)
        .order_by(func.count(Inscripcion.id_inscripcion).desc())
        .limit(5)
        .all()
    )
    return [PreviasPorMateria(materia=f.nombre_materia, curso=f.curso, cantidad=f.qty) for f in filas]


# ────────────────────────────────────────────────────────────────────
# Endpoint
# ────────────────────────────────────────────────────────────────────

@router.get("/resumen", response_model=ResumenDashboard)
def resumen_dashboard(
    db: Session = Depends(get_db),
    current_user: UserAuthData = Depends(get_current_user),
):
    """KPIs globales del sistema para el dashboard del administrador."""
    if current_user.rol_sistema != "ADMIN_SISTEMA":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo administradores.")

    ciclo = _ciclo_activo(db)
    id_ciclo = ciclo.id_ciclo_lectivo if ciclo else None
    nombre_ciclo = ciclo.nombre_ciclo_lectivo if ciclo else "Sin ciclo"

    ciclo_ant = _ciclo_anterior(db, id_ciclo) if id_ciclo else None
    id_ciclo_ant = ciclo_ant.id_ciclo_lectivo if ciclo_ant else None
    nombre_ciclo_ant = ciclo_ant.nombre_ciclo_lectivo if ciclo_ant else None

    return ResumenDashboard(
        ciclo_activo=nombre_ciclo,
        id_ciclo_activo=id_ciclo,
        ciclo_anterior=nombre_ciclo_ant,
        total_alumnos=_count_entidad(db, "ESTUDIANTE"),
        total_alumnos_prev=_count_entidad(db, "ESTUDIANTE"),   # no cambia por ciclo — mismo total
        total_docentes=_count_entidad(db, "DOCENTE"),
        total_docentes_prev=_count_entidad(db, "DOCENTE"),
        total_inscripciones=_count_inscripciones(db, id_ciclo),
        total_inscripciones_prev=_count_inscripciones(db, id_ciclo_ant),
        total_previas=_count_previas(db, id_ciclo),
        total_previas_prev=_count_previas(db, id_ciclo_ant),
        cursos_activos=_count_cursos(db, id_ciclo),
        alumnos_por_curso=_alumnos_por_curso(db, id_ciclo),
        previas_por_materia=_previas_top5(db, id_ciclo),
    )
