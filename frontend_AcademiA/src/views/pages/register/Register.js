import React, { useState } from 'react'

import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
} from '@coreui/react'

import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilEnvelopeOpen } from '@coreui/icons'
import axios from 'axios'

const PASSWORD_RULES = [
  { test: (p) => p.length >= 8,              label: 'Mínimo 8 caracteres' },
  { test: (p) => /\d/.test(p),               label: 'Al menos un número' },
  { test: (p) => /[!@#$%^&*(),.?":{}|<>_\-+=/\\]/.test(p), label: 'Al menos un carácter especial' },
]

function getPasswordErrors(password) {
  return PASSWORD_RULES.filter((r) => !r.test(password)).map((r) => r.label)
}

const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [passwordTouched, setPasswordTouched] = useState(false)

  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const passwordErrors = getPasswordErrors(password)
  const passwordValid = passwordErrors.length === 0

  const handleChange = (e) => {
    const { name, value } = e.target
    setErrorMessage('')
    setSuccessMessage('')
    if (name === 'name') setName(value)
    if (name === 'email') setEmail(value)
    if (name === 'password') { setPassword(value); setPasswordTouched(true) }
    if (name === 'repeatPassword') setRepeatPassword(value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!name.trim() || !email.trim() || !password.trim() || !repeatPassword.trim()) {
      setErrorMessage('Por favor, completá todos los campos.')
      return
    }
    if (!passwordValid) {
      setErrorMessage('La contraseña no cumple los requisitos de seguridad.')
      return
    }
    if (password !== repeatPassword) {
      setErrorMessage('Las contraseñas no coinciden.')
      return
    }

    try {
      await axios.post('/api/register', { name, email, password, tipo_usuario: 'EST' })
      setSuccessMessage('Usuario registrado. Por favor, verificá tu correo.')
      setName(''); setEmail(''); setPassword(''); setRepeatPassword('')
      setPasswordTouched(false)
    } catch (err) {
      const detail = err.response?.data?.detail
      if (Array.isArray(detail)) {
        setErrorMessage(detail.map((d) => d.msg).join(' · '))
      } else {
        setErrorMessage(detail || 'Error del servidor.')
      }
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleSubmit}>
                  <h1>Registro</h1>
                  <p className="text-body-secondary">Cree su cuenta de usuario</p>

                  {successMessage && <CAlert color="success" className="mb-3">{successMessage}</CAlert>}
                  {errorMessage   && <CAlert color="danger"  className="mb-3">{errorMessage}</CAlert>}

                  <CInputGroup className="mb-3">
                    <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                    <CFormInput
                      placeholder="Nombre de Usuario"
                      autoComplete="username"
                      name="name"
                      value={name}
                      onChange={handleChange}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText><CIcon icon={cilEnvelopeOpen} /></CInputGroupText>
                    <CFormInput
                      type="email"
                      placeholder="Correo electrónico"
                      autoComplete="email"
                      name="email"
                      value={email}
                      onChange={handleChange}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-1">
                    <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Contraseña"
                      autoComplete="new-password"
                      name="password"
                      value={password}
                      onChange={handleChange}
                      invalid={passwordTouched && !passwordValid}
                      valid={passwordTouched && passwordValid}
                    />
                  </CInputGroup>

                  {/* Indicador de requisitos en tiempo real */}
                  {passwordTouched && (
                    <ul className="mb-3 ps-3" style={{ fontSize: '0.8rem' }}>
                      {PASSWORD_RULES.map((r) => (
                        <li key={r.label} style={{ color: r.test(password) ? 'green' : 'red' }}>
                          {r.test(password) ? '✓' : '✗'} {r.label}
                        </li>
                      ))}
                    </ul>
                  )}

                  <CInputGroup className="mb-4">
                    <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Repetir contraseña"
                      autoComplete="new-password"
                      name="repeatPassword"
                      value={repeatPassword}
                      onChange={handleChange}
                      invalid={repeatPassword.length > 0 && password !== repeatPassword}
                      valid={repeatPassword.length > 0 && password === repeatPassword}
                    />
                  </CInputGroup>

                  <div className="d-grid">
                    <CButton color="success" type="submit">
                      Crear cuenta
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
