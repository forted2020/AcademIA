// components.jsx — Shared primitives used by the three role dashboards.
// Loaded BEFORE the dashboard scripts. Components are attached to window
// at the bottom so the next <script type="text/babel"> file can use them.
//
// Visual contract: mirrors the AcademIA design system documented in
// uploads/referencia-estilos.md. Prefix on DOM classes: .acd-

const { useState, useEffect, useMemo, useRef } = React;

/* ────────────────────── Icon set (inline SVG, no deps) ────────────────────── */
/* Stroke-based, line-cap round, matching the visual weight of @coreui/icons. */
const Icon = ({ name, className, size = "1em" }) => {
  const paths = ICONS[name];
  if (!paths) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths}
    </svg>
  );
};

const ICONS = {
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7" /><path d="M22 20c0-2.7-1.6-5-4-6" /></>,
  book: <><path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z" /><path d="M5 17a3 3 0 0 1 3-3h10" /></>,
  books: <><path d="M4 4h4v16H4z" /><path d="M10 4h4v16h-4z" /><path d="M16 6l3.5 1-3 14.5L13 20" /></>,
  graduation: <><path d="M2 9l10-5 10 5-10 5L2 9z" /><path d="M6 11v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4" /></>,
  list: <><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>,
  clipboard: <><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" /><path d="M9 11h6M9 15h4" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  bell: <><path d="M6 9a6 6 0 0 1 12 0v4l1.5 3h-15L6 13z" /><path d="M10 19a2 2 0 0 0 4 0" /></>,
  alert: <><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18v.5" /></>,
  check: <path d="M5 13l4 4L19 7" />,
  check2: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l3 3 5-6" /></>,
  chart: <><path d="M4 20V4M4 20h16" /><rect x="7" y="13" width="3" height="5" /><rect x="12" y="9" width="3" height="9" /><rect x="17" y="5" width="3" height="13" /></>,
  trend: <><path d="M3 17l6-6 4 4 7-7" /><path d="M14 8h6v6" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  download: <><path d="M12 4v12" /><path d="M7 11l5 5 5-5" /><path d="M5 20h14" /></>,
  edit: <><path d="M4 20h4l10-10-4-4L4 16z" /><path d="M14 6l4 4" /></>,
  inbox: <><path d="M4 13l3-9h10l3 9v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6z" /><path d="M4 13h5l1 2h4l1-2h5" /></>,
  dot: <circle cx="12" cy="12" r="4" />,
  sparkles: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  building: <><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" /><path d="M16 9h2a2 2 0 0 1 2 2v10" /><path d="M8 7h2M8 11h2M8 15h2" /><path d="M4 21h16" /></>,
  file: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></>,
  upload: <><path d="M12 20V8" /><path d="M7 13l5-5 5 5" /><path d="M5 4h14" /></>,
  dashboard: <><rect x="3" y="3" width="8" height="10" rx="1" /><rect x="13" y="3" width="8" height="6" rx="1" /><rect x="3" y="15" width="8" height="6" rx="1" /><rect x="13" y="11" width="8" height="10" rx="1" /></>,
};

/* ────────────────────── Page header (matches Card structure) ────────────────────── */
function PageHeader({ icon = "dashboard", title, subtitle, meta, children }) {
  return (
    <div className="acd-card__header">
      <div className="acd-card__brand"><Icon name={icon} /></div>
      <div className="acd-card__title-wrap">
        {subtitle && <p className="acd-card__subtitle">{subtitle}</p>}
        <h1 className="acd-card__title">{title}</h1>
      </div>
      <div className="acd-card__meta">
        {meta}
        {children}
      </div>
    </div>
  );
}

/* ────────────────────── Section panel ────────────────────── */
function Section({ title, icon, action, children, blueTitle = false }) {
  return (
    <div className="acd-section">
      <div className="acd-section__head">
        <h2 className={"acd-section__title" + (blueTitle ? " is-blue" : "")}>
          {icon && <Icon name={icon} />} {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ────────────────────── StatCard — three visual variants ──────────────────────
   - "classic":  CoreUI-style, color en borde izquierdo + ícono circular
   - "modern":   chip de ícono cuadrado + valor grande + delta
   - "minimal":  número grande, label, accent inferior
*/
function StatCard({ title, value, color = "primary", icon, subtext, delta, variant = "classic", onClick }) {
  const handle = (e) => { if (onClick) onClick(e); };
  const handleKey = (e) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(e); }
  };

  if (variant === "modern") {
    return (
      <button type="button" className="acd-stat acd-stat--modern" data-color={color}
              onClick={handle} onKeyDown={handleKey}>
        <div className="acd-stat__top">
          <span className="acd-stat__icon"><Icon name={icon} /></span>
          {delta && <span className="acd-stat__delta">{delta}</span>}
        </div>
        <div className="acd-stat__value">{value}</div>
        <p className="acd-stat__title">{title}</p>
        {subtext && <p className="acd-stat__subtext">{subtext}</p>}
      </button>
    );
  }

  if (variant === "minimal") {
    return (
      <button type="button" className="acd-stat acd-stat--minimal" data-color={color}
              onClick={handle} onKeyDown={handleKey}>
        <div className="acd-stat__value">{value}</div>
        <p className="acd-stat__title">{title}</p>
        {subtext && <p className="acd-stat__subtext">{subtext}</p>}
      </button>
    );
  }

  // classic
  return (
    <button type="button" className="acd-stat acd-stat--classic" data-color={color}
            onClick={handle} onKeyDown={handleKey}>
      <div className="acd-stat__row">
        <div>
          <p className="acd-stat__title">{title}</p>
          <div className="acd-stat__value">{value}</div>
        </div>
        {icon && <span className="acd-stat__icon"><Icon name={icon} /></span>}
      </div>
      {subtext && <p className="acd-stat__subtext">{subtext}</p>}
    </button>
  );
}

/* ────────────────────── Action / quick-access tile ────────────────────── */
function ActionTile({ icon, label, sub, onClick }) {
  return (
    <button type="button" className="acd-action" onClick={onClick}>
      <span className="acd-action__icon"><Icon name={icon} /></span>
      <span>
        <span className="acd-action__label">{label}</span>
        {sub && <span className="acd-action__sub" style={{ display: "block" }}>{sub}</span>}
      </span>
      <span className="acd-action__arrow"><Icon name="arrow" /></span>
    </button>
  );
}

/* ────────────────────── Progress bar ────────────────────── */
function Progress({ value = 0, variant = "" }) {
  const v = Math.max(0, Math.min(100, value));
  const cls = "acd-progress" + (variant ? " acd-progress--" + variant : "");
  return (
    <div className={cls}>
      <div className="acd-progress__fill" style={{ width: v + "%" }} />
    </div>
  );
}

/* ────────────────────── Empty state ────────────────────── */
function EmptyState({ title, sub, icon = "check2" }) {
  return (
    <div className="acd-empty">
      <div className="acd-empty__icon"><Icon name={icon} /></div>
      <p className="acd-empty__title">{title}</p>
      {sub && <p style={{ margin: 0 }}>{sub}</p>}
    </div>
  );
}

/* ────────────────────── Role bar (link to other dashboards) ────────────────────── */
function RoleBar({ current }) {
  const items = [
    { id: "alumno", label: "Alumno", href: "Dashboard Alumno.html" },
    { id: "docente", label: "Docente", href: "Dashboard Docente.html" },
    { id: "admin", label: "Admin", href: "Dashboard Admin.html" },
  ];
  return (
    <div className="acd-rolebar">
      <span>Prototipo — Dashboards AcademIA · vista de rol</span>
      <div className="acd-rolebar__links">
        {items.map((it) => (
          <a key={it.id}
             href={it.href}
             className={"acd-rolebar__link" + (current === it.id ? " is-current" : "")}>
            {it.label}
          </a>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────── Toast (transient feedback) ────────────────────── */
function useToast() {
  const [msg, setMsg] = useState(null);
  const tRef = useRef();
  const show = (text) => {
    setMsg(text);
    clearTimeout(tRef.current);
    tRef.current = setTimeout(() => setMsg(null), 2200);
  };
  const node = msg ? (
    <div className="acd-toast" role="status">
      <Icon name="arrow" /> {msg}
    </div>
  ) : null;
  return [show, node];
}

/* ────────────────────── Mini bar chart (alumnos por curso) ────────────────────── */
function BarChart({ data, max, color = "var(--acad-blue)" }) {
  const _max = max || Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
      {data.map((d) => {
        const pct = (d.value / _max) * 100;
        return (
          <div key={d.label} style={{ display: "grid", gridTemplateColumns: "100px 1fr 36px", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.8125rem", color: "var(--acad-text)", fontWeight: 500 }}>{d.label}</span>
            <div style={{ height: 10, background: "var(--acad-border-light)", borderRadius: 999, overflow: "hidden", position: "relative" }}>
              <div style={{
                position: "absolute", inset: 0,
                width: pct + "%",
                background: d.color || color,
                borderRadius: "inherit",
                transition: "width 0.5s ease",
              }} />
            </div>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--acad-navy)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{d.value}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────── Layout variant labels for tweaks ────────────────────── */
const LAYOUT_OPTIONS = ["A", "B", "C"];
const KPI_OPTIONS = ["classic", "modern", "minimal"];

/* ────────────────────── Export to window for sibling scripts ────────────────────── */
Object.assign(window, {
  Icon, PageHeader, Section, StatCard, ActionTile, Progress, EmptyState,
  RoleBar, useToast, BarChart, LAYOUT_OPTIONS, KPI_OPTIONS,
});
