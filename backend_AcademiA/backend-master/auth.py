from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.encoders import jsonable_encoder
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from sqlalchemy.orm import Session, joinedload # 🚨 Importamos joinedload
from dotenv import load_dotenv
import os
import aiosmtplib
from email.message import EmailMessage
import secrets
from typing import Optional
import json

# Importamos solo User (eliminamos UsuarioTipos)
from models import User 

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
# ENDPOINT DE LOGIN
# ----------------------------------------------------------------------

# Usamos UserLogin como entrada y Token como respuesta
@router.post("/login", response_model=Token)
async def login(request: UserLogin, db: Session = Depends(get_db)):

    # 1. Búsqueda y Validación de credenciales
    # 🚨 Usamos joinedload para cargar la relación rol_sistema_obj
    user = db.query(User).options(joinedload(User.rol_sistema_obj)).filter(User.name == request.name).first()

    if not user:
    # 🚨 Manejo de usuario no encontrado (o credenciales incorrectas)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nombre de usuario o contraseña incorrectos.",
            headers={"WWW-Authenticate": "Bearer"},
    )
    # Capturamos el código del Rol del SISTEMA
    if user.rol_sistema_obj and user.rol_sistema_obj.tipo_roles_usuarios:

        
        # ACCEDEMOS a la nueva relación y al nombre del campo en esa tabla
        current_rol_sistema_code = user.rol_sistema_obj.tipo_roles_usuarios 
        print(f"DEBUG: Código de Rol del Sistema leído de la BD: {current_rol_sistema_code}")
    else:
        raise HTTPException(status_code=500, detail="Error: Rol del Sistema no encontrado para el usuario.")

    access_token = create_access_token(data={
        "sub": user.name, 
        "rol_sistema": current_rol_sistema_code, # USADO AQUÍ
        "id_usuario": user.id_usuario,
        "id_entidad": user.id_entidad 
    })

    if not user or not verify_password(request.password, user.password):
        raise HTTPException(status_code=401, detail="Credenciales inválidas")
    
    if not user.is_email_verified:
        raise HTTPException(status_code=403, detail="El email no está verificado")
        
    # Capturamos el código de rol de la relación
    if user.rol_sistema_obj and user.rol_sistema_obj.tipo_roles_usuarios: # <--- Usar el campo de la tabla Roles del Sistema
        current_rol_sistema_code = user.rol_sistema_obj.tipo_roles_usuarios # Debería ser 'ADMIN_SISTEMA', 'ALUMNO_APP'
        
        # 🚨 Debug: Muestra el código de rol leído
        print(f"DEBUG: Código de Rol del Sistema leído de la BD: {current_rol_sistema_code}")
    
    else:
        # Este 'else' es importante por si el usuario existe pero el rol no está mapeado
        raise HTTPException(status_code=500, detail="Error: Rol del Sistema no encontrado para el usuario.")

    # Si el código de permisos antiguo necesita el atributo 'tipos_usuario' como lista:
    # user.tipos_usuario = [current_rol_code] 

    
    # 2. Generación del Token JWT
    # Usamos el Rol del Sistema en el JWT
    access_token = create_access_token(data={
        "sub": user.name, 
        "rol_sistema": current_rol_sistema_code, # <--- ADMIN_SISTEMA o ALUMNO_APP
        "id_usuario": user.id_usuario,
        "id_entidad": user.id_entidad 
    })

    
    # 3. Preparación de la respuesta (UserAuthData)
    # Creamos el objeto rol para UserAuthData
    tipo_rol_data = TipoRolResponse(cod_tipo_usuario=current_rol_sistema_code)
    
    user_auth_data = UserAuthData(
        id_usuario=user.id_usuario,
        name=user.name,
        rol_sistema=current_rol_sistema_code, # <-- Enviamos el rol del sistema al frontend
        id_entidad=user.id_entidad,
        tipo_rol=tipo_rol_data, # Esto contendrá el rol de la entidad (ej: 'ALUMNO'), si se necesita en el frontend.
        email=user.email,
        is_email_verified=user.is_email_verified
    
    )
    

    # 4. Retorno de la respuesta final (Esquema Token)

    # 4.1 Asignar el diccionario a una variable (response_data)
    response_data = {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_auth_data 
    }
    
    # 🚨 DEBUG: Muestra el JSON FINAL ANTES DE ENVIAR
    from fastapi.encoders import jsonable_encoder
    import json
    
    response_json = jsonable_encoder(response_data)
    print("--------------------------------------------------")
    print("DEBUG: JSON FINAL DE RESPUESTA:")
    print(json.dumps(response_json, indent=4))
    print("--------------------------------------------------")
    
    # 4.2 Retornar la variable de respuesta (SOLO UN RETURN)
    return response_data

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
async def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
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