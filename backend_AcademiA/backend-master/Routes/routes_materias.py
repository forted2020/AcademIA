#  backend-master\Routes\routes_materias.py

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import localSession
from models import Materia, NombreMateria
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


# Catálogo de nombres de materias (t_nombre_materia) — usado en el selector del formulario
@router.get("/nombres/", response_model=list[schemas.NombreMateriaResponse])
def get_nombres_materia(db: Session = Depends(get_db)):
    return db.query(NombreMateria).order_by(NombreMateria.nombre_materia).all()


# Crear una materia nueva en un curso
@router.post("/", response_model=schemas.MateriaDetalleResponse, status_code=201)
def crear_materia(payload: schemas.MateriaCreate, db: Session = Depends(get_db)):
    duplicada = (
        db.query(Materia)
        .filter(
            Materia.id_curso == payload.id_curso,
            Materia.id_nombre_materia == payload.id_nombre_materia,
        )
        .first()
    )
    if duplicada:
        raise HTTPException(
            status_code=409,
            detail="Esa materia ya existe en este curso.",
        )
    materia = Materia(
        id_nombre_materia=payload.id_nombre_materia,
        id_curso=payload.id_curso,
        id_entidad=payload.id_entidad,
    )
    db.add(materia)
    db.commit()
    db.refresh(materia)
    return _materia_detalle(materia.id_materia, db)


# Actualizar docente o nombre de una materia existente
@router.put("/{id_materia}", response_model=schemas.MateriaDetalleResponse)
def actualizar_materia(id_materia: int, payload: schemas.MateriaUpdate, db: Session = Depends(get_db)):
    materia = db.query(Materia).filter(Materia.id_materia == id_materia).first()
    if not materia:
        raise HTTPException(status_code=404, detail="Materia no encontrada.")
    # model_fields_set contiene solo los campos que el cliente envió explícitamente
    campos = payload.model_fields_set
    if 'id_nombre_materia' in campos and payload.id_nombre_materia is not None:
        materia.id_nombre_materia = payload.id_nombre_materia
    if 'id_entidad' in campos:
        # Permite asignar None explícitamente para quitar el docente
        materia.id_entidad = payload.id_entidad
    db.commit()
    return _materia_detalle(id_materia, db)


# Eliminar una materia (hard delete — solo si no tiene inscripciones activas)
@router.delete("/{id_materia}", status_code=204)
def eliminar_materia(id_materia: int, db: Session = Depends(get_db)):
    materia = db.query(Materia).filter(Materia.id_materia == id_materia).first()
    if not materia:
        raise HTTPException(status_code=404, detail="Materia no encontrada.")
    tiene_inscripciones = (
        db.query(models.Inscripcion)
        .filter(
            models.Inscripcion.id_materia == id_materia,
            models.Inscripcion.deleted_at.is_(None),
        )
        .first()
    )
    if tiene_inscripciones:
        raise HTTPException(
            status_code=409,
            detail="No se puede eliminar la materia porque tiene alumnos inscriptos activos.",
        )
    db.delete(materia)
    db.commit()


def _materia_detalle(id_materia: int, db: Session) -> dict:
    """Carga una materia con sus relaciones para devolver en POST/PUT."""
    m = db.query(Materia).options(
        joinedload(Materia.nombre),
        joinedload(Materia.docente),
    ).filter(Materia.id_materia == id_materia).first()
    return {
        "id_materia": m.id_materia,
        "id_nombre_materia": m.id_nombre_materia,
        "id_curso": m.id_curso,
        "id_entidad": m.id_entidad,
        "nombre_materia": m.nombre.nombre_materia if m.nombre else "—",
        "docente": f"{m.docente.apellido}, {m.docente.nombre}" if m.docente else "Sin asignar",
    }


materias_router = router
