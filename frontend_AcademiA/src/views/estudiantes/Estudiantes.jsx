//  frontend_AcademiA\src\views\estudiantes\Estudiantes.jsx

import React, { useState, useEffect, useRef } from 'react'
import { CButton, CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CContainer, CTooltip } from '@coreui/react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import { CIcon } from '@coreui/icons-react'

// Componentes de PrimeReact
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { SelectButton } from 'primereact/selectbutton';
import { Menu } from 'primereact/menu'; // Menu más ligero que TieredMenu si solo hay un nivel
import { Button } from 'primereact/button';
import { TieredMenu } from 'primereact/tieredmenu'

// Estilos personalizados
import './Estudiantes.css'

// Componentes
import ModalConfirmDel from '../../modals/ModalConfirmDel.jsx'
import ModalNewEdit from '../../modals/ModalNewEdit.jsx'
import ToastNotification from '../../components/toastNotification/toastNotification.jsx'
import { ActionTableButtons } from '../../components/genericTable/actionTableButtons/ActionTableButtons.jsx'
import { FilterMatchMode } from 'primereact/api';

// Datos de configuración de Modales
import { modalNewEditEstudiantesFields, columnsTableEstudiantesConfig } from './estudiantesFormConfigs/EstudiantesFormConfigs.js'

// API y Hooks de Lógica
// Importamos funciones API para estudiantes
import apiEstudiantes from '../../api/apiEstudiantes.js'

//  Hook para obtener datos de los estudiantes
import { useStudentsData } from '../../hooks/useStudentsData.js'
// Custom Hook para manejar modales, manejar errores y actualizar la tabla 
import { useCrudModalManager } from '../../hooks/UseCrudModalManager/useCrudModalManager.js'



// Configuración de botones de menú de filas

/*
const menuItemsConfig = (openEdit, openDelete) => [
    {
        label: 'Acciones',
        items: [
            { label: 'Editar', icon: 'pi pi-pencil', command: (e) => openEdit(e) },
            { label: 'Eliminar', icon: 'pi pi-trash', className: 'text-danger', command: (e) => openDelete(selectedRowData) },
            // Línea divisoria para separar acciones de gestión
            { separator: true },
            // Cierre del menú
            { label: 'Cancelar', icon: 'pi pi-times', command: () => { } }
        ]
    }
];
*/


// Componente auxiliar para detectar desbordamiento
const TruncatedCell = ({ value }) => {
    const spanRef = useRef(null);
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        if (spanRef.current) {
            const el = spanRef.current;
            setIsOverflowing(el.scrollWidth > el.clientWidth + 1);
        }
    }, [value]);

    const content = (
        <span
            ref={spanRef}
            className="d-inline-block text-truncate w-100"
            style={{ cursor: isOverflowing ? 'pointer' : 'default' }}
        >
            {value}
        </span>
    );

    // Solo renderizamos Tooltip si hay truncamiento
    return isOverflowing ? (
        <CTooltip content={String(value)} placement="top">
            {content}
        </CTooltip>
    ) : (
        content
    );
};

export default function Estudiante() {

    // Hook para traer datos y desestructurar
    const {
        studentsData: tableData,
        setStudentsData: setTableData,
        loading
    } = useStudentsData()

    console.log("Datos traidos del hook: ", { tableData });

    // Hook de Lógica CRUD ("Administrador")
    const {
        editModal, deleteModal,      // Estados de los modales (visible, data, id)
        openEdit, closeEdit,         // Funciones para abrir/cerrar edición
        openDelete, closeDelete,     // Funciones para abrir/cerrar borrado
        toast, setToast,             // Estado de notificaciones
        handleSave, handleDelete     // Funciones lógicas que llaman a la API
    } = useCrudModalManager({
        createApi: apiEstudiantes.create,  // Mapeamos las funciones de la API
        updateApi: apiEstudiantes.update,
        deleteApi: apiEstudiantes.remove,
        setData: setTableData              // Actualizar la tabla al terminar
    });


    // Estados de UI
    const [searchTerm, setSearchTerm] = useState('') // Búsqueda global
    const [size, setSize] = useState('normal')
    const [selectedRows, setSelectedRows] = useState(null)
    const [pagination, setPagination] = useState({ first: 0, rows: 10 }) // PrimeReact usa 'first' y 'rows'

    // Opciones para el selector de tamaño
    const sizeOptions = [
        { label: 'Compacto', value: 'small' },
        { label: 'Normal', value: 'normal' },
        { label: 'Amplio', value: 'large' }
    ]

    // Template para renderizar los botones de acción
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="text-center">
                <Button
                    icon="pi pi-ellipsis-v" // Ícono de tres puntos verticales
                    rounded
                    text
                    severity="secondary"
                    aria-controls="popup_menu_left"
                    //aria-haspopup
                    onClick={(event) => {
                        // event.preventDefault();
                        event.stopPropagation();
                        setSelectedRowData(rowData); // Guardamos la fila actual
                        menuRef.current?.toggle(event); // Mostramos el menú
                    }}
                />
            </div>
        );
    };


    
    // Cleanup para el menú de acciones
    useEffect(() => {
        return () => {
            menuRef.current?.hide()
        }
    }, [])

    //  Componente para Header de tabla
    const headerTable = () => {
        return (
            <div className="d-flex justify-content-between align-items-center " >
                {/* Selector de tamaño */}
                <SelectButton
                    value={size}
                    onChange={(e) => { if (e.value) setSize(e.value); }}
                    options={sizeOptions}
                    className="density-selector"
                />
                {/* Buscador global */}
                <input
                    className="form-control form-control-sm w-25"
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        );
    }

    const paginatorTemplate = {
        'CurrentPageReport': (options) => {
            return (
                <span className="mx-3" style={{ color: 'var(--text-color-secondary)', userSelect: 'none' }}>
                    Mostrando {options.first} a {options.last} de <b style={{ color: 'var(--primary-color)' }}>{options.totalRecords} estudiantes</b>
                </span>
            )
        },

        layout: ' FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport',

    };

    // Configuración de filtros
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        nombre: { value: null, matchMode: FilterMatchMode.CONTAINS },
        apellido: { value: null, matchMode: FilterMatchMode.CONTAINS },
        dni: { value: null, matchMode: FilterMatchMode.CONTAINS },
        email: { value: null, matchMode: FilterMatchMode.CONTAINS },
    });

    // Configuración tiredMenu
    const menuRef = useRef(null);
    const [selectedRowData, setSelectedRowData] = useState(null); // Para saber qué fila se clickeó

    const menuItems = [
        {
            label: 'Editar',
            icon: 'pi pi-pencil',
            command: () => {
                if (selectedRowData) {
                    openEdit(selectedRowData);
                    menuRef.current?.hide()
                }
            }
        },
        {
            label: 'Eliminar',
            icon: 'pi pi-trash',
            className: 'text-danger',
            command: () => {
                if (selectedRowData) {
                    openDelete(selectedRowData);
                    menuRef.current?.hide()
                }
            }
        },
        { separator: true },
        {
            label: 'Cancelar',
            icon: 'pi pi-times',
            command: () => {
                menuRef.current?.hide()
            }
        }
    ];




    return (
        <div style={{ padding: '10px' }}>
            <h1 className="ms-1" >Estudiantes</h1>

            {/* Componente de Notificaciones (Toast) */}
            <ToastNotification toast={toast} setToast={setToast} />

            <CContainer>
                <CCard className="mb-1">

                    {/* ---------- ENCABEZADO ---------- */}
                    <CCardHeader className="py-2 bg-white">
                        <CRow className="justify-content-between align-items-center">
                            <CCol xs={12} sm="auto">

                                <h4 id="titulo" className="mb-0">
                                    Gestión de Estudiantes
                                </h4>

                                <div className="small text-body-secondary">
                                    Administración de alumnos del establecimiento
                                </div>
                            </CCol>

                            {/* Botón para agregar nuevo estudiante */}
                            <CCol xs={12} sm="auto" className="text-md-end">
                                <CButton
                                    color="primary" className="shadow-sm" size="sm"
                                    onClick={() => openEdit()}  // Función openEdit() del hook sin argumentos = Nuevo
                                >
                                    <CIcon icon={cilPlus} className="me-1" />
                                    Nuevo
                                </CButton>
                            </CCol>
                        </CRow>
                    </CCardHeader>

                    {/* ---------- CUERPO ---------- */}
                    <CCardBody className="px-4 pt-1 pb-2 border border-light">

                        {/* ---------- TABLA ---------- */}
                        {/* TABLA CON WRAPPER DE ESTILOS 
                         estudiantes-wrapper' es el nombre del contenedor, para referirlo en el .css */}
                        <div className={`estudiantes-wrapper modo-${size}`} >


                            <TieredMenu
                                model={menuItems}
                                popup
                                ref={menuRef}
                                appendTo={document.body}
                                onHide={() => setSelectedRowData(null)}
                            />


                            <DataTable
                                value={tableData}
                                header={headerTable}
                                // footer = {}

                                className="p-datatable-gridlines" // bordes
                                tableStyle={{ minWidth: '100%', tableLayout: 'fixed' }}
                                stripedRows
                                selectionMode={'checkbox'}
                                selection={selectedRows}
                                onSelectionChange={(e) => setSelectedRows(e.value)}
                                dataKey="id_entidad"
                                //  Ordenamiento
                                removableSort
                                sortField="apellido"
                                sortOrder={1}
                                loading={loading}

                                // Paginación
                                paginator
                                rows={pagination.rows}
                                rowsPerPageOptions={[5, 10, 25, 50]} // Opciones del selector
                                paginatorPosition="bottom"
                                // Diseño del paginador (Template)
                                paginatorTemplate={paginatorTemplate}

                                first={pagination.first}
                                onPage={(e) => setPagination(e)}

                                // Filtro global
                                globalFilter={searchTerm}

                                // Filtros por Columna
                                filters={filters}
                                onFilter={(e) => setFilters(e.filters)} // Actualiza el estado cuando el usuario escribe
                                filterDisplay="row"

                                emptyMessage="No se encontraron estudiantes."

                            >
                                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>

                                {/* Renderizado dinámico de columnas de datos */}
                                {columnsTableEstudiantesConfig.map((col) => (
                                    <Column
                                        key={col.field}
                                        field={col.field}
                                        header={col.header}
                                        body={
                                            col.body
                                                ? col.body
                                                : (rowData) => <TruncatedCell value={rowData[col.field]} />
                                        }



                                        sortable={col.sortable}


                                        // body={col.body} // Si no tiene body, valor por defecto
                                        // sortable={col.sortable}
                                        filter
                                        filterPlaceholder="Buscar"
                                        // Desactivamos el menú de opciones (para que sea solo texto directo)
                                        showFilterMenu={false}
                                        style={{ width: col.width }}

                                    />
                                ))}

                                <Column header="" body={actionBodyTemplate}
                                    style={{ width: '3.5rem', textAlign: 'center' }}
                                />
                            </DataTable>
                        </div>
                    </CCardBody>

                    {/* ---------- PIE DE PÁGINA ---------- */}
                    <CCardFooter
                        className="bg-white border-top px-3 py-1"
                        style={{
                            position: 'sticky',
                            bottom: 0,
                            zIndex: 1,
                            boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
                        }}
                    >
                    </CCardFooter>

                </CCard>

                {/* MODAL NUEVO / EDITAR usando los estados del Hook 'editModal' */}
                <ModalNewEdit
                    visible={editModal.visible}
                    onClose={closeEdit}
                    title={editModal.item ? 'Editar Estudiante' : 'Nuevo Estudiante'}
                    initialData={editModal.item || {}}
                    onSave={handleSave} // El hook maneja la lógica de Create vs Update
                    fields={modalNewEditEstudiantesFields}
                />

                {/* MODAL BORRAR conectado a los estados del Hook 'deleteModal' */}
                <ModalConfirmDel
                    visible={deleteModal.visible}
                    onClose={closeDelete}
                    onConfirm={handleDelete} // El hook maneja la llamada a la API y el Toast
                    userId={deleteModal.id}
                />
            </CContainer >

        </div >)
}
