// templates/datosMuestra.js
// Datos ficticios para poblar el preview de cada tipo de documento sin llamar al backend.

export const datosMuestra = {

  boletin: {
    nombreEstudiante: 'García, Juan Martín',
    cicloNombre: 'Ciclo Lectivo 2025',
    columnas: [
      { id_tipo_nota: 1, label: '1er Trim.' },
      { id_tipo_nota: 2, label: '2do Trim.' },
      { id_tipo_nota: 3, label: '3er Trim.' },
      { id_tipo_nota: 4, label: 'Final' },
    ],
    filas: [
      { id_materia: 1, nombre_materia: 'Matemática',         calificaciones: { 1: 7, 2: 8, 3: 9, 4: null }, promedio: 8.0 },
      { id_materia: 2, nombre_materia: 'Lengua y Literatura', calificaciones: { 1: 6, 2: 7, 3: 8, 4: null }, promedio: 7.0 },
      { id_materia: 3, nombre_materia: 'Historia',            calificaciones: { 1: 9, 2: 9, 3: 8, 4: null }, promedio: 8.7 },
      { id_materia: 4, nombre_materia: 'Geografía',           calificaciones: { 1: 5, 2: 6, 3: 7, 4: null }, promedio: 6.0 },
      { id_materia: 5, nombre_materia: 'Física',              calificaciones: { 1: 4, 2: 5, 3: 6, 4: null }, promedio: 5.0 },
      { id_materia: 6, nombre_materia: 'Química',             calificaciones: { 1: 8, 2: 7, 3: 8, 4: null }, promedio: 7.7 },
    ],
  },

  acta_examen: {
    nombreMateria: 'Matemática',
    nombreCurso: '3° A',
    cicloNombre: 'Ciclo Lectivo 2025',
    columnas: [
      { id_tipo_nota: 1, label: '1er Trim.' },
      { id_tipo_nota: 2, label: '2do Trim.' },
      { id_tipo_nota: 3, label: '3er Trim.' },
    ],
    filas: [
      { id_entidad: 1, nombre_completo: 'García, Juan',     calificaciones: { 1: 7, 2: 8, 3: 9 }, promedio: 8.0,  definitiva: 8 },
      { id_entidad: 2, nombre_completo: 'López, María',     calificaciones: { 1: 6, 2: 6, 3: 7 }, promedio: 6.3,  definitiva: 6 },
      { id_entidad: 3, nombre_completo: 'Martínez, Pedro',  calificaciones: { 1: 4, 2: 5, 3: 5 }, promedio: 4.7,  definitiva: 5 },
      { id_entidad: 4, nombre_completo: 'Rodríguez, Ana',   calificaciones: { 1: 9, 2: 9, 3: 10 }, promedio: 9.3, definitiva: 9 },
      { id_entidad: 5, nombre_completo: 'Fernández, Luis',  calificaciones: { 1: 3, 2: 4, 3: 4 }, promedio: 3.7,  definitiva: 4 },
    ],
  },

  informe_asistencia: {
    nombreEstudiante: 'García, Juan Martín',
    anio: 2025,
    resumen: { total: 18, justificadas: 5, injustificadas: 13 },
    detalle: [
      { fecha: '2025-03-15', tipo: 'Completa', valor: 1, justificada: false, motivo: '' },
      { fecha: '2025-03-22', tipo: 'Media',    valor: 0.5, justificada: true,  motivo: 'Turno médico' },
      { fecha: '2025-04-10', tipo: 'Completa', valor: 1, justificada: false, motivo: '' },
      { fecha: '2025-04-18', tipo: 'Completa', valor: 1, justificada: true,  motivo: 'Enfermedad con certificado' },
      { fecha: '2025-05-05', tipo: 'Completa', valor: 1, justificada: false, motivo: '' },
      { fecha: '2025-05-20', tipo: 'Media',    valor: 0.5, justificada: false, motivo: '' },
      { fecha: '2025-06-02', tipo: 'Completa', valor: 1, justificada: false, motivo: '' },
    ],
  },
}
