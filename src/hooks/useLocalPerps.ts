import { useState, useCallback, useEffect, useRef } from 'react';
import { PerpMarket, Position, OrderBook, OrderSide, OrderType } from './usePerps';

/* ─── Hook for LOCAL perps (admin-configured markets) ───────────────────── */
export function useLocalPerps() {
  const [markets,       setMarkets]      = useState<PerpMarket[]>([]);
  const [activeMarket,  setActiveMarket] = useState<PerpMarket | null>(null);
  const [orderBook,     setOrderBook]    = useState<OrderBook>({ asks: [], bids: [] });
  const [positions,     setPositions]    = useState<Position[]>([]);
  const [activeTab,     setActiveTab]    = useState<string>('positions');
  const [loading,       setLoading]      = useState(true);
  const priceTimer = useRef<any>(null);

  // Load markets from API
  useEffect(() => {
    fetch('/api/perps?action=markets')
      .then(r => r.ok ? r.json() : [])
      .then((ms: any[]) => {
        if (!Array.isArray(ms) || ms.length === 0) { setLoading(false); return; }
        const mapped: PerpMarket[] = ms.filter(m => m.enabled !== false).map(m => ({
          symbol:       m.symbol,
          baseAsset:    m.baseAsset,
          quoteAsset:   m.quoteAsset,
          markPrice:    m.markPrice,
          indexPrice:   m.indexPrice,
          fundingRate:  m.fundingRate || 0.0001,
          nextFunding:  m.nextFunding || '08:00:00',
          openInterest: m.openInterest || 0,
          volume24h:    m.volume24h || 0,
          change24h:    m.change24h || 0,
          high24h:      m.high24h || m.markPrice * 1.02,
          low24h:       m.low24h  || m.markPrice * 0.98,
          maxLeverage:  m.maxLeverage || 50,
        }));
        setMarkets(mapped);
        setActiveMarket(mapped[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Simulate live price movement
  useEffect(() => {
    if (!activeMarket) return;
    priceTimer.current = setInterval(() => {
      setMarkets(prev => prev.map(m => {
        const delta     = m.markPrice * (Math.random() * 0.002 - 0.001);
        const newPrice  = Math.max(0.0001, m.markPrice + delta);
        const change    = ((newPrice - (m.indexPrice || newPrice)) / (m.indexPrice || newPrice)) * 100;
        return {
          ...m,
          markPrice:  newPrice,
          change24h:  change,
          high24h:    Math.max(m.high24h, newPrice),
          low24h:     Math.min(m.low24h,  newPrice),
          volume24h:  m.volume24h + Math.random() * 50000,
        };
      }));

      // Sync active market
      setActiveMarket(prev => {
        if (!prev) return prev;
        const updated = markets.find(m => m.symbol === prev.symbol);
        return updated || prev;
      });

      // Simulate order book
      generateOrderBook();
    }, 2000);

    return () => clearInterval(priceTimer.current);
  }, [activeMarket?.symbol]);

  const generateOrderBook = useCallback(() => {
    if (!activeMarket) return;
    const price = activeMarket.markPrice;
    const asks: [number, number][] = Array.from({ length: 12 }, (_, i) => [
      price * (1 + (i + 1) * 0.0008),
      Math.random() * 40 + 5,
    ]);
    const bids: [number, number][] = Array.from({ length: 12 }, (_, i) => [
      price * (1 - (i + 1) * 0.0008),
      Math.random() * 40 + 5,
    ]);
    setOrderBook({ asks, bids });
  }, [activeMarket]);

  useEffect(() => { generateOrderBook(); }, [activeMarket?.symbol]);

  const selectMarket = useCallback((m: PerpMarket) => {
    setActiveMarket(m);
  }, []);

  const openPosition = useCallback((
    side:     OrderSide,
    size:     number,
    leverage: number,
    type:     OrderType,
    price?:   number,
  ) => {
    if (!activeMarket) return;
    const entryPrice  = price || activeMarket.markPrice;
    const margin      = (size * entryPrice) / leverage;
    const liqDistance = entryPrice * (1 / leverage) * 0.8;
    const liquidation = side === 'long'
      ? entryPrice - liqDistance
      : entryPrice + liqDistance;

    const pos: Position = {
      id:          Date.now().toString(),
      symbol:      activeMarket.symbol,
      side,
      size,
      entryPrice,
      markPrice:   entryPrice,
      liquidation,
      margin,
      leverage,
      pnl:         0,
      pnlPct:      0,
      fundingFee:  0,
      timestamp:   Date.now(),
    };

    setPositions(prev => [pos, ...prev]);

    // Update open interest
    setMarkets(prev => prev.map(m =>
      m.symbol === activeMarket.symbol
        ? { ...m, openInterest: m.openInterest + size * entryPrice }
        : m
    ));
  }, [activeMarket]);

  const closePosition = useCallback(async (id: string, userAddress?: string) => {
    const pos = positions.find(p => p.id === id);
    if (!pos) return { success: false, message: 'Position not found' };

    const market = markets.find(m => m.symbol === pos.symbol);
    if (!market) return { success: false, message: 'Market not found' };

    // Calculate final PnL using latest mark price
    const closePrice = market.markPrice;

    try {
      const res  = await fetch('/api/perps/payout?action=close-position', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketSymbol: pos.symbol,
          side:         pos.side,
          size:         pos.size,
          entryPrice:   pos.entryPrice,
          closePrice,
          leverage:     pos.leverage,
          margin:       pos.margin,
          userAddress:  userAddress || '',
          quoteAsset:   market.quoteAsset || 'USDT',
        }),
      });
      const data = await res.json();

      // Remove position from local state
      setPositions(prev => prev.filter(p => p.id !== id));

      // Update open interest
      setMarkets(prev => prev.map(m =>
        m.symbol === pos.symbol
          ? { ...m, openInterest: Math.max(0, m.openInterest - pos.size * closePrice) }
          : m
      ));

      return {
        success:    res.ok,
        pnl:        data.pnl,
        payout:     data.payout,
        txId:       data.txId,
        pending:    data.pending,
        noWallet:   data.noWallet,
        message:    data.message || data.error,
        isWin:      (data.pnl || 0) > 0,
      };
    } catch (e: any) {
      // Still close position locally even if API fails
      setPositions(prev => prev.filter(p => p.id !== id));
      return { success: false, message: e.message };
    }
  }, [positions, markets]);

  // Update PnL for positions
  useEffect(() => {
    if (!activeMarket) return;
    setPositions(prev => prev.map(p => {
      if (p.symbol !== activeMarket.symbol) return p;
      const currentPrice = activeMarket.markPrice;
      const pnl = p.side === 'long'
        ? (currentPrice - p.entryPrice) * p.size
        : (p.entryPrice - currentPrice) * p.size;
      const pnlPct = (pnl / (p.margin)) * 100;
      return { ...p, markPrice: currentPrice, pnl, pnlPct };
    }));
  }, [activeMarket?.markPrice]);

  return {
    markets,
    activeMarket: activeMarket || {
      symbol: 'BTCUSDT', baseAsset: 'BTC', quoteAsset: 'USDT',
      markPrice: 0, indexPrice: 0, fundingRate: 0, nextFunding: '--:--:--',
      openInterest: 0, volume24h: 0, change24h: 0,
      high24h: 0, low24h: 0, maxLeverage: 50,
    },
    orderBook,
    positions,
    activeTab,
    setActiveTab,
    selectMarket,
    openPosition,
    closePosition,
    loading,
    isEmpty: markets.length === 0,
  };
}
