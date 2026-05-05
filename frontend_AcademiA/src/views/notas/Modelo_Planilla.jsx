import React, { useState, useEffect } from 'react'



export default function ModeloPlanilla() {

// Datos simulados basados en la imagen (PDF)
const alumnos = [
    { id: 1, nombre: "BUTTA, Clemente Bautista", t1: 7, t2: 8, t3: 8, prom: 7.66, dic: "", feb: "", def: 7.66 },
    { id: 2, nombre: "CASTRO, Catalina", t1: 9, t2: 9, t3: 9, prom: 9.00, dic: "", feb: "", def: 9.00 },
    { id: 3, nombre: "DEMIRYI, Ulises Miguel", t1: 8, t2: 9, t3: 9, prom: 8.66, dic: "", feb: "", def: 8.66 },
    { id: 4, nombre: "DIANA, Fiorella Itatí", t1: 9, t2: 9, t3: 10, prom: 9.33, dic: "", feb: "", def: 9.33 },
    { id: 5, nombre: "DÍAZ, Emilia", t1: 9, t2: 9, t3: 10, prom: 9.33, dic: "", feb: "", def: 9.33 },
    { id: 6, nombre: "DUMÉ BALBI, Benicio", t1: 9, t2: 9, t3: 9, prom: 9.00, dic: "", feb: "", def: 9.00 },
    { id: 7, nombre: "FRAU MEICHTRY, Ana Paula", t1: 9, t2: 9, t3: 9, prom: 9.00, dic: "", feb: "", def: 9.00 },
    { id: 8, nombre: "GALIZZI KOHAN, Amanda", t1: 9, t2: 10, t3: 10, prom: 9.66, dic: "", feb: "", def: 9.66 },
    { id: 9, nombre: "GAMBARO, Marco", t1: 8, t2: 8, t3: 8, prom: 8.00, dic: "", feb: "", def: 8.00 },
];


return (

    <table className="table table-bordered table-sm align-middle text-center" style={{ fontSize: '0.9rem' }}>
        <thead>
            <tr style={{ backgroundColor: '#ffc107' }}>
                <th className="bg-warning text-dark" style={{ width: '40px' }}>Nº</th>
                <th className="bg-warning text-dark text-start" style={{ width: '30%' }}>Alumno/a</th>
                <th className="bg-warning text-dark">1º T</th>
                <th className="bg-warning text-dark">2º T</th>
                <th className="bg-warning text-dark">3º T</th>
                <th className="bg-warning text-dark">Prom.</th>
                <th className="bg-warning text-dark">DIC.</th>
                <th className="bg-warning text-dark">FEB.</th>
                <th className="bg-warning text-dark fw-bold" style={{ lineHeight: '1.1' }}>CALIF.<br />DEF.</th>
                <th className="bg-warning text-dark">OBSERVACIONES</th>
            </tr>
        </thead>
        <tbody>
            {alumnos.map((alumno) => (
                <tr key={alumno.id}>
                    <td>{alumno.id}</td>
                    <td className="text-start text-uppercase">{alumno.nombre}</td>
                    <td>{alumno.t1}</td>
                    <td>{alumno.t2}</td>
                    <td>{alumno.t3}</td>
                    <td className="bg-light fw-semibold">{alumno.prom}</td>
                    <td>{alumno.dic}</td>
                    <td>{alumno.feb}</td>
                    <td className="fw-bold">{alumno.def}</td>
                    <td className="bg-light"></td>
                </tr>
            ))}
            {/* Filas vacías para completar estilo visual si fuera necesario */}
            {[...Array(3)].map((_, i) => (
                <tr key={`empty-${i}`}>
                    <td>{alumnos.length + 1 + i}</td>
                    <td className="text-start"></td>
                    <td></td><td></td><td></td>
                    <td className="bg-light"></td>
                    <td></td><td></td><td></td>
                    <td className="bg-light"></td>
                </tr>
            ))}

        </tbody>
    </table>

    )


}