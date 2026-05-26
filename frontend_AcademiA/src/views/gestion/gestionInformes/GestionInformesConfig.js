// frontend_AcademiA/src/views/gestion/gestionInformes/GestionInformesConfig.js
//
// Configuración del módulo "Informes y Listados" (Fase 6). Cada entry de
// `reports` describe un informe: filtros en cascada, endpoint que devuelve los
// datos, calculadora de tarjetas resumen y columnas de la tabla.
//
// Endpoints expuestos por backend_AcademiA/backend-master/Routes/routes_informes.py
// y routes_previas.py.

export const GestionInformesConfig = {
    title: "Informes y Listados",
    subtitle: "Reportes operativos y de gestión académica",

    mainSelector: {
        key: 'tipo_informe',
        label: 'Tipo de Informe',
        options: [
            { label: 'Alumnos por curso',            value: 'alumnos_curso' },
            { label: 'Inscriptos por materia',       value: 'inscriptos_materia' },
            { label: 'Docentes y materias asignadas', value: 'docentes_materias' },
            { label: 'Listado de materias previas',  value: 'previas' },
            { label: 'Riesgo de repitencia',         value: 'riesgo_repitencia' },
        ],
    },

    reports: {
        // ── Padrón por curso ──────────────────────────────────────────────
        alumnos_curso: {
            title: "Alumnos por curso y división",
            subtitle: "Padrón de alumnos inscriptos en un curso",
            filters: [
                {
                    key: 'id_ciclo',
                    label: 'Ciclo Lectivo',
                    type: 'select', required: true,
                    optionValue: 'id_ciclo_lectivo',
                    optionLabel: 'nombre_ciclo_lectivo',
                    endpoint: '/api/ciclos/',
                },
                {
                    key: 'id_curso',
                    label: 'Curso',
                    type: 'select', required: true,
                    dependsOn: 'id_ciclo',
                    optionValue: 'id_curso',
                    optionLabel: 'curso',
                    endpoint: (sel) => `/api/cursos/por_ciclo/${sel.id_ciclo}`,
                },
            ],
            getEndpoint: (f) => f.id_curso ? `/api/informes/alumnos-por-curso/${f.id_curso}` : null,
            // El backend devuelve { alumnos: [...] }: aplanamos para la tabla.
            transformResponse: (data) => data?.alumnos ?? [],
            summaryCalculator: (rows) => ({ total: rows.length }),
            stats: [
                { key: 'total', title: 'Alumnos inscriptos', color: 'primary' },
            ],
            columns: [
                { field: 'apellido', header: 'Apellido', sortable: true },
                { field: 'nombre',   header: 'Nombre',   sortable: true },
                { field: 'dni',      header: 'DNI' },
                { field: 'legajo',   header: 'Legajo' },
            ],
        },

        // ── Inscriptos por materia ────────────────────────────────────────
        inscriptos_materia: {
            title: "Inscriptos por materia",
            subtitle: "Listado de alumnos cursando una materia",
            filters: [
                {
                    key: 'id_ciclo',
                    label: 'Ciclo Lectivo',
                    type: 'select', required: true,
                    optionValue: 'id_ciclo_lectivo',
                    optionLabel: 'nombre_ciclo_lectivo',
                    endpoint: '/api/ciclos/',
                },
                {
                    key: 'id_curso',
                    label: 'Curso',
                    type: 'select', required: true,
                    dependsOn: 'id_ciclo',
                    optionValue: 'id_curso',
                    optionLabel: 'curso',
                    endpoint: (sel) => `/api/cursos/por_ciclo/${sel.id_ciclo}`,
                },
                {
                    key: 'id_materia',
                    label: 'Materia',
                    type: 'select', required: true,
                    dependsOn: 'id_curso',
                    optionValue: 'id_materia',
                    optionLabel: 'nombre_materia',
                    endpoint: (sel) => `/api/materias/curso/${sel.id_curso}`,
                },
            ],
            getEndpoint: (f) => f.id_materia ? `/api/informes/inscriptos-por-materia/${f.id_materia}` : null,
            transformResponse: (data) => data?.alumnos ?? [],
            summaryCalculator: (rows) => ({ total: rows.length }),
            stats: [{ key: 'total', title: 'Alumnos inscriptos', color: 'primary' }],
            columns: [
                { field: 'apellido', header: 'Apellido', sortable: true },
                { field: 'nombre',   header: 'Nombre',   sortable: true },
                { field: 'dni',      header: 'DNI' },
                { field: 'legajo',   header: 'Legajo' },
            ],
        },

        // ── Docentes y materias ───────────────────────────────────────────
        docentes_materias: {
            title: "Docentes y materias asignadas",
            subtitle: "Catálogo de docentes con sus asignaturas",
            filters: [
                {
                    key: 'id_ciclo_lectivo',
                    label: 'Ciclo Lectivo (opcional)',
                    type: 'select', required: false,
                    optionValue: 'id_ciclo_lectivo',
                    optionLabel: 'nombre_ciclo_lectivo',
                    endpoint: '/api/ciclos/',
                },
            ],
            getEndpoint: (f) => {
                const qs = f.id_ciclo_lectivo ? `?id_ciclo_lectivo=${f.id_ciclo_lectivo}` : ''
                return `/api/informes/docentes-materias${qs}`
            },
            transformResponse: (data) => Array.isArray(data) ? data.map((d) => ({
                ...d,
                materias_str: (d.materias || []).join(' • '),
                cantidad: (d.materias || []).length,
            })) : [],
            summaryCalculator: (rows) => ({
                total: rows.length,
                cant_materias: rows.reduce((s, r) => s + (r.cantidad || 0), 0),
            }),
            stats: [
                { key: 'total',         title: 'Docentes',  color: 'primary' },
                { key: 'cant_materias', title: 'Materias asignadas', color: 'info' },
            ],
            columns: [
                { field: 'nombre_completo', header: 'Docente', sortable: true },
                { field: 'cantidad',        header: 'Cant.', sortable: true },
                { field: 'materias_str',    header: 'Materias' },
            ],
        },

        // ── Listado de previas ────────────────────────────────────────────
        previas: {
            title: "Materias previas",
            subtitle: "Inscripciones marcadas como previa",
            filters: [
                {
                    key: 'id_ciclo_lectivo',
                    label: 'Ciclo de origen (opcional)',
                    type: 'select', required: false,
                    optionValue: 'id_ciclo_lectivo',
                    optionLabel: 'nombre_ciclo_lectivo',
                    endpoint: '/api/ciclos/',
                },
            ],
            getEndpoint: (f) => {
                const qs = f.id_ciclo_lectivo ? `?id_ciclo_lectivo=${f.id_ciclo_lectivo}` : ''
                return `/api/previas/${qs}`
            },
            transformResponse: (data) => Array.isArray(data) ? data : [],
            summaryCalculator: (rows) => ({ total: rows.length }),
            stats: [{ key: 'total', title: 'Previas activas', color: 'warning' }],
            columns: [
                { field: 'nombre_alumno',  header: 'Alumno', sortable: true },
                { field: 'nombre_materia', header: 'Materia' },
                { field: 'nombre_ciclo',   header: 'Ciclo origen' },
                { field: 'nota_final',     header: 'Nota final' },
            ],
        },

        // ── Riesgo de repitencia ──────────────────────────────────────────
        riesgo_repitencia: {
            title: "Riesgo de repitencia",
            subtitle: "Alumnos ordenados por cantidad de materias previas",
            filters: [
                {
                    key: 'id_ciclo_lectivo',
                    label: 'Hasta el ciclo (opcional)',
                    type: 'select', required: false,
                    optionValue: 'id_ciclo_lectivo',
                    optionLabel: 'nombre_ciclo_lectivo',
                    endpoint: '/api/ciclos/',
                },
            ],
            getEndpoint: (f) => {
                const qs = f.id_ciclo_lectivo ? `?id_ciclo_lectivo=${f.id_ciclo_lectivo}` : ''
                return `/api/informes/riesgo-repitencia${qs}`
            },
            transformResponse: (data) => Array.isArray(data) ? data.map((d) => ({
                ...d,
                materias_str: (d.materias || []).join(' • '),
            })) : [],
            summaryCalculator: (rows) => ({
                alumnos: rows.length,
                criticos: rows.filter((r) => (r.cantidad_previas || 0) >= 3).length,
            }),
            stats: [
                { key: 'alumnos',  title: 'Alumnos con previas', color: 'warning' },
                { key: 'criticos', title: 'Con 3 o más previas',  color: 'danger'  },
            ],
            columns: [
                { field: 'nombre_completo',  header: 'Alumno', sortable: true },
                { field: 'cantidad_previas', header: 'Previas', sortable: true },
                { field: 'materias_str',     header: 'Materias' },
            ],
        },
    },
}
