// frontend_AcademiA\src\components\enrollment\GenericEnrollment.jsx

import React, { useState, useEffect } from 'react';
import { CRow, CCol, CFormLabel, CFormSelect, CButton, CSpinner, CBadge } from '@coreui/react';
import { PickList } from 'primereact/picklist';
import { Toast } from 'primereact/toast';
import api from '../../api/api'; // Tu cliente axios configurado
import CIcon from '@coreui/icons-react';
import { cilUser, cilArrowRight } from '@coreui/icons';
import './GenericEnrollment.css';

import EnrollmentPickListItem from './EnrollmentPickListItem'


// Importante: Asegúrate de tener los estilos de PrimeReact importados en tu index.js o App.js
// import 'primereact/resources/themes/lara-light-indigo/theme.css';
// import 'primereact/resources/primereact.min.css';
// import 'primeicons/primeicons.css';

export default function GenericEnrollment({ config }) {
    // ... (Mismos estados de filters, loading, etc. que antes) ...
    const [filters, setFilters] = useState({});
    const [sourceList, setSourceList] = useState([]); 
    const [targetList, setTargetList] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // ... (Aquí irían los  useEffects de carga de datos) ...
    // ... (Simulamos la carga para ver el diseño) ...
    useEffect(() => {
        // Simulación de datos iniciales
        setSourceList([
            { id_entidad: 1, apellido: 'Perez', nombre: 'Juan Ignacio', dni: '40.123.456', estado: 'Regular' },
            { id_entidad: 2, apellido: 'Gomez', nombre: 'Maria Belen', dni: '41.654.987', estado: 'Recursante' },
            { id_entidad: 3, apellido: 'Lopez', nombre: 'Carlos Alberto', dni: '39.888.777', estado: 'Regular' },
            { id_entidad: 4, apellido: 'Martinez', nombre: 'Sofia', dni: '42.111.222', estado: 'Libre' },
        ]);
    }, []);


    
    // --- TEMPLATE VISUAL (Adaptado a Bootstrap/CoreUI) ---
    const itemTemplate = (item) => {
        return (
            <div className="d-flex flex-wrap p-2 align-items-center gap-3 border-bottom border-light">
                
                {/* AVATAR / ICONO (Izquierda) */}
                <div className="d-flex align-items-center justify-content-center bg-light rounded-circle border" style={{ width: '3rem', height: '3rem' }}>
                    <CIcon icon={cilUser} size="xl" className="text-secondary" />
                </div>

                {/* INFO PRINCIPAL (Centro) */}
                <div className="flex-fill d-flex flex-column gap-1">
                    <span className="fw-bold text-dark">
                        {item.apellido}, {item.nombre}
                    </span>
                    <div className="d-flex align-items-center gap-2">
                        <i className="pi pi-id-card text-muted" style={{ fontSize: '0.8rem' }}></i>
                        <span className="small text-muted">{item.dni}</span>
                    </div>
                </div>

                {/* INFO SECUNDARIA / ESTADO (Derecha) */}
                <div className="d-flex flex-column align-items-end">
                    <span 
                    className="fw text-primary mt-1"
                    color={item.estado === 'Regular' ? 'success' : 'warning'}
                    >Regular</span>
                    {/* 
                    <CBadge color={item.estado === 'Regular' ? 'success' : 'warning'} shape="rounded-pill">
                        {item.estado}
                    </CBadge>
                    */}
                    {/* <span className="fw-bold text-primary mt-1">$5000</span> */}
                </div>
            </div>
        );
    };

    

    const targetHeader = (

  <div className="d-flex justify-content-between align-items-center">
    <span>Seleccionados</span>
    <small className="text-muted">
     Cantidad: {targetList?.length}
    </small>
  </div>


  
);

    return (
        <div className="generic-enrollment-wrapper">
            {/* 1. SECCIÓN FILTROS */}
            {/* ... (Igual que antes) ... */}

            {/* 2. SECCIÓN PICKLIST ESTILIZADO */}
            {loading ? (
                <div className="text-center p-5"><CSpinner color="primary"/></div>
            ) : (
                <div className="card shadow-sm border-0">
                    <PickList 
                        // DATA
                        source={sourceList} 
                        target={targetList} 
                        onChange={(e) => {
                            setSourceList(e.source);
                            setTargetList(e.target);
                        }}
                        // itemTemplate={itemTemplate}
                        itemTemplate={(item) => <EnrollmentPickListItem item={item} />}
                        dataKey={config.pickListConfig?.dataKey || 'id_entidad'}
                        
                        // FILTRADO
                        filter 
                        filterBy="apellido,nombre,dni"
                        sourceFilterPlaceholder="Buscar por nombre o DNI..."
                        targetFilterPlaceholder="Buscar en seleccionados..."
                        
                        // CABECERAS
                        sourceHeader={config.pickListConfig?.headerSource || "Disponibles"}
                        //targetHeader={config.pickListConfig?.headerTarget || "Seleccionados"}
                        targetHeader={targetHeader}

                        
                        // ESTILOS DE ALTURA (Verticalidad)
                        sourceStyle={{ height: '24rem' }} 
                        targetStyle={{ height: '24rem' }}
                        
                        // RESPONSIVE
                        breakpoint="1280px" 

                        // ICONOS PERSONALIZADOS (Opcional, para que combine con CoreUI)
                        showSourceControls={false} // Ocultar botones de subir/bajar si no son necesarios
                        showTargetControls={false}
                    />
                </div>
            )}

            {/* 3. BOTÓN CONFIRMAR */}
             <CRow className="mt-4">
                <CCol className="text-end">
                    <CButton color="primary" size="lg" onClick={() => console.log('Guardar')}>
                        Confirmar Inscripción <CIcon icon={cilArrowRight} className="ms-2"/>
                    </CButton>
                </CCol>
            </CRow>
        </div>
    );
}