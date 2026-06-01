# Routes/routes_docentes.py

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from database import localSession
from models import Entidad as EntidadORM, Materia, NombreMateria, Curso, CicloLectivo
from schemas import (
    DocenteResponse,
    DocenteCreate,
    DocenteUpdate,
    UserAuthData,
    PagedResponse,
)
from auth import get_current_user
from datetime import datetime, date
from typing import List

router = APIRouter()


def get_db():
    db = localSession()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=PagedResponse)
async def get_docentes(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: UserAuthData = Depends(get_current_user),
):
    if current_user.tipo_rol.tipo_entidad != 'ADMIN_SISTEMA':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos de administrador.")

    query = db.query(EntidadORM).filter(
        EntidadORM.tipo_entidad.has(tipo_entidad="DOCENTE"),
        EntidadORM.apellido != "",
        EntidadORM.deleted_at.is_(None)
    )
    total = query.count()
    docentes_db = query.offset(skip).limit(limit).all()

    data = [DocenteResponse.model_validate(doc) for doc in docentes_db]
    return PagedResponse(data=data, total=total, skip=skip, limit=limit)


@router.get("/{id}", response_model=DocenteResponse)
async def get_docente(id: int, db: Session = Depends(get_db)):
    doc = db.query(EntidadORM).filter(
        EntidadORM.id_entidad == id,
        EntidadORM.tipo_entidad.has(tipo_entidad="DOCENTE"),
        EntidadORM.deleted_at.is_(None)
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Docente no encontrado")

    return DocenteResponse(
        id_entidad=doc.id_entidad,
        name=f"{doc.apellido}, {doc.nombre}".strip(),
        nombre=doc.nombre,
        apellido=doc.apellido,
        fec_nac=doc.fec_nac,
        email=doc.email,
        domicilio=doc.domicilio,
        telefono=doc.telefono
    )


@router.post("/", response_model=DocenteResponse, status_code=status.HTTP_201_CREATED)
async def create_docente(docente: DocenteCreate, db: Session = Depends(get_db)):
    if docente.email and db.query(EntidadORM).filter(EntidadORM.email == docente.email).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")

    new_docente = EntidadORM(
        **docente.model_dump(),
        id_tipo_entidad=2,
        updated_at=datetime.now(),
    )

    db.add(new_docente)
    db.commit()
    db.refresh(new_docente)
    return new_docente


@router.put("/{id_entidad}", response_model=DocenteResponse)
async def update_docente(id_entidad: int, docente: DocenteUpdate, db: Session = Depends(get_db)):
    db_docente = db.query(EntidadORM).filter(EntidadORM.id_entidad == id_entidad).first()

    if not db_docente:
        raise HTTPException(status_code=404, detail="Docente no encontrado")

    update_data = docente.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(db_docente, key, value.strip() if isinstance(value, str) else value)

    db_docente.updated_at = datetime.now()
    db.commit()
    db.refresh(db_docente)
    return db_docente


@router.get("/{id}/materias-actuales")
async def get_materias_actuales_docente(id: int, db: Session = Depends(get_db)):
    """Materias del docente en el ciclo vigente, con curso y count de alumnos inscriptos."""
    from sqlalchemy import func as sqlfunc, and_
    from models import Inscripcion

    hoy = date.today()

    ciclo_actual = db.query(CicloLectivo).filter(
        CicloLectivo.fecha_inicio_cl <= hoy,
        CicloLectivo.fecha_fin_cl >= hoy,
    ).first()

    if not ciclo_actual:
        ciclo_actual = db.query(CicloLectivo).order_by(CicloLectivo.id_ciclo_lectivo.desc()).first()

    if not ciclo_actual:
        return {"ciclo": None, "materias": []}

    # Trae las materias del docente en el ciclo activo
    rows = (
        db.query(
            Materia.id_materia,
            NombreMateria.nombre_materia,
            Curso.curso,
        )
        .join(NombreMateria, Materia.id_nombre_materia == NombreMateria.id_nombre_materia)
        .join(Curso, Curso.id_curso == Materia.id_curso)
        .filter(
            Materia.id_entidad == id,
            Curso.id_ciclo_lectivo == ciclo_actual.id_ciclo_lectivo,
        )
        .all()
    )

    # Cuenta alumnos inscriptos por materia en una segunda consulta (más simple y segura)
    ids_materia = [r.id_materia for r in rows]
    conteos = {}
    if ids_materia:
        conteos_raw = (
            db.query(
                Inscripcion.id_materia,
                sqlfunc.count(Inscripcion.id_inscripcion).label("n"),
            )
            .filter(
                Inscripcion.id_materia.in_(ids_materia),
                Inscripcion.id_ciclo_lectivo == ciclo_actual.id_ciclo_lectivo,
                Inscripcion.deleted_at.is_(None),
            )
            .group_by(Inscripcion.id_materia)
            .all()
        )
        conteos = {c.id_materia: c.n for c in conteos_raw}

    return {
        "ciclo": ciclo_actual.nombre_ciclo_lectivo,
        "materias": [
            {
                "id": r.id_materia,
                "nombre": r.nombre_materia,
                "curso": r.curso,
                "alumnos": conteos.get(r.id_materia, 0),
            }
            for r in rows
        ],
    }


@router.get("/{id}/ciclos")
def get_ciclos_del_docente(id: int, db: Session = Depends(get_db)):
    """Ciclos lectivos en los que el docente dictó al menos una materia."""
    filas = (
        db.query(CicloLectivo)
        .join(Curso, Curso.id_ciclo_lectivo == CicloLectivo.id_ciclo_lectivo)
        .join(Materia, Materia.id_curso == Curso.id_curso)
        .filter(Materia.id_entidad == id)
        .distinct()
        .order_by(CicloLectivo.id_ciclo_lectivo.desc())
        .all()
    )
    return [
        {"id_ciclo_lectivo": c.id_ciclo_lectivo, "nombre_ciclo_lectivo": c.nombre_ciclo_lectivo}
        for c in filas
    ]


@router.get("/{id}/ciclos/{id_ciclo}/cursos")
def get_cursos_del_docente_en_ciclo(id: int, id_ciclo: int, db: Session = Depends(get_db)):
    """Cursos del ciclo en los que el docente dictó al menos una materia."""
    filas = (
        db.query(Curso)
        .join(Materia, Materia.id_curso == Curso.id_curso)
        .filter(
            Materia.id_entidad == id,
            Curso.id_ciclo_lectivo == id_ciclo,
        )
        .distinct()
        .order_by(Curso.curso)
        .all()
    )
    return [{"id_curso": c.id_curso, "curso": c.curso} for c in filas]


@router.get("/{id}/ciclos/{id_ciclo}/cursos/{id_curso}/materias")
def get_materias_del_docente_en_curso(id: int, id_ciclo: int, id_curso: int, db: Session = Depends(get_db)):
    """Materias que el docente dicta en un curso y ciclo específicos."""
    filas = (
        db.query(Materia, NombreMateria.nombre_materia)
        .join(NombreMateria, Materia.id_nombre_materia == NombreMateria.id_nombre_materia)
        .join(Curso, Curso.id_curso == Materia.id_curso)
        .filter(
            Materia.id_entidad == id,
            Materia.id_curso == id_curso,
            Curso.id_ciclo_lectivo == id_ciclo,
        )
        .order_by(NombreMateria.nombre_materia)
        .all()
    )
    return [
        {"id_materia": m.id_materia, "nombre_materia": nombre}
        for m, nombre in filas
    ]


@router.delete("/{id}")
async def delete_docente(id: int, db: Session = Depends(get_db)):
    db_docente = db.query(EntidadORM).filter(EntidadORM.id_entidad == id).first()

    if not db_docente:
        raise HTTPException(status_code=404, detail="Docente no encontrado")

    db.delete(db_docente)
    db.commit()
    return {"message": "Docente eliminado exitosamente"}
