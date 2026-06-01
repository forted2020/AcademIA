// templates/index.js
// Catálogo central de tipos de documentos disponibles en el sistema.
//
// Para agregar un nuevo tipo de formato:
//   1. Crear el archivo  <nombre>.template.js  con el objeto template
//   2. Importarlo acá y agregarlo al array TEMPLATES_REGISTRO
//   El dropdown, el formulario, el preview y el guardado funcionan automáticamente.

import { boletinTemplate } from './boletin.template'
import { actaExamenTemplate } from './actaExamen.template'
import { informeAsistenciaTemplate } from './informeAsistencia.template'

export const TEMPLATES_REGISTRO = [
  boletinTemplate,
  actaExamenTemplate,
  informeAsistenciaTemplate,
]

// Acceso rápido por código
export const getTemplate = (codigo) =>
  TEMPLATES_REGISTRO.find((t) => t.codigo === codigo) ?? null
