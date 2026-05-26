# AcademIA — Pendientes y Requerimientos

> **Origen**: puntos accionables extraídos de la revisión del informe funcional (mayo 2026).
> **Documento de referencia**: [`informe-funcional-relaciones-datos.md`](./informe-funcional-relaciones-datos.md)

Este archivo lista correcciones al modelo, features faltantes y requerimientos de configuración detectados durante la revisión funcional. No reemplaza al informe oficial: es la lista de trabajo pendiente.

---

## 1. Correcciones al modelo de datos

### 1.1. `t_nota` — falta `id_ciclo_lectivo` explícito
Hoy el ciclo se infiere por la cadena `t_nota.id_materia → t_materia.id_curso → t_curso.id_ciclo_lectivo`. Conviene incorporar `id_ciclo_lectivo` como columna directa en `t_nota` para:
- Simplificar consultas de boletín/acta por ciclo.
- Evitar joins innecesarios en reportes históricos.
- Soportar el caso en que una materia se reutilice entre ciclos.

**Impacto**: migración + actualización de endpoints de notas + ajuste de upsert.

### 1.2. ~~Revisar relación `t_curso` ↔ `t_ciclo_lectivo`~~ ✅ Cerrado (2026-05-25)
**Decisión**: se **mantiene** el modelo actual. Cada curso es una instancia específica de un ciclo lectivo (ej: "1ro A 2025" y "1ro A 2026" son dos registros distintos de `t_curso` con el mismo nombre y distinto `id_ciclo_lectivo`). No requiere cambios.

---

## 2. Validaciones y configuración global

### 2.1. ~~Validación de notas y nota de aprobación configurables~~ ✅ Cerrado (2026-05-25 — Fase 2)
**Implementado**: validador centralizado en [`Services/config_service.py`](../backend_AcademiA/backend-master/Services/config_service.py) (`validar_nota_o_lanzar`), aplicado en `POST /api/notas/` y `POST /api/notas/upsert`. El frontend valida antes del envío usando `getRangoNotas` exportado desde [`useConfigSistema`](../frontend_AcademiA/src/hooks/useConfigSistema.js), y propaga el mensaje del backend si el rango se desincroniza.
En todo el sistema (carga, edición, upsert, importación) las notas deben validarse contra **valores configurables** desde `t_configuracion_sistema`:
- `nota_minima` (default `0`)
- `nota_maxima` (default `10`)
- `nota_aprobacion` (default `6`)

Rechazar valores fuera del rango `[nota_minima, nota_maxima]` con error claro. La `nota_aprobacion` define el umbral usado para marcar aplazos (sección 5.1) y para determinar materias previas (sección 7.2).

### 2.2. ~~Menú de configuración global~~ ✅ Cerrado (2026-05-25 — Fase 1)
**Implementado**: nueva pestaña **Académico** en [`ConfiguracionGeneral.jsx`](../frontend_AcademiA/src/views/configuracion/ConfiguracionGeneral/ConfiguracionGeneral.jsx) con los bloques *Calificaciones* (nota mínima/máxima/aprobación) e *Inasistencias* (umbrales de reincorporación y libre). Claves sembradas por [`run_configuracion_academica_seed.py`](../backend_AcademiA/backend-master/migrations/run_configuracion_academica_seed.py) en `t_configuracion_sistema`. El modo de cómputo (MATERIA/CURSO) reutiliza la clave preexistente `modo_inscripcion` en la pestaña Sistema.

Validación local antes de persistir: nota mínima < máxima, aprobación dentro del rango, umbral de reincorporación < umbral de libre.

---

## 3. Inasistencias

### 3.1. ~~Catálogo normativo de tipos~~ ✅ Cerrado (2026-05-25 — Fase 3)
Cargar en `t_tipo_inasistencia` los siguientes valores:

| Tipo                          | Valor |
|-------------------------------|-------|
| Inasistencia                  | 1.00  |
| Llegada tarde a la escuela    | 0.25  |
| Llegada tarde al aula         | 0.25  |
| Retiro                        | 0.50  |
| Inasistencia por la tarde     | 0.50  |
| Ingreso fuera de horario      | 0.50  |

### 3.2. ~~Modo de cómputo configurable~~ ✅ Cerrado (preexistente — reutilizado)
**Implementado previamente**: clave `modo_inscripcion` en `t_configuracion_sistema` con valores `MATERIA` (instituto) y `CURSO` (escuela). Endpoint `PUT /api/configuracion/modo-inscripcion` con auditoría en `t_configuracion_cambio_log`. UI en pestaña "Sistema" de [`ConfiguracionGeneral.jsx`](../frontend_AcademiA/src/views/configuracion/ConfiguracionGeneral/ConfiguracionGeneral.jsx).

### 3.3. ~~Umbrales normativos y alertas~~ 🟡 Parcial (Fase 3)
**Implementado**:
- Claves `inasistencias_umbral_reincorporacion` y `inasistencias_umbral_libre` configurables desde la pestaña Académico.
- Cálculo automático en `GET /api/estudiantes/inasistencias/{id_entidad}/{year}`: devuelve flags `requiereActaReincorporacion` y `caracterLibre` computados sobre el total no justificado.
- Banner de alerta visual en [`InformeAsistencia.jsx`](../frontend_AcademiA/src/views/estudiantes/InformeAsistencia.jsx) con dos niveles (advertencia / crítica).

**Pendiente**:
- Generación del **PDF de Acta de Reincorporación** cuando se cruza el umbral (se integrará junto a los informes faltantes de la sección 6).

---

## 4. ~~Renombrar "Acta de Examen" → "Planilla de Calificaciones"~~ ✅ Cerrado (2026-05-25 — Fase 4)

**Implementado**:
- Menú lateral ([`_nav.js`](../frontend_AcademiA/src/_nav.js)): label "Planilla de Calificaciones".
- Ruta nueva: `/estudiante/planilla-calificaciones`. Se mantiene `/estudiante/acta-examen` como alias retrocompatible.
- Archivo renombrado: `ActaExamen.jsx` → [`PlanillaCalificaciones.jsx`](../frontend_AcademiA/src/views/estudiantes/PlanillaCalificaciones.jsx). Componente exportado con el nombre nuevo.
- Título de la vista, encabezado y nombre del PDF actualizados.
- Endpoint `GET /api/notas/planilla-acta`: **sin cambios** (ya usaba "planilla" en el nombre).
- `t_formato_config.codigo_formato = 'acta_examen'`: **se deja igual** (decisión confirmada). El template muestra "Planilla de Calificaciones" como nombre visible, pero el código sigue mapeando a `acta_examen` en BD.

---

## 5. Mejoras visuales en planillas

### 5.1. ~~Distinguir aplazos~~ ✅ Cerrado (2026-05-25 — Fase 5)
**Implementado**: notas inferiores a `nota_aprobacion` se renderizan en rojo, negrita y con fondo rosa pálido en [`ActaExamen.jsx`](../frontend_AcademiA/src/views/estudiantes/ActaExamen.jsx) y [`BoletinCalificaciones.jsx`](../frontend_AcademiA/src/views/estudiantes/BoletinCalificaciones.jsx). El PDF replica el resaltado vía `didParseCell` de `jspdf-autotable`. El badge de "Definitiva" también escala sus tres variantes (aprobado/proceso/reprobado) en función del umbral configurado.

---

## 6. Informes faltantes

Implementar los siguientes documentos/reportes:

| Documento | Descripción |
|-----------|-------------|
| Constancia de alumno regular | Certifica que el estudiante se inscribió efectivamente en un ciclo lectivo |
| Acta de inscripción a mesas examinadoras | Lista de alumnos inscriptos a una mesa de examen |
| Inscriptos por materia | Listado de alumnos inscriptos a una materia específica |
| Listado de alumnos por curso y división | Padrón por curso |
| Listado de docentes y materias asignadas | Vista para gestión académica |
| Estudiantes que adeudan materia | Alumnos con materias no aprobadas |
| Listado de previas | Materias previas pendientes por alumno |
| Estudiantes con más materias adeudadas | Listado de riesgo de repitencia, ordenado por cantidad de materias |

---

## 7. Features funcionales faltantes

### 7.1. Ficha de aptitud física — ⏸ Diferido
**Estado**: bloqueado hasta recibir el modelo/formulario oficial. No se planifica implementación todavía.

### 7.2. Materias previas
Modelar y gestionar materias que el alumno no aprobó durante un ciclo lectivo y arrastra como pendientes.

**Decisión de modelo**: NO se crea tabla aparte. Se agrega un **campo en `t_inscripciones`** (o `t_materia` según el caso de uso final — definir en la fase) que marque la condición de "previa".

Propuesta concreta: agregar en `t_inscripciones` la columna `es_previa BOOLEAN DEFAULT FALSE` (o un enum `condicion` con valores `regular | previa | aprobada`). El estado "previa" se determina al cerrar el ciclo lectivo: si la nota final < `nota_aprobacion`, la inscripción queda marcada como previa. Cuando el alumno aprueba la materia en una mesa o ciclo posterior, el flag se levanta.

Reglas a definir en la fase:
- Quién marca/desmarca la condición (proceso automático al cierre del ciclo vs. manual).
- Cómo se relacionan inscripciones de distintos ciclos lectivos para una misma materia (¿una nueva inscripción del ciclo siguiente "cancela" la previa al aprobar?).
- Integración con listados (punto 6).

### 7.3. Inscripción a mesas examinadoras
Flujo paralelo al de inscripción a materias, pero para mesas de examen. Implica:
- Modelo de "mesa examinadora" (fecha, materia, tribunal).
- Endpoint de inscripción a mesa.
- Acta de inscripción a mesa (punto 6).
- Carga de nota de mesa diferenciada del trimestre.

---

## 8. Prioridad sugerida

1. **Críticos para uso normativo**: 2.1 (validación 0–10), 3.1 (catálogo inasistencias), 3.3 (umbrales).
2. **Bloquean reportes correctos**: 1.1 (ciclo lectivo en `t_nota`), 5.1 (distinguir aplazos).
3. **Configurabilidad institucional**: 2.2 (menú config), 3.2 (modo cómputo).
4. **Mejoras de naming/UX**: 4 (rename planilla).
5. **Nuevas features**: 6 (informes), 7 (aptitud, previas, mesas).

---

*Cada punto resuelto debe reflejarse en [`informe-funcional-relaciones-datos.md`](./informe-funcional-relaciones-datos.md) en el mismo commit, según indica [`CLAUDE.md`](../CLAUDE.md).*
