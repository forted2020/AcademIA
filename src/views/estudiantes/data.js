// data.js

export const academicData = {
  // --- DATOS DEL AÑO ACTUAL (2025) ---
  "2025": {
    // Resumen General (Para las tarjetas KPI)
    summary: {
      average: 8.9,
      approved: 6,
      attendance: "90%",
      failed: 1
    },

    // Detalle de Asistencias (Para la sección colapsable)
    attendance: {
      totalDaysLost: 10.5,
      justifiedDays: 6.0,
      detailedRecords: [
        {
          date: "15/03/2025",
          type: "Completa",
          value: 1.0,
          justified: true,
          reason: "Exámenes médicos de rutina."
        },
        {
          date: "01/04/2025",
          type: "Media",
          value: 0.5,
          justified: false,
          reason: "Llegada tarde por tráfico."
        },
        {
          date: "10/05/2025",
          type: "Cuarta",
          value: 0.25,
          justified: true,
          reason: "Permiso de salida anticipada."
        },
        {
          date: "03/06/2025",
          type: "Completa",
          value: 1.0,
          justified: true,
          reason: "Licencia por enfermedad (Día 1)."
        },
        {
          date: "04/06/2025",
          type: "Completa",
          value: 1.0,
          justified: true,
          reason: "Licencia por enfermedad (Día 2)."
        },
        {
          date: "05/06/2025",
          type: "Completa",
          value: 1.0,
          justified: true,
          reason: "Licencia por enfermedad (Día 3)."
        },
        {
          date: "10/09/2025",
          type: "Media/Completa",
          value: 1.75,
          justified: true,
          reason: "Emergencia familiar documentada."
        },
        {
          date: "20/09/2025 - 23/09/2025",
          type: "Múltiple",
          value: 4.0,
          justified: false,
          reason: "Ausencia sin justificación formal."
        },
      ]
    },

    // Detalle de Asignaturas
    subjects: [
      {
        id: "calc-dif",
        name: "Cálculo Diferencial",
        professor: "Dra. Elena Castro",
        grade: 9.5,
        status: "aprobado",
        details: [
          {
            name: "1er Trimestre", grade: 9.2, status: "APROBADO", evaluacion: [
              {nomeval: "1er Exámen", notaeval: '8'},
              {nomeval: "2do Exámen", notaeval: '5.5'},
              {nomeval: "Trabajo Práctico", notaeval: '7'},
            ]
          },


          { name: "Trabajo Práctico", grade: 9.8, status: "APROBADO" },
          { name: "Examen Final", grade: 9.5, status: "APROBADO" },
        ],



      },
      {
        id: "prog-avanzada",
        name: "Programación Avanzada",
        professor: "Ing. Ricardo Gómez",
        grade: 5.8,
        status: "reprobado",
        details: [
          { name: "1er Parcial", grade: 4.0, status: "REPROBADO" },
          { name: "Trabajo Práctico", grade: 8.5, status: "APROBADO" },
          { name: "Recuperatorio", grade: 5.8, status: "PENDIENTE" },
        ]
      }
    ]
  },

  // --- DATOS DEL AÑO ANTERIOR (2024) ---
  "2024": {
    summary: {
      average: 7.5,
      approved: 8,
      attendance: "95%",
      failed: 0
    },

    // Para años anteriores, se asume que el detalle de asistencia no está disponible.
    attendance: null,

    subjects: [
      {
        id: "etica",
        name: "Ética Profesional",
        professor: "Mgtr. Ana Mendieta",
        grade: 7.5,
        status: "aprobado",
        details: [
          { name: "Examen Único", grade: 7.5, status: "APROBADO" },
        ]
      }
    ]
  },

  // --- DATOS DEL AÑO ANTERIOR (2023) ---
  "2023": {
    summary: {
      average: 6.9,
      approved: 7,
      attendance: "85%",
      failed: 2
    },
    attendance: null,
    subjects: [] // Sin detalle de materias para este ejemplo.
  }
};