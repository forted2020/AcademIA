import React from 'react'; // Eliminamos useState porque el hook lo maneja
import { CContainer, CCard, CCardBody, CAlert, CRow, CCol, CFormSelect, CFormLabel } from '@coreui/react';
import './EstudiantesInformes.css'; 

import InformMain from '../../../components/informes/InformMain';
import { EstudiantesInformesConfig } from './EstudiantesInformesConfig';
import { useInforme } from '../../../components/informes/useInform';

// 1. Importamos tu nuevo Hook "Inteligente"
import { useInformesData } from '../../../components/informes/hooks/useInformesData';

export default function EstudiantesInformes() {
    
    // 2. Usamos el Hook para manejar toda la lógica de los filtros y datos
    const { 
        ciclos, 
        cursos, 
        materias, 
        seleccion, 
        handleCambio, 
        loading: loadingFiltros, 
        error: errorFiltros 
    } = useInformesData();

    // 3. Pasamos la 'seleccion' del hook directamente a tu motor de informes.
    //    Cada vez que cambie un select, 'seleccion' se actualiza y useInforme dispara la búsqueda.
    const { data, loading, error } = useInforme(EstudiantesInformesConfig.endpoint, seleccion);

    return (
        <div className="informes-wrapper pb-5">
            <CContainer fluid>
                <div className="d-flex justify-content-between align-items-center mb-3 pt-3">
                    <h2 className="fw-bold text-dark mb-0">{EstudiantesInformesConfig.title}</h2>
                </div>

                {/* Sección de Filtros */}
                <CCard className="border-0 shadow-sm mb-4">
                    <CCardBody className="py-3">
                        <CRow className="g-3">
                            
                            {/* --- SELECT TIPO DE INFORME --- */}
                            <CCol md={3}>
                                <CFormLabel>Tipo de Informe</CFormLabel>
                                <CFormSelect 
                                    value={seleccion.tipoInforme} 
                                    onChange={(e) => handleCambio('tipoInforme', e.target.value)}
                                >
                                    <option value="">Seleccione Informe...</option>
                                    {/* Aquí podrías mapear desde tu Config si quisieras, por ahora hardcodeamos para probar */}
                                    <option value="aprobados">Aprobados / Desaprobados</option>
                                </CFormSelect>
                            </CCol>

                            {/* --- SELECT CICLO (Dinámico) --- */}
                            <CCol md={3}>
                                <CFormLabel>Ciclo Lectivo</CFormLabel>
                                <CFormSelect
                                    value={seleccion.ciclo}
                                    onChange={(e) => handleCambio('ciclo', e.target.value)}
                                    disabled={!seleccion.tipoInforme}
                                >
                                    <option value="">Seleccione Ciclo...</option>
                                    {ciclos.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </CFormSelect>
                            </CCol>

                            {/* --- SELECT CURSO (Dinámico - Paso 2) --- */}
                            <CCol md={3}>
                                <CFormLabel>Curso</CFormLabel>
                                <CFormSelect 
                                    value={seleccion.curso}
                                    onChange={(e) => handleCambio('curso', e.target.value)}
                                    disabled={!seleccion.ciclo}
                                >
                                    <option value="">
                                        {loadingFiltros ? 'Cargando...' : 'Seleccione Curso...'}
                                    </option>
                                    {cursos.map(cur => (
                                        <option key={cur.id} value={cur.id}>
                                            {cur.nombre} - {cur.division}
                                        </option>
                                    ))}
                                </CFormSelect>
                            </CCol>

                            {/* --- SELECT MATERIA (Dinámico - Paso 3) --- */}
                            <CCol md={3}>
                                <CFormLabel>Materia</CFormLabel>
                                <CFormSelect 
                                    value={seleccion.materia}
                                    onChange={(e) => handleCambio('materia', e.target.value)}
                                    disabled={!seleccion.curso}
                                >
                                    <option value="">Seleccione Materia...</option>
                                    {materias.map(mat => (
                                        <option key={mat.id} value={mat.id}>
                                            {mat.nombre}
                                        </option>
                                    ))}
                                </CFormSelect>
                            </CCol>

                        </CRow>
                    </CCardBody>
                </CCard>

                {/* Manejo de Errores (Tanto de filtros como del informe principal) */}
                {(error || errorFiltros) && (
                    <CAlert color="danger" className="border-0 shadow-sm">
                        {error || errorFiltros}
                    </CAlert>
                )}

                {/* Vista Principal del Informe (Tabla) */}
                <InformMain 
                    config={EstudiantesInformesConfig}
                    data={data}
                    loading={loading}
                />
            </CContainer>
        </div>
    );
}