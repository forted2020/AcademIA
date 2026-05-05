// frontend_AcademiA\src\components\informes\exportUtils.js

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';



/**
 * Genera un reporte en formato Excel (.xlsx) de forma dinámica
 * @param {Object} config - Objeto de configuración del informe
 * @param {Array} data - Lista de datos a exportar
 */
export const generateExcel = async (config, data) => {
    try {
        // Carga dinámica de librerías
        const XLSX = await import('xlsx');
        const { saveAs } = await import('file-saver');

        // Filtra solo las columnas marcadas como exportables
        const exportableFields = config.columns
            .filter(col => col.exportable !== false)
            .map(col => ({ field: col.field, header: col.header }));

        // Mapea los datos para que las cabeceras del Excel sean las de la config
        const formattedData = data.map(item => {
            const row = {};
            exportableFields.forEach(col => {
                row[col.header] = item[col.field];
            });
            return row;
        });

        // Creamos el libro y la hoja de trabajo
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Informe");

        // Generamos el buffer y descargar
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
        
        const fileName = `${config.title.replace(/\s+/g, '_')}_${new Date().getTime()}.xlsx`;
        saveAs(dataBlob, fileName);
    } catch (error) {
        console.error("Error al generar Excel:", error);
    }
};

/**
 * Generador reporte en formato PDF con diseño institucional
 */
export const generatePDF = async (config, data) => {
    try {
        const jsPDF = (await import('jspdf')).default;
        const autoTable = (await import('jspdf-autotable')).default;

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

        // Título del Reporte
        doc.setFontSize(14);
        doc.setTextColor(...colorPrimario);
        doc.text(config.title.toUpperCase(), margin, 100);

        // Configuración de columnas para AutoTable
        const exportColumns = config.columns
            .filter(col => col.exportable !== false)
            .map(col => ({ title: col.header, dataKey: col.field }));

        doc.autoTable({
            columns: exportColumns,
            body: data,
            startY: 120,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 5 },
            headStyles: { fillColor: colorPrimario, textColor: 255 },
            alternateRowStyles: { fillColor: [245, 247, 251] },
            margin: { left: margin, right: margin }
        });

        doc.save(`${config.title.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
        console.error("Error al generar PDF:", error);
    }
};