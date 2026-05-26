// views/gestion/previas/MateriasPrevias.jsx
// Vista de gestión de Materias Previas (Fase 7.2).
// Permite listar las previas activas, filtrarlas por alumno o ciclo, levantarlas
// manualmente, y disparar el proceso "cerrar ciclo" que recalcula el flag para
// todas las inscripciones de un ciclo lectivo.

import React, { useEffect, useState, useCallback } from 'react'
import {
  CContainer, CCard, CCardHeader, CCardBody,
  CFormSelect, CSpinner, CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilWarning, cilCheckCircle, cilReload, cilLockUnlocked } from '@coreui/icons'

import api from '../../../api/api.js'
import './MateriasPrevias.css'

function useCiclos() {
  const [ciclos, setCiclos] = useState([])
  useEffect(() => {
    api.get('/api/ciclos/', { params: { skip: 0, limit: 100 } })
      .then((res) => {
        const payload = res?.data
        setCiclos(Array.isArray(payload) ? payload : (payload?.data ?? []))
      })
      .catch(() => setCiclos([]))
  }, [])
  return ciclos
}

export default function MateriasPrevias() {
  const ciclos = useCiclos()
  const [cicloFiltro, setCicloFiltro] = useState('')
  const [previas, setPrevias] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  const [procesando, setProcesando] = useState(false)

  const cargarPrevias = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (cicloFiltro) params.id_ciclo_lectivo = cicloFiltro
      const res = await api.get('/api/previas/', { params })
      setPrevias(res.data ?? [])
    } catch (e) {
      setError(e?.response?.data?.detail ?? 'No se pudieron cargar las previas.')
    } finally {
      setLoading(false)
    }
  }, [cicloFiltro])

  useEffect(() => { cargarPrevias() }, [cargarPrevias])

  const ejecutarCierreCiclo = async () => {
    if (!cicloFiltro) {
      setError('Seleccioná un ciclo lectivo antes de ejecutar el cierre.')
      return
    }
    setProcesando(true)
    setError(null)
    setMensaje(null)
    try {
      const res = await api.post(`/api/previas/cerrar-ciclo/${cicloFiltro}`)
      const d = res.data
      setMensaje(
        `Cierre completado. Evaluadas: ${d.inscripciones_evaluadas}. ` +
        `Marcadas como previa: ${d.marcadas_previa}. Levantadas: ${d.levantadas}. ` +
        `(Nota de aprobación aplicada: ${d.nota_aprobacion_aplicada})`
      )
      await cargarPrevias()
    } catch (e) {
      setError(e?.response?.data?.detail ?? 'Error al ejecutar el cierre.')
    } finally {
      setProcesando(false)
    }
  }

  const levantarPrevia = async (id) => {
    setError(null)
    try {
      await api.put(`/api/previas/${id}/levantar`)
      setPrevias((prev) => prev.filter((p) => p.id_inscripcion !== id))
    } catch (e) {
      setError(e?.response?.data?.detail ?? 'Error al levantar la previa.')
    }
  }

  return (
    <CContainer fluid className="py-3">
      <CCard className="prev-card">
        <CCardHeader className="prev-card-header">
          <div className="prev-header-left">
            <div className="prev-header-icon">
              <CIcon icon={cilWarning} className="prev-brand-icon" />
            </div>
            <div>
              <h2 className="prev-h2">Materias Previas</h2>
              <p className="prev-sub">
                Inscripciones marcadas como previa (nota final &lt; nota de aprobación).
              </p>
            </div>
          </div>
        </CCardHeader>

        <CCardBody className="prev-card-body">
          <div className="prev-toolbar">
            <div className="prev-filtro">
              <label className="prev-label">Ciclo Lectivo</label>
              <CFormSelect
                value={cicloFiltro}
                onChange={(e) => setCicloFiltro(e.target.value)}
                className="prev-select"
              >
                <option value="">Todos</option>
                {ciclos.map((c) => (
                  <option key={c.id_ciclo_lectivo} value={c.id_ciclo_lectivo}>
                    {c.nombre_ciclo_lectivo}
                  </option>
                ))}
              </CFormSelect>
            </div>

            <CButton
              color="primary"
              variant="outline"
              onClick={cargarPrevias}
              disabled={loading}
              className="prev-btn"
            >
              <CIcon icon={cilReload} className="prev-btn-icon" />
              Refrescar
            </CButton>

            <CButton
              color="warning"
              onClick={ejecutarCierreCiclo}
              disabled={procesando || !cicloFiltro}
              className="prev-btn"
              title={!cicloFiltro ? 'Seleccioná un ciclo para habilitar el cierre' : ''}
            >
              {procesando ? <CSpinner size="sm" /> : <CIcon icon={cilCheckCircle} className="prev-btn-icon" />}
              Cerrar ciclo y recalcular previas
            </CButton>
          </div>

          {error   && <div className="prev-alert prev-alert--error">{error}</div>}
          {mensaje && <div className="prev-alert prev-alert--ok">{mensaje}</div>}

          {loading ? (
            <div className="prev-loading"><CSpinner size="sm" /> Cargando previas...</div>
          ) : previas.length === 0 ? (
            <div className="prev-empty">No hay materias previas activas con los filtros aplicados.</div>
          ) : (
            <div className="prev-table-wrap">
              <table className="prev-table">
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>Materia</th>
                    <th>Ciclo de origen</th>
                    <th className="prev-th--center">Nota final</th>
                    <th className="prev-th--right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {previas.map((p) => (
                    <tr key={p.id_inscripcion}>
                      <td>{p.nombre_alumno}</td>
                      <td>{p.nombre_materia}</td>
                      <td>{p.nombre_ciclo}</td>
                      <td className="prev-td--center prev-nota">
                        {p.nota_final != null ? p.nota_final : <span className="prev-dash">—</span>}
                      </td>
                      <td className="prev-td--right">
                        <button
                          className="prev-btn-levantar"
                          onClick={() => levantarPrevia(p.id_inscripcion)}
                          title="Marcar como aprobada"
                        >
                          <CIcon icon={cilLockUnlocked} style={{ width: '0.875rem', height: '0.875rem' }} />
                          Levantar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CCardBody>
      </CCard>
    </CContainer>
  )
}
