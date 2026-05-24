// src/context/ToastContext.jsx
import React, { createContext, useContext, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Toast } from 'primereact/toast'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
    const toastRef = useRef(null)

    const showToast = ({ severity = 'info', summary, detail, life = 3500 }) => {
        toastRef.current?.show({ severity, summary, detail, life })
    }

    const showSuccess = (detail, summary = 'Éxito')    => showToast({ severity: 'success', summary, detail })
    const showError   = (detail, summary = 'Error')    => showToast({ severity: 'error',   summary, detail })
    const showWarn    = (detail, summary = 'Atención') => showToast({ severity: 'warn',    summary, detail })
    const showInfo    = (detail, summary = 'Info')     => showToast({ severity: 'info',    summary, detail })

    return (
        <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarn, showInfo }}>
            {children}
            {/* Portal al body — evita quedar atrapado por stacking contexts de modales */}
            {createPortal(
                <Toast ref={toastRef} position="top-right" />,
                document.body
            )}
        </ToastContext.Provider>
    )
}

export const useToast = () => {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
    return ctx
}
