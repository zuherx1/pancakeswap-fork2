/* ===========================
   NAVBAR COMPONENT
   =========================== */

const Navbar = {
  render() {
    return `
    <nav class="navbar">
      <!-- Logo -->
      <a href="#/" class="navbar-logo" onclick="Router.go('#/')">
        <svg class="navbar-logo-icon" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="18" fill="#1FC7D4"/>
          <text x="18" y="24" text-anchor="middle" font-size="18" font-family="Kanit,sans-serif" font-weight="800" fill="#08060B">🥞</text>
        </svg>
        <span class="navbar-logo-text">PancakeSwap</span>
      </a>

      <!-- Nav Links -->
      <div class="navbar-links">

        <!-- Trade -->
        <div class="nav-item" onmouseenter="this.classList.add('open')" onmouseleave="this.classList.remove('open')">
          <button class="nav-link" id="nav-trade">
            Trade <span class="nav-chevron">▾</span>
          </button>
          <div class="nav-dropdown">
            <a href="#/swap" class="dropdown-item" onclick="Router.go('#/swap')">
              <span class="dropdown-icon">🔄</span>
              <div>
                <div style="font-weight:700;font-size:13px">Swap</div>
                <div style="font-size:11px;color:var(--color-text-muted);margin-top:1px">Trade tokens instantly</div>
              </div>
            </a>
            <a href="#/buy" class="dropdown-item" onclick="Router.go('#/buy')">
              <span class="dropdown-icon">💳</span>
              <div>
                <div style="font-weight:700;font-size:13px">Buy Crypto</div>
                <div style="font-size:11px;color:var(--color-text-muted);margin-top:1px">On-ramp & Off-ramp</div>
              </div>
            </a>
            <a href="#/liquidity" class="dropdown-item" onclick="Router.go('#/liquidity')">
              <span class="dropdown-icon">💧</span>
              <div>
                <div style="font-weight:700;font-size:13px">Liquidity</div>
                <div style="font-size:11px;color:var(--color-text-muted);margin-top:1px">Add/Remove liquidity</div>
              </div>
            </a>
            <div class="dropdown-divider"></div>
            <a href="#/perps" class="dropdown-item" onclick="Router.go('#/perps')">
              <span class="dropdown-icon">📈</span>
              <div>
                <div style="font-weight:700;font-size:13px">Perpetuals</div>
                <div style="font-size:11px;color:var(--color-text-muted);margin-top:1px">Leverage up to 150x</div>
              </div>
            </a>
          </div>
        </div>

        <!-- Perps shortcut -->
        <div class="nav-item">
          <a href="#/perps" class="nav-link" onclick="Router.go('#/perps')">Perps</a>
        </div>

        <!-- Earn -->
        <div class="nav-item" onmouseenter="this.classList.add('open')" onmouseleave="this.classList.remove('open')">
          <button class="nav-link">
            Earn <span class="nav-chevron">▾</span>
          </button>
          <div class="nav-dropdown">
            <a href="#/farm" class="dropdown-item" onclick="Router.go('#/farm')">
              <span class="dropdown-icon">🚜</span>
              <div>
                <div style="font-weight:700;font-size:13px">Farms</div>
                <div style="font-size:11px;color:var(--color-text-muted);margin-top:1px">Earn CAKE by staking LP</div>
              </div>
            </a>
            <a href="#/pools" class="dropdown-item" onclick="Router.go('#/pools')">
              <span class="dropdown-icon">🍯</span>
              <div>
                <div style="font-weight:700;font-size:13px">Syrup Pools</div>
                <div style="font-size:11px;color:var(--color-text-muted);margin-top:1px">Stake CAKE, earn tokens</div>
              </div>
            </a>
            <a href="#/liquidity" class="dropdown-item" onclick="Router.go('#/liquidity')">
              <span class="dropdown-icon">💰</span>
              <div>
                <div style="font-weight:700;font-size:13px">Liquidity</div>
                <div style="font-size:11px;color:var(--color-text-muted);margin-top:1px">Earn trading fees</div>
              </div>
            </a>
          </div>
        </div>

        <!-- Play -->
        <div class="nav-item" onmouseenter="this.classList.add('open')" onmouseleave="this.classList.remove('open')">
          <button class="nav-link">
            Play <span class="nav-chevron">▾</span>
          </button>
          <div class="nav-dropdown">
            <a href="#/springboard" class="dropdown-item" onclick="Router.go('#/springboard')">
              <span class="dropdown-icon">🚀</span>
              <div>
                <div style="font-weight:700;font-size:13px">Springboard</div>
                <div style="font-size:11px;color:var(--color-text-muted);margin-top:1px">Early access token sales</div>
              </div>
            </a>
            <a href="#/prediction" class="dropdown-item" onclick="Router.go('#/prediction')">
              <span class="dropdown-icon">🔮</span>
              <div>
                <div style="font-weight:700;font-size:13px">Prediction</div>
                <div style="font-size:11px;color:var(--color-text-muted);margin-top:1px">Predict BNB price</div>
              </div>
            </a>
            <a href="#/lottery" class="dropdown-item" onclick="Router.go('#/lottery')">
              <span class="dropdown-icon">🎟️</span>
              <div>
                <div style="font-weight:700;font-size:13px">Lottery</div>
                <div style="font-size:11px;color:var(--color-text-muted);margin-top:1px">Win big prizes</div>
              </div>
            </a>
            <a href="#/cakepad" class="dropdown-item" onclick="Router.go('#/cakepad')">
              <span class="dropdown-icon">🎂</span>
              <div>
                <div style="font-weight:700;font-size:13px">CakePad</div>
                <div style="font-size:11px;color:var(--color-text-muted);margin-top:1px">IDO launchpad</div>
              </div>
            </a>
          </div>
        </div>

        <!-- Board -->
        <div class="nav-item" onmouseenter="this.classList.add('open')" onmouseleave="this.classList.remove('open')">
          <button class="nav-link">
            Board <span class="nav-chevron">▾</span>
          </button>
          <div class="nav-dropdown">
            <a href="#/info" class="dropdown-item" onclick="Router.go('#/info')">
              <span class="dropdown-icon">📊</span>
              <div>
                <div style="font-weight:700;font-size:13px">Info</div>
                <div style="font-size:11px;color:var(--color-text-muted);margin-top:1px">Protocol analytics</div>
              </div>
            </a>
            <a href="#/burn" class="dropdown-item" onclick="Router.go('#/burn')">
              <span class="dropdown-icon">🔥</span>
              <div>
                <div style="font-weight:700;font-size:13px">Burn Dashboard</div>
                <div style="font-size:11px;color:var(--color-text-muted);margin-top:1px">CAKE burn tracker</div>
              </div>
            </a>
            <a href="#/voting" class="dropdown-item" onclick="Router.go('#/voting')">
              <span class="dropdown-icon">🗳️</span>
              <div>
                <div style="font-weight:700;font-size:13px">Voting</div>
                <div style="font-size:11px;color:var(--color-text-muted);margin-top:1px">Governance proposals</div>
              </div>
            </a>
            <a href="#/blog" class="dropdown-item" onclick="Router.go('#/blog')">
              <span class="dropdown-icon">📝</span>
              <div>
                <div style="font-weight:700;font-size:13px">Blog</div>
                <div style="font-size:11px;color:var(--color-text-muted);margin-top:1px">News & updates</div>
              </div>
            </a>
          </div>
        </div>

      </div>

      <!-- Navbar Right -->
      <div class="navbar-right">
        <!-- Chain -->
        <button class="navbar-chain" onclick="Utils.showToast('Chain switching coming soon!', 'info')">
          <span>🟡</span>
          <span class="hide-mobile">BNB Chain</span>
          <span class="chain-dot"></span>
        </button>

        <!-- Wallet -->
        <button id="wallet-btn" class="connect-wallet-btn" onclick="Wallet.connect()">
          Connect Wallet
        </button>

        <!-- Settings -->
        <button class="nav-settings" onclick="Utils.showToast('Settings panel', 'info')" title="Settings">⚙️</button>

        <!-- Hamburger -->
        <button class="hamburger" onclick="Navbar.toggleMobile()" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </nav>

    <!-- Mobile Nav -->
    <div class="mobile-nav" id="mobile-nav">
      <a class="mobile-nav-item" href="#/swap" onclick="Router.go('#/swap');Navbar.closeMobile()">🔄 Swap</a>
      <a class="mobile-nav-item" href="#/buy" onclick="Router.go('#/buy');Navbar.closeMobile()">💳 Buy Crypto</a>
      <a class="mobile-nav-item" href="#/perps" onclick="Router.go('#/perps');Navbar.closeMobile()">📈 Perps</a>
      <a class="mobile-nav-item" href="#/farm" onclick="Router.go('#/farm');Navbar.closeMobile()">🚜 Farms</a>
      <a class="mobile-nav-item" href="#/pools" onclick="Router.go('#/pools');Navbar.closeMobile()">🍯 Pools</a>
      <a class="mobile-nav-item" href="#/prediction" onclick="Router.go('#/prediction');Navbar.closeMobile()">🔮 Prediction</a>
      <a class="mobile-nav-item" href="#/lottery" onclick="Router.go('#/lottery');Navbar.closeMobile()">🎟️ Lottery</a>
      <a class="mobile-nav-item" href="#/cakepad" onclick="Router.go('#/cakepad');Navbar.closeMobile()">🎂 CakePad</a>
      <a class="mobile-nav-item" href="#/info" onclick="Router.go('#/info');Navbar.closeMobile()">📊 Info</a>
      <a class="mobile-nav-item" href="#/voting" onclick="Router.go('#/voting');Navbar.closeMobile()">🗳️ Voting</a>
      <a class="mobile-nav-item" href="#/blog" onclick="Router.go('#/blog');Navbar.closeMobile()">📝 Blog</a>
    </div>
    `;
  },

  toggleMobile() {
    document.getElementById('mobile-nav')?.classList.toggle('open');
  },

  closeMobile() {
    document.getElementById('mobile-nav')?.classList.remove('open');
  }
};

// ===========================
// FOOTER COMPONENT
// ===========================

const Footer = {
  render() {
    return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <div class="navbar-logo">
              <span style="font-size:32px">🥞</span>
              <span class="navbar-logo-text">PancakeSwap</span>
            </div>
            <p class="footer-brand-desc">
              The leading decentralized exchange on BNB Smart Chain with the best farms in DeFi and a lottery for everyone.
            </p>
            <div class="footer-social">
              <button class="social-btn" title="Twitter/X" onclick="Utils.showToast('Follow us on X!', 'info')">𝕏</button>
              <button class="social-btn" title="Telegram" onclick="Utils.showToast('Join our Telegram!', 'info')">✈️</button>
              <button class="social-btn" title="Discord" onclick="Utils.showToast('Join our Discord!', 'info')">💬</button>
              <button class="social-btn" title="GitHub" onclick="Utils.showToast('Star us on GitHub!', 'info')">⚙️</button>
              <button class="social-btn" title="Reddit" onclick="Utils.showToast('Join our Reddit!', 'info')">🔴</button>
            </div>
          </div>

          <div>
            <h4 class="footer-col-title">Trade</h4>
            <div class="footer-links">
              <a class="footer-link" href="#/swap" onclick="Router.go('#/swap')">Swap</a>
              <a class="footer-link" href="#/liquidity" onclick="Router.go('#/liquidity')">Liquidity</a>
              <a class="footer-link" href="#/perps" onclick="Router.go('#/perps')">Perpetuals</a>
              <a class="footer-link" href="#/buy" onclick="Router.go('#/buy')">Buy Crypto</a>
            </div>
          </div>

          <div>
            <h4 class="footer-col-title">Earn</h4>
            <div class="footer-links">
              <a class="footer-link" href="#/farm" onclick="Router.go('#/farm')">Farms</a>
              <a class="footer-link" href="#/pools" onclick="Router.go('#/pools')">Syrup Pools</a>
              <a class="footer-link" href="#/springboard" onclick="Router.go('#/springboard')">Springboard</a>
              <a class="footer-link" href="#/cakepad" onclick="Router.go('#/cakepad')">CakePad</a>
            </div>
          </div>

          <div>
            <h4 class="footer-col-title">Info</h4>
            <div class="footer-links">
              <a class="footer-link" href="#/info" onclick="Router.go('#/info')">Analytics</a>
              <a class="footer-link" href="#/burn" onclick="Router.go('#/burn')">CAKE Burn</a>
              <a class="footer-link" href="#/voting" onclick="Router.go('#/voting')">Governance</a>
              <a class="footer-link" href="#/blog" onclick="Router.go('#/blog')">Blog</a>
            </div>
          </div>
        </div>

        <div class="footer-bottom">
          <span>© 2024 PancakeSwap. Built on BNB Smart Chain.</span>
          <div style="display:flex;gap:24px">
            <span class="footer-link" style="cursor:pointer">Terms</span>
            <span class="footer-link" style="cursor:pointer">Privacy</span>
            <span class="footer-link" style="cursor:pointer">Audit</span>
          </div>
        </div>
      </div>
    </footer>`;
  }
};

// ===========================
// HOME PAGE
// ===========================

const Pages = {};

Pages.home = function() {
  return `
  <div class="home-hero">
    <div class="hero-bg">
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>
      <div class="hero-grid"></div>
    </div>
    <div class="hero-content">
      <div class="hero-eyebrow">
        <span>🟡</span> The #1 DEX on BNB Smart Chain
      </div>
      <h1 class="hero-title">
        Trade, Earn & Play on the <span class="gradient-text">Sweetest DEX</span>
      </h1>
      <p class="hero-subtitle">
        Swap tokens instantly, earn CAKE from farming and pools, and enjoy exclusive DeFi games — all in one place.
      </p>
      <div class="hero-actions">
        <button class="btn btn-primary btn-lg" onclick="Router.go('#/swap')">
          🔄 Start Trading
        </button>
        <button class="btn btn-secondary btn-lg" onclick="Router.go('#/farm')">
          🚜 Earn Now
        </button>
      </div>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="hero-stat-value">$2.4B</div>
          <div class="hero-stat-label">Total Value Locked</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-value">$1.8B</div>
          <div class="hero-stat-label">24h Trading Volume</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-value">500K+</div>
          <div class="hero-stat-label">Active Users</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-value">300+</div>
          <div class="hero-stat-label">Trading Pairs</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Token Stats Banner -->
  <div class="token-stats-section">
    <div class="container">
      <div class="token-card">
        <div class="token-info">
          <div class="token-icon-wrap">🥞</div>
          <div>
            <div class="token-name">CAKE</div>
            <div class="token-sym">PancakeSwap Token</div>
          </div>
        </div>
        <div class="token-stats-row">
          <div class="token-stat-item">
            <div class="token-stat-label">Price</div>
            <div class="token-stat-value" style="color:var(--color-primary)">$2.14</div>
          </div>
          <div class="token-stat-item">
            <div class="token-stat-label">Market Cap</div>
            <div class="token-stat-value">$428M</div>
          </div>
          <div class="token-stat-item">
            <div class="token-stat-label">Total Burned</div>
            <div class="token-stat-value" style="color:var(--color-warning)">🔥 178M</div>
          </div>
          <div class="token-stat-item">
            <div class="token-stat-label">24h Volume</div>
            <div class="token-stat-value">$84M</div>
          </div>
        </div>
        <div>
          <button class="btn btn-primary" onclick="Router.go('#/swap')">Buy CAKE</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Features -->
  <div class="features-section">
    <div class="container">
      <div class="section-header">
        <div class="section-eyebrow">Why PancakeSwap?</div>
        <h2 class="section-title">Everything DeFi, All in <span class="gradient-text">One Place</span></h2>
        <p class="section-subtitle">The most feature-rich DEX in the ecosystem. Fast, cheap, and always innovative.</p>
      </div>

      <div class="features-grid">
        ${[
          { icon: '🔄', title: 'Instant Swaps', desc: 'Trade any token on BNB Chain with the best rates and lowest fees. V3 concentrated liquidity means better prices for everyone.', href: '#/swap' },
          { icon: '🚜', title: 'Yield Farming', desc: 'Provide liquidity and earn CAKE rewards. Choose from 300+ farms with up to 250% APR and compound automatically.', href: '#/farm' },
          { icon: '🍯', title: 'Syrup Pools', desc: 'Stake CAKE to earn other tokens. Simple, safe, and rewarding — no impermanent loss, just pure yield.', href: '#/pools' },
          { icon: '🔮', title: 'Prediction Game', desc: 'Predict whether BNB price goes up or down in the next 5 minutes. Win BNB from the prize pool.', href: '#/prediction' },
          { icon: '🎟️', title: 'Lottery', desc: 'Buy tickets for a chance to win a massive prize pool. The more you play, the bigger your chances.', href: '#/lottery' },
          { icon: '📈', title: 'Perpetuals', desc: 'Trade crypto with up to 150x leverage. Long or short any major asset with deep liquidity.', href: '#/perps' },
        ].map(f => `
          <div class="feature-card" onclick="Router.go('${f.href}')">
            <div class="feature-icon">${f.icon}</div>
            <h3 class="feature-title">${f.title}</h3>
            <p class="feature-desc">${f.desc}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </div>

  <!-- CTA -->
  <div class="cta-section">
    <div class="cta-bg"></div>
    <div class="cta-content container">
      <h2 class="cta-title">Ready to start <span class="gradient-text">earning?</span></h2>
      <p class="cta-subtitle">Join millions of users already earning on PancakeSwap. No registration required.</p>
      <div class="hero-actions">
        <button class="btn btn-primary btn-lg" onclick="Wallet.connect()">
          🚀 Connect Wallet
        </button>
        <button class="btn btn-ghost btn-lg" onclick="Router.go('#/info')">
          📊 View Analytics
        </button>
      </div>
    </div>
  </div>
  `;
};
