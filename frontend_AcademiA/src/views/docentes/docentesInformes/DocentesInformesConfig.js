// frontend_AcademiA\src\views\docentes\docentesInformes\DocentesInformesConfig.js

import { cilChartLine, cilCheckCircle, cilCalendar, cilWarning, cilUser } from '@coreui/icons';

/*
 * CONFIGURACIÓN DEL INFORME
 * Consumido por el motor genérico de informes (InformMain, hooks, etc.)
 * Sin lógica de UI ni llamadas directas a API,solo define "qué mostrar" y "cómo procesar los datos"
 */
export const DocentesInformesConfig = {
    title: "Informes Docentes",
    subtitle: "Reportes y listados",

    // Select principal, para seleccionar tipo de informe
    mainSelector: {
        key: 'tipo_informe',
        label: 'Tipo de Informe',
        options: [
            { label: 'Datos Personales', value: 'docDatos' }
        ]
    },


    // Diccionario de informes. La key es la del Tipo de Informe
    reports: {
        // Configuración de Filtros (para InformConfig.jsx).
        // En "optionValue" y "optionLabel" se indica de dónde va a obtener el select los datos para los parámetros 
        //  "value" y "label" respectivamente.
        //  Si vienen de un endpoint, deben coincidir con el nombre de las propiedades (generalmente id y nombre) devueltos por el JSON desde el Backend.

        //  *******************************************************************
        //  *********** Configuraciòn Informe DatosPersonales Docentes  *********
        //  *******************************************************************

        'docDatos': {
            title: "Datos Docentes",
            subtitle: "Listado de contacto e información de Docentes",
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
                return `http://localhost:8000/api/docentes/`;
            },
            mapper: (item) => item, // Simple,sin calculos para este caso

            summaryCalculator: (list) => {
                // Calculamos cantidad de docentes mostrados
                if (!list) return {};
                return {
                    total: list.length,
                    sinEmail: list.filter(i => !i.email).length
                };
            },

            // Configuración de StatsCards (vía InformMain). Sin filtros.
            stats: [
                { key: 'total', title: 'Total Docentes', color: 'primary' },
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
    },
}

