import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,

} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'

import { logo } from 'src/assets/brand/logo'
import { sygnet } from 'src/assets/brand/sygnet'

// sidebar nav config
// import navigation from '../_nav'
import getNavItems from '../_nav'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  console.log('AppSidebar: Estado inicial - unfoldable=', unfoldable, 'sidebarShow=', sidebarShow); // Depura estado inicial


  return (

    <CSidebar 
      className="border-end sidebar"    // Borde derecho del sidebar
      colorScheme="dark"    // Tema oscuro como el template
      position="fixed"    // Sidebar fijo
      unfoldable={unfoldable}   // Controla colapsado/expandido
      visible={sidebarShow}   // Muestra/oculta sidebar
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })   // Actualiza estado en Redux
        console.log('AppSidebar: Cambiando sidebarShow a', visible); // Depura cambio

      }}
    > 
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/">
          <CIcon customClassName="sidebar-brand-full" icon={logo} height={32} />
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
        </CSidebarBrand>

        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>

      <AppSidebarNav items={getNavItems()} />

      <CSidebarFooter className="border-top d-none d-md-flex">
        <CSidebarToggler
          onClick={() => {
            const newUnfoldable = !unfoldable; // Calcula nuevo estado
            dispatch({ type: 'set', sidebarUnfoldable: newUnfoldable  })  // Actualiza Redux
            console.log('AppSidebar: Cambiando unfoldable a', newUnfoldable); // Depura cambio
          }}
        />
      </CSidebarFooter>

    </CSidebar>
  )
}

export default React.memo(AppSidebar)
