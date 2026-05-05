// Archivo genérico de configuración de informes


export const EntidadInformesConfig = {
    title: "Título del Módulo (ej. Gestión de Pagos)",
    subtitle: "Subtítulo descriptivo",

    // 1. Selector Maestro: Define qué reportes hay disponibles
    mainSelector: {
        key: 'tipo_informe',
        label: 'Tipo de Reporte',
        options: [
            { label: 'Nombre Reporte A', value: 'reporte_A' },
            { label: 'Nombre Reporte B', value: 'reporte_B' }
        ]
    },

    // 2. Definición de cada Reporte
    reports: {
        'reporte_A': {
            title: "Título del Reporte A",
            subtitle: "Descripción del Reporte A",
            
            // A. DEFINICIÓN DE FILTROS (Cascada)
            filters: [
                {
                    key: 'filtro_padre',      // Nombre del parámetro para la API
                    label: 'Filtro Padre',    // Lo que ve el usuario
                    type: 'select',
                    required: true,           // ¿Es obligatorio para buscar?
                    optionValue: 'id',        // Campo del JSON backend para el value
                    optionLabel: 'nombre',    // Campo del JSON backend para el texto
                    endpoint: 'api/entidad_padre/' // URL estática
                },
                {
                    key: 'filtro_hijo',
                    label: 'Filtro Hijo (Dependiente)',
                    type: 'select',
                    dependsOn: 'filtro_padre', // <--- IMPORTANTE: ID del padre
                    optionValue: 'id',
                    optionLabel: 'descripcion',
                    // Endpoint dinámico: recibe 'sel' con la selección actual
                    endpoint: (sel) => `api/entidad_hija/por_padre/${sel.filtro_padre}`
                }
            ],

            // B. ENDPOINT DE RESULTADOS
            // Retorna NULL si faltan datos, o la URL si está listo.
            getEndpoint: (filters) => {
                if (!filters.filtro_hijo) return null;
                return `api/reportes/mi_reporte/${filters.filtro_hijo}`;
            },

            // C. CALCULADORA DE TARJETAS (Resumen)
            summaryCalculator: (data) => {
                if (!data) return {};
                return {
                    total: data.length,
                    condicion_x: data.filter(item => item.activo).length
                };
            },
            
            // D. VISUALIZACIÓN DE TARJETAS
            stats: [
                { key: 'total', title: 'Total Registros', color: 'primary' },
                { key: 'condicion_x', title: 'Activos', color: 'success' }
            ],

            // E. COLUMNAS DE LA TABLA
            // 'field' debe coincidir exactamente con el JSON del Backend
            columns: [
                { field: 'id', header: 'ID', sortable: true },
                { field: 'nombre', header: 'Nombre' },
                { field: 'fecha', header: 'Fecha' },
                { field: 'monto', header: 'Importe' }
            ]
        }
    }
};
