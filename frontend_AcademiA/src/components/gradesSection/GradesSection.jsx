// src/views/estudiantes/GradesSection.jsx

// Recibe el año y id_alumno de Trayectoria.jsx, busca los datos fijos y mapea los SubjectCard.

import React, { useState } from 'react';
import { CContainer, CRow, CCol, CCard, CCardBody, CCollapse, CSpinner, CAlert } from '@coreui/react';
import SubjectCard from '../../components/subjectCard/SubjectCard';
import { useMateriasCicloEstudiante } from '../../hooks/useMateriasCicloEstudiante'

const GradesSection = ({ ciclo: id_ciclo, id_alumno }) => {     // Uso el alias id_ciclo para más claridad}

    console.log("🔍 Parámetros al montarse GradeSection: ", {
        valor_ciclo: id_ciclo,
        valor_id_alumno: id_alumno
    }
    )

    // Estado para controlar qué materia está expandida (solo una a la vez)
    const [openSubjectId, setOpenSubjectId] = useState(null);

    const handleToggle = (id) => {
        setOpenSubjectId(openSubjectId === id ? null : id);
    };

    // Llamamos al hok, pasando id_ciclo y id_alumno. El hook se encargará de pedir los datos cuando ambos existan.
    const { data: materias, loading, error } = useMateriasCicloEstudiante(id_ciclo, id_alumno);

    //  Estado de carga
    if (loading) return <CSpinner color="primary" />;
    // Estado de error
    if (error) return <CAlert color="danger">Error al cargar materias: {error.message}</CAlert>;
    // Estado Vacío (Si la API devuelve un array vacío)
    if (!materias || materias.length === 0) {
        return <div className="text-center py-5 bg-white rounded-3 border">
            <p className="text-muted mb-0">No hay calificaciones disponibles para el año {id_ciclo}.</p>
        </div>
    }

    console.log("🔍 Datos que obtengo mediante Hook: ", materias)
    console.log("🔍 Datos DE UN DOCENTE que obtengo mediante Hook: ", materias[0].docente_nombre_completo)

    // const currentSubjects = materias;

    return (
        <div className="grades-container mt-4">
            {
                materias.map((materia) => (
                    <SubjectCard
                        idAlumno={id_alumno}
                        key={materia.id_materia}
                        idMateria={materia.id_materia}
                        nombreMateria={materia.nombre.nombre_materia}
                        nombreDocente={materia.docente_nombre_completo}
                        notaMateria={6}     //  Hardcodeado
                        idCurso={materia.curso.id_curso}
                        curso={materia.curso.curso}
                        isOpen={openSubjectId === materia.id_materia}
                        onToggle={() => handleToggle(materia.id_materia)}
                    />
                ))
            }
        </div>
    );
};

export default GradesSection;