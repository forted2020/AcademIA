"""
Endpoints para gestión de Estudiantes (Entidades con tipo_entidad = 'ALU')
Agregar estos endpoints al backend de FastAPI

Archivo sugerido: routers/estudiantes.py o agregar a main.py
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel, EmailStr

# ==================== SCHEMAS (Pydantic) ====================
# Estos modelos definen la estructura de datos que se envía/recibe

class EstudianteBase(BaseModel):
    """Schema base para estudiantes"""
    name: str  # Nombre y apellido
    email: EmailStr  # Email validado
    domicilio: Optional[str] = None  # Domicilio (opcional)
    telefono: Optional[str] = None  # Teléfono (opcional)

class EstudianteCreate(EstudianteBase):
    """Schema para crear un estudiante (requiere password)"""
    password: str

class EstudianteUpdate(EstudianteBase):
    """Schema para actualizar un estudiante (password opcional)"""
    password: Optional[str] = None

class EstudianteResponse(EstudianteBase):
    """Schema de respuesta (incluye ID, sin password)"""
    id: int
    
    class Config:
        from_attributes = True  # Permite convertir ORM a Pydantic


# ==================== ROUTER ====================
# Crear el router para estudiantes
router = APIRouter(
    prefix="/api/estudiantes",
    tags=["estudiantes"]
)


# ==================== ENDPOINTS ====================

@router.get("/", response_model=List[EstudianteResponse])
def get_estudiantes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)  # ← Reemplazar con tu función get_db
):
    """
    GET /api/estudiantes
    
    Obtiene todos los estudiantes (tipo_entidad = 'ALU')
    
    Parámetros:
    - skip: Número de registros a saltar (paginación)
    - limit: Número máximo de registros a devolver
    
    Retorna: Lista de estudiantes
    """
    estudiantes = db.query(Entidad).filter(  # ← Reemplazar 'Entidad' con tu modelo
        Entidad.tipo_entidad == "ALU"
    ).offset(skip).limit(limit).all()
    
    return estudiantes


@router.get("/{id}", response_model=EstudianteResponse)
def get_estudiante(
    id: int,
    db: Session = Depends(get_db)
):
    """
    GET /api/estudiantes/{id}
    
    Obtiene un estudiante específico por ID
    
    Parámetros:
    - id: ID del estudiante
    
    Retorna: Datos del estudiante
    Errores: 404 si no se encuentra
    """
    estudiante = db.query(Entidad).filter(
        Entidad.id == id,
        Entidad.tipo_entidad == "ALU"
    ).first()
    
    if not estudiante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudiante no encontrado"
        )
    
    return estudiante


@router.post("/", response_model=EstudianteResponse, status_code=status.HTTP_201_CREATED)
def create_estudiante(
    estudiante: EstudianteCreate,
    db: Session = Depends(get_db)
):
    """
    POST /api/estudiantes/
    
    Crea un nuevo estudiante
    - Asigna automáticamente tipo_entidad = 'ALU'
    - Hashea la contraseña antes de guardarla
    
    Body: EstudianteCreate
    Retorna: Estudiante creado
    Errores: 400 si el email ya existe
    """
    # 1. Verificar si el email ya existe
    existing = db.query(Entidad).filter(
        Entidad.email == estudiante.email
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # 2. Hashear la contraseña
    hashed_password = get_password_hash(estudiante.password)  # ← Usar tu función de hash
    
    # 3. Crear el nuevo estudiante
    db_estudiante = Entidad(  # ← Reemplazar 'Entidad' con tu modelo
        name=estudiante.name,
        email=estudiante.email,
        domicilio=estudiante.domicilio,
        telefono=estudiante.telefono,
        password=hashed_password,
        tipo_entidad="ALU"  # ← IMPORTANTE: Asignación automática
    )
    
    # 4. Guardar en la base de datos
    db.add(db_estudiante)
    db.commit()
    db.refresh(db_estudiante)
    
    return db_estudiante


@router.put("/{id}", response_model=EstudianteResponse)
def update_estudiante(
    id: int,
    estudiante: EstudianteUpdate,
    db: Session = Depends(get_db)
):
    """
    PUT /api/estudiantes/{id}
    
    Actualiza un estudiante existente
    - Solo actualiza los campos proporcionados
    - Si se envía password, se hashea antes de guardar
    
    Parámetros:
    - id: ID del estudiante
    Body: EstudianteUpdate
    
    Retorna: Estudiante actualizado
    Errores: 404 si no se encuentra
    """
    # 1. Buscar el estudiante
    db_estudiante = db.query(Entidad).filter(
        Entidad.id == id,
        Entidad.tipo_entidad == "ALU"
    ).first()
    
    if not db_estudiante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudiante no encontrado"
        )
    
    # 2. Actualizar campos
    db_estudiante.name = estudiante.name
    db_estudiante.email = estudiante.email
    db_estudiante.domicilio = estudiante.domicilio
    db_estudiante.telefono = estudiante.telefono
    
    # 3. Actualizar password solo si se proporciona
    if estudiante.password:
        db_estudiante.password = get_password_hash(estudiante.password)
    
    # 4. Guardar cambios
    db.commit()
    db.refresh(db_estudiante)
    
    return db_estudiante


@router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_estudiante(
    id: int,
    db: Session = Depends(get_db)
):
    """
    DELETE /api/estudiantes/{id}
    
    Elimina un estudiante
    
    Parámetros:
    - id: ID del estudiante a eliminar
    
    Retorna: Mensaje de confirmación
    Errores: 404 si no se encuentra
    """
    # 1. Buscar el estudiante
    db_estudiante = db.query(Entidad).filter(
        Entidad.id == id,
        Entidad.tipo_entidad == "ALU"
    ).first()
    
    if not db_estudiante:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudiante no encontrado"
        )
    
    # 2. Eliminar de la base de datos
    db.delete(db_estudiante)
    db.commit()
    
    return {
        "message": f"Estudiante {id} eliminado exitosamente",
        "id": id
    }


# ==================== INSTRUCCIONES DE USO ====================
"""
1. COPIAR este archivo a tu proyecto backend (ej: routers/estudiantes.py)

2. REEMPLAZAR las siguientes referencias con tus modelos/funciones reales:
   - 'Entidad' → Tu modelo SQLAlchemy para tbl_entidad
   - 'get_db' → Tu función de dependencia para obtener la sesión de DB
   - 'get_password_hash' → Tu función para hashear contraseñas

3. REGISTRAR el router en main.py:
   
   from routers import estudiantes  # O la ruta donde lo guardes
   
   app = FastAPI()
   app.include_router(estudiantes.router)

4. VERIFICAR que tu modelo Entidad tenga estos campos:
   - id (Integer, primary_key)
   - name (String)
   - email (String, unique)
   - domicilio (String, nullable)
   - telefono (String, nullable)
   - password (String)
   - tipo_entidad (String)  ← IMPORTANTE

5. PROBAR los endpoints con curl o Postman:
   
   # Listar estudiantes
   GET http://localhost:8000/api/estudiantes
   
   # Crear estudiante
   POST http://localhost:8000/api/estudiantes/
   Body: {
       "name": "Juan Pérez",
       "email": "juan@example.com",
       "domicilio": "Calle 123",
       "telefono": "1234567890",
       "password": "contraseña123"
   }
   
   # Actualizar estudiante
   PUT http://localhost:8000/api/estudiantes/1
   Body: { "name": "Juan Pérez Modificado", ... }
   
   # Eliminar estudiante
   DELETE http://localhost:8000/api/estudiantes/1
"""
