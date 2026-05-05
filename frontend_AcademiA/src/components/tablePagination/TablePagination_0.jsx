import { CButton, CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CContainer, CPagination, CPaginationItem, CAccordion, CAccordionBody, CAccordionHeader, CAccordionItem, } from '@coreui/react'

const TablePagination = ({ table }) => {

    // ========================================
    // PROTECCIÓN: Si table no está lista, no renderizamos nada o mostramos placeholder
    // ========================================
    if (!table) {
        return (
            <div className="text-center py-2 text-muted small">
                Cargando paginación...
            </div>
        );
    }

    return (

        <div className="bg-white border-top px-3 py-1"
            style={{
                position: 'sticky',          // Usamos 'sticky' para que se mantenga en el fondo del contenedor padre
                bottom: 0,                  // Se fija en la parte inferior
                zIndex: 1,                  // Asegura que esté sobre el contenido desplazable
                //width: '100%',              // Garantiza que ocupe todo el ancho del contenedor
                boxShadow: '0 -2px 5px rgba(0,0,0,0.1)' // Sombra sutil para diferenciarlo
            }}
        >

            <CRow className="justify-content-between text-muted  ">

                {/* ---------------------  Controles de paginación ------------------------- */}
                <CCol xs={12} md={4} className="mb-12 mb-md-0" >

                    <CPagination align="start" size="sm" aria-label="Page navigation">
                        <CPaginationItem
                            aria-label="Next"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <span aria-hidden="true">&laquo;</span>
                        </CPaginationItem>
                        {/* items nros de página del paginado */}
                        {Array.from({ length: table.getPageCount() }, (_, i) => (   //table.getPageCount() = nº total filas / pageSize
                            <CPaginationItem
                                key={i}
                                active={i === table.getState().pagination.pageIndex} // Muestra la página actual
                                onClick={() => table.setPageIndex(i)}     // Cambia a una página específica
                            >
                                {i + 1}       {/* Suma 1 porque el array comienza de 0*/}
                            </CPaginationItem>
                        ))}
                        <CPaginationItem
                            aria-label="Previous"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <span aria-hidden="true">&raquo;</span>
                        </CPaginationItem>

                    </CPagination>

                </CCol>

                <CCol xs='auto' className=" ">
                    <span >
                        Total de registros: <b>{table.getFilteredRowModel().rows.length}</b>
                    </span>
                </CCol>


                {/* Info de página y selector */}
                <CCol xs='auto' className=" ">
                    Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()} {/* Suma 1 porque el array comienza de 0*/}

                    <select
                        className=" border "
                        value={table.getState().pagination.pageSize}
                        onChange={e => table.setPageSize(Number(e.target.value))}
                    //style={{ marginLeft: '10px' }}
                    >
                        {[2, 5, 10, 20].map(pageSize => (
                            <option key={pageSize} value={pageSize}>
                                Mostrar {pageSize}
                            </option>
                        ))}
                    </select>
                </CCol>

            </CRow>
        </div>
    )
};


export default TablePagination;