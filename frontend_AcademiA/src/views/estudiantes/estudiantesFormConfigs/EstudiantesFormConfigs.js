//  frontend_AcademiA\src\views\estudiantes\estudiantesFormConfigs\EstudiantesFormConfigs.js

//  Archivo de configuraci´n de los formularios de las modales.

// Función para obtener la fecha actual en formato YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

// Formateo de Fecha
    const dateBodyTemplate = (rowData) => {
        if (!rowData.fec_nac) return '-'
        const [year, month, day] = rowData.fec_nac.split('-')
        return `${day}/${month}/${year}`
    }

// Campos tabla
//  Configuración de columnas
export const columnsTableEstudiantesConfig = [
    { field: 'apellido', header: 'Apellido', sortable: true, width: '20%' },
    { field: 'nombre', header: 'Nombre', sortable: true, width: '20%' },
    { field: 'fec_nac', header: 'Fecha Nac.', body: dateBodyTemplate, sortable: true, width: '120px' },
    { field: 'email', header: 'Email', sortable: true, width: '25%' },
    { field: 'domicilio', header: 'Domicilio', sortable: false, width: '15%' },
    { field: 'telefono', header: 'Teléfono', sortable: false, width: '140px' },
    
];

// Campos modal Nuevo / Editar. Tienen que coincidir exactamente con el nombre traído de la base.
export const modalNewEditEstudiantesFields = [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: '' },
    { name: 'apellido', label: 'Apellido', type: 'text', required: true, placeholder: '' },
    { name: 'email', label: 'Email', type: 'email', required: false, placeholder: 'ejemplo@mail.com' },
    { name: 'fec_nac', label: 'Fecha de Nacimiento', type: 'date', required: false },
    { name: 'domicilio', label: 'Domicilio', type: 'text', required: false, placeholder: '' },
    { name: 'localidad', label: 'Localidad', type: 'text', required: false },
    { name: 'nacionalidad', label: 'Nacionalidad', type: 'text', required: false },
    { name: 'telefono', label: 'Celular', type: 'text', required: false },
    { name: 'dni', label: 'Documento', type: 'number', required: false, placeholder: 'Ingrese DNI sin puntos' },
    {
        name: 'created_at', label: 'Fecha Alta', type: 'date', required: false,
        defaultValue: getTodayDate(),   // Fecha actual por defecto
        hideOnEdit: false,  //  Visible u Oculto si la modal es de ecición
        readOnlyOnEdit: true    //  Sólo lectura si es en edición
    },

];

