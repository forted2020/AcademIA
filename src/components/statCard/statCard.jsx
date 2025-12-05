// StatCard.jsx

import React from 'react';
import { CCard, CCardBody } from '@coreui/react';
import CIcon from '@coreui/icons-react';

// --- Sub-componente: Tarjeta de Estadísticas (KPI) ---
const StatCard = ({ title, value, icon, color, subtext }) => (
    <CCard className="card-modern h-100 p-2">
        <CCardBody className="d-flex align-items-center justify-content-between">
            <div>
                <p className="text-label mb-1">{title}</p>
                <h3 className={`fw-bold text-${color} mb-0 display-6`}>{value}</h3>
                {subtext && <small className="text-muted" style={{ fontSize: '0.75rem' }}>{subtext}</small>}
            </div>
            <div className={`bg-${color} bg-opacity-10 p-3 rounded-circle d-flex align-items-center justify-content-center`} style={{ width: '60px', height: '60px' }}>
                <CIcon icon={icon} size="xl" className={`text-${color}`} />
            </div>
        </CCardBody>
    </CCard>
);

export default StatCard;


/**
 * Componente reutilizable para mostrar una tarjeta de estadística (KPI).
 * 
 * Se utiliza para resaltar métricas clave como promedio general, materias aprobadas,
 * asistencia global, etc., con un diseño moderno que incluye:
 * - Título y valor principal destacado
 * - Icono decorativo con fondo de color
 * - Texto secundario opcional (subtext)
 * - Colores personalizables según el tipo de métrica (primary, success, info, danger, etc.)
 * 
 * Props:
 * - title: string - Título de la estadística (ej. "Promedio General")
 * - value: string|number - Valor principal a destacar
 * - icon: icon - Icono de @coreui/icons-react a mostrar
 * - color: string - Color de Bootstrap (primary, success, info, danger, etc.)
 * - subtext: string (opcional) - Texto pequeño adicional debajo del valor
 * 
 * Ejemplo de uso:
 * <StatCard title="Promedio General" value="8.5" icon={cilChartLine} color="primary" subtext="Escala de 1 a 10" />
 */