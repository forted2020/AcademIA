//  frontend_AcademiA\src\components\notas\CeldaEditable.jsx

import React, { useState, useEffect, useRef } from 'react';

import { useEditableCell } from '../../context/editableCellContext/EditableCellContext';


const CeldaEditable = ({
    valorInicial,
    editable = true,
    alGuardar,
    rowIndex,
    columnId,
    table
}) => {
    const [editando, setEditando] = useState(false);
    const [valor, setValor] = useState(valorInicial ?? "");
    const inputRef = useRef(null);
    const { registerCell, focusCell } = useEditableCell();


    // Sincronizar el estado local si el valor inicial cambia desde afuera
    useEffect(() => {
        setValor(valorInicial ?? "");
    }, [valorInicial]);

    useEffect(() => {
        const key = `${rowIndex}__${columnId}`;
        registerCell(key, setEditando);
    }, [rowIndex, columnId, registerCell]);


    // Función para mover al siguiente campo (fila siguiente, misma columna)
    const moverASiguienteCelda = () => {
        const nextRowIndex = rowIndex + 1;
        const key = `${nextRowIndex}__${columnId}`;
        focusCell(key);
    };

    // Función para mover a la siguiente columna (misma fila)
    const moverASiguienteColumna = () => {
        const celdaActual = inputRef.current?.closest('td');
        if (!celdaActual) return;

        let siguienteCelda = celdaActual.nextElementSibling;

        // Intentar hasta 5 celdas adelante (por si hay columnas no editables)
        let intentos = 0;
        while (siguienteCelda && intentos < 5) {
            const divClickeable = siguienteCelda.querySelector('.editable-cell-hover');
            if (divClickeable) {
                divClickeable.click();
                return;
            }
            siguienteCelda = siguienteCelda.nextElementSibling;
            intentos++;
        }

        console.log('📍 No hay más columnas editables a la derecha');
    };

    // Función para mover a la columna anterior (misma fila)
    const moverACeldaAnterior = () => {
        const celdaActual = inputRef.current?.closest('td');
        if (!celdaActual) return;

        let celdaAnterior = celdaActual.previousElementSibling;

        // Intentar hasta 5 celdas atrás
        let intentos = 0;
        while (celdaAnterior && intentos < 5) {
            const divClickeable = celdaAnterior.querySelector('.editable-cell-hover');
            if (divClickeable) {
                divClickeable.click();
                return;
            }
            celdaAnterior = celdaAnterior.previousElementSibling;
            intentos++;
        }

        console.log('📍 No hay más columnas editables a la izquierda');
    };

    //  Función para normalizar el valor de las notas
    const valorNormalizado = () => {
        if (valor === "" || valor === null || valor === undefined) {
            return null;
        }
        return Number(valor);
    };


    // Función para confirmar y salir. Contempla todos los casos.
    const confirmarCambio = async () => {
        setEditando(false);

        const nuevoValor = valorNormalizado();

        // 🛑 CASO 1: no había nota y no se escribió nada → solo navegar
        if (valorInicial == null && nuevoValor == null) {
            moverASiguienteCelda();
            return;
        }

        // 🛑 CASO 2: el valor no cambió
        if (nuevoValor === valorInicial) {
            moverASiguienteCelda();
            return;
        }

        // ✅ CASO 3: hay un valor válido → guardar
        try {
            await alGuardar(nuevoValor);
        } catch {
            return; // no navegar si falla el guardado
        }

        moverASiguienteCelda();
    };


    // Si el periodo está cerrado (no editable), mostramos solo texto con estilo bloqueado
    if (!editable) {
        return (
            <div className="text-center p-1 bg-light text-muted" style={{ cursor: 'not-allowed' }}>
                {valor || "-"}
            </div>
        );
    }

    // Modo Edición
    if (editando) {
        return (
            <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                style={{
                    width: '3rem',
                    textAlign: 'center',
                    fontWeight: 700,
                    border: '1.5px solid #0369a1',
                    borderRadius: '0.25rem',
                    outline: 'none',
                    padding: '0.1rem 0.25rem',
                    fontSize: 'inherit',
                    fontFamily: 'inherit',
                    background: '#fff',
                    display: 'block',
                    margin: '0 auto',
                }}
                value={valor}
                autoFocus
                onFocus={(e) => e.target.select()}
                onChange={(e) => setValor(e.target.value)}
                onBlur={() => {
                    setEditando(false);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        confirmarCambio(); // Ya es async, maneja la navegación
                    }

                    if (e.key === 'Tab') {
                        e.preventDefault();

                        // Guardar primero si hay cambios
                        const guardarPromise = valor !== valorInicial
                            ? alGuardar(valor)
                            : Promise.resolve();

                        guardarPromise.then(() => {
                            setEditando(false);
                            setTimeout(() => {
                                if (e.shiftKey) {
                                    moverACeldaAnterior();
                                } else {
                                    moverASiguienteColumna();
                                }
                            }, 150);
                        }).catch(err => {
                            console.error('Error al guardar:', err);
                            setEditando(false);
                        });
                    }

                    if (e.key === 'Escape') {
                        e.preventDefault();
                        setValor(valorInicial);
                        setEditando(false);
                    }
                }}
            />

        );
    }

    // Modo Lectura (Default)
    return (
        <div
            data-cell-id={`${rowIndex}__${columnId}`}
            className="text-center p-1 editable-cell-hover rounded"
            style={{ cursor: 'pointer', minWidth: '40px', transition: '0.2s' }}
            onClick={() => setEditando(true)}
        >
            {valor || "-"}
        </div>
    );
};

export default CeldaEditable;