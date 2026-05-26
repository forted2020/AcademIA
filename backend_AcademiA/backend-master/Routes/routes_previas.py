# Routes/routes_previas.py
# Endpoints de "materias previas" (Fase 7.2).
# Una materia previa = inscripción del alumno en una materia de un ciclo cerrado
# donde no obtuvo nota final >= nota_aprobacion.
#
# Modelo: NO se crea tabla aparte. El flag vive en t_inscripciones.es_previa
# para evitar sincronización entre dos tablas.

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel

from database import get_db
from models import (
    Inscripcion, Materia, NombreMateria, Curso, Entidad,
    Nota, TipoNota, CicloLectivo,
)
from schemas import UserAuthData
from auth import get_current_user
from Services.config_service import get_config_float

router = APIRouter(
    prefix="/previas",
    tags=["Materias Previas"],
)


# ────────────────────────────────────────────────────────────────────
# Schemas locales (livianos — no pertenecen al dominio compartido)
# ────────────────────────────────────────────────────────────────────

class PreviaItem(BaseModel):
    id_inscripcion: int
    id_entidad: int
    nombre_alumno: str
    id_materia: int
    nombre_materia: str
    id_ciclo_lectivo: int
    nombre_ciclo: str
    nota_final: Optional[float] = None


class CierreCicloResultado(BaseModel):
    id_ciclo_lectivo: int
    inscripciones_evaluadas: int
    marcadas_previa: int
    levantadas: int
    nota_aprobacion_aplicada: float


# ────────────────────────────────────────────────────────────────────
# Helpers
# ────────────────────────────────────────────────────────────────────

def _solo_admin_o_docente(user: UserAuthData):
    if user.rol_sistema not in ("ADMIN_SISTEMA", "DOCENTE_APP"):
        raise HTTPException(status_code=403, detail="Sin permisos para gestionar previas.")


def _nota_final_de_inscripcion(db: Session, inscripcion: Inscripcion) -> Optional[float]:
    """
    Busca la "nota final" del alumno en la materia para el ciclo de la inscripción.
    Se considera final la nota cuyo TipoNota.es_final == True (criterio ya documentado).
    Si hay más de una, se toma la mayor (escenario: alumno levantó en recuperatorio).
    """
    fila = (
        db.query(Nota.nota)
        .join(TipoNota, TipoNota.id_tipo_nota == Nota.id_tipo_nota)
        .filter(
            Nota.id_entidad_estudiante == inscripcion.id_entidad,
            Nota.id_materia            == inscripcion.id_materia,
            TipoNota.es_final          == 1,
        )
        .order_by(Nota.nota.desc())
        .first()
    )
    return float(fila[0]) if fila and fila[0] is not None else None


# ────────────────────────────────────────────────────────────────────
# Endpoints
# ────────────────────────────────────────────────────────────────────

@router.post("/cerrar-ciclo/{id_ciclo_lectivo}", response_model=CierreCicloResultado)
def cerrar_ciclo_y_marcar_previas(
    id_ciclo_lectivo: int,
    db: Session = Depends(get_db),
    current_user: UserAuthData = Depends(get_current_user),
):
    """
    Recorre todas las inscripciones activas del ciclo indicado y, para cada una:
      - Si la nota final < nota_aprobacion (o no hay nota) → es_previa = True.
      - Si la nota final >= nota_aprobacion → es_previa = False (idempotente).

    Pensado para ejecutarse una vez por ciclo al cierre. Es seguro re-ejecutarlo:
    no crea registros, solo actualiza el flag.
    """
    _solo_admin_o_docente(current_user)

    ciclo = db.query(CicloLectivo).filter(
        CicloLectivo.id_ciclo_lectivo == id_ciclo_lectivo
    ).first()
    if not ciclo:
        raise HTTPException(status_code=404, detail="Ciclo lectivo inexistente.")

    nota_aprobacion = get_config_float(db, "nota_aprobacion", 6.0)

    inscripciones = (
        db.query(Inscripcion)
        .filter(
            Inscripcion.id_ciclo_lectivo == id_ciclo_lectivo,
            Inscripcion.deleted_at.is_(None),
        )
        .all()
    )

    marcadas = 0
    levantadas = 0
    for ins in inscripciones:
        nota_final = _nota_final_de_inscripcion(db, ins)
        no_aprueba = nota_final is None or nota_final < nota_aprobacion
        if no_aprueba and not ins.es_previa:
            ins.es_previa = True
            marcadas += 1
        elif (not no_aprueba) and ins.es_previa:
            ins.es_previa = False
            levantadas += 1

    db.commit()

    return CierreCicloResultado(
        id_ciclo_lectivo=id_ciclo_lectivo,
        inscripciones_evaluadas=len(inscripciones),
        marcadas_previa=marcadas,
        levantadas=levantadas,
        nota_aprobacion_aplicada=nota_aprobacion,
    )


@router.get("/", response_model=List[PreviaItem])
def listar_previas(
    id_entidad: Optional[int] = Query(None, description="Filtra por alumno específico"),
    id_ciclo_lectivo: Optional[int] = Query(None, description="Filtra por ciclo de origen"),
    db: Session = Depends(get_db),
    current_user: UserAuthData = Depends(get_current_user),
):
    """Listado de materias previas activas — soporta filtros opcionales."""
    q = (
        db.query(Inscripcion)
        .options(
            joinedload(Inscripcion.estudiantes),
            joinedload(Inscripcion.materia).joinedload(Materia.nombre),
            joinedload(Inscripcion.ciclo_lectivo),
        )
        .filter(
            Inscripcion.es_previa.is_(True),
            Inscripcion.deleted_at.is_(None),
        )
    )

    if id_entidad is not None:
        q = q.filter(Inscripcion.id_entidad == id_entidad)
    if id_ciclo_lectivo is not None:
        q = q.filter(Inscripcion.id_ciclo_lectivo == id_ciclo_lectivo)

    resultados: List[PreviaItem] = []
    for ins in q.all():
        alumno = ins.estudiantes
        materia = ins.materia
        ciclo = ins.ciclo_lectivo
        nombre_materia = (
            materia.nombre.nombre_materia
            if materia and materia.nombre
            else f"Materia {ins.id_materia}"
        )
        nombre_alumno = (
            f"{alumno.apellido or ''}, {alumno.nombre or ''}".strip(", ")
            if alumno else f"Alumno {ins.id_entidad}"
        )
        resultados.append(PreviaItem(
            id_inscripcion=ins.id_inscripcion,
            id_entidad=ins.id_entidad,
            nombre_alumno=nombre_alumno,
            id_materia=ins.id_materia,
            nombre_materia=nombre_materia,
            id_ciclo_lectivo=ins.id_ciclo_lectivo,
            nombre_ciclo=ciclo.nombre_ciclo_lectivo if ciclo else str(ins.id_ciclo_lectivo),
            nota_final=_nota_final_de_inscripcion(db, ins),
        ))

    return resultados


@router.put("/{id_inscripcion}/levantar", response_model=PreviaItem)
def levantar_previa(
    id_inscripcion: int,
    db: Session = Depends(get_db),
    current_user: UserAuthData = Depends(get_current_user),
):
    """Marca manualmente una previa como aprobada (es_previa = False)."""
    _solo_admin_o_docente(current_user)

    ins = (
        db.query(Inscripcion)
        .options(
            joinedload(Inscripcion.estudiantes),
            joinedload(Inscripcion.materia).joinedload(Materia.nombre),
            joinedload(Inscripcion.ciclo_lectivo),
        )
        .filter(Inscripcion.id_inscripcion == id_inscripcion)
        .first()
    )
    if not ins:
        raise HTTPException(status_code=404, detail="Inscripción inexistente.")
    if not ins.es_previa:
        raise HTTPException(status_code=400, detail="La inscripción no figura como previa.")

    ins.es_previa = False
    db.commit()
    db.refresh(ins)

    materia = ins.materia
    nombre_materia = (
        materia.nombre.nombre_materia if materia and materia.nombre
        else f"Materia {ins.id_materia}"
    )
    nombre_alumno = (
        f"{ins.estudiantes.apellido or ''}, {ins.estudiantes.nombre or ''}".strip(", ")
        if ins.estudiantes else f"Alumno {ins.id_entidad}"
    )
    return PreviaItem(
        id_inscripcion=ins.id_inscripcion,
        id_entidad=ins.id_entidad,
        nombre_alumno=nombre_alumno,
        id_materia=ins.id_materia,
        nombre_materia=nombre_materia,
        id_ciclo_lectivo=ins.id_ciclo_lectivo,
        nombre_ciclo=ins.ciclo_lectivo.nombre_ciclo_lectivo if ins.ciclo_lectivo else str(ins.id_ciclo_lectivo),
        nota_final=_nota_final_de_inscripcion(db, ins),
    )
