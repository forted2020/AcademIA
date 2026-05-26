# AcademIA — Informe Funcional: Manejo de Relaciones de Datos

> **Fecha**: 2026-05-10
> **Estado**: Documento base — refleja el estado actual de la implementación.

---

## Visión Procedimental — Cómo fluyen los datos por proceso

Esta sección describe, en términos concretos, qué ocurre en la base de datos cuando se ejecuta cada proceso del sistema. El objetivo es entender no solo qué tablas existen, sino **cuándo se toca cada tabla, por qué, y cómo quedan relacionadas entre sí** después de cada operación.

---

### Cuando un alumno se registra en el sistema

Antes de poder inscribirse a materias, una persona debe existir en el sistema. Esto implica dos registros separados:

1. Se crea una fila en **`t_entidad`** con los datos personales del alumno (nombre, apellido, DNI, legajo, etc.) y el campo `id_tipo_entidad` apuntando al valor `ESTUDIANTE` de la tabla `t_tipo_entidad`.
2. Se crea una fila en **`t_usuarios`** con las credenciales de acceso (nombre de usuario, contraseña hasheada, email). Este registro tiene `id_rol_sistema_fk` apuntando al rol `ALUMNO_APP` en `t_tipo_roles_usuarios`, y `id_entidad` apuntando al registro recién creado en `t_entidad`.

Desde ese momento, el sistema puede identificar a esa persona tanto como **persona física** (vía `t_entidad`) como **usuario del sistema** (vía `t_usuarios`). El vínculo entre ambas tablas es el campo `t_usuarios.id_entidad`.

---

### Cuando se arma la oferta académica del año

Antes de poder inscribir alumnos, un administrador debe configurar la estructura del ciclo lectivo. Esto ocurre en el siguiente orden:

1. Se crea o selecciona un **plan académico** en `t_plan` (ej: "Plan 2022"). El plan define el marco normativo del ciclo.
2. Se crea el **ciclo lectivo** en `t_ciclo_lectivo` (ej: "2024"), vinculado al plan mediante `id_plan`. El ciclo lectivo representa el año académico completo.
3. Se crean los **cursos** en `t_curso` (ej: "1er A", "2do B"), cada uno vinculado al ciclo lectivo mediante `id_ciclo_lectivo`. Cada curso es una sección o división de un año.
4. Se crean las **materias instanciadas** en `t_materia`, una por cada materia que se dictará en cada curso. Cada registro en `t_materia` vincula tres cosas: el nombre de la materia (del catálogo `t_nombre_materia`), el curso donde se dicta (`id_curso`) y el docente que la tiene a cargo (`id_entidad` apuntando a un registro de tipo DOCENTE en `t_entidad`).

Cuando se inscribe un alumno a un curso, en realidad se lo inscribe a **cada una de las materias** que ese curso tiene registradas en `t_materia`.

---

### Cuando un alumno se inscribe a un curso

La inscripción es el proceso que une a un alumno con las materias de un curso en un ciclo lectivo. El sistema no inscribe al alumno "al curso" en una sola operación: **crea una fila en `t_inscripciones` por cada materia del curso destino**.

Entonces, si el curso "1er A" tiene 8 materias registradas en `t_materia`, y se inscribe a un alumno, se generan **8 registros** en `t_inscripciones`, uno por materia. Cada registro tiene:

- `id_entidad` → el alumno (de `t_entidad`)
- `id_materia` → una materia específica del curso (de `t_materia`)
- `id_ciclo_lectivo` → el año académico (de `t_ciclo_lectivo`)
- `id_tipo_insc` → el tipo de inscripción: Regular, Libre, Recursante (de `t_tipo_inscripcion`)
- `fecha_insc` → la fecha en que se realizó la inscripción

Si el alumno ya estaba inscripto a alguna de esas materias en ese ciclo (el registro existe y tiene `deleted_at` en NULL), el sistema omite esa combinación y no genera duplicados. Si la inscripción fue dada de baja lógica (`deleted_at` con fecha), se considera como si no existiera y se puede re-inscribir.

La inscripción masiva (inscribir varios alumnos a la vez) simplemente repite este proceso para cada alumno de la lista.

---

### Cuando un docente carga una nota

Las calificaciones se registran en `t_nota`. Cada fila representa **una nota de un alumno en una materia, para un tipo de evaluación específico en un período**. No existe una sola nota por alumno y materia: puede haber múltiples, dependiendo de cuántos tipos de nota estén definidos.

Por ejemplo, para la materia "Matemática" del alumno Juan García en el ciclo 2024, pueden existir estos registros en `t_nota`:

| Alumno | Materia | Período | Tipo de nota | Nota |
|--------|---------|---------|--------------|------|
| Juan García | Matemática 1er A | 1er Trimestre | 1er Trimestre | 7.0 |
| Juan García | Matemática 1er A | 2do Trimestre | 2do Trimestre | 8.5 |
| Juan García | Matemática 1er A | - | Recuperatorio | 6.0 |
| Juan García | Matemática 1er A | - | Definitiva | 7.5 |

Cada registro en `t_nota` apunta a:
- El alumno: `id_entidad_estudiante` → `t_entidad`
- La materia: `id_materia` → `t_materia`
- El período: `id_periodo` → `t_periodo`
- El tipo de nota: `id_tipo_nota` → `t_tipo_nota`
- El docente que cargó: `id_entidad_carga` → `t_entidad`

El campo `es_final` en `t_tipo_nota` determina cuáles de estas notas son "la nota final" de la materia. Solo las notas cuyo tipo tiene `es_final = True` aparecen en el Boletín de Calificaciones. El Acta de Examen, en cambio, puede mostrar todos los tipos.

Si el sistema recibe una nota para una combinación (alumno, materia, tipo_nota) que ya existe, **actualiza** el valor en lugar de crear un duplicado (operación upsert).

---

### Cuando se registra una inasistencia

Cada vez que un alumno falta a clase, se crea un registro en `t_inasistencia` con:

- `id_entidad` → el alumno
- `id_materia` → la materia a la que faltó
- `id_curso` → el curso
- `fecha_inasistencia` → la fecha
- `id_tipo_inasistencia` → el tipo (Completa, Media), que lleva un campo `valor` numérico (1.0, 0.5)
- `justificada` → booleano que indica si fue justificada
- `motivo_inasistencia` → texto libre con el motivo (opcional)

Las inasistencias no se acumulan en un contador: cada falta es un registro independiente. El total se calcula en el momento de la consulta, sumando los valores (`t_tipo_inasistencia.valor`) de todos los registros del alumno en el período solicitado. Esto permite reconstruir el historial completo, distinguir justificadas de no justificadas, y ver el detalle fecha a fecha.

---

### Cuando se genera un documento (boletín, acta, informe)

La generación de cualquier PDF no produce registros nuevos en la base de datos: es una operación de **solo lectura** que reúne datos de múltiples tablas y los renderiza.

Para el **Boletín de Calificaciones**, el sistema:
1. Lee los registros de `t_nota` del alumno, filtrando solo los tipos de nota con `es_final = True`
2. Agrupa esas notas por materia (`t_materia` → `t_nombre_materia`)
3. Calcula promedios
4. Lee la configuración visual desde `t_configuracion_sistema` (logo, nombre institución, colores) y `t_formato_config` con el código `boletin` (título del documento, si mostrar logo, texto de firma, etc.)
5. Renderiza el PDF con todos esos datos

Para el **Acta de Examen**, el proceso es similar pero trae notas de todos los alumnos inscriptos en una materia específica, sin filtrar por `es_final`.

Para el **Informe de Asistencia**, lee los registros de `t_inasistencia` del alumno, los suma y los presenta con detalle.

En ningún caso se escribe nada en la base de datos durante la generación del documento.

---

### Cómo se relacionan las tablas, proceso a proceso

| Proceso | Tablas que se escriben | Tablas que se leen como referencia |
|---------|----------------------|-----------------------------------|
| Alta de alumno | `t_entidad`, `t_usuarios` | `t_tipo_entidad`, `t_tipo_roles_usuarios` |
| Armado del ciclo | `t_ciclo_lectivo`, `t_curso`, `t_materia` | `t_plan`, `t_nombre_materia`, `t_entidad` (docente) |
| Inscripción | `t_inscripciones` | `t_entidad`, `t_materia`, `t_ciclo_lectivo`, `t_tipo_inscripcion` |
| Carga de nota | `t_nota` | `t_materia`, `t_entidad`, `t_periodo`, `t_tipo_nota` |
| Registro de inasistencia | `t_inasistencia` | `t_entidad`, `t_materia`, `t_curso`, `t_tipo_inasistencia` |
| Generación de boletín | _(ninguna)_ | `t_nota`, `t_tipo_nota`, `t_materia`, `t_nombre_materia`, `t_configuracion_sistema`, `t_formato_config` |
| Generación de acta | _(ninguna)_ | `t_nota`, `t_tipo_nota`, `t_inscripciones`, `t_entidad`, `t_materia` |
| Generación de informe asistencia | _(ninguna)_ | `t_inasistencia`, `t_tipo_inasistencia`, `t_entidad` |

---

## Arquitectura General

El sistema es una SPA + REST API:

- **Backend**: FastAPI (Python) + SQLAlchemy ORM + MySQL
- **Frontend**: React + CoreUI + PrimeReact
- **Autenticación**: JWT (Bearer token)

---

## 1. Modelo de Datos — Tablas y Relaciones

### Entidad Central: `t_entidad`

Tabla de **personas físicas** del sistema. Un mismo registro puede ser Alumno, Docente o Personal según el campo `id_tipo_entidad`.

| Campo | Descripción |
|-------|-------------|
| `id_entidad` | PK. Identificador universal de persona |
| `nombre`, `apellido`, `dni`, `legajo` | Datos personales |
| `id_tipo_entidad` | FK → `t_tipo_entidad` (ESTUDIANTE / DOCENTE / PERSONAL_ADMIN) |

La tabla `t_usuarios` (credenciales de login) tiene un campo `id_entidad` opcional que la vincula a una persona física. El campo `id_rol_sistema_fk` (→ `t_tipo_roles_usuarios`) determina los permisos del usuario en el sistema: `ADMIN_SISTEMA`, `DOCENTE_APP`, `ALUMNO_APP`.

---

### Jerarquía Académica

```
t_plan  (Plan académico, ej: "Plan 2022")
  └── t_ciclo_lectivo  (Año académico, ej: "2024")
        └── t_curso  (División/sección, ej: "1er A")
              └── t_materia  (Instancia de materia en ese curso)
                    ├── id_nombre_materia → t_nombre_materia  (catálogo: "Matemática", "Lengua")
                    └── id_entidad → t_entidad  (Docente que la dicta)
```

La misma materia del catálogo ("Matemática") puede existir como múltiples registros en `t_materia`, uno por cada curso que la dicte, posiblemente con docentes distintos.

---

### Tabla Central: `t_inscripciones` — Alumno ↔ Materia

```
t_inscripciones
  ├── id_entidad        → t_entidad          (Alumno)
  ├── id_materia        → t_materia          (Materia instanciada en un curso)
  ├── id_ciclo_lectivo  → t_ciclo_lectivo
  ├── id_tipo_insc      → t_tipo_inscripcion (Regular, Libre, Recursante)
  └── fecha_insc
```

Cada fila representa que **un alumno está inscripto en una materia específica de un curso en un ciclo lectivo**. Es el punto de unión entre personas y el sistema académico.

**Soft delete**: el campo `deleted_at` permite desactivar inscripciones sin borrar el registro. Las inscripciones activas tienen `deleted_at IS NULL`.

**Índice**: `idx_inscripciones_entidad_ciclo` sobre `(id_entidad, id_ciclo_lectivo)` para acelerar consultas por alumno y año.

---

### Tabla Central: `t_nota` — Alumno ↔ Materia ↔ Calificación

```
t_nota
  ├── id_entidad_estudiante  → t_entidad   (Alumno calificado)
  ├── id_materia             → t_materia   (Qué materia)
  ├── id_periodo             → t_periodo   (1er Trimestre, 2do Trimestre, etc.)
  ├── id_tipo_nota           → t_tipo_nota (Normal / Recuperatorio / Definitiva)
  │     └── es_final: bool                 ← determina si aparece en el boletín
  ├── id_entidad_carga       → t_entidad   (Docente que registró la nota)
  ├── nota  (float)
  └── fecha_carga
```

El campo `es_final` en `t_tipo_nota` es clave: cuando es `True`, la nota aparece en el Boletín de Calificaciones; cuando es `False`, solo aparece en el Acta de Examen completa.

**Índice**: `idx_nota_estudiante_materia_periodo` sobre `(id_entidad_estudiante, id_materia, id_periodo)`.

---

### Tabla: `t_inasistencia` — Alumno ↔ Asistencia

```
t_inasistencia
  ├── id_entidad            → t_entidad          (Alumno)
  ├── id_curso              → t_curso
  ├── id_materia            → t_materia
  ├── fecha_inasistencia
  ├── id_tipo_inasistencia  → t_tipo_inasistencia (Completa / Media, con campo `valor` numérico)
  └── justificada (bool) + motivo_inasistencia
```

Las inasistencias se acumulan sumando el campo `valor` de cada `t_tipo_inasistencia`. Por ejemplo: inasistencia "Completa" vale 1.0, "Media" vale 0.5.

**Índice**: `idx_inasistencia_entidad_fecha` sobre `(id_entidad, fecha_inasistencia)`.

---

### Tablas de Catálogo

| Tabla | Propósito |
|-------|-----------|
| `t_tipo_entidad` | Clasifica entidades: ESTUDIANTE, DOCENTE, PERSONAL_ADMIN |
| `t_tipo_roles_usuarios` | Roles del sistema: ADMIN_SISTEMA, DOCENTE_APP, ALUMNO_APP |
| `t_tipo_inscripcion` | Tipos de inscripción: Regular, Libre, Recursante |
| `t_tipo_nota` | Tipos de calificación: 1er Trimestre, Recuperatorio, Definitiva, etc. |
| `t_tipo_concepto` | Agrupa tipos de notas (ej: "Evaluación", "Recuperatorio") |
| `t_periodo` | Períodos académicos con fecha inicio y fin |
| `t_nombre_materia` | Catálogo de nombres de materias (Matemática, Lengua, etc.) |
| `t_tipo_inasistencia` | Tipos de inasistencia con su valor numérico |

---

### Tablas de Configuración

| Tabla | Propósito |
|-------|-----------|
| `t_configuracion_sistema` | Configuración global: nombre institución, logo en base64, colores |
| `t_formato_config` | Configuración por tipo de documento (boletín, acta, informe asistencia) |

`t_formato_config` usa la combinación `(codigo_formato, clave)` como identificador único. Códigos soportados: `boletin`, `acta_examen`, `informe_asistencia`.

---

### Tablas de Soporte

| Tabla | Propósito |
|-------|-----------|
| `t_notificaciones` | Notificaciones por usuario: nota, inasistencia, inscripcion, sistema |
| `t_notif_config` | Preferencias de notificación por usuario y tipo |
| `t_token_blacklist` | Tokens JWT revocados (logout) |

---

## 2. Diagrama de Relaciones

```
t_plan
  └─── t_ciclo_lectivo ─────────────────────────── t_inscripciones ─── t_tipo_inscripcion
              └─── t_curso                               │    │
                      └─── t_materia ───────────────────┘    └── t_entidad (Alumno)
                              ├── t_nombre_materia (catálogo)           │
                              └── t_entidad (Docente)                   │
                                                                         │
              t_nota ──────────────────────────────────────────────────-┘
                ├── id_materia
                ├── id_periodo
                ├── id_tipo_nota ── es_final: bool
                └── id_entidad_carga (Docente)

              t_inasistencia ─────────────────────────────────────────--┘
                ├── id_materia
                ├── id_curso
                └── id_tipo_inasistencia ── valor: float
```

---

## 3. Schemas de API (Pydantic)

### Autenticación

**Payload JWT + Response de login**:
```json
{
  "id_usuario": 1,
  "name": "juan_perez",
  "email": "juan@example.com",
  "rol_sistema": "ALUMNO_APP",
  "id_entidad": 5
}
```

### Inscripción (entrada)

```json
{
  "alumnos": [{ "id_entidad": 5 }, { "id_entidad": 6 }],
  "id_ciclo_lectivo": 2,
  "id_curso_destino": 3,
  "id_tipo_insc": 1,
  "fecha_insc": "2024-02-15"
}
```

### Nota (entrada — upsert)

```json
{
  "id_alumno": 10,
  "id_materia": 5,
  "id_tipo_nota": 1,
  "valor": 8.5,
  "id_periodo": 1,
  "id_entidad_carga": 3
}
```

### Boletín / Acta (salida)

```json
{
  "columnas": [{ "id_tipo_nota": 7, "label": "Definitiva" }],
  "filas": [
    {
      "id_materia": 5,
      "nombre_materia": "Matemática",
      "calificaciones": { "7": 7.5 },
      "promedio": 7.5,
      "definitiva": 7.5
    }
  ]
}
```

---

## 4. Endpoints Principales

### Inscripciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/inscripciones/inscribir-lote` | Inscribe múltiples alumnos en todas las materias de un curso |
| `GET` | `/api/inscripciones/tipos/` | Catálogo de tipos de inscripción |

### Notas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/notas/` | Crea una nota individual |
| `POST` | `/api/notas/upsert` | Crea o actualiza nota por (alumno, materia, tipo_nota) |
| `GET` | `/api/notas/planilla-acta` | Acta de examen: notas de todos los alumnos de una materia |
| `GET` | `/api/notas/informe-individual/{id_estudiante}` | Boletín: notas finales (`es_final=True`) de un alumno |

### Estudiantes

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/estudiantes/` | Lista paginada con búsqueda |
| `GET` | `/api/estudiantes/{id}` | Detalle de un alumno |
| `GET` | `/api/estudiantes/curso/{id_curso}` | Alumnos inscriptos en un curso |
| `GET` | `/api/estudiantes/inasistencias/{id_entidad}/{year}` | Resumen y detalle de faltas |

### Configuración

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/configuracion/sistema` | Lee configuración global |
| `PUT` | `/api/configuracion/sistema` | Actualiza configuración global (solo ADMIN) |
| `POST` | `/api/configuracion/sistema/logo` | Sube logo en base64 |
| `GET` | `/api/formatos-impresion/{codigo}` | Lee configuración de un formato de impresión |
| `PUT` | `/api/formatos-impresion/{codigo}` | Actualiza configuración de formato (solo ADMIN) |

---

## 5. Procesos Funcionales

### Proceso A: Inscripción de Alumnos a Materias

El frontend usa el componente **`GenericEnrollment`** (PickList de dos columnas: disponibles → a inscribir).

**Flujo completo**:

1. El usuario selecciona **ciclo origen** y **curso origen** → el sistema carga los alumnos de ese curso como lista fuente (`GET /api/estudiantes/`)
2. El usuario selecciona **ciclo destino**, **curso destino** y **tipo de inscripción**
3. El usuario mueve alumnos de la lista fuente a la lista destino (individualmente o todos)
4. Al confirmar → `POST /api/inscripciones/inscribir-lote`
5. El backend itera **cada alumno × cada materia del curso destino** y crea un registro en `t_inscripciones`, omitiendo duplicados activos
6. El response indica cuántas inscripciones se crearon y cuántas se omitieron

**Lógica anti-duplicado**:
```sql
SELECT * FROM t_inscripciones
WHERE id_entidad = ? AND id_materia = ? AND id_ciclo_lectivo = ? AND deleted_at IS NULL
```
Si existe → omite. Si no existe → `INSERT`.

**Response**:
```json
{
  "inscripciones_creadas": 4,
  "inscripciones_omitidas": 2,
  "mensaje": "Se inscribieron 4 combinaciones alumno-materia. 2 ya existían."
}
```

---

### Proceso B: Carga de Calificaciones (Docente)

1. El docente selecciona materia, período y tipo de nota
2. Ve la lista de alumnos inscriptos en esa materia
3. Ingresa notas → `POST /api/notas/upsert`
4. **Validación de rango** (backend y frontend): el valor debe estar entre `nota_minima` y `nota_maxima` configuradas en `t_configuracion_sistema`. Fuera de rango → HTTP 400 con mensaje explícito. El frontend valida antes del envío y muestra el mismo rango en el mensaje de error.
5. El backend hace **upsert**: si ya existe nota para `(alumno, materia, tipo_nota, periodo)`, actualiza; si no, crea
6. Registra quién cargó la nota (`id_entidad_carga`) y cuándo (`fecha_carga`)

La validación está centralizada en `Services/config_service.py::validar_nota_o_lanzar`, que se aplica tanto en `POST /api/notas/` (carga individual) como en `POST /api/notas/upsert`. El frontend usa el helper `getRangoNotas` del hook `useConfigSistema` para leer los mismos valores.

---

### Proceso C: Acta de Examen (Reporte por materia)

1. Admin selecciona ciclo → curso → materia
2. `GET /api/notas/planilla-acta?ciclo_id=...&curso_id=...&materia_id=...`
3. El backend retorna estructura `{columnas: [tipos_nota], filas: [alumno + sus calificaciones]}`
4. El frontend genera PDF con `jsPDF + jspdf-autotable`, inyectando logo e institución desde la configuración del sistema

---

### Proceso D: Boletín de Calificaciones (por alumno)

1. Se busca el alumno por nombre/DNI
2. Se selecciona ciclo y curso
3. `GET /api/notas/informe-individual/{id_estudiante}?ciclo_id=...&curso_id=...`
4. El backend filtra **solo los tipos de nota con `es_final = True`**, agrupa por materia y calcula promedios
5. Se renderiza tabla: Materia | Notas finales | Promedio Definitiva
6. Opcionalmente se descarga como PDF

---

### Proceso E: Informe de Asistencia (por alumno)

1. `GET /api/estudiantes/inasistencias/{id_entidad}/{year}`
2. El backend recupera todas las inasistencias del año, suma los `valor` de cada `t_tipo_inasistencia`
3. Calcula subtotal de justificadas vs. sin justificar
4. El frontend renderiza:
   - Tarjetas de resumen: Total | Justificadas | Sin Justificar
   - Tabla detalle: Fecha | Tipo | Valor | Justificada | Motivo

---

## 6. Frontend — Componentes Clave

### `GenericEnrollment` (`components/enrollment/`)

Componente reutilizable de PickList. Recibe una `config` con:

- `filters`: selectores dependientes (ciclo → curso → tipo de inscripción)
- `getSourceEndpoint`: función que retorna la URL para cargar la lista fuente
- `postEndpoint`: URL para enviar la inscripción
- `pickListConfig`: configuración de columnas y labels del PickList

Los selectores respetan dependencias: un selector hijo solo se habilita cuando su padre tiene valor seleccionado.

### Vistas de Estudiantes (`views/estudiantes/`)

| Componente | Propósito |
|------------|-----------|
| `ActaExamen.jsx` | Acta de examen por materia. Selectores: ciclo → curso → materia |
| `BoletinCalificaciones.jsx` | Boletín de un alumno. Busca alumno → ciclo → curso |
| `InformeAsistencia.jsx` | Resumen e historial de faltas de un alumno |

Los tres componentes usan los hooks `useConfigSistema()` y `useFormatoImpresion(codigo)` para inyectar configuración institucional en los PDFs generados.

---

## 7. Sistema de Configuración e Impresión

### Configuración Global (`t_configuracion_sistema`)

Pares clave/valor de configuración institucional:

| Clave | Ejemplo de valor |
|-------|-----------------|
| `nombre_institucion` | `"Colegio San José"` |
| `logo_base64` | `"iVBORw0KGgo..."` |
| `logo_mime_type` | `"image/png"` |
| `color_primario` | `"#0369a1"` |
| `color_encabezado` | `"#0f172a"` |
| `nota_minima` | `"0"` |
| `nota_maxima` | `"10"` |
| `nota_aprobacion` | `"6"` |
| `inasistencias_umbral_reincorporacion` | `"20"` |
| `inasistencias_umbral_libre` | `"28"` |
| `modo_inscripcion` | `"MATERIA"` o `"CURSO"` |

**Claves académicas** (cargadas por el seed `run_configuracion_academica_seed.py`):
- `nota_minima` / `nota_maxima`: rango válido para cargar calificaciones (validación en backend y frontend).
- `nota_aprobacion`: umbral usado para distinguir aplazos visualmente (planilla, boletín) y para determinar materias previas al cerrar un ciclo.
- `inasistencias_umbral_reincorporacion`: cantidad de inasistencias que dispara la generación del Acta de Reincorporación.
- `inasistencias_umbral_libre`: cantidad de inasistencias que pasa al alumno a carácter Libre / Libre Concurrente.
- `modo_inscripcion`: define cómo se registran inasistencias e inscripciones (`MATERIA` = por materia individual / `CURSO` = por curso completo). Cambio auditado en `t_configuracion_cambio_log`.

### Configuración por Tipo de Documento (`t_formato_config`)

Cada documento tiene su propio conjunto de claves:

| `codigo_formato` | `clave` | Ejemplo de valor |
|-----------------|---------|-----------------|
| `boletin` | `titulo_documento` | `"BOLETÍN DE CALIFICACIONES"` |
| `boletin` | `mostrar_logo` | `"1"` |
| `boletin` | `mostrar_fecha_emision` | `"1"` |
| `boletin` | `texto_firma` | `"Firma del director"` |
| `acta_examen` | `titulo_documento` | `"ACTA DE EXAMEN"` |
| `informe_asistencia` | `titulo_documento` | `"INFORME DE ASISTENCIA"` |

### Flujo de Generación de PDF

```
useConfigSistema()          → GET /api/configuracion/sistema
useFormatoImpresion(codigo) → GET /api/formatos-impresion/{codigo}
        ↓
generarPDF()
  ├── Si mostrar_logo && logo_base64 → addImage(...)
  ├── Encabezado con nombre institución y título del documento
  ├── autoTable con datos académicos
  └── doc.save("Documento.pdf")
```

---

## 8. Control de Acceso por Rol

| Rol | Acceso |
|-----|--------|
| `ADMIN_SISTEMA` | Todo: inscripciones, notas, asistencia, configuración, formatos |
| `DOCENTE_APP` | Carga de notas, asistencia, reportes de sus materias |
| `ALUMNO_APP` | Solo sus propios boletines e informes de asistencia |

El menú lateral (`_nav.js`) se filtra dinámicamente con `filterNavItems(items, userRoles)` según el rol extraído del JWT almacenado en `localStorage`. El backend valida el rol en cada endpoint protegido.

---

## 9. Resumen de Relaciones Clave

| Relación | Tabla/Mecanismo |
|----------|----------------|
| Alumno ↔ Materia | `t_inscripciones` (por ciclo lectivo y tipo de inscripción) |
| Alumno ↔ Nota | `t_nota` (por materia + período + tipo de nota) |
| Alumno ↔ Asistencia | `t_inasistencia` (por materia + fecha) |
| Materia ↔ Curso | `t_materia.id_curso` |
| Materia ↔ Docente | `t_materia.id_entidad` |
| Materia ↔ Catálogo | `t_materia.id_nombre_materia` → `t_nombre_materia` |
| Curso ↔ Ciclo Lectivo | `t_curso.id_ciclo_lectivo` |
| Ciclo ↔ Plan Académico | `t_ciclo_lectivo.id_plan` |
| Usuario ↔ Persona | `t_usuarios.id_entidad` (opcional) |
| Nota ↔ Boletín | `t_tipo_nota.es_final = True` filtra las notas del boletín |

---

*Este documento refleja el estado de la implementación al 2026-05-10.*
