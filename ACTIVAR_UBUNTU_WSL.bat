@echo off
chcp 65001 >nul
title Configuración de Ubuntu y Virtualización para Colouring Montería

:: Comprobar privilegios de administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [INFO] Solicitando permisos de administrador...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ======================================================================
echo    COLOURING MONTERÍA - CONFIGURACIÓN DEL ENTORNO LINUX (UBUNTU)
echo ======================================================================
echo.
echo [1/4] Habilitando Plataforma de Máquina Virtual en Windows...
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

echo.
echo [2/4] Habilitando Subsistema de Windows para Linux (WSL)...
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

echo.
echo [3/4] Actualizando motor de WSL a la versión más reciente...
wsl.exe --update
wsl.exe --set-default-version 2

echo.
echo [4/4] Descargando e instalando distribución oficial de Ubuntu...
wsl.exe --install -d Ubuntu --no-launch

echo.
echo ======================================================================
echo    ¡CONFIGURACIÓN COMPLETADA CON ÉXITO!
echo ======================================================================
echo.
echo Si el sistema te pide reiniciar Windows para aplicar la virtualización,
echo reinicia y luego abriremos Ubuntu para correr Colouring Montería.
echo.
pause
