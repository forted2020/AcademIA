# Propuesta: rediseño del modelo de inscripciones

> Documento focalizado para discutir el cambio estructural en `t_inscripciones`.
> Fecha: 2026-05-07

---

## 1. Tu modelo mental vs. el modelo de datos actual

**Lo que el alumno hace:** "Me inscribo a 4°B del ciclo 2026"

**Lo que el sistema guarda:** N filas en `t_inscripciones`, una por cada materia de 4°B del 2026.

Esto es **lossy** — perdés la noción del "acto de inscripción" como unidad. Si después tenés que preguntar *"¿a qué curso está inscripto Juan en 2026?"*, tenés que:

1. Buscar todas las inscripciones de Juan filtradas por ciclo
2. Hacer JOIN con `t_materia` para obtener el `id_curso` de cada una
3. Esperar que todas devuelvan el mismo curso (si no, hay inconsistencia)
4. Usar ese curso

Es trabajo de detective sobre algo que debería ser un solo dato.

---

## 2. ¿La propuesta original (quitar `id_ciclo_lectivo`) rompe esto? Parcialmente.

Si solo quito `id_ciclo_lectivo` de `t_inscripciones` y derivo por JOIN, **no estás peor** que antes — seguís pudiendo reconstruir todo. Pero tampoco resolvés el problema de fondo: que **inscribirse a un curso es una operación atómica** que el modelo actual no representa.

---

## 3. La propuesta correcta para tu caso

Separar en dos niveles, replicando lo que pasa en la realidad:

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

### 3.1 Cómo se usa

| Caso | Comportamiento |
|------|----------------|
| **Inscripción normal** | El sistema crea **un registro** en `t_inscripcion_curso` y, en una transacción, **N registros** en `t_inscripcion_materia` (una por cada materia del curso). |
| **Pregunta "¿a qué curso está Juan en 2026?"** | Query directa a `t_inscripcion_curso`. Sin JOINs gimnásticos. |
| **Recursante parcial** | Un único `t_inscripcion_curso` con tipo `RECURSANTE_PARCIAL`. Los registros de `t_inscripcion_materia` marcan cuáles son nuevas y cuál es la recursada con su `estado_materia`. |
| **Equivalencia** | Un registro en `t_inscripcion_materia` con `estado_materia = EQUIVALENCIA`, sin necesidad de tocar nada más. |
| **Baja del alumno** | Marcar 1 fila como BAJA en `t_inscripcion_curso`. Los hijos se infieren. |

---

## 4. Ventajas concretas para tu sistema

| Antes | Con la propuesta nueva |
|-------|------------------------|
| "Inscribir a curso" = N filas sueltas | = 1 fila + N filas hijas, transaccional |
| Riesgo de inscripciones huérfanas a 1-2 materias | Imposible: si no hay curso, no hay materias |
| Dar de baja a un alumno = borrar N filas | = marcar 1 fila como BAJA |
| Reportes de matrícula = SELECT con DISTINCT y joins | = SELECT directo |
| Recursantes y libres difíciles de modelar | Cada nivel tiene su tipo |

---

## 5. ¿Qué pasa con `t_inasistencia`?

Acá la situación es distinta — quitarle `id_curso` y derivarlo por `Materia → Curso` **sigue siendo correcto** y no genera el problema que tiene la inscripción, porque una inasistencia **siempre es por materia** (el alumno faltó a Matemática del jueves), no por curso entero.

Si querés modelar "el alumno faltó al día completo de clases", eso ya es otro concepto — una `inasistencia_general` distinta.

---

## 6. Resumen

- **La sugerencia original** (solo quitar la redundancia) era correcta pero **incompleta** para tu caso real.
- **La sugerencia ajustada** es: rediseñar en dos niveles (`inscripcion_curso` + `inscripcion_materia`). Esto sí refleja cómo funciona tu colegio y resuelve el problema en su raíz.
- Es un cambio más grande — requiere migración de datos existentes y tocar las queries de inscripción y notas. Pero es **el cambio que el modelo te está pidiendo desde hace rato**.
