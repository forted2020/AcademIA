// frontend_AcademiA/src/views/estudiantes/estudiantesHome/EstudiantesHome.jsx
// Dashboard principal para ALUMNO_APP — Layout C (feed vertical):
// Header → 4 KPIs → AccesosRápidos (3) → Lista de materias inscriptas (con flag previa)

import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import {
  cilSchool,
  cilBook,
  cilWarning,
  cilDescription,
  cilChartLine,
  cilBell,
  cilReload,
  cilPrint,
} from '@coreui/icons'

import StatCard   from '../../../components/statCard/StatCard'
import ActionTile from '../../../components/actionTile/ActionTile'
import EmptyState from '../../../components/emptyState/EmptyState'
import useAuthUser from '../../../hooks/useAuthUser'
import api from '../../../api/api'
import './EstudiantesHome.css'

export default function EstudiantesHome() {
  const navigate            = useNavigate()
  const { idEntidad, nombre } = useAuthUser()

  const [ciclo,    setCiclo]    = useState(null)
  const [materias, setMaterias] = useState([])
  const [previas,  setPrevias]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const cargarDatos = useCallback(async () => {
    if (!idEntidad) return
    setLoading(true)
    setError(null)
    try {
      // 1. Obtener ciclo activo (endpoint sin restricción de rol)
      const cicloRes = await api.get('/api/ciclos/activo')
      const ciclo_activo   = cicloRes.data.nombre_ciclo_lectivo
      const id_ciclo_activo = cicloRes.data.id_ciclo_lectivo
      setCiclo(ciclo_activo)

      // 2. Obtener el curso del alumno en el ciclo activo
      const cursoRes = await api.get(`/api/estudiantes/${idEntidad}/ciclo/${id_ciclo_activo}/curso`)
      const { id_curso } = cursoRes.data

      // 3. Si tiene curso, obtener las materias de ese curso
      let materiasData = []
      if (id_curso) {
        const matRes = await api.get(`/api/cursos/${id_curso}/materias`)
        materiasData = matRes.data || []
      }
      setMaterias(materiasData)

      // 4. Previas del alumno (sin filtro de ciclo → todas las previas activas)
      const previasRes = await api.get(`/api/previas/?id_entidad=${idEntidad}`)
      // El endpoint devuelve lista directa (no paginada)
      setPrevias(Array.isArray(previasRes.data) ? previasRes.data : [])
    } catch {
      setError('No se pudieron cargar los datos del panel.')
    } finally {
      setLoading(false)
    }
  }, [idEntidad])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  // Set de ids de materias previas para lookup O(1)
  const previaIds = new Set(previas.map(p => p.id_materia).filter(Boolean))

  const totalMaterias  = materias.length
  const totalPrevias   = previas.length
  // Primeras 6 materias para mostrar en el panel
  const materiasPanel  = materias.slice(0, 6)
  const hayMas         = materias.length > 6

  // ── Skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="alu-home__card">
        <div className="alu-home__header">
          <div className="alu-home__brand-icon"><CIcon icon={cilSchool} /></div>
          <div className="alu-home__title-wrap">
            <h1 className="alu-home__title">Mi Panel</h1>
            <p className="alu-home__subtitle">Cargando datos…</p>
          </div>
        </div>
        <div className="alu-home__body">
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--acad-text-muted,#64748b)', fontSize: '0.875rem' }}>
            Obteniendo información de tu ciclo…
          </div>
        </div>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="alu-home__card">
        <div className="alu-home__header">
          <div className="alu-home__brand-icon"><CIcon icon={cilSchool} /></div>
          <div className="alu-home__title-wrap">
            <h1 className="alu-home__title">Mi Panel</h1>
          </div>
        </div>
        <div className="alu-home__body">
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
    <div className="alu-home__card">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="alu-home__header">
        <div className="alu-home__brand-icon">
          <CIcon icon={cilSchool} />
        </div>
        <div className="alu-home__title-wrap">
          <h1 className="alu-home__title">Hola, {nombre}</h1>
          <p className="alu-home__subtitle">Mi panel de estudiante</p>
        </div>
        {ciclo && <span className="alu-home__badge">Ciclo {ciclo}</span>}
      </div>

      {/* ── Body ─────────────────────────────────────────────────── */}
      <div className="alu-home__body">

        {/* KPIs — 4 tarjetas classic */}
        <div className="alu-home__section">
          <div className="alu-home__section-head">
            <p className="alu-home__section-title">
              <CIcon icon={cilChartLine} />
              Resumen del ciclo
            </p>
          </div>

          <div className="alu-home__grid-kpi-4 alu-home__rise">
            <StatCard
              variant="classic"
              title="Materias inscriptas"
              value={totalMaterias}
              color="primary"
              icon={cilBook}
            />
            <StatCard
              variant="classic"
              title="Materias previas"
              value={totalPrevias}
              color={totalPrevias > 0 ? 'danger' : 'success'}
              icon={cilWarning}
              onClick={totalPrevias > 0 ? () => navigate('/estudiante/trayectoria') : undefined}
            />
            <StatCard
              variant="classic"
              title="Asistencia"
              value="—"
              color="info"
              icon={cilBell}
              subtext="Ver informe"
              onClick={() => navigate('/estudiante/informe-asistencia')}
            />
            <StatCard
              variant="classic"
              title="Promedio"
              value="—"
              color="secondary"
              icon={cilChartLine}
              subtext="Ver boletín"
              onClick={() => navigate('/estudiante/boletin')}
            />
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="alu-home__section">
          <div className="alu-home__section-head">
            <p className="alu-home__section-title">
              <CIcon icon={cilDescription} />
              Accesos rápidos
            </p>
          </div>

          <div className="alu-home__grid-actions alu-home__rise">
            <ActionTile
              icon={cilBook}
              label="Boletín de Calificaciones"
              sub="Notas del ciclo"
              onClick={() => navigate('/estudiante/boletin')}
            />
            <ActionTile
              icon={cilBell}
              label="Informe de Asistencia"
              sub="Registro de inasistencias"
              onClick={() => navigate('/estudiante/informe-asistencia')}
            />
            <ActionTile
              icon={cilPrint}
              label="Constancia Regular"
              sub="Descargá tu constancia"
              onClick={() => navigate('/estudiante/informes')}
            />
          </div>
        </div>

        {/* Materias inscriptas */}
        <div className="alu-home__section">
          <div className="alu-home__section-head">
            <p className="alu-home__section-title">
              <CIcon icon={cilBook} />
              Mis materias
            </p>
            {totalMaterias > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--acad-text-muted,#64748b)' }}>
                {totalMaterias} {totalMaterias === 1 ? 'materia' : 'materias'}
              </span>
            )}
          </div>

          {materias.length === 0
            ? (
              <EmptyState
                icon={cilBook}
                title="Sin materias inscriptas"
                sub="No tenés materias inscriptas en el ciclo activo."
              />
            )
            : (
              <>
                <div className="alu-home__materias-list">
                  {materiasPanel.map((m) => {
                    const esPrevia = previaIds.has(m.id_materia)
                    return (
                      <div key={m.id_materia} className="alu-home__materia-row">
                        <div className={`alu-home__materia-dot${esPrevia ? ' alu-home__materia-dot--previa' : ''}`} />
                        <span className="alu-home__materia-name">
                          {m.nombre_materia || m.nombre || 'Sin nombre'}
                        </span>
                        {esPrevia && (
                          <span className="alu-home__previa-tag">Previa</span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {hayMas && (
                  <button
                    onClick={() => navigate('/estudiante/trayectoria')}
                    style={{
                      marginTop: '0.75rem',
                      display: 'block',
                      fontSize: '0.8125rem',
                      color: 'var(--acad-blue,#0369a1)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Ver todas las materias →
                  </button>
                )}
              </>
            )
          }
        </div>

      </div>
    </div>
  )
}
