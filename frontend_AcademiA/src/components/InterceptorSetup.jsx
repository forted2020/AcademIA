// src/components/InterceptorSetup.jsx
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'
import { setupInterceptors } from '../api/setupInterceptors'

const InterceptorSetup = () => {
    const { showWarn, showError } = useToast()
    const { logout } = useAuth()
    const navigate = useNavigate()
    const initialized = useRef(false)

    useEffect(() => {
        if (initialized.current) return
        initialized.current = true

        setupInterceptors({
            showWarn,
            showError,
            onUnauthorized: () => {
                logout()
                navigate('/login', { replace: true })
            },
        })
    }, [])

    return null
}

export default InterceptorSetup
