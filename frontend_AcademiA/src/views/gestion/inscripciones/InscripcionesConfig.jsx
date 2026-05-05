// frontend_AcademiA\src\views\gestion\inscripciones\InscripcionesConfig.jsx

export const InscripcionesConfig = {
    title: "Inscripciones",
    subtitle: "Gestión de matriculación a cursos y materias",

    // Selector principal (para futuras expansiones, ej: Inscripción a Exámenes Finales)
    mainSelector: {
        key: 'modo_inscripcion',
        label: 'Tipo de Inscripción',
        options: [
            { label: 'Inscripción a Ciclo Lectivo', value: 'curso_masivo' },
            { label: 'Inscripción a exámen', value: 'examen' }
        ]
    },

    configs: {
        'curso_masivo': {
            title: "Inscripción por Curso",
            subtitle: "Promoción de alumnos de un ciclo lectivo al siguiente",
            
            // Definimos los filtros que se renderizarán arriba del PickList
            filters: [
                // --- GRUPO: ORIGEN (De dónde saco los alumnos) ---
                {
                    key: 'ciclo_origen', label: 'Ciclo Lectivo (Origen)', type: 'select',
                    endpoint: 'api/ciclos/', optionValue: 'id_ciclo_lectivo', optionLabel: 'nombre_ciclo_lectivo'
                },
                {
                    key: 'curso_origen', label: 'Curso (Origen)', type: 'select',
                    dependsOn: 'ciclo_origen', // Se recarga cuando cambia el ciclo origen
                    endpoint: (sel) => `api/cursos/por_ciclo/${sel.ciclo_origen}`,
                    optionValue: 'id_curso', optionLabel: 'curso'
                },

                // --- GRUPO: DESTINO (A dónde van y con qué datos) ---
                {
                    key: 'ciclo_destino', label: 'Ciclo Lectivo (Destino)', type: 'select',
                    endpoint: 'api/ciclos/', optionValue: 'id_ciclo_lectivo', optionLabel: 'nombre_ciclo_lectivo'
                },
                {
                    key: 'curso_destino', label: 'Curso (Destino)', type: 'select',
                    dependsOn: 'ciclo_destino',
                    endpoint: (sel) => `api/cursos/por_ciclo/${sel.ciclo_destino}`,
                    optionValue: 'id_curso', optionLabel: 'curso'
                },
                {
                    key: 'id_tipo_insc', label: 'Tipo Inscripción', type: 'select',
                    // Asumimos un endpoint para traer tipos (Cursado, Libre, Oyente...)
                    endpoint: 'api/tipos-inscripcion/', 
                    optionValue: 'id_tipo_insc', optionLabel: 'nombre_tip_insc'
                }
            ],

            // 1. GET: Traer alumnos "aptos" del curso origen
            // El backend debe devolver un array de objetos con { id_entidad, nombre, apellido, dni, ... }
            getSourceEndpoint: (filters) => {
                if (!filters.curso_origen) return null;
                // return `api/estudiantes/curso/${filters.curso_origen}`;
                return `api/estudiantes/`;
            },

            // 2. POST: Endpoint que recibe la lista y hace los INSERTS en t_inscripciones
            postEndpoint: 'api/inscripciones/inscribir-lote',

            // 3. Config visual del PickList (PrimeReact)
            pickListConfig: {
                dataKey: 'id_entidad', // Campo único del alumno (según tu tabla t_inscripciones usa id_entidad)
                headerSource: 'Alumnos Disponibles (Origen)',
                headerTarget: 'A Inscribir (Destino)'
            }
        }
    }
};