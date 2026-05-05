//  src\views\estudiantes\AttendanceSection.jsx
//  Componente de registro de Asistencias

import React, { useState } from 'react';
import { CCard, CCardBody, CCollapse, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilChevronBottom, cilCheckCircle, cilXCircle } from '@coreui/icons';
import '../../css/AdvancedFilters.css'

const AttendanceSection = ({ attendanceData, year }) => {
  const [openAttendance, setOpenAttendance] = useState(false);

  console.log(" Datos recibidos del padre: ", year );
  console.log("ID capturado para el backend:", );
  console.log("Nombre para la interfaz:", );

  // Verificación de seguridad inicial
  if (!attendanceData || !attendanceData.detailedRecords) {
    // Si no hay registro detallado (Años anteriores)
    return (
      <div className="bg-white p-5 rounded-xl card-modern text-center text-gray-500 italic">
        <CIcon icon={cilXCircle} size="3xl" className="mx-auto mb-3 text-gray-400" />
        <p className="text-lg fw-bold">No hay registro detallado de inasistencias disponible para el año {year}.</p>
        <p className="text-sm">La información de asistencia detallada se activa al inicio del ciclo actual.</p>
      </div>
    );
  }

  // Mapeo de los nombres del Backend
  // Usamos valores por defecto (ej: = 0) para evitar el error de 'toFixed'
  const {
    totalInasistencia = 0,
    totalInasistenciaJustif = 0,
    detailedRecords = []
  } = attendanceData;

  // Cálculos derivados
  const unjustifiedDays = (totalInasistencia - totalInasistenciaJustif).toFixed(2);
  const isAttendanceBad = totalInasistencia >= 15; // Ejemplo de umbral de riesgo

  const attendanceColor = isAttendanceBad ? 'danger' : 'success';
  const chevronClass = openAttendance ? 'rotate-180' : '';


  // Componente Reutilizable para Badge de Justificación
  const JustificationBadge = ({ isJustified }) => {
    const color = isJustified ? 'success' : 'danger';
    const bgClass = isJustified ? 'bg-success-subtle' : 'bg-danger-subtle';
    const text = isJustified ? 'Sí' : 'No';
    const icon = isJustified ? cilCheckCircle : cilXCircle;

    return (
      <span className={`badge-soft ${bgClass} text-${color} d-inline-flex align-items-center`}>
        <CIcon icon={icon} size="sm" className="me-1" />
        {text}
      </span>
    );
  };

  // Componente Reutilizable para el tipo de Ausencia
  const AbsenceType = ({ type, value }) => {
    let colorClass = 'text-danger'; // Default para Completa/Media
    if (type.toLowerCase().includes('cuarta')) {
      colorClass = 'text-info';
    }
    return (
      <span className={`font-semibold ${colorClass}`}>{type} ({value.toFixed(2)})</span>
    );
  };

  return (
    <CCard className="card-modern overflow-hidden attendance-summary">

      {/* Tarjeta de Resumen Clickable (UX: Hover y Chevron) */}
      <CCardBody
        className="d-flex justify-content-between align-items-center p-4 cursor-pointer hover:bg-light transition"
        onClick={() => setOpenAttendance(!openAttendance)}
      >

        {/* Resumen General */}
        <div className="flex-1 min-w-0 pe-4">
          <h5 className="fw-bold text-dark mb-1">Inasistencias (Año {year}</h5>
          <p className="text-sm text-muted">
            El detalle se mide en días completos o fracciones.
          </p>
        </div>

        {/* Indicadores Clave */}
        <div className="d-flex align-items-center gap-4">

          <div className="d-none d-sm-flex flex-column align-items-center">
            <p className="text-sm font-medium text-muted mb-0">Total</p>
            <span className={`fs-3 fw-bolder text-${attendanceColor}`}>{totalInasistencia.toFixed(1)}</span>
          </div>

          <div className="d-none d-sm-flex flex-column align-items-center">
            <p className="text-sm font-medium text-muted mb-0">Justificadas</p>
            <span className={`fs-3 fw-bolder text-success`}>{totalInasistenciaJustif}</span>
          </div>

          <div className="d-none d-sm-flex flex-column align-items-center">
            <p className="text-sm font-medium text-muted mb-0">Sin Justificar</p>
            <span className={`fs-3 fw-bolder text-danger`}>{unjustifiedDays}</span>
          </div>

          <CIcon
            icon={cilChevronBottom}
            className={`w-6 h-6 text-muted chevron-icon ${chevronClass}`}
            size="xl"
          />
        </div>
      </CCardBody>

      {/* Detalle de Inasistencias (Collapsable) */}
      {/* Detalle de Inasistencias (Collapsable) */}
      <CCollapse visible={openAttendance}>
        <div className="p-4 bg-light border-top border-gray-200">
          <h3 className="fw-bold text-dark mb-4 text-lg">
            Detalle de Inasistencias por Fecha ({detailedRecords.length} registros)
          </h3>

          <div className="overflow-x-auto">
            <CTable hover responsive className="bg-white border w-100 m-0">
              <CTableHead className="bg-light">
                <CTableRow>
                  {/* Definimos anchos fijos para distribuir el 100% del espacio */}
                  <CTableHeaderCell className="px-4 py-3 text-center text-xs text-muted border-bottom" style={{ width: '20%' }}>
                    Fecha
                  </CTableHeaderCell>
                  <CTableHeaderCell className="px-4 py-3 text-center text-xs text-muted border-bottom" style={{ width: '25%' }}>
                    Tipo Inasistencia
                  </CTableHeaderCell>
                  <CTableHeaderCell className="px-4 py-3 text-center text-xs text-muted border-bottom" style={{ width: '15%' }}>
                    Justificada
                  </CTableHeaderCell>
                  <CTableHeaderCell className="px-4 py-3 text-center text-xs text-muted border-bottom d-none d-sm-table-cell">
                    Motivo / Detalle
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>

              <CTableBody className="text-sm">
                {detailedRecords.map((record, index) => (
                  <CTableRow key={index} className="align-middle">
                    <CTableDataCell className="px-4 py-3 fw-medium text-dark text-center ">
                      {record.date}
                    </CTableDataCell>
                    <CTableDataCell className="px-4 py-3 text-center">
                      <AbsenceType type={record.type} value={record.value} />
                    </CTableDataCell>
                    <CTableDataCell className="px-4 py-3 text-center">
                      <JustificationBadge isJustified={record.justified} />
                    </CTableDataCell>
                    <CTableDataCell className="px-4 py-3  text-center text-muted d-none d-sm-table-cell">
                      <div className="text-truncate-2" title={record.reason}>
                        {record.reason || <span className="text-gray-300">—</span>}
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </div>

          <hr className="my-4 border-gray-300" />

          <p className="text-xs text-muted fw-medium px-1">
            Nota: El total de inasistencias acumuladas es de <b>{totalInasistencia.toFixed(1)}</b> días completos (la suma de las fracciones de asistencia).
          </p>
        </div>
      </CCollapse>
    </CCard>
  );
};

export default AttendanceSection;