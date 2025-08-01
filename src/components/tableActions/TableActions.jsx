import { CButton, CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CContainer, CPagination, CPaginationItem, CAccordion, CAccordionBody, CAccordionHeader, CAccordionItem, } from '@coreui/react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver'; // Para descargar el archivo
import { compactStyles, detailedStyles } from '../../views/dashboard/pdfFormats/pdfStyles';
import {createColumnHelper, flexRender, getCoreRowModel, useReactTable,getPaginationRowModel, getSortedRowModel, getFilteredRowModel,
} from '@tanstack/react-table'


// Componente del documento PDF
const MyDocument = ({ table, format = 'compact' }) => {
  const filteredRows = table.getFilteredRowModel().rows;
  const styles = format === 'compact' ? compactStyles : detailedStyles; // Selecciona estilos según formato

  return (
    <Document>    {/* Componente de React-PDF (MyDocument) que genera un PDF a partir de los datos filtrados de la tabla*/}
      <Page style={styles.page}>
        <Text style={styles.title}>Administración de Usuarios</Text>
        <View style={styles.table}>

          <View style={styles.tableRow}>
            {table.getHeaderGroups()[0].headers
              .filter(header => header.id !== 'actions')    // Excluimos la columna 'action
              .map(header => (
                <Text key={header.id} style={styles.tableHeader}>
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </Text>
              ))}
          </View>

          {filteredRows.map(row => (
            <View key={row.id} style={styles.tableRow}>
              {row
                .getVisibleCells()
                .filter(cell => cell.column.id !== 'actions')    // Excluimos la columna 'action
                .map(cell => (
                  <Text key={cell.id} style={styles.tableCell}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Text>
                ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};


// Función para generar y descargar el PDF. Devuelve el blob
const generatePDF = async (table, format = 'compact', download = false) => {
  const doc = <MyDocument table={table} />;
  const asPdf = pdf([]); // Crear instancia de PDF
  asPdf.updateContainer(doc); // Añadir el documento
  const blob = await asPdf.toBlob(); // Generar el PDF como Blob

  // Si download es true, descarga el archivo
  if (download) {
    saveAs(blob, 'tabla_filtrada.pdf'); // Descargar el archivo
  }

  return blob; // Siempre devuelve el Blob
}

// Componente TableActions
const TableActions = ({ table }) => {

  const handleExportClick = () => {
    generatePDF(table, 'compact', true);
  }


  const handlePrintButton = async () => {
    // Usa generatePDF para obtener el Blob, sin descargar
    const blob = await generatePDF(table, 'compact', false); // false para no descargar
    const pdfUrl = URL.createObjectURL(blob); // Crea una URL temporal

    // Abre la URL en una nueva ventana (window.print imprime una ventana)
    const printWindow = window.open(pdfUrl, '_blank', 'height=600,width=800');

    // Espera a que cargue y dispare la impresión
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      // Opcional: printWindow.close(); // Cierra después de imprimir

    };
    // Limpia la URL después de un tiempo
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
            className="shadow-sm px-1 p1-0"
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

