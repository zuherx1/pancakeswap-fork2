import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import dynamic from 'next/dynamic';
import { useLocalPerps } from '../../hooks/useLocalPerps';
import { useThemeContext } from '../../context/ThemeContext';
import { useWeb3 } from '../../context/Web3Context';
import OrderBookPanel from '../../components/trade/OrderBook';
import OrderPanel from '../../components/trade/OrderPanel';
import PositionsTable from '../../components/trade/PositionsTable';
import { Text } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import Link from 'next/link';

const fadeIn = keyframes`from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}`;

const PayoutToast = styled.div<{ $win: boolean }>`
  position: fixed; top: 72px; right: 20px; z-index: 999;
  padding: 16px 20px; border-radius: 16px; min-width: 300px;
  background: ${({ $win, theme }) => $win ? theme.colors.success + '18' : theme.colors.danger + '18'};
  border: 1px solid ${({ $win, theme }) => $win ? theme.colors.success + '50' : theme.colors.danger + '50'};
  box-shadow: 0 8px 32px rgba(0,0,0,0.2);
  animation: ${fadeIn} 0.3s ease;
`;

const TradingViewChart = dynamic(
  () => import('../../components/trade/TradingViewChart'),
  { ssr: false }
);

/* ─── Layout — identical to fork perps ─────────────────────────────────── */
const Page = styled.div`
  display: flex; flex-direction: column;
  height: calc(100vh - 56px);
  background: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;

const TopBar = styled.div`
  display: flex; align-items: center; gap: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  overflow-x: auto; flex-shrink: 0;
  &::-webkit-scrollbar { display: none; }
`;

const MarketBtn = styled.button<{ active?: boolean }>`
  padding: 10px 16px; border: none;
  border-bottom: 2px solid ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  background: transparent;
  font-size: 14px; font-weight: ${({ active }) => active ? 700 : 500};
  font-family: 'Kanit', sans-serif;
  color: ${({ active, theme }) => active ? theme.colors.text : theme.colors.textSubtle};
  cursor: pointer; white-space: nowrap; transition: all 0.15s;
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const LocalTag = styled.span`
  font-size: 10px; padding: 2px 7px; border-radius: 6px; margin-left: 4px;
  background: ${({ theme }) => theme.colors.success + '20'};
  color: ${({ theme }) => theme.colors.success}; font-weight: 700;
`;

const TickerBar = styled.div`
  display: flex; align-items: center; gap: 24px;
  padding: 8px 16px; border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  overflow-x: auto; flex-shrink: 0;
  &::-webkit-scrollbar { display: none; }
`;

const TickerItem = styled.div`min-width: fit-content;`;
const TickerLabel = styled.div`font-size: 11px; color: ${({ theme }) => theme.colors.textSubtle};`;
const TickerValue = styled.div<{ up?: boolean; down?: boolean }>`
  font-size: 14px; font-weight: 700;
  color: ${({ up, down, theme }) =>
    up   ? theme.colors.success :
    down ? theme.colors.danger  :
    theme.colors.text};
  font-family: 'Kanit', sans-serif;
`;

const MainArea = styled.div`
  display: flex; flex: 1; overflow: hidden;
`;

const ChartArea = styled.div`
  flex: 1; display: flex; flex-direction: column;
  min-width: 0; overflow: hidden;
`;

const ChartWrapper = styled.div`
  flex: 1; min-height: 0; overflow: hidden;
`;

const RightPanel = styled.div`
  width: 320px; flex-shrink: 0;
  border-left: 1px solid ${({ theme }) => theme.colors.cardBorder};
  display: flex; flex-direction: column;
  overflow: hidden;
  @media(max-width:1100px){ display: none; }
`;

const OrderPanelWrap = styled.div`
  flex: 1; overflow-y: auto; padding: 12px;
`;

const EmptyState = styled.div`
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  height: 100%; padding: 40px 24px; text-align: center;
`;

/* ─── TV symbol map for local markets ──────────────────────────────────── */
function getLocalTVSymbol(baseAsset: string): string {
  const map: Record<string, string> = {
    BTC: 'BINANCE:BTCUSDT', ETH: 'BINANCE:ETHUSDT', BNB: 'BINANCE:BNBUSDT',
    SOL: 'BINANCE:SOLUSDT', XRP: 'BINANCE:XRPUSDT', ADA: 'BINANCE:ADAUSDT',
    DOGE: 'BINANCE:DOGEUSDT', MATIC: 'BINANCE:MATICUSDT', DOT: 'BINANCE:DOTUSDT',
    AVAX: 'BINANCE:AVAXUSDT', LINK: 'BINANCE:LINKUSDT', LTC: 'BINANCE:LTCUSDT',
  };
  return map[baseAsset.toUpperCase()] || `BINANCE:${baseAsset.toUpperCase()}USDT`;
}

export default function LocalPerpsPage() {
  const { isDark } = useThemeContext();
  const { account, connect, isConnected } = useWeb3();
  const {
    markets, activeMarket, selectMarket,
    orderBook, positions, closePosition,
    activeTab, setActiveTab, openPosition,
    loading, isEmpty,
  } = useLocalPerps();

  const [category,    setCategory]   = useState<'All' | 'Crypto' | 'Custom'>('All');
  const [searchQ,     setSearchQ]    = useState('');
  const [payoutToast, setPayoutToast]= useState<{win:boolean; msg:string; txId?:string} | null>(null);
  const [closing,     setClosing]    = useState<string | null>(null);

  // Handle close position with payout
  const handleClosePosition = async (id: string) => {
    setClosing(id);
    const result = await closePosition(id, account || '');
    setClosing(null);

    if (result) {
      const win  = (result.pnl || 0) > 0;
      const msg  = result.message || (win
        ? `You won ${result.pnl?.toFixed(4)} USDT! Payout sent to your wallet.`
        : `Position closed. Loss: ${Math.abs(result.pnl || 0).toFixed(4)} USDT`);

      setPayoutToast({ win, msg, txId: result.txId });
      setTimeout(() => setPayoutToast(null), 6000);
    }
  };

  const change24hUp = (activeMarket?.change24h || 0) >= 0;

  const filteredMarkets = markets.filter(m => {
    const matchCat = category === 'All' ? true :
      category === 'Crypto' ? !['AAPL','AMZN','TSLA'].includes(m.baseAsset) :
      ['AAPL','AMZN','TSLA'].includes(m.baseAsset);
    const matchSearch = !searchQ || m.baseAsset.toLowerCase().includes(searchQ.toLowerCase()) ||
      m.symbol.toLowerCase().includes(searchQ.toLowerCase());
    return matchCat && matchSearch;
  });

  // Loading state
  if (loading) {
    return (
      <Page>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <Text color="textSubtle">Loading markets…</Text>
        </div>
      </Page>
    );
  }

  // Empty state — no local markets configured
  if (isEmpty) {
    return (
      <Page>
        <EmptyState>
          <div style={{ fontSize: 56, marginBottom: 20 }}>📈</div>
          <Text bold style={{ fontSize: 22, marginBottom: 10 }}>No Local Markets Configured</Text>
          <Text color="textSubtle" style={{ maxWidth: 400, lineHeight: 1.7, marginBottom: 28 }}>
            Add perpetual markets from the admin panel to enable local perps trading.
            You can set custom pairs, initial prices, leverage limits, and fees.
          </Text>
          <Link href="/admin/perps">
            <Button scale="lg">⚙️ Configure Markets in Admin →</Button>
          </Link>
        </EmptyState>
      </Page>
    );
  }

  return (
    <Page>
      {/* Market selector bar */}
      <TopBar>
        <div style={{ display: 'flex', alignItems: 'center', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '0 8px', gap: 2, flexShrink: 0 }}>
          {(['All','Crypto','Custom'] as const).map(cat => (
            <MarketBtn key={cat} active={category === cat} onClick={() => setCategory(cat)} style={{ padding: '10px 10px', fontSize: 12 }}>
              {cat}
            </MarketBtn>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', flexShrink: 0 }}>
          <input
            placeholder="Search…"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            style={{
              padding: '4px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent', fontSize: 12, width: 90, outline: 'none',
              fontFamily: 'Kanit,sans-serif', color: 'inherit',
            }}
          />
        </div>

        {filteredMarkets.map(m => (
          <MarketBtn
            key={m.symbol}
            active={activeMarket?.symbol === m.symbol}
            onClick={() => selectMarket(m)}
          >
            {m.baseAsset}/{m.quoteAsset}
            <LocalTag>Local</LocalTag>
            <span style={{ fontSize: 10, marginLeft: 4, opacity: 0.6 }}>{m.maxLeverage}×</span>
          </MarketBtn>
        ))}
      </TopBar>

      {/* Ticker bar */}
      <TickerBar>
        <TickerItem>
          <TickerLabel>Mark Price</TickerLabel>
          <TickerValue up={change24hUp} down={!change24hUp} style={{ fontSize: 18 }}>
            {activeMarket.markPrice.toFixed(activeMarket.markPrice > 100 ? 2 : 6)}
          </TickerValue>
        </TickerItem>
        <TickerItem>
          <TickerLabel>Index Price</TickerLabel>
          <TickerValue>{activeMarket.indexPrice.toFixed(activeMarket.markPrice > 100 ? 2 : 6)}</TickerValue>
        </TickerItem>
        <TickerItem>
          <TickerLabel>24h Change</TickerLabel>
          <TickerValue up={change24hUp} down={!change24hUp}>
            {change24hUp ? '+' : ''}{activeMarket.change24h.toFixed(2)}%
          </TickerValue>
        </TickerItem>
        <TickerItem>
          <TickerLabel>24h High</TickerLabel>
          <TickerValue>{activeMarket.high24h.toFixed(activeMarket.markPrice > 100 ? 2 : 6)}</TickerValue>
        </TickerItem>
        <TickerItem>
          <TickerLabel>24h Low</TickerLabel>
          <TickerValue>{activeMarket.low24h.toFixed(activeMarket.markPrice > 100 ? 2 : 6)}</TickerValue>
        </TickerItem>
        <TickerItem>
          <TickerLabel>24h Volume</TickerLabel>
          <TickerValue>{(activeMarket.volume24h / 1_000_000).toFixed(2)}M</TickerValue>
        </TickerItem>
        <TickerItem>
          <TickerLabel>Open Interest</TickerLabel>
          <TickerValue>{(activeMarket.openInterest / 1_000_000).toFixed(2)}M</TickerValue>
        </TickerItem>
        <TickerItem>
          <TickerLabel>Funding Rate</TickerLabel>
          <TickerValue up={(activeMarket.fundingRate || 0) >= 0}>
            {((activeMarket.fundingRate || 0) * 100).toFixed(4)}%
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
            <TradingViewChart
              symbol={getLocalTVSymbol(activeMarket.baseAsset)}
              interval="15"
              height={400}
            />
          </ChartWrapper>
          <div style={{ flexShrink: 0 }}>
            <PositionsTable
              positions={positions}
              onClose={handleClosePosition}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
        </ChartArea>

        {/* Order Book + Order Panel */}
        <RightPanel>
          <OrderBookPanel orderBook={orderBook} />
          <OrderPanelWrap>
            {!isConnected ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <Text small color="textSubtle" style={{ marginBottom: 12 }}>Connect wallet to trade</Text>
                <Button scale="sm" onClick={connect}>🔓 Connect</Button>
              </div>
            ) : (
              <OrderPanel
                market={activeMarket}
                onOpenPosition={openPosition}
              />
            )}
          </OrderPanelWrap>
        </RightPanel>
      </MainArea>

      {/* Payout toast notification */}
      {payoutToast && (
        <PayoutToast $win={payoutToast.win}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{payoutToast.win ? '🎉' : '📉'}</span>
            <div>
              <div style={{
                fontWeight: 700, fontFamily: 'Kanit,sans-serif', marginBottom: 4,
                color: payoutToast.win ? '#31D0AA' : '#ED4B9E',
              }}>
                {payoutToast.win ? 'Position Closed — You Won!' : 'Position Closed'}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>
                {payoutToast.msg}
              </div>
              {payoutToast.txId && (
                <div style={{ fontSize: 11, marginTop: 6, opacity: 0.6 }}>
                  TX: {payoutToast.txId.slice(0, 20)}…
                </div>
              )}
            </div>
            <button
              onClick={() => setPayoutToast(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 16, flexShrink: 0 }}
            >
              ✕
            </button>
          </div>
        </PayoutToast>
      )}
    </Page>
  );
}
