import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { usePerps } from '../hooks/usePerps';
import { useThemeContext } from '../context/ThemeContext';
import PriceChart from '../components/trade/PriceChart';
import OrderBookPanel from '../components/trade/OrderBook';
import OrderPanel from '../components/trade/OrderPanel';
import PositionsTable from '../components/trade/PositionsTable';
import { Text } from '../components/ui/Typography';

/* ─── Layout ─────────────────────────────────────────────────────────────── */
const Page = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px);
  background: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;

const TopBar = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  overflow-x: auto;
  flex-shrink: 0;
`;

const MarketBtn = styled.button<{ active?: boolean }>`
  padding: 10px 16px;
  border: none;
  border-bottom: 2px solid ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  background: transparent;
  font-size: 14px;
  font-weight: ${({ active }) => active ? 700 : 500};
  font-family: 'Kanit', sans-serif;
  color: ${({ active, theme }) => active ? theme.colors.text : theme.colors.textSubtle};
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const TickerBar = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 8px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  overflow-x: auto;
  flex-shrink: 0;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const TickerItem = styled.div``;
const TickerLabel = styled.div`font-size: 11px; color: ${({ theme }) => theme.colors.textSubtle};`;
const TickerValue = styled.div<{ up?: boolean; down?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  font-family: 'Roboto Mono', monospace;
  color: ${({ up, down, theme }) => up ? theme.colors.success : down ? theme.colors.danger : theme.colors.text};
`;

/* Main 3-column layout */
const MainArea = styled.div`
  display: grid;
  grid-template-columns: 1fr 220px 300px;
  flex: 1;
  overflow: hidden;
  min-height: 0;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr 200px;
  }
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }
`;

const ChartArea = styled.div`
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${({ theme }) => theme.colors.cardBorder};
  overflow: hidden;
`;

const ChartWrapper = styled.div`
  flex: 1;
  min-height: 0;
`;

const BottomPanel = styled.div`
  height: 200px;
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  overflow: auto;
  flex-shrink: 0;
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${({ theme }) => theme.colors.cardBorder};
  overflow: hidden;

  @media (max-width: 1100px) { display: none; }
`;

const OrderAreaPanel = styled.div`
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.backgroundAlt};
`;

export default function PerpsPage() {
  const { isDark } = useThemeContext();
  const perps = usePerps();
  const { markets, activeMarket, selectMarket, candles, orderBook, positions, closePosition, activeTab, setActiveTab } = perps;
  const [category,   setCategory]  = useState<'All'|'Crypto'|'Stocks'>('All');
  const [searchQ,    setSearchQ]   = useState('');
  const [perpsMode,  setPerpsMode] = useState('fork');

  // Load perps mode from admin
  useEffect(() => {
    fetch('/api/perps?action=settings')
      .then(r => r.json())
      .then(d => { if (d?.mode) setPerpsMode(d.mode); })
      .catch(() => {});
  }, []);

  // If local mode, redirect to local perps page
  if (typeof window !== 'undefined' && perpsMode === 'local') {
    window.location.href = '/trade/local-perps';
    return null;
  }

  const change24hUp = activeMarket.change24h >= 0;

  const STOCK_SYMBOLS = ['AAPLUSDT','AMZNUSDT','TSLAUSDT'];
  const filteredMarkets = markets.filter(m => {
    if (category === 'Stocks') return STOCK_SYMBOLS.includes(m.symbol);
    if (category === 'Crypto') return !STOCK_SYMBOLS.includes(m.symbol);
    return true;
  }).filter(m =>
    !searchQ || m.baseAsset.toLowerCase().includes(searchQ.toLowerCase()) || m.symbol.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <Page>
      {/* Category filter + market search bar */}
      <TopBar>
        {/* Category tabs */}
        <div style={{ display:'flex', alignItems:'center', borderRight:`1px solid`, padding:'0 8px', gap:2, flexShrink:0 }}>
          {(['All','Crypto','Stocks'] as const).map(cat => (
            <MarketBtn
              key={cat}
              active={category === cat}
              onClick={() => setCategory(cat)}
              style={{ padding:'10px 10px', fontSize:13 }}
            >
              {cat === 'Stocks' ? '📈 Stocks' : cat === 'Crypto' ? '🔷 Crypto' : 'All'}
            </MarketBtn>
          ))}
        </div>

        {/* Search */}
        <div style={{ display:'flex', alignItems:'center', padding:'0 8px', flexShrink:0 }}>
          <input
            placeholder="Search…"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            style={{
              padding:'4px 10px', borderRadius:8, border:'1px solid',
              background:'transparent', fontSize:12, width:90, outline:'none',
              fontFamily:'Kanit,sans-serif',
            }}
          />
        </div>

        {/* Market buttons */}
        {filteredMarkets.map(m => {
          const isStock = STOCK_SYMBOLS.includes(m.symbol);
          return (
            <MarketBtn key={m.symbol} active={activeMarket.symbol === m.symbol} onClick={() => selectMarket(m)}>
              {isStock && <span style={{ fontSize:10, marginRight:3 }}>📈</span>}
              {m.baseAsset}/USDT
              <span style={{ fontSize:10, marginLeft:4, opacity:0.6 }}>{m.maxLeverage}×</span>
            </MarketBtn>
          );
        })}
      </TopBar>

      {/* Ticker info bar */}
      <TickerBar>
        <TickerItem>
          <TickerLabel>Mark Price</TickerLabel>
          <TickerValue up={change24hUp} down={!change24hUp} style={{ fontSize: 18 }}>
            {activeMarket.markPrice.toFixed(activeMarket.markPrice > 100 ? 2 : 4)}
          </TickerValue>
        </TickerItem>
        <TickerItem>
          <TickerLabel>Index Price</TickerLabel>
          <TickerValue>{activeMarket.indexPrice.toFixed(activeMarket.markPrice > 100 ? 2 : 4)}</TickerValue>
        </TickerItem>
        <TickerItem>
          <TickerLabel>24h Change</TickerLabel>
          <TickerValue up={change24hUp} down={!change24hUp}>
            {change24hUp ? '+' : ''}{activeMarket.change24h.toFixed(2)}%
          </TickerValue>
        </TickerItem>
        <TickerItem>
          <TickerLabel>24h High</TickerLabel>
          <TickerValue>{activeMarket.high24h.toFixed(2)}</TickerValue>
        </TickerItem>
        <TickerItem>
          <TickerLabel>24h Low</TickerLabel>
          <TickerValue>{activeMarket.low24h.toFixed(2)}</TickerValue>
        </TickerItem>
        <TickerItem>
          <TickerLabel>24h Volume</TickerLabel>
          <TickerValue>{(activeMarket.volume24h / 1_000_000).toFixed(1)}M</TickerValue>
        </TickerItem>
        <TickerItem>
          <TickerLabel>Open Interest</TickerLabel>
          <TickerValue>{(activeMarket.openInterest / 1_000_000).toFixed(1)}M</TickerValue>
        </TickerItem>
        <TickerItem>
          <TickerLabel>Funding Rate</TickerLabel>
          <TickerValue up={activeMarket.fundingRate >= 0}>
            {(activeMarket.fundingRate * 100).toFixed(4)}% / {activeMarket.nextFunding}
          </TickerValue>
        </TickerItem>
        <TickerItem>
          <TickerLabel>Max Leverage</TickerLabel>
          <TickerValue>{activeMarket.maxLeverage}×</TickerValue>
        </TickerItem>
      </TickerBar>

      {/* Main layout */}
      <MainArea>
        {/* Chart + Positions */}
        <ChartArea>
          <ChartWrapper>
            <PriceChart candles={candles} symbol={activeMarket.symbol} isDark={isDark} />
          </ChartWrapper>
          <BottomPanel>
            <PositionsTable
              positions={positions}
              onClose={closePosition}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </BottomPanel>
        </ChartArea>

        {/* Order book */}
        <RightPanel>
          <OrderBookPanel
            orderBook={orderBook}
            markPrice={activeMarket.markPrice}
            symbol={activeMarket.symbol}
          />
        </RightPanel>

        {/* Order form */}
        <OrderAreaPanel>
          <OrderPanel perps={perps} />
        </OrderAreaPanel>
      </MainArea>
    </Page>
  );
}
