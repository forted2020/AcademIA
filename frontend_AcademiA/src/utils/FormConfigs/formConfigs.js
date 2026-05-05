//  frontend_AcademiA\src\utils\FormConfigs\formConfigs.js

//  Archivo de configuraci´n de los formularios de las modales.

// Función para obtener la fecha actual en formato YYYY-MM-DD
const getTodayDate = () => new Date().toISOString().split('T')[0];

export const estudiantesFields = [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: '' },
    { name: 'apellido', label: 'Apellido', type: 'text', required: true, placeholder: '' },
    { name: 'email', label: 'Email', type: 'email', required: false, placeholder: 'ejemplo@mail.com' },
    { name: 'fec_nac', label: 'Fecha de Nacimiento', type: 'date', required: false },
    { name: 'domicilio', label: 'Domicilio', type: 'text', required: false, placeholder: '' },
    { name: 'localidad', label: 'Localidad', type: 'text', required: true },
    { name: 'nacionalidad', label: 'Nacionalidad', type: 'text', required: true },
    { name: 'cel', label: 'Celular', type: 'text', required: false },
    { name: 'dni', label: 'Documento', type: 'number', required: true, placeholder: 'Ingrese DNI sin puntos' },
    {
        name: 'created_at', label: 'Fecha Alta', type: 'date', required: true,
        defaultValue: getTodayDate(),   // Fecha actual por defecto
        hideOnEdit: false,  //  Visible u Oculto si la modal es de ecición
        readOnlyOnEdit: true    //  Sólo lectura si es en edición
    },
    
];

export const docenteFields = [
    { name: 'apellido', label: 'Apellido', type: 'text', required: true },
    { name: 'nombre', label: 'Nombre', type: 'text', required: true },
    { name: 'fec_nac', label: 'Fecha de Nacimiento', type: 'date', required: true },
    { name: 'domicilio', label: 'Domicilio', type: 'text', required: true },
    { name: 'localidad', label: 'Localidad', type: 'text', required: true },
    { name: 'nacionalidad', label: 'Nacionalidad', type: 'text', required: true },
    { name: 'cel', label: 'Celular', type: 'text', required: false },
    { name: 'email', label: 'Correo Electrónico', type: 'email' },
    { name: 'dni', label: 'Documento', type: 'number', required: true, placeholder: 'Ingrese número sin puntos' },
    {
        name: 'created_at', label: 'Fecha Alta', type: 'date', required: true,
        defaultValue: getTodayDate(),   // Fecha actual por defecto
        hideOnEdit: false,  //  Visible u Oculto si la modal es de ecición
        //readOnlyOnEdit: true    //  Sólo lectura si es en edición
    },
];

export const materiaFields = [
    { name: 'nombre_materia', label: 'Nombre de Materia', type: 'text', required: true, fullWidth: true },
    { name: 'id_curso', label: 'Curso Asignado', type: 'select', options: [] /* Se llenará desde API */ }
];