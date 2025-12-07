// src/views/Estudiante.jsx (Componente de Presentación)

import React from 'react'
import { CButton, CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CContainer } from '@coreui/react'
import { cilPlus } from '@coreui/icons'
import { CIcon } from '@coreui/icons-react'

// 1. Importar el hook genérico
import { useGenericCrud } from '../../hooks/useGenericCrud.js'

// 2. Importar el objeto API y las Columnas específicas de Estudiante
import apiEstudiantes from '../../api/apiEstudiantes.js' // <-- Usamos el mapeo
import { getEstudiantesColumns } from '../../utils/columns.js'

// Importar componentes reutilizables
import GenericTable from '../../components/usersTable/GenericTable.jsx'
import TablePagination from '../../components/tablePagination/TablePagination.jsx'
import AdvancedFilters from '../../components/advancedFilters/AdvancedFilters.jsx'
import TableActions from '../../components/tableActions/TableActions.jsx'
import ModalConfirmDel from '../../modals/ModalConfirmDel.jsx'
import ModalNewEdit from '../../modals/ModalNewEdit.jsx'

// Campos y Opciones de Filtro (datos de Presentación)
const filterOptions = [
    { value: 'nombre', label: 'Nombre' },
    { value: 'apellido', label: 'Apellido' },
    { value: 'email', label: 'Email' },
    { value: 'domicilio', label: 'Domicilio' },
    { value: 'telefono', label: 'Teléfono' },
]

const studentFields = [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Ejemplo: Carlos' },
    { name: 'apellido', label: 'Apellido', type: 'text', required: true, placeholder: 'Ejemplo: Pérez' },
    { name: 'email', label: 'Email', type: 'email', required: false, placeholder: 'ejemplo@mail.com' },
    { name: 'fec_nac', label: 'Fecha de Nacimiento', type: 'date', required: false },
    { name: 'domicilio', label: 'Domicilio', type: 'text', required: false, placeholder: 'Calle 123' },
    { name: 'telefono', label: 'Teléfono', type: 'tel', required: false, placeholder: '1234567890' },
    { name: 'password', label: 'Contraseña', type: 'password', required: false, placeholder: 'Solo si se crea usuario', fullWidth: true },
]


export default function Estudiante() {
    
    //  Usa del hook genérico con las configuraciones específicas
    const {
        table,
        isLoading,
        searchTerm,
        setSearchTerm,
        columnFilters,
        setColumnFilters,
        deleteModalVisible,
        setDeleteModalVisible,
        itemToDelete,
        handleDelete,
        editModalVisible,
        setEditModalVisible,
        itemToEdit,
        handleSave,
        handleClickNew,
    } = useGenericCrud(apiEstudiantes, getEstudiantesColumns) // <-- API y Columnas específicas pasadas como props

    return (
        <div style={{ padding: '10px' }}>
            <h1 className="ms-1" >Estudiantes</h1>
            <CContainer>
                <CCard className="mb-1">
                    {/* ENCABEZADO */}
                    <CCardHeader className="py-2 bg-white">
                        <CRow className="justify-content-between align-items-center">
                            <CCol xs={12} sm="auto">
                                <h4 id="titulo" className="mb-0">Gestión de Estudiantes</h4>
                                <div className="small text-body-secondary">
                                    Administración de alumnos del establecimiento
                                </div>
                            </CCol>
                            <CCol xs={12} sm="auto" className="text-md-end">
                                <CButton
                                    color="primary"
                                    className="shadow-sm"
                                    size="sm"
                                    onClick={handleClickNew}
                                >
                                    <CIcon icon={cilPlus} className="me-1" />
                                    Nuevo Estudiante
                                </CButton>
                            </CCol>
                        </CRow>
                    </CCardHeader>

                    {/* FILTROS AVANZADOS Y BÚSQUEDA GLOBAL */}
                    <AdvancedFilters
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        columnFilters={columnFilters}
                        setColumnFilters={setColumnFilters}
                        filterOptions={filterOptions}
                    />

                    {/* ACCIONES DE TABLA */}
                    <TableActions table={table} />

                    {/* CUERPO DE LA TABLA */}
                    <CCardBody className="px-4 pt-1 pb-2 border border-light">
                        <GenericTable table={table} isLoading={isLoading} />
                    </CCardBody>

                    {/* PIE DE PÁGINA CON PAGINACIÓN */}
                    <CCardFooter
                        className="bg-white border-top px-3 py-1"
                        style={{ position: 'sticky', bottom: 0, zIndex: 1, boxShadow: '0 -2px 5px rgba(0,0,0,0.1)' }}
                    >
                        <TablePagination table={table} />
                    </CCardFooter>
                </CCard>

                {/* MODALES */}
                <ModalNewEdit
                    visible={editModalVisible}
                    onClose={() => setEditModalVisible(false)}
                    title={itemToEdit ? 'Editar Estudiante' : 'Nuevo Estudiante'}
                    initialData={itemToEdit || {}}
                    onSave={handleSave}
                    fields={studentFields}
                />

                <ModalConfirmDel
                    visible={deleteModalVisible}
                    onClose={() => setDeleteModalVisible(false)}
                    onConfirm={handleDelete}
                    userId={itemToDelete} 
                />
            </CContainer>
        </div>
    )
}