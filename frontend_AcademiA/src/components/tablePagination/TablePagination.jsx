//  frontend_AcademiA\src\components\tablePagination\TablePagination.jsx

import { CRow, CCol, CPagination, CPaginationItem, CFormSelect } from '@coreui/react'

const TablePagination = ({ table }) => {
    if (!table) return null;

    const { pageIndex, pageSize } = table.getState().pagination;
    const totalRows = table.getFilteredRowModel().rows.length;

    return (
        <div className="bg-white border-top px-3 py-2 sticky-bottom shadow-sm">
            <CRow className="align-items-center justify-content-between g-2">
                
                {/* Paginación Principal */}
                <CCol xs={12} lg="auto">
                    <CPagination size="sm" className="mb-0">
                        <CPaginationItem 
                            onClick={() => table.previousPage()} 
                            disabled={!table.getCanPreviousPage()}
                        >
                            &laquo;
                        </CPaginationItem>
                        
                        {/* Lógica de páginas simplificada (Ejemplo para pocas páginas) */}
                        {[...Array(table.getPageCount())].map((_, i) => (
                            <CPaginationItem
                                key={i}
                                active={i === pageIndex}
                                onClick={() => table.setPageIndex(i)}
                            >
                                {i + 1}
                            </CPaginationItem>
                        ))}

                        <CPaginationItem 
                            onClick={() => table.nextPage()} 
                            disabled={!table.getCanNextPage()}
                        >
                            &raquo;
                        </CPaginationItem>
                    </CPagination>
                </CCol>

                {/* Información y Selector */}
                <CCol xs="auto" className="d-flex align-items-center gap-3 text-muted small">
                    <span>Total registros: <strong>{totalRows}</strong></span>
                    
                    <div className="d-flex align-items-center gap-2">
                        <span>Mostrar:</span>
                        <CFormSelect 
                            size="sm"
                            value={pageSize}
                            onChange={e => table.setPageSize(Number(e.target.value))}
                            style={{ width: 'auto' }}
                        >
                            {[5, 10, 20, 50].map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </CFormSelect>
                    </div>
                </CCol>
            </CRow>
        </div>
    )
};

export default TablePagination;