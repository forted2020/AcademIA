@echo off
:: ============================================================
:: RESTART_AcademiA.bat
:: Reinicia el servidor AcademiA:
:: 1. Cierra todo lo que esté corriendo
:: 2. Espera que el puerto se libere
:: 3. Vuelve a lanzar el servidor y abre Chrome
:: ============================================================
 
echo Reiniciando servidor AcademiA...
echo.
 
:: ----------------------------------------------------------
:: PASO 1: Cerrar la ventana CMD con título "Servidor AcademiA"
:: Igual que en STOP_AcademiA.bat
:: ----------------------------------------------------------
echo [1/4] Cerrando ventana del servidor...
taskkill /F /FI "WINDOWTITLE eq Servidor AcademiA" /T >nul 2>&1
 
:: ----------------------------------------------------------
:: PASO 2: Matar el proceso node.exe
:: Igual que en STOP_AcademiA.bat
:: Comentá esta línea si tenés otros proyectos node activos.
:: ----------------------------------------------------------
echo [2/4] Cerrando proceso node.exe...
taskkill /F /IM node.exe /T >nul 2>&1
 
:: ----------------------------------------------------------
:: PASO 3: Esperar a que el puerto 3001 se libere
:: Le damos 5 segundos para que Windows libere el puerto.
:: Si tu máquina es lenta, podés subir el número del timeout.
:: ----------------------------------------------------------
echo [3/4] Esperando que el puerto 3001 se libere...
timeout /t 5 /nobreak >nul
 
:: ----------------------------------------------------------
:: PASO 4: Volver a lanzar el servidor (igual que el START original)
:: Cambia al directorio del proyecto y ejecuta npm start
:: en una nueva ventana con el mismo título "Servidor AcademiA"
:: (importante mantener el título igual para que STOP funcione)
:: ----------------------------------------------------------
echo [4/4] Iniciando servidor nuevamente...
chdir /d "C:\AcademIA\frontend_AcademiA"
start "Servidor AcademiA" cmd /k "npm start"
 
:: ----------------------------------------------------------
:: Esperar a que el servidor arranque antes de abrir Chrome
:: Si el servidor tarda más en iniciar, subí el número de segundos.
:: ----------------------------------------------------------
echo Esperando a que el servidor inicie (10 segundos)...
timeout /t 10 /nobreak >nul
 
echo Abriendo Chrome con http://localhost:3001/
start chrome http://localhost:3001/
 
echo.
echo Reinicio completado. El servidor se esta ejecutando en la ventana nueva.
pause