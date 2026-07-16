@echo off
setlocal EnableExtensions
chcp 65001 >nul 2>&1

REM ═══════════════════════════════════════════════════════════════
REM  XrayMOD — One-command Windows bootstrap
REM
REM  CMD / PowerShell (copy-paste):
REM    powershell -ExecutionPolicy Bypass -Command "irm https://cdn.jsdelivr.net/gh/askarniroomand/XRayMOD@main/install.ps1 | iex"
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

REM Prefer jsDelivr (not stuck on GitHub raw CDN). Fallback: GitHub API (always latest).
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "try { iex (irm 'https://cdn.jsdelivr.net/gh/askarniroomand/XRayMOD@main/install.ps1') } catch { $r = irm 'https://api.github.com/repos/askarniroomand/XRayMOD/contents/install.ps1?ref=main'; iex ([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String(($r.content -replace '\s','')))) }"
exit /b %ERRORLEVEL%
