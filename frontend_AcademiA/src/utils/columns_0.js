//  frontend_AcademiA\src\utils\columns.js

//  Manejo de configuración de columnas de las tablas
//  Se utilizan funciones nombradas para centralizar en un solo archivo las funciones de tablas de otros componentes. 


import { CFormCheck } from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilPencil, cilTrash } from '@coreui/icons';
import { createColumnHelper } from '@tanstack/react-table'

// Función que maneja las columnas de la tabla usuarios
const getUsuariosColumns = (confirmDelete, handleClickEditar) => {

  const columnHelper = createColumnHelper()

  return [
    columnHelper.accessor('select', {
      header: ({ table }) => {
        return (
          <CFormCheck
            id='headCheck'  /* ID único */
            checked={table.getIsAllRowsSelected()} // getIsAllRowsSelected() devuelve true si todas  las filas de la tabla están      seleccionadas.
            onChange={table.getToggleAllRowsSelectedHandler()} // invierte la seleccio de todas las filas.

          />
        )
      },

      cell: ({ row }) => {
        return (
          <div style={{ display: 'flex', gap: '10px' }}>
            <CFormCheck
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()} // invierte la seleccio de todas las filas.
            />
          </div>
        )
      },
      enableSorting: false,
      filterFn: 'includesString',
    }
    ),


    columnHelper.accessor('name', {
      header: () => 'Nombre y Apellido',
      cell: info => info.getValue(),  // Cómo se muestra el valor en la celda
      enableSorting: true,
      filterFn: 'includesString',
    }
    ),

    columnHelper.accessor('email', {
      header: () => 'Mail',
      cell: info => info.getValue(),
      enableSorting: true,
      filterFn: 'includesString',
    }),

    columnHelper.accessor('domicilio', {
      header: () => 'Domicilio',
      cell: info => info.getValue(),
      enableSorting: true,
      filterFn: 'includesString',
    }),

    columnHelper.accessor('telefono', {
      header: () => 'Teléfono',
      cell: info => info.getValue(),
      enableSorting: true,
      filterFn: 'includesString',
    }),

    columnHelper.display({
      id: 'actions',
      header: () => {
        return (
          <div className="d-flex justify-content-center gap-3">
            <span>Acción</span>
          </div>
        )
      },
      cell: ({ row }) => {
        //console.log('Datos de la fila:', row.original);
        return (
          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              //href="#editEmployeeModal"
              className="text-muted hover:text-blue-700"
              data-toggle="modal"
              title="Editar"
              onClick={() => {
                console.log('Paso por acá');
                console.log('Id elemento a editar: ', row.original.id)
                handleClickEditar(row.original)
              }
              }
            >
              <CIcon
                icon={cilPencil}
                size="lg"
                className="fill-gray-500 "

              />
            </a>

            <a
              //href=""
              className="text-muted hover:text-danger"  /* Color base */
              data-toggle="modal"
              title="Borrar"

              onClick={() => {
                console.log('Paso por acá')
                console.log('Id elemento borrado: ', row.original.id)
                confirmDelete(row.original.id); // Llama a confirmDelete en lugar de handleDelete, porque abre la modal
              }  // row.original
              }
            >
              <CIcon
                icon={cilTrash}
                size="lg"
                className="text-gray-500"  /* Efecto hover */
              />
            </a>
          </div>)
      },
      enableSorting: false, // Se deshabilita el ordenamiento en esta columna ('actions').
      enableColumnFilter: false, // Se deshabilita el filtrado
    })

  ];
}

// Función que maneja las columnas de la tabla estudiantes
// Muestra: Nombre, Apellido, Fecha Nacimiento, Email, Domicilio, Teléfono
const getEstudiantesColumns = (confirmDelete, handleClickEditar) => {

  const columnHelper = createColumnHelper()

  return [
    columnHelper.accessor('select', {
      header: ({ table }) => {
        return (
          <CFormCheck
            id='headCheck'
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        )
      },
      cell: ({ row }) => {
        return (
          <div style={{ display: 'flex', gap: '10px' }}>
            <CFormCheck
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </div>
        )
      },
      enableSorting: false,
      filterFn: 'includesString',
    }),

    columnHelper.accessor('nombre', {
      header: () => 'Nombre',
      cell: info => info.getValue() || '-',
      enableSorting: true,
      filterFn: 'includesString',
    }),

    columnHelper.accessor('apellido', {
      header: () => 'Apellido',
      cell: info => info.getValue() || '-',
      enableSorting: true,
      filterFn: 'includesString',
    }),

    columnHelper.accessor('fec_nac', {
      header: () => 'Fecha Nac.',
      cell: info => {
        const dateValue = info.getValue();
        if (!dateValue) return '-';
        // Asumiendo formato YYYY-MM-DD que viene del backend
        const [year, month, day] = dateValue.split('-');
        return `${day}/${month}/${year}`;
      },
      enableSorting: true,
      filterFn: 'includesString',
    }),

    columnHelper.accessor('email', {
      header: () => 'Email',
      cell: info => info.getValue() || '-',
      enableSorting: true,
      filterFn: 'includesString',
    }),

    columnHelper.accessor('domicilio', {
      header: () => 'Domicilio',
      cell: info => info.getValue() || '-',
      enableSorting: true,
      filterFn: 'includesString',
    }),

    columnHelper.accessor('telefono', {
      header: () => 'Teléfono',
      cell: info => info.getValue() || '-',
      enableSorting: true,
      filterFn: 'includesString',
    }),

    columnHelper.display({
      id: 'actions',
      header: () => {
        return (
          <div className="d-flex justify-content-center gap-3">
            <span>Acción</span>
          </div>
        )
      },
      cell: ({ row }) => {
        return (
          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              className="text-muted hover:text-blue-700"
              data-toggle="modal"
              title="Editar"
              onClick={() => handleClickEditar(row.original)}
            >
              <CIcon icon={cilPencil} size="lg" className="fill-gray-500 " />
            </a>

            <a
              className="text-muted hover:text-danger"
              data-toggle="modal"
              title="Borrar"
              onClick={() => confirmDelete(row.original.id)}
            >
              <CIcon icon={cilTrash} size="lg" className="text-gray-500" />
            </a>
          </div>)
      },
      enableSorting: false,
      enableColumnFilter: false,
    })
  ];
}


// Función que maneja las columnas de la tabla DOCENTES
// Muestra: Nombre, Apellido, Fecha Nacimiento, Email, Domicilio, Teléfono
const getDocentesColumns = (confirmDelete, handleClickEditar) => {

  const columnHelper = createColumnHelper()

  return [
    columnHelper.accessor('select', {
      header: ({ table }) => {
        return (
          <CFormCheck
            id='headCheck'
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        )
      },
      cell: ({ row }) => {
        return (
          <div style={{ display: 'flex', gap: '10px' }}>
            <CFormCheck
              checked={row.getIsSelected()}
              disabled={!row.getCanSelect()}
              onChange={row.getToggleSelectedHandler()}
            />
          </div>
        )
      },
      enableSorting: false,
      filterFn: 'includesString',
    }),

    columnHelper.accessor('nombre', {
      header: () => 'Nombre',
      cell: info => info.getValue() || '-',
      enableSorting: true,
      filterFn: 'includesString',
    }),

    columnHelper.accessor('apellido', {
      header: () => 'Apellido',
      cell: info => info.getValue() || '-',
      enableSorting: true,
      filterFn: 'includesString',
    }),

    columnHelper.accessor('fec_nac', {
      header: () => 'Fecha Nac.',
      cell: info => {
        const dateValue = info.getValue();
        if (!dateValue) return '-';
        // Asumiendo formato YYYY-MM-DD que viene del backend
        const [year, month, day] = dateValue.split('-');
        return `${day}/${month}/${year}`;
      },
      enableSorting: true,
      filterFn: 'includesString',
    }),

    columnHelper.accessor('email', {
      header: () => 'Email',
      cell: info => info.getValue() || '-',
      enableSorting: true,
      filterFn: 'includesString',
    }),

    columnHelper.accessor('domicilio', {
      header: () => 'Domicilio',
      cell: info => info.getValue() || '-',
      enableSorting: true,
      filterFn: 'includesString',
    }),

    columnHelper.accessor('telefono', {
      header: () => 'Teléfono',
      cell: info => info.getValue() || '-',
      enableSorting: true,
      filterFn: 'includesString',
    }),

    columnHelper.display({
      id: 'actions',
      header: () => {
        return (
          <div className="d-flex justify-content-center gap-3">
            <span>Acción</span>
          </div>
        )
      },
      cell: ({ row }) => {
        return (
          <div style={{ display: 'flex', gap: '10px' }}>
            <a
              className="text-muted hover:text-blue-700"
              data-toggle="modal"
              title="Editar"
              onClick={() => handleClickEditar(row.original)}
            >
              <CIcon icon={cilPencil} size="lg" className="fill-gray-500 " />
            </a>

            <a
              className="text-muted hover:text-danger"
              data-toggle="modal"
              title="Borrar"
              onClick={() => confirmDelete(row.original.id)}
            >
              <CIcon icon={cilTrash} size="lg" className="text-gray-500" />
            </a>
          </div>)
      },
      enableSorting: false,
      enableColumnFilter: false,
    })
  ];
}


export { getUsuariosColumns, getEstudiantesColumns,getDocentesColumns };