# Plan de Implementación — Correcciones de Modelo y Procesos

**Fecha:** 2026-05-22  
**Rama sugerida:** `fase/correcciones-modelo-datos`

---

## Visión general

Este plan implementa cinco correcciones identificadas en el análisis funcional del sistema. Cada etapa es independiente y puede aplicarse por separado. El orden respeta las dependencias entre cambios: primero el modelo de datos, luego las rutas que lo usan, y finalmente el documento funcional.

---

## Etapa 1 — Modelo de datos: `t_nota` agrega `id_ciclo_lectivo`

### Contexto

`t_nota` no tiene referencia directa al ciclo lectivo. El ciclo es derivable vía `t_materia → t_curso → t_ciclo_lectivo`, pero eso requiere dos JOINs en cada consulta. Más importante: si en el futuro se reasignan materias entre ciclos (o se reutilizan IDs), las notas quedan sin contexto temporal propio.

### 1.1 — `models.py`: agregar columna

En la clase `Nota`, agregar:

```python
id_ciclo_lectivo = Column(
    Integer,
    ForeignKey("t_ciclo_lectivo.id_ciclo_lectivo"),
    nullable=True  # nullable para no romper registros existentes
)
ciclo_lectivo = relationship("CicloLectivo")
```

### 1.2 — Migration SQL

```sql
-- Agregar columna
ALTER TABLE t_nota
  ADD COLUMN id_ciclo_lectivo INT NULL,
  ADD CONSTRAINT fk_nota_ciclo
    FOREIGN KEY (id_ciclo_lectivo)
    REFERENCES t_ciclo_lectivo(id_ciclo_lectivo);

-- Backfill: derivar el ciclo de cada nota desde materia → curso → ciclo
UPDATE t_nota n
JOIN t_materia m  ON n.id_materia = m.id_materia
JOIN t_curso    c ON m.id_curso   = c.id_curso
SET n.id_ciclo_lectivo = c.id_ciclo_lectivo
WHERE n.id_ciclo_lectivo IS NULL;
```

### 1.3 — `schemas.py`: agregar campo

En `NotaUpsert`:
```python
id_ciclo_lectivo: Optional[int] = None  # ya existe, no requiere cambio
```

En `NotaCreate` y `NotaResponse`:
```python
id_ciclo_lectivo: Optional[int] = None
```

### 1.4 — `routes_notas.py`: derivar ciclo al hacer upsert

En el endpoint `POST /notas/upsert`, al crear una nota nueva, si `id_ciclo_lectivo` no viene en el payload, derivarlo desde la materia:

```python
ciclo_id = payload.id_ciclo_lectivo
if not ciclo_id:
    materia = db.query(models.Materia).options(
        joinedload(models.Materia.curso)
    ).filter(models.Materia.id_materia == payload.id_materia).first()
    ciclo_id = materia.curso.id_ciclo_lectivo if materia and materia.curso else None

nueva_nota = models.Nota(
    ...
    id_ciclo_lectivo=ciclo_id,
)
```

---

### ✅ Cómo verificar la Etapa 1

1. Ejecutar la migration SQL y corroborar con:
   ```sql
   SELECT id_nota, id_materia, id_ciclo_lectivo FROM t_nota LIMIT 10;
   ```
   → Todos los registros existentes deben tener `id_ciclo_lectivo` poblado (no NULL).

2. Hacer `POST /api/notas/upsert` con un payload sin `id_ciclo_lectivo`:
   ```json
   { "id_alumno": 1, "id_materia": 3, "id_tipo_nota": 2, "valor": 8.0, "id_periodo": 1 }
   ```
   → La nota creada debe tener `id_ciclo_lectivo` derivado automáticamente.

3. Hacer `POST /api/notas/upsert` enviando `id_ciclo_lectivo` explícitamente → debe respetarse ese valor.

---

## Etapa 2 — Modelo de datos: `t_inasistencia` elimina `id_curso`

### Contexto

`id_curso` en `t_inasistencia` es redundante: `id_materia` ya referencia a `t_materia`, y `t_materia.id_curso` da el curso. Tener ambos campos sin constraint de consistencia permite guardar una inasistencia con `id_materia` de "1er A" e `id_curso` de "2do B" sin que el sistema lo detecte.

### 2.1 — `models.py`: eliminar columna

En la clase `Inasistencia`, eliminar:

```python
# Eliminar esta línea:
id_curso = Column(Integer, ForeignKey("t_curso.id_curso"))
```

### 2.2 — Migration SQL

```sql
-- Verificar antes de ejecutar que ninguna query activa filtre por esta columna
ALTER TABLE t_inasistencia DROP COLUMN id_curso;
```

> ⚠️ Ejecutar en desarrollo primero. En producción, verificar que no haya queries directas al campo antes de aplicar.

### 2.3 — `routes_inasistencias.py`: revisar queries

El endpoint actual `GET /estudiantes/inasistencias/{id_entidad}/{year}` no usa `id_curso` directamente — filtra solo por `id_entidad` y año. No requiere cambios.

Si en el futuro se necesita filtrar por curso, hacerlo vía JOIN:

```python
# En lugar de Inasistencia.id_curso == curso_id
# usar:
.join(models.Materia, models.Materia.id_materia == models.Inasistencia.id_materia)
.filter(models.Materia.id_curso == curso_id)
```

---

### ✅ Cómo verificar la Etapa 2

1. Ejecutar la migration y confirmar:
   ```sql
   DESCRIBE t_inasistencia;
   ```
   → La columna `id_curso` no debe aparecer.

2. Llamar a `GET /api/estudiantes/inasistencias/{id_entidad}/{year}` con un alumno que tenga inasistencias → debe devolver resultados correctos sin errores.

3. Intentar crear una inasistencia con el endpoint correspondiente → no debe pedir ni aceptar `id_curso`.

---

## Etapa 3 — Corrección del upsert de notas

### Contexto

La clave de búsqueda del upsert actual es `(alumno, materia, tipo_nota)`. Esto hace que si el docente carga la nota de "Parcial" del 1er trimestre y luego la del 2do trimestre para el mismo tipo, la segunda **sobreescribe** la primera. El campo `id_periodo` existe en la tabla pero no se usa como discriminador en la búsqueda.

La clave correcta es `(alumno, materia, tipo_nota, periodo)`.

### 3.1 — `schemas.py`: `id_periodo` pasa a ser requerido en `NotaUpsert`

```python
class NotaUpsert(BaseModel):
    id_alumno: int
    id_materia: int
    id_tipo_nota: int
    valor: Optional[float] = None
    id_periodo: int              # ← antes era Optional[int] = None
    id_ciclo_lectivo: Optional[int] = None
    id_curso: Optional[int] = None
    id_entidad_carga: Optional[int] = None
```

### 3.2 — `routes_notas.py`: corregir filtro del upsert

```python
nota_db = db.query(models.Nota).filter(
    models.Nota.id_entidad_estudiante == payload.id_alumno,
    models.Nota.id_materia            == payload.id_materia,
    models.Nota.id_tipo_nota          == payload.id_tipo_nota,
    models.Nota.id_periodo            == payload.id_periodo,   # ← agregar
).first()
```

---

### ✅ Cómo verificar la Etapa 3

1. Crear una nota para alumno=1, materia=3, tipo_nota=2, **periodo=1** con valor 7.0.
2. Crear otra nota para alumno=1, materia=3, tipo_nota=2, **periodo=2** con valor 9.0.
   → Deben existir **dos registros separados** en `t_nota`.
3. Crear otra nota para alumno=1, materia=3, tipo_nota=2, **periodo=1** con valor 8.0.
   → Debe **actualizar** el registro del periodo=1, no crear uno nuevo. Verificar en DB que quede una sola fila para esa combinación.
4. Enviar un upsert **sin `id_periodo`** → debe devolver error 422 de validación.

---

## Etapa 4 — Baja individual de inscripción (solo modo Instituto)

### Contexto

No existe endpoint para dar de baja a un alumno de una materia específica. El campo `deleted_at` existe en `t_inscripciones` pero ninguna ruta lo usa.

Esta funcionalidad aplica **solo** cuando el sistema está en modo `MATERIA` (instituto). En modo `CURSO` (escuela primaria/secundaria), la inscripción es por curso completo y no tiene sentido bajar materias individuales.

El modo se lee de `t_configuracion_sistema` con clave `modo_inscripcion`. Si la clave no existe, se asume `MATERIA` como default.

### 4.1 — `routes_inscripciones.py`: nuevo endpoint

```python
from datetime import datetime
from models import ConfiguracionSistema

@router.delete("/{id_inscripcion}", status_code=200)
def baja_inscripcion(
    id_inscripcion: int,
    db: Session = Depends(get_db),
    current_user: UserAuthData = Depends(get_current_user),
):
    if current_user.rol_sistema not in ["ADMIN_SISTEMA", "DOCENTE_APP"]:
        raise HTTPException(status_code=403, detail="Sin permisos para dar de baja inscripciones.")

    # Leer modo del sistema
    config = db.query(ConfiguracionSistema).filter(
        ConfiguracionSistema.clave == "modo_inscripcion"
    ).first()
    modo = config.valor if config else "MATERIA"

    if modo == "CURSO":
        raise HTTPException(
            status_code=403,
            detail="La baja individual de materias no está disponible en modo Escuela. "
                   "En este modo la inscripción es por curso completo.",
        )

    inscripcion = db.query(Inscripcion).filter(
        Inscripcion.id_inscripcion == id_inscripcion,
        Inscripcion.deleted_at.is_(None),
    ).first()

    if not inscripcion:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada o ya dada de baja.")

    inscripcion.deleted_at = datetime.utcnow()
    db.commit()

    return {"mensaje": "Inscripción dada de baja correctamente.", "id_inscripcion": id_inscripcion}
```

### 4.2 — Seed de configuración

Agregar en `t_configuracion_sistema` la clave inicial (si no existe):

```sql
INSERT IGNORE INTO t_configuracion_sistema (clave, valor, descripcion)
VALUES ('modo_inscripcion', 'MATERIA',
        'Modo de inscripción: MATERIA (instituto) o CURSO (escuela). '
        'En modo CURSO no se permite la baja individual de materias.');
```

---

### ✅ Cómo verificar la Etapa 4

1. Con `modo_inscripcion = 'MATERIA'` (default):
   - Hacer `DELETE /api/inscripciones/{id}` con una inscripción activa.
   - → Debe retornar 200 y `deleted_at` debe estar poblado en DB.
   - Repetir la misma llamada → debe retornar 404 ("ya dada de baja").

2. Cambiar en DB `modo_inscripcion = 'CURSO'`:
   ```sql
   UPDATE t_configuracion_sistema SET valor = 'CURSO' WHERE clave = 'modo_inscripcion';
   ```
   - Hacer `DELETE /api/inscripciones/{otro_id}`.
   - → Debe retornar 403 con el mensaje explicativo.

3. Intentar la baja con un usuario `ALUMNO_APP` → debe retornar 403 de permisos.

4. Verificar que las notas e inasistencias del alumno en esa materia **no se eliminan** al dar de baja la inscripción.

---

## Etapa 5 — Documento funcional: correcciones y actualización

### Contexto

El documento `docs/informe-funcional-relaciones-datos.md` tiene inconsistencias que quedaron incorporadas con los desarrollos anteriores. Esta etapa actualiza el documento para reflejar el estado real del sistema después de las etapas 1–4.

### 5.1 — Correcciones a aplicar en el documento

1. **`t_nota`**: agregar `id_ciclo_lectivo` en la descripción de la tabla y en el diagrama de relaciones.

2. **`t_inasistencia`**: eliminar `id_curso` de la descripción de campos. Agregar nota: *"el curso se obtiene vía JOIN con `t_materia`"*.

3. **Upsert de notas**: actualizar la descripción del Proceso B para indicar que la clave de upsert es `(alumno, materia, tipo_nota, periodo)` y que `id_periodo` es requerido.

4. **Proceso F — Baja de inscripción individual**: agregar sección nueva:
   - Solo disponible en modo `MATERIA`.
   - Endpoint: `DELETE /api/inscripciones/{id_inscripcion}`.
   - Hace soft delete (`deleted_at`). No elimina notas ni inasistencias asociadas.
   - En modo `CURSO`, devuelve 403 con mensaje explicativo.

5. **Cursos y ciclos lectivos**: corregir la contradicción en el texto. Reemplazar *"Los cursos son independientes de los ciclos lectivos"* por: *"Cada ciclo lectivo instancia sus propios cursos. La combinación curso + ciclo define una cohorte anual (ej: '1er A del ciclo 2024'). Cada año se crean nuevos cursos vinculados al nuevo ciclo."*

6. **Configuración del sistema**: agregar la clave `modo_inscripcion` a la tabla de claves de `t_configuracion_sistema`.

7. **Tabla de endpoints**: agregar `DELETE /api/inscripciones/{id_inscripcion}` en la sección de Inscripciones.

8. **Eliminar todas las notas inline** del tipo "falta indicar ciclo lectivo" y similares — la información ya queda incorporada en el cuerpo del documento.

---

### ✅ Cómo verificar la Etapa 5

1. Buscar en el documento la palabra "falta" → no debe aparecer ninguna nota pendiente inline.
2. El diagrama de relaciones debe incluir `t_nota → t_ciclo_lectivo`.
3. La descripción de `t_inasistencia` no debe mencionar `id_curso` como campo propio.
4. La tabla de endpoints debe tener el `DELETE /api/inscripciones/{id}`.
5. La sección de procesos debe tener el Proceso F (baja de inscripción).
6. La descripción de cursos debe mencionar "cohorte anual" y no decir que son independientes del ciclo.

---

## Orden de ejecución recomendado

| Etapa | Depende de | Riesgo en producción |
|-------|-----------|----------------------|
| Etapa 1 (t_nota + ciclo) | — | Bajo — columna nullable, backfill seguro |
| Etapa 2 (t_inasistencia quita id_curso) | — | Medio — verificar queries antes |
| Etapa 3 (upsert de notas) | Etapa 1 | Bajo — solo cambia lógica de búsqueda |
| Etapa 4 (baja de inscripción) | — | Bajo — endpoint nuevo, no modifica existentes |
| Etapa 5 (documento) | Etapas 1–4 | Ninguno |

> La Etapa 2 es la de mayor cuidado: eliminar una columna es irreversible sin backup. Siempre hacer backup de `t_inasistencia` antes de ejecutar el `DROP COLUMN` en producción.
