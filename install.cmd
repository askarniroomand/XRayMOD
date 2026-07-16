@echo off
setlocal EnableExtensions
chcp 65001 >nul 2>&1

REM ═══════════════════════════════════════════════════════════════
REM  XrayMOD — Windows bootstrap
REM
REM  PowerShell (prompt starts with PS):
REM    irm 'https://raw.githubusercontent.com/askarniroomand/XRayMOD/4b075bb77ddf8c506fd5c02fc9c68392dde290a5/install.ps1' | iex
REM
REM  CMD:
REM    powershell -NoProfile -ExecutionPolicy Bypass -Command "irm 'https://raw.githubusercontent.com/askarniroomand/XRayMOD/4b075bb77ddf8c506fd5c02fc9c68392dde290a5/install.ps1' | iex"
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

powershell -NoProfile -ExecutionPolicy Bypass -Command "irm 'https://raw.githubusercontent.com/askarniroomand/XRayMOD/4b075bb77ddf8c506fd5c02fc9c68392dde290a5/install.ps1' | iex"
exit /b %ERRORLEVEL%
