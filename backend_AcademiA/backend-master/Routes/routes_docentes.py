# Routes/routes_docentes.py

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from database import localSession
from models import Entidad as EntidadORM
from schemas import (
    DocenteResponse,
    DocenteCreate,
    DocenteUpdate,
    UserAuthData,
    PagedResponse,
)
from auth import get_current_user
from datetime import datetime

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


@router.delete("/{id}")
async def delete_docente(id: int, db: Session = Depends(get_db)):
    db_docente = db.query(EntidadORM).filter(EntidadORM.id_entidad == id).first()

    if not db_docente:
        raise HTTPException(status_code=404, detail="Docente no encontrado")

    db.delete(db_docente)
    db.commit()
    return {"message": "Docente eliminado exitosamente"}
