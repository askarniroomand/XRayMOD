@echo off
setlocal EnableExtensions
chcp 65001 >nul 2>&1

REM ═══════════════════════════════════════════════════════════════
REM  XrayMOD — One-command Windows bootstrap
REM
REM  Prefer this single command in CMD or PowerShell:
REM    powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/askarniroomand/XRayMOD/refs/heads/main/install.ps1 | iex"
REM
REM  Support: https://t.me/MRROBOT_DT
REM ═══════════════════════════════════════════════════════════════

echo.
echo  XrayMOD - automatic installer
echo  Support: https://t.me/MRROBOT_DT
echo.

where powershell >nul 2>&1
if errorlevel 1 (
  echo [X] PowerShell not found.
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/askarniroomand/XRayMOD/refs/heads/main/install.ps1 | iex"
exit /b %ERRORLEVEL%
