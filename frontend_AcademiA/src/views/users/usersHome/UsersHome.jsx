// frontend_AcademiA/src/views/users/usersHome/UsersHome.jsx
// Dashboard principal para ADMIN_SISTEMA — Layout B:
// Header → KPIs minimal (5) → AccesosRápidos (4) → BarChart + PreviasTop → Actividad

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { CContainer } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilPeople,
  cilUser,
  cilList,
  cilWarning,
  cilBuilding,
  cilChartLine,
  cilClipboard,
  cilSettings,
  cilBell,
  cilReload,
} from '@coreui/icons'

import StatCard    from '../../../components/statCard/StatCard'
import ActionTile  from '../../../components/actionTile/ActionTile'
import BarChart    from '../../../components/barChart/BarChart'
import EmptyState  from '../../../components/emptyState/EmptyState'
import useAuthUser from '../../../hooks/useAuthUser'
import { getDashboardResumen } from '../../../api/apiDashboard'
import './UsersHome.css'

// Calcula el delta porcentual entre valor actual y anterior
function calcDelta(actual, prev) {
  if (!prev || prev === 0) return null
  const pct = Math.round(((actual - prev) / prev) * 100)
  return pct
}

// Formatea el delta para mostrarlo como subtext en StatCard
function deltaText(actual, prev) {
  const d = calcDelta(actual, prev)
  if (d === null) return null
  const signo = d >= 0 ? '+' : ''
  return `${signo}${d}% vs ciclo anterior`
}

export default function UsersHome() {
  const navigate    = useNavigate()
  const { nombre }  = useAuthUser()

  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getDashboardResumen()
      setData(res.data)
    } catch (err) {
      setError('No se pudo cargar el resumen del panel.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  // ── Skeleton mientras carga ──────────────────────────────────────
  if (loading) {
    return (
      <CContainer fluid className="py-3">
        <div className="adm-home__card">
          <div className="adm-home__header">
            <div className="adm-home__brand-icon">
              <CIcon icon={cilSpeedometer} />
            </div>
            <div className="adm-home__title-wrap">
              <h1 className="adm-home__title">Panel de Gestión</h1>
              <p className="adm-home__subtitle">Cargando datos…</p>
            </div>
          </div>
          <div className="adm-home__body">
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--acad-text-muted, #64748b)', fontSize: '0.875rem' }}>
              Obteniendo información del sistema…
            </div>
          </div>
        </div>
      </CContainer>
    )
  }

  // ── Error ────────────────────────────────────────────────────────
  if (error) {
    return (
      <CContainer fluid className="py-3">
        <div className="adm-home__card">
          <div className="adm-home__header">
            <div className="adm-home__brand-icon">
              <CIcon icon={cilSpeedometer} />
            </div>
            <div className="adm-home__title-wrap">
              <h1 className="adm-home__title">Panel de Gestión</h1>
            </div>
          </div>
          <div className="adm-home__body">
            <EmptyState
              icon={cilWarning}
              iconVariant="warn"
              title="Error al cargar el panel"
              sub={error}
            />
            <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
              <button
                onClick={cargarDatos}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                  fontSize: '0.8125rem', color: 'var(--acad-blue, #0369a1)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                <CIcon icon={cilReload} style={{ width: '0.875rem', height: '0.875rem' }} />
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </CContainer>
    )
  }

  const {
    ciclo_activo,
    total_alumnos,    total_alumnos_prev,
    total_docentes,   total_docentes_prev,
    total_inscripciones, total_inscripciones_prev,
    total_previas,    total_previas_prev,
    cursos_activos,
    alumnos_por_curso = [],
    previas_por_materia = [],
  } = data

  // ── Colores para la barra de alumnos por curso ───────────────────
  const BAR_COLORS = ['#0369a1', '#0891b2', '#0d9488', '#7c3aed', '#db2777', '#d97706']
  const barData = alumnos_por_curso.map((item, i) => ({
    label: item.label,
    value: item.value,
    color: BAR_COLORS[i % BAR_COLORS.length],
  }))

  // ── Colores de gradiente para barras de previas ──────────────────
  const PREVIA_COLORS = ['#dc2626', '#ea580c', '#d97706', '#ca8a04', '#65a30d']

  return (
    <CContainer fluid className="py-3">
    <div className="adm-home__card">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="adm-home__header">
        <div className="adm-home__brand-icon">
          <CIcon icon={cilSpeedometer} />
        </div>

        <div className="adm-home__title-wrap">
          <h1 className="adm-home__title">Panel de Gestión</h1>
          <p className="adm-home__subtitle">Panel de Gestión — Admin</p>
        </div>

        <div className="adm-home__meta">
          <span className="adm-home__badge">Ciclo {ciclo_activo}</span>
          <span>Bienvenido, {nombre}</span>
        </div>
      </div>

      {/* ── Body ───────────────────────────────────────────────── */}
      <div className="adm-home__body">

        {/* KPIs — 5 tarjetas minimal */}
        <div className="adm-home__section">
          <div className="adm-home__section-head">
            <p className="adm-home__section-title">
              <CIcon icon={cilChartLine} />
              Resumen del ciclo
            </p>
            <span className="adm-home__badge">Ciclo {ciclo_activo}</span>
          </div>

          <div className="adm-home__grid-kpi-5 adm-home__rise">
            <StatCard
              variant="minimal"
              title="Alumnos"
              value={total_alumnos}
              color="primary"
              subtext={deltaText(total_alumnos, total_alumnos_prev)}
              onClick={() => navigate('/estudiante')}
            />
            <StatCard
              variant="minimal"
              title="Docentes"
              value={total_docentes}
              color="info"
              subtext={deltaText(total_docentes, total_docentes_prev)}
              onClick={() => navigate('/docentes')}
            />
            <StatCard
              variant="minimal"
              title="Inscripciones"
              value={total_inscripciones}
              color="success"
              subtext={deltaText(total_inscripciones, total_inscripciones_prev)}
              onClick={() => navigate('/inscripcion')}
            />
            <StatCard
              variant="minimal"
              title="Materias previas"
              value={total_previas}
              color="danger"
              subtext={deltaText(total_previas, total_previas_prev)}
              onClick={() => navigate('/gestion/materias-previas')}
            />
            <StatCard
              variant="minimal"
              title="Cursos activos"
              value={cursos_activos}
              color="secondary"
              onClick={() => navigate('/cursos')}
            />
          </div>
        </div>

        {/* Accesos rápidos — 4 tiles */}
        <div className="adm-home__section">
          <div className="adm-home__section-head">
            <p className="adm-home__section-title adm-home__section-title--blue">
              <CIcon icon={cilList} />
              Accesos rápidos
            </p>
          </div>

          <div className="adm-home__grid-actions adm-home__rise">
            <ActionTile
              icon={cilWarning}
              label="Materias Previas"
              sub="Gestión de aplazos"
              onClick={() => navigate('/gestion/materias-previas')}
            />
            <ActionTile
              icon={cilClipboard}
              label="Inscripciones"
              sub="Ciclo lectivo"
              onClick={() => navigate('/inscripcion')}
            />
            <ActionTile
              icon={cilChartLine}
              label="Informes y Listados"
              sub="Reportes del sistema"
              onClick={() => navigate('/gestion/informes')}
            />
            <ActionTile
              icon={cilSettings}
              label="Configuración"
              sub="Ajustes generales"
              onClick={() => navigate('/configuracion/general')}
            />
          </div>
        </div>

        {/* Grilla de 2 columnas: BarChart | Previas top 5 */}
        <div className="adm-home__grid-2">

          {/* Alumnos por curso */}
          <div className="adm-home__section">
            <div className="adm-home__section-head">
              <p className="adm-home__section-title">
                <CIcon icon={cilBuilding} />
                Alumnos por curso
              </p>
            </div>
            {barData.length > 0
              ? <BarChart data={barData} />
              : <EmptyState title="Sin datos de cursos" sub="No hay cursos activos en este ciclo." />
            }
          </div>

          {/* Previas top 5 */}
          <div className="adm-home__section">
            <div className="adm-home__section-head">
              <p className="adm-home__section-title">
                <CIcon icon={cilWarning} />
                Materias con más previas
              </p>
              <span
                style={{ fontSize: '0.75rem', color: 'var(--acad-text-muted,#64748b)', cursor: 'pointer' }}
                onClick={() => navigate('/gestion/materias-previas')}
              >
                Ver todas →
              </span>
            </div>

            {previas_por_materia.length === 0
              ? <EmptyState
                  title="Sin previas registradas"
                  sub="No hay materias previas en este ciclo."
                />
              : (
                <div className="adm-home__previas-list">
                  {previas_por_materia.map((item, idx) => {
                    const max      = previas_por_materia[0].cantidad
                    const pct      = max > 0 ? Math.round((item.cantidad / max) * 100) : 0
                    const fillColor = PREVIA_COLORS[idx] || PREVIA_COLORS[PREVIA_COLORS.length - 1]
                    return (
                      <div key={idx} className="adm-home__previa-row">
                        <div className="adm-home__previa-rank">{idx + 1}</div>
                        <div className="adm-home__previa-info">
                          <div className="adm-home__previa-nombre">
                            {item.materia}
                            <span className="adm-home__previa-curso">{item.curso}</span>
                          </div>
                          <div className="adm-home__previa-track">
                            <div
                              className="adm-home__previa-fill"
                              style={{ width: `${pct}%`, background: fillColor }}
                            />
                          </div>
                        </div>
                        <div className="adm-home__previa-cantidad">{item.cantidad}</div>
                      </div>
                    )
                  })}
                </div>
              )
            }
          </div>
        </div>

        {/* Actividad reciente — placeholder */}
        <div className="adm-home__section">
          <div className="adm-home__section-head">
            <p className="adm-home__section-title">
              <CIcon icon={cilBell} />
              Actividad reciente
            </p>
          </div>
          <EmptyState
            icon={cilBell}
            title="Sin actividad registrada"
            sub="Los eventos del sistema aparecerán aquí."
          />
        </div>

      </div>
    </div>
    </CContainer>
  )
}
