//  frontend_AcademiA\src\components\tableActions\GenereicTablePDF.jsx

// Componneten "Template" de la tabla. Se encarga del diseño. Recibe el title por props.

import React from 'react';
import { Document, Page, Text, View } from '@react-pdf/renderer';
import { flexRender } from '@tanstack/react-table';
import { compactStyles, detailedStyles } from '../../../views/dashboard/pdfFormats/pdfStyles';

const GenericTablePDF = ({ table, title, format = 'compact' }) => {
  const filteredRows = table.getFilteredRowModel?.().rows || [];
  const styles = format === 'compact' ? compactStyles : detailedStyles;

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.table}>
          {/* Encabezados */}
          <View style={styles.tableRow}>
            {table.getHeaderGroups()?.[0]?.headers
              ?.filter(header => header.id !== 'actions')
              .map(header => (
                <Text key={header.id} style={styles.tableHeader}>
                  {flexRender(header.column.columnDef.header, header.getContext()) || 'N/A'}
                </Text>
              ))}
          </View>
          {/* Filas de datos */}
          {filteredRows.map(row => (
            <View key={row.id} style={styles.tableRow}>
              {row.getVisibleCells()
                ?.filter(cell => cell.column.id !== 'actions')
                .map(cell => (
                  <Text key={cell.id} style={styles.tableCell}>
                    {cell.getValue() ?? 'N/A'}
                  </Text>
                ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default GenericTablePDF;