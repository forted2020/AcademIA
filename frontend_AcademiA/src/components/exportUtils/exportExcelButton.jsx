// frontend_AcademiA\src\components\exportUtils\exportExcelButton.jsx

import React, { useState } from 'react';
import { Button } from 'primereact/button';

export const ExportExcelButton = ({ config, data, disabled }) => {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            // Importación dinámica: Solo carga la librería si se hace clic
            const XLSX = await import('xlsx');
            const { saveAs } = await import('file-saver');

            // Preparar Columnas
            const exportableFields = config.columns
                .filter(col => col.exportable !== false)
                .map(col => ({ field: col.field, header: col.header }));

            // Formatear Datos
            const formattedData = data.map(item => {
                const row = {};
                exportableFields.forEach(col => {
                    row[col.header] = item[col.field];
                });
                return row;
            });

            // Crear Hoja
            const worksheet = XLSX.utils.json_to_sheet(formattedData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Informe");

            // Descargar
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
            
            const fileName = `${config.title.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`;
            saveAs(dataBlob, fileName);

        } catch (error) {
            console.error("Error exportando Excel:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button 
            type="button" 
            icon="pi pi-file-excel" 
            severity="success" 
            rounded 
            tooltip="Exportar Excel"
            tooltipOptions={{ position: 'bottom' }}
            size="small"
            onClick={handleExport}
            loading={loading}
            disabled={disabled || loading}
        />
    );
};
