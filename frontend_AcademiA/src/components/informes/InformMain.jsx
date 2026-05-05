// frontend_AcademiA\src\components\informes\InformMain.jsx

// Corazón visual del reporte de informes. Renderiza la tabla.
// Recibe los datos y los distribuye en las secciones del informe.

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { CCard, CCardHeader, CCardBody } from '@coreui/react';
import { Button } from 'primereact/button'; // Usamos botones de Prime para consistencia
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import StatsCardsOverview from '../../views/statsCards/StatsCardsOverview';
import InformHeader from './InformHeader';

// import { generatePDF, generateExcel } from './exportUtils';
import { ExportExcelButton } from '../../components/exportUtils/exportExcelButton';
import { ExportPDFButton } from '../../components/exportUtils/exportPDFButton';



const InformMain = ({ config, data, loading }) => {
    console.log('Info recibida en InformMain: ', 'config: ', config, 'data:', data, 'loading: ', loading)

    const dt = useRef(null); // Referencia a la tabla

    // Estado que controla qué filtro visual está activo (null = ninguno)
    const [activeFilter, setActiveFilter] = useState(null);

    // Si cambian los datos globales (ej. el usuario cambia de Curso), reseteamos el filtro
    useEffect(() => { setActiveFilter(null) }, [data]);

    // Lògica defiltrado: useMemo para que no recalcule en cada render si no cambia nada importante
    const filteredList = useMemo(() => {
        const list = data?.list || [];

        // Si no hay filtro activo, devolvemos la lista entera
        if (!activeFilter) return list;

        // Si hay filtro, aplicamos la condición definida en el config
        return list.filter(item => {
            // Obtenemos el valor de la celda (ej. la nota del alumno)
            const cellValue = item[activeFilter.field];

            // Si tiene definido un filtro avanzado ('isMatch'), ejecutamos su función
            if (activeFilter.isMatch) {
                return activeFilter.isMatch(cellValue);
            }
            // Si tiene definido un filtrosimple
            return cellValue === activeFilter.value;
        });
    }, [data?.list, activeFilter]);

    // Handler para el clic en una tarjeta
    const handleCardClick = (statConfig) => {
        // Si la tarjeta no tiene configuración de filtro, no hacemos nada
        if (!statConfig.filter) return;

        // Lógica Toggle: Si ya estaba activo este filtro, lo desactivamos. Si no, lo activamos.
        if (activeFilter && activeFilter.value === statConfig.filter.value) {
            setActiveFilter(null);
        } else {
            setActiveFilter(statConfig.filter);
        }
    };

    // Botones de exportación (usamos filteredList para exportar lo que se ve)
    const header = (
        <div className="d-flex align-items-center justify-content-end gap-2">

            {/* Botón Excel Modularizado */}
            <ExportExcelButton
                config={config}
                data={filteredList} // O data.list según corresponda
                disabled={loading || !filteredList?.length}
            />

            {/* Botón PDF Modularizado */}
            <ExportPDFButton
                config={config}
                data={filteredList}
                disabled={loading || !filteredList?.length}
            />
        </div>
    );

    // Función para renderizar el cuerpo de la celda, según el estilo definido en el bodyType del
    //  archivo de configuración del informe
    const bodyTemplate = (rowData, col) => {
        const value = rowData[col.field];

        // Si el campo tiene bodyType: 'badge',muestra el dato en forma de Badge
        if (col.bodyType === 'badge') {
            const severity = col.severity ? col.severity(value) : 'info';
            return <span className={`badge bg-${severity}`}>{value}</span>;
        }

        // Si el campo tiene bodyType: 'tag', muestra el dato tipo etiqueta o Tag
        if (col.bodyType === 'tag') {
            return <span className="px-2 py-1 rounded bg-light border fw-semibold text-uppercase" style={{ fontSize: '0.7rem' }}>
                {value}
            </span>;
        }

        return value;
    };

    return (
        <CCard className="shadow-sm border-2">
            <CCardHeader className="bg-white py-3 border-bottom-0">
                <InformHeader
                    title={config.title}
                    subtitle={config.subtitle}
                />
            </CCardHeader>

            <CCardBody className="pt-0">
                {/* MÉTRICAS (Usa StatsCardsOverview) */}
                <div className="mb-4">

                    <StatsCardsOverview
                        config={config}
                        summary={data?.summary}
                        loading={loading}
                        // Pasamos las props para manejar el click
                        onCardClick={handleCardClick}
                        activeFilter={activeFilter}
                    />
                </div>

                {/* TABLA (PrimeReact) */}
                <div className="table-container border rounded">
                    {/* Mensaje visual si hay un filtro activo */}
                    {activeFilter && (
                        <div className="bg-light p-2 border-bottom text-center text-muted small">
                            Filtro activo: <strong>{activeFilter.value}</strong>
                            <span
                                className="ms-2 text-primary cursor-pointer"
                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={() => setActiveFilter(null)}
                            >
                                (Quitar filtro)
                            </span>
                        </div>
                    )}

                    <DataTable
                        ref={dt} // Conectamos la referencia
                        header={header} // Botones en el header
                        value={filteredList || []} // Lista filtrada
                        loading={loading}
                        stripedRows
                        showGridlines
                        size="small"
                        rows={10}
                        paginator
                        emptyMessage="No se encontraron registros para el informe."
                    >
                        {config.columns.map((col) => (
                            <Column
                                key={col.field}
                                header={col.header}
                                alignHeader={col.alignHeader}
                                field={col.field}
                                align={col.align}
                                sortable={col.sortable}
                                body={(rowData) => bodyTemplate(rowData, col)}
                                style={{ minWidth: '150px' }}
                            />
                        ))}
                    </DataTable>
                </div>
            </CCardBody>
        </CCard>
    );
};

export default InformMain;
