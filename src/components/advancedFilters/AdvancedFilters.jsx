//  Este componente independiente encapsula la lógica y presentación del CAccordion de filtros, haciéndolo reutilizable.
//  Maneja además los estados de los filtros (filterColumn1, filterValue1, etc.) y comunica los cambios al componente padre mediante callbacks.

import { useEffect } from 'react';
import {CAccordion, CAccordionBody, CAccordionHeader, CAccordionItem, CCol, CRow, CInputGroup, CInputGroupText, CFormSelect, CFormInput} from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilSearch } from '@coreui/icons';

// Componente que encapsula los filtros avanzados y la búsqueda global
const AdvancedFilters = ({
  searchTerm, // Término de búsqueda global
  setSearchTerm, // Callback para actualizar el término de búsqueda
  
  filterColumn1, // Columna seleccionada para el primer filtro
  setFilterColumn1, // Callback para actualizar la columna del primer filtro
  filterValue1, // Valor del primer filtro
  setFilterValue1, // Callback para actualizar el valor del primer filtro
  
  filterColumn2, // Columna seleccionada para el segundo filtro
  setFilterColumn2, // Callback para actualizar la columna del segundo filtro
  filterValue2, // Valor del segundo filtro
  setFilterValue2, // Callback para actualizar el valor del segundo filtro
  
  filterColumn3, // Columna seleccionada para el tercer filtro
  setFilterColumn3, // Callback para actualizar la columna del tercer filtro
  filterValue3, // Valor del tercer filtro
  setFilterValue3, // Callback para actualizar el valor del tercer filtro
  
  filterColumn4, // Columna seleccionada para el cuarto filtro
  setFilterColumn4, // Callback para actualizar la columna del cuarto filtro
  filterValue4, // Valor del cuarto filtro
  setFilterValue4, // Callback para actualizar el valor del cuarto filtro
  
  setColumnFilters, // Callback para actualizar los filtros de TanStack Table
}) => {
  // Aplica los filtros avanzados dinámicamente cuando cambian los valores o columnas
  useEffect(() => {
    const filters = [];
    if (filterValue1) filters.push({ id: filterColumn1, value: filterValue1 });
    if (filterValue2) filters.push({ id: filterColumn2, value: filterValue2 });
    if (filterValue3) filters.push({ id: filterColumn3, value: filterValue3 });
    if (filterValue4) filters.push({ id: filterColumn4, value: filterValue4 });
    setColumnFilters(filters); // Actualiza los filtros en TanStack Table
  }, [filterValue1, filterColumn1, filterValue2, filterColumn2, filterValue3, filterColumn3, filterValue4, filterColumn4, setColumnFilters]);


return (
    <CAccordion flush className="small-accordion" activeItemKey={0}>
      <CAccordionItem itemKey={1} className="mx-0 px-2">
        {/* Encabezado del acordeón con búsqueda global */}
        <CRow className="justify-content-between bg-light py-1 d-flex align-items-center">
          <CCol xs={2} md={2} lg={4} className="bg-light">
            <CAccordionHeader className="bg-transparent fw-semibold d-flex align-items-center">
              Filtro avanzado
            </CAccordionHeader>
          </CCol>
          <CCol />
          <CCol xs={2} md={2} lg={4} className="bg-light">
            {/* Input para búsqueda global */}
            <CInputGroup className="input-group-sm d-flex justify-content-end align-items-center">
              <CInputGroupText id="inputGroup-sizing-sm">
                Buscar
              </CInputGroupText>
              <CFormInput
                type="text"
                placeholder="Ingrese el texto a buscar"
                aria-label="Sizing example input"
                aria-describedby="inputGroup-sizing-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ maxWidth: '200px' }} // Limita el ancho máximo
              />
            </CInputGroup>
          </CCol>
        </CRow>
        {/* Cuerpo del acordeón con filtros por columna */}
        <CAccordionBody className="bg-light">
          <CRow className="flex shadow-sm py-0 border size=sm bg-light">
            <CCol xs={6} md={6} lg={6} className="bg-light align-items-center">
              {/* Primer filtro */}
              <CInputGroup className="shadow-sm border-0 mb-0 size=sm">
                <CInputGroupText>Filtrar por</CInputGroupText>
                <CFormSelect
                  className="form-select w-15"
                  value={filterColumn1}
                  onChange={(e) => setFilterColumn1(e.target.value)}
                >
                  <option value="name">Nombre</option>
                  <option value="email">Mail</option>
                  <option value="domicilio">Domicilio</option>
                  <option value="telefono">Teléfono</option>
                </CFormSelect>
                <CFormInput
                  className="form-input w-25"
                  placeholder="Valor a buscar"
                  value={filterValue1}
                  onChange={(e) => setFilterValue1(e.target.value)}
                />
              </CInputGroup>
              {/* Segundo filtro */}
              <CInputGroup className="shadow-sm border-0 mb-0 size=sm">
                <CInputGroupText>Filtrar por</CInputGroupText>
                <CFormSelect
                  className="w-15"
                  value={filterColumn2}
                  onChange={(e) => setFilterColumn2(e.target.value)}
                >
                  <option value="name">Nombre</option>
                  <option value="email">Mail</option>
                  <option value="domicilio">Domicilio</option>
                  <option value="telefono">Teléfono</option>
                </CFormSelect>
                <CFormInput
                  className="w-25"
                  placeholder="Valor a buscar"
                  value={filterValue2}
                  onChange={(e) => setFilterValue2(e.target.value)}
                />
              </CInputGroup>
            </CCol>
            <CCol xs={6} md={6} lg={6} className="bg-light align-items-center">
              {/* Tercer filtro */}
              <CInputGroup className="shadow-sm border-0 mb-0 size=sm">
                <CInputGroupText>Filtrar por</CInputGroupText>
                <CFormSelect
                  className="form-select w-15"
                  value={filterColumn3}
                  onChange={(e) => setFilterColumn3(e.target.value)}
                >
                  <option value="name">Nombre</option>
                  <option value="email">Mail</option>
                  <option value="domicilio">Domicilio</option>
                  <option value="telefono">Teléfono</option>
                </CFormSelect>
                <CFormInput
                  className="form-input w-25"
                  placeholder="Valor a buscar"
                  value={filterValue3}
                  onChange={(e) => setFilterValue3(e.target.value)}
                />
              </CInputGroup>
              {/* Cuarto filtro */}
              <CInputGroup className="shadow-sm border-0 mb-0 size=sm">
                <CInputGroupText>Filtrar por</CInputGroupText>
                <CFormSelect
                  className="w-15"
                  value={filterColumn4}
                  onChange={(e) => setFilterColumn4(e.target.value)}
                >
                  <option value="name">Nombre</option>
                  <option value="email">Mail</option>
                  <option value="domicilio">Domicilio</option>
                  <option value="telefono">Teléfono</option>
                </CFormSelect>
                <CFormInput
                  className="w-25"
                  placeholder="Valor a buscar"
                  value={filterValue4}
                  onChange={(e) => setFilterValue4(e.target.value)}
                />
              </CInputGroup>
            </CCol>
          </CRow>
        </CAccordionBody>
      </CAccordionItem>
    </CAccordion>
  );
};

export default AdvancedFilters;








