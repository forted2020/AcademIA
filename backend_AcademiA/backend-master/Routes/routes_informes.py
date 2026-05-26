# Routes/routes_informes.py
# Endpoints de informes y listados de gestión (Fase 6).
# Agrupa consultas read-only que combinan varias tablas y se renderizan como
# PDFs o vistas resumen en el frontend.

from typing import List, Optional
from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel

from database import get_db
from models import (
    Inscripcion, Materia, NombreMateria, Curso, Entidad, TipoEntidad,
    CicloLectivo, Nota, TipoNota,
)
from schemas import UserAuthData
from auth import get_current_user
from Services.config_service import get_config_float


router = APIRouter(
    prefix="/informes",
    tags=["Informes y Listados"],
)


# ────────────────────────────────────────────────────────────────────
# Schemas de respuesta — sólo para los informes nuevos
# ────────────────────────────────────────────────────────────────────

class AlumnoSimple(BaseModel):
    id_entidad: int
    nombre: str
    apellido: str
    dni: Optional[str] = None
    legajo: Optional[str] = None


class AlumnosPorCurso(BaseModel):
    id_curso: int
    nombre_curso: str
    id_ciclo_lectivo: int
    nombre_ciclo: str
    alumnos: List[AlumnoSimple]


class InscriptosPorMateria(BaseModel):
    id_materia: int
    nombre_materia: str
    id_curso: int
    nombre_curso: str
    id_ciclo_lectivo: int
    nombre_ciclo: str
    alumnos: List[AlumnoSimple]


class DocenteConMaterias(BaseModel):
    id_entidad: int
    nombre_completo: str
    materias: List[str]


class AlumnoConMateriasAdeudadas(BaseModel):
    id_entidad: int
    nombre_completo: str
    cantidad_previas: int
    materias: List[str]


class ConstanciaAlumnoRegular(BaseModel):
    id_entidad: int
    nombre_completo: str
    dni: Optional[str] = None
    legajo: Optional[str] = None
    id_ciclo_lectivo: int
    nombre_ciclo: str
    id_curso: int
    nombre_curso: str
    es_regular: bool


# ────────────────────────────────────────────────────────────────────
# Endpoints
# ────────────────────────────────────────────────────────────────────

@router.get("/alumnos-por-curso/{id_curso}", response_model=AlumnosPorCurso)
def alumnos_por_curso(
    id_curso: int,
    db: Session = Depends(get_db),
    current_user: UserAuthData = Depends(get_current_user),
):
    """Padrón de alumnos inscriptos en un curso específico."""
    curso = (
        db.query(Curso)
        .options(joinedload(Curso.ciclo_lectivo))
        .filter(Curso.id_curso == id_curso)
        .first()
    )
    if not curso:
        raise HTTPException(status_code=404, detail="Curso inexistente.")

    # Una inscripción por materia: deduplicamos por alumno para listar al alumno una sola vez.
    inscripciones = (
        db.query(Inscripcion)
        .options(joinedload(Inscripcion.estudiantes))
        .join(Materia, Materia.id_materia == Inscripcion.id_materia)
        .filter(
            Materia.id_curso == id_curso,
            Inscripcion.deleted_at.is_(None),
        )
        .all()
    )

    vistos = set()
    alumnos: List[AlumnoSimple] = []
    for ins in inscripciones:
        if ins.id_entidad in vistos:
            continue
        vistos.add(ins.id_entidad)
        e = ins.estudiantes
        if not e:
            continue
        alumnos.append(AlumnoSimple(
            id_entidad=e.id_entidad,
            nombre=e.nombre or '',
            apellido=e.apellido or '',
            dni=getattr(e, 'dni', None),
            legajo=getattr(e, 'legajo', None),
        ))

    alumnos.sort(key=lambda a: (a.apellido.lower(), a.nombre.lower()))

    return AlumnosPorCurso(
        id_curso=curso.id_curso,
        nombre_curso=curso.curso,
        id_ciclo_lectivo=curso.id_ciclo_lectivo,
        nombre_ciclo=curso.ciclo_lectivo.nombre_ciclo_lectivo if curso.ciclo_lectivo else str(curso.id_ciclo_lectivo),
        alumnos=alumnos,
    )


@router.get("/inscriptos-por-materia/{id_materia}", response_model=InscriptosPorMateria)
def inscriptos_por_materia(
    id_materia: int,
    db: Session = Depends(get_db),
    current_user: UserAuthData = Depends(get_current_user),
):
    """Listado de alumnos inscriptos en una materia específica."""
    materia = (
        db.query(Materia)
        .options(
            joinedload(Materia.curso).joinedload(Curso.ciclo_lectivo),
            joinedload(Materia.nombre),
        )
        .filter(Materia.id_materia == id_materia)
        .first()
    )
    if not materia:
        raise HTTPException(status_code=404, detail="Materia inexistente.")

    inscripciones = (
        db.query(Inscripcion)
        .options(joinedload(Inscripcion.estudiantes))
        .filter(
            Inscripcion.id_materia == id_materia,
            Inscripcion.deleted_at.is_(None),
        )
        .all()
    )

    alumnos: List[AlumnoSimple] = []
    for ins in inscripciones:
        e = ins.estudiantes
        if not e:
            continue
        alumnos.append(AlumnoSimple(
            id_entidad=e.id_entidad,
            nombre=e.nombre or '',
            apellido=e.apellido or '',
            dni=getattr(e, 'dni', None),
            legajo=getattr(e, 'legajo', None),
        ))
    alumnos.sort(key=lambda a: (a.apellido.lower(), a.nombre.lower()))

    nombre_materia = materia.nombre.nombre_materia if materia.nombre else f"Materia {id_materia}"
    curso = materia.curso
    return InscriptosPorMateria(
        id_materia=materia.id_materia,
        nombre_materia=nombre_materia,
        id_curso=curso.id_curso if curso else 0,
        nombre_curso=curso.curso if curso else '',
        id_ciclo_lectivo=curso.id_ciclo_lectivo if curso else 0,
        nombre_ciclo=curso.ciclo_lectivo.nombre_ciclo_lectivo if curso and curso.ciclo_lectivo else '',
        alumnos=alumnos,
    )


@router.get("/docentes-materias", response_model=List[DocenteConMaterias])
def docentes_con_materias(
    id_ciclo_lectivo: Optional[int] = Query(None, description="Filtra por ciclo lectivo"),
    db: Session = Depends(get_db),
    current_user: UserAuthData = Depends(get_current_user),
):
    """Listado de docentes con las materias que tienen asignadas."""
    q = (
        db.query(Materia)
        .options(
            joinedload(Materia.nombre),
            joinedload(Materia.curso),
        )
    )
    if id_ciclo_lectivo is not None:
        q = q.join(Curso, Curso.id_curso == Materia.id_curso).filter(
            Curso.id_ciclo_lectivo == id_ciclo_lectivo
        )

    materias = q.all()

    # Agrupamos manualmente — los docentes son entidades, no relación directa cargada.
    agrupado: dict[int, dict] = {}
    docente_ids = {m.id_entidad for m in materias if getattr(m, 'id_entidad', None)}
    docentes_map = {
        d.id_entidad: d
        for d in db.query(Entidad).filter(Entidad.id_entidad.in_(docente_ids)).all()
    } if docente_ids else {}

    for m in materias:
        id_doc = getattr(m, 'id_entidad', None)
        if not id_doc:
            continue
        doc = docentes_map.get(id_doc)
        if not doc:
            continue
        nombre_materia = m.nombre.nombre_materia if m.nombre else f"Materia {m.id_materia}"
        curso_label = f" ({m.curso.curso})" if m.curso else ''
        entry = agrupado.setdefault(id_doc, {
            "id_entidad": id_doc,
            "nombre_completo": f"{doc.apellido or ''}, {doc.nombre or ''}".strip(', '),
            "materias": [],
        })
        entry["materias"].append(f"{nombre_materia}{curso_label}")

    resultados = [
        DocenteConMaterias(**v) for v in agrupado.values()
    ]
    resultados.sort(key=lambda d: d.nombre_completo.lower())
    return resultados


@router.get("/riesgo-repitencia", response_model=List[AlumnoConMateriasAdeudadas])
def riesgo_repitencia(
    id_ciclo_lectivo: Optional[int] = Query(None, description="Considera previas hasta este ciclo (inclusive)"),
    db: Session = Depends(get_db),
    current_user: UserAuthData = Depends(get_current_user),
):
    """
    Alumnos ordenados por cantidad de materias previas (descendente).
    Sirve como listado de "riesgo de repitencia" y como base del listado de
    estudiantes que adeudan materias.
    """
    q = (
        db.query(Inscripcion)
        .options(
            joinedload(Inscripcion.estudiantes),
            joinedload(Inscripcion.materia).joinedload(Materia.nombre),
        )
        .filter(
            Inscripcion.es_previa.is_(True),
            Inscripcion.deleted_at.is_(None),
        )
    )
    if id_ciclo_lectivo is not None:
        q = q.filter(Inscripcion.id_ciclo_lectivo <= id_ciclo_lectivo)

    previas = q.all()

    agrupado: dict[int, dict] = {}
    for ins in previas:
        if not ins.estudiantes:
            continue
        nombre_materia = (
            ins.materia.nombre.nombre_materia if ins.materia and ins.materia.nombre
            else f"Materia {ins.id_materia}"
        )
        entry = agrupado.setdefault(ins.id_entidad, {
            "id_entidad": ins.id_entidad,
            "nombre_completo": f"{ins.estudiantes.apellido or ''}, {ins.estudiantes.nombre or ''}".strip(', '),
            "materias": [],
        })
        entry["materias"].append(nombre_materia)

    resultados = [
        AlumnoConMateriasAdeudadas(
            id_entidad=v["id_entidad"],
            nombre_completo=v["nombre_completo"],
            cantidad_previas=len(v["materias"]),
            materias=sorted(set(v["materias"])),
        )
        for v in agrupado.values()
    ]
    # Orden: más previas primero; desempate alfabético.
    resultados.sort(key=lambda a: (-a.cantidad_previas, a.nombre_completo.lower()))
    return resultados


@router.get("/constancia-regular/{id_entidad}", response_model=ConstanciaAlumnoRegular)
def constancia_alumno_regular(
    id_entidad: int,
    id_ciclo_lectivo: int = Query(..., description="Ciclo lectivo del que se solicita la constancia"),
    db: Session = Depends(get_db),
    current_user: UserAuthData = Depends(get_current_user),
):
    """
    Verifica que el alumno tenga inscripciones activas en el ciclo indicado.
    Si las tiene, devuelve los datos para emitir la constancia de alumno regular.
    """
    alumno = db.query(Entidad).filter(Entidad.id_entidad == id_entidad).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno inexistente.")

    inscripciones = (
        db.query(Inscripcion)
        .options(joinedload(Inscripcion.materia).joinedload(Materia.curso).joinedload(Curso.ciclo_lectivo))
        .filter(
            Inscripcion.id_entidad == id_entidad,
            Inscripcion.id_ciclo_lectivo == id_ciclo_lectivo,
            Inscripcion.deleted_at.is_(None),
        )
        .all()
    )

    if not inscripciones:
        return ConstanciaAlumnoRegular(
            id_entidad=alumno.id_entidad,
            nombre_completo=f"{alumno.apellido or ''}, {alumno.nombre or ''}".strip(', '),
            dni=getattr(alumno, 'dni', None),
            legajo=getattr(alumno, 'legajo', None),
            id_ciclo_lectivo=id_ciclo_lectivo,
            nombre_ciclo='',
            id_curso=0,
            nombre_curso='',
            es_regular=False,
        )

    # Tomamos el curso de la primera inscripción — todas deberían pertenecer al mismo curso
    # dentro del ciclo (en el modelo actual el curso vive en t_materia y se atribuye al ciclo).
    primera = inscripciones[0]
    curso = primera.materia.curso if primera.materia else None

    return ConstanciaAlumnoRegular(
        id_entidad=alumno.id_entidad,
        nombre_completo=f"{alumno.apellido or ''}, {alumno.nombre or ''}".strip(', '),
        dni=getattr(alumno, 'dni', None),
        legajo=getattr(alumno, 'legajo', None),
        id_ciclo_lectivo=id_ciclo_lectivo,
        nombre_ciclo=curso.ciclo_lectivo.nombre_ciclo_lectivo if curso and curso.ciclo_lectivo else '',
        id_curso=curso.id_curso if curso else 0,
        nombre_curso=curso.curso if curso else '',
        es_regular=True,
    )
