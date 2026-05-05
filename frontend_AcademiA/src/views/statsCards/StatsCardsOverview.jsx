//  frontend_AcademiA\src\views\statsCards\StatsCardsOverview.jsx

//  View que muestra las StatsCards, y el estado de carga de las mismas
// No calcula datos ni transforma información, sólo renderiza UI en base a props

import React from 'react';
// Importamos componente atómico que representa una tarjeta KPI individual
import StatCard from '../../components/statCard/StatCard';

import { CCard, CCardBody, CRow, CCol, CSpinner } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSchool, cilCheckCircle, cilWarning, cilChevronBottom, cilCalendar, cilChartLine, cilSearch } from '@coreui/icons';

// Props que debe reibir:
// - config: configuración del informe (define qué KPIs mostrar)
// - summary: objeto con los valores finales calculados (KPIs)
// - loading: indica si el informe está cargando datos
const StatsCardsOverview = ({ config, summary, loading, onCardClick, activeFilter }) => {

  // Si el informe no define métricas (stats), no renderiza nada.
  if (!config?.stats) return null;

  if (loading) {
    return <div className="text-center py-3">Calculando métricas...</div>;
  }

  // ESTADO DE CARGA
  // Carga los datos y renderiza pero mostrando primero un spinner (mantiene estable el layout)
  if (loading) {
    return (
      <CRow>
        {/* Recorremos la definición de stats SOLO para saber cuántas cards mostrar */}
        {config.stats.map(stat => (
          <CCol sm={6} lg={3} key={stat.key}>
            <CCard className="h-100 p-3 text-center">
              {/* Indicador visual de carga */}
              <CSpinner size="sm" />
            </CCard>
          </CCol>
        ))}
      </CRow>
    );
  }

  // ESTADO NORMAL (datos cargados)

  return (
    <CRow>
      {/* Recorremos la configuración declarativa de métricas. 
      Cada "stat" define UNA tarjeta KPI. */}

      {config.stats.map(stat => {
        console.log('😎 Valores recibidos de los filtros: ',stat)

        //  Calculamos si la  tarjeta está activa o es clickeable ---
        const isActive = activeFilter && stat.filter && activeFilter.value === stat.filter.value;
        const isClickable = !!stat.filter;
        return (
          <CCol sm={6} lg={3} key={stat.key} className="mb-3">

            {/* Wrappeamos div para manejar el Click y los Estilos --- */}
            <div
              onClick={() => isClickable && onCardClick && onCardClick(stat)}
              style={{
                cursor: isClickable ? 'pointer' : 'default',
                transition: 'all 0.2s ease-in-out',
                // Si hay un filtro activo y ESTA tarjeta no es la activa, la opacamos (Efecto Dim)
                opacity: (activeFilter && !isActive) ? 0.6 : 1,
                // Si está activa, la agrandamos un poquito
                transform: isActive ? 'scale(1.03)' : 'scale(1)',
                // Borde de color cuando está seleccionada
                border: isActive ? `2px solid var(--cui-${stat.color})` : '2px solid transparent',
                borderRadius: '0.375rem'
              }}
            >
              <StatCard
                // Título visible de la métrica
                title={stat.title}
                // Valor del KPI: se obtiene directamente desde summary, 
                // usando la key definida en la config
                value={summary[stat.key]}
                // Texto secundario opcional (si la config lo define)
                subtext={stat.suffix}
                // Color visual de la tarjeta (primary, success, danger, etc.)
                color={stat.color}
                // Ícono decorativo (opcional)
                icon={stat.icon}
              />
            </div>
          </CCol>
        );
      })}
    </CRow>
  );
};
export default StatsCardsOverview;