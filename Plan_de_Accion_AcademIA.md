# Plan de Acción — AcademIA
### Optimización, Refactorización y Desarrollo

---

## Fase 0 — Limpieza y Estabilización
*Hacer antes que cualquier otra cosa*

### 0.1 Eliminar código muerto y archivos de desarrollo
- Borrar `auth_0.py`, `auth copy.py`
- Borrar `Estudiantes_0.js`, `Estudiantes_1.js`, `DocentesInformes_Borrar.jsx`
- Eliminar carpeta `Borradores/`
- Eliminar scripts de debug: `check_students_debug.py`, `ProbarConexionGmail.py`, `ProbarConexionGmail Asincrono.py`

**Verificación:**
- [ ] El backend levanta sin errores (`uvicorn main:app --reload`)
- [ ] El frontend compila sin errores (`npm run build`)
- [ ] No quedan imports rotos referenciando archivos eliminados

---

### 0.2 Configurar `.gitignore` correctamente
- Agregar `.env` al `.gitignore`
- Agregar `node_modules/`, `dist/`, `venv/`, `__pycache__/`, `*.pyc`
- Verificar que ningún archivo con credenciales esté trackeado

**Verificación:**
- [ ] Ejecutar `git status` y confirmar que `.env` no aparece como archivo a trackear
- [ ] Ejecutar `git check-ignore -v .env` y confirmar que está ignorado
- [ ] Confirmar que `node_modules/` y `venv/` tampoco aparecen en `git status`

---

### 0.3 Inicializar repositorio Git con estructura correcta
- Crear repo con dos ramas base: `main` y `develop`
- Primer commit limpio (sin `.env`, sin archivos de debug)
- Documentar en `README.md` cómo levantar el proyecto localmente

**Verificación:**
- [ ] `git log` muestra al menos un commit limpio en `main`
- [ ] `git branch` muestra las ramas `main` y `develop`
- [ ] El `README.md` existe con instrucciones de instalación
- [ ] Un desarrollador nuevo puede levantar el proyecto siguiendo solo el README

---

## Fase 1 — Seguridad Crítica
*Bloqueante para producción*

### 1.1 Proteger credenciales
- Rotar todas las credenciales actuales: contraseña de BD, password SMTP, JWT secret
- Crear `.env.example` con valores de ejemplo (nunca los reales)
- Documentar en README que hay que copiar `.env.example` a `.env` y completarlo

**Verificación:**
- [ ] Las credenciales anteriores ya no funcionan (BD, SMTP, JWT)
- [ ] El archivo `.env.example` existe en el repo con todos los campos pero sin valores reales
- [ ] El backend conecta correctamente a la BD con las nuevas credenciales
- [ ] El login funciona end-to-end con el nuevo JWT secret

---

### 1.2 Rate limiting en autenticación
- Instalar `slowapi` en el backend
- Aplicar límite en: `POST /login`, `POST /register`, `POST /forgot-password`
- Límite sugerido: 5 intentos/minuto por IP

**Verificación:**
- [ ] Hacer 6 requests consecutivos a `POST /login` con datos incorrectos y verificar que el 6to retorna `429 Too Many Requests`
- [ ] Esperar 1 minuto y confirmar que vuelve a aceptar requests
- [ ] Un login válido sigue funcionando normalmente dentro del límite

---

### 1.3 Invalidación de tokens (logout real)
- Crear tabla `t_token_blacklist` en BD con campos: `token`, `expires_at`, `created_at`
- Al hacer logout, insertar el token en la blacklist
- Agregar middleware que valide el token contra la blacklist en cada request protegido

**Verificación:**
- [ ] Hacer login → obtener token → hacer logout → usar el mismo token en un endpoint protegido → debe retornar `401 Unauthorized`
- [ ] Un token nuevo (login nuevo) sigue funcionando normalmente
- [ ] La tabla `t_token_blacklist` tiene el registro del token revocado

---

### 1.4 Validación de contraseñas
- En `POST /register` y `POST /reset-password`: mínimo 8 caracteres, al menos 1 número y 1 carácter especial
- Agregar validación en el frontend con feedback visual antes de enviar

**Verificación:**
- [ ] Intentar registrar con contraseña "abc" → debe retornar error descriptivo
- [ ] Intentar registrar con contraseña "abcdefgh" (sin número ni especial) → debe retornar error
- [ ] Registrar con contraseña "Abc123!" → debe funcionar correctamente
- [ ] El formulario del frontend muestra el error en tiempo real (antes de enviar)

---

### 1.5 Configurar HTTPS
- Instalar y configurar Nginx como reverse proxy
- Obtener certificado TLS con Let's Encrypt (Certbot)
- Redirigir todo el tráfico HTTP → HTTPS
- Actualizar CORS origins en el backend para usar `https://`

**Verificación:**
- [ ] Acceder a `http://dominio` redirige automáticamente a `https://dominio`
- [ ] El certificado es válido (candado verde en el navegador, sin advertencias)
- [ ] Las llamadas a la API desde el frontend funcionan sobre HTTPS
- [ ] Verificar con `curl -I http://dominio` que la respuesta es `301 Moved Permanently`

---

## Fase 2 — Backend: Calidad y Robustez

### 2.1 Paginación en todos los endpoints de listado
- Agregar parámetros `skip: int = 0` y `limit: int = 50` en todos los `GET /` de cada router
- El response debe incluir: `{ "data": [...], "total": N, "skip": N, "limit": N }`

**Verificación:**
- [ ] `GET /api/estudiantes?skip=0&limit=5` retorna exactamente 5 registros
- [ ] `GET /api/estudiantes?skip=5&limit=5` retorna los siguientes 5 registros (sin repetir)
- [ ] El campo `total` refleja el total real de registros en la BD
- [ ] `GET /api/estudiantes` sin parámetros usa los valores por defecto (limit=50)

---

### 2.2 Manejo de errores uniforme
- Crear handlers globales en `main.py` para `HTTPException` y excepciones genéricas
- Formato de error estandarizado: `{ "error": "Tipo de error", "detail": "Descripción" }`
- Desactivar exposición de stack traces en producción

**Verificación:**
- [ ] `GET /api/estudiantes/99999` (ID inexistente) retorna `404` con el formato estándar
- [ ] Un endpoint con error interno retorna `500` con mensaje genérico (sin stack trace)
- [ ] Todos los errores de validación Pydantic retornan `422` con detalle del campo inválido
- [ ] El formato de error es consistente en todos los endpoints (mismo esquema JSON)

---

### 2.3 Logging y auditoría
- Configurar `loguru` para logging estructurado en archivo y consola
- Crear tabla `t_auditoria` en BD: `id`, `id_usuario`, `accion`, `entidad`, `id_entidad_afectada`, `detalle`, `timestamp`
- Registrar: creación/modificación/eliminación de notas, usuarios, estudiantes

**Verificación:**
- [ ] Cargar una nota y verificar que aparece el registro en `t_auditoria` con el usuario correcto
- [ ] Eliminar un estudiante y verificar el registro en `t_auditoria`
- [ ] El archivo de log se genera y contiene entradas con nivel, timestamp y mensaje
- [ ] Un error en un endpoint queda registrado en el log con suficiente contexto para debuggear

---

### 2.4 Índices en base de datos
- Agregar índice compuesto en `t_nota`: `(id_entidad_estudiante, id_materia, id_periodo)`
- Agregar índice en `t_inscripciones`: `(id_entidad, id_ciclo_lectivo)`
- Agregar índice en `t_inasistencia`: `(id_entidad, fecha)`

**Verificación:**
- [ ] Ejecutar `SHOW INDEX FROM t_nota` y confirmar los nuevos índices
- [ ] Ejecutar `EXPLAIN SELECT` en la consulta de planilla de notas y verificar que usa índice (no full scan)
- [ ] Medir tiempo de respuesta de `GET /api/notas/planilla-acta` antes y después: debe mejorar con datos reales

---

### 2.5 Separar configuración por ambiente
- Crear `config.py` con clase `Settings` (Pydantic BaseSettings) que lea el `.env`
- Agregar variable `ENVIRONMENT=development|staging|production`
- En producción: deshabilitar `/docs` y `/redoc` de FastAPI

**Verificación:**
- [ ] Con `ENVIRONMENT=production`, acceder a `/docs` retorna `404`
- [ ] Con `ENVIRONMENT=development`, `/docs` sigue accesible
- [ ] Cambiar solo el `.env` es suficiente para cambiar el ambiente, sin tocar código
- [ ] El backend inicia correctamente leyendo todas las variables desde `config.py`

---

### 2.6 Tests del backend
- Instalar `pytest`, `httpx`, `pytest-asyncio`
- Crear carpeta `tests/` con archivos por módulo: `test_auth.py`, `test_notas.py`, `test_estudiantes.py`
- Usar una BD de test separada o transacciones que se reviertan después de cada test

**Tests mínimos a implementar:**

| Archivo | Casos de prueba |
|---|---|
| `test_auth.py` | Login válido, login con contraseña incorrecta, login con usuario inexistente, acceso con token expirado, logout + token revocado |
| `test_notas.py` | Crear nota como docente, crear nota como alumno (debe fallar 403), obtener planilla, nota con datos inválidos |
| `test_estudiantes.py` | Listar, obtener por ID, crear, actualizar, eliminar, obtener ID inexistente |
| `test_permisos.py` | Cada endpoint protegido sin token retorna 401, con rol incorrecto retorna 403 |

**Verificación:**
- [ ] `pytest tests/` corre sin errores de configuración
- [ ] Todos los tests pasan (verde)
- [ ] Cobertura de código ≥ 60% en los módulos críticos (`auth.py`, `routes_notas.py`)
- [ ] Los tests no modifican la BD de desarrollo/producción

---

## Fase 3 — Frontend: Calidad y Mantenimiento

### 3.1 Unificar librería UI
- Decidir entre **CoreUI** o **PrimeReact** como librería principal
- Reemplazar los componentes de la librería descartada (hacerlo gradualmente, módulo por módulo)
- Unificar el sistema de estilos (eliminar conflictos entre ambas librerías)

**Verificación:**
- [ ] `npm run build` no genera warnings de estilos en conflicto
- [ ] El bundle size (`dist/`) es menor al original (medir con `npm run build -- --report`)
- [ ] Todas las vistas se ven correctamente y sin estilos rotos
- [ ] No quedan imports de la librería eliminada en ningún archivo

---

### 3.2 Reemplazar hooks de fetch manuales por React Query
- Instalar `@tanstack/react-query`
- Migrar `useFetch`, `useCursosData`, `useStudentsData`, `useInasistenciaData` a `useQuery`
- Migrar operaciones de escritura (crear, editar, eliminar) a `useMutation`

**Verificación:**
- [ ] Los listados de estudiantes, docentes y materias cargan correctamente
- [ ] Al crear/editar/eliminar un registro, la tabla se actualiza automáticamente (invalidación de caché)
- [ ] Si el backend no responde, el frontend muestra un estado de error (no queda en loading infinito)
- [ ] Navegar entre páginas y volver no dispara un nuevo fetch innecesario (caché activo)

---

### 3.3 Manejo de errores global en el frontend
- Interceptor de Axios: error 401 → limpiar sesión y redirigir a `/login`; error 403 → mostrar toast "Sin permisos"
- Agregar componente `<ErrorBoundary>` en el árbol de componentes principal
- Unificar el sistema de notificaciones (toast) en toda la app

**Verificación:**
- [ ] Expirar manualmente el token en localStorage y hacer una acción → redirige a login automáticamente
- [ ] Intentar acceder a un endpoint sin permisos → aparece notificación de error clara, no pantalla en blanco
- [ ] Un error de render en un componente no rompe toda la app (ErrorBoundary muestra fallback)
- [ ] Los mensajes de error son legibles para el usuario (no "Error 422" sino "El campo nombre es requerido")

---

### 3.4 Paginación en tablas
- Conectar parámetros `skip`/`limit` del backend con la paginación del DataTable
- Mostrar total de registros y controles de página (anterior/siguiente/ir a página)
- Guardar la página actual en la URL o en estado local para no perderla al volver

**Verificación:**
- [ ] La tabla de estudiantes muestra solo 50 registros por página (o el límite configurado)
- [ ] Navegar a la página 2 carga los siguientes registros desde el backend (no filtra en frontend)
- [ ] El total de registros mostrado en la tabla coincide con el campo `total` de la API
- [ ] Al editar un registro y volver al listado, se mantiene en la misma página

---

### 3.5 Tests del frontend
- Instalar `Vitest` + `@testing-library/react`
- Crear carpeta `src/__tests__/` con archivos por módulo

**Tests mínimos a implementar:**

| Archivo | Casos de prueba |
|---|---|
| `AuthContext.test.jsx` | Login guarda token, logout limpia sesión, token expirado cierra sesión |
| `ProtectedRoute.test.jsx` | Sin token redirige a login, con rol incorrecto redirige o bloquea |
| `LoginForm.test.jsx` | Campos vacíos muestran error, submit con datos válidos llama a la API |
| `NotasForm.test.jsx` | Carga de nota con datos válidos, validación de campos requeridos |

**Verificación:**
- [ ] `npm run test` corre sin errores de configuración
- [ ] Todos los tests pasan (verde)
- [ ] El componente `ProtectedRoute` funciona correctamente para cada rol
- [ ] Los tests mockean las llamadas a la API (no dependen del backend corriendo)

---

## Fase 4 — CI/CD e Infraestructura

### 4.1 Configurar CI/CD con GitHub Actions
- Crear `.github/workflows/ci.yml`
- Pipeline en cada PR a `develop` o `main`:
  - Backend: `ruff` (linter) + `pytest`
  - Frontend: `eslint` + `vitest`
- Pipeline en merge a `main`: build del frontend y notificación de deploy listo

**Verificación:**
- [ ] Abrir un PR con un test roto → el pipeline falla y bloquea el merge
- [ ] Corregir el test → el pipeline pasa y permite el merge
- [ ] Un error de lint en Python o JS hace fallar el pipeline
- [ ] Los tiempos del pipeline son razonables (menos de 5 minutos)

---

### 4.2 Variables de entorno por ambiente
- `.env.development` — BD local o de desarrollo
- `.env.staging` — BD de staging, con datos sanitizados
- `.env.production` — Solo en el servidor, nunca en el repo
- Documentar en README el proceso de configuración para cada ambiente

**Verificación:**
- [ ] Levantar el backend con `ENVIRONMENT=development` conecta a la BD de desarrollo
- [ ] El archivo `.env.production` nunca está en el repositorio (confirmar con `git log -- .env.production`)
- [ ] Cambiar de ambiente solo requiere cambiar el archivo `.env`, sin modificar código
- [ ] El `.env.example` está actualizado con todas las variables de todos los ambientes

---

## Fase 5 — Funcionalidades Incompletas a Completar

### 5.1 Módulo de Informes completo

#### 5.1.1 Boletín de calificaciones
- Vista del alumno con notas por materia, período y ciclo lectivo
- Botón para descargar en PDF (usar jsPDF ya instalado)
- Endpoint backend: `GET /api/informes/boletin/{id_estudiante}?ciclo={id}`

**Verificación:**
- [ ] El PDF generado contiene nombre del alumno, materias, notas y períodos correctos
- [ ] El endpoint retorna 404 si el alumno no existe
- [ ] Un alumno solo puede ver su propio boletín (no el de otro alumno)
- [ ] Un docente/admin puede ver el boletín de cualquier alumno

#### 5.1.2 Acta de examen
- Vista del docente con todos los alumnos de una materia y sus notas
- Exportable a PDF y Excel
- Endpoint backend: `GET /api/informes/acta/{id_materia}?periodo={id}`

**Verificación:**
- [ ] El acta lista todos los alumnos inscriptos en la materia
- [ ] Los alumnos sin nota aparecen con celda vacía (no da error)
- [ ] La exportación a Excel genera un archivo válido que abre en Excel/LibreOffice

#### 5.1.3 Informe de asistencia
- Resumen de faltas por alumno: justificadas, injustificadas, total y porcentaje
- Endpoint backend: `GET /api/informes/asistencia/{id_estudiante}?ciclo={id}`

**Verificación:**
- [ ] El porcentaje de asistencia es correcto (validar manualmente con datos conocidos)
- [ ] El informe contempla los distintos tipos de inasistencia (completa, media)
- [ ] Funciona para todos los ciclos lectivos disponibles

---

### 5.2 Trayectoria Académica del alumno
- Vista accesible para el propio alumno (rol ALUMNO_APP) y para admin/docente
- Muestra: materias cursadas por ciclo, notas por período, estado (aprobado/desaprobado/en curso)
- Gráfico de evolución de promedio por ciclo lectivo (usando Chart.js ya instalado)

**Verificación:**
- [ ] Un alumno logueado puede ver su propia trayectoria desde el menú
- [ ] Un admin puede ver la trayectoria de cualquier alumno desde su ficha
- [ ] El gráfico muestra correctamente la evolución (validar con datos de al menos 2 ciclos)
- [ ] Las materias aparecen correctamente clasificadas por estado

---

### 5.3 Búsqueda avanzada y filtros
- Filtros en todos los listados: por ciclo lectivo, curso, estado, materia
- Barra de búsqueda por nombre y DNI en listados de personas
- Los filtros activos se reflejan en la URL (para poder compartir/guardar la búsqueda)

**Verificación:**
- [ ] Filtrar estudiantes por curso retorna solo los alumnos de ese curso
- [ ] Buscar por DNI parcial (ej: "1234") retorna todos los DNI que lo contienen
- [ ] Combinar dos filtros a la vez funciona correctamente
- [ ] Limpiar filtros restaura el listado completo
- [ ] La URL cambia al aplicar filtros y al recargar la página mantiene los filtros activos

---

## Fase 6 — Nuevas Funcionalidades
*Desarrollo desde cero*

### 6.1 Dashboard con métricas
- Panel de inicio con tarjetas: total de alumnos activos, promedio general, materias con más aplazados, asistencia promedio del ciclo actual
- Gráficos de barras/líneas por ciclo lectivo
- Endpoints nuevos: `GET /api/dashboard/resumen`

**Verificación:**
- [ ] Los números del dashboard coinciden con consultas directas a la BD
- [ ] El dashboard carga en menos de 2 segundos con datos reales
- [ ] Si no hay datos para el ciclo actual, muestra un estado vacío (no da error)
- [ ] Los gráficos se renderizan correctamente en distintos tamaños de pantalla

---

### 6.2 Notificaciones internas
- Tabla `t_notificaciones` en BD: `id`, `id_usuario_destino`, `mensaje`, `leida`, `timestamp`, `tipo`
- Backend genera notificaciones al: cargar una nota, registrar inasistencia, confirmar inscripción
- Frontend: badge con contador en el header, panel de notificaciones al hacer clic

**Verificación:**
- [ ] Cargar una nota genera una notificación para el alumno correspondiente
- [ ] El badge del header muestra el número correcto de notificaciones no leídas
- [ ] Marcar como leída actualiza el badge inmediatamente
- [ ] Un usuario no puede ver las notificaciones de otro usuario

---

### 6.3 Gestión de permisos granular
- Nueva entidad `t_permisos` con permisos por módulo y acción (ver, crear, editar, eliminar)
- Tabla intermedia `t_rol_permisos` para asignar permisos a roles
- Panel de administración para configurar permisos por rol

**Verificación:**
- [ ] Quitar el permiso "editar" de notas al rol DOCENTE → el botón de edición desaparece en el frontend
- [ ] El backend rechaza la operación aunque se llame directamente a la API
- [ ] El rol ADMIN_SISTEMA siempre tiene todos los permisos (no se puede restringir)
- [ ] Los cambios de permisos se aplican sin reiniciar el servidor

---

### 6.4 Multi-institución (multi-tenant)
- Agregar campo `id_institucion` a todas las tablas relevantes
- Middleware que filtra todos los queries por la institución del usuario autenticado
- Panel de superadmin para gestionar instituciones

**Verificación:**
- [ ] Un usuario de la institución A no puede ver datos de la institución B
- [ ] El superadmin puede ver y gestionar todas las instituciones
- [ ] Agregar una nueva institución no requiere cambios en el código
- [ ] Los índices de BD incluyen `id_institucion` para mantener performance

---

### 6.5 PWA (Progressive Web App)
- Agregar `vite-plugin-pwa` al proyecto
- Configurar Service Worker para cachear: listados de materias, cursos, ciclos
- Manifest con icono y nombre de la app para instalar en el dispositivo

**Verificación:**
- [ ] La app puede instalarse desde el navegador (botón "Instalar" aparece en Chrome)
- [ ] Con conexión cortada, las páginas previamente visitadas siguen siendo accesibles
- [ ] Al recuperar la conexión, los datos se sincronizan automáticamente
- [ ] Lighthouse audit muestra score PWA ≥ 90

---

## Resumen y Orden de Prioridad

| Prioridad | Fase | Tiempo estimado | Justificación |
|---|---|---|---|
| Inmediata | Fase 0 — Limpieza | 1-2 días | Costo cero, reduce deuda técnica hoy |
| Inmediata | Fase 1 — Seguridad | 1 semana | Bloqueante para producción |
| Corto plazo | Fase 2 — Backend | 2-3 semanas | Estabilidad y escalabilidad |
| Corto plazo | Fase 3 — Frontend | 2-3 semanas | Mantenibilidad y UX |
| Mediano plazo | Fase 4 — CI/CD | 3-5 días | Facilita todo lo siguiente |
| Mediano plazo | Fase 5 — Completar features | 3-4 semanas | Valor directo al usuario |
| Largo plazo | Fase 6 — Nuevas features | 2-3 meses | Crecimiento del producto |

---

*Generado el 2026-05-05*
