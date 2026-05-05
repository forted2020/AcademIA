// frontend_AcademiA\src\views\estudiantes\estudiantesInformes\EstudiantesInformesConfig.js

import { cilChartLine, cilCheckCircle, cilCalendar, cilWarning } from '@coreui/icons';

/*
 * CONFIGURACIÓN DEL INFORME
 * Consumido por el motor genérico de informes (InformMain, hooks, etc.)
 * Sin lógica de UI ni llamadas directas a API,solo define "qué mostrar" y "cómo procesar los datos"
 */
export const EstudiantesInformesConfig = {
    title: "Informes Estudiantes",
    subtitle: "Reportes y listados académicos",

    // Campos calculados. Se ejecuta por cada item recibido desde el backend
    // Recibe un item (estudiante) y devuelve el item con campos extra
    mapper: (item) => {
        return {
            ...item, // Mantenemos los datos originales
            // Creamos el CAMPO CALCULADO
            condicion: item.nota >= 7 ? 'Aprobado' : 'No Aprobado',
        };
    },

    // LÓGICA DE CÁLCULOS
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



    // Configuración de Filtros (para InformConfig.jsx). Permite cambiar variantes del informe
    
    tipoInforme: [
        {
            id: 'tipo_informe',
            label: 'Tipo de Informe',
            type: 'select',
            options: [
                { label: 'Aprobados / Desaprobados', value: 'apro' },
                // { label: 'Rendimimiento Académico', value: 'acad' },
                // { label: 'Asistencia Mensual', value: 'asist' }
            ]
        }

    ],


    filtros: [
        {
            id: 'ciclo',
            label: 'Ciclo',
            type: 'select',
            // Endpoint que el componente de filtros usa para cargar opciones
            endpoint: '/combos/ciclo'   // El componente sabrá que debe buscar opciones
        },
        {
            id: 'curso',
            label: 'Curso',
            type: 'select',
            endpoint: '/combos/cursos' 
        },
        {
            id: 'materia',
            label: 'Materia',
            type: 'select',
            endpoint: '/combos/materia'
        },
        {
            id: 'solo_aprobados',
            label: 'Solo Aprobados',
            type: 'checkbox',
            defaultValue: false
        }
    ],

    // EndPoint para traer las notas finales. Recibe los filtros y devuelve la URL. 
    // El motor del informe llama a esta función antes de hacer el fetch
    getEndpoint: (filters) => {
        return `http://localhost:8000/api/notas/curso/${filters.curso}/materia/${filters.materia}/notas-final`;
    },

    // Configuración de Métricas (para StatsCard.jsx vía InformMain)
    stats: [
        { key: 'total', title: 'Total Alumnos', color: 'info' /*, icon: cilCalendar */ },
        { key: 'approved', title: 'Aprobados', color: 'success' /*, icon: cilCheckCircle */ },
        { key: 'failed', title: 'Desaprobados', color: 'danger' /*, icon: cilWarning */ },
        { key: 'average', title: 'Promedio General', color: 'primary' /*, icon: cilChartLine */ },

    ],

    // Configuración de columnas de la Tabla (para PrimeReact DataTable). 
    // Describe cómo renderizar cada campo
    columns: [
        { field: 'alumno', header: 'Alumno', sortable: true, exportable: true },
        {
            field: 'nota',
            header: 'Nota Final',
            sortable: true,
            bodyType: 'badge', // Le dice a la tabla que use Badge
            severity: (val) => val >= 7 ? 'success' : 'danger',
            exportable: true // Asegura que en Excel salga el número y no el componente HTML
        },
        {
            field: 'condicion',
            header: 'Condición',
            sortable: true,
            // bodyType: 'tag', // Estilo tipo etiqueta

        },
        { field: 'observaciones', header: 'Observaciones' }
    ]
};