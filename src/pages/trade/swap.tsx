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

/* TradingView loads only client-side (no SSR) */
const TradingViewChart = dynamic(
  () => import('../../components/trade/TradingViewChart'),
  { ssr: false }
);

/* ─── Layout ─────────────────────────────────────────────────────────────── */
const Page = styled.div`
  min-height: calc(100vh - 56px);
  background: ${({ theme }) => theme.colors.background};
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  display: flex;
  flex: 1;
  gap: 0;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 24px 16px;
  gap: 16px;

  @media (max-width: 968px) {
    flex-direction: column;
  }
`;

/* ── Left: chart ── */
const ChartSection = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ChartCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px;
  overflow: hidden;
  flex: 1;
  min-height: 480px;
`;

const PairHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  flex-wrap: wrap;
`;

const PairName = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif;
`;

const PriceDisplay = styled.div<{ $up: boolean }>`
  font-size: 22px;
  font-weight: 700;
  color: ${({ $up, theme }) => $up ? theme.colors.success : theme.colors.danger};
  font-family: 'Kanit', sans-serif;
`;

const ChangeBadge = styled.span<{ $up: boolean }>`
  font-size: 13px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 8px;
  background: ${({ $up, theme }) => $up ? theme.colors.success + '20' : theme.colors.danger + '20'};
  color: ${({ $up, theme }) => $up ? theme.colors.success : theme.colors.danger};
`;

const IntervalRow = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const IntervalBtn = styled.button<{ $active?: boolean }>`
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Kanit', sans-serif;
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.cardBorder};
  background: ${({ $active, theme }) => $active ? theme.colors.primary + '15' : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.textSubtle};
  cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

/* ── Right: widget panel ── */
const WidgetSection = styled.div`
  width: 440px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 0;

  @media (max-width: 968px) {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
  }
`;

const TabRow = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 18px 18px 0 0;
  border-bottom: none;
  padding: 6px;
  gap: 4px;
`;

const TabBtn = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 10px 8px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Kanit', sans-serif;
  cursor: pointer;
  border: none;
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.textSubtle};
  transition: all 0.15s;
  &:hover { color: ${({ theme }) => theme.colors.text}; background: ${({ theme }) => theme.colors.input}; }
`;

const WidgetWrap = styled.div`
  & > * {
    border-radius: 0 0 24px 24px !important;
    border-top: none !important;
  }
`;

/* ── Market data (mock prices for header) ── */
const MARKET_DATA: Record<string, { price: number; change: number }> = {
  'BNB/USDT':   { price: 582.40, change: 2.34  },
  'BTC/USDT':   { price: 67420,  change: 1.12  },
  'ETH/USDT':   { price: 3218,   change: -0.85 },
  'CAKE/USDT':  { price: 2.42,   change: 5.60  },
  'SOL/USDT':   { price: 168.30, change: 3.21  },
};

const INTERVALS = [
  { label: '1m',  value: '1'   },
  { label: '5m',  value: '5'   },
  { label: '15m', value: '15'  },
  { label: '1H',  value: '60'  },
  { label: '4H',  value: '240' },
  { label: '1D',  value: 'D'   },
  { label: '1W',  value: 'W'   },
];

type SwapTab = 'swap' | 'twap' | 'limit';

export default function SwapPage() {
  const [activeTab,  setActiveTab]  = useState<SwapTab>('swap');
  const [interval,   setInterval]   = useState('15');
  const [activePair, setActivePair] = useState('BNB/USDT');
  const [swapMode,   setSwapMode]   = useState('fork');

  // Load swap mode from admin settings
  useEffect(() => {
    fetch('/api/admin/data?section=swapSettings')
      .then(r => r.json())
      .then(d => { if (d?.mode) setSwapMode(d.mode); })
      .catch(() => {});
  }, []);

  const isNative = swapMode === 'native';

  const market   = MARKET_DATA[activePair] || { price: 0, change: 0 };
  const isUp     = market.change >= 0;
  const tvSymbol = toTVSymbol(activePair.split('/')[0], activePair.split('/')[1]);

  return (
    <Page>
      <Container>
        {/* ── Left: TradingView Chart ── */}
        <ChartSection>
          <ChartCard>
            {/* Pair header + stats */}
            <PairHeader>
              <PairName>{activePair}</PairName>
              <PriceDisplay $up={isUp}>
                ${market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
              </PriceDisplay>
              <ChangeBadge $up={isUp}>
                {isUp ? '▲' : '▼'} {Math.abs(market.change).toFixed(2)}%
              </ChangeBadge>

              {/* Interval buttons */}
              <IntervalRow style={{ marginLeft: 'auto' }}>
                {INTERVALS.map(iv => (
                  <IntervalBtn
                    key={iv.value}
                    $active={interval === iv.value}
                    onClick={() => setInterval(iv.value)}
                  >
                    {iv.label}
                  </IntervalBtn>
                ))}
              </IntervalRow>
            </PairHeader>

            {/* Chart */}
            <div style={{ height: 'calc(100% - 64px)', minHeight: 440 }}>
              <TradingViewChart
                symbol={tvSymbol}
                interval={interval}
                height={440}
              />
            </div>
          </ChartCard>

          {/* Pair selector chips below chart */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.keys(MARKET_DATA).map(pair => (
              <button
                key={pair}
                onClick={() => setActivePair(pair)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 10,
                  border: `1px solid ${activePair === pair ? '#1FC7D4' : '#383241'}`,
                  background: activePair === pair ? '#1FC7D420' : 'transparent',
                  color: activePair === pair ? '#1FC7D4' : '#7A6EAA',
                  fontFamily: 'Kanit,sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all .15s',
                }}
              >
                {pair}
              </button>
            ))}
          </div>
        </ChartSection>

        {/* ── Right: Swap / TWAP / Limit widget ── */}
        <WidgetSection>
          <TabRow>
            <TabBtn $active={activeTab === 'swap'}  onClick={() => setActiveTab('swap')}>🔄 Swap</TabBtn>
            <TabBtn $active={activeTab === 'twap'}  onClick={() => setActiveTab('twap')}>⏱ TWAP</TabBtn>
            <TabBtn $active={activeTab === 'limit'} onClick={() => setActiveTab('limit')}>📋 Limit</TabBtn>
          </TabRow>
          <WidgetWrap>
            {activeTab === 'swap'  && (isNative ? <NativeSwapCard  /> : <SwapCard  />)}
            {activeTab === 'twap'  && (isNative ? <NativeTWAPCard  /> : <TWAPCard  />)}
            {activeTab === 'limit' && (isNative ? <NativeLimitCard /> : <LimitCard />)}
          </WidgetWrap>
        </WidgetSection>
      </Container>
    </Page>
  );
}
