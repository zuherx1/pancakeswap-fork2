#!/usr/bin/env bash
# ============================================================
#  PancakeSwap Fork — Automated Setup Script
#  Run:  bash setup.sh
# ============================================================

set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     🥞  PancakeSwap Fork Setup         ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
echo ""

# ── 1. Check Node.js ────────────────────────────────────────
echo -e "${YELLOW}[1/6] Checking Node.js version...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org${NC}"
  exit 1
fi
NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo -e "${RED}❌ Node.js 18+ required (found v${NODE_VER}). Please upgrade.${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v) found${NC}"

# ── 2. Check npm ─────────────────────────────────────────────
echo -e "${YELLOW}[2/6] Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
  echo -e "${RED}❌ npm not found. Please install npm.${NC}"
  exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v) found${NC}"

# ── 3. Create .env.local ─────────────────────────────────────
echo ""
echo -e "${YELLOW}[3/6] Configuring environment variables...${NC}"

if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
  echo -e "${GREEN}✅ Created .env.local from .env.example${NC}"
else
  echo -e "${GREEN}✅ .env.local already exists, skipping${NC}"
fi

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}  Please configure your .env.local file${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Edit ${YELLOW}.env.local${NC} and set:"
echo -e "  • ${GREEN}NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID${NC} — get from https://cloud.walletconnect.com"
echo -e "  • ${GREEN}NEXT_PUBLIC_SITE_URL${NC}                 — your domain (e.g. https://myswap.com)"
echo -e "  • ${GREEN}NEXT_PUBLIC_SITE_NAME${NC}                — your DEX name"
echo -e "  • ${GREEN}NEXT_PUBLIC_CHANGENOW_API_KEY${NC}        — already set ✅"
echo ""

read -p "$(echo -e ${YELLOW}Press ENTER once you have edited .env.local, or Ctrl+C to cancel...${NC})"

# ── 4. Install dependencies ───────────────────────────────────
echo ""
echo -e "${YELLOW}[4/6] Installing dependencies (this may take 2-4 minutes)...${NC}"
npm install --legacy-peer-deps
echo -e "${GREEN}✅ Dependencies installed${NC}"

# ── 5. Choose dev or production ───────────────────────────────
echo ""
echo -e "${YELLOW}[5/6] Choose mode:${NC}"
echo "  1) Development (fast start, hot reload)"
echo "  2) Production  (optimised build + start)"
echo ""
read -p "Enter choice [1/2]: " MODE_CHOICE

if [ "$MODE_CHOICE" = "2" ]; then
  echo ""
  echo -e "${YELLOW}Building for production...${NC}"
  npm run build
  echo -e "${GREEN}✅ Build complete${NC}"

  echo ""
  echo -e "${YELLOW}[6/6] Starting production server...${NC}"
  echo ""
  echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  🚀 PancakeSwap Fork is running!     ║${NC}"
  echo -e "${GREEN}║  Open: http://localhost:3000          ║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
  npm start
else
  echo ""
  echo -e "${YELLOW}[6/6] Starting development server...${NC}"
  echo ""
  echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  🥞 PancakeSwap Fork — Dev Mode      ║${NC}"
  echo -e "${GREEN}║  Open: http://localhost:3000          ║${NC}"
  echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
  npm run dev
fi
