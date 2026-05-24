# backend_AcademiA\backend-master\schemas.py

# Nomenclatura de Prefijos o SUFIJOS
#   - Base: Para los campos que están en todas las versiones (comunes).
#   - Create / Update: Para los datos que entran desde el Frontend (sin IDs).
#   - Simple / List: Para listados rápidos (sin relaciones pesadas).
#   - Relacional / Full: Para cuando necesitas toda la anidación (Curso > Ciclo > Plan).


# Importamos las clases y tipos necesarios de Pydantic para definir esquemas
from pydantic import BaseModel, EmailStr, Field, computed_field, field_serializer, field_validator
from typing import Optional, List, Any, Dict
from datetime import date, datetime
import re

class PagedResponse(BaseModel):
    data: List[Any]
    total: int
    skip: int
    limit: int

    class Config:
        from_attributes = True


def validate_password_strength(v: str) -> str:
    if len(v) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres")
    if not re.search(r"\d", v):
        raise ValueError("La contraseña debe contener al menos un número")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=/\\]", v):
        raise ValueError("La contraseña debe contener al menos un carácter especial")
    return v


# =========================================================================
# NUEVOS ESQUEMAS DE ROL
# =========================================================================

class TipoRolResponse(BaseModel):
    tipo_entidad: str = Field(alias="cod_tipo_usuario")
    # La variable Python es tipo_entidad
    class Config:
        populate_by_name = True


# =========================================================================
# ESQUEMAS CENTRALES DE AUTENTICACIÓN 
# =========================================================================

# 1. Esquema de Entrada para Login (Lo que el cliente envía)
class UserLogin(BaseModel):
    name: str  # Nombre de usuario
    password: str # Contraseña

# 2. Esquema de Carga Útil del Token y Respuesta de Usuario
class UserAuthData(BaseModel):
    id_usuario: int
    name: str
    email: EmailStr
    is_email_verified: bool
    
    # Rol del Sistema (directamente del JWT)
    rol_sistema: Optional[str] = None # Contendrá "ADMIN_SISTEMA", "ALUMNO_APP", etc.
    
    # Relación TipoRol para la Entidad de Negocios
    tipo_rol: Optional[TipoRolResponse] = None
    
    # ID de la entidad (opcional, NULL para Admins Puros)
    id_entidad: Optional[int] = None 
    
    # Campos de gestión de cuentas
    email: Optional[EmailStr] = None 
    is_email_verified: bool
    
    class Config:
        # Permite a Pydantic mapear los campos desde el modelo ORM (SQLAlchemy)
        from_attributes = True # En Pydantic v2+ es from_attributes=True, si usas v1 es orm_mode=True

# 3. Esquema de Respuesta del Login
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    # Incluimos los datos de usuario para que el frontend sepa quién es y qué rol tiene
    user: UserAuthData 

# =========================================================================
# ESQUEMAS DE GESTIÓN DE CUENTAS
# =========================================================================

# Esquema para crear un nuevo usuario
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    tipo_rol_code: Optional[str] = 'ALUMNO_APP'
    id_entidad: Optional[int] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        return validate_password_strength(v)

    class Config:
        from_attributes = True

# Esquema para la solicitud de olvido de contraseña
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

# Esquema para la solicitud de restablecimiento de contraseña
class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v):
        return validate_password_strength(v)

# Esquema para la solicitud de verificación de email
class EmailVerifyRequest(BaseModel):
    token: str

# =========================================================================
# ESQUEMAS DE TABLA
# =========================================================================

class ColumnaHeader(BaseModel):
    id_tipo_nota: int
    label: str  # Ejemplo: "1°T", "DIC"

class AlumnoNotaRow(BaseModel):
    id_alumno: int
    nombre_completo: str
    # Diccionario donde la llave es el id_tipo_nota y el valor la nota o null
    calificaciones: Dict[int, Optional[float]] 
    promedio: Optional[float] = None
    definitiva: Optional[float] = None

class PlanillaActaResponse(BaseModel):
    # metadata: Dict[str, str] # Curso, Materia, Ciclo, Docente
    columnas: List[ColumnaHeader]
    filas: List[AlumnoNotaRow]


# =========================================================================
#                       ESQUEMAS DE NEGOCIO 
# =========================================================================

# =========================================================================
# === ESQUEMAS PARA TIOS DE ENTIDADES ===
# =========================================================================

class TipoEntidad(BaseModel):
    id_tipo_entidad: int
    tipo_entidad: str        # El nombre de la columna en BD
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# =========================================================================
# === ESQUEMAS PARA ENTIDADES ===
# =========================================================================

class EntidadSimple(BaseModel):
    id_entidad: int             
    nombre: str
    apellido: str                  
    
    class Config:
        from_attributes = True

class Entidad(BaseModel):
    id_entidad: int             
    nombre: str                 
    apellido: str               
    email: Optional[str] = None
    domicilio: Optional[str] = None
    
    class Config:
        from_attributes = True

class EntidadTipoResponse(BaseModel):
    id_tipo_entidad: int
    nombre: str
    apellido: str                 

    class Config:
        from_attributes = True


# ----------- Esquema con Tipo de Entidad Anidado ----------- 
class EntidadTipoEntidad(EntidadTipoResponse):
    # Usamos el esquema TipoEntidad para que traiga el objeto completo
    tipo_entidad_rel: Optional[TipoEntidad] = None
    
    class Config:
        from_attributes = True


# =========================================================================
# === ESQUEMAS PARA ESTUDIANTES (EstudiantesRoutes) ===
# =========================================================================

class EstudianteSimple(BaseModel):
    id_entidad: int
    nombre: str
    apellido: str
    
    # En la clase que hace el response, se pone el Class Config
    class Config:
        from_attributes = True
        
class EstudianteBase(BaseModel):
    nombre: str
    apellido: str
    fec_nac: Optional[date] = None
    email: Optional[str] = None
    domicilio: Optional[str] = None
    telefono: Optional[str] = None
    dni: Optional[int] = None
    
class EstudianteCreate(EstudianteBase):
    pass

class EstudianteUpdate(EstudianteBase):
    # Sobrescribimos para que dejen de ser obligatorios
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    

class EstudianteResponse(EstudianteBase):
    id_entidad: int
    name: str # Campo calculado: "Apellido, Nombre"
    
    # En la clase que hace el response, se pone el Class Config
    class Config:
        from_attributes = True


# =========================================================================
# === ESQUEMAS PARA DOCENTES  ===
# =========================================================================

# Para listados rápidos o anidamiento
class DocenteSimple(BaseModel):
    id_entidad: int
    nombre: str
    apellido: str

    class Config:
        from_attributes = True

# Esquema base con campos comunes para validación
class DocenteBase(BaseModel):
    # str, int, date: Python obliga a que los datos tengan ese tipo.
    # Optional[...] = None: indica que el campo no es obligatorio. Si el frontend no lo envía, la base 
    # de datos no recibirá un error, sino un valor nulo o vacío
    nombre: str 
    apellido: str
    fec_nac: Optional[date] = None
    # Le ponemos valor por defecto para que no "exlote" si no tiene DNI la BD
    dni: int = 0    
    # Usamos EmailStr para validar formato
    email: Optional[EmailStr] = None 
    domicilio: str = "No especificado"
    localidad: str = "No especificada"
    nacionalidad: str= "No especificada"
    telefono: Optional[str] = "-"
    cel: str = "-"
    created_at: Optional[datetime] = None


# Para CREAR
class DocenteCreate(DocenteBase):
    pass

# Para ACTUALIZAR: Flexibilidad total heredando de BaseModel, haciendo todo opcional
class DocenteUpdate(BaseModel):
     nombre: Optional[str] = None
     apellido: Optional[str] = None
     fec_nac: Optional[date] = None 
     telefono: Optional[str] = None
     domicilio: Optional[str] = None
     localidad: Optional[str] = None
     nacionalidad: Optional[str] = None
     email: Optional[EmailStr] = None 
     cel: Optional[str] = None
     created_at: Optional[datetime]

# Para RESPONDER (Salida de API)
class DocenteResponse(DocenteBase):
    id_entidad: int # Usamos el nombre real de la PK en t_entidad
   
    # Campos calculados
    @computed_field
    @property
    def tel_cel(self) -> str:
        partes = [p for p in [self.telefono, self.cel] if p]
        return " / ".join(partes) if partes else "-"

    @computed_field
    @property
    def nombre_completo(self) -> str:
        return f"{self.apellido}, {self.nombre}"

    class Config:
        from_attributes = True



"""

# =========================================================================
# === ESQUEMAS PARA PERSONAL (se usa en routes_personal) ===
# =========================================================================

class PersonalBase(BaseModel):
    nombre: str
    apellido: str
    fec_nac: Optional[date] = None
    email: Optional[str] = None
    domicilio: Optional[str] = None
    telefono: Optional[str] = None
    cel: Optional[str]
    tipo_entidad: str # Aquí guardaremos el texto 'ALU', 'DOC', etc.


class PersonalCreate(PersonalBase):
    pass

class PersonalUpdate(PersonalBase):
     nombre: Optional[str] = None
     apellido: Optional[str] = None

class PersonalResponse(PersonalBase):
    id: int
    name: str

    
    class Config:
        from_attributes = True
"""

# =========================================================================
#   === Esquema para NOTAS. 
# =========================================================================

# Esquema para creación (Input desde el Front-end)
class NotaCreate(BaseModel):
    # Campos requeridos que vienen del formulario (CargarNotaIndividual.jsx)
    id_materia: int = Field(..., description="ID de la materia calificada.")
    id_entidad_estudiante: int = Field(..., description="ID del estudiante calificado.")
    nota: float = Field(..., ge=1.0, le=10.0, description="Calificación obtenida (entre 1.0 y 10.0).")
    id_periodo: int = Field(..., description="ID del período (trimestre, semestre, etc.)")
    id_ciclo_lectivo: Optional[int] = Field(None, description="ID del ciclo lectivo. Si no se envía, se deriva de la materia.")

    class Config:
        from_attributes = True

# Esquema para respuesta (Output hacia el Front-end)
class NotaResponse(NotaCreate):
    # Campos que la DB asigna automáticamente
    id_nota: int = Field(..., description="ID único autogenerado de la nota.")
    id_entidad_carga: int = Field(..., description="ID de la entidad docente/usuario que cargó la nota.")
    id_tipo_nota: int = Field(..., description="Tipo de nota (ej: Normal, Recuperatorio).")
    fecha_carga: date = Field(..., description="Fecha en que se cargó la nota.")
    id_ciclo_lectivo: Optional[int] = None

    class Config:
        from_attributes = True

# Esquema para Respuesta Notas de Estudiantes
class NotaEstudianteResponse(BaseModel):
    id_entidad_estudiante: int
    alumno: str
    nota: float

    class Config:
        from_attributes = True

# Esquema para Planilla de calificaciones
class PlanillaCalificacionesResponse(BaseModel):
    alumno: EstudianteResponse
    
    # Notas del pivoteo
    t1: Optional[float] = None
    t2: Optional[float] = None
    t3: Optional[float] = None
    prom: Optional[float] = None
    dic: Optional[float] = None
    feb: Optional[float] = None
    definitiva: Optional[float] = None

    class Config:
        from_attributes = True

# Esquema para Upsert de notas en carga de notas
class NotaUpsert(BaseModel):
    id_alumno: int
    id_materia: int
    id_tipo_nota: int
    valor: Optional[float] = None
    id_periodo: int  # Requerido: forma parte de la clave de upsert junto con alumno+materia+tipo_nota
    # Campos adicionales
    id_ciclo_lectivo: Optional[int] = None  # Si no se envía, se deriva de la materia
    id_curso: Optional[int] = None
    id_entidad_carga: Optional[int] = None


# Esquema para representa una materia con sus notas, mapeadas por tipo_nota
class MateriaNotaRow(BaseModel):
    id_materia: int
    nombre_materia: str
    calificaciones: Dict[int, Optional[float]] # {id_tipo_nota: valor}
    promedio: Optional[float]
    definitiva: Optional[float]

# Esquema para respuesta final del endpoint, materia con sus notas
class InformeAcademicoEstudianteResponse(BaseModel):
    columnas: List[ColumnaHeader]
    filas: List[MateriaNotaRow]

    class Config:
        from_attributes = True

# Esquema para enviar t_tipo_nota.tipo_nota y t_nota.nota. 
# Se usa en SubjectCars, para pasasr los datos a SubjectEvaluationHistory
class NotaDetalle(BaseModel):
    tipo_nota: str
    # fecha_carga: Optional[date]
    nota: float
    id_periodo: int

    class Config:
        from_attributes = True


# Esquema para enviar t_tipo_nota.tipo_nota, t_nota.nota y t_nota.fecha_carga formateado
# Se usa en SubjectEvaluationHistory, para pasasr los datos a SubjectEvaluationHistoryDetail
class NotaTipoDetalle(BaseModel):
    tipo_nota: str
    fecha_carga: Optional[date]
    nota: float

    # Decorador: le dice a FastAPI cómo transformar el campo fecha_carga al enviarlo
    @field_serializer('fecha_carga')
    def serialize_dt(self, fecha_carga: date):
        # %d/%m/%y genera dd/mm/aa (ej: 15/01/26)
        # Si prefieres el año con 4 números (2026), usa %Y en mayúscula
        return fecha_carga.strftime('%d/%m/%Y')

    class Config:
        from_attributes = True


# ----------------------------------------------------
#   === Esquema para Inasistencias === 
# ----------------------------------------------------

# Esquema simple, para relaiones
class InasistenciaSimple(BaseModel):
    id_inasistencia: int

    class Config:
        from_attributes = True

# Esquema Base, para el detalle individual de cada inasistencia
# Representa inasistencia de UN SOLO DIA
class InasistenciaBase(BaseModel):
    date: str
    type: str
    value: float
    justified: bool
    reason: str

    class Config:
        from_attributes = True

# Esquema para Respuesta.
# Representa una lista de inasistencias (lista de las InasistenciaBase)
class InasistenciaResponse(BaseModel):
    totalInasistencia: float
    totalInasistenciaJustif: float
    # Definimos que detailedRecords es una LISTA de objetos InasistenciaBase
    detailedRecords: List[InasistenciaBase]

    class Config:
        from_attributes = True

# ----------------------------------------------------
#   === Esquema para Plan === 
# ----------------------------------------------------

# Esquema simple (para relaciones anidadas)
# Para cuando Plan es hijo de otra entidad (ej: ciclo)
class PlanSimple(BaseModel):
    id_plan: int
    nombre_plan: str

    # Se pone from_attributes = True porque se lee de la base de datos
    class Config:
        from_attributes = True    

# Esquema base con campos comunes. Tiene la lógica de negocio. 
class PlanBase(BaseModel):
    nombre_plan: str 
    vigencia_desde: date 
    vigencia_hasta: Optional[date] = None
    resolucion_nro: str

# Para CREAR: Se pide lo que está en base (sin ID)
class PlanCreate(PlanBase):
    pass 

# Para ACTUALIZAR: todo es opcional, para que no obligue a cambiarlo
# Heredar de BaseModel es la mejor opción para Update. Lo hace totalmente flexible.
class PlanUpdate(BaseModel):
    nombre_plan: Optional[str] = None
    vigencia_desde: Optional[date] = None
    vigencia_hasta: Optional[date] = None
    resolucion_nro: Optional[str] = None
    

# Para RESPONDER: lo que se envía al Frontend. Devuelve ID + todo lo de PlanBase
class PlanResponse(PlanBase):
    id_plan: int

    # Se pone from_attributes = True porque se lee de la base de datos
    class Config:
        from_attributes = True 


# ----------------------------------------------------
#   === Esquema para Ciclos Lectivos === 
# ----------------------------------------------------

# Esquema simple
class CicloLectivoSimple(BaseModel):
    id_ciclo_lectivo: int
    nombre_ciclo_lectivo: str
    
    class Config:
        from_attributes = True

# Esquema base con campos comunes
class CicloLectivoBase(BaseModel):
    nombre_ciclo_lectivo: str
    fecha_inicio_cl: Optional[date] = None
    fecha_fin_cl: Optional[date] = None
    id_plan: Optional[int] = None

# Para CREAR: Solo se pide lo que está en la base (sin ID)
class CicloLectivoCreate(CicloLectivoBase):
    pass 

# Para ACTUALIZAR: hereda atributos de BaseModel. Todos los campos opcionales.
class CicloLectivoUpdate(BaseModel):
    nombre_ciclo_lectivo: Optional[str] = None
    fecha_inicio_cl: Optional[date] = None
    fecha_fin_cl: Optional[date] = None
    id_plan: Optional[int] = None
    
# Para RESPONDER: se le suma el ID al CicloLectivoBase
class CicloLectivoResponse(CicloLectivoBase):
    id_ciclo_lectivo: int

    class Config:
        from_attributes = True # Esto permite leer modelos de SQLAlchemy


# ----------- Esquema para Ciclo Lectivo y Plan anidado ----------- 
class CicloLectivoPlan(CicloLectivoSimple):
    # Esto trae los datos de t_plan. FastAPI busca el objeto 'plan' dentro de 'ciclo'
    plan: PlanSimple  

    class Config:
        from_attributes = True


# ----------------------------------------------------
#   === Esquema para Cursos === 
# ----------------------------------------------------

# Lo básico que se necesita para un curso
class CursoSimple(BaseModel):
    id_curso: int
    curso: str
    
    class Config:
        from_attributes = True
    
# Esquema base con campos comunes
class CursoBase(BaseModel):
    curso: str
    created_at: Optional[Any] = None
    updated_at: Optional[Any] = None
    id_ciclo_lectivo: Optional[int] = None

# Para CREAR: Solo se pide lo que está en la base (sin ID)
class CursoCreate(CursoBase):
    pass 

# Para ACTUALIZAR: hereda atributos de BaseModel. Todos los campos opcionales.
# No permite update a Created_at y updated_at, porque son campos de auditoría
class CursoUpdate(BaseModel):
    curso: Optional[str] = None
    id_ciclo_lectivo: Optional[int] = None

# Para RESPONDER: lo que se envía al Frontend (se agregan los restantes datos de Base)
class CursoResponse(CursoBase):
    id_curso: int

    class Config:
        from_attributes = True


# ----------- Esquema Curso Anidado ----------- 
class CursoCicloLectivo(CursoSimple):
    ciclo: CicloLectivoPlan # Debe relacionarse con el anidado para plan
    
    class Config:
        from_attributes = True
        
 
# ----------------------------------------------------
#   === Esquema para Materias === 
# ----------------------------------------------------

# Materia simple, para relaciones
class MateriaSimple(BaseModel):
    id_materia: int
    id_nombre_materia: int

    class Config:
        from_attributes = True

# Por claridad, extrae el nombre de t_nombre_materia
class NombreMateriaSimple(BaseModel):
    nombre_materia: str

    class Config:
        from_attributes = True

# Esquema de Materia Base
class MateriaBase(BaseModel):
    id_nombre_materia: int
    id_curso: int
    id_entidad: Optional[int] = None  # ID del Docente — opcional, puede ser None

# Para CREAR (Solo lo que está Base)
class MateriaCreate(MateriaBase):
    pass

# Para Actualizar. Heredamos de BaseModel para que sea opcional
class MateriaUpdate(BaseModel):
    id_nombre_materia: Optional[int] = None
    id_curso: Optional[int] = None
    id_entidad: Optional[int] = None
    
# Para RESPONDER: se agregan los restantes datos de Base
class MateriaResponse(MateriaBase):
    id_materia: int

    # --- CAMPOS CALCULADOS PARA LA TABLA ---
    @computed_field
    @property
    def docente_nombre_completo(self) -> str:
        if self.docente:
            return f"{self.docente.apellido}, {self.docente.nombre}"
        return "Sin asignar"
    
    # Agregamos las relaciones anidadas
    nombre: Optional[NombreMateriaSimple] = None
    # Relación con el curso (ya trae Ciclo y Plan anidados)
    curso: Optional[CursoCicloLectivo] = None
    docente: Optional[Entidad] = None

    class Config:
        from_attributes = True
        
# Materias sólo id y nombre.
class MateriaSimpleResponse(BaseModel):
    id_materia: int
    nombre_materia: str

    class Config:
        from_attributes = True

# Catálogo de nombres de materias (t_nombre_materia)
class NombreMateriaResponse(BaseModel):
    id_nombre_materia: int
    nombre_materia: str

    class Config:
        from_attributes = True

# Respuesta detallada de una materia para el modal de curso (POST/PUT)
class MateriaDetalleResponse(BaseModel):
    id_materia: int
    id_nombre_materia: int
    id_curso: int
    id_entidad: Optional[int] = None
    nombre_materia: str
    docente: str

    class Config:
        from_attributes = True
 
# =========================================================================
#   === Esquema para TIPOS DE INSCRIPCIONES. 
# =========================================================================

# Esquema simple, para relaiones
class TiposInscripcionesSimple(BaseModel):
    id_tipo_insc: int
    nombre_tipo_insc: str

    class Config:
        from_attributes = True

# =========================================================================
#   === Esquema para INSCRIPCIONES. 
# =========================================================================

# Esquema simple, para relaiones
class InscripcionesSimple(BaseModel):
    id_inscripcion: int

    class Config:
        from_attributes = True

# Esquema de Inscripciones Base (todos los campos básicos)
class InscripcionesBase(BaseModel):
    id_entidad: int # ID del Alumno
    id_materia: int
    id_tipo_insc: int 
    fecha_insc: date
    id_ciclo_lectivo: int

# Para RESPONDER: los campos base + id.
# Se incluyen las relaciones, ya que al responder se mandan los datos anidados
class InscripcionesResponse(InscripcionesBase):
    id_inscripcion: int

    # Relaciones con otros esquemas

    #   Los nombres (estudiantes, materia, etc) deben coincidir con los nombres 
    #   de las relationship del modelo "Inscripcion" (en models.py)
    estudiantes: Optional[EstudianteSimple] = None
    materia: Optional[MateriaSimple] = None
    tipo_inscripcion: Optional[TiposInscripcionesSimple] = None
    ciclo_lectivo: Optional[CicloLectivoSimple] = None

# Para CREAR (Solo lo que está Base)
class InscripcionesCreate(InscripcionesBase):
    pass 

# Para Actualizar. Heredamos de BaseModel para que sea todo opcional
class InscripcionesUpdate(BaseModel):
    id_entidad: Optional[int] = None # ID del Alumno
    id_materia: Optional[int] = None
    id_tipo_inc: Optional[int] = None
    fecha_insc: Optional[date] = None
    id_ciclo_lectivo: Optional[int] = None

    class Config:
        from_attributes = True


# ============================================================
#   ESQUEMAS PARA NOTIFICACIONES (t_notificaciones)
# ============================================================

class NotificacionCreate(BaseModel):
    id_usuario_destino: int
    mensaje: str
    tipo: str = 'sistema'   # 'nota', 'inasistencia', 'inscripcion', 'sistema'


class NotificacionResponse(BaseModel):
    id: int
    id_usuario_destino: int
    mensaje: str
    tipo: str
    leida: bool
    timestamp: datetime

    class Config:
        from_attributes = True


class MarcarLeidaRequest(BaseModel):
    ids: List[int]   # Lista de IDs de notificaciones a marcar como leídas


# ============================================================
#   ESQUEMAS PARA CONFIGURACIÓN DE NOTIFICACIONES (t_notif_config)
# ============================================================

class NotifConfigItem(BaseModel):
    tipo: str
    activa: bool

    class Config:
        from_attributes = True


class NotifConfigResponse(BaseModel):
    id: int
    id_usuario: int
    tipo: str
    activa: bool

    class Config:
        from_attributes = True


class NotifConfigUpdate(BaseModel):
    # Lista de preferencias a actualizar (upsert)
    preferencias: List[NotifConfigItem]


# =========================================================================
# SCHEMAS DE CONFIGURACIÓN DEL SISTEMA
# =========================================================================

class ConfigSistemaResponse(BaseModel):
    configs: Dict[str, Optional[str]]

    class Config:
        from_attributes = True


class ConfigSistemaUpdate(BaseModel):
    configs: Dict[str, str]


class LogoUpload(BaseModel):
    datos_base64: str
    mime_type: str
    nombre_archivo: str
    ancho_px: Optional[int] = None
    alto_px: Optional[int] = None


# =========================================================================
# SCHEMAS DE FORMATOS DE IMPRESIÓN
# =========================================================================

class FormatoConfigResponse(BaseModel):
    codigo: str
    configs: Dict[str, Optional[str]]

    class Config:
        from_attributes = True


class FormatoConfigUpdate(BaseModel):
    configs: Dict[str, str]


# =========================================================================
# SCHEMAS DE MODO DE INSCRIPCIÓN
# =========================================================================

class ModoInscripcionUpdate(BaseModel):
    modo: str  # Valores válidos: 'MATERIA' o 'CURSO'
    motivo: Optional[str] = None  # Justificación del cambio (queda en el log)

    @field_validator("modo")
    @classmethod
    def modo_valido(cls, v: str) -> str:
        if v not in ("MATERIA", "CURSO"):
            raise ValueError("El modo debe ser 'MATERIA' o 'CURSO'.")
        return v


class ConfigCambioLogResponse(BaseModel):
    id_log: int
    clave: str
    valor_anterior: Optional[str]
    valor_nuevo: str
    id_usuario: int
    nombre_usuario: str
    motivo: Optional[str]
    timestamp: datetime

    class Config:
        from_attributes = True