//  Este componente independiente encapsula la lógica y presentación del CAccordion de filtros, haciéndolo reutilizable.
//  Maneja además los estados de los filtros (filterColumn1, filterValue1, etc.) y comunica los cambios al componente padre mediante callbacks.

import { CAccordion, CAccordionBody, CAccordionHeader, CAccordionItem, CCol, CRow, CInputGroup, CInputGroupText, CFormSelect, CFormInput } from '@coreui/react';
import '../../css/AdvancedFilters.css';

// Componente que encapsula los filtros avanzados y la búsqueda global
const AdvancedFilters = ({ searchTerm, setSearchTerm, columnFilters, setColumnFilters, filterOptions }) => {

   
  // Aseguramos que columnFilters sea siempre un array iterable
  const safeColumnFilters = Array.isArray(columnFilters) ? columnFilters : [];

  // Ahora creamos los filtros a mostrar, empezando desde un array seguro
  const filtersToShow = [...safeColumnFilters];

  // Completamos hasta tener al menos 4 filtros visibles en la UI
  while (filtersToShow.length < 4) {
    filtersToShow.push({ id: '', value: '' }); // Filtro vacío para mostrar "Seleccionar"
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
    // Agregamos la clase 'af-wrapper' para aplicar nuestros estilos CSS personalizados
    <CAccordion flush className="af-wrapper shadow-sm rounded border" activeItemKey={0}>
      <CAccordionItem itemKey={1} className="border-0">

        {/* Encabezado Compacto */}
        <CAccordionHeader>
          <div className="d-flex justify-content-between align-items-center w-100 pe-2">

            {/* IZQUIERDA: Título + Flecha manual */}
            <div className="d-flex align-items-center gap-2">
              <span className="fw-semibold text-secondary">Filtros Avanzados</span>
              {/* Aquí colocamos la flecha manualmente */}
              <span className="af-arrow-custom"></span>
            </div>

            {/* DERECHA: Buscador Global */}
            <CInputGroup size="sm" style={{ maxWidth: '240px' }} onClick={(e) => e.stopPropagation()}>
              <CInputGroupText className="af-label border rounded-start">
                Buscar
              </CInputGroupText>
              <CFormInput
                type="text"
                placeholder="..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="af-input rounded-end"
              />
            </CInputGroup>
          </div>
        </CAccordionHeader>

        {/* Cuerpo Compacto */}
        <CAccordionBody>
          <CRow className="g-2">
            {filtersToShow.map((filter, index) => (
              <CCol xs={12} md={6} key={index}>
                <CInputGroup size="sm">
                  {/* Etiqueta "Filtrar por" */}
                  <CInputGroupText className="af-label">
                    Filtrar por
                  </CInputGroupText>

                  {/* Select de Columna */}
                  <CFormSelect
                    className="af-select"
                    value={filter.id}
                    onChange={(e) => handleColumnChange(index, e.target.value)}
                  >
                    <option value="">Seleccionar</option>
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </CFormSelect>

                  {/* Input de Valor */}
                  <CFormInput
                    className="af-input"
                    placeholder="Valor..."
                    value={filter.value}
                    onChange={(e) => handleValueChange(index, e.target.value)}
                    disabled={!filter.id}
                  />
                </CInputGroup>
              </CCol>
            ))}
          </CRow>
        </CAccordionBody>
      </CAccordionItem>
    </CAccordion>
  );
};

export default AdvancedFilters;








