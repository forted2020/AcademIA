#  backend-master\Routes\routes_materias.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from database import localSession
from models import Materia
import models, schemas
from schemas import PagedResponse

router = APIRouter()


def get_db():
    db = localSession()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=PagedResponse)
async def get_materias(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    query = db.query(models.Materia).options(
        joinedload(models.Materia.nombre),
        joinedload(models.Materia.docente),
        joinedload(models.Materia.curso)
            .joinedload(models.Curso.ciclo)
            .joinedload(models.CicloLectivo.plan)
    ).order_by(models.Materia.id_materia)
    total = db.query(models.Materia).count()
    items = query.offset(skip).limit(limit).all()
    data = [schemas.MateriaResponse.model_validate(m) for m in items]
    return PagedResponse(data=data, total=total, skip=skip, limit=limit)


@router.get("/tabla/", response_model=PagedResponse)
def obtener_materias_tabla(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    query = db.query(models.Materia).options(
        joinedload(models.Materia.nombre),
        joinedload(models.Materia.docente),
        joinedload(models.Materia.curso)
            .joinedload(models.Curso.ciclo)
            .joinedload(models.CicloLectivo.plan)
    )
    total = db.query(models.Materia).count()
    items = query.offset(skip).limit(limit).all()
    data = [schemas.MateriaResponse.model_validate(m) for m in items]
    return PagedResponse(data=data, total=total, skip=skip, limit=limit)


@router.get("/curso/{id_curso}", response_model=list[schemas.MateriaResponse])
async def get_materias_curso(id_curso: int, db: Session = Depends(get_db)):
    return db.query(models.Materia).options(
        joinedload(models.Materia.nombre),
        joinedload(models.Materia.docente),
        joinedload(models.Materia.curso)
            .joinedload(models.Curso.ciclo)
            .joinedload(models.CicloLectivo.plan)
    ).filter(models.Materia.id_curso == id_curso).all()


@router.get("/curso/{id_curso}/simple", response_model=list[schemas.MateriaSimpleResponse])
async def get_materias_curso_simple(id_curso: int, db: Session = Depends(get_db)):
    return db.query(
        models.Materia.id_materia,
        models.NombreMateria.nombre_materia
    ).join(models.Materia.nombre).filter(models.Materia.id_curso == id_curso).all()


materias_router = router
