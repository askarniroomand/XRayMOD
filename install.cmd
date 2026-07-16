@echo off
setlocal EnableExtensions
chcp 65001 >nul 2>&1

REM ═══════════════════════════════════════════════════════════════
REM  XrayMOD — One-command Windows bootstrap
REM
REM  Prefer this single command in CMD or PowerShell:
REM    powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/askarniroomand/XRayMOD/main/install.ps1 | iex"
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

REM Use /main/ path (not refs/heads/main — that URL can stick on CDN cache)
REM Cache-bust query so Windows never reuses an old install.ps1
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$u='https://raw.githubusercontent.com/askarniroomand/XRayMOD/main/install.ps1?t='+[DateTimeOffset]::UtcNow.ToUnixTimeSeconds(); iex (irm $u)"
exit /b %ERRORLEVEL%
