# ═══════════════════════════════════════════════════════════════
#  XrayMOD — One-Click Installer (Windows PowerShell)
#
#  PowerShell / CMD:
#    powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/askarniroomand/XRayMOD/refs/heads/main/install.ps1 | iex"
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

function Add-ToPath([string]$dir) {
  if ($dir -and (Test-Path $dir) -and ($env:Path -notlike "*$dir*")) {
    $env:Path = "$dir;$env:Path"
  }
}

function Ensure-ToolPaths {
  # Git common install locations
  @(
    "${env:ProgramFiles}\Git\cmd",
    "${env:ProgramFiles}\Git\bin",
    "${env:ProgramFiles(x86)}\Git\cmd",
    "${env:LocalAppData}\Programs\Git\cmd"
  ) | ForEach-Object { Add-ToPath $_ }

  # Node common install locations
  @(
    "${env:ProgramFiles}\nodejs",
    "${env:ProgramFiles(x86)}\nodejs",
    "${env:LocalAppData}\Programs\node",
    "${env:APPDATA}\npm"
  ) | ForEach-Object { Add-ToPath $_ }

  # Python / uv
  @(
    "${env:LocalAppData}\Programs\Python\Python312",
    "${env:LocalAppData}\Programs\Python\Python312\Scripts",
    "${env:LocalAppData}\Programs\Python\Python311",
    "${env:LocalAppData}\Programs\Python\Python311\Scripts",
    "${env:LocalAppData}\Programs\Python\Python310",
    "${env:LocalAppData}\Programs\Python\Python310\Scripts",
    "${env:LocalAppData}\uv\bin",
    "$env:USERPROFILE\.local\bin",
    "$env:USERPROFILE\.cargo\bin",
    "${env:ProgramFiles}\Python312",
    "${env:ProgramFiles}\Python311",
    "${env:ProgramFiles}\Python310"
  ) | ForEach-Object { Add-ToPath $_ }

  # Discover python from py launcher or Program Files wildcards
  Get-ChildItem -Path "${env:LocalAppData}\Programs\Python","${env:ProgramFiles}" -Filter "python.exe" -Recurse -ErrorAction SilentlyContinue |
    Select-Object -First 3 |
    ForEach-Object { Add-ToPath $_.DirectoryName }
}

function Get-GitHubZipUrl {
  # https://github.com/owner/repo.git  →  archive zip
  if ($RepoUrl -match 'github\.com[/:]([^/]+)/([^/\.]+)') {
    $owner = $Matches[1]
    $repo  = $Matches[2] -replace '\.git$', ''
    return "https://github.com/$owner/$repo/archive/refs/heads/$Branch.zip"
  }
  return $null
}

function Install-FromZip {
  $zipUrl = Get-GitHubZipUrl
  if (-not $zipUrl) {
    Die "بدون git فقط ریپوهای GitHub پشتیبانی می‌شوند — git را از https://git-scm.com/download/win نصب کن"
  }

  $zipPath = Join-Path $InstallerDir "xraymod-src.zip"
  $extractDir = Join-Path $InstallerDir "_extract"

  Write-Step "دانلود سورس (بدون git)..."
  try {
    # TLS 1.2 for older Windows
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -UseBasicParsing -Uri $zipUrl -OutFile $zipPath
  } catch {
    Die "دانلود ZIP ناموفق: $($_.Exception.Message)`n  اینترنت / فیلتر GitHub را چک کن"
  }

  if (Test-Path $extractDir) { Remove-Item -Recurse -Force $extractDir }
  if (Test-Path $RepoDir) { Remove-Item -Recurse -Force $RepoDir }
  New-Item -ItemType Directory -Force -Path $extractDir | Out-Null

  Write-Step "استخراج فایل‌ها..."
  Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force
  Remove-Item -Force $zipPath -ErrorAction SilentlyContinue

  # GitHub zip extracts to Owner-Repo-branch or Repo-branch
  $inner = Get-ChildItem -Path $extractDir -Directory | Select-Object -First 1
  if (-not $inner) {
    Die "استخراج ZIP خالی بود"
  }
  Move-Item -Path $inner.FullName -Destination $RepoDir
  Remove-Item -Recurse -Force $extractDir -ErrorAction SilentlyContinue
}

function Install-FromGit {
  $gitDir = Join-Path $RepoDir ".git"
  if (Test-Path $gitDir) {
    Write-Step "به‌روزرسانی مخزن..."
    try { & git -C $RepoDir remote set-url origin $RepoUrl 2>$null } catch {}
    try { & git -C $RepoDir fetch --depth 1 origin $Branch --quiet 2>$null } catch {}
    try { & git -C $RepoDir checkout -f $Branch --quiet 2>$null } catch {}
    try {
      & git -C $RepoDir reset --hard "origin/$Branch" --quiet 2>$null
    } catch {
      try { & git -C $RepoDir pull --ff-only --quiet 2>$null } catch {}
    }
    return
  }

  Write-Step "دانلود XrayMOD (git)..."
  if (Test-Path $RepoDir) {
    Remove-Item -Recurse -Force $RepoDir
  }
  & git clone --depth 1 -b $Branch $RepoUrl $RepoDir
  if ($LASTEXITCODE -ne 0) {
    Write-Host "  git clone ناموفق — سوییچ به دانلود ZIP..." -ForegroundColor DarkGray
    Install-FromZip
  }
}

try {
  [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
  $OutputEncoding = [System.Text.Encoding]::UTF8
  chcp 65001 | Out-Null
} catch {}

Ensure-ToolPaths

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
if (-not (Test-Cmd "node")) {
  Die "Node.js لازم است — از https://nodejs.org نسخه LTS را نصب کن، تیک Add to PATH را بزن، ترمینال را ببند و دوباره باز کن"
}

$nodeVer = (node -v).Trim()
$nodeMajor = 0
if ($nodeVer -match "v?(\d+)") { $nodeMajor = [int]$Matches[1] }
if ($nodeMajor -lt 18) {
  Die "Node.js 18+ لازم است (الان: $nodeVer)"
}
Write-Ok "Node $nodeVer"

if (-not (Test-Cmd "npm")) {
  Die "npm پیدا نشد — Node.js را دوباره نصب کن (Add to PATH)"
}

$hasGit = Test-Cmd "git"
if ($hasGit) {
  Write-Ok "git پیدا شد"
} else {
  Write-Host "  git نیست — از دانلود ZIP استفاده می‌شود (نیازی به نصب git نیست)" -ForegroundColor DarkGray
}

# Python / uv
if (-not (Test-Cmd "uv")) {
  Write-Step "نصب uv (ابزار پایتون)..."
  try {
    irm https://astral.sh/uv/install.ps1 | iex
  } catch {
    Write-Host "  uv نصب نشد — از python سیستم استفاده می‌شود" -ForegroundColor DarkGray
  }
  Ensure-ToolPaths
}

# ── fetch source ────────────────────────────────────────────
New-Item -ItemType Directory -Force -Path $InstallerDir | Out-Null

if ($hasGit) {
  try {
    Install-FromGit
  } catch {
    Write-Host "  git خطا داد — سوییچ به ZIP..." -ForegroundColor DarkGray
    Install-FromZip
  }
} else {
  Install-FromZip
}

Set-Location $RepoDir
$cliDeploy = Join-Path $RepoDir "installer\cli_deploy.py"
if (-not (Test-Path $cliDeploy)) {
  Die "installer/cli_deploy.py پیدا نشد — دانلود ناقص بود، دوباره امتحان کن"
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
  # Windows Store stub sometimes returns non-zero for --version
  try {
    $v = & python --version 2>&1 | Out-String
    if ($v -match "Python 3") { $pyExe = "python" }
  } catch {}
}
if (-not $pyExe -and (Test-Cmd "python3")) {
  $pyExe = "python3"
}
if (-not $pyExe -and (Test-Cmd "py")) {
  $pyExe = "py"
  $pyArgs = @("-3")
}

if (-not $pyExe) {
  Die @"
python یا uv لازم است.

1) از https://www.python.org/downloads پایتون را نصب کن
2) تیک «Add python.exe to PATH» را بزن
3) این پنجره CMD/PowerShell را ببند و دوباره باز کن
4) دوباره دستور نصب را بزن
"@
}

Write-Step "نصب httpx..."
try {
  & $pyExe @pyArgs -m pip install --user -q httpx 2>$null | Out-Null
} catch {}

& $pyExe @pyArgs installer/cli_deploy.py @args
exit $LASTEXITCODE
