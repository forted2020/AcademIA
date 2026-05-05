// Ejemplo de archivo de configuración de informes (con informes para Alumnos)

/* * CONFIGURACIÓN DE INFORMES DE ALUMNOS
 */
export const AlumnosInformesConfig = {
    title: "Informes de Estudiantes",
    subtitle: "Gestión de matrículas y legajos",

    // 1. SELECTOR PRINCIPAL (¿Qué tipo de informe quiere?)
    mainSelector: {
        key: 'tipo_informe',
        label: 'Tipo de Reporte',
        options: [
            { label: 'Listado por Curso', value: 'aluListado' },
            { label: 'Situación Académica', value: 'aluSituacion' } // Ejemplo futuro
        ]
    },

    // 2. DICCIONARIO DE REPORTES
    reports: {
        
        // --- CONFIGURACIÓN REPORTE: LISTADO POR CURSO ---
        'aluListado': {
            title: "Listado de Alumnos",
            subtitle: "Estudiantes matriculados en un curso específico",
            
            // A. FILTROS (Aquí defines la cascada)
            filters: [
                {
                    key: 'ciclo', 
                    label: 'Ciclo Lectivo', 
                    type: 'select',
                    required: true, // Obligatorio
                    optionValue: 'id_ciclo', 
                    optionLabel: 'nombre',
                    endpoint: 'api/ciclos/' // Endpoint estático
                },
                {
                    key: 'curso', 
                    label: 'Curso', 
                    type: 'select',
                    required: true,
                    dependsOn: 'ciclo', // <--- DEPENDENCIA CLAVE
                    optionValue: 'id_curso', 
                    optionLabel: 'nombre_curso',
                    // Endpoint dinámico: usa el valor del padre (sel.ciclo)
                    endpoint: (sel) => `api/cursos/por_ciclo/${sel.ciclo}` 
                }
            ],

            // B. ENDPOINT FINAL (La URL de la tabla de resultados)
            getEndpoint: (filters) => {
                // Solo devolvemos URL si tenemos el curso seleccionado
                if (!filters.curso) return null;
                return `api/alumnos/por_curso/${filters.curso}`;
            },

            // C. CALCULADORA DE TARJETAS (Resumen arriba de la tabla)
            summaryCalculator: (data) => {
                if (!data) return {};
                return {
                    total: data.length,
                    activos: data.filter(a => a.estado === 'ACTIVO').length
                };
            },
            
            // D. DEFINICIÓN VISUAL DE TARJETAS
            stats: [
                { key: 'total', title: 'Total Alumnos', color: 'primary' },
                { key: 'activos', title: 'Regulares', color: 'success' }
            ],

            // E. COLUMNAS DE LA TABLA
            // "field" debe coincidir con las claves del JSON que manda Python
            columns: [
                { field: 'legajo', header: 'Legajo', sortable: true },
                { field: 'apellido', header: 'Apellido', sortable: true },
                { field: 'nombre', header: 'Nombre' },
                { field: 'documento', header: 'DNI' },
                { field: 'estado', header: 'Estado' }
            ]
        }
    }
};