// frontend_AcademiA\src\views\gestion\inscripciones\InscripcionesConfig.jsx

export const InscripcionesConfig = {
    title: "Inscripciones",
    subtitle: "Gestión de matriculación a cursos y materias",

    mainSelector: {
        key: 'modo_inscripcion',
        label: 'Tipo de Inscripción',
        options: [
            { label: 'Inscripción a Ciclo Lectivo', value: 'curso_masivo' },
        ]
    },

    configs: {
        'curso_masivo': {
            title: "Inscripción por Curso",
            subtitle: "Promoción de alumnos de un ciclo lectivo al siguiente",

            filters: [
                // — ORIGEN —
                {
                    key: 'ciclo_origen', label: 'Ciclo Lectivo', type: 'select',
                    group: 'origen',
                    endpoint: 'api/ciclos/',
                    optionValue: 'id_ciclo_lectivo', optionLabel: 'nombre_ciclo_lectivo',
                },
                {
                    key: 'curso_origen', label: 'Curso', type: 'select',
                    group: 'origen',
                    dependsOn: 'ciclo_origen',
                    endpoint: (sel) => `api/cursos/por_ciclo/${sel.ciclo_origen}`,
                    optionValue: 'id_curso', optionLabel: 'curso',
                },

                // — DESTINO —
                {
                    key: 'ciclo_destino', label: 'Ciclo Lectivo', type: 'select',
                    group: 'destino',
                    endpoint: 'api/ciclos/',
                    optionValue: 'id_ciclo_lectivo', optionLabel: 'nombre_ciclo_lectivo',
                },
                {
                    key: 'curso_destino', label: 'Curso', type: 'select',
                    group: 'destino',
                    dependsOn: 'ciclo_destino',
                    endpoint: (sel) => `api/cursos/por_ciclo/${sel.ciclo_destino}`,
                    optionValue: 'id_curso', optionLabel: 'curso',
                },
                {
                    key: 'id_tipo_insc', label: 'Tipo de Inscripción', type: 'select',
                    group: 'destino',
                    endpoint: 'api/inscripciones/tipos/',
                    optionValue: 'id_tipo_insc', optionLabel: 'nombre_tip_insc',
                },
            ],

            // Carga alumnos del curso origen (filtrado correcto)
            getSourceEndpoint: (filters) => {
                if (!filters.curso_origen) return null
                return `api/estudiantes/curso/${filters.curso_origen}`
            },

            // Endpoint para saber qué alumnos ya están inscriptos en el destino
            getYaInscriptosEndpoint: (filters) => {
                if (!filters.curso_destino || !filters.ciclo_destino) return null
                return `api/inscripciones/ya-inscriptos?id_curso=${filters.curso_destino}&id_ciclo_lectivo=${filters.ciclo_destino}`
            },

            postEndpoint: 'api/inscripciones/inscribir-lote',

            pickListConfig: {
                dataKey: 'id_entidad',
                headerSource: 'Alumnos del curso origen',
                headerTarget: 'A inscribir en destino',
            },
        }
    }
}
