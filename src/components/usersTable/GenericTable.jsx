//  Este componente independiente renderiza una tabla genérica basada en los datos de @tanstack/react-table. 
//  Es potencialmente reutilizable para otras entidades.
//  

import { CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilArrowTop, cilArrowBottom, cilSwapVertical } from '@coreui/icons';
import { flexRender } from '@tanstack/react-table';

const GenericTable = ({ table }) => {
    return (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <CTable id='mainTable' hover className="shadow-sm mb-0 border border-light" >
                <CTableHead className="bg-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                    {table.getHeaderGroups().map(headerGroup => (           //Devuelve array de grupos de encabezados (1 en este caso)
                        <CTableRow key={headerGroup.id}>
                            {headerGroup.headers.map(column => (       // Recorre las columnas y devuelve un array de los headers
                                <CTableHeaderCell
                                    key={column.id}
                                    onClick={column.column.getToggleSortingHandler()} // encabezado clicable para ordenar
                                    style={{ cursor: column.column.getCanSort() ? 'pointer' : 'default' }} // Cursor pointer si es ordenable
                                    className='bg-light '
                                >
                                    {flexRender(column.column.columnDef.header, column.getContext())} {/*Renderiza los header con flexRender*/}
                                    {column.column.getCanSort() ? {        // Si la columna no es ordenable, no muestra icono
                                        asc: <CIcon icon={cilArrowTop} size="sm" />,
                                        desc: <CIcon icon={cilArrowBottom} size="sm" />,
                                    }[column.column.getIsSorted()] || <CIcon icon={cilSwapVertical} className="text-body-secondary" />
                                        : null
                                    }

                                </CTableHeaderCell>
                            ))}
                        </CTableRow>
                    ))}
                </CTableHead>

                <CTableBody className="h-100">
                    {table.getRowModel().rows.map(row => (    // Devuelve las filas visibles según la paginación actual ("pageSize").
                        // rows.map(...) recorre cada fila, y row.getVisibleCells() da las celdas de esa  fila.
                        <CTableRow key={row.id}>
                            {row.getVisibleCells().map(cell => (
                                <CTableDataCell key={cell.id} className="small text-xs" >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())} {/* Renderiza el contenido de cada celda (mediante    flexrender) */}
                                </CTableDataCell>
                            ))}
                        </CTableRow>
                    ))}
                </CTableBody>
            </CTable>
        </div>
    )
}

export default GenericTable;
