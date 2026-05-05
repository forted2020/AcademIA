// src/views/estudiantes/GradesSection.jsx

// Recibe el año y id_alumno de Trayectoria.jsx, busca los datos fijos y mapea los SubjectCard.

import React, { useState } from 'react';
import SubjectCard from '../../components/subjectCard/SubjectCard';
import { useMateriasCicloEstudiante } from '../../hooks/useMateriasCicloEstudiante'

const GradesSection = ({ ciclo: id_ciclo, id_alumno }) => {     // Uso el alias id_ciclo para más claridad}

    console.log("🔍 Parámetros al montarse GradeSection: ", {
        valor_ciclo: id_ciclo,
        valor_alumno: id_alumno
    }
    )

    // Estado para controlar qué materia está expandida (solo una a la vez)
    const [openSubjectId, setOpenSubjectId] = useState(null);

    const handleToggle = (id) => {
        setOpenSubjectId(openSubjectId === id ? null : id);
    };

    // DATOS FIJOS (Mocks adaptados a tus componentes)
    const subjectsData = {
        '3': [
            {
                id: 0,
                name: 'Cálculo Diferencial',
                professor: 'Dra. Elena Castro',
                grade: 9.5,
                status: 'aprobado',
                details: [
                    {
                        name: '1ER TRIMESTRE',
                        grade: 9.0,
                        status: 'Aprobado',
                        evaluacion: [
                            { nomeval: 'Parcial 1', notaeval: 9.5 },
                            { nomeval: 'Trabajo Práctico', notaeval: 8.5 }
                        ]
                    },
                    { name: '2DO TRIMESTRE', grade: 10.0, status: 'Aprobado' },
                    { name: 'EXAMEN FINAL', grade: 9.5, status: 'Aprobado' }
                ]
            },
            {
                id: 1,
                name: 'Programación Avanzada',
                professor: 'Ing. Ricardo Gómez',
                grade: 5.8,
                status: 'reprobado',
                details: [
                    {
                        name: '1ER TRIMESTRE',
                        grade: 5.5,
                        status: 'Desaprobado',
                        evaluacion: [
                            { nomeval: 'Evaluación Técnica', notaeval: 4.0 },
                            { nomeval: 'Laboratorio', notaeval: 7.0 }
                        ]
                    },
                    { name: '2DO TRIMESTRE', grade: 6.1, status: 'Aprobado' }
                ]
            }
        ]
    };

    const currentSubjects = subjectsData[id_ciclo] || [];

    // Llamamos al hok, pasando id_ciclo y id_alumno. El hook se encargará de pedir los datos cuando ambos existan.
    const { data: materias, loading, error } = useMateriasCicloEstudiante(id_ciclo, id_alumno);
    console.log("🔍 Datos que obtengo mediante Hook: ",  materias  )


    return (
        <div className="grades-container mt-4">
            {currentSubjects.length > 0 ? (
                currentSubjects.map((subject) => (
                    <SubjectCard
                        key={subject.id}
                        subject={subject}
                        isOpen={openSubjectId === subject.id}
                        onToggle={() => handleToggle(subject.id)}
                    />
                ))
            ) : (
                <div className="text-center py-5 bg-white rounded-3 border">
                    <p className="text-muted mb-0">No hay calificaciones disponibles para el año {id_ciclo}.</p>
                </div>
            )}
        </div>
    );
};

export default GradesSection;