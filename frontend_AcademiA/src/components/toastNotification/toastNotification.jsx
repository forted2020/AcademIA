//  frontend_AcademiA\src\components\toastNotification\toastNotification.jsx

import React from 'react'
import { CToaster, CToast, CToastHeader, CToastBody, CToastClose, CCloseButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilWarning, cilXCircle } from '@coreui/icons'
import '../../App.css'

const ToastNotification = ({ toast, setToast }) => {
    // Si no hay objeto toast, no renderizamos nada para no ensuciar el DOM
    // if (!toast) return null;

    return (

        <CToaster 
        placement="top-end" 
        className="p-3"
        style={{ position: 'fixed', overflow: 'visible' }}
        >
            <CToast
                autohide={true}
                delay={3000}
                visible={!!toast}
                animation={true}
                color={toast?.color}
                className="text-white align-items-center shadow-lg"
                onClose={() => setToast(null)} // Limpia el estado para que pueda volver a dispararse
            >

                <CToastHeader className="bg-transparent text-white border-bottom-0 d-flex justify-content-between align-items-center">

                    <div className=" me-auto">
                        <CIcon icon={toast?.color === 'success' ? cilCheckCircle : cilWarning} className="me-2" />
                        {toast?.title || 'Sistema'}
                    </div>
                    <small className="me-2">Ahora</small>

                    <CCloseButton
                        className="btn-close-white"
                        onClick={() => setToast(null)}
                    />
                </CToastHeader>
<div style={{ height: '1px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.57)' }}></div>
                <div className="d-flex">
                    <CToastBody className="fw-bold">
                        {toast?.message}
                    </CToastBody>
                </div>
                
            </CToast>
        </CToaster>
    )
}

export default ToastNotification