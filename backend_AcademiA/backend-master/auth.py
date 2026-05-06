from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.encoders import jsonable_encoder
from slowapi import Limiter
from slowapi.util import get_remote_address
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session, joinedload
from dotenv import load_dotenv
import os
import aiosmtplib
from email.message import EmailMessage
import secrets
from typing import Optional
import json

limiter = Limiter(key_func=get_remote_address)

# Importamos solo User (eliminamos UsuarioTipos)
from models import User, TokenBlacklist

# Importamos los nuevos esquemas de Pydantic
from schemas import (
    UserAuthData, 
    UserLogin, 
    Token, 
    EmailVerifyRequest, 
    ForgotPasswordRequest, 
    ResetPasswordRequest,
    # 🚨 Importamos TipoRolResponse (Necesario para construir UserAuthData)
    TipoRolResponse 
) 
from database import localSession 


load_dotenv()

# Configuración
JWT_SECRET = os.getenv('JWT_SECRET') or "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
EMAIL_HOST = os.getenv('EMAIL_HOST')
EMAIL_PORT = int(os.getenv('EMAIL_PORT') or 587)
EMAIL_USER = os.getenv('EMAIL_USER')
EMAIL_PASS = os.getenv('EMAIL_PASS')


# Hasheo de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 para JWT
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

router = APIRouter()

# Dependencia para la base de datos
def get_db():
    db = localSession()
    try:
        yield db
    finally:
        db.close()
    
# Funciones de utilidad
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

# Generar token de verificación o restablecimiento
def generate_token():
    return secrets.token_urlsafe(32)

# Enviar email (no modificado)
async def send_email(to_email: str, subject: str, body: str):
    message = EmailMessage()
    message["From"] = EMAIL_USER
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    await aiosmtplib.send(
        message,
        hostname=EMAIL_HOST,
        port=EMAIL_PORT,
        username=EMAIL_USER,
        password=EMAIL_PASS,
        start_tls=True,
    )

# ----------------------------------------------------------------------
# FUNCIÓN DE VALIDACIÓN DE TOKEN (get_current_user)
# ----------------------------------------------------------------------

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UserAuthData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if is_token_blacklisted(token, db):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token revocado. Iniciá sesión nuevamente.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Decodificación del Token
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        username: str = payload.get("sub")

        # Leer el Rol del Sistema directamente del payload
        rol_sistema_code: str = payload.get("rol_sistema") 
        id_entidad: Optional[int] = payload.get("id_entidad") 

        if username is None or rol_sistema_code is None:    # Comprobamos el rol del sistema
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
        
    # Búsqueda de Usuario y carga del rol relacionado (tipo_rol)
    # 🚨 Usamos joinedload para cargar el rol de forma eficiente
    user = db.query(User).options(joinedload(User.rol_sistema_obj)).filter(User.name == username).first()
    
    if user is None:
        raise credentials_exception
    
    # 🚨 Creamos el objeto rol (Rol de negocio)  para el esquema UserAuthData
    tipo_rol_data = TipoRolResponse(cod_tipo_usuario=rol_sistema_code)
    
    # Retornamos la data en el nuevo esquema UserAuthData
    return UserAuthData(
        id_usuario=user.id_usuario,
        name=user.name,
       # 🚨 CLAVE: Pasar el rol del token (rol_sistema_code)
        rol_sistema=rol_sistema_code, 
        tipo_rol=tipo_rol_data, # if 'tipo_rol_data' in locals() else None, # Rol de negocio
        id_entidad=user.id_entidad,
        email=user.email,
        is_email_verified=user.is_email_verified
    )

# ----------------------------------------------------------------------
# HELPERS DE BLACKLIST
# ----------------------------------------------------------------------

def is_token_blacklisted(token: str, db: Session) -> bool:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    entry = db.query(TokenBlacklist).filter(
        TokenBlacklist.token == token,
        TokenBlacklist.expires_at > now,
    ).first()
    return entry is not None

def revoke_token(token: str, db: Session):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        exp = payload.get("exp")
        expires_at = datetime.fromtimestamp(exp) if exp else datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    except JWTError:
        expires_at = datetime.now(timezone.utc).replace(tzinfo=None) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    db.add(TokenBlacklist(token=token, expires_at=expires_at))
    db.commit()

# ----------------------------------------------------------------------
# ENDPOINT DE LOGOUT
# ----------------------------------------------------------------------

@router.post("/logout")
async def logout(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    revoke_token(token, db)
    return {"detail": "Sesión cerrada correctamente"}

# ----------------------------------------------------------------------
# ENDPOINT DE LOGIN
# ----------------------------------------------------------------------

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
async def login(request: Request, body: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).options(joinedload(User.rol_sistema_obj)).filter(User.name == body.name).first()

    if not user or not verify_password(body.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_email_verified:
        raise HTTPException(status_code=403, detail="El email no está verificado")

    if not user.rol_sistema_obj or not user.rol_sistema_obj.tipo_roles_usuarios:
        raise HTTPException(status_code=500, detail="Rol del sistema no configurado para este usuario.")

    current_rol_sistema_code = user.rol_sistema_obj.tipo_roles_usuarios

    access_token = create_access_token(data={
        "sub": user.name,
        "rol_sistema": current_rol_sistema_code,
        "id_usuario": user.id_usuario,
        "id_entidad": user.id_entidad,
    })

    tipo_rol_data = TipoRolResponse(cod_tipo_usuario=current_rol_sistema_code)
    user_auth_data = UserAuthData(
        id_usuario=user.id_usuario,
        name=user.name,
        rol_sistema=current_rol_sistema_code,
        id_entidad=user.id_entidad,
        tipo_rol=tipo_rol_data,
        email=user.email,
        is_email_verified=user.is_email_verified,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_auth_data,
    }

# ----------------------------------------------------------------------
# ENDPOINTS ADICIONALES (Sin cambios mayores, excepto TipoRolResponse)
# ----------------------------------------------------------------------

@router.post("/api/verify-email")
async def verify_email(request: EmailVerifyRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == request.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Token inválido")
    user.is_email_verified = True
    user.reset_token = None
    db.commit()
    return {"detail": "Email verificado correctamente"}

@router.post("/api/forgot-password")
@limiter.limit("5/minute")
async def forgot_password(request: Request, body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    reset_token = generate_token()
    user.reset_token = reset_token
    db.commit()
    reset_url = f"http://localhost:8000/reset-password?token={reset_token}"
    await send_email(
        to_email=user.email,
        subject="Restablecer contraseña",
        body=f"Haga clic en el siguiente enlace para restablecer su contraseña: {reset_url}"
    )
    return {"detail": "Se ha enviado un enlace para restablecer la contraseña"}

@router.post("/api/reset-password")
async def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == request.token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Token inválido")
    user.password = get_password_hash(request.new_password)
    user.reset_token = None
    db.commit()
    return {"detail": "Contraseña restablecida correctamente"}

@router.get("/api/test-email")
async def test_email():
    try:
        await send_email(
            to_email="sistema.academia.25@gmail.com", 
            subject="Prueba de envío de correo",
            body="Este es un correo de prueba desde FastAPI."
        )
        return {"message": "Correo enviado correctamente"}
    except Exception as e:
        return {"error": str(e)}