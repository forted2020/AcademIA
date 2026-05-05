//  frontend_AcademiA\src\components\AppHeader.js

import React, { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer, CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CHeader, CHeaderNav, CHeaderToggler,
  CNavLink, CNavItem, useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBell, cilContrast, cilEnvelopeOpen, cilList, cilMenu, cilMoon, cilSun } from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'

// Importo el hook para acceder a los datos de la sesión almacenados en AuthProvider
import { useAuth } from '../context/AuthContext';

import useUsuario from '../hooks/useUsuario'


const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  // Extraemos los datos del usuario logueado, la sesión (sessionData), mediante el hook useAuth
  const { sessionData } = useAuth();
  // De sessionData, extraemos id_entidad (solo si sessionData existe)
  const idEntidad = sessionData?.user?.id_entidad;
  // Le pasamos el idEntidad al hook useUsuario, para obtener el nombre de entidad del usuario logueado
  const nombreUsuario = useUsuario(idEntidad);
  console.log("Contenido de nombreUsuario: ", nombreUsuario);


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
        {/*
        <CHeaderNav className="d-none d-md-flex">
          <CNavItem>
            <CNavLink to="/dashboard" as={NavLink}>
              Dashboard
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">
              Usuarios
            </CNavLink>
          </CNavItem>
        </CHeaderNav>
*/}

        {/* 
        <CHeaderNav className="ms-auto">
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilBell} size="lg" />
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilList} size="lg" />
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilEnvelopeOpen} size="lg" />
            </CNavLink>
          </CNavItem>
        </CHeaderNav>
*/}


        <CHeaderNav>

          <div className="px-4 pt-1 pb-2 ">
            {nombreUsuario ? (
              <>
                <span>
                  {nombreUsuario.nombre_completo}
                </span>
                <div className="small text-body-secondary text-capitalize" style={{ textTransform: 'capitalize' }}>
                  {nombreUsuario.tipo_entidad_rel?.tipo_entidad.toLowerCase()}
                </div>
              </>
            ) : (
              <span>Cargando usuario...</span>
            )}
          </div>

          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          {/* 
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false}>
              {colorMode === 'dark' ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === 'auto' ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem
                active={colorMode === 'light'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('light')}
              >
                <CIcon className="me-2" icon={cilSun} size="lg" /> Light
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'dark'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('dark')}
              >
                <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'auto'}
                className="d-flex align-items-center"
                as="button"
                type="button"
                onClick={() => setColorMode('auto')}
              >
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
           
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
        */}

          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>

      {/* Se deshabilita el CContainer del Breacrumb
      <CContainer className="px-4" fluid> 
        <AppBreadcrumb />
      </CContainer>
       */}


    </CHeader>
  )
}

export default AppHeader
