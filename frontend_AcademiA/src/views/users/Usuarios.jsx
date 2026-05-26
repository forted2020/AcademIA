import React, { useState, useEffect } from 'react'
import classNames from 'classnames'

import { CButton, CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CContainer, CPagination, CPaginationItem, CAccordion, CAccordionBody, CAccordionHeader, CAccordionItem, } from '@coreui/react'

import { cilTrash, cilPencil, cilArrowTop, cilArrowBottom, cilSwapVertical, cilPlus, cilSearch, cilPeople } from '@coreui/icons'

import { CIcon } from '@coreui/icons-react';

import FormAltaUsuario from '../../components/FormAltaUsuario.jsx'; // Importa el componente TextInput FormAltaUsuario.js
import { CModal, CModalBody, CModalHeader, CModalTitle } from '@coreui/react'

import { CSVLink } from "react-csv";

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { saveAs } from 'file-saver'; // Para descargar el archivo
import { PDFViewer } from '@react-pdf/renderer';
import TableAction from '../../components/tableActions/TableActions.jsx'

import { compactStyles, detailedStyles } from '../dashboard/pdfFormats/pdfStyles.js';

import '../../css/PersonalStyles.css'
import './Usuarios.css'

import {
  createColumnHelper, flexRender, getCoreRowModel, useReactTable, getPaginationRowModel, getSortedRowModel, getFilteredRowModel,
} from '@tanstack/react-table'

import TablePagination from '../../components/tablePagination/TablePagination.jsx'

//  import { getUsuariosColumns } from '../../utils/columns.js';  // Importamos las columnas de la tabla
import { getTableColumns } from '../../utils/columns.js'; // Ahora importamos la función genérica


import GenericTable from '../../components/usersTable/GenericTable.jsx'; // Importamos el componente UserTable
import AdvancedFilters from '../../components/advancedFilters/AdvancedFilters.jsx'; // Importamos el componente de filtros 

import TableActions from '../../components/tableActions/TableActions.jsx' // Importamos botones de acciones de la tabla

import { getUsers, createUser, updateUser, deleteUser } from '../../api/api.js'; // Importamos las funciones de la API

import ModalConfirmDel from '../../modals/ModalConfirmDel.jsx'; // Importa el modal
import ModalNewEdit from '../../modals/ModalNewEdit.jsx'; // Importa el modal

// Estado para manejar los filtros de manera unificada
const initialFilters = [
  { id: 'name', value: '' },
  { id: 'email', value: '' },
  { id: 'domicilio', value: '' },
  { id: 'telefono', value: '' },
];


const Usuarios = () => {

   // Usamos el hook para traer datos y los desestructuramos

   
  const [tableData, setTableData] = useState([])    //  State para manejo de los datos de la tabla
  const [searchTerm, setSearchTerm] = useState(''); // Búsqueda dinámica. Estado para el término de búsqueda global
  const [visibleXL, setVisibleXL] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);


  // Estado para manejar los filtros de TanStack como un array de objetos
  const [columnFilters, setColumnFilters] = useState(initialFilters);


  // Estados para API usuarios de sistema
  // const [systemUsers, setSystemUsers] = useState([]);
  const [systemName, setSystemName] = useState('');   // Para el formulario
  const [systemPassword, setSystemPassword] = useState('');   // Para el formulario
  const [systemEditId, setSystemEditId] = useState(null);   // Para edición

  //  --------------------- Configuración de Columnas   ---------------------    
  // Definimos las columnas específicas de datos para la tabla de Usuarios
  const usuariosColumnsConfig = [
    {
      accessorKey: 'name',
      header: 'Nombre y Apellido',
      // cell por defecto ya muestra el valor o '-', no necesitamos personalizarla
    },
    {
      accessorKey: 'email',
      header: 'Mail',
    },
    {
      accessorKey: 'domicilio',
      header: 'Domicilio',
    },
    {
      accessorKey: 'telefono',
      header: 'Teléfono',
    },
    // Si en el futuro se precisan agregar más columnas personalizadas, se ponen aquí
  ];



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
  //  const columns = getUsuariosColumns(confirmDelete, handleClickEditar)

  // ==================== CREACIÓN DE COLUMNAS  ====================

  // Se usa la función genérica: le pasamos config + callbacks
  const columns = getTableColumns(
    usuariosColumnsConfig,
    confirmDelete,         // función para abrir modal de borrar
    handleClickEditar      // función para abrir modal de editar
  );


  const table = useReactTable({
    data: tableData,              // Datos de la tabla, obtenidos de datos.json 
    columns,                      // Columnas definidas anteriormente

    getCoreRowModel: getCoreRowModel(),   // función de TanStack. Genera el modelo básico de filas
    getPaginationRowModel: getPaginationRowModel(), // Activa la paginación, divide filas en páginas según pageSize y pageIndex.
    onPaginationChange: setPagination, // Actualiza el estado de paginación al cambiar de página    

    getSortedRowModel: getSortedRowModel(), // Activar ordenamiento
    onSortingChange: setSorting, // Actualizar estado de ordenamiento

    //getFilteredRowModel: getFilteredRowModel(), // Activar filtrado
    onGlobalFilterChange: setSearchTerm, // Actualiza el filtro global
    //onColumnFiltersChange: setColumnFilters, // Actualiza filtros por columna

    state: {
      pagination,   // Pasa el estado de paginación a TanStack, para que sepa que pagina mostrar
      sorting,  // Pasar el estado de ordenamiento
      globalFilter: searchTerm, // Pasar el filtro global al estado
      //columnFilters, // Pasar filtros por columna
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



  return (

    <CContainer fluid className="py-3">

      {/* ── Card principal ─────────────────────────────────────── */}
      <div className="usr-card mb-1">

        {/* ── Encabezado ─────────────────────────────────────────── */}
        <div className="usr-card-header">

          {/* Columna izquierda: brand */}
          <div className="usr-header-left">
            <div className="usr-header-brand">
              <div className="usr-header-brand-icon">
                <CIcon icon={cilPeople} className="usr-brand-icon" />
              </div>
              <div>
                <h2 className="usr-header-h2">Gestión de Usuarios</h2>
                <p className="usr-header-sub">Administración de cuentas y accesos</p>
              </div>
            </div>
          </div>

          {/* Columna derecha: botón nuevo */}
          <div className="usr-header-actions">
            <button
              className="usr-btn-new"
              onClick={() => handleClickEditar('')}
            >
              <CIcon icon={cilPlus} style={{ width: '0.85rem', height: '0.85rem' }} />
              Nuevo Usuario
            </button>
          </div>

        </div>
        {/* ── /Encabezado ─────────────────────────────────────────── */}

        <TableActions table={table} />

        {/* ── Cuerpo ─────────────────────────────────────────────── */}
        <div className="usr-card-body">
          {/* Filtros avanzados desactivados temporalmente */}
          {/* Se utiliza GenericTable con la instancia de table */}
          <GenericTable table={table} />
        </div>
        {/* ── /Cuerpo ─────────────────────────────────────────────── */}

        {/* ── Footer sticky con paginación ───────────────────────── */}
        <div className="usr-card-footer">
          <TablePagination table={table} />
        </div>

      </div>
      {/* ── /Card principal ─────────────────────────────────────── */}



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



    </CContainer >
  )


}


export default Usuarios
