@echo off
setlocal EnableExtensions
chcp 65001 >nul 2>&1

REM ═══════════════════════════════════════════════════════════════
REM  XrayMOD — Windows one-command bootstrap (always latest)
REM
REM  CMD / PowerShell:
REM    powershell -ExecutionPolicy Bypass -Command "$r=irm 'https://api.github.com/repos/askarniroomand/XRayMOD/contents/install.ps1?ref=main'; iex ([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String(($r.content -replace '\s',''))))"
REM
REM  Support: https://t.me/MRROBOT_DT
REM ═══════════════════════════════════════════════════════════════

echo.
echo  XrayMOD - automatic installer (latest from GitHub API)
echo  Support: https://t.me/MRROBOT_DT
echo.

where powershell >nul 2>&1
if errorlevel 1 (
  echo [X] PowerShell not found.
  exit /b 1
)

REM GitHub API = always latest (bypasses raw CDN cache that can show old install.ps1)
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$r = Invoke-RestMethod 'https://api.github.com/repos/askarniroomand/XRayMOD/contents/install.ps1?ref=main'; $s = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String(($r.content -replace '\s',''))); Invoke-Expression $s"
exit /b %ERRORLEVEL%
