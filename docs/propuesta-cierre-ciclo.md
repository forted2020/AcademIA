# Propuesta: Cierre de Ciclo Lectivo en AcademIA

> **Fecha**: 2026-05-26
> **Estado**: Propuesta técnica para evaluación externa.
> **Contexto**: AcademIA es un sistema de gestión académica (FastAPI + React + MySQL) usado en una institución educativa de nivel secundario. Hoy implementa la primera mitad de un cierre real (marcado de previas) y se evalúa si el resto del modelo conceptual del cierre tiene sentido aplicarlo.

---

## 1. ¿Qué es, conceptualmente, "cerrar un ciclo"?

Es el momento institucional en el que un período lectivo deja de estar **en curso** y pasa a ser una pieza histórica y firme del trayecto del alumno. Tiene tres dimensiones interdependientes:

### 1.1. Dimensión académica — Consolidación de resultados

Durante el ciclo, las notas son **dinámicas**: se cargan, se corrigen, se completan recuperatorios. Al cerrar el ciclo, el sistema toma una *foto* y declara:

- *"Estas son las notas finales con las que cada alumno termina cada materia."*
- *"Estas son las inasistencias acumuladas."*
- *"De acuerdo a esas notas e inasistencias, este alumno aprobó/no aprobó/queda con previa cada materia."*

Esa consolidación es la que habilita las preguntas posteriores: ¿cuántas previas arrastra el alumno?, ¿está en condiciones de pasar al año siguiente?, ¿puede inscribirse a una mesa?

### 1.2. Dimensión administrativa — Cambio de estado del alumno

El cierre formaliza el estado del alumno respecto de cada materia y de su trayectoria global:

**Por materia**:
- *Aprobada* → la materia desaparece de su carga pendiente.
- *Desaprobada* → se convierte en **previa**, deuda que se arrastra y eventualmente condiciona avances.
- *Pendiente de mesa* (si se modela) → estado intermedio hasta la próxima mesa examinadora.

**Global**:
- *Promovido / Regular* → pasa al año siguiente.
- *Libre / Libre Concurrente* → por exceso de inasistencias, no puede aprobar regularmente.
- *Repitente* → no alcanza las condiciones de promoción.

### 1.3. Dimensión temporal — Línea divisoria

Marca el límite entre **lo que aún se puede modificar** y **lo que ya es historia**. Implica:

- Bloquear la edición de notas e inasistencias del ciclo cerrado.
- Requerir autorización explícita para reabrir (auditable).
- Las inscripciones del ciclo siguiente leen el cierre como dato congelado.

---

## 2. Estado actual en AcademIA

El sistema hoy cubre **una parte de la primera dimensión**. Concretamente, el flujo implementado es:

| Pieza | Implementación actual |
|-------|----------------------|
| Endpoint | `POST /api/previas/cerrar-ciclo/{id_ciclo_lectivo}` |
| UI | Botón "Cerrar ciclo y recalcular previas" en Gestión Académica → Materias Previas |
| Lógica | Recorre inscripciones activas del ciclo, busca la nota final (`t_tipo_nota.es_final = True`, toma la mayor) y aplica `es_previa = nota_final < nota_aprobacion` |
| Persistencia | Flag `t_inscripciones.es_previa BOOLEAN` (no hay tabla aparte de previas) |
| Configurabilidad | El umbral `nota_aprobacion` se lee de `t_configuracion_sistema` |
| Idempotencia | Sí — se puede re-ejecutar; si cambian las notas, se ajusta el flag |
| Reversibilidad automática | Sí — si al re-ejecutar la nota ya está aprobada, levanta el flag |
| Acción manual paralela | Sí — `PUT /api/previas/{id_inscripcion}/levantar` |

### 2.1. Lo que el cierre actual NO hace

Por diseño minimalista, el cierre actual deja afuera:

1. **No marca el ciclo como "cerrado"**: `t_ciclo_lectivo` no tiene campo de estado; el ciclo se ve igual antes y después de la operación.
2. **No bloquea edición**: notas, inasistencias e inscripciones siguen siendo editables tras el cierre.
3. **No calcula condición global** del alumno (regular/libre/repitente). El flag de previas existe a nivel inscripción, no a nivel alumno-ciclo.
4. **No considera inasistencias** en el cierre. Aunque el sistema ya computa umbrales (20 → reincorporación, 28 → libre) sobre el endpoint de inasistencias, ese cómputo no se persiste como parte del cierre.
5. **No emite documentación final** (boletín definitivo, acta de promoción, listado de regulares).
6. **No notifica** a alumnos, docentes ni familias.
7. **No deja traza temporal**: no se sabe cuándo se cerró el ciclo, quién lo cerró, ni con qué configuración (`nota_aprobacion`) corrió.

---

## 3. Brecha entre lo conceptual y lo implementado

| Dimensión / Pieza | Estado |
|-------------------|--------|
| Marcar previas según notas finales | ✅ Implementado |
| Persistir momento y autoría del cierre | ⛔ Falta |
| Marcar el ciclo como "cerrado" (estado en `t_ciclo_lectivo`) | ⛔ Falta |
| Bloquear edición de notas/inasistencias del ciclo cerrado | ⛔ Falta |
| Procedimiento de "reapertura" auditable | ⛔ Falta |
| Calcular condición global del alumno (regular/libre/repitente) | ⛔ Falta |
| Integrar inasistencias (umbrales 20/28) al cierre | ⛔ Parcial — calculadas, no persistidas |
| Generar documentación de cierre (boletín final, acta de promoción) | ⛔ Falta |
| Notificación a alumnos/familias | ⛔ Falta |

---

## 4. Propuesta de evolución (incremental, por capas)

La idea es **no hacerlo de golpe**. Se propone una secuencia de capas, cada una autónoma y desplegable por separado.

### Capa 1 — Estado del ciclo y trazabilidad del cierre

**Objetivo**: que "cerrar" deje de ser una acción que pasa desapercibida y se convierta en un hito persistido y auditable.

**Cambios de modelo**:

```sql
ALTER TABLE t_ciclo_lectivo
  ADD COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'EN_CURSO',
       -- valores posibles: EN_CURSO | CERRADO | REABIERTO
  ADD COLUMN cerrado_en       DATETIME NULL,
  ADD COLUMN cerrado_por      INT NULL,         -- FK a t_usuarios
  ADD COLUMN nota_aprobacion_aplicada DECIMAL(4,2) NULL;
       -- captura la nota_aprobacion que regía al momento del cierre
```

Adicionalmente, una tabla de auditoría de eventos de cierre:

```sql
CREATE TABLE t_ciclo_evento (
  id_evento        INT AUTO_INCREMENT PRIMARY KEY,
  id_ciclo_lectivo INT NOT NULL,
  tipo_evento      VARCHAR(20) NOT NULL,  -- CIERRE | REAPERTURA
  id_usuario       INT NOT NULL,
  timestamp        DATETIME DEFAULT CURRENT_TIMESTAMP,
  motivo           TEXT NULL,
  snapshot_config  JSON NULL,
  FOREIGN KEY (id_ciclo_lectivo) REFERENCES t_ciclo_lectivo(id_ciclo_lectivo)
);
```

**Cambios de API**:
- `POST /api/previas/cerrar-ciclo/{id}` cambia su nombre a `POST /api/ciclos/{id}/cerrar` y, además de recalcular previas, setea `estado = 'CERRADO'`, registra el evento y guarda el snapshot de configuración.
- Nuevo `POST /api/ciclos/{id}/reabrir` que requiere `motivo` obligatorio.

**Impacto en UI**: badge visible en cada ciclo lectivo indicando su estado. Modal de confirmación al cerrar.

---

### Capa 2 — Bloqueos de edición sobre ciclos cerrados

**Objetivo**: garantizar que un ciclo cerrado no se modifica sin pasar por reapertura formal.

**Cambios**:
- En `routes_notas.py` (`POST /upsert`, `POST /`): si la materia pertenece a un ciclo `CERRADO`, devolver 409 con mensaje explícito.
- Idem en `routes_inasistencias.py` (carga e import).
- Idem en `routes_inscripciones.py` (lote y baja individual).

**Excepción**: los usuarios con rol `ADMIN_SISTEMA` pueden ver el bloqueo y disparar reapertura desde la UI.

**Impacto en UI**:
- En `CargaNotas.jsx` y vistas relacionadas: detectar el estado del ciclo y deshabilitar inputs con un banner explicativo.
- Botón "Reabrir ciclo" para administradores, con modal y motivo.

---

### Capa 3 — Condición global del alumno por ciclo

**Objetivo**: que el cierre produzca un dato consolidado a nivel **alumno–ciclo**, no solo a nivel inscripción.

**Cambios de modelo**:

```sql
CREATE TABLE t_condicion_alumno_ciclo (
  id_condicion      INT AUTO_INCREMENT PRIMARY KEY,
  id_entidad        INT NOT NULL,
  id_ciclo_lectivo  INT NOT NULL,
  condicion         VARCHAR(30) NOT NULL,
    -- REGULAR | LIBRE | LIBRE_CONCURRENTE | REPITENTE | PROMOVIDO_CON_PREVIAS
  cantidad_previas  INT NOT NULL DEFAULT 0,
  inasistencias_computables DECIMAL(6,2) NOT NULL DEFAULT 0,
  observaciones     TEXT NULL,
  calculado_en      DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_alumno_ciclo (id_entidad, id_ciclo_lectivo)
);
```

**Reglas de derivación** (configurables, parten de las normativas vigentes):

1. Si inasistencias computables ≥ umbral_libre → `LIBRE` (o `LIBRE_CONCURRENTE` según subregla).
2. Si cantidad_previas > umbral_repitencia (configurable, ej: 3) → `REPITENTE`.
3. Si 0 < cantidad_previas ≤ umbral_repitencia → `PROMOVIDO_CON_PREVIAS`.
4. Si cantidad_previas = 0 y inasistencias OK → `REGULAR` o `PROMOVIDO`.

Todas las reglas se exponen como claves de `t_configuracion_sistema` para que la institución las ajuste sin tocar código.

**Impacto en UI**:
- Vista de alumno: badge de condición por ciclo.
- Nuevo informe "Condición por ciclo" en el hub de informes.
- Filtro en el listado de previas y de riesgo de repitencia: "Solo repitentes", "Solo libres", etc.

---

### Capa 4 — Documentación oficial del cierre

**Objetivo**: que el cierre produzca los documentos que la institución necesita entregar.

**Documentos a generar** (todos como PDF firmados con la configuración global):
1. **Boletín final** del alumno (versión definitiva, marca de "ciclo cerrado").
2. **Acta de promoción** por curso/división — listado oficial con condición final.
3. **Acta de reincorporación** para alumnos en umbral de inasistencias.
4. **Listado de previas generadas en el ciclo** — auditoría.

Cada documento se genera bajo demanda pero el cierre opcionalmente puede dejar un *snapshot* almacenado para reimpresión idéntica.

---

### Capa 5 — Notificaciones

**Objetivo**: comunicar el cierre a los actores relevantes.

- Notificación in-app a alumnos: condición final del ciclo + link al boletín.
- Notificación a docentes: confirmación de que sus materias quedaron cerradas.
- (Futuro) Email a familias.

Aprovecha la tabla `t_notificaciones` y `t_notif_config` que ya existen en el modelo.

---

## 5. Preguntas para el evaluador

Estas son las preguntas que motivan esta propuesta. Una respuesta clara a cada una nos permite decidir cuánto avanzar.

1. **¿Aplica el concepto completo a esta institución?** O sea: ¿la institución diferencia formalmente "ciclo en curso" de "ciclo cerrado"? ¿Hay normativa interna que dependa de esa distinción (ej: cierre obligatorio antes de fecha X)?

2. **¿Cuándo se considera cerrado un ciclo en la práctica?** ¿Hay una fecha administrativa fija, depende de la finalización de mesas, o queda a criterio del equipo directivo?

3. **¿Se requiere bloqueo estricto de edición tras el cierre?** ¿O conviven habitualmente correcciones tardías sin necesidad de un procedimiento formal de "reapertura"?

4. **¿Qué condiciones globales del alumno son normativas?** ¿Las cuatro propuestas (REGULAR, LIBRE, REPITENTE, PROMOVIDO_CON_PREVIAS) cubren la realidad, o faltan estados como "asistido", "compensatoria de febrero", "egresado"?

5. **¿Cuántas previas equivalen a repitencia?** ¿Es un número fijo (ej: 3) o depende del nivel (1er año vs 5to)?

6. **¿Existe una mesa examinadora formal entre el cierre y la promoción?** Si sí, ese período intermedio debería tener su propio estado (ej: `CERRADO_PENDIENTE_MESAS`).

7. **¿Qué documentación de cierre genera hoy la institución manualmente?** Sabiendo esto podemos priorizar qué PDFs implementar primero.

---

## 6. Riesgos y consideraciones

- **Migración de ciclos históricos**: los ciclos 2023, 2024, 2025 ya cargados quedarán en estado `EN_CURSO` por defecto. Hay que decidir si se "cierran masivamente" como parte del despliegue de la Capa 1 o se dejan así (lo que implica que el cómputo de previas seguiría usándose como hoy).

- **Reversibilidad vs auditoría**: si se implementa bloqueo, hay que cuidar que la **reapertura** sea siempre auditable (quién, cuándo, por qué). Sin eso el bloqueo es teatro: cualquier admin lo evade.

- **Riesgo de sobre-diseño**: las Capas 3-5 agregan modelo y operaciones que pueden no usarse si la institución no las pide. Una opción conservadora es **detenerse en la Capa 2** y dejar las demás como deuda condicional.

- **Compatibilidad con el modelo de previas actual**: la propuesta no rompe nada. El flag `t_inscripciones.es_previa` sigue siendo la fuente de verdad y se sigue alimentando del mismo recálculo, solo que ahora forma parte de un evento más amplio.

---

## 7. Resumen ejecutivo

| Pregunta | Respuesta |
|----------|-----------|
| ¿Hoy AcademIA "cierra" un ciclo? | Solo en parte: marca previas y nada más. |
| ¿Es suficiente? | Depende de qué espera la institución del verbo *cerrar*. |
| ¿Se puede crecer sin romper lo actual? | Sí, propuesta en 5 capas independientes. |
| ¿Cuál es el mínimo aceptable para un cierre creíble? | Capas 1 y 2: estado persistido + bloqueo de edición + reapertura auditable. |
| ¿Cuál es el ideal? | Las 5 capas. |
| ¿Cuál es la decisión pendiente? | Validar con el evaluador cuál es el alcance que aplica a esta institución. |
