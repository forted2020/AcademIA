#   backend_AcademiA\backend-master\Routes\routes_cursos.py

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from database import get_db
from models import Curso, Inscripcion, Materia, Entidad, TipoEntidad
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

    ids_cursos = [c.id_curso for c in items]

    materias_por_curso = dict(
        db.query(Materia.id_curso, func.count(Materia.id_materia))
        .filter(Materia.id_curso.in_(ids_cursos))
        .group_by(Materia.id_curso)
        .all()
    ) if items else {}

    # Contar alumnos distintos por curso: subquery para garantizar exactamente
    # el mismo resultado que el endpoint /{id_curso}/alumnos.
    # La lógica es: alumno inscripto en N materias del curso → cuenta 1 solo vez.
    alumnos_por_curso_real = {}
    if items:
        from sqlalchemy import select, distinct as sa_distinct
        sub = (
            select(Materia.id_curso, Inscripcion.id_entidad)
            .join(Inscripcion, Inscripcion.id_materia == Materia.id_materia)
            .join(Entidad, Entidad.id_entidad == Inscripcion.id_entidad)
            .where(
                Materia.id_curso.in_(ids_cursos),
                Inscripcion.deleted_at.is_(None),
                Entidad.deleted_at.is_(None),
            )
            .distinct()
            .subquery()
        )
        rows = (
            db.query(sub.c.id_curso, func.count())
            .group_by(sub.c.id_curso)
            .all()
        )
        alumnos_por_curso_real = dict(rows)

    result = []
    for c in items:
        d = schemas.CursoCicloLectivo.model_validate(c).model_dump()
        d['total_alumnos'] = alumnos_por_curso_real.get(c.id_curso, 0)
        d['total_materias'] = materias_por_curso.get(c.id_curso, 0)
        result.append(d)

    return PagedResponse(data=result, total=total, skip=skip, limit=limit)


@router.get("/por_ciclo/{id_ciclo}", response_model=list[schemas.CursoResponse])
def obtener_cursos_por_ciclo(id_ciclo: int, db: Session = Depends(get_db)):
    return db.query(Curso).filter(Curso.id_ciclo_lectivo == id_ciclo).all()


@router.post("/", response_model=schemas.CursoResponse, status_code=201)
def crear_curso(payload: schemas.CursoCreate, db: Session = Depends(get_db)):
    curso = Curso(
        curso=payload.curso,
        id_ciclo_lectivo=payload.id_ciclo_lectivo,
    )
    db.add(curso)
    db.commit()
    db.refresh(curso)
    return schemas.CursoResponse.model_validate(curso)


@router.put("/{id_curso}", response_model=schemas.CursoResponse)
def actualizar_curso(id_curso: int, payload: schemas.CursoUpdate, db: Session = Depends(get_db)):
    curso = db.query(Curso).filter(Curso.id_curso == id_curso).first()
    if not curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado.")
    if payload.curso is not None:
        curso.curso = payload.curso
    if payload.id_ciclo_lectivo is not None:
        curso.id_ciclo_lectivo = payload.id_ciclo_lectivo
    db.commit()
    db.refresh(curso)
    return schemas.CursoResponse.model_validate(curso)


# Devuelve los alumnos inscriptos en un curso con sus datos básicos.
# Usado por el modal de detalle de curso en el frontend.
@router.get("/{id_curso}/alumnos")
def get_alumnos_por_curso(id_curso: int, id_ciclo: int = Query(None), db: Session = Depends(get_db)):
    q = (
        db.query(Entidad)
        .join(Inscripcion, Inscripcion.id_entidad == Entidad.id_entidad)
        .join(Materia, Materia.id_materia == Inscripcion.id_materia)
        .filter(
            Materia.id_curso == id_curso,
            Inscripcion.deleted_at.is_(None),
            Entidad.deleted_at.is_(None),
        )
    )
    if id_ciclo:
        q = q.filter(Inscripcion.id_ciclo_lectivo == id_ciclo)
    rows = q.distinct().order_by(Entidad.apellido, Entidad.nombre).all()
    return [
        {
            "id_entidad": e.id_entidad,
            "nombre": e.nombre,
            "apellido": e.apellido,
            "dni": e.dni,
            "legajo": e.legajo,
            "email": e.email,
        }
        for e in rows
    ]


# Devuelve las materias de un curso con el nombre del docente.
@router.get("/{id_curso}/materias")
def get_materias_por_curso(id_curso: int, db: Session = Depends(get_db)):
    materias = (
        db.query(Materia)
        .options(
            joinedload(Materia.nombre),
            joinedload(Materia.docente),
        )
        .filter(Materia.id_curso == id_curso)
        .all()
    )
    return [
        {
            "id_materia": m.id_materia,
            "nombre_materia": m.nombre.nombre_materia if m.nombre else "—",
            "docente": f"{m.docente.apellido}, {m.docente.nombre}" if m.docente else "Sin asignar",
        }
        for m in materias
    ]
