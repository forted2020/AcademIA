#   backend_AcademiA\backend-master\Routes\routes_ciclos.py

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import CicloLectivo
import schemas
from schemas import PagedResponse

router = APIRouter(
    prefix="/ciclos",
    tags=["Ciclos Lectivos"],
)


@router.get("/", response_model=PagedResponse)
def obtener_ciclos(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    query = db.query(CicloLectivo).order_by(CicloLectivo.nombre_ciclo_lectivo.desc())
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    data = [schemas.CicloLectivoResponse.model_validate(c) for c in items]
    return PagedResponse(data=data, total=total, skip=skip, limit=limit)
