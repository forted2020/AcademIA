// frontend_AcademiA/src/views/docentes/docentesHome/DocentesHome.jsx
// Dashboard principal para DOCENTE_APP — Layout B:
// Header → KPIs (2) → Tabla de materias → AccesosRápidos (3)

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import {
  cilBook,
  cilPeople,
  cilPencil,
  cilDescription,
  cilChartLine,
  cilWarning,
  cilReload,
  cilArrowRight,
} from '@coreui/icons'

import StatCard   from '../../../components/statCard/StatCard'
import ActionTile from '../../../components/actionTile/ActionTile'
import EmptyState from '../../../components/emptyState/EmptyState'
import useAuthUser from '../../../hooks/useAuthUser'
import api from '../../../api/api'
import './DocentesHome.css'

export default function DocentesHome() {
  const navigate             = useNavigate()
  const { idEntidad, nombre } = useAuthUser()

  const [ciclo,    setCiclo]    = useState(null)
  const [materias, setMaterias] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const cargarDatos = useCallback(async () => {
    if (!idEntidad) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/api/docentes/${idEntidad}/materias-actuales`)
      setCiclo(data.ciclo)
      setMaterias(data.materias || [])
    } catch {
      setError('No se pudieron cargar los datos del panel.')
    } finally {
      setLoading(false)
    }
  }, [idEntidad])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  // Totales derivados de las materias cargadas
  const totalMaterias = materias.length
  const totalAlumnos  = materias.reduce((sum, m) => sum + (m.alumnos || 0), 0)

  // ── Skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="doc-home__card">
        <div className="doc-home__header">
          <div className="doc-home__brand-icon"><CIcon icon={cilBook} /></div>
          <div className="doc-home__title-wrap">
            <h1 className="doc-home__title">Dashboard Docente</h1>
            <p className="doc-home__subtitle">Cargando datos…</p>
          </div>
        </div>
        <div className="doc-home__body">
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--acad-text-muted,#64748b)', fontSize: '0.875rem' }}>
            Obteniendo información del ciclo activo…
          </div>
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="doc-home__card">
        <div className="doc-home__header">
          <div className="doc-home__brand-icon"><CIcon icon={cilBook} /></div>
          <div className="doc-home__title-wrap">
            <h1 className="doc-home__title">Dashboard Docente</h1>
          </div>
        </div>
        <div className="doc-home__body">
          <EmptyState icon={cilWarning} iconVariant="warn" title="Error al cargar el panel" sub={error} />
          <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
            <button
              onClick={cargarDatos}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                fontSize: '0.8125rem', color: 'var(--acad-blue,#0369a1)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}
            >
              <CIcon icon={cilReload} style={{ width: '0.875rem', height: '0.875rem' }} />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="doc-home__card">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="doc-home__header">
        <div className="doc-home__brand-icon">
          <CIcon icon={cilBook} />
        </div>
        <div className="doc-home__title-wrap">
          <h1 className="doc-home__title">Dashboard Docente</h1>
          <p className="doc-home__subtitle">Panel de gestión docente</p>
        </div>
        <div className="doc-home__meta">
          {ciclo && <span className="doc-home__badge">Ciclo {ciclo}</span>}
          <span>{nombre}</span>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="doc-home__body">

        {/* KPIs — 2 tarjetas minimal */}
        <div className="doc-home__section">
          <div className="doc-home__section-head">
            <p className="doc-home__section-title">
              <CIcon icon={cilChartLine} />
              Resumen del ciclo
            </p>
            {ciclo && <span className="doc-home__badge">Ciclo {ciclo}</span>}
          </div>

          <div className="doc-home__grid-kpi-2 doc-home__rise">
            <StatCard
              variant="minimal"
              title="Materias este ciclo"
              value={totalMaterias}
              color="success"
              subtext={ciclo ? `Ciclo ${ciclo}` : undefined}
            />
            <StatCard
              variant="minimal"
              title="Alumnos a cargo"
              value={totalAlumnos}
              color="info"
              subtext={`${totalMaterias} ${totalMaterias === 1 ? 'materia' : 'materias'}`}
            />
          </div>
        </div>

        {/* Tabla de materias */}
        <div className="doc-home__section">
          <div className="doc-home__section-head">
            <p className="doc-home__section-title">
              <CIcon icon={cilBook} />
              Mis materias este ciclo
            </p>
          </div>

          {materias.length === 0
            ? (
              <EmptyState
                icon={cilBook}
                title="Sin materias asignadas"
                sub="No tenés materias asignadas en el ciclo actual."
              />
            )
            : (
              <div style={{ overflowX: 'auto' }}>
                <table className="doc-home__table">
                  <thead>
                    <tr>
                      <th>Materia</th>
                      <th>Curso</th>
                      <th>Alumnos</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {materias.map((m) => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 600 }}>{m.nombre}</td>
                        <td>
                          <span className="doc-home__curso-pill">{m.curso}</span>
                        </td>
                        <td className="doc-home__alumnos-cell">{m.alumnos}</td>
                        <td>
                          <button
                            className="doc-home__go-btn"
                            onClick={() => navigate('/docentes/cargaNotas')}
                          >
                            Ir a planilla
                            <CIcon icon={cilArrowRight} style={{ width: '0.75rem', height: '0.75rem' }} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>

        {/* Accesos rápidos — 3 tiles */}
        <div className="doc-home__section">
          <div className="doc-home__section-head">
            <p className="doc-home__section-title">
              <CIcon icon={cilDescription} />
              Accesos rápidos
            </p>
          </div>

          <div className="doc-home__grid-actions doc-home__rise">
            <ActionTile
              icon={cilPencil}
              label="Carga de Notas"
              sub="Planilla de calificaciones"
              onClick={() => navigate('/docentes/cargaNotas')}
            />
            <ActionTile
              icon={cilChartLine}
              label="Informes"
              sub="Reportes y listados"
              onClick={() => navigate('/gestion/informes')}
            />
            <ActionTile
              icon={cilWarning}
              label="Materias Previas"
              sub="Ver aplazos del ciclo"
              onClick={() => navigate('/gestion/materias-previas')}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
