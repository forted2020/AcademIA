@echo off
title AcademIA Backend - Servidor Externo
echo ====================================================
echo INICIANDO API (ESTRUCTURA PERSONALIZADA)
echo ====================================================

:: 1. Definir Rutas segun tu configuracion
set RAIZ_SISTEMA=C:\AcademIA
set VENV_PYTHON=%RAIZ_SISTEMA%\venv\Scripts\python.exe
set APP_DIR=%RAIZ_SISTEMA%\backend_AcademiA\backend-master

:: 2. Validacion de rutas ANTES de intentar instalar nada
if not exist "%VENV_PYTHON%" (
    echo [ERROR] No se encontro el Python en: %VENV_PYTHON%
    pause
    exit
)
if not exist "%APP_DIR%\main.py" (
    echo [ERROR] No se encontro main.py en: %APP_DIR%
    pause
    exit
)

:: 3. Cambiar a la carpeta donde esta el codigo
cd /d "%APP_DIR%"

:: 4. Asegurar dependencias 
echo [+] Verificando drivers de base de datos...
"%VENV_PYTHON%" -m pip install pymysql cryptography --quiet

:: 5. Lanzar Uvicorn
echo [+] Iniciando Backend con DB Externa en http://localhost:8000
echo [+] Presiona CTRL+C para detener el servidor.
echo ----------------------------------------------------

"%VENV_PYTHON%" -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

echo ----------------------------------------------------
echo [INFO] El servidor se ha detenido.
pause