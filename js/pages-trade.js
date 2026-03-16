/* ===========================
   SWAP PAGE
   =========================== */

Pages.swap = function() {
  return `
  <div class="trade-layout">
    <div class="trade-bg">
      <div class="trade-orb trade-orb-1"></div>
      <div class="trade-orb trade-orb-2"></div>
    </div>
    <div class="trade-content">
      <!-- Trade Tabs -->
      <div class="trade-tabs-bar">
        <div class="tabs">
          <button class="tab-btn active" onclick="Router.go('#/swap')">Swap</button>
          <button class="tab-btn" onclick="Router.go('#/liquidity')">Liquidity</button>
          <button class="tab-btn" onclick="Router.go('#/buy')">Buy Crypto</button>
        </div>
      </div>

      <!-- Settings Panel (hidden by default) -->
      <div class="settings-panel" id="settings-panel" style="display:none;">
        <div style="font-size:14px;font-weight:700;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
          <span>⚙️ Settings</span>
          <button onclick="document.getElementById('settings-panel').style.display='none'" style="background:none;border:none;color:var(--color-text-muted);cursor:pointer;font-size:16px">✕</button>
        </div>
        <div class="settings-row">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:var(--color-text-secondary)">Slippage Tolerance</div>
          <div class="slippage-options">
            <button class="slippage-btn" onclick="Swap.setSlippage(0.1, this)">0.1%</button>
            <button class="slippage-btn active" onclick="Swap.setSlippage(0.5, this)">0.5%</button>
            <button class="slippage-btn" onclick="Swap.setSlippage(1.0, this)">1.0%</button>
            <div class="slippage-input-wrap">
              <input class="slippage-input" type="number" id="custom-slippage" placeholder="Custom" min="0" max="50">
              <span style="font-size:13px;color:var(--color-text-muted)">%</span>
            </div>
          </div>
        </div>
        <div class="settings-row">
          <div style="font-size:13px;font-weight:600;margin-bottom:8px;color:var(--color-text-secondary)">Transaction Deadline</div>
          <div style="display:flex;align-items:center;gap:8px">
            <input class="input-field" type="number" id="tx-deadline" value="20" min="1" max="180" style="width:80px;padding:8px 12px">
            <span style="font-size:13px;color:var(--color-text-secondary)">minutes</span>
          </div>
        </div>
        <div class="settings-row" style="margin-bottom:0">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-size:13px;font-weight:600">Expert Mode</div>
              <div style="font-size:11px;color:var(--color-text-muted);margin-top:2px">Allows high slippage trades</div>
            </div>
            <label class="toggle">
              <input type="checkbox" id="expert-mode" onchange="Swap.toggleExpert(this)">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Swap Card -->
      <div class="swap-card">
        <div class="swap-header">
          <h2 class="swap-title">Swap</h2>
          <div style="display:flex;gap:8px;align-items:center">
            <button class="swap-settings-btn" onclick="Swap.toggleSettings()" title="Settings">⚙️</button>
            <button class="swap-settings-btn" onclick="Swap.refreshRate()" title="Refresh">🔄</button>
          </div>
        </div>

        <!-- From Token -->
        <div class="token-input-wrap" id="from-wrap">
          <div class="token-input-label">
            <span>From</span>
            <span class="token-balance" onclick="Swap.setMax()">Balance: <span id="from-balance">${Utils.formatToken(AppState.tokens[AppState.swapFrom]?.balance || 0, AppState.swapFrom)}</span></span>
          </div>
          <div class="token-input-row">
            <input 
              class="token-amount-input" 
              type="number" 
              id="from-amount" 
              placeholder="0.0"
              oninput="Swap.onFromInput(this.value)"
              value="${AppState.swapFromAmount}"
            >
            <button class="token-selector-btn" id="from-token-btn" onclick="Swap.openTokenModal('from')">
              <span id="from-icon">${Utils.getTokenIcon(AppState.swapFrom)}</span>
              <span id="from-symbol">${AppState.swapFrom}</span>
              <span>▾</span>
            </button>
          </div>
          <div class="token-usd-value" id="from-usd">≈ $0.00</div>
        </div>

        <!-- Swap Arrow -->
        <div class="swap-arrow-wrap">
          <button class="swap-arrow-btn" onclick="Swap.swapDirection()" title="Flip tokens">⇅</button>
        </div>

        <!-- To Token -->
        <div class="token-input-wrap" id="to-wrap">
          <div class="token-input-label">
            <span>To (estimated)</span>
            <span class="token-balance">Balance: <span id="to-balance">${Utils.formatToken(AppState.tokens[AppState.swapTo]?.balance || 0, AppState.swapTo)}</span></span>
          </div>
          <div class="token-input-row">
            <input 
              class="token-amount-input" 
              type="number" 
              id="to-amount" 
              placeholder="0.0"
              oninput="Swap.onToInput(this.value)"
              value="${AppState.swapToAmount}"
            >
            <button class="token-selector-btn" id="to-token-btn" onclick="Swap.openTokenModal('to')">
              <span id="to-icon">${Utils.getTokenIcon(AppState.swapTo)}</span>
              <span id="to-symbol">${AppState.swapTo}</span>
              <span>▾</span>
            </button>
          </div>
          <div class="token-usd-value" id="to-usd">≈ $0.00</div>
        </div>

        <!-- Swap Details -->
        <div class="swap-details" id="swap-details" style="display:none;">
          <div class="swap-detail-toggle" onclick="Utils.toggleSection('swap-detail-rows')">
            <span>1 <span id="detail-from">${AppState.swapFrom}</span> = <span id="detail-rate" class="swap-rate">...</span> <span id="detail-to">${AppState.swapTo}</span></span>
            <span style="display:flex;align-items:center;gap:4px">
              <span id="fee-badge" style="font-size:11px;color:var(--color-text-muted)">0.25% fee</span>
              <span>▾</span>
            </span>
          </div>
          <div class="swap-detail-rows" id="swap-detail-rows">
            <div class="detail-row">
              <span class="detail-label">Price Impact <span title="The impact your trade has on the market price" style="cursor:help;color:var(--color-text-muted)">ℹ️</span></span>
              <span class="detail-value price-impact-low" id="price-impact">< 0.01%</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Min. Received</span>
              <span class="detail-value" id="min-received">-</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Network Fee</span>
              <span class="detail-value">~$0.12</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Route</span>
              <span class="detail-value" id="swap-route" style="font-size:12px">-</span>
            </div>
          </div>
        </div>

        <!-- Swap Button -->
        <div style="margin-top:16px">
          ${AppState.walletConnected
            ? `<button class="btn btn-primary btn-full btn-lg" id="swap-btn" onclick="Swap.execute()">Swap</button>`
            : `<button class="btn btn-primary btn-full btn-lg" onclick="Wallet.connect()">Connect Wallet</button>`
          }
        </div>

        <!-- Max/Half buttons -->
        <div style="display:flex;gap:8px;margin-top:10px;justify-content:center">
          <button class="btn btn-secondary btn-sm" onclick="Swap.setPercent(25)">25%</button>
          <button class="btn btn-secondary btn-sm" onclick="Swap.setPercent(50)">50%</button>
          <button class="btn btn-secondary btn-sm" onclick="Swap.setPercent(75)">75%</button>
          <button class="btn btn-secondary btn-sm" onclick="Swap.setMax()">MAX</button>
        </div>
      </div>

      <!-- Recent Txs hint -->
      <div style="text-align:center;margin-top:16px;font-size:12px;color:var(--color-text-muted)">
        🔒 Secured by smart contracts. Always DYOR.
      </div>
    </div>

    <!-- Token Modal -->
    <div class="modal-overlay" id="token-modal" onclick="if(event.target===this)Utils.closeModal('token-modal')">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Select a Token</h3>
          <button class="modal-close" onclick="Utils.closeModal('token-modal')">✕</button>
        </div>
        <div class="input-group" style="margin-bottom:16px">
          <input class="input-field" type="text" placeholder="Search name or paste address" id="token-search" oninput="Swap.filterTokens(this.value)">
        </div>
        <div class="popular-tokens">
          ${['BNB','CAKE','USDT','USDC','ETH','BUSD'].map(s => `
            <button class="popular-token-btn" onclick="Swap.selectToken('${s}')">
              ${Utils.getTokenIcon(s)} ${s}
            </button>`).join('')}
        </div>
        <div class="divider"></div>
        <div class="token-list" id="token-list">
          ${Object.entries(AppState.tokens).map(([sym, t]) => `
            <div class="token-list-item" onclick="Swap.selectToken('${sym}')">
              <div class="token-icon" style="width:36px;height:36px;font-size:20px">${t.icon}</div>
              <div class="token-list-info">
                <div class="token-list-name">${sym}</div>
                <div class="token-list-fullname">${t.name}</div>
              </div>
              <div class="token-list-balance">${AppState.walletConnected ? Utils.formatToken(t.balance, sym) : '-'}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>

    <!-- Confirm Swap Modal -->
    <div class="modal-overlay" id="confirm-modal" onclick="if(event.target===this)Utils.closeModal('confirm-modal')">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Confirm Swap</h3>
          <button class="modal-close" onclick="Utils.closeModal('confirm-modal')">✕</button>
        </div>
        <div class="confirm-amounts">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <div>
              <div style="font-size:32px;font-weight:800" id="confirm-from-amt"></div>
              <div style="color:var(--color-text-muted);font-size:13px" id="confirm-from-usd"></div>
            </div>
            <div style="font-size:28px" id="confirm-from-icon"></div>
          </div>
          <div style="text-align:center;color:var(--color-text-muted);margin-bottom:16px;font-size:20px">↓</div>
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-size:32px;font-weight:800" id="confirm-to-amt"></div>
              <div style="color:var(--color-text-muted);font-size:13px" id="confirm-to-usd"></div>
            </div>
            <div style="font-size:28px" id="confirm-to-icon"></div>
          </div>
        </div>
        <div style="background:rgba(255,178,55,0.1);border:1px solid rgba(255,178,55,0.2);border-radius:12px;padding:12px;margin-bottom:16px;font-size:12px;color:var(--color-warning)">
          ⚠️ Output is estimated. You will receive at least <span id="confirm-min"></span> or the transaction will revert.
        </div>
        <button class="btn btn-primary btn-full btn-lg" id="confirm-swap-btn" onclick="Swap.confirmSwap()">
          Confirm Swap
        </button>
      </div>
    </div>
  </div>`;
};

/* ===========================
   BUY CRYPTO (ChangeNow)
   =========================== */

Pages.buy = function() {
  return `
  <div class="trade-layout">
    <div class="trade-bg">
      <div class="trade-orb trade-orb-1"></div>
      <div class="trade-orb trade-orb-2"></div>
    </div>
    <div class="trade-content">
      <!-- Tabs -->
      <div class="trade-tabs-bar">
        <div class="tabs">
          <button class="tab-btn" onclick="Router.go('#/swap')">Swap</button>
          <button class="tab-btn" onclick="Router.go('#/liquidity')">Liquidity</button>
          <button class="tab-btn active" onclick="Router.go('#/buy')">Buy Crypto</button>
        </div>
      </div>

      <!-- Buy/Sell Toggle -->
      <div class="buy-crypto-tabs">
        <button class="buy-crypto-tab active" id="buy-tab" onclick="BuyCrypto.setMode('buy', this)">💳 Buy</button>
        <button class="buy-crypto-tab" id="sell-tab" onclick="BuyCrypto.setMode('sell', this)">💵 Sell</button>
      </div>

      <!-- ChangeNow Widget -->
      <div class="changenow-widget-wrap">
        <iframe
          id="changenow-frame"
          src="https://changenow.io/embeds/exchange-widget/v2/widget.html?FAQ=true&amount=0.1&backgroundColor=1C1C2E&darkMode=true&from=btcln&horizontal=false&lang=en-US&link_id=09b6cc57fbb3d824819b93ef437fa36f814c9bf6bab99027a234dd9060010a53&locales=true&logo=false&primaryColor=1FC7D4&to=bnb&toTheMoon=true"
          width="100%"
          height="400px"
          style="border:none;display:block"
          frameborder="0"
          allow="clipboard-write"
        ></iframe>
      </div>

      <!-- Info Cards -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px">
        <div class="card card-sm" style="text-align:center">
          <div style="font-size:24px;margin-bottom:8px">🔒</div>
          <div style="font-size:13px;font-weight:700;margin-bottom:4px">Secure & Safe</div>
          <div style="font-size:12px;color:var(--color-text-muted)">Non-custodial transactions</div>
        </div>
        <div class="card card-sm" style="text-align:center">
          <div style="font-size:24px;margin-bottom:8px">⚡</div>
          <div style="font-size:13px;font-weight:700;margin-bottom:4px">Fast Settlement</div>
          <div style="font-size:12px;color:var(--color-text-muted)">Average 2-5 minutes</div>
        </div>
        <div class="card card-sm" style="text-align:center">
          <div style="font-size:24px;margin-bottom:8px">🌍</div>
          <div style="font-size:13px;font-weight:700;margin-bottom:4px">900+ Coins</div>
          <div style="font-size:12px;color:var(--color-text-muted)">All major assets supported</div>
        </div>
        <div class="card card-sm" style="text-align:center">
          <div style="font-size:24px;margin-bottom:8px">💰</div>
          <div style="font-size:13px;font-weight:700;margin-bottom:4px">Best Rates</div>
          <div style="font-size:12px;color:var(--color-text-muted)">Aggregated from 10+ sources</div>
        </div>
      </div>
    </div>
  </div>`;
};

/* ===========================
   LIQUIDITY PAGE
   =========================== */

Pages.liquidity = function() {
  return `
  <div class="trade-layout">
    <div class="trade-bg">
      <div class="trade-orb trade-orb-1"></div>
      <div class="trade-orb trade-orb-2"></div>
    </div>
    <div class="trade-content">
      <div class="trade-tabs-bar">
        <div class="tabs">
          <button class="tab-btn" onclick="Router.go('#/swap')">Swap</button>
          <button class="tab-btn active">Liquidity</button>
          <button class="tab-btn" onclick="Router.go('#/buy')">Buy Crypto</button>
        </div>
      </div>

      <div class="swap-card">
        <div class="swap-header">
          <h2 class="swap-title">Your Liquidity</h2>
          <button class="btn btn-primary btn-sm" onclick="Liquidity.openAddModal()">+ Add Liquidity</button>
        </div>

        ${AppState.walletConnected ? `
        <div id="lp-positions">
          ${[['CAKE','BNB'], ['ETH','USDT']].map(([t1,t2]) => `
            <div style="background:var(--color-bg-secondary);border-radius:12px;padding:16px;margin-bottom:12px">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                <div style="display:flex;align-items:center;gap:10px">
                  ${Utils.pairIcons(t1, t2)}
                  <span style="font-weight:700">${t1}/${t2}</span>
                  <span class="badge badge-primary">V3 · 0.25%</span>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="Liquidity.manage('${t1}','${t2}')">Manage</button>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
                <div>
                  <div style="font-size:11px;color:var(--color-text-muted);margin-bottom:4px">Your Share</div>
                  <div style="font-weight:700">${Utils.randomFloat(0.01, 2, 2)}%</div>
                </div>
                <div>
                  <div style="font-size:11px;color:var(--color-text-muted);margin-bottom:4px">Pooled ${t1}</div>
                  <div style="font-weight:700">${Utils.randomFloat(0.5, 10, 4)}</div>
                </div>
                <div>
                  <div style="font-size:11px;color:var(--color-text-muted);margin-bottom:4px">Pooled ${t2}</div>
                  <div style="font-weight:700">${Utils.randomFloat(10, 500, 2)}</div>
                </div>
              </div>
            </div>`).join('')}
        </div>
        ` : `
        <div style="text-align:center;padding:40px 20px">
          <div style="font-size:48px;margin-bottom:16px">💧</div>
          <h3 style="margin-bottom:8px">No Liquidity Found</h3>
          <p style="color:var(--color-text-muted);font-size:14px;margin-bottom:20px">Connect your wallet to view your liquidity positions.</p>
          <button class="btn btn-primary" onclick="Wallet.connect()">Connect Wallet</button>
        </div>`}

        <div style="margin-top:16px">
          <button class="btn btn-primary btn-full" onclick="Liquidity.openAddModal()">+ Add Liquidity</button>
        </div>
        <div style="text-align:center;margin-top:12px">
          <button class="btn btn-ghost btn-sm" onclick="Router.go('#/farm')">🚜 Go to Farms to earn CAKE</button>
        </div>
      </div>
    </div>

    <!-- Add Liquidity Modal -->
    <div class="modal-overlay" id="add-liquidity-modal" onclick="if(event.target===this)Utils.closeModal('add-liquidity-modal')">
      <div class="modal" style="max-width:480px">
        <div class="modal-header">
          <h3 class="modal-title">Add Liquidity</h3>
          <button class="modal-close" onclick="Utils.closeModal('add-liquidity-modal')">✕</button>
        </div>
        <div class="token-input-wrap" style="margin-bottom:8px">
          <div class="token-input-label"><span>Token 1</span></div>
          <div class="token-input-row">
            <input class="token-amount-input" type="number" placeholder="0.0">
            <button class="token-selector-btn">🟡 BNB ▾</button>
          </div>
        </div>
        <div style="text-align:center;margin:8px 0;font-size:20px;color:var(--color-text-muted)">+</div>
        <div class="token-input-wrap" style="margin-bottom:16px">
          <div class="token-input-label"><span>Token 2</span></div>
          <div class="token-input-row">
            <input class="token-amount-input" type="number" placeholder="0.0">
            <button class="token-selector-btn">🥞 CAKE ▾</button>
          </div>
        </div>
        <div class="card card-sm" style="margin-bottom:16px">
          <div style="font-size:13px;font-weight:700;margin-bottom:8px">Prices and pool share</div>
          <div class="detail-row" style="margin-bottom:8px"><span class="detail-label">BNB per CAKE</span><span class="detail-value">146.04</span></div>
          <div class="detail-row" style="margin-bottom:8px"><span class="detail-label">CAKE per BNB</span><span class="detail-value">0.00685</span></div>
          <div class="detail-row"><span class="detail-label">Share of Pool</span><span class="detail-value">0.001%</span></div>
        </div>
        <button class="btn btn-primary btn-full btn-lg" onclick="Liquidity.addLiquidity()">Supply</button>
      </div>
    </div>
  </div>`;
};

/* ===========================
   PERPS PAGE
   =========================== */

Pages.perps = function() {
  const pairs = [
    { sym: 'BTC/USD', price: 67234.50, change: +2.14 },
    { sym: 'ETH/USD', price: 3245.67, change: -0.82 },
    { sym: 'BNB/USD', price: 312.45, change: +1.23 },
    { sym: 'SOL/USD', price: 142.30, change: +4.56 },
  ];
  const selected = pairs[0];

  return `
  <div style="padding:16px;height:calc(100vh - 64px);display:flex;flex-direction:column;gap:12px">
    <!-- Pair row -->
    <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px">
      ${pairs.map(p => `
        <button class="token-selector-btn ${p.sym === selected.sym ? 'active' : ''}" style="flex-shrink:0;${p.sym === selected.sym ? 'border-color:var(--color-primary)' : ''}" onclick="Perps.selectPair('${p.sym}')">
          <span style="font-weight:800">${p.sym}</span>
          <span style="font-size:13px">${p.price.toLocaleString()}</span>
          <span class="${p.change >= 0 ? 'text-green' : 'text-red'}" style="font-size:12px">${p.change >= 0 ? '+' : ''}${p.change}%</span>
        </button>`).join('')}
    </div>

    <div class="perps-layout" style="flex:1;min-height:0">
      <!-- Chart -->
      <div class="perps-chart-area">
        <div class="chart-header">
          <div class="chart-pair-selector">
            <div style="display:flex;flex-direction:column">
              <span class="pair-badge" id="perps-pair">BTC/USD</span>
              <span style="font-size:12px;color:var(--color-text-muted)">Perpetual</span>
            </div>
            <div style="display:flex;flex-direction:column;margin-left:16px">
              <span class="pair-price" id="perps-price">$67,234.50</span>
              <span class="price-change up" id="perps-change">+2.14%</span>
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${['1m','5m','15m','1h','4h','1D','1W'].map((t,i) => `
              <button class="tab-btn ${i===5?'active':''}" style="padding:4px 10px;font-size:12px" onclick="this.closest('.chart-header').querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));this.classList.add('active')">${t}</button>`).join('')}
          </div>
        </div>
        <div class="chart-placeholder">
          <canvas id="perps-chart" style="width:100%;height:100%;position:absolute;inset:0"></canvas>
          <div style="position:absolute;bottom:16px;right:16px;font-size:11px;color:var(--color-text-muted)">Powered by PancakeSwap Perps</div>
        </div>
        <!-- Order Book mini -->
        <div style="padding:12px 16px;border-top:1px solid var(--color-border);display:grid;grid-template-columns:repeat(4,1fr);gap:8px;font-size:12px">
          <div><div style="color:var(--color-text-muted)">24h High</div><div style="font-weight:700;color:var(--color-green)">$68,450</div></div>
          <div><div style="color:var(--color-text-muted)">24h Low</div><div style="font-weight:700;color:var(--color-red)">$65,120</div></div>
          <div><div style="color:var(--color-text-muted)">24h Volume</div><div style="font-weight:700">$4.2B</div></div>
          <div><div style="color:var(--color-text-muted)">Open Interest</div><div style="font-weight:700">$890M</div></div>
        </div>
      </div>

      <!-- Trading Panel -->
      <div class="perps-form-area">
        <!-- Long/Short -->
        <div class="long-short-tabs">
          <button class="long-btn" id="long-btn" onclick="Perps.setSide('long')">⬆️ Long</button>
          <button class="short-btn" id="short-btn" onclick="Perps.setSide('short')">⬇️ Short</button>
        </div>

        <!-- Order Type -->
        <div class="tabs" style="align-self:stretch">
          <button class="tab-btn active" onclick="Perps.setOrderType('market',this)">Market</button>
          <button class="tab-btn" onclick="Perps.setOrderType('limit',this)">Limit</button>
          <button class="tab-btn" onclick="Perps.setOrderType('stop',this)">Stop</button>
        </div>

        <!-- Pay Amount -->
        <div>
          <div class="input-label" style="margin-bottom:8px">Pay</div>
          <div class="token-input-wrap">
            <div class="token-input-row">
              <input class="token-amount-input" type="number" id="perps-pay" placeholder="0.0" oninput="Perps.calculate()">
              <button class="token-selector-btn">💵 USDT ▾</button>
            </div>
          </div>
        </div>

        <!-- Leverage -->
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <span class="input-label">Leverage</span>
            <span style="font-weight:800;color:var(--color-primary);font-size:18px" id="leverage-display">10×</span>
          </div>
          <input class="leverage-slider" type="range" min="1" max="150" value="10" id="leverage-slider" oninput="Perps.updateLeverage(this.value)">
          <div class="leverage-marks">
            <span>1×</span><span>25×</span><span>50×</span><span>100×</span><span>150×</span>
          </div>
        </div>

        <!-- Position Details -->
        <div style="background:var(--color-bg-secondary);border-radius:12px;padding:12px">
          <div class="detail-row" style="margin-bottom:8px"><span class="detail-label">Entry Price</span><span id="entry-price" style="font-weight:700">$67,234.50</span></div>
          <div class="detail-row" style="margin-bottom:8px"><span class="detail-label">Liq. Price</span><span id="liq-price" style="font-weight:700;color:var(--color-red)">$61,123.18</span></div>
          <div class="detail-row" style="margin-bottom:8px"><span class="detail-label">Position Size</span><span id="position-size" style="font-weight:700">$0.00</span></div>
          <div class="detail-row"><span class="detail-label">Fees</span><span style="font-weight:700">0.08%</span></div>
        </div>

        <!-- TP/SL -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div>
            <div class="input-label" style="margin-bottom:6px;font-size:11px">Take Profit</div>
            <input class="input-field" type="number" placeholder="TP Price" style="padding:8px 12px;font-size:13px">
          </div>
          <div>
            <div class="input-label" style="margin-bottom:6px;font-size:11px">Stop Loss</div>
            <input class="input-field" type="number" placeholder="SL Price" style="padding:8px 12px;font-size:13px">
          </div>
        </div>

        <!-- Open Position -->
        <button class="btn btn-lg" id="open-position-btn" style="background:var(--color-green);color:var(--color-bg);font-weight:800;border-radius:var(--radius-full);width:100%" onclick="${AppState.walletConnected ? 'Perps.openPosition()' : 'Wallet.connect()'}">
          ${AppState.walletConnected ? '⬆️ Open Long' : 'Connect Wallet'}
        </button>

        <!-- Positions List -->
        <div>
          <div style="font-weight:700;font-size:13px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--color-border)">Open Positions</div>
          <div style="text-align:center;color:var(--color-text-muted);font-size:13px;padding:20px 0">
            No open positions
          </div>
        </div>
      </div>
    </div>
  </div>`;
};
