//  frontend_AcademiA\src\views\statsCards\StatsCardsOverview.jsx

//  View que muestra las StatsCards, y el estado de carga de las mismas

import React from 'react';
import StatCard from '../../components/statCard/StatCard';
import { CCard, CCardBody, CRow, CCol, CSpinner } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilSchool, cilCheckCircle, cilWarning, cilChevronBottom, cilCalendar, cilChartLine, cilSearch } from '@coreui/icons';

const StatsCardsOverview = ({ config, summary = {}, loading = false }) => {
  // Maneja el valor mientras carga
  const renderValue = (val) => {

    // Si el valor es undefined o null, mostramos guión
    if (loading) return <CSpinner size="sm" variant="grow" />; // Spinner pequeño
    return (val !== undefined && val !== null) ? val : "-";
  };

  // Si no hay configuración de stats, no mostramos nada
  if (!config || !config.stats) return null;

  return (
  
    <CRow>
      {/* Mapeamos la configuración para generar las cards dinámicamente */}
      {config.stats.map((stat) => (
        <CCol sm={6} lg={3} key={stat.key}>
          <StatCard
            title={stat.title}
            // Buscamos en 'summary' la llave que indica la config (ej: 'average')
            value={renderValue(summary[stat.key])} 
            
            // Texto opcional debajo (ej: "de 11 alumnos")
            subtext={stat.suffix} 
            
            color={stat.color}
            icon={stat.icon}
          />
        </CCol>
      ))}
    </CRow>
    
  );
};

export default StatsCardsOverview;