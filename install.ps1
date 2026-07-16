# ═══════════════════════════════════════════════════════════════
#  XrayMOD — One-Click Installer (Windows PowerShell)
#
#  PowerShell / CMD:
#    powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/askarniroomand/XRayMOD/refs/heads/main/install.ps1 | iex"
#
#  Or from this file:
#    powershell -ExecutionPolicy Bypass -File .\install.ps1
#
#  Support: https://t.me/MRROBOT_DT
# ═══════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

$RepoUrl = if ($env:XRAYMOD_REPO) { $env:XRAYMOD_REPO } else { "https://github.com/askarniroomand/XRayMOD.git" }
$Branch  = if ($env:XRAYMOD_BRANCH) { $env:XRAYMOD_BRANCH } else { "main" }
$InstallerDir = Join-Path $env:USERPROFILE ".xraymod"
$RepoDir = Join-Path $InstallerDir "XRayMOD"

function Write-Step([string]$msg) { Write-Host "→ $msg" -ForegroundColor Yellow }
function Write-Ok([string]$msg)   { Write-Host "✓ $msg" -ForegroundColor Green }
function Die([string]$msg) {
  Write-Host "✗ $msg" -ForegroundColor Red
  exit 1
}

function Test-Cmd([string]$name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

try {
  [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
  $OutputEncoding = [System.Text.Encoding]::UTF8
  chcp 65001 | Out-Null
} catch {}

Clear-Host
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   XrayMOD  ·  نصب خودکار پنل Cloudflare          ║" -ForegroundColor Green
Write-Host "║   فقط توکن · یوزر · رمز  →  پنل آماده            ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  پشتیبانی: https://t.me/MRROBOT_DT" -ForegroundColor Cyan
Write-Host ""

# ── prerequisites ───────────────────────────────────────────
if (-not (Test-Cmd "git")) {
  Die "git لازم است — از https://git-scm.com/download/win نصب کن و ترمینال را دوباره باز کن"
}

if (-not (Test-Cmd "node")) {
  Die "Node.js لازم است — از https://nodejs.org نسخه LTS را نصب کن و ترمینال را دوباره باز کن"
}

$nodeVer = (node -v).Trim()
$nodeMajor = 0
if ($nodeVer -match "v?(\d+)") { $nodeMajor = [int]$Matches[1] }
if ($nodeMajor -lt 18) {
  Die "Node.js 18+ لازم است (الان: $nodeVer)"
}
Write-Ok "Node $nodeVer"

if (-not (Test-Cmd "npm")) {
  Die "npm پیدا نشد — Node.js را دوباره نصب کن"
}

# Python / uv
$env:Path = "$env:USERPROFILE\.local\bin;$env:USERPROFILE\.cargo\bin;$env:LOCALAPPDATA\uv\bin;$env:Path"

if (-not (Test-Cmd "uv")) {
  Write-Step "نصب uv (ابزار پایتون)..."
  try {
    irm https://astral.sh/uv/install.ps1 | iex
  } catch {
    Write-Host "  uv نصب نشد — از python سیستم استفاده می‌شود" -ForegroundColor DarkGray
  }
  $env:Path = "$env:USERPROFILE\.local\bin;$env:USERPROFILE\.cargo\bin;$env:LOCALAPPDATA\uv\bin;$env:Path"
}

# ── fetch source ────────────────────────────────────────────
New-Item -ItemType Directory -Force -Path $InstallerDir | Out-Null

$gitDir = Join-Path $RepoDir ".git"
if (Test-Path $gitDir) {
  Write-Step "به‌روزرسانی مخزن..."
  try { git -C $RepoDir remote set-url origin $RepoUrl 2>$null } catch {}
  try { git -C $RepoDir fetch --depth 1 origin $Branch --quiet 2>$null } catch {}
  try { git -C $RepoDir checkout -f $Branch --quiet 2>$null } catch {}
  try {
    git -C $RepoDir reset --hard "origin/$Branch" --quiet 2>$null
  } catch {
    try { git -C $RepoDir pull --ff-only --quiet 2>$null } catch {}
  }
} else {
  Write-Step "دانلود XrayMOD..."
  if (Test-Path $RepoDir) {
    Remove-Item -Recurse -Force $RepoDir
  }
  $clone = Start-Process -FilePath "git" -ArgumentList @(
    "clone", "--depth", "1", "-b", $Branch, $RepoUrl, $RepoDir
  ) -Wait -PassThru -NoNewWindow
  if ($clone.ExitCode -ne 0) {
    Die "کلون مخزن ناموفق — اینترنت / آدرس گیت‌هاب را چک کن"
  }
}

Set-Location $RepoDir
$cliDeploy = Join-Path $RepoDir "installer\cli_deploy.py"
if (-not (Test-Path $cliDeploy)) {
  Die "installer/cli_deploy.py در مخزن نیست — main را push کردی؟"
}
Write-Ok "سورس آماده است"
Write-Host ""

# ── run interactive deploy ──────────────────────────────────
if (Test-Cmd "uv") {
  & uv run --with httpx python installer/cli_deploy.py @args
  exit $LASTEXITCODE
}

$pyExe = $null
$pyArgs = @()
if (Test-Cmd "python") {
  $pyExe = "python"
} elseif (Test-Cmd "python3") {
  $pyExe = "python3"
} elseif (Test-Cmd "py") {
  $pyExe = "py"
  $pyArgs = @("-3")
}

if (-not $pyExe) {
  Die "python یا uv لازم است — از https://www.python.org/downloads نصب کن (تیک Add to PATH)"
}

Write-Step "نصب httpx..."
try {
  & $pyExe @pyArgs -m pip install --user -q httpx 2>$null | Out-Null
} catch {}

& $pyExe @pyArgs installer/cli_deploy.py @args
exit $LASTEXITCODE
