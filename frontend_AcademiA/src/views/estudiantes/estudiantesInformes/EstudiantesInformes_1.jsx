// frontend_AcademiA\src\views\estudiantes\estudiantesInformes\EstudiantesInformes.jsx

// Componente que "limpia" la vista, manejanso solo el estado, conectando las piezas.
// Sin lógica de fetching ni  mapeo de tablas.

import React, { useState } from 'react';
import './EstudiantesInformes.css';

import GenericInform from '../../../components/informes/GenericInform';
import { EstudiantesInformesConfig } from './EstudiantesInformesConfig';



export default function EstudiantesInformes() {
    return <GenericInform config={EstudiantesInformesConfig} />;
    }

   