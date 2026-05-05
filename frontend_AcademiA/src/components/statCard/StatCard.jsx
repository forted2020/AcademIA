// frontend_AcademiA\src\components\statCard\StatCard.jsx

import React from 'react';
import { CCard, CCardBody } from '@coreui/react';
import CIcon from '@coreui/icons-react';

import './StatCard.css'; // ✅ Importar el CSS


// --- Sub-componente: Tarjeta de Estadísticas (KPI) ---
const StatCard = ({ title, value, icon, color, subtext }) => {
    console.log ('Datos que recibe la StatCard: ', title, value, icon, color, subtext)
    return (
        <CCard
            className={`stat-card stat-card-${color} shadow-sm border-0 h-100 p-2`}
        >
            <CCardBody className="d-flex align-items-center justify-content-between">
                <div>
                    <p className="text-label mb-1">{title}</p>
                    <h3 className={`fw-bold text-${color} mb-0 display-6`}>{value}</h3>
                    {subtext && <small className="text-muted" style={{ fontSize: '0.75rem' }}>{subtext}</small>}
                </div>

                {/* Renderizado condicional. Si se recibe ícono, se muestra con el círculo exterior. */}
                {icon && (
                    <div className={`bg-${color} bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center`} style={{ width: '60px', height: '60px' }}>
                        <CIcon icon={icon} size="xl" className={`text-${color}`} />
                    </div>
                )}

            </CCardBody>
        </CCard>
    );
};
export default StatCard;


/**
 * 
 * Props:
 * - title: string - Título de la estadística (ej. "Promedio General")
 * - value: string|number - Valor principal a destacar
 * - icon: icon - Icono de @coreui/icons-react a mostrar
 * - color: string - Color de Bootstrap (primary, success, info, danger, etc.)
 * - subtext: string (opcional) - Texto pequeño adicional debajo del valor
 */