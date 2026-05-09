// frontend_AcademiA\src\views\materias\MateriasInformes.jsx

import React from 'react';
import { CContainer } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilBook } from '@coreui/icons';

import './MateriasInformes.css';


export default function MateriasInformes() {

    return (
        <CContainer fluid className="py-3">

            <div className="usr-inf-card mb-1">

                {/* ── Encabezado ── */}
                <div className="usr-inf-card-header">
                    <div className="usr-inf-header-brand">
                        <div className="usr-inf-header-brand-icon">
                            <CIcon icon={cilBook} className="usr-inf-brand-icon" />
                        </div>
                        <div>
                            <h2 className="usr-inf-header-h2">Informes de Materias</h2>
                            <p className="usr-inf-header-sub">Reportes del plan académico</p>
                        </div>
                    </div>
                </div>

                {/* ── Cuerpo ── */}
                <div className="usr-inf-card-body">
                    <div className="usr-inf-placeholder">
                        Sección en construcción. Los informes de materias estarán disponibles próximamente.
                    </div>
                </div>

            </div>

        </CContainer>
    );
}
