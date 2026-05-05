//  frontend_AcademiA\src\components\tableActions\TableActions.jsx

import React, { useState } from 'react';
import { CButton, CCol, CRow, CSpinner } from '@coreui/react';
import { generateTablePDF } from './PDFService';

const TableActions = ({ table, title = "Administración de Usuarios" }) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAction = async (download = false) => {
    setIsGenerating(true);
    const blob = await generateTablePDF({ table, title, download });

    if (!download && blob) {
      const pdfUrl = URL.createObjectURL(blob);
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          
          // Limpieza automática tras imprimir
          setTimeout(() => URL.revokeObjectURL(pdfUrl), 1000);
        };
      }
    }
    setIsGenerating(false);
  };

  return (
    <CRow className="justify-content-end align-items-center my-1">
      <CCol xs="auto" className="d-flex align-items-center me-4">
        <div className="d-flex justify-content-end align-items-center gap-2">
          <CButton
            color="secondary"
            variant="outline"
            size="xs"
            disabled={isGenerating}
            onClick={() => handleAction(false)}
            style={{ fontSize: '0.75rem' }}
          >
            {isGenerating ? <CSpinner size="sm" /> : 'Imprimir'}
          </CButton>
          <CButton
            color="secondary"
            variant="outline"
            size="xs"
            disabled={isGenerating}
            onClick={() => handleAction(true)}
            style={{ fontSize: '0.75rem' }}
          >
            Exportar
          </CButton>
        </div>
      </CCol>
    </CRow>
  );
};

export default TableActions;