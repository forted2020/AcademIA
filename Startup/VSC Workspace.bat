@echo off
set WORKSPACE_PATH="C:\AcademIA\VSC Workspaces\AcademIA.code-workspace"
set VSCODE_PATH="%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe"

echo Abriendo workspace de VSCode...
echo.

REM Verificar si existe el workspace
if not exist %WORKSPACE_PATH% (
    echo Error: No se encuentra el archivo workspace.
    echo Ubicacion esperada: %WORKSPACE_PATH%
    pause
    exit /b 1
)

REM Verificar si VSCode está instalado
if not exist %VSCODE_PATH% (
    echo Visual Studio Code no encontrado en la ubicacion esperada.
    echo Intentando abrir con el comando 'code'...
    
    REM Intentar con el comando code (si está en PATH)
    code %WORKSPACE_PATH%
) else (
    REM Abrir con la ruta completa
    start "" %VSCODE_PATH% %WORKSPACE_PATH%
)

echo.
echo Workspace abierto correctamente.
timeout /t 2 >nul