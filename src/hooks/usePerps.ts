import { useState, useCallback, useEffect } from 'react';

export type OrderSide = 'long' | 'short';
export type OrderType = 'market' | 'limit' | 'stop';

export interface Position {
  id:           string;
  symbol:       string;
  side:         OrderSide;
  size:         number;
  entryPrice:   number;
  markPrice:    number;
  liquidation:  number;
  margin:       number;
  leverage:     number;
  pnl:          number;
  pnlPct:       number;
  fundingFee:   number;
  timestamp:    number;
}

export interface OrderBook {
  asks: [number, number][]; // [price, size]
  bids: [number, number][];
}

export interface Candle {
  time:   number;
  open:   number;
  high:   number;
  low:    number;
  close:  number;
  volume: number;
}

export interface PerpMarket {
  symbol:       string;
  baseAsset:    string;
  quoteAsset:   string;
  markPrice:    number;
  indexPrice:   number;
  fundingRate:  number;
  nextFunding:  string;
  openInterest: number;
  volume24h:    number;
  change24h:    number;
  high24h:      number;
  low24h:       number;
  maxLeverage:  number;
}

// ─── All PancakeSwap Perpetuals pairs (powered by Aster/ApolloX) ───────────
// Includes crypto pairs + Stock Perps (AAPL, AMZN, TSLA) as listed on PancakeSwap
const BASE_MARKETS: PerpMarket[] = [
  // ── Tier 1 — Major crypto (highest liquidity, up to 150x) ──────────────
  { symbol:'BTCUSDT',   baseAsset:'BTC',   quoteAsset:'USDT', markPrice:67420.00, indexPrice:67385.00, fundingRate:0.00020, nextFunding:'04:23:11', openInterest:980000000,  volume24h:3200000000, change24h:1.12,  high24h:68100.0, low24h:66200.0, maxLeverage:150 },
  { symbol:'ETHUSDT',   baseAsset:'ETH',   quoteAsset:'USDT', markPrice:3218.50,  indexPrice:3215.80,  fundingRate:0.00010, nextFunding:'04:23:11', openInterest:520000000,  volume24h:1800000000, change24h:-0.85, high24h:3280.0,  low24h:3180.0,  maxLeverage:100 },
  { symbol:'BNBUSDT',   baseAsset:'BNB',   quoteAsset:'USDT', markPrice:582.40,   indexPrice:582.15,   fundingRate:0.00010, nextFunding:'04:23:11', openInterest:142500000,  volume24h:890000000,  change24h:2.34,  high24h:591.0,   low24h:568.5,   maxLeverage:50  },
  { symbol:'SOLUSDT',   baseAsset:'SOL',   quoteAsset:'USDT', markPrice:168.30,   indexPrice:167.95,   fundingRate:0.00008, nextFunding:'04:23:11', openInterest:280000000,  volume24h:920000000,  change24h:3.21,  high24h:172.0,   low24h:162.0,   maxLeverage:75  },
  { symbol:'XRPUSDT',   baseAsset:'XRP',   quoteAsset:'USDT', markPrice:0.5520,   indexPrice:0.5515,   fundingRate:0.00012, nextFunding:'04:23:11', openInterest:198000000,  volume24h:620000000,  change24h:0.88,  high24h:0.568,   low24h:0.541,   maxLeverage:75  },
  // ── Tier 2 — Large cap ─────────────────────────────────────────────────
  { symbol:'ADAUSDT',   baseAsset:'ADA',   quoteAsset:'USDT', markPrice:0.4520,   indexPrice:0.4510,   fundingRate:0.00005, nextFunding:'04:23:11', openInterest:95000000,   volume24h:310000000,  change24h:-1.20, high24h:0.465,   low24h:0.438,   maxLeverage:50  },
  { symbol:'AVAXUSDT',  baseAsset:'AVAX',  quoteAsset:'USDT', markPrice:35.24,    indexPrice:35.18,    fundingRate:0.00009, nextFunding:'04:23:11', openInterest:88000000,   volume24h:285000000,  change24h:1.54,  high24h:36.2,    low24h:34.1,    maxLeverage:50  },
  { symbol:'DOGEUSDT',  baseAsset:'DOGE',  quoteAsset:'USDT', markPrice:0.1618,   indexPrice:0.1615,   fundingRate:0.00015, nextFunding:'04:23:11', openInterest:142000000,  volume24h:480000000,  change24h:2.80,  high24h:0.168,   low24h:0.155,   maxLeverage:50  },
  { symbol:'DOTUSDT',   baseAsset:'DOT',   quoteAsset:'USDT', markPrice:7.82,     indexPrice:7.80,     fundingRate:0.00006, nextFunding:'04:23:11', openInterest:62000000,   volume24h:195000000,  change24h:-0.42, high24h:8.05,    low24h:7.65,    maxLeverage:50  },
  { symbol:'LINKUSDT',  baseAsset:'LINK',  quoteAsset:'USDT', markPrice:14.28,    indexPrice:14.25,    fundingRate:0.00007, nextFunding:'04:23:11', openInterest:74000000,   volume24h:220000000,  change24h:1.92,  high24h:14.8,    low24h:13.9,    maxLeverage:50  },
  { symbol:'LTCUSDT',   baseAsset:'LTC',   quoteAsset:'USDT', markPrice:82.40,    indexPrice:82.20,    fundingRate:0.00006, nextFunding:'04:23:11', openInterest:48000000,   volume24h:165000000,  change24h:-0.65, high24h:84.5,    low24h:81.2,    maxLeverage:50  },
  { symbol:'BCHUSDT',   baseAsset:'BCH',   quoteAsset:'USDT', markPrice:384.20,   indexPrice:383.80,   fundingRate:0.00005, nextFunding:'04:23:11', openInterest:42000000,   volume24h:145000000,  change24h:0.34,  high24h:392.0,   low24h:378.0,   maxLeverage:50  },
  { symbol:'UNIUSDT',   baseAsset:'UNI',   quoteAsset:'USDT', markPrice:8.42,     indexPrice:8.40,     fundingRate:0.00008, nextFunding:'04:23:11', openInterest:38000000,   volume24h:128000000,  change24h:1.15,  high24h:8.72,    low24h:8.18,    maxLeverage:50  },
  { symbol:'ATOMUSDT',  baseAsset:'ATOM',  quoteAsset:'USDT', markPrice:9.18,     indexPrice:9.16,     fundingRate:0.00005, nextFunding:'04:23:11', openInterest:32000000,   volume24h:108000000,  change24h:-0.88, high24h:9.45,    low24h:8.98,    maxLeverage:50  },
  { symbol:'NEARUSDT',  baseAsset:'NEAR',  quoteAsset:'USDT', markPrice:6.94,     indexPrice:6.92,     fundingRate:0.00007, nextFunding:'04:23:11', openInterest:28000000,   volume24h:95000000,   change24h:2.12,  high24h:7.18,    low24h:6.72,    maxLeverage:50  },
  // ── Tier 3 — Mid cap ───────────────────────────────────────────────────
  { symbol:'MATICUSDT', baseAsset:'MATIC', quoteAsset:'USDT', markPrice:0.7240,   indexPrice:0.7230,   fundingRate:0.00006, nextFunding:'04:23:11', openInterest:52000000,   volume24h:168000000,  change24h:-1.42, high24h:0.748,   low24h:0.710,   maxLeverage:50  },
  { symbol:'TRXUSDT',   baseAsset:'TRX',   quoteAsset:'USDT', markPrice:0.1224,   indexPrice:0.1222,   fundingRate:0.00004, nextFunding:'04:23:11', openInterest:38000000,   volume24h:124000000,  change24h:0.55,  high24h:0.126,   low24h:0.119,   maxLeverage:50  },
  { symbol:'XLMUSDT',   baseAsset:'XLM',   quoteAsset:'USDT', markPrice:0.1142,   indexPrice:0.1140,   fundingRate:0.00005, nextFunding:'04:23:11', openInterest:28000000,   volume24h:88000000,   change24h:0.72,  high24h:0.118,   low24h:0.110,   maxLeverage:50  },
  { symbol:'ETCUSDT',   baseAsset:'ETC',   quoteAsset:'USDT', markPrice:26.84,    indexPrice:26.80,    fundingRate:0.00005, nextFunding:'04:23:11', openInterest:22000000,   volume24h:72000000,   change24h:-0.35, high24h:27.4,    low24h:26.2,    maxLeverage:50  },
  { symbol:'FILUSDT',   baseAsset:'FIL',   quoteAsset:'USDT', markPrice:5.82,     indexPrice:5.81,     fundingRate:0.00004, nextFunding:'04:23:11', openInterest:18000000,   volume24h:60000000,   change24h:1.20,  high24h:6.02,    low24h:5.68,    maxLeverage:50  },
  { symbol:'ICPUSDT',   baseAsset:'ICP',   quoteAsset:'USDT', markPrice:11.42,    indexPrice:11.40,    fundingRate:0.00005, nextFunding:'04:23:11', openInterest:20000000,   volume24h:65000000,   change24h:-0.72, high24h:11.8,    low24h:11.1,    maxLeverage:50  },
  { symbol:'AAVEUSDT',  baseAsset:'AAVE',  quoteAsset:'USDT', markPrice:92.40,    indexPrice:92.20,    fundingRate:0.00006, nextFunding:'04:23:11', openInterest:18000000,   volume24h:58000000,   change24h:1.88,  high24h:95.2,    low24h:90.1,    maxLeverage:50  },
  { symbol:'GRTUSDT',   baseAsset:'GRT',   quoteAsset:'USDT', markPrice:0.2142,   indexPrice:0.2140,   fundingRate:0.00004, nextFunding:'04:23:11', openInterest:14000000,   volume24h:48000000,   change24h:0.94,  high24h:0.222,   low24h:0.208,   maxLeverage:25  },
  { symbol:'SUSHIUSDT', baseAsset:'SUSHI', quoteAsset:'USDT', markPrice:1.142,    indexPrice:1.140,    fundingRate:0.00005, nextFunding:'04:23:11', openInterest:12000000,   volume24h:40000000,   change24h:-0.52, high24h:1.18,    low24h:1.11,    maxLeverage:25  },
  { symbol:'COMPUSDT',  baseAsset:'COMP',  quoteAsset:'USDT', markPrice:52.40,    indexPrice:52.20,    fundingRate:0.00005, nextFunding:'04:23:11', openInterest:8000000,    volume24h:28000000,   change24h:1.42,  high24h:54.2,    low24h:51.0,    maxLeverage:25  },
  { symbol:'CRVUSDT',   baseAsset:'CRV',   quoteAsset:'USDT', markPrice:0.4820,   indexPrice:0.4815,   fundingRate:0.00004, nextFunding:'04:23:11', openInterest:10000000,   volume24h:34000000,   change24h:-1.10, high24h:0.498,   low24h:0.469,   maxLeverage:25  },
  { symbol:'MKRUSDT',   baseAsset:'MKR',   quoteAsset:'USDT', markPrice:1842.00,  indexPrice:1840.00,  fundingRate:0.00004, nextFunding:'04:23:11', openInterest:6000000,    volume24h:20000000,   change24h:0.68,  high24h:1895.0,  low24h:1800.0,  maxLeverage:25  },
  { symbol:'SNXUSDT',   baseAsset:'SNX',   quoteAsset:'USDT', markPrice:2.842,    indexPrice:2.838,    fundingRate:0.00004, nextFunding:'04:23:11', openInterest:8000000,    volume24h:26000000,   change24h:-0.35, high24h:2.94,    low24h:2.78,    maxLeverage:25  },
  { symbol:'1INCHUSDT', baseAsset:'1INCH', quoteAsset:'USDT', markPrice:0.3820,   indexPrice:0.3815,   fundingRate:0.00004, nextFunding:'04:23:11', openInterest:6000000,    volume24h:20000000,   change24h:0.52,  high24h:0.395,   low24h:0.372,   maxLeverage:25  },
  // ── Tier 4 — Gaming / Metaverse / DeFi ────────────────────────────────
  { symbol:'AXSUSDT',   baseAsset:'AXS',   quoteAsset:'USDT', markPrice:6.42,     indexPrice:6.40,     fundingRate:0.00006, nextFunding:'04:23:11', openInterest:16000000,   volume24h:52000000,   change24h:2.42,  high24h:6.65,    low24h:6.22,    maxLeverage:25  },
  { symbol:'SANDUSDT',  baseAsset:'SAND',  quoteAsset:'USDT', markPrice:0.4220,   indexPrice:0.4215,   fundingRate:0.00005, nextFunding:'04:23:11', openInterest:12000000,   volume24h:40000000,   change24h:1.82,  high24h:0.438,   low24h:0.410,   maxLeverage:25  },
  { symbol:'MANAUSDT',  baseAsset:'MANA',  quoteAsset:'USDT', markPrice:0.3520,   indexPrice:0.3515,   fundingRate:0.00005, nextFunding:'04:23:11', openInterest:10000000,   volume24h:34000000,   change24h:-0.85, high24h:0.364,   low24h:0.342,   maxLeverage:25  },
  { symbol:'ENJUSDT',   baseAsset:'ENJ',   quoteAsset:'USDT', markPrice:0.2420,   indexPrice:0.2415,   fundingRate:0.00004, nextFunding:'04:23:11', openInterest:8000000,    volume24h:26000000,   change24h:0.42,  high24h:0.250,   low24h:0.235,   maxLeverage:25  },
  { symbol:'GALAUSDT',  baseAsset:'GALA',  quoteAsset:'USDT', markPrice:0.0342,   indexPrice:0.0341,   fundingRate:0.00006, nextFunding:'04:23:11', openInterest:10000000,   volume24h:32000000,   change24h:3.62,  high24h:0.0355,  low24h:0.0328,  maxLeverage:25  },
  { symbol:'DYDXUSDT',  baseAsset:'DYDX',  quoteAsset:'USDT', markPrice:1.842,    indexPrice:1.840,    fundingRate:0.00005, nextFunding:'04:23:11', openInterest:12000000,   volume24h:38000000,   change24h:-1.22, high24h:1.90,    low24h:1.79,    maxLeverage:25  },
  { symbol:'IMXUSDT',   baseAsset:'IMX',   quoteAsset:'USDT', markPrice:1.642,    indexPrice:1.640,    fundingRate:0.00004, nextFunding:'04:23:11', openInterest:10000000,   volume24h:32000000,   change24h:1.52,  high24h:1.70,    low24h:1.60,    maxLeverage:25  },
  { symbol:'RUNEUSDT',  baseAsset:'RUNE',  quoteAsset:'USDT', markPrice:4.82,     indexPrice:4.81,     fundingRate:0.00005, nextFunding:'04:23:11', openInterest:8000000,    volume24h:26000000,   change24h:0.84,  high24h:4.98,    low24h:4.70,    maxLeverage:25  },
  { symbol:'FLOWUSDT',  baseAsset:'FLOW',  quoteAsset:'USDT', markPrice:0.7420,   indexPrice:0.7415,   fundingRate:0.00004, nextFunding:'04:23:11', openInterest:6000000,    volume24h:20000000,   change24h:-0.54, high24h:0.768,   low24h:0.722,   maxLeverage:25  },
  // ── Tier 5 — Layer 1 / Layer 2 ────────────────────────────────────────
  { symbol:'FTMUSDT',   baseAsset:'FTM',   quoteAsset:'USDT', markPrice:0.7820,   indexPrice:0.7815,   fundingRate:0.00006, nextFunding:'04:23:11', openInterest:14000000,   volume24h:45000000,   change24h:4.20,  high24h:0.812,   low24h:0.752,   maxLeverage:25  },
  { symbol:'ALGOUSDT',  baseAsset:'ALGO',  quoteAsset:'USDT', markPrice:0.1842,   indexPrice:0.1840,   fundingRate:0.00004, nextFunding:'04:23:11', openInterest:8000000,    volume24h:26000000,   change24h:-0.22, high24h:0.190,   low24h:0.179,   maxLeverage:25  },
  { symbol:'VETUSDT',   baseAsset:'VET',   quoteAsset:'USDT', markPrice:0.0342,   indexPrice:0.0341,   fundingRate:0.00004, nextFunding:'04:23:11', openInterest:8000000,    volume24h:26000000,   change24h:0.58,  high24h:0.0354,  low24h:0.0332,  maxLeverage:25  },
  { symbol:'ZECUSDT',   baseAsset:'ZEC',   quoteAsset:'USDT', markPrice:28.40,    indexPrice:28.35,    fundingRate:0.00003, nextFunding:'04:23:11', openInterest:4000000,    volume24h:14000000,   change24h:-0.70, high24h:29.2,    low24h:27.8,    maxLeverage:25  },
  { symbol:'STXUSDT',   baseAsset:'STX',   quoteAsset:'USDT', markPrice:1.842,    indexPrice:1.840,    fundingRate:0.00005, nextFunding:'04:23:11', openInterest:8000000,    volume24h:26000000,   change24h:1.42,  high24h:1.90,    low24h:1.79,    maxLeverage:25  },
  { symbol:'KSMUSDT',   baseAsset:'KSM',   quoteAsset:'USDT', markPrice:28.20,    indexPrice:28.15,    fundingRate:0.00004, nextFunding:'04:23:11', openInterest:4000000,    volume24h:14000000,   change24h:-0.35, high24h:29.0,    low24h:27.5,    maxLeverage:25  },
  // ── CAKE ──────────────────────────────────────────────────────────────
  { symbol:'CAKEUSDT',  baseAsset:'CAKE',  quoteAsset:'USDT', markPrice:2.42,     indexPrice:2.41,     fundingRate:0.00015, nextFunding:'04:23:11', openInterest:12000000,   volume24h:45000000,   change24h:5.60,  high24h:2.55,    low24h:2.28,    maxLeverage:20  },
  // ── Stock Perpetuals (AAPL, AMZN, TSLA — launched on PancakeSwap 2025) ─
  { symbol:'AAPLUSDT',  baseAsset:'AAPL',  quoteAsset:'USDT', markPrice:227.52,   indexPrice:227.40,   fundingRate:0.00003, nextFunding:'04:23:11', openInterest:8000000,    volume24h:18000000,   change24h:0.42,  high24h:229.8,   low24h:225.1,   maxLeverage:10  },
  { symbol:'AMZNUSDT',  baseAsset:'AMZN',  quoteAsset:'USDT', markPrice:198.42,   indexPrice:198.30,   fundingRate:0.00003, nextFunding:'04:23:11', openInterest:6000000,    volume24h:14000000,   change24h:0.68,  high24h:200.5,   low24h:196.8,   maxLeverage:10  },
  { symbol:'TSLAUSDT',  baseAsset:'TSLA',  quoteAsset:'USDT', markPrice:248.64,   indexPrice:248.50,   fundingRate:0.00004, nextFunding:'04:23:11', openInterest:10000000,   volume24h:22000000,   change24h:-1.24, high24h:252.0,   low24h:245.2,   maxLeverage:10  },
];

function generateCandles(basePrice: number, count = 60): Candle[] {
  const candles: Candle[] = [];
  let price = basePrice * 0.92;
  const now = Date.now();
  for (let i = count; i >= 0; i--) {
    const change = (Math.random() - 0.48) * price * 0.018;
    const open   = price;
    const close  = price + change;
    const high   = Math.max(open, close) * (1 + Math.random() * 0.008);
    const low    = Math.min(open, close) * (1 - Math.random() * 0.008);
    candles.push({ time: now - i * 15 * 60 * 1000, open, high, low, close, volume: Math.random() * 5000000 + 500000 });
    price = close;
  }
  return candles;
}

function generateOrderBook(midPrice: number): OrderBook {
  const asks: [number, number][] = [];
  const bids: [number, number][] = [];
  for (let i = 0; i < 12; i++) {
    asks.push([midPrice * (1 + (i + 1) * 0.0002), +(Math.random() * 8 + 0.5).toFixed(3)]);
    bids.push([midPrice * (1 - (i + 1) * 0.0002), +(Math.random() * 8 + 0.5).toFixed(3)]);
  }
  return { asks, bids };
}

export function usePerps() {
  const [markets,       setMarkets]       = useState<PerpMarket[]>(BASE_MARKETS);
  const [activeMarket,  setActiveMarket]  = useState<PerpMarket>(BASE_MARKETS[0]);
  const [orderSide,     setOrderSide]     = useState<OrderSide>('long');
  const [orderType,     setOrderType]     = useState<OrderType>('market');
  const [leverage,      setLeverage]      = useState(10);
  const [margin,        setMargin]        = useState('');
  const [limitPrice,    setLimitPrice]    = useState('');
  const [stopPrice,     setStopPrice]     = useState('');
  const [positions,     setPositions]     = useState<Position[]>([]);
  const [orderBook,     setOrderBook]     = useState<OrderBook>(generateOrderBook(BASE_MARKETS[0].markPrice));
  const [candles,       setCandles]       = useState<Candle[]>(generateCandles(BASE_MARKETS[0].markPrice));
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');
  const [activeTab,     setActiveTab]     = useState<'positions'|'orders'|'history'>('positions');

  // Simulate live price ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets(prev => prev.map(m => {
        const tick   = (Math.random() - 0.498) * m.markPrice * 0.0008;
        const newPrice = +(m.markPrice + tick).toFixed(m.markPrice > 100 ? 2 : 4);
        return { ...m, markPrice: newPrice, indexPrice: +(newPrice * (1 - 0.0003)).toFixed(m.markPrice > 100 ? 2 : 4) };
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Sync active market price
  useEffect(() => {
    const updated = markets.find(m => m.symbol === activeMarket.symbol);
    if (updated) setActiveMarket(updated);
  }, [markets, activeMarket.symbol]);

  // Update positions PnL
  useEffect(() => {
    if (positions.length === 0) return;
    setPositions(prev => prev.map(p => {
      const market = markets.find(m => m.symbol === p.symbol);
      if (!market) return p;
      const priceDiff = market.markPrice - p.entryPrice;
      const pnl       = (p.side === 'long' ? priceDiff : -priceDiff) * p.size;
      const pnlPct    = (pnl / p.margin) * 100;
      return { ...p, markPrice: market.markPrice, pnl: +pnl.toFixed(4), pnlPct: +pnlPct.toFixed(2) };
    }));
  }, [markets]);

  // Regenerate order book on market change
  useEffect(() => {
    setOrderBook(generateOrderBook(activeMarket.markPrice));
    setCandles(generateCandles(activeMarket.markPrice));
  }, [activeMarket.symbol]);

  const selectMarket = useCallback((m: PerpMarket) => {
    setActiveMarket(m);
    setMargin('');
    setLimitPrice('');
  }, []);

  const placeOrder = useCallback(async () => {
    if (!margin || Number(margin) <= 0) { setError('Enter margin amount'); return; }
    if (orderType === 'limit' && !limitPrice) { setError('Enter limit price'); return; }
    setLoading(true); setError('');
    try {
      await new Promise(r => setTimeout(r, 900));
      const entryPrice  = orderType === 'limit' ? Number(limitPrice) : activeMarket.markPrice;
      const size        = (Number(margin) * leverage) / entryPrice;
      const liqOffset   = orderSide === 'long' ? -0.9 / leverage : 0.9 / leverage;
      const newPosition: Position = {
        id:          Date.now().toString(),
        symbol:      activeMarket.symbol,
        side:        orderSide,
        size:        +size.toFixed(6),
        entryPrice,
        markPrice:   activeMarket.markPrice,
        liquidation: +(entryPrice * (1 + liqOffset)).toFixed(2),
        margin:      Number(margin),
        leverage,
        pnl:         0,
        pnlPct:      0,
        fundingFee:  0,
        timestamp:   Date.now(),
      };
      setPositions(prev => [...prev, newPosition]);
      setMargin('');
    } catch (e: any) {
      setError(e.message || 'Order failed');
    } finally { setLoading(false); }
  }, [margin, orderType, limitPrice, activeMarket, orderSide, leverage]);

  const closePosition = useCallback((id: string) => {
    setPositions(prev => prev.filter(p => p.id !== id));
  }, []);

  const positionSize = margin && leverage
    ? ((Number(margin) * leverage) / (orderType === 'limit' && limitPrice ? Number(limitPrice) : activeMarket.markPrice)).toFixed(4)
    : '0';

  return {
    markets, activeMarket, selectMarket,
    orderSide, setOrderSide, orderType, setOrderType,
    leverage, setLeverage, margin, setMargin,
    limitPrice, setLimitPrice, stopPrice, setStopPrice,
    positions, orderBook, candles, loading, error,
    activeTab, setActiveTab, placeOrder, closePosition,
    positionSize,
  };
}
