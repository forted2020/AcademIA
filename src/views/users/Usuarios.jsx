import React, { useState, useEffect } from 'react'
import classNames from 'classnames'

import { CButton, CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CFormSelect, CFormInput, CFormCheck, CInputGroup, CInputGroupText, CContainer, CModalFooter, CPagination, CPaginationItem, CAccordion, CAccordionBody, CAccordionHeader, CAccordionItem, } from '@coreui/react'

import { cilTrash, cilPencil, cilArrowTop, cilArrowBottom, cilSwapVertical, cilPlus, cilSearch } from '@coreui/icons'

import { CIcon } from '@coreui/icons-react';

import FormAltaUsuario from '../../components/FormAltaUsuario.jsx'; // Importa el componente TextInput FormAltaUsuario.js
import { CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react'

import { CSVLink } from "react-csv";

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { saveAs } from 'file-saver'; // Para descargar el archivo
import { PDFViewer } from '@react-pdf/renderer';

import ReactDOM from 'react-dom';

import { compactStyles, detailedStyles } from '../dashboard/pdfFormats/pdfStyles.js';

import '../../css/PersonalStyles.css'

import {
  createColumnHelper, flexRender, getCoreRowModel, useReactTable,
  getPaginationRowModel, getSortedRowModel, getFilteredRowModel,
} from '@tanstack/react-table'

import { getUsuariosColumns} from '../../utils/columns';  // Importamos las columnas de la tabla
import UsersTable from '../../components/usersTable/UsersTable.jsx'; // Importamos el componente UserTable

import AdvancedFilters from '../../components/advancedFilters/AdvancedFilters.jsx'; // Importamos el componente de filtros 



import { getUsers, createUser, updateUser, deleteUser } from '../../api/api.js'; // Importamos las funciones de la API

import ModalConfirmDel from '../../modals/modalConfirmDel.jsx'; // Importa el modal
import ModalNewEdit from '../../modals/ModalNewEdit.jsx'; // Importa el modal


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
  const [tableData, setTableData] = useState([])    //  State para manejo de los datos de la tabla

  const [searchTerm, setSearchTerm] = useState(''); // Búsqueda dinámica. Estado para el término de búsqueda global
  const [visibleXL, setVisibleXL] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // State para filtros
  const [filterColumn1, setFilterColumn1] = useState('name'); // Columna predeterminada para el primer filtro
  const [filterValue1, setFilterValue1] = useState(''); // Valor del primer filtro
  const [filterColumn2, setFilterColumn2] = useState('domicilio'); // Columna predeterminada para el segundo filtro
  const [filterValue2, setFilterValue2] = useState(''); // Valor del segundo filtro
  const [filterColumn3, setFilterColumn3] = useState('domicilio'); // Columna predeterminada para el segundo filtro
  const [filterValue3, setFilterValue3] = useState(''); // Valor del segundo filtro
  const [filterColumn4, setFilterColumn4] = useState('domicilio'); // Columna predeterminada para el segundo filtro
  const [filterValue4, setFilterValue4] = useState(''); // Valor del segundo filtro

  const [columnFilters, setColumnFilters] = useState([]); // Estado de filtros para TanStack

  // Estados para API usuarios de sistema
  // const [systemUsers, setSystemUsers] = useState([]);
  const [systemName, setSystemName] = useState('');   // Para el formulario
  const [systemPassword, setSystemPassword] = useState('');   // Para el formulario
  const [systemEditId, setSystemEditId] = useState(null);   // Para edición

  //const columns = getColumns((id, setSystemUsers) => handleDelete(id, deleteUser, setSystemUsers), setSystemUsers);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);     // Estado del modal delete
  const [userToDelete, setUserToDelete] = useState(null);      // ID del usuario a eliminar

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editModalVisible2, setEditModalVisible2] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  //  --------------------- Obtener datos iniciales   ---------------------    
  //  Obtener datos de la base
  const fetchUsers = async () => {          //  Define una función asíncrona fetchUsers que obtiene la lista de usuarios desde la API.
    try {                                   //  try / catch: Maneja errores en caso de que la solicitud falle.
      const { data } = await getUsers();  // Llama a getUsers y desestructura la respuesta para obtener solo el data (lista de usuarios).
      setTableData(data);                     //  Actualiza el estado users con los datos obtenidos
      //setTableData(prevData => [...prevData, ...data])
    } catch (error) {
      console.error('Error fetching users:', error);  //Si hay un error, lo muestra en la consola sin interrumpir la ejecución.
    }
  };

  useEffect(() => { fetchUsers(); }, []);   //   Ejecuta la función fetchUsers cuando el componente se monta por primera vez. 
  //   O sea, carga la lista inicial de usuarios al cargar la página.



  //   ---------------------    Elimiar usuario ---------------------  
  const handleDelete = async (id) => {
    try {
      await deleteUser(id);
      setTableData(prev => prev.filter(user => user.id !== id));
      setDeleteModalVisible(false);     // Cierra el modal tras eliminar
      setUserToDelete(null);            // Limpia el ID del usuario a eliminar
      console.log(`Usuario con ID ${id} eliminado`);
    } catch (error) { console.error('Error al eliminar: ', error) }
  }


  //  ---------------------  Arir el modal de confirmación de eliminacion de usuario ---------------------  
  const confirmDelete = (id) => {
    setUserToDelete(id); // Guarda el ID del usuario
    setDeleteModalVisible(true); // Muestra el modal
  };


  //   ---------------------    Abrir modal de edición    ---------------------  
  const handleClickEditar = (user) => {
    setUserToEdit(user); // Guardar los datos del usuario a editar
    setEditModalVisible(true); // Mostrar el modal de edición
  };

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


  /*  ---------------------  Configuración de la tabla  -----------------------  */
  // Instancia de la tabla (useReactTable) es el "cerebro" de TanStack Table. 
  // La variable "table" (creada con useReactTable) contiene toda la lógica y los métodos para manejar la tabla, 
  // como paginación, filas, y renderizado.


  // Configuración de la tabla con TanStack
   
  // Se obtienen las columnas de la función 'getUsuariosColumns', importada de columns.js
  const columns = getUsuariosColumns(confirmDelete, handleClickEditar) 


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

  // Guardar usuario (crear o actualizar)
  const handleSaveSystemUser = async () => {
    const userData = { name: systemName, password: systemPassword };
    try {
      if (systemEditId) {
        // Actualizar usuario existente
        const response = await updateUser(systemEditId, userData);
        setTableData(prev =>
          prev.map(user => (user.id === systemEditId ? response.data : user))
        );
      } else {
        // Crear nuevo usuario
        const response = await createUser(userData);
        setTableData(prev => [...prev, response.data]);
      }
      resetSystemForm();
      setEditModalVisible2(false); // Cerrar modal si está abierto
    } catch (error) {
      console.error('Error al guardar usuario:', error);
    }
  };


  // Guardar usuario (crear o actualizar)
  const handleSaveUser = async (userData) => {
    try {
      if (userToEdit) {
        const response = await updateUser(userToEdit.id, userData);
        setTableData(prev =>
          prev.map(user => (user.id === userToEdit.id ? response.data : user))
        );
      } else {
        const response = await createUser(userData);
        setTableData(prev => [...prev, response.data]);
      }
      setEditModalVisible(false);
      setUserToEdit(null);
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      alert(error.response?.data?.detail || 'Error al guardar');
    }
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

  const handleExportClick = () => {
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
          <CRow className="justify-content-between align-items-center " > {/* Fila en la grilla.*/}

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
                // onClick={() => setVisibleXL(!visibleXL)}
                // onClick={() => setEditModalVisible2(!editModalVisible2)}
                onClick={() => handleClickEditar('')}
                
              >
                <CIcon icon={cilPlus} className="me-1" />
                Nuevo
              </CButton>
            </CCol>
          </CRow>
        </CCardHeader>
        {/* ----------  /HEAD --------------- */}

        {/* Filtros avanzados y búsqueda global */}
        <AdvancedFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterColumn1={filterColumn1}
          setFilterColumn1={setFilterColumn1}
          filterValue1={filterValue1}
          setFilterValue1={setFilterValue1}
          filterColumn2={filterColumn2}
          setFilterColumn2={setFilterColumn2}
          filterValue2={filterValue2}
          setFilterValue2={setFilterValue2}
          filterColumn3={filterColumn3}
          setFilterColumn3={setFilterColumn3}
          filterValue3={filterValue3}
          setFilterValue3={setFilterValue3}
          filterColumn4={filterColumn4}
          setFilterColumn4={setFilterColumn4}
          filterValue4={filterValue4}
          setFilterValue4={setFilterValue4}
          setColumnFilters={setColumnFilters}
        />

        <div></div>

        <CRow className="justify-content-end align-items-center my-1">
          <CCol xs="auto" className='d-flex align-items-center me-4 ' >
            <div className='d-flex justify-content-end align-items-center gap-2 ' id="botones">
              {/* ----------  Botón para imprimir --------------- */}
              <CButton
                type="button"
                color="secondary"
                className="shadow-sm px-1 py-1 me-0"
                variant="outline"
                size="xs"
                style={{ fontSize: '0.75rem' }}
                onClick={() => handlePrintButton(table)}
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
                onClick={handleExportClick}
              >
                Expotar
              </CButton>
              {/* ----------  Fin Botón para exportar a CSV --------------- */}
            </div>
          </CCol>
        </CRow>


        {/* ----------  BODY --------------- */}
        <CCardBody className="px-4 pt-1 pb-2 border border-light">

          {/*  ---------------  Tabla  ------------- */}
          {/* Se utiliza el componente UserTable importado de UsersTable.jsx, pasando la instancia de table como prop.*/}
          <UsersTable table={table} />
                  
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
        </CCardFooter>


      </CCard>


      {/* Modal de confirmación */}
      <ModalConfirmDel
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleDelete}
        userId={userToDelete}
      />

      {/* Modal Editar */}
      <ModalNewEdit
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setUserToEdit(null);
        }}
        
        title={!userToEdit ? 'Nuevo usuario' : 'Editar usuario'}  // ! verifica si userToEdit es "falsy" (null, undefined, '', 0, etc.).
        initialData={userToEdit || {
          name: '',
          domicilio: '',
          telefono: '',
          email: '',
          password: '',
        }}
        onSave={handleSaveUser}
      />

      {/* Modal Eliminar */}
      <ModalConfirmDel
        visible={deleteModalVisible}
        onClose={() => {
          setDeleteModalVisible(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDelete}
        userId={userToDelete}
      />


      {/*  --------------- Modal Nuevo Usuario ---------------  */}
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
          <FormAltaUsuario />      {/* Usa como cuerpo de la modal, el componente FormAltaUsuario.js */}
        </CModalBody>
      </CModal>

      {/*  --------------- Modal Editar Usuario ---------------  */}
      <CModal
        id="EditUserModal"
        size="xl"
        visible={editModalVisible2}
        onClose={() => {
          setEditModalVisible2(false);
          resetSystemForm();
        }}
        aria-labelledby="EditUserModal"
      >
        <CModalHeader>
        </CModalHeader>
        <CModalBody>
          <ModalNewEdit />
          {/*
          {userToEdit && (
            <ModalNewEdit
              initialData={userToEdit}  // Pasa los datos del usuario al formulario
              onSubmit={(updateData) => {
                updateUser(userToEdit.id, updateData)
                  .then((response) => {
                    setTableData((prevData) =>
                      prevData.map((u) =>
                        u.id == userToEdit.id ? response.data : u
                      )
                    );
                    setEditModalVisible2(false)  // Cierro la modal
                    setUserToEdit(null);  // limpio el usuario seleccionado
                  })
                  .catch((error) => console.error("Error al actualizar:", error));
              }}
            />
          )}
        */}
        </CModalBody>
      </CModal>



    </CContainer>
  )


}


export default Dashboard
