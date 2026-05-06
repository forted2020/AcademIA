# backend_AcademiA\backend-master\Routes\routes_personal.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import localSession
from models import Entidad as EntidadORM, TipoEntidad as TipoEntidadORM
from models_schemas.personal_schemas import PersonalResponse
from schemas import PagedResponse

router = APIRouter()


def get_db():
    db = localSession()
    try:
        yield db
    finally:
        db.close()


@router.get("/personal", response_model=PagedResponse)
def get_personal(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    query = db.query(EntidadORM).join(TipoEntidadORM).filter(
        TipoEntidadORM.id_tipo_entidad.in_([3, 4, 5, 6, 8, 9]),
        EntidadORM.deleted_at.is_(None)
    )
    total = query.count()
    resultados = query.offset(skip).limit(limit).all()

    data = [
        PersonalResponse(
            apellido=p.apellido,
            nombre=p.nombre,
            dni=p.dni,
            domicilio=p.domicilio,
            localidad=p.localidad,
            telefono=p.telefono,
            cel=p.cel,
            email=p.email,
            tipo_entidad=p.tipo_entidad.tipo_entidad
        ) for p in resultados
    ]
    return PagedResponse(data=data, total=total, skip=skip, limit=limit)
