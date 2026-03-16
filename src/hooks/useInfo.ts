import { useState, useEffect } from 'react';

export interface TokenStat {
  symbol:    string;
  name:      string;
  logoURI:   string;
  price:     number;
  change24h: number;
  volume24h: number;
  liquidity: number;
  txns24h:   number;
}

export interface PairStat {
  token0:    string;
  token1:    string;
  logo0:     string;
  logo1:     string;
  volume24h: number;
  volume7d:  number;
  liquidity: number;
  fees24h:   number;
  apr:       number;
  txns24h:   number;
}

export interface ChartPoint { time: number; value: number; }

const BASE_TOKENS: TokenStat[] = [
  { symbol:'CAKE', name:'PancakeSwap Token', logoURI:'https://tokens.pancakeswap.finance/images/symbol/cake.png',  price:2.42,   change24h:3.21,  volume24h:48200000,  liquidity:284000000, txns24h:42100 },
  { symbol:'BNB',  name:'BNB',               logoURI:'https://tokens.pancakeswap.finance/images/symbol/bnb.png',   price:582.40, change24h:1.84,  volume24h:890000000, liquidity:1420000000,txns24h:182000},
  { symbol:'BUSD', name:'Binance USD',        logoURI:'https://tokens.pancakeswap.finance/images/symbol/busd.png',  price:1.00,   change24h:0.01,  volume24h:320000000, liquidity:890000000, txns24h:64000 },
  { symbol:'ETH',  name:'Ethereum Token',     logoURI:'https://tokens.pancakeswap.finance/images/symbol/eth.png',   price:3218.50,change24h:-0.85, volume24h:210000000, liquidity:312000000, txns24h:29400 },
  { symbol:'USDT', name:'Tether USD',         logoURI:'https://tokens.pancakeswap.finance/images/symbol/usdt.png',  price:1.00,   change24h:0.02,  volume24h:480000000, liquidity:672000000, txns24h:91000 },
  { symbol:'BTCB', name:'BTCB Token',         logoURI:'https://tokens.pancakeswap.finance/images/symbol/btcb.png',  price:67420,  change24h:1.12,  volume24h:180000000, liquidity:198000000, txns24h:18200 },
  { symbol:'USDC', name:'USD Coin',           logoURI:'https://tokens.pancakeswap.finance/images/symbol/usdc.png',  price:1.00,   change24h:-0.01, volume24h:290000000, liquidity:520000000, txns24h:52000 },
  { symbol:'ADA',  name:'Cardano Token',      logoURI:'https://tokens.pancakeswap.finance/images/symbol/ada.png',   price:0.452,  change24h:-1.20, volume24h:42000000,  liquidity:87000000,  txns24h:14800 },
];

const BASE_PAIRS: PairStat[] = [
  { token0:'CAKE',token1:'BNB', logo0:'https://tokens.pancakeswap.finance/images/symbol/cake.png', logo1:'https://tokens.pancakeswap.finance/images/symbol/bnb.png',  volume24h:48200000, volume7d:298000000, liquidity:284000000,fees24h:120500, apr:42.18, txns24h:42100 },
  { token0:'BNB', token1:'BUSD',logo0:'https://tokens.pancakeswap.finance/images/symbol/bnb.png',  logo1:'https://tokens.pancakeswap.finance/images/symbol/busd.png', volume24h:89000000, volume7d:612000000, liquidity:520000000,fees24h:222500, apr:18.54, txns24h:71200 },
  { token0:'ETH', token1:'BNB', logo0:'https://tokens.pancakeswap.finance/images/symbol/eth.png',  logo1:'https://tokens.pancakeswap.finance/images/symbol/bnb.png',  volume24h:54000000, volume7d:340000000, liquidity:312000000,fees24h:135000, apr:24.67, txns24h:32400 },
  { token0:'USDT',token1:'BUSD',logo0:'https://tokens.pancakeswap.finance/images/symbol/usdt.png', logo1:'https://tokens.pancakeswap.finance/images/symbol/busd.png', volume24h:120000000,volume7d:820000000, liquidity:890000000,fees24h:300000, apr:8.21,  txns24h:94500 },
  { token0:'BTCB',token1:'BNB', logo0:'https://tokens.pancakeswap.finance/images/symbol/btcb.png', logo1:'https://tokens.pancakeswap.finance/images/symbol/bnb.png',  volume24h:38000000, volume7d:241000000, liquidity:198000000,fees24h:95000,  apr:21.33, txns24h:21800 },
  { token0:'USDC',token1:'BUSD',logo0:'https://tokens.pancakeswap.finance/images/symbol/usdc.png', logo1:'https://tokens.pancakeswap.finance/images/symbol/busd.png', volume24h:96000000, volume7d:650000000, liquidity:672000000,fees24h:240000, apr:7.88,  txns24h:48200 },
];

function makeTVLHistory(): ChartPoint[] {
  const points: ChartPoint[] = [];
  let val = 3800000000;
  for (let i = 30; i >= 0; i--) {
    val += (Math.random() - 0.45) * 80000000;
    points.push({ time: Date.now() - i * 86400000, value: Math.max(val, 2000000000) });
  }
  return points;
}

function makeVolumeHistory(): ChartPoint[] {
  const points: ChartPoint[] = [];
  for (let i = 30; i >= 0; i--) {
    points.push({ time: Date.now() - i * 86400000, value: 800000000 + Math.random() * 400000000 });
  }
  return points;
}

export function useInfo() {
  const [tokens,     setTokens]     = useState<TokenStat[]>(BASE_TOKENS);
  const [pairs,      setPairs]      = useState<PairStat[]>(BASE_PAIRS);
  const [tvlHistory, setTvlHistory] = useState<ChartPoint[]>(makeTVLHistory());
  const [volHistory, setVolHistory] = useState<ChartPoint[]>(makeVolumeHistory());
  const [tab,        setTab]        = useState<'overview'|'tokens'|'pairs'>('overview');
  const [search,     setSearch]     = useState('');
  const [sortTokens, setSortTokens] = useState<'volume'|'price'|'change'|'liquidity'>('volume');
  const [sortPairs,  setSortPairs]  = useState<'volume'|'liquidity'|'fees'|'apr'>('volume');

  // Live ticks
  useEffect(() => {
    const t = setInterval(() => {
      setTokens(prev => prev.map(tk => ({
        ...tk,
        price: +(tk.price * (1 + (Math.random() - 0.498) * 0.003)).toFixed(
          tk.price > 1000 ? 2 : tk.price > 1 ? 4 : 6
        ),
        volume24h: +(tk.volume24h * (1 + (Math.random() - 0.5) * 0.01)).toFixed(0),
      })));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const totalTVL    = tokens.reduce((s, t) => s + t.liquidity, 0);
  const totalVol24h = tokens.reduce((s, t) => s + t.volume24h, 0);
  const totalFees24h= pairs.reduce((s, p) => s + p.fees24h, 0);
  const totalTxns   = tokens.reduce((s, t) => s + t.txns24h, 0);

  const filteredTokens = tokens
    .filter(t => !search || t.symbol.toLowerCase().includes(search.toLowerCase()) || t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortTokens === 'volume')    return b.volume24h  - a.volume24h;
      if (sortTokens === 'price')     return b.price      - a.price;
      if (sortTokens === 'change')    return b.change24h  - a.change24h;
      if (sortTokens === 'liquidity') return b.liquidity  - a.liquidity;
      return 0;
    });

  const filteredPairs = pairs
    .filter(p => !search || `${p.token0}/${p.token1}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortPairs === 'volume')    return b.volume24h - a.volume24h;
      if (sortPairs === 'liquidity') return b.liquidity - a.liquidity;
      if (sortPairs === 'fees')      return b.fees24h   - a.fees24h;
      if (sortPairs === 'apr')       return b.apr       - a.apr;
      return 0;
    });

  return {
    tokens: filteredTokens, pairs: filteredPairs,
    tvlHistory, volHistory,
    totalTVL, totalVol24h, totalFees24h, totalTxns,
    tab, setTab, search, setSearch,
    sortTokens, setSortTokens, sortPairs, setSortPairs,
  };
}
