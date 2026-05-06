// src/components/ErrorBoundary.jsx
import React from 'react'

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary atrapó un error:', error, info)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="d-flex flex-column align-items-center justify-content-center p-5 text-center">
                    <h4 className="text-danger">Algo salió mal</h4>
                    <p className="text-muted">Ocurrió un error inesperado en esta sección.</p>
                    <button
                        className="btn btn-outline-primary mt-2"
                        onClick={() => this.setState({ hasError: false, error: null })}
                    >
                        Reintentar
                    </button>
                </div>
            )
        }
        return this.props.children
    }
}

export default ErrorBoundary
