#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
#  XrayMOD — One-Click Open Source Installer
#
#  bash <(curl -fsSL https://raw.githubusercontent.com/EvolveBeyond/XRayMOD/refs/heads/main/install.sh)
#
#  Flow for end users:
#    1) Cloudflare API Token
#    2) Account (auto if only one)
#    3) Panel username
#    4) Panel password
#    5) Automatic deploy + print login / sub links
#
#  Support: https://t.me/MRROBOT_DT
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

INSTALLER_DIR="${HOME}/.xraymod"
REPO_URL="${XRAYMOD_REPO:-https://github.com/EvolveBeyond/XRayMOD.git}"
BRANCH="${XRAYMOD_BRANCH:-main}"

clear 2>/dev/null || true
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${BOLD}   XrayMOD  ·  نصب خودکار پنل Cloudflare        ${NC}${GREEN}║${NC}"
echo -e "${GREEN}║${DIM}   فقط توکن · یوزر · رمز  →  پنل آماده         ${NC}${GREEN}║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${CYAN}پشتیبانی:${NC} https://t.me/MRROBOT_DT"
echo ""

die() { echo -e "${RED}✗${NC} $*" >&2; exit 1; }
step() { echo -e "${YELLOW}→${NC} $*"; }
ok() { echo -e "${GREEN}✓${NC} $*"; }

# ── prerequisites ───────────────────────────────────────────
command -v curl >/dev/null || die "curl لازم است"
command -v git  >/dev/null || die "git لازم است"

if ! command -v node >/dev/null; then
  die "Node.js لازم است — از https://nodejs.org نسخه LTS را نصب کن و دوباره همین دستور را بزن"
fi
NODE_MAJOR="$(node -v | sed 's/v//' | cut -d. -f1)"
if [ "${NODE_MAJOR}" -lt 18 ]; then
  die "Node.js 18+ لازم است (الان: $(node -v))"
fi
ok "Node $(node -v)"

command -v npm >/dev/null || die "npm پیدا نشد"

# Python runner
export PATH="${HOME}/.local/bin:${HOME}/.cargo/bin:${PATH}"
if ! command -v uv >/dev/null; then
  step "نصب uv (ابزار پایتون)..."
  curl -LsSf https://astral.sh/uv/install.sh | sh >/dev/null 2>&1 || true
  export PATH="${HOME}/.local/bin:${HOME}/.cargo/bin:${PATH}"
fi

# ── fetch source ────────────────────────────────────────────
mkdir -p "${INSTALLER_DIR}"
if [ -d "${INSTALLER_DIR}/XRayMOD/.git" ]; then
  step "به‌روزرسانی مخزن..."
  git -C "${INSTALLER_DIR}/XRayMOD" remote set-url origin "${REPO_URL}" 2>/dev/null || true
  git -C "${INSTALLER_DIR}/XRayMOD" fetch --depth 1 origin "${BRANCH}" --quiet 2>/dev/null || true
  git -C "${INSTALLER_DIR}/XRayMOD" checkout -f "${BRANCH}" --quiet 2>/dev/null || true
  git -C "${INSTALLER_DIR}/XRayMOD" reset --hard "origin/${BRANCH}" --quiet 2>/dev/null || \
    git -C "${INSTALLER_DIR}/XRayMOD" pull --ff-only --quiet 2>/dev/null || true
else
  step "دانلود XrayMOD..."
  rm -rf "${INSTALLER_DIR}/XRayMOD"
  git clone --depth 1 -b "${BRANCH}" "${REPO_URL}" "${INSTALLER_DIR}/XRayMOD" \
    || die "کلون مخزن ناموفق — اینترنت / آدرس گیت‌هاب را چک کن"
fi

cd "${INSTALLER_DIR}/XRayMOD"
[ -f installer/cli_deploy.py ] || die "installer/cli_deploy.py در مخزن نیست — main را push کردی؟"
ok "سورس آماده است"
echo ""

# ── run interactive deploy ──────────────────────────────────
if command -v uv >/dev/null; then
  exec uv run --with httpx python installer/cli_deploy.py "$@"
fi

# fallback: system python
if command -v python3 >/dev/null; then
  python3 -m pip install --user -q httpx 2>/dev/null || true
  exec python3 installer/cli_deploy.py "$@"
fi

die "python3 یا uv لازم است"
