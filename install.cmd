@echo off
setlocal EnableExtensions
chcp 65001 >nul 2>&1

REM ═══════════════════════════════════════════════════════════════
REM  XrayMOD — One-Click Installer (Windows CMD)
REM
REM  CMD / PowerShell:
REM    powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/askarniroomand/XRayMOD/refs/heads/main/install.ps1 | iex"
REM
REM  Or download this file and double-click / run:
REM    install.cmd
REM
REM  Support: https://t.me/MRROBOT_DT
REM ═══════════════════════════════════════════════════════════════

set "REPO_RAW=https://raw.githubusercontent.com/askarniroomand/XRayMOD/refs/heads/main/install.ps1"
set "PS1=%TEMP%\xraymod-install.ps1"

echo.
echo  XrayMOD  -  Windows installer bootstrap
echo  Support: https://t.me/MRROBOT_DT
echo.

where powershell >nul 2>&1
if errorlevel 1 (
  echo [X] PowerShell not found. Install Windows PowerShell 5+ or PowerShell 7.
  exit /b 1
)

echo [~] Downloading installer...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "try { Invoke-WebRequest -UseBasicParsing -Uri '%REPO_RAW%' -OutFile '%PS1%'; exit 0 } catch { Write-Host $_.Exception.Message; exit 1 }"
if errorlevel 1 (
  echo [X] Download failed. Check internet / GitHub access.
  exit /b 1
)

if not exist "%PS1%" (
  echo [X] install.ps1 was not saved.
  exit /b 1
)

echo [~] Starting installer...
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%PS1%" %*
set "EC=%ERRORLEVEL%"
del /f /q "%PS1%" >nul 2>&1
exit /b %EC%
