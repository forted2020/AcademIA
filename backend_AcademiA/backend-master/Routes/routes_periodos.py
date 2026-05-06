# Routes/routes_periodos.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import localSession
from models import Periodo
from schemas import PagedResponse

router = APIRouter()


def get_db():
    db = localSession()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=PagedResponse)
async def get_periodos(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    query = db.query(Periodo).order_by(Periodo.id_periodo)
    total = query.count()
    periodos = query.offset(skip).limit(limit).all()
    data = [{"id_periodo": p.id_periodo, "nombre_periodo": p.nombre_periodo} for p in periodos]
    return PagedResponse(data=data, total=total, skip=skip, limit=limit)


periodos_routes = router
