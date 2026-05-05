

import { CCol, CRow, CInputGroup, CInputGroupText, CFormSelect, CFormInput } from '@coreui/react';
import '../../css/AdvancedFilters.css';

const GlobalSearch = ({ searchTerm, setSearchTerm }) => {
    return (
      
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
    )
  };

  export default GlobalSearch;

