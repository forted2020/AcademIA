//  frontend_AcademiA\src\components\tableActions\PDFService.js

//  Contiene la lógica pesada de procesamiento de archivos.


import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

export const generateTablePDF = async ({ table, title, format = 'compact', download = false }) => {
  if (!table || !table.getFilteredRowModel) {
    console.error('Estructura de tabla inválida');
    return null;
  }

  try {
    const doc = <GenericTablePDF table={table} title={title} format={format} />;
    const asPdf = pdf([]);
    asPdf.updateContainer(doc);
    const blob = await asPdf.toBlob();

    if (download) {
      saveAs(blob, `${title.replace(/\s+/g, '_')}.pdf`);
    }
    return blob;
  } catch (error) {
    console.error('Error en la generación del PDF:', error);
    return null;
  }
};
