//  Este componente independiente encapsula la lógica y presentación del CAccordion de filtros, haciéndolo reutilizable.
//  Maneja además los estados de los filtros (filterColumn1, filterValue1, etc.) y comunica los cambios al componente padre mediante callbacks.

import { useEffect } from 'react';
import { CAccordion, CAccordionBody, CAccordionHeader, CAccordionItem, CCol, CRow, CInputGroup, CInputGroupText, CFormSelect, CFormInput } from '@coreui/react';
import { CIcon } from '@coreui/icons-react';
import { cilSearch } from '@coreui/icons';

// Componente que encapsula los filtros avanzados y la búsqueda global
const AdvancedFilters = ({ searchTerm, setSearchTerm, columnFilters, setColumnFilters, filterOptions }) => {

  // Aseguramos que siempre haya al menos 4 filtros para mostrar en la UI
  const filtersToShow = [...columnFilters];
  while (filtersToShow.length < 4) {
    filtersToShow.push({ id: '', value: '' }); // Inicializa con opción "Seleccionar"
  }

  // Maneja el cambio en la columna de un filtro
  const handleColumnChange = (index, value) => {
    const newFilters = [...filtersToShow];
    newFilters[index] = { ...newFilters[index], id: value };
    setColumnFilters(newFilters); // Pasar TODOS los filtros al padre (sin filtrar), para mantener el estado UI

  };

  // Maneja el cambio en el valor de un filtro
  const handleValueChange = (index, value) => {
    const newFilters = [...filtersToShow];
    newFilters[index] = { ...newFilters[index], value };
    newFilters[index] = { ...newFilters[index], value: value || '' }; // Asegurar string vacío
    setColumnFilters(newFilters); // Pasar TODOS los filtros al padre (sin filtrar)

  };

  // Opciones por defecto si no se pasan props (fallback)
  const defaultOptions = [
    { value: 'name', label: 'Nombre' },
    { value: 'email', label: 'Mail' },
  ];

  const options = filterOptions || defaultOptions;

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
                style={{ maxWidth: '200px' }}
              />
            </CInputGroup>
          </CCol>
        </CRow>
        {/* Cuerpo del acordeón con filtros por columna */}
        <CAccordionBody className="bg-light">
          <CRow className="flex shadow-sm py-0 border size=sm bg-light">
            <CCol xs={6} md={6} lg={6} className="bg-light align-items-center">
              {/* Primer y segundo filtro */}
              {filtersToShow.slice(0, 2).map((filter, index) => (
                <CInputGroup key={index} className="shadow-sm border-0 mb-0 size=sm">
                  <CInputGroupText>Filtrar por</CInputGroupText>
                  <CFormSelect
                    className="form-select w-15"
                    value={filter.id}
                    onChange={(e) => handleColumnChange(index, e.target.value)}
                  >
                    {/* Opción por defecto "Seleccionar" */}
                    <option value="">Seleccionar</option>
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </CFormSelect>
                  <CFormInput
                    className="form-input w-25"
                    placeholder="Valor a buscar"
                    value={filter.value}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    disabled={!filter.id} // Deshabilitar si no hay columna seleccionada
                  />
                </CInputGroup>
              ))}
            </CCol>
            <CCol xs={6} md={6} lg={6} className="bg-light align-items-center">
              {/* Tercer y cuarto filtro */}
              {filtersToShow.slice(2, 4).map((filter, index) => (
                <CInputGroup key={index + 2} className="shadow-sm border-0 mb-0 size=sm">
                  <CInputGroupText>Filtrar por</CInputGroupText>
                  <CFormSelect
                    className="form-select w-15"
                    value={filter.id}
                    onChange={(e) => handleColumnChange(index + 2, e.target.value)}
                  >
                    {/* Opción por defecto "Seleccionar" */}
                    <option value="">Seleccionar</option>
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </CFormSelect>
                  <CFormInput
                    className="form-input w-25"
                    placeholder="Valor a buscar"
                    value={filter.value}
                    onChange={(e) => handleValueChange(index + 2, e.target.value)}
                    disabled={!filter.id} // Deshabilitar si no hay columna seleccionada
                  />
                </CInputGroup>
              ))}
            </CCol>
          </CRow>
        </CAccordionBody>
      </CAccordionItem>
    </CAccordion>
  );
};

export default AdvancedFilters;








