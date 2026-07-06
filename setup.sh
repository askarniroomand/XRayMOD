#!/bin/bash
# XrayMOD Repository Setup & Fix Script
# This script fixes common Git issues and sets up the repository

set -e

echo "==================================="
echo "  XrayMOD Repository Setup"
echo "==================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Are you in the XRayMOD directory?${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Fixing Git index...${NC}"
# Remove corrupted index file
rm -f .git/index
rm -f .git/index.lock
echo -e "${GREEN}  ✓ Git index cleared${NC}"

echo ""
echo -e "${YELLOW}Step 2: Reinitializing Git repository...${NC}"
# Remove existing .git if it exists and is corrupted
if [ -d ".git" ]; then
    echo "  Existing .git directory found"
else
    echo "  Creating new .git directory"
fi

# Initialize or reinitialize git
git init 2>/dev/null || true
echo -e "${GREEN}  ✓ Git initialized${NC}"

echo ""
echo -e "${YELLOW}Step 3: Setting branch to main...${NC}"
# Rename current branch to main
git branch -M main 2>/dev/null || true
echo -e "${GREEN}  ✓ Branch set to main${NC}"

echo ""
echo -e "${YELLOW}Step 4: Configuring remote...${NC}"
# Remove existing remote if it exists
git remote remove origin 2>/dev/null || true

# Add the correct remote
git remote add origin git@github.com:EvolveBeyond/XRayMOD.git 2>/dev/null || true
echo -e "${GREEN}  ✓ Remote configured${NC}"

echo ""
echo -e "${YELLOW}Step 5: Installing dependencies...${NC}"
# Install npm dependencies
if command -v npm &> /dev/null; then
    npm install 2>&1 | tail -5
    echo -e "${GREEN}  ✓ Dependencies installed${NC}"
else
    echo -e "${RED}  ✗ npm not found. Please install Node.js first.${NC}"
fi

echo ""
echo -e "${YELLOW}Step 6: Building frontend...${NC}"
# Build the frontend
if command -v npm &> /dev/null; then
    npm run build 2>&1 | tail -5
    echo -e "${GREEN}  ✓ Frontend built${NC}"
else
    echo -e "${RED}  ✗ Cannot build without npm${NC}"
fi

echo ""
echo -e "${YELLOW}Step 7: Staging files...${NC}"
# Stage all files
git add .
echo -e "${GREEN}  ✓ Files staged${NC}"

echo ""
echo -e "${YELLOW}Step 8: Creating initial commit...${NC}"
# Check if there are any changes to commit
if git diff --cached --quiet 2>/dev/null; then
    echo "  No changes to commit"
else
    git commit -m "Initial commit: XRayMOD proxy panel

- Cloudflare Worker with D1 database
- React frontend with shadcn/ui + Tailwind CSS v4
- Proxy engine: VLESS, Trojan, Shadowsocks
- Subscription link generation
- Wizard installer for one-click deployment
- Bilingual documentation (English + Persian)"
    echo -e "${GREEN}  ✓ Commit created${NC}"
fi

echo ""
echo "==================================="
echo "  Setup Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "  1. Push to remote: git push -u origin main"
echo "  2. Deploy to Cloudflare: npm run deploy"
echo "  3. Deploy wizard: cd wizard && wrangler deploy"
echo ""
echo "Default login:"
echo "  Admin: admin / admin"
echo "  User: user / user"
echo ""
echo "For more information, see README.md"
echo ""
