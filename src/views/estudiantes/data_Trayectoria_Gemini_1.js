// data.js
export const academicData = {
  "2025": {
    summary: { average: 8.9, approved: 6, attendance: "90%", failed: 1 },
    subjects: [
      {
        id: "calc-dif",
        name: "Cálculo Diferencial",
        professor: "Dra. Elena Castro",
        grade: 9.5,
        status: "aprobado", // aprobado, reprobado, pendiente
        details: [
          { name: "Primer Cuatrimestre", grade: 9.0, status: "APROBADO", type: "period" },
          { name: "Segundo Cuatrimestre", grade: 10.0, status: "APROBADO", type: "period" },
          { name: "Recuperatorio Dic.", grade: "N/A", status: "No aplica", type: "info" },
          { name: "Recuperatorio Mar.", grade: "N/A", status: "No aplica", type: "info" },
        ]
      },
      {
        id: "prog-avanzada",
        name: "Programación Avanzada",
        professor: "Ing. Ricardo Gómez",
        grade: 5.8,
        status: "reprobado",
        details: [
          { name: "Primer Cuatrimestre", grade: 5.5, status: "REPROBADO", type: "period" },
          { name: "Segundo Cuatrimestre", grade: 6.0, status: "APROBADO", type: "period" },
          { name: "Recuperatorio Dic.", grade: 5.8, status: "PENDIENTE", type: "warning" },
          { name: "Recuperatorio Mar.", grade: "--", status: "PRÓXIMO", type: "info" },
        ]
      }
    ]
  },
  "2024": {
    summary: { average: 7.5, approved: 8, attendance: "95%", failed: 0 },
    subjects: [
      {
        id: "etica-2024",
        name: "Ética Profesional",
        professor: "Mgtr. Ana Mendieta",
        grade: 7.5,
        status: "aprobado",
        details: [
            { name: "Primer Cuatrimestre", grade: 6.5, status: "APROBADO", type: "period" },
            { name: "Segundo Cuatrimestre", grade: 8.5, status: "APROBADO", type: "period" },
        ]
      }
    ]
  },
  "2023": null // Simula año sin datos
};