#   backend-master\backend-master\main.py

# Importamos FastAPI para crear la aplicación
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlalchemy.exc import SQLAlchemyError

# Importamos OAuth2PasswordBearer para autenticación con JWT
from fastapi.security import OAuth2PasswordBearer

# Importamos Session para manejar la base de datos
from sqlalchemy.orm import Session

# Importamos módulos locales para CRUD y autenticación
import crud
import auth

from Routes import  routes_docentes, routes_inasistencias
from Routes.routes_notificaciones import router as router_notificaciones
from Routes.routes_configuracion import router as router_configuracion
from Routes.routes_formatos import router as router_formatos

from Routes.routes_materias import router as materias_router
from Routes.routes_periodos import router as periodos_router
from Routes.routes_estudiantes import router as routes_estudiantes
from Routes.routes_notas import router as notas_router
from Routes.routes_estudiantes_notas import router as routes_estudiantes_notas
from Routes.routes_ciclos import router as router_ciclos  # Para traer los ciclos lectivos
from Routes.routes_cursos import router as router_cursos  # Para traer los cursos
from Routes.routes_personal import router as router_personal
from Routes.routes_usuarios import router as router_usuarios
from Routes.routes_inscripciones import router as router_inscripciones
from Routes.routes_previas import router as router_previas
from Routes.routes_informes import router as router_informes
from Routes.routes_dashboard import router as router_dashboard

from auth import send_email, get_password_hash, generate_token

# Importamos localSession para la base de datos
from database import localSession

# Importamos los esquemas necesarios para validar y serializar datos 
from schemas import (
    UserCreate, 
    UserAuthData, 
    Token, 
    EmailVerifyRequest, 
    ForgotPasswordRequest, 
    ResetPasswordRequest, 
    Entidad, 
    #   EstudianteResponse,
    #   EstudianteCreate,
    #   EstudianteUpdate,
    #   DocenteResponse,
    #   DocenteCreate,
    #   DocenteUpdate,
    #   Habilitarlas si se necesitan en otros endpoints que se quedan en main.py.
)


# Importamos CORSMiddleware para habilitar CORS
from fastapi.middleware.cors import CORSMiddleware

#from typing import List
from models import (
    Entidad as EntidadORM,
    #   NombreMateria,
    #   Materia,
    #   Inscripcion
)



   
# Rate limiter — identifica clientes por IP
limiter = Limiter(key_func=get_remote_address)

from models import Base, TokenBlacklist, Notificacion, NotificacionConfig, ConfiguracionSistema, FormatoConfig, ConfiguracionCambioLog
from database import engine

# Creamos la instancia de FASTAPI
import os
_env = os.getenv("ENVIRONMENT", "development")
app = FastAPI(
    title="AcademIA API",
    description="API para el sistema académico",
    version="1.0.0",
    docs_url="/docs" if _env != "production" else None,
    redoc_url="/redoc" if _env != "production" else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS debe registrarse antes que cualquier router para que aplique a los preflight requests
# allow_origin_regex cubre todos los preview deployments de Vercel (hashes únicos por deploy)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:3001',
        'http://localhost:1500',
        'http://localhost:3002',
        'https://academia-nu-seven.vercel.app',
    ],
    allow_origin_regex=r'https://academ.*\.vercel\.app',
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = [{"campo": e["loc"][-1], "mensaje": e["msg"]} for e in exc.errors()]
    return JSONResponse(status_code=422, content={"detail": errors})


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    return JSONResponse(status_code=500, content={"detail": "Error de base de datos. Intente nuevamente."})


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        raise exc
    return JSONResponse(status_code=500, content={"detail": "Error interno del servidor."})

@app.on_event("startup")
def create_tables_on_startup():
    Base.metadata.create_all(
        bind=engine,
        tables=[
            TokenBlacklist.__table__,
            Notificacion.__table__,
            NotificacionConfig.__table__,
            ConfiguracionSistema.__table__,
            FormatoConfig.__table__,
            ConfiguracionCambioLog.__table__,
        ],
    )


# Create table database
# ase.metadata.create_all(bind=engine)


# Rutas de autenticación definidas en auth.py
app.include_router(auth.router, prefix="/api", tags=["Autenticación"])

# Esquema OAuth2 para autenticación (definido en auth.py)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

# INCLUIR ROUTERS CON EL OBJETO 'router' DE CADA ARCHIVO
#   Endpoint para listar alumnos: http://localhost:8000/api/estudiantes/
app.include_router(
    routes_estudiantes, 
    prefix="/api/estudiantes", 
    tags=["Estudiantes"]
    )

app.include_router(notas_router, prefix="/api", tags=["Notas"])
app.include_router(routes_docentes.router, prefix="/api/docentes", tags=["Docentes"]) 
app.include_router(routes_inasistencias.router, prefix="/api", tags=["Asistencias"])
app.include_router(materias_router, prefix="/api/materias", tags=["Materias"])
app.include_router(periodos_router, prefix="/api/periodos", tags=["Períodos"])
# http://localhost:8000/api/cursos
app.include_router(router_cursos, prefix="/api")
# http://localhost:8000/api/ciclos
app.include_router(router_ciclos, prefix="/api")

app.include_router(router_personal, prefix="/api")

app.include_router(routes_estudiantes_notas, prefix="/api", tags=["Notas"])

app.include_router(router_usuarios, prefix="/api/usuarios")
app.include_router(router_notificaciones, prefix="/api")
app.include_router(router_inscripciones, prefix="/api")
app.include_router(router_previas, prefix="/api", tags=["Materias Previas"])
app.include_router(router_informes, prefix="/api", tags=["Informes y Listados"])
app.include_router(router_configuracion, prefix="/api/configuracion", tags=["Configuración del Sistema"])
app.include_router(router_formatos, prefix="/api/formatos-impresion", tags=["Formatos de Impresión"])
#  app.include_router(router_dashboard, prefix="/api", tags=["Dashboard"])
app.include_router(router_dashboard, prefix="/api", tags=["Dashboard"])




# # Dependencia para la base de datos
def get_db():
    db = localSession()
    try:
        yield db
    finally:
        db.close()

# Ruta raiz
@app.get("/")
def root():
    return 'iniciando api... - ESTOY EN LA CARPETA CORRECTA - V2'

# Registro
@app.post("/api/register", response_model=UserAuthData)
@limiter.limit("5/minute")
async def register(request: Request, user: UserCreate, db: Session = Depends(get_db)):
    # Crea el usuario usando la función CRUD
    db_user, verification_token = crud.c_create_user(db, user)
    # Enviar email de verificación
    verification_url = f"http://localhost:3001/#/verify-email?token={verification_token}"
    await send_email(
        to_email=user.email,
        subject="Verifica tu email",
        body=f"Haz clic para verificar tu email: {verification_url}"
    )
    # Añade tipos_usuario a la respuesta
    db_user.tipos_usuario = [ut.cod_tipo_usuario for ut in db.query(auth.UsuarioTipos).filter(auth.UsuarioTipos.usuario_id == db_user.id).all()]
    return db_user


# Endpoint para listar todos los usuarios (solo para administradores)
@app.get("/api/users", response_model=list[UserAuthData])
async def get_users(current_user: UserAuthData = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Llama a la función CRUD para obtener todos los usuarios
    return crud.c_get_users(db, current_user)

# Endpoint para obtener un usuario por ID
@app.get("/api/users/{user_id}", response_model=UserAuthData)
async def get_user(user_id: int, current_user: UserAuthData = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Llama a la función CRUD para obtener el usuario, aplicando reglas de permisos
    return crud.c_get_user(db, user_id, current_user)

# Endpoint para crear un nuevo usuario
@app.post("/api/users", response_model=UserAuthData)
async def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Llama a la función CRUD para crear el usuario
    db_user, _ = crud.c_create_user(db, user)
    db_user.tipos_usuario = [ut.cod_tipo_usuario for ut in db.query(auth.UsuarioTipos).filter(auth.UsuarioTipos.usuario_id == db_user.id).all()]
    return db_user



# Endpoint para actualizar un usuario existente
@app.put("/api/users/{user_id}", response_model=UserAuthData)
async def update_user(user_id: int, user: UserCreate, current_user: UserAuthData = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Llama a la función CRUD para actualizar el usuario
    db_user = crud.c_update_user(db, user_id, user, current_user)
    db_user.tipos_usuario = [ut.cod_tipo_usuario for ut in db.query(auth.UsuarioTipos).filter(auth.UsuarioTipos.usuario_id == db_user.id).all()]
    return db_user


# Endpoint para eliminar un usuario
@app.delete("/api/users/{user_id}")
async def delete_user(user_id: int, current_user: UserAuthData = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Llama a la función CRUD para eliminar el usuario
    return crud.c_delete_user(db, user_id, current_user)


# Endpoint para obtener una entidad por ID (nuevo, para tbl_entidad)
@app.get("/api/entidades/{entidad_id}", response_model=Entidad)
async def get_entidad(entidad_id: int, current_user: UserAuthData = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    
    # Usamos la sintaxis correcta del rol para verificar permisos
    # rol_actual = current_user.tipo_rol.tipo_roles_usuarios
    rol_actual = current_user.tipo_rol.tipo_entidad

    # Verifica que el usuario tenga permisos (ADM o DOC)
    if rol_actual not in ['ADMIN_SISTEMA', 'DOCENTE_APP', 'ALUMNO_APP']: # Usa los valores de la BD
        raise HTTPException(status_code=403, detail="No tienes permiso para ver entidades")
    
    # Consulta la entidad en la base de datos
    entidad = db.query(EntidadORM).filter(EntidadORM.id_entidad == entidad_id, EntidadORM.deleted_at.is_(None)).first()
    if not entidad:
        raise HTTPException(status_code=404, detail="Entidad no encontrada")
    # Convierte el campo tipos_entidad (texto separado por comas) en una lista
    entidad.tipos_entidad = entidad.tipos_entidad.split(',') if entidad.tipos_entidad else []
    return entidad

# ==================== MIGRACIÓN DE BASE DE DATOS ====================
from sqlalchemy import text

@app.get("/api/migrate")
async def migrate_db(db: Session = Depends(get_db)):
    """
    Endpoint temporal para actualizar la estructura de la base de datos.
    Agrega las columnas email, domicilio y telefono a tbl_entidad.
    """
    try:
        # Intentar agregar columna email
        try:
            db.execute(text("ALTER TABLE tbl_entidad ADD COLUMN email VARCHAR(100)"))
        except Exception as e:
            print(f"Columna email ya existe o error: {e}")
            
        # Intentar agregar columna domicilio
        try:
            db.execute(text("ALTER TABLE tbl_entidad ADD COLUMN domicilio VARCHAR(200)"))
        except Exception as e:
            print(f"Columna domicilio ya existe o error: {e}")
            
        # Intentar agregar columna telefono
        try:
            db.execute(text("ALTER TABLE tbl_entidad ADD COLUMN telefono VARCHAR(50)"))
        except Exception as e:
            print(f"Columna telefono ya existe o error: {e}")

        # Intentar agregar columna fec_nac
        try:
            db.execute(text("ALTER TABLE tbl_entidad ADD COLUMN fec_nac DATE"))
        except Exception as e:
            print(f"Columna fec_nac ya existe o error: {e}")
            
        db.commit()
        return {"message": "Migración completada. Columnas agregadas si no existían."}
    except Exception as e:
        return {"error": str(e)}
    


