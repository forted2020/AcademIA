@echo off
chdir /d "C:\AcademIA\frontend_AcademiA"
echo Cambiando directorio a: %cd%
echo.
echo Ejecutando npm start...
start "Servidor AcademiA" cmd /k "npm start"

echo Esperando a que el servidor inicie...
timeout /t 10 /nobreak >nul

echo Abriendo Chrome con http://localhost:3001/
start chrome http://localhost:3001/

echo.
echo Proceso completado. El servidor se está ejecutando en la ventana nueva.
pause