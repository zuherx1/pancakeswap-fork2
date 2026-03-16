import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import dynamic from 'next/dynamic';
import NativeSwapCard from '../../components/trade/NativeSwapCard';
import NativeTWAPCard from '../../components/trade/NativeTWAPCard';
import NativeLimitCard from '../../components/trade/NativeLimitCard';
import { toTVSymbol } from '../../components/trade/TradingViewChart';
import { TATUM_CHAINS } from '../../utils/tatum';

const TradingViewChart = dynamic(
  () => import('../../components/trade/TradingViewChart'),
  { ssr: false }
);

/* ─── Layout ─────────────────────────────────────────────────────────────── */
const Page = styled.div`
  min-height: calc(100vh - 56px);
  background: ${({ theme }) => theme.colors.background};
`;

const TopChainBar = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  &::-webkit-scrollbar { display: none; }
`;

const ChainChip = styled.button<{ $active?: boolean }>`
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px; border-radius: 20px; flex-shrink: 0;
  font-size: 13px; font-weight: 700; font-family: 'Kanit', sans-serif;
  cursor: pointer; transition: all 0.15s;
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.cardBorder};
  background: ${({ $active, theme }) => $active ? theme.colors.primary + '15' : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.textSubtle};
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; color: ${({ theme }) => theme.colors.text}; }
`;

const Container = styled.div`
  display: flex; flex: 1; max-width: 1400px;
  margin: 0 auto; width: 100%; padding: 20px 16px;
  gap: 16px;
  @media(max-width:968px){ flex-direction:column; }
`;

const ChartSection = styled.div`
  flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 12px;
`;

const ChartCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px; overflow: hidden; flex: 1; min-height: 480px;
`;

const PairHeader = styled.div`
  display: flex; align-items: center; gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  flex-wrap: wrap;
`;

const PairName = styled.div`
  font-size: 18px; font-weight: 700; color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif;
`;

const PriceDisplay = styled.div<{ $up: boolean }>`
  font-size: 22px; font-weight: 700;
  color: ${({ $up, theme }) => $up ? theme.colors.success : theme.colors.danger};
  font-family: 'Kanit', sans-serif;
`;

const ChangeBadge = styled.span<{ $up: boolean }>`
  font-size: 13px; font-weight: 600; padding: 3px 9px; border-radius: 8px;
  background: ${({ $up, theme }) => $up ? theme.colors.success + '20' : theme.colors.danger + '20'};
  color: ${({ $up, theme }) => $up ? theme.colors.success : theme.colors.danger};
`;

const IntervalRow = styled.div`display: flex; gap: 4px; flex-wrap: wrap;`;
const IntervalBtn = styled.button<{ $active?: boolean }>`
  padding: 4px 10px; border-radius: 8px;
  font-size: 12px; font-weight: 600; font-family: 'Kanit', sans-serif;
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.cardBorder};
  background: ${({ $active, theme }) => $active ? theme.colors.primary + '15' : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.textSubtle};
  cursor: pointer; transition: all 0.15s;
`;

const WidgetSection = styled.div`
  width: 440px; flex-shrink: 0; display: flex; flex-direction: column;
  @media(max-width:968px){ width: 100%; max-width: 480px; margin: 0 auto; }
`;

const TabRow = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 18px 18px 0 0; border-bottom: none;
  padding: 6px; gap: 4px;
`;

const TabBtn = styled.button<{ $active?: boolean }>`
  flex: 1; padding: 10px 8px; border-radius: 14px;
  font-size: 15px; font-weight: 600; font-family: 'Kanit', sans-serif;
  cursor: pointer; border: none;
  background: ${({ $active, theme }) => $active ? theme.colors.primary : 'transparent'};
  color: ${({ $active, theme }) => $active ? 'white' : theme.colors.textSubtle};
  transition: all 0.15s;
  &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.input}; color: ${({ theme }) => theme.colors.text}; }
`;

const WidgetWrap = styled.div`
  & > * {
    border-radius: 0 0 24px 24px !important;
    border-top: none !important;
  }
`;

const NativeTag = styled.div`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 12px; border-radius: 20px;
  background: ${({ theme }) => theme.colors.success + '15'};
  border: 1px solid ${({ theme }) => theme.colors.success + '30'};
  color: ${({ theme }) => theme.colors.success};
  font-size: 12px; font-weight: 700; font-family: 'Kanit', sans-serif;
  margin-left: 8px;
`;

const LiqBadge = styled.span<{ $has: boolean }>`
  font-size: 11px; padding: 2px 8px; border-radius: 6px; font-weight: 700;
  background: ${({ $has, theme }) => $has ? theme.colors.success + '20' : theme.colors.danger + '20'};
  color: ${({ $has, theme }) => $has ? theme.colors.success : theme.colors.danger};
`;

const INTERVALS = [
  { label: '1m', value: '1' }, { label: '5m', value: '5' },
  { label: '15m', value: '15' }, { label: '1H', value: '60' },
  { label: '4H', value: '240' }, { label: '1D', value: 'D' },
];

const CHAIN_LIST = Object.entries(TATUM_CHAINS).filter(([,c]) => c.isEVM).slice(0, 8);

type SwapTab = 'swap' | 'twap' | 'limit';

export default function NativeExchangePage() {
  const [activeTab,   setActiveTab]   = useState<SwapTab>('swap');
  const [interval,    setInterval]    = useState('15');
  const [activeChain, setActiveChain] = useState('BSC');
  const [pairs,       setPairs]       = useState<any[]>([]);
  const [activePair,  setActivePair]  = useState<any>(null);

  useEffect(() => {
    fetch('/api/exchange?action=pairs')
      .then(r => r.ok ? r.json() : [])
      .then(p => {
        setPairs(p);
        if (p.length) setActivePair(p[0]);
      })
      .catch(() => {});
  }, []);

  // Filter pairs by selected chain
  const chainPairs = pairs.filter(p =>
    p.fromToken?.chain === activeChain || p.toToken?.chain === activeChain
  );

  const tvSymbol = activePair
    ? toTVSymbol(activePair.fromToken?.symbol || 'BNB', activePair.toToken?.symbol || 'USDT')
    : 'BINANCE:BNBUSDT';

  const isUp = activePair ? (activePair.currentPrice >= activePair.initialPrice) : true;

  return (
    <Page>
      {/* Chain selector bar */}
      <TopChainBar>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.4)', flexShrink: 0, marginRight: 4 }}>
          Chain:
        </span>
        {CHAIN_LIST.map(([key, chain]) => (
          <ChainChip
            key={key}
            $active={activeChain === key}
            onClick={() => setActiveChain(key)}
          >
            {chain.icon} {chain.shortName || chain.name.split(' ')[0]}
          </ChainChip>
        ))}
      </TopChainBar>

      <Container>
        {/* ── Left: Chart ── */}
        <ChartSection>
          <ChartCard>
            <PairHeader>
              {activePair ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 22 }}>{activePair.fromToken?.logoEmoji}</span>
                    <PairName>{activePair.fromToken?.symbol}/{activePair.toToken?.symbol}</PairName>
                    <NativeTag>⚡ Native</NativeTag>
                    <LiqBadge $has={activePair.hasLiquidity}>
                      {activePair.hasLiquidity ? '✓ Liquidity' : '⚠ No Liquidity'}
                    </LiqBadge>
                  </div>
                  <PriceDisplay $up={isUp}>
                    {activePair.currentPrice?.toFixed(6)}
                  </PriceDisplay>
                  <ChangeBadge $up={isUp}>
                    {isUp ? '▲' : '▼'} {Math.abs(((activePair.currentPrice - activePair.initialPrice) / activePair.initialPrice) * 100).toFixed(2)}%
                  </ChangeBadge>
                </>
              ) : (
                <PairName>No Pairs Configured</PairName>
              )}

              <IntervalRow style={{ marginLeft: 'auto' }}>
                {INTERVALS.map(iv => (
                  <IntervalBtn key={iv.value} $active={interval === iv.value} onClick={() => setInterval(iv.value)}>
                    {iv.label}
                  </IntervalBtn>
                ))}
              </IntervalRow>
            </PairHeader>

            <div style={{ height: 'calc(100% - 64px)', minHeight: 440 }}>
              <TradingViewChart symbol={tvSymbol} interval={interval} height={440} />
            </div>
          </ChartCard>

          {/* Pair chips below chart */}
          {pairs.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {pairs.map(pair => (
                <button
                  key={pair.id}
                  onClick={() => setActivePair(pair)}
                  style={{
                    padding: '6px 14px', borderRadius: 10,
                    border: `1px solid ${activePair?.id === pair.id ? '#1FC7D4' : '#383241'}`,
                    background: activePair?.id === pair.id ? '#1FC7D420' : 'transparent',
                    color: activePair?.id === pair.id ? '#1FC7D4' : '#7A6EAA',
                    fontFamily: 'Kanit,sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  {pair.fromToken?.logoEmoji}{pair.fromToken?.symbol}/{pair.toToken?.symbol}
                  <LiqBadge $has={pair.hasLiquidity} style={{ fontSize: 10 }}>
                    {pair.hasLiquidity ? '✓' : '⚠'}
                  </LiqBadge>
                </button>
              ))}
            </div>
          )}
        </ChartSection>

        {/* ── Right: Widget ── */}
        <WidgetSection>
          <TabRow>
            <TabBtn $active={activeTab === 'swap'}  onClick={() => setActiveTab('swap')}>🔄 Swap</TabBtn>
            <TabBtn $active={activeTab === 'twap'}  onClick={() => setActiveTab('twap')}>⏱ TWAP</TabBtn>
            <TabBtn $active={activeTab === 'limit'} onClick={() => setActiveTab('limit')}>📋 Limit</TabBtn>
          </TabRow>
          <WidgetWrap>
            {activeTab === 'swap'  && <NativeSwapCard  />}
            {activeTab === 'twap'  && <NativeTWAPCard  />}
            {activeTab === 'limit' && <NativeLimitCard />}
          </WidgetWrap>
        </WidgetSection>
      </Container>
    </Page>
  );
}
