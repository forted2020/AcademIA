
import React from 'react'
import { CContainer } from '@coreui/react'
import CargarNotas from '../notas/CargaNotas'

export default function DocenteCargaNotas() {
    return (
        <CContainer fluid className="py-3">
            <CargarNotas />
        </CContainer>
    )
}
