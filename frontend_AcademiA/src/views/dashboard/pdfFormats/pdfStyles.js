import { StyleSheet } from '@react-pdf/renderer';

// Formato compacto
export const compactStyles = StyleSheet.create({
  page: { padding: 10 },
  title: { fontSize: 14, marginBottom: 5 },
  table: { display: 'table', width: 'auto', borderStyle: 'solid', borderWidth: 1 },
  tableRow: { flexDirection: 'row' },
  tableHeader: { width: '25%', borderStyle: 'solid', borderWidth: 1, padding: 3, fontSize: 10, backgroundColor: '#f0f0f0' },
  tableCell: { width: '25%', borderStyle: 'solid', borderWidth: 1, padding: 3, fontSize: 10 },
});

// Formato detallado
export const detailedStyles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 18, marginBottom: 15 },
  table: { display: 'table', width: 'auto', borderStyle: 'solid', borderWidth: 2 },
  tableRow: { flexDirection: 'row' },
  tableHeader: { width: '25%', borderStyle: 'solid', borderWidth: 2, padding: 10, fontSize: 14, backgroundColor: '#e0e0e0' },
  tableCell: { width: '25%', borderStyle: 'solid', borderWidth: 2, padding: 10, fontSize: 12 },
});




