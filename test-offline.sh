#!/usr/bin/env bash
# Quick offline test — starts backend on localhost:8000
set -euo pipefail

echo ""
echo "XrayMOD Offline Test"
echo "===================="
echo ""
echo "Starting backend on http://localhost:8000"
echo "Open browser and login with: admin / admin"
echo "Press Ctrl+C to stop"
echo ""

cd "$(dirname "$0")"
exec uv run xraymod-backend
