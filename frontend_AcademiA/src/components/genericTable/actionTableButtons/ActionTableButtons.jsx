//  frontend_AcademiA\src\components\genericTable\actionTableButtons\ActionTableButtons.jsx

import React from 'react'
import { CButton, } from '@coreui/react'
import { cilPencil, cilTrash } from '@coreui/icons'
import { CIcon } from '@coreui/icons-react'

export const ActionTableButtons = ({ rowData, openEdit, openDelete }) => {
    console.log("Datos recibidos en ActionTableButton: ", { rowData, openEdit, openDelete });
    return (
        <div className="d-flex gap-2">

            <CButton
                color="info" size="sm" variant="outline"
                // Función openEdit(rowData) del hook
                onClick={() => {
                     console.log("Datos recibidos en ActionTableButton: ", { rowData, openEdit, openDelete });
                        openEdit(rowData)
                }

                }
            >
                <CIcon icon={cilPencil} />
            </CButton>

            <CButton
                color="danger" size="sm" variant="outline"
                // Función openDelete(id) del hook
                onClick={() => openDelete(rowData)}
            >
                <CIcon icon={cilTrash} />
            </CButton>

        </div>
    )
}