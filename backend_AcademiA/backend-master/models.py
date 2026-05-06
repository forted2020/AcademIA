
# backend-master\models.py

# Importamos los tipos y funciones necesarias de SQLAlchemy para definir modelos ORM
from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, DateTime, Float, Index

# Para funciones como CURRENT_TIMESTAMP
from sqlalchemy.sql import func

from sqlalchemy.orm import relationship

# Para crear la base de modelos
from sqlalchemy.ext.declarative import declarative_base

# Definimos la base para todos los modelos ORM, que se usarán para mapear tablas
Base = declarative_base()

# ----------------------------------------------------------------------------------
# Modelo para la tabla t_usuarios. Almacena datos de autenticación y rol de la app
# ----------------------------------------------------------------------------------
class User(Base):
    __tablename__ = "t_usuarios"  # Nombre de la tabla
    
    # Clave primaria, identificador único del usuario
    id_usuario = Column(Integer, primary_key=True, index=True)

    # Clave Foránea OPCIONAL a la Entidad
    id_entidad = Column(Integer, ForeignKey("t_entidad.id_entidad"), nullable=True)

    # Datos de Autenticación
    # Nombre de usuario, único y no nulo
    name = Column(String(100), unique=True, nullable=False)
    # Contraseña, no nula
    password = Column(String(255), nullable=False)
    
    # Campos de Gestión de Cuentas
    # Correo electrónico, único y no nulo
    email = Column(String(150), unique=True, nullable=False)
    # Indica si el email está verificado, por defecto False
    is_email_verified = Column(Boolean, default=False)
    # Token para restablecer contraseña, nullable
    reset_token = Column(String(255), nullable=True)

    @property
    def rol_sistema(self):
        # Esta propiedad traduce el objeto complejo al texto simple 'ADMIN_SISTEMA'
        return self.rol_sistema_obj.tipo_roles_usuarios if self.rol_sistema_obj else None
    
    # Renombramos la columna FK para evitar ambigüedades
    # Usamos 'id_tipo_entidad_fk' como el nombre de la columna en BD
    # Y la llamaremos id_rol_sistema_fk en Python para evitar confusión con el rol de Entidad.
    id_rol_sistema_fk = Column(
        'id_tipo_entidad_fk', # <--- Nombre de la columna en BD
        Integer, 
        ForeignKey('t_tipo_roles_usuarios.id_tipo_roles_usuarios'), 
        nullable=False
    )
    
    # 🚨 RELACIÓN ROL DEL SISTEMA
    rol_sistema_obj = relationship(
        "TipoRolSistema", 
        back_populates="usuarios_con_rol_sistema",
        # Usamos el nombre de la FK en Python para la relación
        foreign_keys=[id_rol_sistema_fk] 
    )

    

    # Fecha de creación, se establece automáticamente
    created_at = Column(DateTime, default=func.current_timestamp())
    # Fecha de actualización, se actualiza automáticamente
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    # Fecha de eliminación lógica, nullable para soft deletes
    deleted_at = Column(DateTime, nullable=True)

# ----------------------------------------------------------------------------------
# CLASE DE ROLES DEL SISTEMA (t_tipo_roles_usuarios)
# ----------------------------------------------------------------------------------
class TipoRolSistema(Base): # <--- Nuevo nombre de clase
    __tablename__ = "t_tipo_roles_usuarios"

    id_tipo_roles_usuarios = Column(Integer, primary_key=True, nullable=False, index=True)
    tipo_roles_usuarios = Column(String(20), nullable=False, unique=True) 
    
    # Relación inversa a User
    usuarios_con_rol_sistema = relationship("User", back_populates="rol_sistema_obj")


#  ----------------  CLASE DE ENTIDADES DE NEGOCIO (Entidad)  ----------------------

# ----------------------------------------------------------------------------------
# MODELOS PARA TIPO DE ENTIDAD
# ----------------------------------------------------------------------------------
class TipoEntidad(Base):
    __tablename__ = "t_tipo_entidad"  # Nombre de la tabla

    # Clave primaria, código del tipo de entidad. Es referenciada en Entidad.id_tipo_entidad
    id_tipo_entidad = Column(Integer, primary_key=True, nullable=False, index=True)
    
    # Campo que contiene la etiqueta de texto ('ALU', 'DOC', 'ADMIN')
    tipo_entidad = Column(String(50), nullable=True, unique=True) 
     
    # Fecha de creación
    created_at = Column(DateTime, default=func.current_timestamp())
    # Fecha de actualización
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    # Fecha de eliminación lógica
    deleted_at = Column(DateTime, nullable=True)

# ----------------------------------------------------------------------------------
# Modelo para la tabla t_entidad, que almacena datos de entidades (personas físicas)
# ----------------------------------------------------------------------------------
class Entidad(Base):
    __tablename__ = "t_entidad"  # Nombre de la tabla
    # Clave primaria, identificador único de la entidad
    id_entidad = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    fec_nac = Column(Date, nullable=True)

    # Relación ORM. Permite usar .join(TipoEntidad) y EntidadORM.tipo_entidad
    id_tipo_entidad = Column(Integer, ForeignKey('t_tipo_entidad.id_tipo_entidad'))
    # Tipos de entidad. Clave foránea. Columna que enlaza con t_tipo_entidad
    tipo_entidad = relationship("TipoEntidad")

    domicilio = Column(String(200), nullable=True)
    telefono = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    localidad = Column(String(50), nullable=False)
    nacionalidad = Column(String(50), nullable=False)
    email = Column(String(100), nullable=True)
    cel = Column(String(50), nullable=True)
    dni = Column(Integer, nullable=False)
    legajo = Column(String(50), nullable=True)
    deleted_at = Column(DateTime, nullable=True)
    cuit = Column(String(11), nullable=True)
    


# ----------------------------------------------------------------------------------
# MODELOS PARA MATERIAS
# ----------------------------------------------------------------------------------

# Modelo para la tabla t_materia
class Materia(Base):
    __tablename__ = "t_materia"
    
    id_materia = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    id_nombre_materia = Column(Integer, ForeignKey("t_nombre_materia.id_nombre_materia"), nullable=False)
    id_curso = Column(Integer, ForeignKey("t_curso.id_curso"), nullable=False)
    id_entidad = Column(Integer, ForeignKey("t_entidad.id_entidad"), nullable=False)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())

    # --- RELACIONES ---
    # Con el nombre (Matemática, Lengua, etc.)
    nombre = relationship("NombreMateria", back_populates="materias_vinculadas")
    
    # Con el Curso (para llegar a Ciclo y Plan)
    curso = relationship("Curso") 
    
    # Con el Docente (Entidad)
    docente = relationship("Entidad")


# Modelo para la tabla tbl_nombre_materia
class NombreMateria(Base):
    __tablename__ = "t_nombre_materia"
    
    id_nombre_materia = Column(Integer, primary_key=True)
    nombre_materia = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())

    # Relaciones
    # Para crear relacion bidireccional con Materia
    materias_vinculadas = relationship("Materia", back_populates="nombre") 

# ----------------------------------------------------------------------------------
# MODELOS PARA INSCRIPCIONES
# ----------------------------------------------------------------------------------

class Inscripcion(Base):
    __tablename__ = "t_inscripciones"
    
    id_inscripcion = Column(Integer, primary_key=True)
    id_entidad = Column(Integer, ForeignKey("t_entidad.id_entidad"), nullable=False)
    id_materia = Column(Integer, ForeignKey("t_materia.id_materia"), nullable=False)
    id_tipo_insc = Column(Integer, ForeignKey("t_tipo_inscripcion.id_tipo_insc"), nullable=False)
    fecha_insc = Column(Date, nullable=False)
    id_ciclo_lectivo = Column(Integer, ForeignKey("t_ciclo_lectivo.id_ciclo_lectivo"), nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    deleted_at = Column(DateTime, nullable=True)

    # Relaciones (para que Pydantic pueda navegar entre las tablas anidadas )
    # El nombre de la variable debe coincidir con el campo en InscripcionesResponse
    estudiantes = relationship("Entidad")
    materia = relationship("Materia")
    tipo_inscripcion = relationship("TipoInscripcion")
    ciclo_lectivo = relationship("CicloLectivo")

    __table_args__ = (
        Index("idx_inscripciones_entidad_ciclo", "id_entidad", "id_ciclo_lectivo"),
    )

# ----------------------------------------------------------------------------------
# MODELOS PARA TIPOS DE INSCRIPCIONES
# ----------------------------------------------------------------------------------

class TipoInscripcion(Base):
    __tablename__ = "t_tipo_inscripcion"
    
    id_tipo_insc = Column(Integer, primary_key=True)
    nombre_tipo_inc = Column(String(30))
    
# ----------------------------------------------------------------------------------
# MODELOS PARA ASISTENCIAS
# ----------------------------------------------------------------------------------

  # Definir la tabla de Tipos
class TipoInasistencia(Base):
    __tablename__ = "t_tipo_inasistencia"  # <--- Nombre de la tabla de tipos
    
    id_tipo_inasistencia = Column(Integer, primary_key=True)
    descripcion = Column(String(50)) # Ej: "Completa", "Media"
    valor = Column(Float)      

# Modelo para la tabla t_inasistencia
class Inasistencia(Base):
    __tablename__ = "t_inasistencia"
    id_inasistencia = Column(Integer, primary_key=True)
    id_entidad = Column(Integer, ForeignKey("t_entidad.id_entidad")) # Relación con estudiante
    id_curso = Column(Integer, ForeignKey("t_curso.id_curso")) # Relación con Curso
    id_materia = Column(Integer, ForeignKey("t_materia.id_materia")) # Relación con Materia
    fecha_inasistencia = Column(Date)
    id_tipo_inasistencia = Column(Integer, ForeignKey("t_tipo_inasistencia.id_tipo_inasistencia")) # Relación con Tipo de asistencia
    
    tipo_obj = relationship("TipoInasistencia")
    justificada = Column(Boolean, default=False)
    motivo_inasistencia = Column(String(255))

    __table_args__ = (
        Index("idx_inasistencia_entidad_fecha", "id_entidad", "fecha_inasistencia"),
    )


# ----------------------------------------------------------------------------------
# MODELOS PARA PERIODOS
# ----------------------------------------------------------------------------------

# Modelo para la tabla t_periodo
class Periodo(Base):
    __tablename__ = "t_periodo"
    
    id_periodo = Column(Integer, primary_key=True, autoincrement=True, index=True)
    nombre_periodo = Column(String(100), nullable=False)    # Ej: "1er Trimestre", "Final"
    fecha_inicio_periodo = Column(Date, nullable=False)
    fecha_fin_periodo = Column(Date, nullable=False)
    # created_at = Column(DateTime, default=func.current_timestamp())
    # updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())

# ----------------------------------------------------------------------------------
# MODELOS PARA TIPO DE CONCEPTO
# ----------------------------------------------------------------------------------

# Modelo para la tabla t_tipo_concepto
class TipoConcepto(Base):
    __tablename__ = "t_tipo_concepto"

    id_tipo_concepto = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tipo_concepto = Column(String(50), nullable=False)

# ----------------------------------------------------------------------------------
# MODELOS PARA TIPO de Nota
# ----------------------------------------------------------------------------------

# Modelo para la tabla t_tipo_nota
class TipoNota(Base):
    __tablename__ = "t_tipo_nota"
    
    id_tipo_nota = Column(Integer, primary_key=True, index=True, autoincrement=True)
    tipo_nota = Column(String(20), nullable=False) # Ej: "Calificación Normal", "Recuperatorio"
    id_tipo_concepto = Column(Integer, ForeignKey("t_tipo_concepto.id_tipo_concepto"),nullable=False)
    es_final = Column(Boolean, default=False)

# ----------------------------------------------------------------------------------
# MODELO ORM PRINCIPAL DE NOTAS
# ----------------------------------------------------------------------------------

# Modelo para la tabla t_nota
class Nota(Base):
    __tablename__ = "t_nota"
    
    # Clave primaria (Auto-generada)
    id_nota = Column(Integer, primary_key=True, index=True)
    
    # ------------------
    # CAMPOS DEL FRONTEND
    # ------------------
    # FK a Materia
    id_materia = Column(Integer, ForeignKey("t_materia.id_materia"), nullable=False)
    # FK a Estudiante (es una Entidad)
    id_entidad_estudiante = Column(Integer, ForeignKey("t_entidad.id_entidad"), nullable=False)
    # Valor de la nota
    nota = Column(Float, nullable=False)
    # FK a Período (catalogo)
    id_periodo = Column(Integer, ForeignKey("t_periodo.id_periodo"), nullable=False)
    
    # ------------------
    # CAMPOS DE AUDITORÍA Y BACKEND
    # ------------------
    # FK a Tipo de Nota (catalogo)
    id_tipo_nota = Column(Integer, ForeignKey("t_tipo_nota.id_tipo_nota"), nullable=False)
    # Fecha de carga (se genera automáticamente al insertar)
    fecha_carga = Column(Date, default=func.now(), nullable=False)
    # FK a la Entidad que carga la nota (ej. el Docente o Admin logueado)
    id_entidad_carga = Column(Integer, ForeignKey("t_entidad.id_entidad"), nullable=False)
    
    # ------------------
    # RELACIONES ORM (Opcional, pero recomendada)
    # ------------------
    materia = relationship("Materia")
    estudiante = relationship("Entidad", foreign_keys=[id_entidad_estudiante])
    cargador = relationship("Entidad", foreign_keys=[id_entidad_carga])
    periodo_obj = relationship("Periodo")
    tipo_nota_obj = relationship("TipoNota")
    
    # ------------------
    # CAMPOS DE CONTROL (Auditoría)
    # ------------------
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())

    __table_args__ = (
        Index("idx_nota_estudiante_materia_periodo", "id_entidad_estudiante", "id_materia", "id_periodo"),
    )

# ----------------------------------------------------------------------------------
# MODELO TOKEN BLACKLIST — tokens revocados por logout
# ----------------------------------------------------------------------------------
class TokenBlacklist(Base):
    __tablename__ = "t_token_blacklist"

    id = Column(Integer, primary_key=True, autoincrement=True)
    token = Column(String(512), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=func.current_timestamp())

# ----------------------------------------------------------------------------------
# MODELO CICLOS LECTIVOS
# ----------------------------------------------------------------------------------
class CicloLectivo(Base):
    __tablename__ = "t_ciclo_lectivo"
    id_ciclo_lectivo = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    nombre_ciclo_lectivo = Column(String(100), nullable=True)
    fecha_inicio_cl = Column(Date, nullable=True)
    fecha_fin_cl = Column(Date, nullable=True)
    id_plan = Column(Integer, ForeignKey("t_plan.id_plan"), nullable=True)

    # RELACIONES 
    plan = relationship("Plan")     # Un ciclo pertenece a un plan
    cursos = relationship("Curso", back_populates="ciclo")      

# ----------------------------------------------------------------------------------
# MODELO PLAN
# ----------------------------------------------------------------------------------
class Plan(Base):
    __tablename__ = "t_plan"
    id_plan = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    nombre_plan = Column(String(50), nullable=False)
    vigencia_desde= Column(Date, nullable=False)
    vigencia_hasta= Column(Date, nullable=True)
    resolucion_nro = Column(String(30), nullable=False)
    
    # Relación inversa 
    ciclos = relationship("CicloLectivo", back_populates="plan")

# ----------------------------------------------------------------------------------
# MODELO CURSOS
# ----------------------------------------------------------------------------------
class Curso(Base):
    __tablename__ = "t_curso"
    id_curso = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    curso = Column(String(50), nullable=False)
    id_ciclo_lectivo = Column(Integer, ForeignKey("t_ciclo_lectivo.id_ciclo_lectivo"))
    created_at = Column(DateTime, default=func.current_timestamp(), nullable=False)
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp(), nullable=True)

    # Relación: Un curso pertenece a un ciclo
    ciclo = relationship("CicloLectivo", back_populates="cursos")   # Busca "cursos" en CicloLectivo


# ----------------------------------------------------------------------------------
# MODELO NOTIFICACIONES (t_notificaciones)
# ----------------------------------------------------------------------------------
class Notificacion(Base):
    __tablename__ = "t_notificaciones"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)

    # Destino: usuario que recibe la notificación (FK a t_usuarios)
    id_usuario_destino = Column(Integer, ForeignKey("t_usuarios.id_usuario"), nullable=False, index=True)

    mensaje = Column(String(500), nullable=False)

    # Tipo de evento: 'nota', 'inasistencia', 'inscripcion', 'sistema'
    tipo = Column(String(50), nullable=False, default='sistema')

    leida = Column(Boolean, default=False, nullable=False)

    timestamp = Column(DateTime, default=func.current_timestamp(), nullable=False)

    # Relación con el usuario destino
    usuario_destino = relationship("User", foreign_keys=[id_usuario_destino])


# ----------------------------------------------------------------------------------
# MODELO CONFIGURACIÓN DE NOTIFICACIONES (t_notif_config)
# Cada fila es una preferencia de un usuario para un tipo de notificación.
# ----------------------------------------------------------------------------------
class NotificacionConfig(Base):
    __tablename__ = "t_notif_config"

    id = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("t_usuarios.id_usuario"), nullable=False, index=True)

    # Tipo al que aplica esta config: 'nota', 'inasistencia', 'inscripcion', 'sistema'
    tipo = Column(String(50), nullable=False)

    # Si el usuario quiere recibir este tipo de notificación en el panel
    activa = Column(Boolean, default=True, nullable=False)

    usuario = relationship("User", foreign_keys=[id_usuario])