// src/config/student.config.js
// Archivo de configuración modular para la entidad Estudiante

// Importar las dependencias específicas de la entidad (API y Columnas)
import apiEstudiantes from '../api/apiEstudiantes.js'; 
import { getEstudiantesColumns } from '../utils/columns.js';


/**
 * Definición de la API y el Getter de Columnas para el Hook CRUD
 */
export const studentApi = apiEstudiantes;
export const studentColumnsGetter = getEstudiantesColumns;


/**
 * Opciones de Campos para el Formulario (ModalNewEdit)
 */
export const studentFormFields = [
    { name: 'nombre', label: 'Nombre', type: 'text', required: true, placeholder: 'Ejemplo: Carlos' },
    { name: 'apellido', label: 'Apellido', type: 'text', required: true, placeholder: 'Ejemplo: Pérez' },
    { name: 'email', label: 'Email', type: 'email', required: false, placeholder: 'ejemplo@mail.com' },
    { name: 'fec_nac', label: 'Fecha de Nacimiento', type: 'date', required: false },
    { name: 'domicilio', label: 'Domicilio', type: 'text', required: false, placeholder: 'Calle 123' },
    { name: 'telefono', label: 'Teléfono', type: 'tel', required: false, placeholder: '1234567890' },
    // Añadida la propiedad 'hideOnEdit' para UX: no mostrar el campo Password al editar
    { name: 'password', label: 'Contraseña', type: 'password', required: false, placeholder: 'Solo si se crea usuario', fullWidth: true, hideOnEdit: true },
];

/**
 * Opciones de Filtros Avanzados
 */
export const studentFilterOptions = [
    { value: 'nombre', label: 'Nombre' },
    { value: 'apellido', label: 'Apellido' },
    { value: 'email', label: 'Email' },
    { value: 'domicilio', label: 'Domicilio' },
    { value: 'telefono', label: 'Teléfono' },
];

/**
 * Metadatos de la Entidad (Para mejorar la UX y reusabilidad)
 */
export const studentMetadata = {
    title: 'Estudiantes',
    subtitle: 'Administración de alumnos del establecimiento.',
    entityName: 'Estudiante', // Usado para el botón "Nuevo Estudiante"
};
