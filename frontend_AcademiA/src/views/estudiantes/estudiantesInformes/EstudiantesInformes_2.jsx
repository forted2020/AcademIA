// frontend_AcademiA\src\views\estudiantes\estudiantesInformes\EstudiantesInformes.jsx

// Controla el Estado: Usa useState para recordar qué opción eligió el usuario en el primer select.
// Extrae la Sub-Configuración: Usa EstudiantesInformesConfig.reports[clave] para sacar solo los datos del informe que necesitamos (ej. solo los datos de "Notas" o solo los de "Datos Personales").
// Reinicia completamente cada vez que se cambia la opción principal. Asegura que no se mezclen los datos.

import React, { useState } from 'react';
import { CCard, CCardBody, CRow, CCol, CFormLabel, CFormSelect } from '@coreui/react';
import './EstudiantesInformes.css';

// Componente Genérico
import GenericInform from '../../../components/informes/GenericInform';
// Configuración Jerárquica
import { EstudiantesInformesConfig } from './EstudiantesInformesConfig';

export default function EstudiantesInformes() {

    // ESTADO DEL SELECTOR MAESTRO
    // Inicializamos con el primer valor de las opciones definidas en el config
    const [selectedReportKey, setSelectedReportKey] = useState(
        EstudiantesInformesConfig.mainSelector.options[0].value
    );

    // SELECCIÓN DE LA CONFIGURACIÓN ACTIVA
    // Buscamos dentro del diccionario 'reports' la configuración que coincide con la selección
    const activeConfig = EstudiantesInformesConfig.reports[selectedReportKey];

    return (
        <div className="estudiantes-informes-container">
            
            {/*SELECTOR MAESTRO (Siempre visible)*/}
            <CCard className="mb-4 shadow-sm border-top-primary border-top-3">
                <CCardBody>
                    <CRow className="align-items-end">
                        <CCol md={4}>
                            <CFormLabel className="fw-bold text-primary">
                                {EstudiantesInformesConfig.mainSelector.label}
                            </CFormLabel>
                            <CFormSelect
                                value={selectedReportKey}
                                onChange={(e) => setSelectedReportKey(e.target.value)}
                            >
                                {EstudiantesInformesConfig.mainSelector.options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </CFormSelect>
                        </CCol>
                        
                        <CCol md={8}>
                            {/* Pequeña descripción visual para confirmar qué se está viendo */}
                            <div className="text-muted small mb-1 ms-3">
                                {activeConfig 
                                    ? `Mostrando: ${activeConfig.subtitle || activeConfig.title}` 
                                    : 'Seleccione un informe valido'}
                            </div>
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            {/* MOTOR GENÉRICO */}
            {activeConfig ? (
                <GenericInform 
                    // CLAVE: key={selectedReportKey}
                    // Al cambiar la key, React destruye el componente anterior y crea uno nuevo. 
                    // Esto limpia automáticamente los filtros viejos y evita errores al cambiar de tipo de informe.
                    key={selectedReportKey} 
                    
                    // Pasamos SOLO la sub-configuración elegida
                    config={activeConfig} 
                />
            ) : (
                <div className="alert alert-warning">
                    No se encontró configuración para el informe seleccionado.
                </div>
            )}
            
        </div>
    );
}

   