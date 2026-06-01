# Handoff — del prototipo a tu codebase

> Resumen breve por archivo del repo `frontend_AcademiA/`. Cada sección referencia los selectores del prototipo (`acd-*`) y muestra qué cambia en el código real.

## 0 · Elecciones de diseño

| Rol      | Layout | KPI style | Notas |
|----------|--------|-----------|-------|
| Alumno   | C      | classic   | Sin tarjeta de barra de asistencia; los accesos rápidos van en su lugar |
| Docente  | B      | minimal   | Sidebar de pendientes/actividad/accesos + tabla de planilla |
| Admin    | B      | minimal   | KPIs arriba, accesos rápidos al frente, después gráfico + previas, actividad al cierre |

---

## 1 · Extender `StatCard.jsx` con `variant`

El sistema ya tiene `StatCard` (CoreUI, color en borde izquierdo). Eso es exactamente el `variant="classic"` del prototipo, así que **Alumno no necesita cambios** en el componente. Para Docente/Admin (`minimal`) hay que agregar un `variant` opcional.

`src/components/statCard/StatCard.jsx` — agregar una rama por variant:

```jsx
// Props existentes + `variant` opcional: 'classic' | 'modern' | 'minimal'
function StatCard({ title, value, color = 'primary', icon, subtext, variant = 'classic', onClick }) {
  // ...lógica común (className raíz, onClick, etc.)

  if (variant === 'minimal') {
    return (
      <CCard className={`stat-card stat-card--minimal stat-card--${color}`} onClick={onClick} role={onClick ? 'button' : undefined}>
        <CCardBody>
          <div className="stat-card__value">{value}</div>
          <div className="stat-card__title">{title}</div>
          {subtext && <div className="stat-card__subtext">{subtext}</div>}
        </CCardBody>
      </CCard>
    );
  }

  // default: el classic actual de CoreUI con borde lateral coloreado
  return (/* tu JSX existente */);
}
```

CSS nuevo (en el mismo archivo o en `statCard.css`):

```css
/* Prefijo .stat-card-  |  Variant minimal */
.stat-card--minimal {
  border: 1px solid var(--acad-border-light, #e2e8f0);
  border-left: 1px solid var(--acad-border-light, #e2e8f0);  /* anula el borde lateral del classic */
  border-radius: var(--acad-radius, 0.5rem);
  position: relative;
  cursor: pointer;
  transition: transform .15s, box-shadow .15s, border-color .15s;
}
.stat-card--minimal:hover { transform: translateY(-1px); box-shadow: var(--acad-shadow); }
.stat-card--minimal .stat-card__value {
  font-size: 2.25rem; font-weight: 700; line-height: 1;
  color: var(--acad-navy, #0f172a); letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.stat-card--minimal .stat-card__title {
  font-size: .6875rem; font-weight: 700; letter-spacing: .08em;
  text-transform: uppercase; color: var(--acad-text-muted, #64748b);
  margin-top: .5rem;
}
.stat-card--minimal::after {
  content: ''; position: absolute; left: 1.125rem; right: 1.125rem; bottom: .5rem;
  height: 2px; border-radius: 2px; opacity: .6;
  background: var(--stat-c, var(--acad-blue, #0369a1));
}
.stat-card--primary  { --stat-c: #0d6efd; }
.stat-card--success  { --stat-c: #198754; }
.stat-card--danger   { --stat-c: #dc3545; }
.stat-card--warning  { --stat-c: #b45309; }
.stat-card--info     { --stat-c: #0891b2; }
.stat-card--secondary{ --stat-c: #6c757d; }
```

> `StatsCardsOverview` no necesita cambios: pasale `variant` a través de `config.stats` (cada stat puede declarar su variant, o todos heredan uno por defecto del overview).

---

## 2 · Dashboard Alumno — `EstudiantesHome.jsx`

**Endpoints (del plan):**
- `GET /api/ciclos/` → ciclo activo del alumno
- `GET /api/estudiantes/{id}/ciclo/{id_ciclo}/curso` → curso actual
- `GET /api/materias/curso/{id_curso}` → materias inscriptas
- `GET /api/previas/?id_entidad={id}` → previas

**Estructura JSX** (mapeo de bloques del prototipo):

```jsx
// frontend_AcademiA/src/views/estudiantes/estudiantesHome/EstudiantesHome.jsx
import './EstudiantesHome.css';  // Prefijo .alu-home__

function EstudiantesHome() {
  const { idEntidad, nombre } = useAuthUser();
  const { cicloActivo, materias, previas, asistencia, promedio } = useAlumnoDashboard(idEntidad);
  const navigate = useNavigate();

  return (
    <CCard className="alu-home__card">
      <CCardHeader className="alu-home__head">
        {/* Brand icon + título + subtítulo + chip ciclo. Mismo patrón cfggen- */}
      </CCardHeader>

      <CCardBody className="alu-home__body">
        {/* ───── KPI row (Layout C arranca con KPIs) ───── */}
        <StatsCardsOverview
          summary={{ inscriptas: materias.length, previas: previas.length, asistencia, promedio }}
          config={{
            stats: [
              { key: 'inscriptas', title: 'Materias inscriptas', color: 'primary', icon: cilBook,     variant: 'classic' },
              { key: 'previas',    title: 'Materias previas',    color: previas.length ? 'danger' : 'success', icon: cilWarning, variant: 'classic' },
              { key: 'asistencia', title: '% Asistencia',        color: asistenciaColor(asistencia), icon: cilCalendar, variant: 'classic', format: v => `${v}%` },
              { key: 'promedio',   title: 'Promedio del ciclo',  color: 'info', icon: cilChartLine,   variant: 'classic', format: v => v.toFixed(1) },
            ],
          }}
        />

        {/* ───── Accesos rápidos (reemplaza a la barra de asistencia) ───── */}
        <section className="alu-home__section">
          <h2 className="alu-home__section-title">Accesos rápidos</h2>
          <div className="alu-home__actions">
            <ActionTile icon={cilNotes}    label="Boletín"            onClick={() => navigate('/boletin')} />
            <ActionTile icon={cilCalendar} label="Asistencias"        onClick={() => navigate('/informe-asistencia')} />
            <ActionTile icon={cilFile}     label="Constancia regular" onClick={() => /* generar PDF */} />
          </div>
        </section>

        {/* ───── Previas + Mesas (grilla 2 cols) ───── */}
        <div className="alu-home__grid-2">
          <PreviasSection items={previas} />
          <MesasSection items={proximasMesas} />  {/* placeholder por ahora */}
        </div>

        {/* ───── Materias inscriptas (full width) ───── */}
        <MateriasInscriptasSection items={materias} />
      </CCardBody>
    </CCard>
  );
}
```

**CSS** — `EstudiantesHome.css`, prefijo `.alu-home__`. Calcas las clases del prototipo (`acd-grid`, `acd-section`, `acd-action`, `acd-list`) renombrando con tu prefijo. Las reglas siguen siendo las mismas: card blanca, body `--acad-bg-subtle`, secciones internas con `--acad-border-light` y `--acad-radius`.

> El bloque "Próximas mesas" del prototipo no tiene endpoint todavía. Dejalo detrás de un flag (`if (mesas.length)`) o como sección placeholder hasta que decidas si agregás un `GET /api/alumnos/{id}/mesas` o si se lee del calendario existente.

---

## 3 · Dashboard Docente — `DashboardDocente.jsx`

**Endpoints:**
- `GET /api/docentes/{id}/materias-actuales` → `{ ciclo, materias: [{id, nombre, curso, ...}] }`

Para `alumnos_por_materia`, `planilla_pct` y `pendientes` hay dos opciones:
- (a) Extender el endpoint actual para que ya devuelva esos counts.
- (b) Loop client-side: `GET /api/materias/{id}/inscripciones` y derivar los counts. Es N+1; recomiendo (a).

**Estructura — Layout B (sidebar a la derecha):**

```jsx
// frontend_AcademiA/src/views/home/DashboardDocente.jsx
function DashboardDocente() {
  const { nombre, idEntidad } = useAuthUser();
  const { ciclo, materias } = useDocenteMaterias(idEntidad);
  const navigate = useNavigate();
  const stats = useMemo(() => deriveDocenteStats(materias), [materias]);

  if (!materias.length) return <DocenteEmptyState />;

  return (
    <CCard className="doc-home__card">
      <CCardHeader>{/* Bienvenido, {nombre} · Ciclo activo {ciclo} */}</CCardHeader>

      <CCardBody className="doc-home__body">
        {/* KPIs minimal arriba — Layout B los pone full width antes del split */}
        <StatsCardsOverview summary={stats} config={{
          stats: [
            { key: 'materias',     title: 'Materias este ciclo', color: 'primary', icon: cilBook,      variant: 'minimal' },
            { key: 'alumnos',      title: 'Alumnos a cargo',     color: 'info',    icon: cilPeople,    variant: 'minimal' },
            { key: 'pendientes',   title: 'Notas pendientes',    color: stats.pendientes > 0 ? 'warning' : 'success', icon: cilPencil, variant: 'minimal' },
            { key: 'avgPlanilla',  title: 'Avance planilla',     color: 'success', icon: cilClipboard, variant: 'minimal', format: v => `${v}%` },
          ],
        }}/>

        {/* Split 2/1 */}
        <div className="doc-home__split">
          <div className="doc-home__main">
            <MateriasTable items={materias} onOpenPlanilla={m => navigate(`/planilla-calificaciones?materia=${m.id}`)} />
            <AlumnosPorMateriaChart items={materias} />
          </div>
          <aside className="doc-home__side">
            <PendientesCarga items={materias} onCargar={m => navigate(`/planilla-calificaciones?materia=${m.id}`)} />
            <ActividadReciente />
            <section>
              <ActionTile label="Planilla de calificaciones" onClick={() => navigate('/planilla-calificaciones')} />
              <ActionTile label="Informes y listados"        onClick={() => navigate('/gestion-informes')} />
              <ActionTile label="Mesas de examen"            onClick={() => navigate('/mesas-examen')} />
            </section>
          </aside>
        </div>
      </CCardBody>
    </CCard>
  );
}
```

CSS: `DashboardDocente.css`, prefijo `.doc-home__`. El split 2/1 es `grid-template-columns: minmax(0, 2fr) minmax(0, 1fr)` con `gap: 1rem`, colapsa a 1 col en `max-width: 1100px`.

> "Actividad reciente" y "Notas pendientes" hoy no tienen endpoint. Para empezar dejá los componentes con datos derivados de lo que sí hay (`pendientes` = alumnos sin nota cargada en la planilla del trimestre actual) y "Actividad reciente" como placeholder o detrás de feature flag.

---

## 4 · Dashboard Admin — `DashboardAdmin.jsx`

**Endpoint nuevo (del plan):** `GET /api/dashboard/resumen`

```json
{
  "ciclo_activo": "2025",
  "id_ciclo_activo": 3,
  "total_alumnos": 142,
  "total_docentes": 18,
  "total_inscripciones": 890,
  "total_previas": 47,
  "cursos_activos": 6
}
```

Para gráfico de "alumnos por curso" y "previas top 5" conviene agregar al mismo endpoint (o uno aparte `/api/dashboard/distribucion`):
```json
{
  "alumnos_por_curso": [{ "curso": "1° A", "cantidad": 28 }, ...],
  "previas_por_materia": [{ "materia": "Química II", "curso": "4° A", "cantidad": 14 }, ...]
}
```

**Estructura — Layout B (accesos al frente, después analítica):**

```jsx
function DashboardAdmin() {
  const { data } = useDashboardResumen();
  const navigate = useNavigate();
  if (!data) return <Skeleton />;

  return (
    <CCard className="adm-home__card">
      <CCardHeader>Panel de Gestión · Ciclo {data.ciclo_activo}</CCardHeader>
      <CCardBody className="adm-home__body">
        <StatsCardsOverview summary={data} config={{
          stats: [
            { key: 'total_alumnos',       title: 'Alumnos',        color: 'success',   variant: 'minimal' },
            { key: 'total_docentes',      title: 'Docentes',       color: 'info',      variant: 'minimal' },
            { key: 'total_inscripciones', title: 'Inscripciones',  color: 'primary',   variant: 'minimal' },
            { key: 'total_previas',       title: 'Previas',        color: 'danger',    variant: 'minimal' },
            { key: 'cursos_activos',      title: 'Cursos activos', color: 'secondary', variant: 'minimal' },
          ],
        }}/>

        {/* Accesos rápidos al frente — Variant B */}
        <section className="adm-home__actions">
          <ActionTile label="Materias Previas"   onClick={() => navigate('/materias-previas')} />
          <ActionTile label="Inscripciones"      onClick={() => navigate('/inscripciones')} />
          <ActionTile label="Informes y listados" onClick={() => navigate('/gestion-informes')} />
          <ActionTile label="Configuración"      onClick={() => navigate('/configuracion')} />
        </section>

        <div className="adm-home__split">
          <AlumnosPorCursoChart data={data.alumnos_por_curso} />
          <PreviasTop data={data.previas_por_materia} />
        </div>

        <ActividadSistema />  {/* opcional / feature flag */}
      </CCardBody>
    </CCard>
  );
}
```

CSS prefijo `.adm-home__`. La grilla de 5 KPI minimal usa `grid-template-columns: repeat(5, minmax(0, 1fr))`, colapsa a 3, después a 2, después a 1.

---

## 5 · `Home.jsx` — router por rol

```jsx
function Home() {
  const { rol } = useAuthUser();
  if (rol === 'DOCENTE_APP')  return <DashboardDocente />;
  if (rol === 'ADMIN_SISTEMA') return <DashboardAdmin />;
  return null; // ALUMNO_APP nunca debería caer acá; usa EstudiantesHome
}
```

---

## 6 · Componentes auxiliares a portar

Los siguientes existen en el prototipo y no en tu codebase. Si los movés, ponelos en `src/components/` con sus respectivos CSS prefijados.

| Prototipo (`components.jsx`)   | Sugerido en codebase                        | Uso |
|--------------------------------|---------------------------------------------|-----|
| `ActionTile`                   | `src/components/actionTile/ActionTile.jsx`  | Accesos rápidos de los tres dashboards |
| `Progress`                     | `src/components/progress/Progress.jsx` (o usar `CProgress` de CoreUI) | Barra de avance de planilla docente |
| `BarChart` (SVG-less, divs)    | `src/components/barChart/BarChart.jsx`      | Alumnos por curso (admin) y por materia (docente) |
| `EmptyState`                   | `src/components/emptyState/EmptyState.jsx`  | "Sin previas", "Sin materias en el ciclo" |
| `Section`                      | inline o helper en cada dashboard           | Wrapper de sección blanca con eyebrow |

> No es obligatorio: si preferís, copiá las clases CSS y mantenelos como JSX inline dentro de cada dashboard. Los tres archivos son chicos.

---

## 7 · Checklist de migración

1. [ ] Agregar prop `variant` a `StatCard.jsx` + CSS de `--minimal`.
2. [ ] (Opcional) Agregar variant `modern` también, por si después cambian de idea.
3. [ ] Backend: `GET /api/dashboard/resumen` con los 6 counts del plan + (deseable) `alumnos_por_curso` y `previas_por_materia`.
4. [ ] Backend (opcional): enriquecer `GET /api/docentes/{id}/materias-actuales` con `alumnos`, `planilla_pct`, `pendientes` por materia.
5. [ ] Frontend: crear `DashboardDocente.jsx`, `DashboardAdmin.jsx`, refactor de `Home.jsx`.
6. [ ] Frontend: portar `EstudiantesHome.jsx` con Layout C + accesos arriba.
7. [ ] Crear `ActionTile`, `BarChart` y `EmptyState` como componentes compartidos.
8. [ ] CSS por archivo, con prefijo único y fallback de variables `--acad-*`.
9. [ ] Tests manuales por rol — incluye estado vacío (sin previas, docente sin materias).

---

## 8 · Notas sobre las decisiones de diseño

- **Alumno · Variant C / classic** — feed denso vertical. Funciona bien para mobile (todo en una columna) sin tener que rehacer el layout. La barra de asistencia se quitó porque el % ya está en la StatCard; reemplazarla con accesos rápidos sube los CTAs a un fold visible.
- **Docente · Variant B / minimal** — pone la tabla de planilla a foco completo en la columna izquierda; pendientes y actividad quedan como soporte en la sidebar derecha. El `minimal` evita que las 4 StatCards compitan con la tabla.
- **Admin · Variant B / minimal** — los accesos rápidos suben al frente (gestión primero), después la analítica (gráfico + previas en grilla 2 cols) y al final la actividad. El `minimal` deja respirar a 5 cards en línea sin saturar.

Si después querés volver atrás o cambiar combinación, abrir el HTML del prototipo y mover el toggle de Tweaks (los defaults se guardan automáticamente en el bloque `EDITMODE-BEGIN`).
