# 🥞 PancakeSwap Fork

A full-featured PancakeSwap clone built with Next.js 13, ethers.js, styled-components, and ChangeNow integration.

---

## ✨ Features

| Section | Features |
|---------|----------|
| **Trade** | Swap, Liquidity (Add/Remove), Buy Crypto (ChangeNow onramp/offramp) |
| **Perps** | Perpetual futures, live chart, order book, Long/Short with leverage |
| **Earn** | Yield Farms (9 LP pairs), Syrup Pools (7 pools including Auto CAKE) |
| **Play** | Springboard ILO, Prediction (BNB up/down), Lottery, CakePad IDO |
| **Board** | Analytics, Burn Dashboard, Governance Voting, Blog |

---

## ⚡ Quick Start (Automated)

### Linux / macOS
```bash
unzip pancakeswap-fork.zip
cd pancakeswap-fork
bash setup.sh
```

### Windows
```
Unzip pancakeswap-fork.zip
Double-click setup.bat
```

That's it! The script will check requirements, configure your environment, install dependencies, and start the server.

---

## 🔧 Manual Installation

### Prerequisites
- **Node.js 18+** — https://nodejs.org
- **npm 9+** — included with Node.js
- A domain/server (for production)

### Step 1 — Extract & Enter Directory
```bash
unzip pancakeswap-fork.zip
cd pancakeswap-fork
```

### Step 2 — Configure Environment
```bash
cp .env.example .env.local
nano .env.local   # or use any text editor
```

Fill in the values (see **Configuration** section below).

### Step 3 — Install Dependencies
```bash
npm install --legacy-peer-deps
```

### Step 4a — Development Mode
```bash
npm run dev
# Open http://localhost:3000
```

### Step 4b — Production Mode
```bash
npm run build
npm start
# Open http://localhost:3000
```

---

## ⚙️ Configuration (`.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | ✅ Yes | Get free at https://cloud.walletconnect.com |
| `NEXT_PUBLIC_CHANGENOW_API_KEY` | ✅ Pre-set | Your ChangeNow affiliate API key |
| `NEXT_PUBLIC_SITE_NAME` | Optional | Your DEX name (default: PancakeSwap) |
| `NEXT_PUBLIC_SITE_URL` | Optional | Your domain (e.g. https://myswap.com) |
| `NEXT_PUBLIC_CHAIN_ID` | Optional | 56 = BSC Mainnet, 97 = BSC Testnet |
| `NEXT_PUBLIC_RPC_URL` | Optional | BSC RPC endpoint |
| `NEXT_PUBLIC_ROUTER_ADDRESS` | Optional | PancakeSwap Router V2 address |
| `NEXT_PUBLIC_FACTORY_ADDRESS` | Optional | PancakeSwap Factory address |

### Getting a WalletConnect Project ID
1. Go to https://cloud.walletconnect.com
2. Create a free account
3. Create a new project
4. Copy the **Project ID**
5. Paste into `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in `.env.local`

---

## 🌐 Deploying to a Server (VPS/Cloud)

### Option A: Deploy with PM2 (Recommended for VPS)
```bash
# Install PM2 globally
npm install -g pm2

# Build the project
npm run build

# Start with PM2 (keeps running after SSH disconnect)
pm2 start npm --name "pancakeswap" -- start
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs pancakeswap
```

### Option B: Deploy to Vercel (Easiest)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# https://vercel.com/your-project/settings/environment-variables
```

### Option C: Deploy to Netlify
1. Push code to GitHub
2. Connect repo to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Add environment variables in Netlify dashboard

### Option D: Docker
```dockerfile
# Dockerfile included — build with:
docker build -t pancakeswap-fork .
docker run -p 3000:3000 --env-file .env.local pancakeswap-fork
```

---

## 🔒 Nginx Reverse Proxy (for VPS with custom domain)

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Enable HTTPS with Certbot
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## 🎨 Customization

### Change DEX Name & Branding
Edit `.env.local`:
```env
NEXT_PUBLIC_SITE_NAME=MySwap
```

Edit `src/components/layout/Header.tsx` — update `LogoText` and `PancakeLogo`.

### Change Colors / Theme
Edit `src/styles/theme.ts`:
```typescript
export const lightColors = {
  primary: '#YOUR_COLOR',      // Main accent color
  secondary: '#YOUR_COLOR2',   // Secondary color
  // ...
};
```

### Add Custom Tokens
Edit `src/constants/tokens.ts` — add entries to `BSC_TOKENS`.

### Change Contract Addresses
Edit `src/config/contracts.ts` — update the addresses for chain ID 56.

---

## 📁 Project Structure

```
pancakeswap-fork/
├── src/
│   ├── pages/                 # Next.js pages (routes)
│   │   ├── index.tsx          # Home page
│   │   ├── trade/             # Swap, Buy Crypto, Liquidity
│   │   ├── perps.tsx          # Perpetuals trading
│   │   ├── earn/              # Farms, Pools
│   │   ├── play/              # Springboard, Prediction, Lottery, CakePad
│   │   └── board/             # Info, Burn, Voting, Blog
│   ├── components/
│   │   ├── ui/                # Reusable UI (Button, Card, Modal…)
│   │   ├── layout/            # Header, Footer, Layout
│   │   ├── trade/             # Swap/Buy/Perps components
│   │   ├── earn/              # Farm/Pool components
│   │   ├── play/              # Game components
│   │   └── board/             # Analytics/Governance components
│   ├── hooks/                 # Custom React hooks (business logic)
│   ├── context/               # Theme & Web3 contexts
│   ├── styles/                # Global styles & theme
│   ├── constants/             # Token lists, ABIs
│   └── config/                # Chain & contract config
├── public/                    # Static assets
├── .env.example               # Environment template
├── .env.local                 # Your config (create from .env.example)
├── setup.sh                   # Linux/macOS auto-setup
├── setup.bat                  # Windows auto-setup
└── package.json
```

---

## 🔑 Smart Contract Integration

The swap UI is currently in **demo/simulation mode**. To connect to real BSC contracts:

1. Make sure your `.env.local` has the correct contract addresses
2. The `useSwap` hook (`src/hooks/useSwap.ts`) has a placeholder `executeSwap()` function
3. Replace the placeholder with real ethers.js calls:

```typescript
// src/hooks/useSwap.ts — replace executeSwap()
import { ethers } from 'ethers';
import ROUTER_ABI from '../abis/router.json';

const executeSwap = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer   = provider.getSigner();
  const router   = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer);
  
  // Example: swapExactTokensForTokens
  await router.swapExactTokensForTokens(
    amountIn,
    amountOutMin,
    [tokenIn, tokenOut],
    recipientAddress,
    deadline
  );
};
```

---

## 🛠 Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm install` fails | Try `npm install --legacy-peer-deps` |
| Port 3000 in use | Run `npm run dev -- -p 3001` |
| Build fails on types | Run `npm run build -- --no-lint` |
| Wallet won't connect | Check `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in `.env.local` |
| Blank page on deploy | Make sure environment variables are set on your hosting platform |
| Styled-components SSR flash | Already configured — ensure `styledComponents: true` in `next.config.js` |

---

## 📦 Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 13.5 | React framework with SSR |
| React | 18.2 | UI library |
| styled-components | 6 | CSS-in-JS theming |
| ethers.js | 5.7 | Ethereum/BSC interactions |
| ChangeNow API | v2 | Crypto exchange & onramp |
| wagmi | 1.4 | Wallet hooks |
| RainbowKit | 1.3 | Wallet connection UI |
| react-toastify | 9 | Notifications |
| recharts | 2.8 | Charts |

---

## 📄 License

This project is for educational purposes. PancakeSwap is a trademark of its respective owners.

---

## 💬 Support

- ChangeNow API docs: https://documenter.getpostman.com/view/8180765/SVfTPnM8
- Next.js docs: https://nextjs.org/docs
- ethers.js docs: https://docs.ethers.org/v5
