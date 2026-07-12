#!/usr/bin/env bash
# XRayMOD Installer — Stage 1 (Bash)
# Downloads and runs the FastAPI installer via uv.
#
# Usage:
#   bash <(curl -fsSL https://raw.githubusercontent.com/EvolveBeyond/XRayMOD/refs/heads/main/install.sh)
#
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

INSTALLER_DIR="${HOME}/.xraymod"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        XrayMOD Installer             ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""

# ── Step 1: Check curl ──────────────────────────────────────
if ! command -v curl &>/dev/null; then
    echo -e "${RED}Error: curl is required but not installed.${NC}"
    exit 1
fi

# ── Step 2: Check/install uv ────────────────────────────────
if command -v uv &>/dev/null; then
    echo -e "${GREEN}✓${NC} uv found: $(uv --version)"
else
    echo -e "${YELLOW}→${NC} uv not found. Installing..."
    curl -LsSf https://astral.sh/uv/install.sh | sh 2>/dev/null
    export PATH="${HOME}/.local/bin:${HOME}/.cargo/bin:${PATH}"
    if ! command -v uv &>/dev/null; then
        echo -e "${RED}Error: uv installation failed.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} uv installed: $(uv --version)"
fi

# ── Step 3: Clone repo ─────────────────────────────────────
echo ""
echo -e "${YELLOW}→${NC} Setting up installer..."
mkdir -p "${INSTALLER_DIR}"

REPO_URL="https://github.com/EvolveBeyond/XRayMOD.git"
if [ -d "${INSTALLER_DIR}/XRayMOD" ]; then
    echo -e "${GREEN}✓${NC} Repository exists, updating..."
    git -C "${INSTALLER_DIR}/XRayMOD" pull --quiet 2>/dev/null || true
else
    echo -e "${YELLOW}→${NC} Cloning repository..."
    git clone --depth 1 "${REPO_URL}" "${INSTALLER_DIR}/XRayMOD" 2>/dev/null
    echo -e "${GREEN}✓${NC} Repository cloned"
fi

# ── Step 4: Run FastAPI installer ───────────────────────────
echo ""
echo -e "${YELLOW}→${NC} Starting installer on http://localhost:8000"
echo -e "${YELLOW}→${NC} Press Ctrl+C to stop"
echo ""

cd "${INSTALLER_DIR}/XRayMOD"
exec uv run python -m installer "$@"
