import React,  { useState, useEffect }  from 'react'
import classNames from 'classnames'

import { CButton, CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CFormSelect, CFormInput, CFormCheck, CInputGroup,  CInputGroupText, CContainer, CModalFooter, CPagination, CPaginationItem, CTableFoot, CAccordion, CAccordionBody, CAccordionHeader, CAccordionItem,} from '@coreui/react'

import { cilTrash, cilPencil, cilArrowTop, cilArrowBottom, cilSwapVertical, cilPlus, cilSearch} from '@coreui/icons'

import { CIcon } from '@coreui/icons-react';

import FormAltaUsuario from '../../components/FormAltaUsuario.jsx'; // Importa el componente TextInput FormAltaUsuario.js
import { CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react'

import { CSVLink } from "react-csv";

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { saveAs } from 'file-saver'; // Para descargar el archivo
import { PDFViewer } from '@react-pdf/renderer';

import ReactDOM from 'react-dom';

import { compactStyles,detailedStyles } from '../dashboard/pdfFormats/pdfStyles';

import '../../css/PersonalStyles.css'  


import {  createColumnHelper, flexRender, getCoreRowModel, useReactTable, 
getPaginationRowModel, getSortedRowModel, getFilteredRowModel,} from '@tanstack/react-table'

import { getUsers, createUser, updateUser, deleteUser } from '../../../src/api/api'; // Importamos las funciones de la API




const columnHelper = createColumnHelper();

const columns = [
  
  columnHelper.accessor('select', {     
    header: ({table}) => {
      return(
        <CFormCheck 
          id= 'headCheck'  /* ID único */
          checked={table.getIsAllRowsSelected()} // getIsAllRowsSelected() devuelve true si todas  las filas de la tabla están seleccionadas.
          onChange={table.getToggleAllRowsSelectedHandler()} // invierte la seleccio de todas las filas.
        
        />
        )
    },

    cell: ({ row }) => {
      return(
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
          href="#editEmployeeModal"
          className="text-muted hover:fill-blue-700"
          data-toggle="modal"
          title="Editar"
        >
          <CIcon 
            icon={cilPencil} 
            size="lg" 
            className="fill-gray-500 " // Azul fuerte como acordamos
            onClick={() => handleClickEditar(row.original)}
          />
        </a>
                  
        <a
          href="#deleteEmployeeModal"
          className="text-muted hover:text-danger"  /* Color base */
          data-toggle="modal"
          title="Borrar"
        >
          <CIcon 
            icon={cilTrash} 
            size="lg" 
            className=""  /* Efecto hover */
            onClick={() => handleDelete(row.original)}
          />
        </a>
      </div>)
    },
    enableSorting: false, // Se deshabilita el ordenamiento en esta columna ('actions').
    enableColumnFilter: false, // Se deshabilita el filtrado
  })
];


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


 
const Dashboard = () => {
  const [tableData, setTableData] = useState([])

  const [searchTerm, setSearchTerm] = useState(''); // Búsqueda dinámica. Estado para el término de búsqueda global
  const [visibleXL, setVisibleXL] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  

  const [filterColumn1, setFilterColumn1] = useState('name'); // Columna predeterminada para el primer filtro
  const [filterValue1, setFilterValue1] = useState(''); // Valor del primer filtro
  const [filterColumn2, setFilterColumn2] = useState('domicilio'); // Columna predeterminada para el segundo filtro
  const [filterValue2, setFilterValue2] = useState(''); // Valor del segundo filtro
  const [columnFilters, setColumnFilters] = useState([]); // Estado de filtros para TanStack

  // Estados para API usuarios de sistema
 const [systemUsers, setSystemUsers] = useState([]);
 const [systemName, setSystemName] = useState('');
 const [systemPassword, setSystemPassword] = useState('');
 const [systemEditId, setSystemEditId] = useState(null);

   
 /*
 //Leemos los datos de data/datos.json
  useEffect(() => {
    // Realizar la solicitud fetch
    fetch('../../../data/datos.json')
      .then(response => response.json())  // Convertimos la respuesta a formato JSON
      .then(data => {
        setTableData(data);  // Actualizamos el estado con los datos cargados
        })
      .catch(error => {
        console.error('Error al cargar los datos:', error);
        });
      
  }, []);  // El array vacío significa que esto solo se ejecuta al montar el componente
  */
 

  /*
  // Cargar usuarios de sistema desde la API
  useEffect(() => {
    getUsers()
      .then(response => {
        console.log('Respuesta de la API:', response.data);
        setSystemUsers(Array.isArray(response.data) ? response.data : [])
      })
      .catch(error => {
        console.error('Error al obtener usuarios de sistema:', error.message);
        console.error('Detalles del error:', error.response ? error.response.data : error);
        setSystemUsers([]);
      });
  }, []);

  */

  //  Obtener datos de la base
  const fetchUsers = async () => {          //  Define una función asíncrona fetchUsers que obtiene la lista de usuarios desde la API.
    try {                                   //  try / catch: Maneja errores en caso de que la solicitud falle.
      const { data } = await getUsers();  // Llama a getUsers y ddsestructura la respuesta para obtener solo el data (lista de usuarios).
      setTableData(data);                     //  Actualiza el estado users con los datos obtenidos
      //setTableData(prevData => [...prevData, ...data])
    } catch (error) {
      console.error('Error fetching users:', error);  //Si hay un error, lo muestra en la consola sin interrumpir la ejecución.
    }
  };

  useEffect(() => { fetchUsers(); }, []);   //   Ejecuta la función fetchUsers cuando el componente se monta por primera vez. 
                                            //   O sea, carga la lista inicial de usuarios al cargar la página.




//setTableData(data);   setUsers(data);

  
  
  /*  ---------------------  Paginación  -----------------------  */
  // Estado de paginación
  // "pagination" le dice a TanStack Table cómo dividirla en páginas.
  const [pagination, setPagination] = useState({
    pageIndex: 0, // Página inicial (comienza en la página 0, que es al primera)
    pageSize: 10,  // Número de filas por página (muestra 2 filas por página)
  });

  /*  ---------------------  Ordenamiento  -----------------------  */
  //  Estado para el ordenamiento
  const [sorting, setSorting] = useState([]); // "sorting" es un array de objetos como id de la columna y dirección. Se inicializa vacío.


 

  /*  ---------------------  Filtro -----------------------  */
  // Función para aplicar filtros al hacer clic en "Buscar"
  const applyFilters = () => {
    const filters = [];
    if (filterValue1) {
      filters.push({ id: filterColumn1, value: filterValue1 });
    }
    if (filterValue2) {
      filters.push({ id: filterColumn2, value: filterValue2 });
    }
    setColumnFilters(filters); // Actualiza los filtros en TanStack
  };



  /*  ---------------------  Configuración de la tabla  -----------------------  */
  // Instancia de la tabla (useReactTable) es el "cerebro" de TanStack Table. 
  // La variable "table" (creada con useReactTable) contiene toda la lógica y los métodos para manejar la tabla, 
  // como paginación, filas, y renderizado.
  const table = useReactTable({
    data: tableData,              // Datos de la tabla, obtenidos de datos.json 
    columns,                      // Columnas definidas anteriormente
    
    getCoreRowModel: getCoreRowModel(),   // función de TanStack. Genera el modelo básico de filas
    getPaginationRowModel: getPaginationRowModel(), // Activa la paginación, divide filas en páginas según pageSize y pageIndex.
    onPaginationChange: setPagination, // Actualiza el estado de paginación al cambiar de página    
    
    getSortedRowModel: getSortedRowModel(), // Activar ordenamiento
    onSortingChange: setSorting, // Actualizar estado de ordenamiento

    getFilteredRowModel: getFilteredRowModel(), // Activar filtrado
    onGlobalFilterChange: setSearchTerm, // Actualiza el filtro global
    onColumnFiltersChange: setColumnFilters, // Actualiza filtros por columna

    state: { 
      pagination,   // Pasa el estado de paginación a TanStack, para que sepa que pagina mostrar
      sorting,  // Pasar el estado de ordenamiento
      globalFilter: searchTerm, // Pasar el filtro global al estado
      columnFilters, // Pasar filtros por columna
    }, 
  });


// Funciones para usuarios de sistema (API)
const handleSaveSystemUser = () => {
  const userData = { name: systemName, password: systemPassword };
  if (systemEditId) {
    updateUser(systemEditId, userData)
      .then(response => {
        setSystemUsers(systemUsers.map(user => (user.id === systemEditId ? response.data : user)));
        resetSystemForm();
      })
      .catch(error => console.error('Error al actualizar:', error));
  } else {
    createUser(userData)
      .then(response => {
        setSystemUsers([...systemUsers, response.data]);
        resetSystemForm();
      })
      .catch(error => console.error('Error al crear:', error));
  }
};

const handleDeleteSystemUser = (id) => {
  deleteUser(id)
    .then(() => {
      setSystemUsers(systemUsers.filter(user => user.id !== id));
    })
    .catch(error => console.error('Error al eliminar:', error));
};

const handleEditSystemUser = (user) => {
  setSystemName(user.name);
  setSystemPassword(user.password);
  setSystemEditId(user.id);
};

const resetSystemForm = () => {
  setSystemName('');
  setSystemPassword('');
  setSystemEditId(null);
};







  const handleExportClick= () => {
    generatePDF(table, 'compact', true);
  }

  
    const handlePrintButton = async (table) => {
  
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
    <CContainer>
     
      <CCard className="mb-1" >       {/* Contenedor que actúa como cuerpo de la tarjeta CCard. Envuelve todo el contenido*/}
        
        {/* ----------  HEAD --------------- */}
        <CCardHeader className="py-2 bg-white ">    
          <CRow className=  "justify-content-between align-items-center " > {/* Fila en la grilla.*/  }
            
            <CCol xs={12} sm="auto">    {/* Columna dentro de fila. Ocupa 5 de 12 unidades disponibles. Hereda gutter de CRow*/}
              <h4 id="titulo" className="mb-0 ">
                Administración de Usuarios
              </h4>
              <div className="small text-body-secondary"> Administradores del sistema</div>
            </CCol>

            <CCol xs={12} sm="auto" className="text-md-end ">  {/* Columna para el botón Agregar Usuario */}
              <CButton
                color="primary" 
                className="shadow-sm" 
                size="sm"
                onClick={() => setVisibleXL(!visibleXL)}
                >
                <CIcon icon={cilPlus} className="me-1" />
                Nuevo
              </CButton>
            </CCol>

            <CModal
              size="xl"
              visible={visibleXL}
              onClose={() => setVisibleXL(false)}
              aria-labelledby="OptionalSizesExample1"
             > 
              <CModalHeader>
                <CModalTitle id="OptionalSizesExample1">Nuevo usuario</CModalTitle>
              </CModalHeader>
              <CModalBody>
                <FormAltaUsuario/>      {/* Usa como cuerpo de la modal, el componente FormAltaUsuario.js */}
              </CModalBody>
            </CModal>
          
          </CRow>
        </CCardHeader>
        {/* ----------  /HEAD --------------- */}

        
          <CAccordion flush className="small-accordion "
            activeItemKey={0}
            >
            <CAccordionItem itemKey={1} className='mx-0 px-2'>
             
              <CRow className="justify-content-between bg-light  py-1 d-flex align-items-center   ">
                <CCol xs={2} md={2} lg={4} className="bg-light"> 
                  <CAccordionHeader

                    className='bg-transparent fw-semibold d-flex align-items-center'
                    >
                      Filtro avanzado</CAccordionHeader>
                </CCol>

                <CCol></CCol>

                <CCol xs={2} md={2} lg={4} className="bg-light "> 
                  <CInputGroup className="input-group-sm d-flex justify-content-end align-items-center">
                    <CInputGroupText id="inputGroup-sizing-sm">
                      Buscar
                    </CInputGroupText>
                    <CFormInput
                      type="text"
                      placeholder="Ingrese el texto a buscar"
                      aria-label="Sizing example input"
                      aria-describedby="inputGroup-sizing-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ maxWidth: '200px' }} // Limita el ancho máximo
                    />
                  </CInputGroup>

                </CCol>

              </CRow>
                
              <CAccordionBody className="bg-light" >
              
                <CRow
                  className="flex shadow-sm py-0 border size=sm bg-light"
                >
                <CCol xs={6} md={6} lg={6} className="bg-light  align-items-center"> 
                  <CInputGroup className="shadow-sm border-0 mb-0 size=sm">
                    <CInputGroupText>Filtrar por</CInputGroupText>
                      <CFormSelect 
                        className="form-select w-15"
                        value={filterColumn1}
                        onChange={(e) => setFilterColumn1(e.target.value)}
                      >
                        <option value="name">Nombre</option>
                        <option value="email">Mail</option>
                        <option value="domicilio">Domicilio</option>
                        <option value="telefono">Teléfono</option>
                      </CFormSelect>
                        <CFormInput
                          className="form-input w-25"
                          placeholder="Valor a buscar"
                          value={filterValue1}
                          onChange={(e) => setFilterValue1(e.target.value)}
                        />
                  </CInputGroup >

                  <CInputGroup className="shadow-sm border-0 mb-0 size=sm">
                    <CInputGroupText>Filtrar por</CInputGroupText>
                      <CFormSelect 
                        className="w-15"
                        value={filterColumn1}
                        onChange={(e) => setFilterColumn1(e.target.value)}
                      >
                        <option value="name">Nombre</option>
                        <option value="email">Mail</option>
                        <option value="domicilio">Domicilio</option>
                        <option value="telefono">Teléfono</option>
                      </CFormSelect>
                        <CFormInput
                          className="w-25"
                          placeholder="Valor a buscar"
                          value={filterValue1}
                          onChange={(e) => setFilterValue1(e.target.value)}
                        />
                  </CInputGroup >

                      <CButton 
                        color="primary" 
                        size="sm" 
                        className="mt-2"
                        onClick={applyFilters}>
                        Filtrar
                      </CButton>

                </CCol>

                <CCol xs={6} md={6} lg={6} className="bg-light  align-items-center"> 
                <CInputGroup className="shadow-sm border-0 mb-0 size=sm">
                    <CInputGroupText>Filtrar por</CInputGroupText>
                      <CFormSelect 
                        className="form-select w-15"
                        value={filterColumn1}
                        onChange={(e) => setFilterColumn1(e.target.value)}
                      >
                        <option value="name">Nombre</option>
                        <option value="email">Mail</option>
                        <option value="domicilio">Domicilio</option>
                        <option value="telefono">Teléfono</option>
                      </CFormSelect>
                        <CFormInput
                          className="form-select w-25"
                          placeholder="Valor a buscar"
                          value={filterValue1}
                          onChange={(e) => setFilterValue1(e.target.value)}
                        />
                  </CInputGroup >

                    <CInputGroup className="shadow-sm border-0 mb-0 size=sm">
                    <CInputGroupText>Filtrar por</CInputGroupText>
                      <CFormSelect 
                        className="form-select w-15"
                        value={filterColumn1}
                        onChange={(e) => setFilterColumn1(e.target.value)}
                      >
                        <option value="name">Nombre</option>
                        <option value="email">Mail</option>
                        <option value="domicilio">Domicilio</option>
                        <option value="telefono">Teléfono</option>
                      </CFormSelect>
                        <CFormInput
                          className="form-select w-25"
                          placeholder="Valor a buscar"
                          value={filterValue1}
                          onChange={(e) => setFilterValue1(e.target.value)}
                        />
                    </CInputGroup >




                </CCol>


                </CRow>
              </CAccordionBody>
            </CAccordionItem>
           
          </CAccordion>
          

          
          <div></div>
          
            <CRow className="justify-content-end align-items-center my-1">
              <CCol  xs="auto"  className='d-flex align-items-center me-4 ' >
                <div className='d-flex justify-content-end align-items-center gap-2 ' id="botones">
                  {/* ----------  Botón para imprimir --------------- */}
                  <CButton 
                    type="button"
                    color="secondary" 
                    className="shadow-sm px-1 py-1 me-0"
                    variant="outline"
                    size="xs"
                    style={{ fontSize: '0.75rem' }}
                    onClick = {() => handlePrintButton(table)}
                    //onClick = {() => window.print()}
                    >
                      Imprimir
                  </CButton>
                  {/* ----------  Fin Botón para imprimir  --------------- */}


                  {/* ----------  Botón para exportar a CSV --------------- */}
                  <CButton 
                    type="button"
                    color="secondary" 
                    className="shadow-sm px-1 p1-0"
                    variant="outline"
                    size="xs"
                    style={{ fontSize: '0.75rem' }}
                    onClick = {handleExportClick}
                    >
                      Expotar
                  </CButton>
                  {/* ----------  Fin Botón para exportar a CSV --------------- */}
                </div>  
              </CCol>  
            </CRow>
            
          
        {/* ----------  BODY --------------- */}
        <CCardBody className="px-4 pt-1 pb-2 border border-light">
          {/* ----------------------------------- TABLA ----------------------------------- */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>

            <CTable id='mainTable' hover  className="shadow-sm mb-0 border border-light" >
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
                        { column.column.getCanSort() ? {        // Si la columna no es ordenable, no muestra icono
                            asc: <CIcon icon={cilArrowTop} size="sm"/> , 
                            desc: <CIcon icon={cilArrowBottom} size="sm"/>,
                          } [column.column.getIsSorted()] || <CIcon icon= {cilSwapVertical} className="text-body-secondary" />
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
                        {flexRender(cell.column.columnDef.cell, cell.getContext())} {/* Renderiza el contenido de cada celda (mediante  flexrender) */}
                      </CTableDataCell>
                    ))}
                  </CTableRow>
                ))}
              </CTableBody>


              
            </CTable>
          </div>  
        </CCardBody>
        {/* ----------  /BODY --------------- */}


        
        {/* ----------  FOOTER --------------- */}
        <CCardFooter className="bg-white border-top px-3 py-1" 
          style={{ 
            position: 'sticky',          // Usamos 'sticky' para que se mantenga en el fondo del contenedor padre
            bottom: 0,                  // Se fija en la parte inferior
            zIndex: 1,                  // Asegura que esté sobre el contenido desplazable
            //width: '100%',              // Garantiza que ocupe todo el ancho del contenedor
            boxShadow: '0 -2px 5px rgba(0,0,0,0.1)' // Sombra sutil para diferenciarlo
          }} 
        >
          <CRow className=  "justify-content-between text-muted  "> 

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

          <CCol xs= 'auto' className=" ">   
            <span >
              Total de registros: <b>{table.getFilteredRowModel().rows.length}</b>
            </span>
          </CCol> 


            {/* Info de página y selector */}
            <CCol xs= 'auto' className=" ">
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
        </CCardFooter>


      </CCard>
    </CContainer>
  )
}

export default Dashboard
