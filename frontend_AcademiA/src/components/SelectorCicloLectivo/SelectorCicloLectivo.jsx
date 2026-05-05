//  frontend_AcademiA\src\components\SelectorCicloLectivo\SelectorCicloLectivo.jsx

//  Componente que devuelve (renderiza) un selector dinámico, donde las opciones son los años obtenidos de la base de datos.
//  Recibe el id de un alumno (id_entidad).
// Las opciones son en definitiva, los ciclos lectivos donde el alumno cursó alguna materia.

// Renderizado condicional:  EstiloCForm (CoreUI) o EstiloForm (Bootstrap)

import React, { useState, useEffect } from 'react';
import { CFormSelect } from '@coreui/react';
import axios from 'axios';
import { getCiclosPorEstudiante } from '../../api/apiEstudiantes';

const SelectorCicloLectivo = ({ id_entidad, onCicloChange, variant = 'default' }) => {
    const [ciclos, setCiclos] = useState([]);
    // Estado de la opción seleccionada
    const [seleccionado, setSeleccionado] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Efecto disparado. Valor de id_entidad:", id_entidad);
        const fetchCiclos = async () => {
            if (!id_entidad) return;

            try {
                setLoading(true);
               // Llamada a la API
                console.log("Por pedir la lista de ciclos" );
                const response = await getCiclosPorEstudiante(id_entidad);
                console.log("Datos de Ciclo obtenidos:", response );
                console.log("Datos sólo la lista de ciclos:", response.data );

                setCiclos(response.data);
                setError(null);
            } catch (err) {
                console.error("Error al cargar ciclos:", err);
                setError("No se pudieron cargar los años.");
            } finally {
                setLoading(false);
            }
        };

        fetchCiclos();
    }, [id_entidad]);

    const handleChange = (e) => {
        const selectedId = e.target.value;

        // Lo usamos para que el select cambie el texto mostrado, por el seleccionado
        setSeleccionado(selectedId);

        // Buscamos el objeto completo por si el padre necesita el nombre
        const cicloCompleto = ciclos.find(c => c.id_ciclo_lectivo === parseInt(selectedId));

        if (onCicloChange) {
            onCicloChange(cicloCompleto);
        }

    };

    if (loading) return <span>Cargando años...</span>;
    if (error) return <span className="text-danger">{error}</span>;

    // RENDERIZADO CONDICIONAL

    // ESTILO 1: Selector tipo CoreUI
    if (variant === 'EstiloCForm') {
        return (
            <CFormSelect
                value={seleccionado}
                onChange={handleChange}
                className={seleccionado === "" ? "text-muted" : "text-dark fw-bold"} // Estilo de placeholder
            >
                <option value="" disabled hidden>Seleccione Año</option>
                {ciclos.map((ciclo) => (
                    <option key={ciclo.id_ciclo_lectivo} value={ciclo.id_ciclo_lectivo}>
                        {ciclo.nombre_ciclo_lectivo}
                    </option>
                ))}
            </CFormSelect>
        );
    };

    // ESTILO 2: Selector tipo Bootstrap
    if (variant === 'EstiloForm') {
        return (
            <select
                value={seleccionado}
                onChange={handleChange}
                className={`form-select border-0 bg-light py-2 ps-3 pe-5 rounded-pill ${seleccionado === ""
                        ? "text-muted fw-normal"  // Estilo cuando es placeholder
                        : "text-primary fw-bold"   // Estilo cuando ya hay un año elegido
                    } `}
                style={{
                    cursor: 'pointer',
                    outline: 'none',
                    boxShadow: 'none',
                    appearance: 'none', // Opcional: quita la flecha nativa si vas a poner una propia
                    WebkitAppearance: 'none'
                }}
            >
                <option value="">Seleccione Año</option>
                {ciclos.map((ciclo) => (
                    <option key={ciclo.id_ciclo_lectivo} value={ciclo.id_ciclo_lectivo}>
                        {ciclo.nombre_ciclo_lectivo}
                    </option>
                ))}
            </select >
        );
    };

}

export default SelectorCicloLectivo;