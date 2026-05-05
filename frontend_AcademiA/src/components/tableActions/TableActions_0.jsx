//  frontend_AcademiA\src\components\tableActions\TableActions.jsx

import { CButton, CCol, CRow } from '@coreui/react';
import { Document, Page, Text, View, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { compactStyles, detailedStyles } from '../../../src/views/dashboard/pdfFormats/pdfStyles';
import { flexRender } from '@tanstack/react-table';

{/* ---------- Estructura del pdf. Ddefine qué información aparecerá y cómo se verá ---------- */}
const MyDocument = ({ table, format = 'compact' }) => {
  console.log('MyDocument - table:', table); // Depuración
  const filteredRows = table.getFilteredRowModel?.().rows || [];
  console.log('filteredRows:', filteredRows); // Depuración
  const styles = format === 'compact' ? compactStyles : detailedStyles;

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>Administración de Usuarios</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            {table.getHeaderGroups()?.[0]?.headers
              ?.filter(header => header.id !== 'actions')
              .map(header => (
                <Text key={header.id} style={styles.tableHeader}>
                  {flexRender(header.column.columnDef.header, header.getContext()) || 'N/A'}
                </Text>
              )) || <Text>No hay encabezados disponibles</Text>}
          </View>
          {filteredRows.length > 0 ? (
            filteredRows.map(row => (
              <View key={row.id} style={styles.tableRow}>
                {row
                  .getVisibleCells()
                  ?.filter(cell => cell.column.id !== 'actions')
                  .map(cell => (
                    <Text key={cell.id} style={styles.tableCell}>
                      {cell.getValue() ?? 'N/A'}
                    </Text>
                  )) || <Text>No hay celdas disponibles</Text>}
              </View>
            ))
          ) : (
            <Text>No hay datos para mostrar</Text>
          )}
        </View>
      </Page>
    </Document>
  );
};


{/* ---------- Lógica de conversión a .pdf ---------- */}
const generatePDF = async (table, format = 'compact', download = false) => {
  console.log('generatePDF - table:', table); // Depuración
  if (!table || !table.getFilteredRowModel) {
    console.error('Table or getFilteredRowModel is undefined');
    return null;
  }
  try {
    const doc = <MyDocument table={table} format={format} />;
    const asPdf = pdf([]);
    asPdf.updateContainer(doc);
    const blob = await asPdf.toBlob();
    if (download) {
      saveAs(blob, 'tabla_filtrada.pdf');
    }
    return blob;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return null;
  }
};


{/* ---------- Interfaz de usuario. Lo que se ve en pantalla ---------- */}
const TableActions = ({ table }) => {
  const handleExportClick = () => {
    generatePDF(table, 'compact', true);
  };

  const handlePrintButton = async () => {
    const blob = await generatePDF(table, 'compact', false);
    if (!blob) {
      console.error('Failed to generate PDF blob');
      return;
    }
    const pdfUrl = URL.createObjectURL(blob);
    const printWindow = window.open(pdfUrl, '_blank', 'height=600,width=800');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    }
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
  };

  return (
    <CRow className="justify-content-end align-items-center my-1">
      <CCol xs="auto" className="d-flex align-items-center me-4">
        <div className="d-flex justify-content-end align-items-center gap-2" id="botones">
          <CButton
            type="button"
            color="secondary"
            className="shadow-sm px-1 py-1 me-0"
            variant="outline"
            size="xs"
            style={{ fontSize: '0.75rem' }}
            onClick={handlePrintButton}
          >
            Imprimir
          </CButton>
          <CButton
            type="button"
            color="secondary"
            className="shadow-sm px-1 py-1"
            variant="outline"
            size="xs"
            style={{ fontSize: '0.75rem' }}
            onClick={handleExportClick}
          >
            Exportar
          </CButton>
        </div>
      </CCol>
    </CRow>
  );
};

export default TableActions;