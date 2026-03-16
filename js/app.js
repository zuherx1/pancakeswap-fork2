/* ===========================
   PANCAKESWAP FORK - CORE APP
   Router + State + Utils
   =========================== */

'use strict';

// ===========================
// APP STATE
// ===========================

const AppState = {
  currentPage: 'home',
  walletConnected: false,
  walletAddress: null,
  walletBalance: null,
  selectedChain: 'BNB Smart Chain',
  theme: 'dark',
  tokens: {
    BNB: { symbol: 'BNB', name: 'BNB', decimals: 18, icon: '🟡', price: 312.45, balance: 4.821 },
    CAKE: { symbol: 'CAKE', name: 'PancakeSwap', decimals: 18, icon: '🥞', price: 2.14, balance: 1250.0 },
    USDT: { symbol: 'USDT', name: 'Tether USD', decimals: 6, icon: '💵', price: 1.0, balance: 2500.0 },
    USDC: { symbol: 'USDC', name: 'USD Coin', decimals: 6, icon: '🔵', price: 1.0, balance: 1800.0 },
    ETH: { symbol: 'ETH', name: 'Ethereum', decimals: 18, icon: '💎', price: 3245.67, balance: 1.234 },
    BUSD: { symbol: 'BUSD', name: 'Binance USD', decimals: 18, icon: '🟨', price: 1.0, balance: 500.0 },
    DOT: { symbol: 'DOT', name: 'Polkadot', decimals: 10, icon: '🔴', price: 8.92, balance: 120.0 },
    LINK: { symbol: 'LINK', name: 'Chainlink', decimals: 18, icon: '⛓️', price: 14.23, balance: 75.0 },
    ADA: { symbol: 'ADA', name: 'Cardano', decimals: 6, icon: '🔵', price: 0.52, balance: 3000.0 },
    SOL: { symbol: 'SOL', name: 'Solana', decimals: 9, icon: '🌐', price: 142.30, balance: 22.5 },
    MATIC: { symbol: 'MATIC', name: 'Polygon', decimals: 18, icon: '🟣', price: 0.91, balance: 850.0 },
    AVAX: { symbol: 'AVAX', name: 'Avalanche', decimals: 18, icon: '❄️', price: 38.75, balance: 45.0 },
    XRP: { symbol: 'XRP', name: 'XRP', decimals: 6, icon: '💧', price: 0.58, balance: 5000.0 },
    DOGE: { symbol: 'DOGE', name: 'Dogecoin', decimals: 8, icon: '🐕', price: 0.12, balance: 10000.0 },
    SHIB: { symbol: 'SHIB', name: 'Shiba Inu', decimals: 18, icon: '🐾', price: 0.000012, balance: 10000000.0 },
  },
  swapFrom: 'BNB',
  swapTo: 'CAKE',
  swapFromAmount: '',
  swapToAmount: '',
  slippage: 0.5,
  txDeadline: 20,
  expertMode: false,
  activeTab: 'swap',
  farms: [],
  pools: [],
};

// ===========================
// ROUTER
// ===========================

const Router = {
  routes: {
    '#/': 'home',
    '#/swap': 'swap',
    '#/buy': 'buy',
    '#/liquidity': 'liquidity',
    '#/perps': 'perps',
    '#/farm': 'farm',
    '#/pools': 'pools',
    '#/springboard': 'springboard',
    '#/prediction': 'prediction',
    '#/lottery': 'lottery',
    '#/cakepad': 'cakepad',
    '#/info': 'info',
    '#/burn': 'burn',
    '#/voting': 'voting',
    '#/blog': 'blog',
  },

  init() {
    window.addEventListener('hashchange', () => this.navigate());
    this.navigate();
  },

  navigate(hash) {
    const h = hash || window.location.hash || '#/';
    const page = this.routes[h] || 'home';
    AppState.currentPage = page;
    this.render(page);
    this.updateNavActive(page);
    window.scrollTo(0, 0);
  },

  go(hash) {
    window.location.hash = hash;
  },

  render(page) {
    const container = document.getElementById('page-content');
    if (!container) return;
    const renderer = Pages[page];
    if (renderer) {
      container.innerHTML = renderer();
      container.classList.remove('page-view');
      void container.offsetWidth;
      container.classList.add('page-view');
      if (typeof window['init_' + page] === 'function') {
        window['init_' + page]();
      }
    }
  },

  updateNavActive(page) {
    document.querySelectorAll('.nav-link, .dropdown-item').forEach(el => {
      el.classList.remove('active');
    });
    const mapping = {
      swap: '#/swap', buy: '#/buy', liquidity: '#/liquidity', perps: '#/perps',
      farm: '#/farm', pools: '#/pools', springboard: '#/springboard',
      prediction: '#/prediction', lottery: '#/lottery', cakepad: '#/cakepad',
      info: '#/info', burn: '#/burn', voting: '#/voting', blog: '#/blog',
    };
    const target = mapping[page];
    if (target) {
      document.querySelectorAll(`[href="${target}"]`).forEach(el => el.classList.add('active'));
    }
  }
};

// ===========================
// UTILS
// ===========================

const Utils = {
  formatNumber(num, decimals = 2) {
    if (num === null || num === undefined) return '0';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return Number(num).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  },

  formatUSD(num) {
    if (!num) return '$0.00';
    return '$' + this.formatNumber(num, 2);
  },

  formatToken(num, symbol) {
    if (!num) return '0';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M ' + symbol;
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K ' + symbol;
    return Number(num).toFixed(4) + ' ' + symbol;
  },

  formatAddress(addr) {
    if (!addr) return '';
    return addr.slice(0, 6) + '...' + addr.slice(-4);
  },

  randomAddress() {
    const chars = '0123456789abcdef';
    let addr = '0x';
    for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * 16)];
    return addr;
  },

  randomFloat(min, max, decimals = 2) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
  },

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  timeAgo(days) {
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  },

  getTokenIcon(symbol) {
    return AppState.tokens[symbol]?.icon || '🪙';
  },

  getTokenPrice(symbol) {
    return AppState.tokens[symbol]?.price || 0;
  },

  pairIcons(sym1, sym2) {
    const t1 = AppState.tokens[sym1];
    const t2 = AppState.tokens[sym2];
    return `
      <div class="token-pair">
        <div class="token-icon">${t1?.icon || '🪙'}</div>
        <div class="token-icon">${t2?.icon || '🪙'}</div>
      </div>`;
  },

  showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span style="font-size:20px">${icons[type]}</span>
      <div>
        <div style="font-weight:600;font-size:14px">${message}</div>
      </div>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
  },

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  },

  toggleSection(id) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('open');
  },

  copyText(text) {
    navigator.clipboard.writeText(text).catch(() => {});
    this.showToast('Copied to clipboard!', 'success', 2000);
  },

  formatDate(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  countdown(hours, minutes, seconds) {
    return `
      <div class="springboard-timer">
        <div class="timer-block"><div class="timer-value">${String(Math.floor(hours/24)).padStart(2,'0')}</div><div class="timer-label">DAYS</div></div>
        <div class="timer-block"><div class="timer-value">${String(hours % 24).padStart(2,'0')}</div><div class="timer-label">HRS</div></div>
        <div class="timer-block"><div class="timer-value">${String(minutes).padStart(2,'0')}</div><div class="timer-label">MIN</div></div>
        <div class="timer-block"><div class="timer-value">${String(seconds).padStart(2,'0')}</div><div class="timer-label">SEC</div></div>
      </div>`;
  }
};

// ===========================
// WALLET
// ===========================

const Wallet = {
  connect() {
    // Simulate wallet connection
    if (AppState.walletConnected) {
      this.disconnect();
      return;
    }
    Utils.showToast('Connecting wallet...', 'info', 1500);
    setTimeout(() => {
      AppState.walletConnected = true;
      AppState.walletAddress = Utils.randomAddress();
      this.updateUI();
      Utils.showToast('Wallet connected successfully!', 'success');
      Utils.closeModal('wallet-modal');
    }, 1200);
  },

  disconnect() {
    AppState.walletConnected = false;
    AppState.walletAddress = null;
    this.updateUI();
    Utils.showToast('Wallet disconnected', 'info', 2000);
  },

  updateUI() {
    const btn = document.getElementById('wallet-btn');
    if (!btn) return;
    if (AppState.walletConnected) {
      btn.innerHTML = `
        <div class="wallet-avatar"></div>
        <span>${Utils.formatAddress(AppState.walletAddress)}</span>
      `;
      btn.className = 'wallet-btn';
    } else {
      btn.innerHTML = 'Connect Wallet';
      btn.className = 'connect-wallet-btn';
    }
  }
};

// ===========================
// CHART UTILITY (Canvas)
// ===========================

const ChartUtils = {
  drawMiniChart(canvasId, data, color = '#1FC7D4') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h * 0.8 - h * 0.1;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Fill
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + '40');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.fill();
  },

  generatePriceData(points = 50, start = 100, volatility = 5) {
    const data = [start];
    for (let i = 1; i < points; i++) {
      const change = (Math.random() - 0.48) * volatility;
      data.push(Math.max(1, data[data.length - 1] + change));
    }
    return data;
  }
};

// ===========================
// MOCK DATA GENERATORS
// ===========================

const MockData = {
  generateFarms() {
    const pairs = [
      ['CAKE', 'BNB'], ['ETH', 'BNB'], ['USDT', 'BNB'], ['USDC', 'BUSD'],
      ['CAKE', 'USDT'], ['DOT', 'BNB'], ['LINK', 'BNB'], ['ADA', 'BNB'],
      ['SOL', 'USDT'], ['MATIC', 'BNB'], ['AVAX', 'USDC'],
    ];
    return pairs.map(([t1, t2], i) => ({
      id: i,
      token1: t1, token2: t2,
      apr: Utils.randomFloat(20, 250, 1),
      liquidity: Utils.randomFloat(100000, 50000000, 0),
      volume24h: Utils.randomFloat(50000, 10000000, 0),
      multiplier: [1, 2, 3, 5, 10, 20, 40][Utils.randomInt(0, 6)],
      isNew: i < 2,
      isHot: i < 4,
      earned: Utils.randomFloat(0, 500, 4),
      staked: Utils.randomFloat(0, 1000, 4),
      lpPrice: Utils.randomFloat(10, 10000, 2),
    }));
  },

  generatePools() {
    const tokens = ['CAKE', 'BNB', 'ETH', 'USDT', 'DOT', 'LINK', 'ADA', 'AVAX'];
    return tokens.map((t, i) => ({
      id: i,
      stakeToken: 'CAKE',
      earnToken: t,
      apr: Utils.randomFloat(5, 120, 1),
      totalStaked: Utils.randomFloat(100000, 50000000, 0),
      userStaked: Utils.randomFloat(0, 10000, 4),
      pendingReward: Utils.randomFloat(0, 50, 4),
      isHot: i < 2,
      isNew: i === 0,
      lockPeriod: [0, 7, 14, 30, 60, 90][Utils.randomInt(0, 5)],
    }));
  },

  generateProposals() {
    return [
      { id: 1, title: 'Add CAKE/ETH Farm with 20x Multiplier on Ethereum Network', status: 'active', forVotes: 78, againstVotes: 22, totalVotes: 4500000, created: 2 },
      { id: 2, title: 'Reduce CAKE emission rate by 15% to control inflation', status: 'active', forVotes: 62, againstVotes: 38, totalVotes: 3200000, created: 3 },
      { id: 3, title: 'Implement veCAKE tokenomics upgrade for improved governance', status: 'active', forVotes: 91, againstVotes: 9, totalVotes: 5800000, created: 1 },
      { id: 4, title: 'Launch on Arbitrum network with $2M incentive program', status: 'closed', forVotes: 85, againstVotes: 15, totalVotes: 7200000, created: 15 },
      { id: 5, title: 'Create new Springboard allocation for emerging DeFi protocols', status: 'closed', forVotes: 55, againstVotes: 45, totalVotes: 2100000, created: 20 },
      { id: 6, title: 'Integrate ZK-proof based privacy swaps via partnership', status: 'closed', forVotes: 73, againstVotes: 27, totalVotes: 3900000, created: 30 },
    ];
  },

  generateBlogPosts() {
    return [
      { id: 1, cat: 'Product', title: 'Introducing PancakeSwap v4: The Future of DeFi is Here', excerpt: 'We are thrilled to announce the launch of PancakeSwap v4, bringing unprecedented capital efficiency and new trading features to our platform.', date: 1, readTime: 5, icon: '🚀', featured: true },
      { id: 2, cat: 'Tutorial', title: 'How to Earn Maximum Yield with Syrup Pools', excerpt: 'A complete guide to staking CAKE in Syrup Pools for the highest possible APR returns this quarter.', date: 3, readTime: 8, icon: '📚', featured: true },
      { id: 3, cat: 'Announcement', title: 'CAKE Tokenomics 2.0: Lower Emissions, Higher Value', excerpt: 'Our revised tokenomics model focuses on sustainable growth and long-term value accrual for CAKE holders.', date: 5, readTime: 6, icon: '🎂' },
      { id: 4, cat: 'Analysis', title: 'DeFi Market Update: Q1 2025 in Review', excerpt: "Breaking down the key trends and highlights from decentralized finance's strongest quarter yet.", date: 7, readTime: 10, icon: '📊' },
      { id: 5, cat: 'Partnership', title: 'PancakeSwap x Chainlink: Bringing Real-World Data On-Chain', excerpt: 'Our expanded partnership with Chainlink will power next-generation price feeds and oracle services.', date: 10, readTime: 4, icon: '🤝' },
      { id: 6, cat: 'Tutorial', title: 'Advanced Liquidity Provision Strategies for DeFi Pros', excerpt: 'Learn how to minimize impermanent loss and maximize fee earnings with concentrated liquidity positions.', date: 12, readTime: 12, icon: '💡' },
      { id: 7, cat: 'Security', title: 'Audit Report: PancakeSwap Smart Contracts Cleared', excerpt: 'CertiK and Hacken have completed comprehensive audits of our V3 and V4 smart contract suite.', date: 14, readTime: 5, icon: '🔒' },
      { id: 8, cat: 'Community', title: 'PancakeSwap DAO: Your Votes Shaping the Future', excerpt: "A recap of the most impactful governance votes from last month and what's coming next.", date: 18, readTime: 7, icon: '🗳️' },
    ];
  },

  generateIDOs() {
    return [
      { id: 1, name: 'NovaDeFi', symbol: 'NOVA', icon: '⭐', raised: 1800000, goal: 2000000, status: 'live', tokenPrice: 0.08, totalSupply: 25000000, desc: 'Next-gen cross-chain DeFi aggregator' },
      { id: 2, name: 'ZenithAI', symbol: 'ZAI', icon: '🤖', raised: 500000, goal: 3000000, status: 'upcoming', tokenPrice: 0.15, totalSupply: 20000000, desc: 'AI-powered trading strategy protocol' },
      { id: 3, name: 'OceanFi', symbol: 'OCEAN', icon: '🌊', raised: 4500000, goal: 4500000, status: 'ended', tokenPrice: 0.04, totalSupply: 100000000, desc: 'Decentralized data marketplace' },
      { id: 4, name: 'StellarVault', symbol: 'SVLT', icon: '🌟', raised: 750000, goal: 2500000, status: 'live', tokenPrice: 0.12, totalSupply: 50000000, desc: 'Multi-chain yield optimization vault' },
      { id: 5, name: 'PixelChain', symbol: 'PXL', icon: '🎮', raised: 200000, goal: 1500000, status: 'upcoming', tokenPrice: 0.05, totalSupply: 300000000, desc: 'NFT gaming infrastructure layer' },
      { id: 6, name: 'GreenChain', symbol: 'GCH', icon: '🌱', raised: 3200000, goal: 3200000, status: 'ended', tokenPrice: 0.09, totalSupply: 35000000, desc: 'Carbon credit tokenization platform' },
    ];
  },

  generateBurnHistory() {
    return [
      { amount: 4820000, date: 1, txHash: Utils.randomAddress() },
      { amount: 5160000, date: 30, txHash: Utils.randomAddress() },
      { amount: 4390000, date: 61, txHash: Utils.randomAddress() },
      { amount: 5720000, date: 90, txHash: Utils.randomAddress() },
      { amount: 4950000, date: 120, txHash: Utils.randomAddress() },
      { amount: 6100000, date: 150, txHash: Utils.randomAddress() },
      { amount: 5400000, date: 180, txHash: Utils.randomAddress() },
      { amount: 4800000, date: 210, txHash: Utils.randomAddress() },
    ];
  }
};
