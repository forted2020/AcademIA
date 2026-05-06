// frontend_AcademiA\src\hooks\useNotificaciones.js
//
// Gestiona el estado global de notificaciones: lista, contador y acciones.
// Se monta una sola vez en AppHeader y hace polling cada 60 segundos.

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  getNotificaciones,
  getContadorNoLeidas,
  marcarLeidas,
  eliminarNotificacion,
} from '../api/apiNotificaciones'
import { useAuth } from '../context/AuthContext'

const POLL_INTERVAL_MS = 60_000 // refresca el contador cada 60 s

export const useNotificaciones = () => {
  const { sessionData } = useAuth()
  const autenticado = sessionData?.isAuthenticated

  const [notificaciones, setNotificaciones] = useState([])
  const [contador, setContador] = useState(0)
  const [panelAbierto, setPanelAbierto] = useState(false)
  const [cargandoPanel, setCargandoPanel] = useState(false)
  const intervalRef = useRef(null)

  // Recarga solo el contador (liviano, se hace en polling)
  const refrescarContador = useCallback(async () => {
    if (!autenticado) return
    try {
      const res = await getContadorNoLeidas()
      setContador(res.data?.total ?? 0)
    } catch {
      // silencioso — no interrumpe la UX
    }
  }, [autenticado])

  // Carga la lista completa (solo cuando se abre el panel)
  const cargarNotificaciones = useCallback(async () => {
    if (!autenticado) return
    setCargandoPanel(true)
    try {
      const res = await getNotificaciones({ limit: 30 })
      setNotificaciones(res.data ?? [])
      // Actualizar contador con los datos ya cargados
      const noLeidas = (res.data ?? []).filter((n) => !n.leida).length
      setContador(noLeidas)
    } catch {
      setNotificaciones([])
    } finally {
      setCargandoPanel(false)
    }
  }, [autenticado])

  // Abre/cierra el panel — al abrir carga la lista
  const togglePanel = useCallback(() => {
    setPanelAbierto((prev) => {
      if (!prev) cargarNotificaciones()
      return !prev
    })
  }, [cargarNotificaciones])

  const cerrarPanel = useCallback(() => setPanelAbierto(false), [])

  // Marca IDs como leídas y actualiza estado local
  const handleMarcarLeidas = useCallback(
    async (ids) => {
      try {
        await marcarLeidas(ids)
        setNotificaciones((prev) =>
          prev.map((n) => (ids.includes(n.id) ? { ...n, leida: true } : n))
        )
        setContador((prev) => Math.max(0, prev - ids.length))
      } catch {
        // mantenemos el estado anterior
      }
    },
    []
  )

  // Marca todas como leídas de una vez
  const handleMarcarTodasLeidas = useCallback(async () => {
    const noLeidas = notificaciones.filter((n) => !n.leida).map((n) => n.id)
    if (noLeidas.length === 0) return
    await handleMarcarLeidas(noLeidas)
  }, [notificaciones, handleMarcarLeidas])

  // Elimina una notificación y la quita de la lista
  const handleEliminar = useCallback(async (id) => {
    try {
      await eliminarNotificacion(id)
      setNotificaciones((prev) => {
        const eliminada = prev.find((n) => n.id === id)
        if (eliminada && !eliminada.leida) {
          setContador((c) => Math.max(0, c - 1))
        }
        return prev.filter((n) => n.id !== id)
      })
    } catch {
      // silencioso
    }
  }, [])

  // Polling del contador
  useEffect(() => {
    if (!autenticado) return
    refrescarContador()
    intervalRef.current = setInterval(refrescarContador, POLL_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [autenticado, refrescarContador])

  return {
    notificaciones,
    contador,
    panelAbierto,
    cargandoPanel,
    togglePanel,
    cerrarPanel,
    handleMarcarLeidas,
    handleMarcarTodasLeidas,
    handleEliminar,
    refrescarContador,
  }
}
