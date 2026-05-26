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


@router.get("/activo")
def obtener_ciclo_activo(db: Session = Depends(get_db)):
    """Devuelve el ciclo lectivo vigente hoy; fallback al de mayor id. Sin restricción de rol."""
    from datetime import date
    hoy = date.today()
    ciclo = db.query(CicloLectivo).filter(
        CicloLectivo.fecha_inicio_cl <= hoy,
        CicloLectivo.fecha_fin_cl >= hoy,
    ).first()
    if not ciclo:
        ciclo = db.query(CicloLectivo).order_by(CicloLectivo.id_ciclo_lectivo.desc()).first()
    if not ciclo:
        return {"id_ciclo_lectivo": None, "nombre_ciclo_lectivo": None}
    return {
        "id_ciclo_lectivo": ciclo.id_ciclo_lectivo,
        "nombre_ciclo_lectivo": ciclo.nombre_ciclo_lectivo,
    }


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
