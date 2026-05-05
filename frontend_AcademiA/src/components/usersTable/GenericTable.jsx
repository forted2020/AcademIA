import React from 'react';
import { CTable, CTableHead, CTableBody, CTableRow, CTableHeaderCell, CTableDataCell } from '@coreui/react';
import { flexRender } from '@tanstack/react-table';
import CIcon from '@coreui/icons-react';
import { cilArrowTop, cilArrowBottom, cilSwapVertical } from '@coreui/icons';

const GenericTable = ({ table }) => {

  // ========================================
  // Si table NO está lista → mostramos carga o nada
  // ========================================
  if (!table) {
    return (
      <div className="text-center py-5 text-muted">
        Cargando tabla...
      </div>
    );
  }

  // ========================================
  // Si table SÍ está lista → renderizamos la tabla completa
  // ========================================
  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <CTable id="mainTable" hover className="shadow-sm mb-0 border border-light">
        <CTableHead className="bg-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
          {table.getHeaderGroups().map(headerGroup => (
            <CTableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <CTableHeaderCell
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler?.()} // optional chaining por seguridad
                  style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                  className="bg-light"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}

                  {/* Iconos de ordenamiento */}
                  {header.column.getCanSort() && (
                    {
                      asc: <CIcon icon={cilArrowTop} size="sm" className="ms-2" />,
                      desc: <CIcon icon={cilArrowBottom} size="sm" className="ms-2" />,
                    }[header.column.getIsSorted()] || (
                      <CIcon icon={cilSwapVertical} className="text-body-secondary ms-2" />
                    )
                  )}
                </CTableHeaderCell>
              ))}
            </CTableRow>
          ))}
        </CTableHead>

        <CTableBody className="h-100">
          {table.getRowModel().rows.length === 0 ? (
            <CTableRow>
              <CTableDataCell colSpan={table.getHeaderGroups()[0]?.headers.length || 1} className="text-center py-4 text-muted">
                No hay datos disponibles
              </CTableDataCell>
            </CTableRow>
          ) : (
            table.getRowModel().rows.map(row => (
              <CTableRow
                key={row.id} >
                {row.getVisibleCells().map(cell => (
                  
                  <CTableDataCell 
                  key={cell.id} 
                  className={`small text-xs ${cell.column.columnDef.meta?.className || ''}`} 
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </CTableDataCell>
                ))}
              </CTableRow>
            ))
          )}
        </CTableBody>
      </CTable>
    </div>
  );
};

export default GenericTable;