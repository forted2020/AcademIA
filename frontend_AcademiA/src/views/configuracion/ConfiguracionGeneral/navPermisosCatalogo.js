// Catálogo de ítems de navegación que el admin puede habilitar/deshabilitar por rol.
// Cada ítem tiene un `key` único que coincide con la clave guardada en configuración.
// `rolesDefault` indica qué roles tienen el ítem habilitado por defecto (igual que _nav.js).

import { ROL_ADMIN, ROL_ALUMNO, ROL_DOCENTE } from '../../../constants/Roles'

export const NAV_CATALOG = [
  {
    grupo: 'General',
    items: [
      {
        key: 'nav_inicio',
        label: 'Inicio',
        descripcion: 'Panel de inicio / dashboard según rol',
        rolesDefault: [ROL_ADMIN, ROL_ALUMNO, ROL_DOCENTE],
      },
    ],
  },
  {
    grupo: 'Usuarios',
    items: [
      {
        key: 'nav_usuarios_gestion',
        label: 'Gestión de Usuarios',
        descripcion: 'Alta, baja y modificación de usuarios del sistema',
        rolesDefault: [ROL_ADMIN],
      },
      {
        key: 'nav_usuarios_informes',
        label: 'Usuarios — Informes',
        descripcion: 'Informes sobre usuarios registrados',
        rolesDefault: [ROL_ADMIN],
      },
    ],
  },
  {
    grupo: 'Cursos',
    items: [
      {
        key: 'nav_cursos_gestion',
        label: 'Gestión de Cursos',
        descripcion: 'Administración de cursos y ciclos lectivos',
        rolesDefault: [ROL_ADMIN, ROL_DOCENTE],
      },
      {
        key: 'nav_materias_gestion',
        label: 'Gestión de Materias',
        descripcion: 'Administración de materias por curso',
        rolesDefault: [ROL_ADMIN, ROL_DOCENTE],
      },
      {
        key: 'nav_cursos_informes',
        label: 'Cursos — Informes',
        descripcion: 'Informes de cursos',
        rolesDefault: [ROL_ADMIN, ROL_DOCENTE],
      },
    ],
  },
  {
    grupo: 'Docentes',
    items: [
      {
        key: 'nav_docentes_gestion',
        label: 'Gestión de Docentes',
        descripcion: 'Alta, baja y modificación de docentes',
        rolesDefault: [ROL_ADMIN],
      },
      {
        key: 'nav_docentes_carga_notas',
        label: 'Carga de Notas',
        descripcion: 'Planilla de carga de calificaciones',
        rolesDefault: [ROL_ADMIN, ROL_DOCENTE],
      },
      {
        key: 'nav_docentes_informes',
        label: 'Docentes — Informes',
        descripcion: 'Informes relacionados a docentes',
        rolesDefault: [ROL_ADMIN, ROL_DOCENTE],
      },
    ],
  },
  {
    grupo: 'Gestión Académica',
    items: [
      {
        key: 'nav_gestion_personal',
        label: 'Gestión de Personal',
        descripcion: 'Administración del personal no docente',
        rolesDefault: [ROL_ADMIN],
      },
      {
        key: 'nav_gestion_asistencia',
        label: 'Asistencia',
        descripcion: 'Registro y consulta de asistencia',
        rolesDefault: [ROL_ADMIN],
      },
      {
        key: 'nav_gestion_inscripcion',
        label: 'Inscripción a ciclo lectivo',
        descripcion: 'Inscripción de alumnos al ciclo activo',
        rolesDefault: [ROL_ADMIN, ROL_DOCENTE],
      },
      {
        key: 'nav_gestion_previas',
        label: 'Materias Previas',
        descripcion: 'Consulta y gestión de materias adeudadas',
        rolesDefault: [ROL_ADMIN, ROL_DOCENTE],
      },
      {
        key: 'nav_gestion_informes',
        label: 'Gestión Académica — Informes',
        descripcion: 'Informes académicos generales',
        rolesDefault: [ROL_ADMIN, ROL_DOCENTE],
      },
    ],
  },
  {
    grupo: 'Estudiantes',
    items: [
      {
        key: 'nav_estudiantes_gestion',
        label: 'Gestión de Estudiantes',
        descripcion: 'Listado y administración de estudiantes',
        rolesDefault: [ROL_ADMIN, ROL_DOCENTE],
      },
      {
        key: 'nav_estudiantes_trayectoria',
        label: 'Trayectoria',
        descripcion: 'Historial académico del estudiante',
        rolesDefault: [ROL_ADMIN, ROL_ALUMNO, ROL_DOCENTE],
      },
      {
        key: 'nav_estudiantes_boletin',
        label: 'Boletín de Calificaciones',
        descripcion: 'Notas del ciclo lectivo actual',
        rolesDefault: [ROL_ADMIN, ROL_ALUMNO, ROL_DOCENTE],
      },
      {
        key: 'nav_estudiantes_planilla',
        label: 'Planilla de Calificaciones',
        descripcion: 'Vista tabular de notas por materia',
        rolesDefault: [ROL_ADMIN, ROL_DOCENTE],
      },
      {
        key: 'nav_estudiantes_asistencia',
        label: 'Informe de Asistencia',
        descripcion: 'Registro de inasistencias del alumno',
        rolesDefault: [ROL_ADMIN, ROL_ALUMNO, ROL_DOCENTE],
      },
      {
        key: 'nav_estudiantes_informes',
        label: 'Estudiantes — Informes',
        descripcion: 'Constancias e informes del alumno',
        rolesDefault: [ROL_ADMIN, ROL_ALUMNO, ROL_DOCENTE],
      },
    ],
  },
  {
    grupo: 'Sistema',
    items: [
      {
        key: 'nav_notificaciones',
        label: 'Notificaciones',
        descripcion: 'Centro de notificaciones del sistema',
        rolesDefault: [ROL_ADMIN, ROL_ALUMNO, ROL_DOCENTE],
      },
    ],
  },
]

// Devuelve el estado por defecto de todos los ítems para un rol dado:
// { [key]: true } para todos los que incluyen ese rol en rolesDefault.
export function getDefaultsParaRol(rol) {
  const resultado = {}
  for (const grupo of NAV_CATALOG) {
    for (const item of grupo.items) {
      resultado[item.key] = item.rolesDefault.includes(rol)
    }
  }
  return resultado
}

// Serializa el mapa de permisos a JSON string para guardar en config.
export const serializePermisos = (mapa) => JSON.stringify(mapa)

// Parsea el JSON string de configuración a mapa { [key]: bool }.
// Donde una clave no aparece en el string guardado, usa el default del catálogo para ese rol.
export function parsePermisos(jsonStr, rol) {
  const defaults = getDefaultsParaRol(rol)
  if (!jsonStr) return defaults
  try {
    const guardado = JSON.parse(jsonStr)
    return { ...defaults, ...guardado }
  } catch {
    return defaults
  }
}
