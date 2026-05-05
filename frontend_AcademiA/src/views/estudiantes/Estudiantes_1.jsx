//  frontend_AcademiA\src\views\estudiantes\Estudiantes.jsx

import React, { useState, useEffect, } from 'react'
import { CButton, CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CContainer } from '@coreui/react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import { CIcon } from '@coreui/icons-react'

// Importamos PrimeReact
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { FilterMatchMode } from 'primereact/api'
import { SelectButton } from 'primereact/selectbutton';
import { InputSwitch } from 'primereact/inputswitch';

// Estilos personalizados
import './Estudiantes.css'

// Componentes y Hooks
import ModalConfirmDel from '../../modals/ModalConfirmDel.jsx'
import ModalNewEdit from '../../modals/ModalNewEdit.jsx'
// Importamos funciones API para estudiantes
import apiEstudiantes from '../../api/apiEstudiantes.js'
//  Hook para obtener datos de los estudiantes
import { useStudentsData } from '../../hooks/useStudentsData.js'

export default function Estudiante() {

    // Hook para traer datos y desestructuramos
    const {
        studentsData: tableData,
        setStudentsData: setTableData,
        loading
    } = useStudentsData()


    // Estados de UI y Filtros
    const [searchTerm, setSearchTerm] = useState('') // Búsqueda global
    const [size, setSize] = useState('normal')
    const [selectedRows, setSelectedRows] = useState(null)
    const [pagination, setPagination] = useState({ first: 0, rows: 10 }) // PrimeReact usa 'first' y 'rows'

    // Estados de modales
    const [deleteModalVisible, setDeleteModalVisible] = useState(false) // Modal de confirmación de eliminación
    const [studentToDelete, setStudentToDelete] = useState(null) // ID del estudiante a eliminar
    const [editModalVisible, setEditModalVisible] = useState(false) // Modal de edición/creación
    const [studentToEdit, setStudentToEdit] = useState(null) // Datos del estudiante a editar

    // Opciones para el selector de tamaño
    const sizeOptions = [
        { label: 'Compacto', value: 'small' },
        { label: 'Normal', value: 'normal' },
        { label: 'Amplio', value: 'large' }
    ]

    // ---------------- LÓGICA DE NEGOCIO ----------------

    // Eliminar estudiante
    const handleDelete = async (id) => {
        try {
            await apiEstudiantes.remove(id)
            // Actualizar la tabla removiendo el estudiante eliminado
            setTableData((prev) => prev.filter((student) => student.id !== id))
            setDeleteModalVisible(false)
            setStudentToDelete(null)
            console.log(`Estudiante con ID ${id} eliminado`)
        } catch (error) {
            console.error('Error al eliminar estudiante:', error)
        }
    }

    // Guardar estudiante (crear o actualizar)
    const handleSaveStudent = async (studentData) => {
        try {
            if (studentToEdit) {
                // Actualizar estudiante existente
                const response = await apiEstudiantes.update(studentToEdit.id, studentData)

                setTableData((prev) =>
                    prev.map((student) => (student.id === studentToEdit.id ? response.data : student))
                )
            } else {
                // Crear nuevo estudiante
                const response = await apiEstudiantes.create(studentData)
                setTableData((prev) => [...prev, response.data])
            }
            setEditModalVisible(false)
            setStudentToEdit(null)
        } catch (error) {
            console.error('Error al guardar estudiante:', error)
            alert(error.response?.data?.detail || 'Error al guardar estudiante')
        }
    }

    //  VER SI ESTOS DOS VAN
    // Abrir modal de confirmación de eliminación
    const confirmDelete = (id) => {
        setStudentToDelete(id)
        setDeleteModalVisible(true)
    }

    // Abrir modal de edición
    const handleClickEditar = (student) => {
        setStudentToEdit(student)
        setEditModalVisible(true)
    }

    // ---------------- TEMPLATES DE TABLA ----------------
    // Formateo de Fecha
    const dateBodyTemplate = (rowData) => {
        if (!rowData.fec_nac) return '-'
        const [year, month, day] = rowData.fec_nac.split('-')
        return `${day}/${month}/${year}`
    }

    // Botones de Acción (Editar/Borrar)
    const actionBodyTemplate = (rowData) => {
        return (
            <div className="d-flex gap-2">
                <CButton
                    color="info" size="sm" variant="outline"
                    onClick={() => {
                        setStudentToEdit(rowData)
                        setEditModalVisible(true)
                    }}
                >
                    <CIcon icon={cilPencil} />
                </CButton>
                <CButton
                    color="danger" size="sm" variant="outline"
                    onClick={() => {
                        setStudentToDelete(rowData.id)
                        setDeleteModalVisible(true)
                    }}
                >
                    <CIcon icon={cilTrash} />
                </CButton>
            </div>
        )
    }

    //  Configuración de columnas
    const columnsConfig = [
        { field: 'apellido', header: 'Apellido', sortable: true },
        { field: 'nombre', header: 'Nombre', sortable: true },
        {
            field: 'fec_nac',
            header: 'Fecha Nac.',
            body: dateBodyTemplate, // Pasamos la función que formatea la fecha
            sortable: true
        },
        { field: 'email', header: 'Email', sortable: true },
        { field: 'domicilio', header: 'Domicilio', sortable: false },
        { field: 'telefono', header: 'Teléfono', sortable: false },
    ];

    return (

        <div style={{ padding: '10px' }}>
            <h1 className="ms-1" >Estudiantes</h1>
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
                                    onClick={() => {
                                        setStudentToEdit(null)
                                        setEditModalVisible(true)
                                    }}
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
                        {/* Controles: Buscador y Tamaño */}

                        <div className="d-flex justify-content-between align-items-center mb-1">

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

                        {/* TABLA CON WRAPPER DE ESTILOS */}
                        <div className={`estudiantes-wrapper modo-${size}`}
                        >
                            <DataTable
                                value={tableData}
                                header={'Encabezado'}
                                footer={'Footer'}
                                stripedRows
                                selectionMode={'checkbox'}
                                selection={selectedRows}
                                onSelectionChange={(e) => setSelectedRows(e.value)}
                                dataKey="id"
                                //  Ordenamiento
                                removableSort
                                sortField="apellido"
                                sortOrder={1}

                                loading={loading}
                                // Paginación
                                paginator
                                className="p-datatable-gridlines" // Opcional: bordes
                                rows={pagination.rows}
                                first={pagination.first}
                                onPage={(e) => setPagination(e)}

                                globalFilter={searchTerm}
                                emptyMessage="No se encontraron estudiantes."

                                tableStyle={{ minWidth: '50rem' }}
                            >
                                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>

                                {/* Renderizado dinámico de columnas de datos */}
                                {columnsConfig.map((col) => (
                                    <Column
                                        key={col.field}
                                        field={col.field}
                                        header={col.header}
                                        body={col.body} // Si no tiene body, valor por defecto
                                        sortable={col.sortable}
                                    />
                                ))}

                                <Column header="Acciones" body={actionBodyTemplate} style={{ width: '100px' }} />
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
                        Paginación de tabla?
                    </CCardFooter>
                </CCard>

                {/* ---------- MODALES ---------- */}

                {/* Modal de edición/creación de estudiante */}
                <ModalNewEdit
                    visible={editModalVisible}
                    onClose={() => {
                        setEditModalVisible(false)
                        setStudentToEdit(null)
                    }}
                    title={studentToEdit ? 'Editar Estudiante' : 'Nuevo Estudiante'}
                    initialData={studentToEdit || {}}
                    onSave={handleSaveStudent}
                    fields={[
                        { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Ejemplo: Carlos' },
                        { name: 'apellido', label: 'Apellido', type: 'text', required: true, placeholder: 'Ejemplo: Pérez' },
                        { name: 'email', label: 'Email', type: 'email', required: false, placeholder: 'ejemplo@mail.com' },
                        { name: 'fec_nac', label: 'Fecha de Nacimiento', type: 'date', required: false },
                        { name: 'domicilio', label: 'Domicilio', type: 'text', required: false, placeholder: 'Calle 123' },
                        { name: 'telefono', label: 'Teléfono', type: 'tel', required: false, placeholder: '1234567890' },
                    ]}
                />

                {/* Modal de confirmación de eliminación */}
                <ModalConfirmDel
                    visible={deleteModalVisible}
                    onClose={() => {
                        setDeleteModalVisible(false)
                        setStudentToDelete(null)
                    }}
                    onConfirm={handleDelete}
                    userId={studentToDelete}
                />
            </CContainer >
        </div >)
}
