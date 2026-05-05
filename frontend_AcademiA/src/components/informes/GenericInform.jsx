//  frontend_AcademiA\src\components\informes\GenericInform.jsx

// Vista genérica de informes basada en configuraciones e archivo 

/**
 * COMPONENTE DE PRESENTACIÓN (DUMB COMPONENT)
 * -------------------------------------------
 * Ya no gestiona filtros. Su única función es recibir un endpoint YA VALIDADO
 * y mostrar la tabla de resultados.
 * * @param {Object} config - Configuración visual (columnas, mappers).
 * @param {string|null} endpoint - URL final para buscar la data del reporte. Si es null, no busca.
 * @param {Object} params - Los filtros seleccionados para enviarlos al backend.
 */


import React from 'react';
import { CContainer, CAlert } from '@coreui/react';

import InformMain from '../../components/informes/InformMain';
import { useInforme } from '../../components/informes/useInform';


import { useInformesData } from '../../components/informes/hooks/useInformesData';
import  GenericInformFilters from './GenericInformFilters'



export default function GenericInform({ config, endpoint, params }) {

    // Para verificar si llegan bien los filtros
    console.log('🤷‍♂️ [GenericInform] Configuraciones recibidas:', config);
    console.log('🤷‍♂️🤷‍♂️ [GenericInform] filters recibidos:', config?.filters);

    // Hook específico para traer la DATA del reporte (filas de la tabla)
    // OBS: distinto a useInformesData, que se usa para los filtros
    const { data, loading, error } = useInforme(
        endpoint,
        params, 
        config.mapper,
        config.summaryCalculator
    );

// Si el padre no nos mandó un endpoint (porque faltan filtros), mostramos mensaje de espera.
    if (!endpoint) {
        return (
            <div className="text-center py-5 text-muted bg-light border border-dashed rounded">
                <i className="pi pi-filter me-2"></i>
                Complete los filtros requeridos para visualizar el informe.
            </div>
        );
    }

    return (
        <div className="pb-5 fade-in">
             {/* Manejo de errores de RED o Backend al pedir el reporte */}
            {error && <CAlert color="danger" className="mt-3">{error}</CAlert>}

            {/* Componente principal que renderiza la Tabla o las Stats Cards */}
            <InformMain
                config={config}
                data={data}
                loading={loading}
            />
        </div>
    );
}
