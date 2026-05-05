// frontend_AcademiA\src\views\estudiantes\estudiantesInformes\EstudiantesInformesConfig.js

import { cilChartLine, cilCheckCircle, cilCalendar, cilWarning, cilUser } from '@coreui/icons';

/*
 * CONFIGURACIÓN DEL INFORME
 * Consumido por el motor genérico de informes (InformMain, hooks, etc.)
 * Sin lógica de UI ni llamadas directas a API,solo define "qué mostrar" y "cómo procesar los datos"
 */
export const EstudiantesInformesConfig = {
    title: "Informes Estudiantes",
    subtitle: "Reportes y listados académicos",

    // Select principal, para seleccionar tipo de informe
    mainSelector: {
        key: 'tipo_informe',
        label: 'Tipo de Informe',
        options: [
            { label: 'Aprobados / Desaprobados', value: 'apro' },
            { label: 'Datos Personales', value: 'estuDatos' }
        ]
    },



    // Diccionario de informes. La key es la del Tipo de Informe
    reports: {

        // Configuración de Filtros (para InformConfig.jsx).
        // En "optionValue" y "optionLabel" se indica de dónde va a obtener el select los datos para los parámetros 
        //  "value" y "label" respectivamente.
        //  Si vienen de un endpoint, deben coincidir con el nombre de las propiedades (generalmente id y nombre) devueltos por el JSON desde el Backend.


        //  *******************************************************************
        //  *********** Configuraciòn filtro Aprobados / Desaprobados *********
        //  *******************************************************************

        'apro': {
            title: "Informe Rendimiento",
            subtitle: "Aprobados y Desaprobados por Materia",

            // Filtros específicos para este informe
            filters: [
                {
                    key: 'ciclo',
                    label: 'Ciclo',
                    type: 'select',
                    // dependsOn: 'tipo_informe',
                    optionValue: 'id_ciclo_lectivo',
                    optionLabel: 'nombre_ciclo_lectivo',
                    // Endpoint que el componente de filtros usa para cargar opciones
                    endpoint: 'api/ciclos/'
                },
                {
                    key: 'curso',
                    label: 'Curso',
                    type: 'select',
                    dependsOn: 'ciclo',
                    optionValue: 'id_curso',
                    optionLabel: 'curso',
                    endpoint: (sel) => `api/cursos/por_ciclo/${sel.ciclo}`,
                },
                {
                    key: 'materia',
                    label: 'Materia',
                    type: 'select',
                    dependsOn: 'curso',
                    optionValue: 'id_materia',
                    optionLabel: 'nombre_materia',
                    endpoint: (sel) => `api/materias/curso/${sel.curso}/simple`,
                },
                /* 
                 {
                     key: 'solo_aprobados',
                     label: 'Solo Aprobados',
                     type: 'checkbox',
                     dependsOn: 'materia',
                     defaultValue: false
                 }
                */
            ],

            // EndPoint para traer las notas finales. Recibe los filtros y devuelve la URL. 
            getEndpoint: (filters) => {
                if (!filters.curso || !filters.materia) return null;
                return `http://localhost:8000/api/notas/curso/${filters.curso}/materia/${filters.materia}/notas-final`;
            },

            // Campos calculados. Se ejecuta por cada item recibido desde el backend
            // Recibe un item (estudiante) y devuelve el item con campos extra
            mapper: (item) => {
                return {
                    ...item, // Mantenemos los datos originales
                    // Agregamos el campo calculado "condicion"
                    condicion: item.nota >= 7 ? 'Aprobado' : 'No Aprobado',
                };
            },

            // Lógica de cálculos, para usar en tarjetas, etc.
            // Recibe la lista procesada (mapeada y filtrada) y devuelve el objeto summary
            summaryCalculator: (list) => {
                if (!list || list.length === 0) return {};

                // Calcular Promedio
                const totalNotas = list.reduce((acc, curr) => acc + curr.nota, 0); // Asumimos que 'nota' es numérico
                const promedio = (totalNotas / list.length).toFixed(2); // Formateado a 2 decimales

                // Contar Aprobados (Nota >= 7)
                const aprobados = list.filter(i => i.nota >= 7).length;

                // Contar Reprobados
                const reprobados = list.length - aprobados;

                // Deben coincidir con las keys definidas en "stats"
                return {
                    average: promedio,
                    approved: aprobados,
                    failed: reprobados,
                    total: list.length
                };
            },

            // Configuración de StatsCards (vía InformMain)
            stats: [
                {
                    key: 'total', title: 'Total Alumnos', color: 'info', /*, icon: cilCalendar */
                    filter: {
                        // Al hacer click en la tarjeta, muestra todos
                        field: 'nota',
                        // Para mostrar todos. "val" representa el valor de la nota de cada fila.
                        isMatch: (val) => val >= 0
                    }
                },
                {
                    key: 'approved', title: 'Aprobados', color: 'success', /* icon: cilCheckCircle */
                    filter: {
                        // Al hacer click en la tarjeta, filtra en la tabla 'condicion'= 'Aprobado'
                        field: 'condicion', value: 'Aprobado'
                    }
                },
                {
                    key: 'failed', title: 'Desaprobados',
                    color: 'danger', /* icon: cilWarning */
                    filter: {
                        field: 'condicion', value: 'No Aprobado'
                    }
                },
                { key: 'average', title: 'Promedio General', color: 'primary' /*, icon: cilChartLine */ },
            ],

            // Configuración de columnas de la Tabla (para PrimeReact DataTable). 
            // Describe cómo renderizar cada campo
            columns: [
                { field: 'alumno', header: 'Alumno', sortable: true,  exportable: true },
                {
                    field: 'nota', header: 'Nota Final', sortable: true, align:'center',
                    // bodyType: 'badge', // Le dice a la tabla que use Badge
                    severity: (val) => val >= 7 ? 'success' : 'danger',
                    exportable: true // Asegura que en Excel salga el número y no el componente HTML
                },
                {
                    field: 'condicion', header: 'Condición', sortable: true,
                    // bodyType: 'tag', // Estilo tipo etiqueta
                },
                { field: 'observaciones', header: 'Observaciones' }
            ]
        },

        //  *******************************************************************
        //  *********** Configuraciòn Informe DatosPersonales Alumnos *********
        //  *******************************************************************

        'estuDatos': {
            title: "Datos Personales",
            subtitle: "Listado de contacto e información de alumnos",
            filters: [
                {
                    key: 'ciclo', label: 'Ciclo', type: 'select',
                    optionValue: 'id_ciclo_lectivo', optionLabel: 'nombre_ciclo_lectivo',
                    endpoint: 'api/ciclos/'
                },
                {
                    key: 'curso', label: 'Curso', type: 'select',
                    dependsOn: 'ciclo', optionValue: 'id_curso', optionLabel: 'curso',
                    endpoint: (sel) => `api/cursos/por_ciclo/${sel.ciclo}`,
                }
            ],

            // Endpoint 
            getEndpoint: (filters) => {
                if (!filters.curso) return null;
                return `http://localhost:8000/api/estudiantes/curso/${filters.curso}`;
            },
            mapper: (item) => item, // Simple,sin calculos para este caso

            summaryCalculator: (list) => {
                // Calculamos cantidad de alumnos
                if (!list) return {};
                return {
                    total: list.length,
                    sinEmail: list.filter(i => !i.email).length
                };
            },

            stats: [
                { key: 'total', title: 'Total Alumnos', color: 'primary' },
                { key: 'sinEmail', title: 'Sin Email', color: 'warning' }
            ],

            columns: [
                { field: 'apellido', header: 'Apellido', sortable: true },
                { field: 'nombre', header: 'Nombre', sortable: true },
                { field: 'dni', header: 'DNI' },
                { field: 'email', header: 'Email' },
                { field: 'telefono', header: 'Teléfono' }
            ]
        }
    }
};
