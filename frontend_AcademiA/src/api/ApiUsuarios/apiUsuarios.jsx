// frontend_AcademiA\src\api\ApiUsuarios\apiUsuarios.jsx

import api from '../api';

// Endpoint base
const ENDPOINT = '/api/usuarios';

//   Obtiene apellido, nombre de unusuario por ID
export const get = (id) =>
    api.get(`${ENDPOINT}/${id}`)

        // usamos .then para interceptar la respuesta y transformarla antes que llegue al componente. 
        .then(response => {
            // Creamos el campo nombre_completo combinando lo que viene de la API
            const data = response.data;
            return {
                // Mediante Spread Operator (...) extendemos las propiedades de data agregando nombre_completo
                ...data,
                nombre_completo: `${data.apellido}, ${data.nombre}`
            };

        });

// Exportamos todas las funciones bajo un objeto
const apiUsuarios = {
    get
};

export default apiUsuarios;