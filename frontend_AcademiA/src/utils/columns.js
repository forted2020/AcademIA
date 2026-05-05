//  frontend_AcademiA\src\utils\columns.js

//  Manejo de configuración de columnas de las tablas
//  Se utilizan funciones nombradas para centralizar en un solo archivo las funciones de tablas de otros componentes. 


import { CFormCheck } from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilPencil, cilTrash } from '@coreui/icons';
import { createColumnHelper } from '@tanstack/react-table'

// Creamos una única instancia del columnHelper para reutilizarla
const columnHelper = createColumnHelper();


// Función que maneja las columnas de la tabla usuarios
//  const getUsuariosColumns = (confirmDelete, handleClickEditar) => {


/**
 * Columna de selección (checkbox para seleccionar filas)
 * Es común a todas las tablas, por eso se define una sola vez
 */
const selectionColumn = columnHelper.accessor('select', {
  id: 'select', // Es importante dar un id estable
  header: ({ table }) => (
    <CFormCheck
      id="headCheck"
      checked={table.getIsAllRowsSelected()}
      onChange={table.getToggleAllRowsSelectedHandler()}
    />
  ),
  cell: ({ row }) => (
    <div style={{ display: 'flex', gap: '10px' }}>
      <CFormCheck
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onChange={row.getToggleSelectedHandler()}
      />
    </div>
  ),
  enableSorting: false,
  enableColumnFilter: false,
});

/**
 * Columna de acciones (editar y borrar)
 * Común a todas las tablas.
 * Recibe las funciones de callback que vienen del componente padre
 */
const actionsColumn = (confirmDelete, handleClickEditar) =>
  columnHelper.display({
    id: 'actions',
    header: () => (
      <div className="d-flex justify-content-center">
        <span>Acción</span>
      </div>
    ),
    cell: ({ row }) => (
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        {/* Botón Editar */}
        <a
          className="text-muted hover:text-blue-700 cursor-pointer"
          title="Editar"
          onClick={() => handleClickEditar(row.original)}
        >
          <CIcon icon={cilPencil} size="lg" className="text-gray-600" />
        </a>

        {/* Botón Borrar */}
        <a
          className="text-muted hover:text-danger cursor-pointer"
          title="Borrar"
          onClick={() => confirmDelete(row.original)} // Pasamos el objeto completo
        >
          <CIcon icon={cilTrash} size="lg" className="text-gray-600" />
        </a>
      </div>
    ),
    enableSorting: false,
    enableColumnFilter: false,
  });



/**
 * FUNCIÓN PRINCIPAL REUTILIZABLE
 * Recibe:
 *   - columnsConfig: array de objetos que definen las columnas de datos
 *   - confirmDelete: función para confirmar borrado
 *   - handleClickEditar: función para abrir edición
 *
 * Ejemplo de columnsConfig:
 * [
 *   { accessorKey: 'nombre', header: 'Nombre' },
 *   { accessorKey: 'apellido', header: 'Apellido' },
 *   { accessorKey: 'email', header: 'Email', cell: (info) => info.getValue() || '-' },
 *   ...
 * ]
 */
export const getTableColumns = (
  columnsConfig,
  confirmDelete,
  handleClickEditar,
  { showSelection = true, showActions = true } = {}
) => {
  // Convertimos la configuración simple en columnas reales con columnHelper
  const dataColumns = columnsConfig.map((col) =>
    columnHelper.accessor(col.accessorKey, {
      header: col.header || col.accessorKey.charAt(0).toUpperCase() + col.accessorKey.slice(1),
      cell: col.cell || ((info) => info.getValue() || '-'), // Por defecto muestra el valor o '-'
      enableSorting: col.enableSorting !== false, // true por defecto
      filterFn: 'includesString',
      ...col.extraProps, // Permite pasar propiedades adicionales si es necesario
    })
  );

  // Construimos el array final de columnas
  const columns = [];

  // Columna de selección (solo si showSelection es true)
  if (showSelection) {
    columns.push(selectionColumn);
  }

  // Columnas de datos
  columns.push(...dataColumns);

  // Columna de acciones (solo si showActions es true)
  if (showActions) {
    columns.push(actionsColumn(confirmDelete, handleClickEditar));
  }

  return columns;
};

/*




  // Armamos el array final: selección + columnas de datos + acciones
  return [
    
    
    
    
    selectionColumn,     // Siempre primera: checkbox de selección
    ...dataColumns,      // Las columnas específicas que nos pasan
    actionsColumn(confirmDelete, handleClickEditar), // Siempre última: acciones
  ];
};
*/