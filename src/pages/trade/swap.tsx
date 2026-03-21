import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import SwapCard from '../../components/trade/SwapCard';
import TWAPCard from '../../components/trade/TWAPCard';
import LimitCard from '../../components/trade/LimitCard';
import NativeSwapCard from '../../components/trade/NativeSwapCard';
import NativeTWAPCard from '../../components/trade/NativeTWAPCard';
import NativeLimitCard from '../../components/trade/NativeLimitCard';
import { toTVSymbol } from '../../components/trade/TradingViewChart';

const TradingViewChart = dynamic(
  () => import('../../components/trade/TradingViewChart'),
  { ssr: false }
);

/* ─── Layout ─────────────────────────────────────────────────────────────── */
const Page = styled.div`
  min-height: calc(100vh - 56px);
  background: ${({ theme }) => theme.colors.background};
`;

const PageInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 64px;
`;

/* ── When chart is open: side-by-side layout ── */
const WithChart = styled.div`
  display: flex;
  gap: 16px;
  width: 100%;
  max-width: 1400px;
  align-items: flex-start;

  @media (max-width: 968px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ChartCol = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ChartBox = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 20px;
  overflow: hidden;
`;

const ChartHeader = styled.div`
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  flex-wrap: wrap;
`;

const PairName = styled.div`
  font-weight: 700; font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif;
`;

const PriceLabel = styled.div<{ $up: boolean }>`
  font-weight: 700; font-size: 18px;
  color: ${({ $up, theme }) => $up ? theme.colors.success : theme.colors.danger};
  font-family: 'Kanit', sans-serif;
`;

const ChangePill = styled.span<{ $up: boolean }>`
  font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 8px;
  background: ${({ $up, theme }) => ($up ? theme.colors.success : theme.colors.danger) + '20'};
  color: ${({ $up, theme }) => $up ? theme.colors.success : theme.colors.danger};
`;

const IvRow = styled.div`display: flex; gap: 3px; margin-left: auto; flex-wrap: wrap;`;

const IvBtn = styled.button<{ $on?: boolean }>`
  padding: 3px 9px; border-radius: 8px;
  font-size: 12px; font-weight: 600; font-family: 'Kanit', sans-serif;
  border: 1px solid ${({ $on, theme }) => $on ? theme.colors.primary : theme.colors.cardBorder};
  background: ${({ $on, theme }) => $on ? theme.colors.primary + '15' : 'transparent'};
  color: ${({ $on, theme }) => $on ? theme.colors.primary : theme.colors.textSubtle};
  cursor: pointer; transition: all .15s;
`;

/* ── Widget column ── */
const WidgetCol = styled.div`
  width: 440px; flex-shrink: 0;
  display: flex; flex-direction: column;
  @media (max-width: 968px) { width: 100%; max-width: 480px; }
`;

/* ── Tab bar ── */
const TabBar = styled.div`
  display: flex; gap: 4px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 20px 20px 0 0; border-bottom: none;
  padding: 6px;
`;

const Tab = styled.button<{ $on?: boolean }>`
  flex: 1; padding: 9px 4px; border-radius: 14px;
  font-size: 14px; font-weight: 600; font-family: 'Kanit', sans-serif;
  cursor: pointer; border: none; transition: all .15s;
  background: ${({ $on, theme }) => $on ? theme.colors.primary : 'transparent'};
  color: ${({ $on, theme }) => $on ? 'white' : theme.colors.textSubtle};
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

/* 📊 Chart icon button — looks exactly like PancakeSwap's */
const ChartToggleBtn = styled.button<{ $on?: boolean }>`
  width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid ${({ $on, theme }) => $on ? theme.colors.primary : theme.colors.cardBorder};
  background: ${({ $on, theme }) => $on ? theme.colors.primary + '15' : 'transparent'};
  color: ${({ $on, theme }) => $on ? theme.colors.primary : theme.colors.textSubtle};
  cursor: pointer; transition: all .15s; font-size: 14px;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; color: ${({ theme }) => theme.colors.primary}; }
`;

const WidgetWrap = styled.div`
  & > * {
    border-radius: 0 0 20px 20px !important;
    border-top: none !important;
  }
`;

/* ── Pair chips ── */
const PairChips = styled.div`display: flex; gap: 6px; flex-wrap: wrap;`;
const PairChip = styled.button<{ $on?: boolean }>`
  padding: 5px 12px; border-radius: 10px;
  font-size: 13px; font-weight: 600; font-family: 'Kanit', sans-serif;
  border: 1px solid ${({ $on }) => $on ? '#1FC7D4' : '#383241'};
  background: ${({ $on }) => $on ? '#1FC7D420' : 'transparent'};
  color: ${({ $on }) => $on ? '#1FC7D4' : '#7A6EAA'};
  cursor: pointer; transition: all .15s;
`;

/* ── Price data ── */
const PRICES: Record<string, { price: number; change: number }> = {
  'BNB/USDT':  { price: 582.4,  change:  2.34 },
  'BTC/USDT':  { price: 67420,  change:  1.12 },
  'ETH/USDT':  { price: 3218,   change: -0.85 },
  'CAKE/USDT': { price: 2.42,   change:  5.60 },
  'SOL/USDT':  { price: 168.3,  change:  3.21 },
  'ARB/USDT':  { price: 1.24,   change:  1.88 },
  'OP/USDT':   { price: 2.81,   change: -1.20 },
  'MATIC/USDT':{ price: 0.92,   change:  0.44 },
};

const INTERVALS = [
  { label:'1m',  v:'1'   }, { label:'5m',  v:'5'   },
  { label:'15m', v:'15'  }, { label:'1H',  v:'60'  },
  { label:'4H',  v:'240' }, { label:'1D',  v:'D'   },
  { label:'1W',  v:'W'   },
];

type Tab = 'swap' | 'twap' | 'limit';

/* ── Chart icon SVG (same as PancakeSwap) ── */
const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export default function SwapPage() {
  const [tab,        setTab]        = useState<Tab>('swap');
  const [interval,   setInterval]   = useState('15');
  const [pair,       setPair]       = useState('BNB/USDT');
  const [showChart,  setShowChart]  = useState(false);
  const [swapMode,   setSwapMode]   = useState('fork');

  useEffect(() => {
    fetch('/api/admin/data?section=swapSettings')
      .then(r => r.json())
      .then(d => { if (d?.mode) setSwapMode(d.mode); })
      .catch(() => {});
  }, []);

  const isNative = swapMode === 'native';
  const market   = PRICES[pair] || { price: 0, change: 0 };
  const isUp     = market.change >= 0;
  const tvSym    = toTVSymbol(pair.split('/')[0], pair.split('/')[1]);

  const widget = (
    <WidgetCol>
      <TabBar>
        <Tab $on={tab === 'swap'}  onClick={() => setTab('swap')}>Swap</Tab>
        <Tab $on={tab === 'twap'}  onClick={() => setTab('twap')}>TWAP</Tab>
        <Tab $on={tab === 'limit'} onClick={() => setTab('limit')}>Limit</Tab>
        {/* 📊 Chart toggle — next to Limit tab, exactly like PancakeSwap */}
        <ChartToggleBtn $on={showChart} onClick={() => setShowChart(v => !v)} title="Toggle chart">
          <ChartIcon />
        </ChartToggleBtn>
      </TabBar>
      <WidgetWrap>
        {tab === 'swap'  && (isNative ? <NativeSwapCard  /> : <SwapCard  />)}
        {tab === 'twap'  && (isNative ? <NativeTWAPCard  /> : <TWAPCard  />)}
        {tab === 'limit' && (isNative ? <NativeLimitCard /> : <LimitCard />)}
      </WidgetWrap>
    </WidgetCol>
  );

  return (
    <Page>
      <PageInner>
        {showChart ? (
          /* ── Chart open: side-by-side ── */
          <WithChart>
            <ChartCol>
              <ChartBox>
                <ChartHeader>
                  <PairName>{pair}</PairName>
                  <PriceLabel $up={isUp}>
                    ${market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                  </PriceLabel>
                  <ChangePill $up={isUp}>
                    {isUp ? '▲' : '▼'} {Math.abs(market.change).toFixed(2)}%
                  </ChangePill>
                  <IvRow>
                    {INTERVALS.map(iv => (
                      <IvBtn key={iv.v} $on={interval === iv.v} onClick={() => setInterval(iv.v)}>
                        {iv.label}
                      </IvBtn>
                    ))}
                  </IvRow>
                </ChartHeader>
                <TradingViewChart symbol={tvSym} interval={interval} height={460} />
              </ChartBox>

              {/* Pair chips */}
              <PairChips>
                {Object.keys(PRICES).map(p => (
                  <PairChip key={p} $on={pair === p} onClick={() => setPair(p)}>{p}</PairChip>
                ))}
              </PairChips>
            </ChartCol>
            {widget}
          </WithChart>
        ) : (
          /* ── Chart closed: centered widget ── */
          widget
        )}
      </PageInner>
    </Page>
  );
}
