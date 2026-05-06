//  frontend_AcademiA\src\components\AppHeader.js

import React, { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer, CHeader, CHeaderNav, CHeaderToggler, CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilMenu } from '@coreui/icons'

import { AppHeaderDropdown } from './header/index'
import { useAuth } from '../context/AuthContext'
import useUsuario from '../hooks/useUsuario'
import { useNotificaciones } from '../hooks/useNotificaciones'
import PanelNotificaciones from './notificaciones/PanelNotificaciones'


const AppHeader = () => {
  const headerRef = useRef()

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  const { sessionData } = useAuth()
  const idEntidad = sessionData?.user?.id_entidad
  const nombreUsuario = useUsuario(idEntidad)

  const {
    notificaciones,
    contador,
    panelAbierto,
    cargandoPanel,
    togglePanel,
    cerrarPanel,
    handleMarcarLeidas,
    handleMarcarTodasLeidas,
    handleEliminar,
  } = useNotificaciones()

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  return (
    <CHeader position="sticky" className="mb-2 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-4" fluid>

        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        <CHeaderNav className="ms-auto align-items-center gap-2">

          {/* ── Nombre del usuario ── */}
          <div className="px-3 pt-1 pb-1 text-end">
            {nombreUsuario ? (
              <>
                <span className="fw-semibold small">{nombreUsuario.nombre_completo}</span>
                <div className="small text-body-secondary" style={{ textTransform: 'capitalize' }}>
                  {nombreUsuario.tipo_entidad_rel?.tipo_entidad?.toLowerCase()}
                </div>
              </>
            ) : (
              <span className="small text-muted">Cargando...</span>
            )}
          </div>

          <li className="nav-item py-1">
            <div className="vr h-100 mx-1 text-body text-opacity-75" />
          </li>

          {/* ── Badge de notificaciones ── */}
          <li className="nav-item" style={{ position: 'relative' }}>
            <button
              className="btn btn-link nav-link p-2 position-relative"
              onClick={togglePanel}
              title="Notificaciones"
              style={{ lineHeight: 1 }}
            >
              <CIcon icon={cilBell} size="lg" />
              {contador > 0 && (
                <CBadge
                  color="danger"
                  shape="rounded-pill"
                  className="position-absolute"
                  style={{ top: '2px', right: '2px', fontSize: '0.6rem', minWidth: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {contador > 99 ? '99+' : contador}
                </CBadge>
              )}
            </button>

            {panelAbierto && (
              <PanelNotificaciones
                notificaciones={notificaciones}
                cargandoPanel={cargandoPanel}
                onMarcarLeida={handleMarcarLeidas}
                onMarcarTodasLeidas={handleMarcarTodasLeidas}
                onEliminar={handleEliminar}
                onCerrar={cerrarPanel}
              />
            )}
          </li>

          <li className="nav-item py-1">
            <div className="vr h-100 mx-1 text-body text-opacity-75" />
          </li>

          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
