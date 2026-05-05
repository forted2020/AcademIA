//  frontend_AcademiA\src\views\home\homeDispatcher\HomeDispatcher.js

import React from 'react';
import { ROL_ADMIN, ROL_ALUMNO, ROL_DOCENTE } from '../../../../src/constants/Roles'

// ../constants/Roles';

// Importación de Homes
import UsersHome from '../../users/usersHome/UsersHome';
import DocentesHome from '../../docentes/docentesHome/DocentesHome';
import EstudiantesHome from '../../estudiantes/estudiantesHome/EstudiantesHome';

const HomeDispatcher = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const role = user?.rol_sistema || user?.tipos_usuario?.[0]?.cod_tipo_usuario;

    switch (role) {
        case ROL_ADMIN:
            return <UsersHome />;
        case ROL_DOCENTE:
            return <DocentesHome />;
        case ROL_ALUMNO:
            return <EstudiantesHome />;
        default:
            return <div>Cargando...</div>;
    }
};

export default HomeDispatcher;