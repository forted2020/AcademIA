// frontend_AcademiA\src\hooks\useUsuario.js

import { useState, useEffect } from 'react';
import apiUsuarios from '../api/ApiUsuarios/apiUsuarios'; // Ajusta la ruta según tu proyecto

// Custom Hook para obtener y gestionar los datos de un usuario por su ID.
// Centraliza la carga asíncrona y la actualización del estado.

function useUsuario(id) {
    const [usuario, setUsuario] = useState(null);

    useEffect(() => {
        // Si no hay ID, no hacemos nada
        if (!id) return;

        // Llamamos a la API
        apiUsuarios.get(id)
            .then(data => {
                setUsuario(data);
            })
            .catch(err => {
                console.error("Error al obtener el usuario:", err);
            });
        // Solo se vuelve a ejecutar si el ID cambia
    }, [id]);

    // Retorna el objeto usuario o null si está cargando
    return usuario;
}

export default useUsuario
