// frontend_AcademiA\src\components\exportUtils\exportPDFButton.jsx

import React, { useState } from 'react';
import { Button } from 'primereact/button';

export const ExportPDFButton = ({ config, data, disabled }) => {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            // Importación dinámica
            const jsPDF = (await import('jspdf')).default;
            const autoTable = (await import('jspdf-autotable')).default;

            // Configuración del Documento
            const doc = new jsPDF('p', 'pt', 'a4');
            const colorPrimario = [50, 31, 219];
            const margin = 40;

            // Encabezado Institucional
            doc.setFontSize(18);
            doc.setTextColor(40);
            doc.text("INSTITUCIÓN EDUCATIVA ACADEMIA", margin, 50);
            
            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, margin, 65);

            doc.setDrawColor(...colorPrimario);
            doc.setLineWidth(2);
            doc.line(margin, 75, 555, 75);

            doc.setFontSize(14);
            doc.setTextColor(...colorPrimario);
            doc.text(config.title.toUpperCase(), margin, 100);

            // Preparar Datos para AutoTable
            const exportColumns = config.columns
                .filter(col => col.exportable !== false)
                .map(col => ({ title: col.header, dataKey: col.field }));

            // Generar Tabla
            autoTable(doc, {
                columns: exportColumns,
                body: data,
                startY: 120,
                theme: 'grid',
                styles: { fontSize: 9, cellPadding: 5 },
                headStyles: { fillColor: colorPrimario, textColor: 255 },
                alternateRowStyles: { fillColor: [245, 247, 251] },
                margin: { left: margin, right: margin }
            });

            // Guardar
            doc.save(`${config.title.replace(/\s+/g, '_')}.pdf`);

        } catch (error) {
            console.error("Error exportando PDF:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button 
            type="button" 
            icon="pi pi-file-pdf" 
            severity="danger" 
            rounded 
            tooltip="Exportar PDF"
            tooltipOptions={{ position: 'bottom' }}
            size="small"
            onClick={handleExport}
            loading={loading}
            disabled={disabled || loading}
        />
    );
};