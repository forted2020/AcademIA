# AcademIA

Sistema de gestión académica para instituciones educativas. Permite administrar estudiantes, docentes, materias, calificaciones, asistencias y ciclos lectivos con control de roles y permisos.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite 6 |
| Backend | FastAPI + Python 3.12 |
| Base de datos | MySQL |
| Autenticación | JWT (HS256) |

---

## Estructura del proyecto

```
AcademIA/
├── backend_AcademiA/
│   └── backend-master/       # API REST (FastAPI)
│       ├── Routes/           # Endpoints por entidad
│       ├── Services/         # Lógica de negocio
│       ├── main.py           # App principal
│       ├── models.py         # Modelos ORM
│       ├── schemas.py        # Schemas Pydantic
│       ├── auth.py           # JWT y autenticación
│       ├── .env.example      # Variables de entorno requeridas
│       └── requirements.txt
├── frontend_AcademiA/        # SPA React
│   ├── src/
│   │   ├── api/              # Clientes HTTP por módulo
│   │   ├── components/       # Componentes reutilizables
│   │   ├── context/          # AuthContext
│   │   ├── hooks/            # Custom hooks
│   │   ├── views/            # Páginas por módulo
│   │   └── App.js
│   └── package.json
├── Startup/                  # Scripts de inicio (.bat)
└── Plan_de_Accion_AcademIA.md
```

---

## Requisitos previos

- Python 3.12+
- Node.js 20+
- MySQL 8+
- Git

---

## Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd AcademIA
```

### 2. Configurar el Backend

```bash
cd backend_AcademiA/backend-master

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores reales
```

### 3. Configurar el Frontend

```bash
cd frontend_AcademiA

# Instalar dependencias
npm install

# Configurar variables de entorno (si aplica)
cp .env.example .env
```

---

## Ejecución en desarrollo

### Backend

```bash
cd backend_AcademiA/backend-master
# Con el venv activado:
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

API disponible en: `http://localhost:8000`
Documentación Swagger: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend_AcademiA
npm start
```

App disponible en: `http://localhost:3001`

### Scripts de inicio rápido (Windows)

En la carpeta `Startup/` hay scripts `.bat` para levantar cada servicio con doble clic.

---

## Variables de entorno

Copiar `backend_AcademiA/backend-master/.env.example` a `.env` y completar:

| Variable | Descripción |
|---|---|
| `DB_DIALECT` | Driver de BD (ej: `mysql+pymysql`) |
| `DB_HOST` | Host del servidor MySQL |
| `DB_PORT` | Puerto MySQL (default: 3306) |
| `DB_NAME` | Nombre de la base de datos |
| `DB_USER` | Usuario de la BD |
| `DB_PASSWORD` | Contraseña de la BD |
| `EMAIL_HOST` | Servidor SMTP |
| `EMAIL_PORT` | Puerto SMTP (587 para TLS) |
| `EMAIL_USER` | Correo remitente |
| `EMAIL_PASS` | Contraseña de aplicación del correo |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT |
| `ENVIRONMENT` | `development`, `staging` o `production` |

---

## Roles del sistema

| Rol | Descripción |
|---|---|
| `ADMIN_SISTEMA` | Acceso total |
| `DOCENTE_APP` | Gestión académica de sus materias |
| `ALUMNO_APP` | Acceso a su propia información |

---

## Ramas Git

| Rama | Propósito |
|---|---|
| `main` | Código estable listo para producción |
| `develop` | Integración de features en desarrollo |
| `fase/<N>-<descripcion>` | Ramas de trabajo por fase del plan |

---

## Plan de acción

Ver [Plan_de_Accion_AcademIA.md](Plan_de_Accion_AcademIA.md) para el roadmap completo de optimización y nuevas funcionalidades.
