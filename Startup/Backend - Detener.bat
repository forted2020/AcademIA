@echo off
:: ============================================================
:: STOP_AcademiA.bat
:: Cierra el servidor AcademiA buscando la ventana por su título
:: y también mata el proceso node.exe que corre npm start
:: ============================================================

echo Cerrando servidor AcademiA...
echo.

:: ----------------------------------------------------------
:: PASO 1: Cerrar la ventana CMD que tiene el título "Servidor AcademiA"
:: taskkill busca procesos. /FI filtra por criterio.
:: WINDOWTITLE es el título de la ventana del cmd.
:: /F fuerza el cierre. /T cierra también los procesos hijos.
:: ----------------------------------------------------------
taskkill /F /FI "WINDOWTITLE eq Servidor AcademiA" /T >nul 2>&1

:: ----------------------------------------------------------
:: PASO 2: Matar el proceso node.exe que levantó npm start
:: Esto es necesario porque a veces el proceso node queda
:: huérfano aunque cierres la ventana del cmd.
:: Si tenés OTROS proyectos node corriendo al mismo tiempo,
:: comentá esta línea para no matarlos también.
:: ----------------------------------------------------------
taskkill /F /IM node.exe /T >nul 2>&1

:: ----------------------------------------------------------
:: PASO 3: Verificar si el puerto 3001 quedó libre
:: netstat busca conexiones. Si no aparece nada, el puerto está libre.
:: ----------------------------------------------------------
echo Verificando si el puerto 3001 quedó libre...
netstat -ano | findstr :3001 >nul 2>&1
if %errorlevel% == 0 (
    echo [AVISO] El puerto 3001 todavia parece ocupado. Puede que tarde unos segundos en liberarse.
) else (
    echo [OK] Puerto 3001 liberado correctamente.
)

echo.
echo Proceso completado.
pause