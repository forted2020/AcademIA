# Referencia de Estilos — AcademIA

> **Propósito**: Documento de referencia para nuevos desarrollos de UI. Describe la paleta de colores, variables CSS, tipografía, patrones de componentes y convenciones de nomenclatura del sistema.

---

## 1. Variables CSS (`--acad-*`)

El sistema define sus tokens de diseño como variables CSS con el prefijo `--acad-`. Se declaran en `style.scss` (CoreUI base) y se referencian en todos los archivos CSS del proyecto. Siempre usarlas con un fallback hardcodeado por si el archivo raíz no está cargado.

```css
var(--acad-blue, #0369a1)
```

### 1.1. Colores principales

| Variable | Valor | Uso |
|----------|-------|-----|
| `--acad-navy` | `#0f172a` | Títulos principales, texto fuerte, fondo de tooltips |
| `--acad-blue` | `#0369a1` | Acento primario: botones, links, bordes de foco, pestañas activas |
| `--acad-blue-pale` | `#e0f2fe` | Fondos de íconos de marca, hover de botones secundarios, chips seleccionados |

### 1.2. Texto

| Variable | Valor | Uso |
|----------|-------|-----|
| `--acad-text` | `#0f172a` | Texto principal (mismo que navy) |
| `--acad-text-muted` | `#64748b` | Labels, subtítulos, descripciones, placeholders |
| `--acad-text-subtle` | `#94a3b8` | Metadatos, fechas, contadores secundarios |

### 1.3. Bordes

| Variable | Valor | Uso |
|----------|-------|-----|
| `--acad-border` | `#cbd5e1` | Bordes de inputs, cards secundarias |
| `--acad-border-light` | `#e2e8f0` | Separadores, bordes de secciones, líneas divisorias |

### 1.4. Superficies

| Variable | Valor | Uso |
|----------|-------|-----|
| `--acad-surface` | `#fff` | Fondo de cards y modales |
| `--acad-bg-subtle` | `#f8fafc` | Fondo de cuerpos de card, paneles internos, inputs |

### 1.5. Radio y sombras

| Variable | Valor | Uso |
|----------|-------|-----|
| `--acad-radius-sm` | `0.375rem` | Bordes redondeados pequeños (badges, inputs compactos) |
| `--acad-radius` | `0.5rem` | Radio estándar para inputs, secciones, modales internos |
| `--acad-radius-lg` | `0.75rem` | Card principal, modales, contenedores destacados |
| `--acad-shadow` | `0 4px 12px rgba(15,23,42,.08)` | Sombra estándar de cards |

### 1.6. Tipografía

| Variable | Valor | Uso |
|----------|-------|-----|
| `--acad-font-body` | `'Inter', sans-serif` | Fuente única del sistema para UI |

---

## 2. Paleta semántica de estado

Estos valores no tienen variables `--acad-*` propias pero son los colores de estado usados consistentemente en todo el sistema.

| Estado | Fondo (soft) | Borde/Acento | Texto | Uso típico |
|--------|-------------|--------------|-------|------------|
| Éxito | `#f0fdf4` | `#16a34a` | `#166534` | Toast éxito, alertas positivas, aprobado |
| Error | `#fff5f5` | `#dc2626` | `#991b1b` | Toast error, aplazos, alertas de riesgo |
| Advertencia | `#fffbeb` | `#d97706` | `#78350f` | Toast warn, avisos de cambio, umbrales |
| Info | `#eff6ff` | `#2563eb` | `#1e40af` | Toast info, estados informativos |
| Neutro | `#f1f5f9` | `#cbd5e1` | `#64748b` | Chips vacíos, badges sin estado |

### Colores de estado de CoreUI (Bootstrap) usados en StatCards

El componente `StatCard` acepta `color` como prop con los valores de Bootstrap. El sistema los usa así:

| Color Bootstrap | Código hex aprox. | Uso en dashboards |
|-----------------|-------------------|-------------------|
| `primary` | `#0d6efd` | KPIs neutrales / totales |
| `success` | `#198754` | Alumnos activos, materias aprobadas |
| `danger` | `#dc3545` | Previas, repitencia, alertas críticas |
| `warning` | `#ffc107` | Inasistencias, riesgo intermedio |
| `info` | `#0dcaf0` | Contadores informativos (cursos, ciclos) |
| `secondary` | `#6c757d` | Datos secundarios o sin relevancia urgente |

---

## 3. Tipografía

**Fuente**: `Inter` (sans-serif). Es la fuente estándar del sistema. Se declara en `--acad-font-body` y se aplica explícitamente en todos los componentes CSS propios vía:

```css
font-family: var(--acad-font-body, 'Inter', sans-serif);
```

### Escala de tamaños en uso

| Tamaño | Valor | Uso |
|--------|-------|-----|
| `xs` | `0.6875rem` (11px) | Labels de sección en UPPERCASE, badges, títulos de grupo |
| `sm` | `0.75rem` (12px) | Metadatos, fechas, texto muted, `text-label` |
| `base` | `0.8125rem` (13px) | Texto de formulario, descripciones, detalles |
| `md` | `0.875rem` (14px) | Texto de interfaz estándar, botones, labels de input |
| `lg` | `1rem` (16px) | Título de modal |
| `xl` | `1.5rem` (24px) | Título de card principal (`cfggen-header-h2`, etc.) |

### Pesos en uso

| Peso | Uso |
|------|-----|
| `400` | Texto de cuerpo, descripciones |
| `500` | Labels de input, ítems de menú, texto con jerarquía moderada |
| `600` | Botones, valores de KPI secundarios |
| `700` | Títulos de sección, labels de grupo (uppercase), valores de KPI |

### Convenciones de tipografía

- **Títulos de sección** dentro de una card: `0.6875rem`, `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 0.08em`, color `--acad-text-muted` o `--acad-blue`.
- **Subtítulo debajo del título principal** de la card: `0.8125rem`, `font-weight: 500`, color `--acad-blue`, `text-transform: uppercase`, `letter-spacing: 0.06em`.
- La clase `.text-label` (definida en `PersonalStyles.css`) aplica: `0.75rem`, uppercase, `letter-spacing: 0.05em`, color `#6b7280`.

---

## 4. Convenciones de componentes

### 4.1. Estructura de card principal

Toda vista de módulo usa la misma estructura de card:

```
[Card]
  [CardHeader]   — fondo blanco, border-bottom, padding 1.25rem 1.5rem
    [Brand icon]  — cuadrado 2.5rem, fondo --acad-blue-pale, icono --acad-blue
    [Título h2]   — 1.5rem, 700, --acad-navy
    [Subtítulo]   — 0.8125rem, 500, --acad-blue, uppercase
  [Tabs]         — fondo blanco, border-bottom (cuando hay pestañas)
  [CardBody]     — fondo #f8fafc, padding 0
    [Tab content] — padding 1.5rem
      [Secciones] — cards blancas, border --acad-border-light, radius --acad-radius
```

Ejemplo de prefijos de CSS existentes que siguen esta estructura:
- `cfggen-` → `ConfiguracionGeneral.css`
- `fmtimpr-` → `FormatosImpresion.css`
- `mat-` → `Materias.css`
- `enr-` → `GenericEnrollment.css`

### 4.2. Prefijos CSS

Cada módulo tiene su prefijo propio para evitar colisiones. Al crear un nuevo módulo:

1. Elegir un prefijo corto y único (3–6 chars), por ejemplo `prv-`, `doc-`, `alu-`.
2. Declararlo como comentario en la primera línea del CSS: `/* Prefijo .prv-  |  Usa variables --acad-* de style.scss */`
3. Usarlo en **todas** las clases del archivo.

### 4.3. Inputs y formularios

```css
/* Patrón estándar de input */
border: 1.5px solid var(--acad-border, #cbd5e1);
border-radius: var(--acad-radius, 0.5rem);
background: #f8fafc;
color: var(--acad-text, #0f172a);
font-size: 0.875rem;
padding: 0.45rem 0.75rem;
transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;

/* Estado :focus */
border-color: var(--acad-blue, #0369a1);
background: #fff;
box-shadow: 0 0 0 3px rgba(3,105,161,0.1);
```

### 4.4. Botón primario (guardar / confirmar)

```css
background: var(--acad-blue, #0369a1);
color: #fff;
border: none;
border-radius: var(--acad-radius, 0.5rem);
padding: 0.5rem 1.125rem;
font-size: 0.875rem;
font-weight: 600;

/* Hover */
background: #0284c7;
box-shadow: 0 2px 8px rgba(3,105,161,0.25);

/* Disabled */
opacity: 0.55;
cursor: not-allowed;
```

### 4.5. Botón secundario (cancelar / acción neutra)

```css
border: 1.5px solid var(--acad-border, #cbd5e1);
background: #fff;
color: var(--acad-navy, #0f172a);
border-radius: var(--acad-radius, 0.5rem);
padding: 0.45rem 1rem;

/* Hover */
border-color: var(--acad-blue, #0369a1);
background: var(--acad-blue-pale, #e0f2fe);
```

### 4.6. Secciones dentro de una tab

```css
/* Panel / sección interna */
background: #fff;
border: 1px solid var(--acad-border-light, #e2e8f0);
border-radius: var(--acad-radius, 0.5rem);
padding: 1.25rem;
margin-bottom: 1rem;
```

### 4.7. Badges / chips de estado

```css
/* Patrón soft-badge */
display: inline-block;
font-size: 0.6875rem;
font-weight: 700;
padding: 0.18rem 0.55rem;
border-radius: 999px;

/* Ejemplos de combinaciones */
/* Azul */   background: #dbeafe; color: #1d4ed8;
/* Rosa */   background: #fce7f3; color: #9d174d;
/* Verde */  background: #d1fae5; color: #065f46;
/* Rojo */   background: #fee2e2; color: #991b1b;
/* Neutro */ background: #f1f5f9; color: #64748b;
```

---

## 5. Modales

### Estructura estándar

```
[Overlay]         — rgba(15,23,42,0.55), backdrop-filter: blur(2px), z-index: 1050
  [Modal]         — fondo #fff, radius --acad-radius-lg, max-width 460px
    [Header]      — icono (cuadrado 2.25rem redondeado) + título + subtítulo
    [Body]        — contenido (padding 1.25rem)
    [Footer]      — fondo #f8fafc, border-top, botones alineados a la derecha
```

### Animación de entrada

```css
@keyframes modal-in {
  from { opacity: 0; transform: translateY(-8px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)    scale(1);    }
}
animation: modal-in 0.18s ease-out;
```

---

## 6. Toasts (PrimeReact)

Los toasts están configurados globalmente en `index.css`. Se usan a través de PrimeReact con el ref del componente `<Toast>`.

**Configuración global**: `z-index: 9999`, `max-width: 360px`, border-radius `0.625rem`, borde izquierdo de 4px con color semántico.

| Severity | `showSuccess()` | `showError()` | `showWarn()` | `showInfo()` |
|----------|-----------------|---------------|--------------|--------------|

Las llamadas al toast están centralizadas en cada vista mediante un hook o ref local. El toast se monta con `appendTo={document.body}` para evitar problemas de z-index dentro de modales.

---

## 7. StatCards (KPIs)

El componente `StatCard` (`src/components/statCard/StatCard.jsx`) renderiza una tarjeta KPI individual.

**Props**:
- `title` — Label del KPI (ej: `"Alumnos inscriptos"`)
- `value` — Valor principal a destacar
- `color` — Color Bootstrap (`primary`, `success`, `danger`, `warning`, `info`, `secondary`)
- `icon` — Ícono de `@coreui/icons` (opcional)
- `subtext` — Texto pequeño debajo del valor (opcional)

El contenedor `StatsCardsOverview` (`src/views/statsCards/StatsCardsOverview.jsx`) recibe un array declarativo `config.stats` y el objeto `summary` con los valores, permitiendo filtros interactivos por click.

---

## 8. Íconos

Se usa `@coreui/icons-react` con el componente `<CIcon icon={cilNombreIcono} />`.

Los tamaños más usados en contexto de UI:

| Contexto | Tamaño declarado |
|----------|-----------------|
| Ícono de brand en header | `1.25rem × 1.25rem` |
| Ícono de pestaña | `0.875rem × 0.875rem` |
| Ícono en input | `0.75rem × 0.75rem` |
| Ícono de sección | `0.875rem × 0.875rem` |
| Ícono de modal (advertencia) | `1.125rem × 1.125rem` |
| Ícono de alerta inline | `1rem × 1rem` |

---

## 9. Responsividad

El sistema usa el grid de CoreUI/Bootstrap. Convenciones:

- Las grillas de campos en formularios usan `grid-template-columns: 1fr 1fr` en desktop y colapsan a `1fr` en `max-width: 575px`.
- Los headers de cards tienen `flex-wrap: wrap` para soportar pantallas chicas sin overflow.
- Las secciones de modo (ej: modo inscripción) colapsan a columna única en mobile.

---

## 10. Herencia y prioridad

- Las variables `--acad-*` se definen en `style.scss` (CoreUI). Todo CSS propio las referencia con fallback explícito.
- Los archivos CSS propios (`mat-`, `cfggen-`, etc.) tienen mayor especificidad que CoreUI y usan `!important` solo donde CoreUI sobrescribe involuntariamente (ej: `border` en cards de CoreUI).
- `PersonalStyles.css` contiene utilidades globales legacy (`.text-label`, `.badge-soft-*`, `.card-modern`, etc.) — se pueden usar desde cualquier componente pero no deben expandirse; el patrón nuevo es CSS por módulo con prefijo propio.
- `index.css` solo contiene overrides globales de PrimeReact Toast y el reset básico de `body`.
