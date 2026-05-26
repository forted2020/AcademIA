# AcademIA — Análisis del modelo de datos y propuestas de mejora

> Documento de trabajo para discutir la evolución estructural del sistema.
> Fecha: 2026-05-07

---

## 1. Modelo conceptual actual

```
Plan ──1:N──→ CicloLectivo ──1:N──→ Curso ──1:N──→ Materia
                                                        │
                                                        ├──→ docente (Entidad)
                                                        │
                                  Estudiante ←──N:M──→ Materia (vía Inscripcion)
                                                        │
                                                        └──→ Nota ←── Periodo, TipoNota
```

**El núcleo del modelo:** `Entidad` es una tabla universal — guarda alumnos, docentes y personal admin diferenciados por `id_tipo_entidad`. Esto es coherente y funciona bien.

---

## 2. Hallazgos críticos

### 🔴 2.1 Materia está acoplada a Curso, no a Plan

```python
class Materia:
    id_nombre_materia → t_nombre_materia  # "Matemática"
    id_curso          → t_curso           # "1°A del 2025"
    id_entidad        → t_entidad         # docente
```

**Consecuencia:** Si "Matemática" se dicta en 1°A y 1°B del mismo ciclo, hay **dos filas** en `t_materia` (una por curso). Si en 2026 vuelve a dictarse, **otras dos filas más**. El catálogo `t_nombre_materia` existe pero la materia "real" se replica sin parar.

**Problema concreto:**

- Cargar el plan de estudios una vez al año = duplicar 30+ materias × cada curso
- Si querés mover "Matemática" entre planes, tenés que tocar N filas
- No hay forma natural de preguntar "¿qué materias tiene el plan 2025?" sin pasar por cursos

### 🔴 2.2 Redundancias que pueden desincronizarse

| Tabla | Campo redundante | Por qué es redundante |
|-------|------------------|----------------------|
| `t_inscripciones` | `id_ciclo_lectivo` | Ya se llega vía `Materia → Curso → CicloLectivo` |
| `t_inasistencia` | `id_curso` | Ya se llega vía `Materia → Curso` |

Una inscripción podría apuntar a una materia del ciclo 2025 y tener `id_ciclo_lectivo = 2024` — la BD no lo impide.

### 🔴 2.3 La inscripción no representa el "acto" de inscribirse

Este es el hallazgo más importante en la práctica.

**Lo que el alumno hace:** "Me inscribo a 4°B del ciclo 2026"

**Lo que el sistema guarda:** N filas en `t_inscripciones`, una por cada materia de 4°B del 2026.

Esto es **lossy** — perdés la noción del "acto de inscripción" como unidad. Si después tenés que preguntar "¿a qué curso está inscripto Juan en 2026?", tenés que:

1. Buscar todas las inscripciones de Juan filtradas por ciclo
2. Hacer JOIN con `t_materia` para obtener el `id_curso` de cada una
3. Esperar que todas devuelvan el mismo curso (si no, hay inconsistencia)
4. Usar ese curso

Es trabajo de detective sobre algo que debería ser un solo dato.

### 🔴 2.4 DNI no es UNIQUE en `t_entidad`

Podés tener dos alumnos con el mismo DNI. Es un problema de integridad — el DNI **es** el identificador natural en Argentina.

### 🟡 2.5 Doble sistema de roles

- `t_tipo_entidad`: ESTUDIANTE / DOCENTE / ADMIN (clasifica a la persona física)
- `t_tipo_roles_usuarios`: ADMIN_SISTEMA / ALUMNO_APP / DOCENTE_APP (rol de login)

Ambos sirven para lo mismo en la práctica. Nada garantiza que un User con rol DOCENTE_APP esté linkeado a una Entidad de tipo DOCENTE.

### 🟡 2.6 CicloLectivo no tiene estado

No hay campo `activo` ni `cerrado`. ¿Cuál es el ciclo actual? Por convención "el más reciente" — pero ¿qué pasa cuando ya cargaste 2026 en diciembre y todavía falta cerrar 2025?

### 🟡 2.7 Frontend: ID inconsistente entre vistas

| Vista | Campo del alumno |
|-------|------------------|
| Inscripciones, Estudiantes | `id_entidad` |
| CargaNotas, ActaExamen | `id_alumno` |

Son el mismo dato (la PK de `t_entidad`), pero el backend devuelve nombres distintos según el endpoint. Cualquier persona nueva en el código se confunde.

### 🟡 2.8 Frontend: hooks duplicados

`ActaExamen.jsx` define `useCiclos`, `useCursosPorCiclo`, `useMateriasPorCurso` localmente. `CargaNotas.jsx` hace lo mismo con `useState` + `useEffect` manual. Es la misma cadena de dependencia repetida.

### 🟡 2.9 API: convenciones mezcladas

- `apiEstudiantes.js` exporta `{ getAll, get, create, update, remove }` (RESTful)
- `apiCursos.jsx` exporta `{ getCursosAll, getCursosCiclo, ... }` (verboso, redundante)
- Ciclos viven dentro de `apiMaterias` (semánticamente raro)
- Extensiones `.jsx` en archivos sin JSX

---

## 3. Propuesta para inscripciones (el cambio más importante)

### 3.1 ¿Por qué la propuesta original era incompleta?

La sugerencia original era *"quitar `id_ciclo_lectivo` de `t_inscripciones` y derivarlo por JOIN"*. Eso elimina una redundancia, pero **no resuelve el problema de fondo**: que inscribirse a un curso es una **operación atómica** que el modelo actual no representa.

### 3.2 Modelo propuesto en dos niveles

```
t_inscripcion_curso         (inscripción del alumno al curso/ciclo — el "acto")
   id_inscripcion_curso PK
   id_entidad           → alumno
   id_curso             → 4°B del 2026  (ya implica el ciclo)
   id_tipo_insc         → Regular / Recursante / Libre
   fecha_insc
   estado               → ACTIVA / BAJA / TRASLADO

t_inscripcion_materia       (la materia individual — generada al inscribirse al curso)
   id_inscripcion_materia PK
   id_inscripcion_curso → FK al "acto" anterior
   id_materia           → materia específica
   estado_materia       → CURSANDO / APROBADA / PREVIA / EQUIVALENCIA
```

### 3.3 Cómo se usa

| Caso | Comportamiento |
|------|----------------|
| **Inscripción normal** | El sistema crea **un registro** en `t_inscripcion_curso` y, en una transacción, **N registros** en `t_inscripcion_materia` (una por cada materia del curso). |
| **Pregunta "¿a qué curso está Juan en 2026?"** | Query directa a `t_inscripcion_curso`. Sin JOINs gimnásticos. |
| **Recursante parcial** | Un único `t_inscripcion_curso` con tipo `RECURSANTE_PARCIAL`. Los registros de `t_inscripcion_materia` marcan cuáles son nuevas y cuál es la recursada vía `estado_materia`. |
| **Equivalencia** | Un registro en `t_inscripcion_materia` con `estado_materia = EQUIVALENCIA`, sin necesidad de tocar nada más. |
| **Baja del alumno** | Marcar 1 fila como BAJA en `t_inscripcion_curso`. Los hijos se infieren. |

### 3.4 Ventajas concretas

| Antes | Con la propuesta nueva |
|-------|------------------------|
| "Inscribir a curso" = N filas sueltas | = 1 fila + N filas hijas, transaccional |
| Riesgo de inscripciones huérfanas a 1-2 materias | Imposible: si no hay curso, no hay materias |
| Dar de baja a un alumno = borrar N filas | = marcar 1 fila como BAJA |
| Reportes de matrícula = SELECT con DISTINCT y joins | = SELECT directo |
| Recursantes y libres difíciles de modelar | Cada nivel tiene su tipo |

### 3.5 ¿Qué pasa con `t_inasistencia`?

Acá la situación es distinta — quitarle `id_curso` y derivarlo por `Materia → Curso` **sigue siendo correcto** y no genera el problema que tiene la inscripción, porque una inasistencia **siempre es por materia** (el alumno faltó a Matemática del jueves), no por curso entero.

Si querés modelar "el alumno faltó al día completo de clases", eso ya es otro concepto — una `inasistencia_general` distinta.

---

## 4. Propuesta para Materias

Separar el concepto en dos niveles, similar a la idea de Inscripciones:

```
MateriaPlan          (catálogo del plan: "Matemática 1° año del Plan 2025")
   id_materia_plan PK
   id_nombre_materia → catálogo
   id_plan
   ano_curricular   → 1, 2, 3...
   carga_horaria

DictadoMateria       (instancia: "Matemática de 1°A en ciclo 2025, dictada por X")
   id_dictado PK
   id_materia_plan
   id_curso         → curso específico
   id_entidad       → docente
```

**Beneficios:**

- Un único lugar donde definir el plan de estudios
- Reusar el plan año tras año sin duplicar materias
- Permitir N docentes por dictado (parejas pedagógicas) si se agrega como N:M
- Preguntas como "¿qué materias tiene el plan 2025?" se responden con un SELECT trivial

---

## 5. Otras mejoras

### 5.1 Estado en `CicloLectivo`

Agregar columna `estado` con valores `PLANIFICADO | ACTIVO | CERRADO`. Una sola query trivial te dice cuál es el ciclo operativo.

### 5.2 Unificar el sistema de roles

Eliminar `t_tipo_entidad` o `t_tipo_roles_usuarios`. Quedarte con uno solo y referenciarlo desde `User`. La tabla `Entidad` no necesita saber "qué rol tiene" — eso lo determina su asociación con `User`.

### 5.3 DNI UNIQUE

Hacer `t_entidad.dni` UNIQUE (con índice único parcial donde `deleted_at IS NULL` para no romper soft delete).

### 5.4 Estandarizar nombres de campos en respuestas API

El backend debería devolver siempre `id_entidad` para personas físicas, sin alias `id_alumno`. Si cambia el nombre semántico, que sea por algún motivo fuerte — y entonces documentarlo.

### 5.5 Hooks reutilizables centralizados (frontend)

```
src/hooks/academia/
   useCiclos.js
   useCursosPorCiclo.js
   useMateriasPorCurso.js
   usePlanillaActa.js
```

Reemplazar las versiones locales en `ActaExamen` y los `useState`+`useEffect` ad-hoc en `CargaNotas`.

### 5.6 Reorganizar capa API (frontend)

```
src/api/
   client.js              (axios instance)
   ciclos.js
   cursos.js
   materias.js
   estudiantes.js
   docentes.js
   notas.js
   inscripciones.js
```

Cada uno exporta `{ list, get, create, update, remove, ...specials }`. Borrar el `api.js` monolítico.

### 5.7 Cachear promedio y definitiva

Si los reportes empiezan a ser lentos, agregar columnas calculadas en `t_nota` (o tabla aparte). Por ahora, calcular en runtime está bien.

### 5.8 Limpieza de nomenclatura

Decidir español o inglés para nombres de campo y migrar:
- `fec_nac` → `fecha_nacimiento`
- `cel` → `telefono_movil`
- `tipo_insc` → `tipo_inscripcion`

Renombrar `.jsx` a `.js` en archivos sin JSX (`apiCursos.jsx`, `apiMaterias.jsx`).

---

## 6. Orden recomendado de implementación

| # | Tarea | Impacto | Riesgo | Esfuerzo |
|---|-------|---------|--------|----------|
| 1 | Estado en `CicloLectivo` | Alto | Bajo | S |
| 2 | DNI UNIQUE | Alto | Bajo | S |
| 3 | Hooks reutilizables (frontend) | Medio | Bajo | M |
| 4 | Refactor de **Inscripciones** (sección 3) | Muy alto | Medio-alto | L |
| 5 | Refactor de **Materias** (sección 4) | Alto | Medio-alto | L |
| 6 | Quitar redundancia en `t_inasistencia` | Medio | Bajo | S |
| 7 | Unificar roles (5.2) | Medio | Medio | M |
| 8 | Estandarizar API y nombres (5.4, 5.6, 5.8) | Medio | Bajo | M |
| 9 | Cachear cálculos de notas (5.7) | Diferir | Bajo | M |

**Estrategia sugerida:**

1. Primero los puntos 1, 2, 3 — son chicos, alto valor, sin riesgo.
2. Después atacar **Inscripciones** (punto 4). Es el cambio que más dolor te está dando hoy y el que mejor se entiende del análisis. Requiere migración de datos pero es acotado.
3. Después **Materias** (punto 5). Cambio profundo pero conceptualmente similar: separar catálogo de instancia.
4. Los puntos 6-9 los podés ir haciendo en paralelo cuando toques cada módulo.

---

## 7. Preguntas abiertas para decidir

- ¿Hay alumnos con inscripciones parciales hoy (a 1-2 materias en lugar de un curso completo)? → Definir cómo migran al modelo nuevo.
- ¿El sistema necesita soportar "doble titulación" o "alumnos libres por materia"? → Si sí, el modelo de inscripción en dos niveles es aún más necesario.
- ¿Hay reportes externos (al ministerio, a padres) que asuman la estructura actual? → Identificarlos antes de migrar.
- ¿Qué pasa con datos históricos de ciclos cerrados? → Migrar todo o congelar la data vieja en su forma actual.
- ¿El plan de estudios cambia cada cuántos años? → Si cambia poco, el refactor de Materias es menos urgente. Si cambia seguido, es prioritario.
