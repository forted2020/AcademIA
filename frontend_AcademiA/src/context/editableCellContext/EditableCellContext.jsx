//  frontend_AcademiA\src\context\editableCellContext\EditableCellContext.jsx

//  CONTEXTO de navegación de celdas

import { createContext, useContext, useRef } from 'react';

const EditableCellContext = createContext(null);

export const EditableCellProvider = ({ children }) => {
    const cellsRef = useRef(new Map());

    const registerCell = (key, setEditando) => {
        cellsRef.current.set(key, setEditando);
    };

    const focusCell = (key) => {
        const fn = cellsRef.current.get(key);
        if (fn) fn(true);
    };

    return (
        <EditableCellContext.Provider value={{ registerCell, focusCell }}>
            {children}
        </EditableCellContext.Provider>
    );
};

export const useEditableCell = () => useContext(EditableCellContext);
