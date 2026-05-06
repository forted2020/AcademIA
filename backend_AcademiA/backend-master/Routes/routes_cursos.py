#   backend_AcademiA\backend-master\Routes\routes_cursos.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models import Curso
import models, schemas
from schemas import PagedResponse

router = APIRouter(
    prefix="/cursos",
    tags=["Cursos"],
)


@router.get("/", response_model=PagedResponse)
def obtener_cursos(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    query = db.query(Curso)
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    data = [schemas.CursoResponse.model_validate(c) for c in items]
    return PagedResponse(data=data, total=total, skip=skip, limit=limit)


@router.get("/completo/", response_model=PagedResponse)
def obtener_cursos_ciclo_plan(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    query = db.query(models.Curso).options(
        joinedload(models.Curso.ciclo).joinedload(models.CicloLectivo.plan)
    )
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    data = [schemas.CursoCicloLectivo.model_validate(c) for c in items]
    return PagedResponse(data=data, total=total, skip=skip, limit=limit)


@router.get("/por_ciclo/{id_ciclo}", response_model=list[schemas.CursoResponse])
def obtener_cursos_por_ciclo(id_ciclo: int, db: Session = Depends(get_db)):
    return db.query(Curso).filter(Curso.id_ciclo_lectivo == id_ciclo).all()
