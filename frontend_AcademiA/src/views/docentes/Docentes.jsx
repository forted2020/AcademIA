//  frontend_AcademiA\src\views\docentes\Docentes.jsx

// Gestiona la visualización y administración de docentes (tbl_entidad donde tipo_entidad = 'DOC')
import React, { useState, useEffect, useMemo } from 'react'
import { CButton, CCard, CCardHeader, CCardBody, CCardFooter, CCol, CRow, CContainer } from '@coreui/react'
import { cilPlus } from '@coreui/icons'
import { CIcon } from '@coreui/icons-react'
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table'

// Hooks y Servicios
import { useCrudModalManager } from '../../hooks/UseCrudModalManager/useCrudModalManager.js';

// UI y Utils
import { formatDisplayDate, getTodayDate } from '../../utils/dateUtils/DateUtils.js';
// Importar configuración de columnas
import { getTableColumns } from '../../utils/columns';
// Importar funciones API para Docentes
import { getDocentes, createDocente, updateDocente, deleteDocente } from '../../api/api.js'

// Importar componentes reutilizables
import GenericTable from '../../components/usersTable/GenericTable.jsx'
import TablePagination from '../../components/tablePagination/TablePagination.jsx'
import AdvancedFilters from '../../components/advancedFilters/AdvancedFilters.jsx'
import TableActions from '../../components/tableActions/TableActions.jsx'
import ModalConfirmDel from '../../modals/ModalConfirmDel.jsx'
import ModalNewEdit from '../../modals/ModalNewEdit.jsx'
import { useToast } from '../../context/ToastContext'

// Importar datos de configuracion de modal
import { docenteFields } from '../../utils/FormConfigs/formConfigs.js'

// Estado inicial para filtros
const initialFilters = []

export default function Docentes() {
    const [tableData, setTableData] = useState([]);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const { showSuccess, showError } = useToast()

    // 1. Inicializamos el Administrador de CRUD
    const {
        editModal, deleteModal,
        openEdit, closeEdit,
        openDelete, closeDelete,
        handleSave, handleDelete
    } = useCrudModalManager({
        createApi: createDocente,
        updateApi: updateDocente,
        deleteApi: deleteDocente,
        setData: setTableData
    });

    // 2. Definición de Columnas
    const columns = useMemo(() => getTableColumns(
        [
            { accessorKey: 'apellido', header: 'Apellido' },
            { accessorKey: 'nombre', header: 'Nombre' },
            {
                accessorKey: 'fec_nac',
                header: 'Fecha Nac.',
                cell: (info) => formatDisplayDate(info.getValue())
            },
            { accessorKey: 'email', header: 'Email' },
            { accessorKey: 'tel_cel', header: 'Tel/Cel' },
        ],
        openDelete,
        openEdit
    ), []);

    // 3. Fetch con paginación server-side
    useEffect(() => {
        const skip = pagination.pageIndex * pagination.pageSize
        const limit = pagination.pageSize
        getDocentes({ params: { skip, limit } })
            .then((res) => {
                const payload = res?.data
                const items = Array.isArray(payload) ? payload : (payload?.data ?? [])
                setTableData(items)
                setTotal(payload?.total ?? items.length)
            })
            .catch(console.error)
    }, [pagination.pageIndex, pagination.pageSize]);

    // 4. Configuración de la tabla (manual pagination — server-side)
    const table = useReactTable({
        data: tableData,
        columns,
        getRowId: (row) => row.id_entidad,
        state: { globalFilter: searchTerm, pagination },
        onGlobalFilterChange: setSearchTerm,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
        rowCount: total,
    });

    return (
        <>

            <CContainer fluid className="py-3">
                <h1>Docentes</h1>
                <CCard className="shadow-sm">
                    <CCardHeader className="bg-white py-3">
                        <CRow className="align-items-center">
                            <CCol>
                                <h4 className="mb-0">Gestión de Docentes</h4>
                            </CCol>
                            <CCol xs="auto">
                                <CButton color="primary" size="sm" onClick={() => openEdit()}>
                                    <CIcon icon={cilPlus} className="me-1" /> Nuevo Docente
                                </CButton>
                            </CCol>
                        </CRow>
                    </CCardHeader>

                    <AdvancedFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                    <TableActions table={table} title="Listado de Docentes" />

                    <CCardBody>
                        <GenericTable table={table} />
                    </CCardBody>

                    <CCardFooter className="bg-white">
                        <TablePagination table={table} />
                    </CCardFooter>
                </CCard>

                {/* Modales Vinculadas al Hook */}
                <ModalNewEdit
                    visible={editModal.visible}
                    onClose={closeEdit}
                    title={editModal.item ? 'Editar Docente' : 'Nuevo Docente'}
                    initialData={editModal.item || { created_at: getTodayDate() }}
                    onSave={handleSave}
                    fields={docenteFields}
                />

                <ModalConfirmDel
                    visible={deleteModal.visible}
                    docente={deleteModal.item}
                    onConfirm={handleDelete}
                    onClose={closeDelete}
                />
            </CContainer>
        </>
    );
}
