import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '../ui/Button';
import { Text } from '../ui/Typography';
import { BSC_TOKENS, Token } from '../../constants/tokens';
import TokenSelectModal from './TokenSelectModal';
import { useWeb3 } from '../../context/Web3Context';
import Tooltip from '../ui/Tooltip';

/* ─── Prices (mocked — replace with oracle/AMM calls) ──────────────────── */
const MOCK_PRICES: Record<string, number> = {
  BNB: 582, WBNB: 582, CAKE: 2.42, BUSD: 1, USDT: 1,
  USDC: 1, ETH: 3200, BTCB: 67000, DAI: 1, ADA: 0.45,
};

const Card = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px;
  padding: 0;
  width: 100%;
  max-width: 440px;
`;

const CardTop = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px;
`;

const Body = styled.div`
  padding: 0 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 18px;
  padding: 14px 16px;
  border: 1px solid transparent;
  transition: border-color 0.2s;
  &:focus-within { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const PanelRow = styled.div`display: flex; align-items: center; gap: 10px;`;

const AmtInput = styled.input`
  flex: 1; background: transparent; border: none; outline: none;
  font-size: 24px; font-weight: 600; color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif; min-width: 0;
  &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
`;

const CoinBtn = styled.button`
  display: flex; align-items: center; gap: 7px;
  padding: 8px 12px; border-radius: 14px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  cursor: pointer; white-space: nowrap; flex-shrink: 0;
  font-size: 14px; font-weight: 700;
  font-family: 'Kanit', sans-serif;
  color: ${({ theme }) => theme.colors.text};
  transition: border-color 0.15s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const CoinImg = styled.img`
  width: 22px; height: 22px; border-radius: 50%;
  object-fit: contain;
`;

const LimitPriceBox = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 18px; padding: 14px 16px;
  border: 1px solid transparent;
  transition: border-color 0.2s;
  &:focus-within { border-color: ${({ theme }) => theme.colors.secondary}; }
`;

const PriceInput = styled.input`
  flex: 1; background: transparent; border: none; outline: none;
  font-size: 22px; font-weight: 600; color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif; min-width: 0; width: 100%;
  &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
`;

const PriceButtons = styled.div`display: flex; gap: 6px; margin-top: 8px;`;
const PriceBtn = styled.button<{ $active?: boolean }>`
  padding: 4px 10px; border-radius: 8px;
  font-size: 12px; font-weight: 600;
  font-family: 'Kanit', sans-serif; cursor: pointer;
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.secondary : theme.colors.cardBorder};
  background: ${({ $active, theme }) => $active ? theme.colors.secondary + '20' : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.secondary : theme.colors.textSubtle};
  transition: all 0.15s;
  &:hover { border-color: ${({ theme }) => theme.colors.secondary}; }
`;

const ExpiryRow = styled.div`
  display: flex; gap: 6px; flex-wrap: wrap;
`;
const ExpiryBtn = styled.button<{ $active?: boolean }>`
  flex: 1; min-width: 60px; padding: 8px 6px;
  border-radius: 12px; font-size: 13px; font-weight: 600;
  font-family: 'Kanit', sans-serif; cursor: pointer;
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.cardBorder};
  background: ${({ $active, theme }) => $active ? theme.colors.primary + '15' : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.textSubtle};
  transition: all 0.15s;
`;

const InfoBox = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 14px; padding: 12px 14px;
`;
const InfoRow = styled.div`
  display: flex; justify-content: space-between; padding: 4px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder + '50'};
  &:last-child { border-bottom: none; }
`;

const PctDiff = styled.span<{ $up: boolean }>`
  font-size: 12px; font-weight: 600; margin-left: 6px;
  color: ${({ $up, theme }) => $up ? theme.colors.success : theme.colors.danger};
`;

const OpenOrderCard = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 14px; padding: 12px 14px; margin-bottom: 8px;
`;

const CancelBtn = styled.button`
  font-size: 12px; color: ${({ theme }) => theme.colors.danger};
  background: none; border: none; cursor: pointer; font-family: 'Kanit', sans-serif;
  font-weight: 600;
  &:hover { text-decoration: underline; }
`;

interface LimitOrder {
  id:         string;
  fromToken:  string;
  toToken:    string;
  amount:     string;
  limitPrice: string;
  expiry:     string;
  status:     'open' | 'filled' | 'cancelled';
  createdAt:  number;
}

const EXPIRY_OPTIONS = [
  { label: '1 Day',   value: '1d'   },
  { label: '3 Days',  value: '3d'   },
  { label: '7 Days',  value: '7d'   },
  { label: '30 Days', value: '30d'  },
  { label: 'Custom',  value: 'custom' },
];

export default function LimitCard() {
  const { isConnected, connect } = useWeb3();
  const [fromToken,  setFromToken]  = useState<Token>(BSC_TOKENS.find(t => t.symbol === 'BNB')!);
  const [toToken,    setToToken]    = useState<Token>(BSC_TOKENS.find(t => t.symbol === 'CAKE')!);
  const [fromAmt,    setFromAmt]    = useState('');
  const [limitPrice, setLimitPrice] = useState('');
  const [expiry,     setExpiry]     = useState('7d');
  const [placing,    setPlacing]    = useState(false);
  const [selectFor,  setSelectFor]  = useState<'from'|'to'|null>(null);
  const [orders,     setOrders]     = useState<LimitOrder[]>([]);
  const [showOrders, setShowOrders] = useState(false);

  const marketPrice = MOCK_PRICES[fromToken.symbol]
    ? (MOCK_PRICES[fromToken.symbol] / (MOCK_PRICES[toToken.symbol] || 1))
    : 0;

  const priceDiff = limitPrice && marketPrice
    ? ((parseFloat(limitPrice) - marketPrice) / marketPrice) * 100
    : 0;

  const estimatedReceive = fromAmt && limitPrice
    ? (parseFloat(fromAmt) / parseFloat(limitPrice)).toFixed(6)
    : '';

  const setMarketOffset = (pct: number) => {
    if (!marketPrice) return;
    const adjusted = marketPrice * (1 + pct / 100);
    setLimitPrice(adjusted.toFixed(6));
  };

  const handlePlace = async () => {
    if (!fromAmt || !limitPrice) return;
    setPlacing(true);
    await new Promise(r => setTimeout(r, 1000));
    const newOrder: LimitOrder = {
      id:         Date.now().toString(),
      fromToken:  fromToken.symbol,
      toToken:    toToken.symbol,
      amount:     fromAmt,
      limitPrice,
      expiry,
      status:     'open',
      createdAt:  Date.now(),
    };
    setOrders(prev => [newOrder, ...prev]);
    setFromAmt('');
    setLimitPrice('');
    setPlacing(false);
    setShowOrders(true);
  };

  const cancelOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' as const } : o));
  };

  return (
    <>
      <Card>
        <CardTop>
          <div>
            <Text bold style={{ fontSize: 18 }}>Limit</Text>
            <Text small color="textSubtle">Place orders at a specific price</Text>
          </div>
        </CardTop>

        <Body>
          {/* You Pay */}
          <Panel>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text small color="textSubtle">You Pay</Text>
              <Text small color="textSubtle">Balance: 0.00</Text>
            </div>
            <PanelRow>
              <AmtInput
                placeholder="0.0"
                value={fromAmt}
                onChange={e => { if (/^\d*\.?\d*$/.test(e.target.value)) setFromAmt(e.target.value); }}
                type="text" inputMode="decimal"
              />
              <CoinBtn onClick={() => setSelectFor('from')}>
                <CoinImg src={fromToken.logoURI} alt={fromToken.symbol} onError={e => { (e.target as any).style.display = 'none'; }} />
                {fromToken.symbol} ▼
              </CoinBtn>
            </PanelRow>
          </Panel>

          <div style={{ textAlign: 'center', fontSize: 20, color: '#7A6EAA' }}>↓</div>

          {/* You Get */}
          <Panel>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text small color="textSubtle">You Get</Text>
            </div>
            <PanelRow>
              <div style={{ flex: 1 }}>
                <AmtInput
                  placeholder="0.0"
                  value={estimatedReceive}
                  readOnly
                  style={{ opacity: 0.7 }}
                />
              </div>
              <CoinBtn onClick={() => setSelectFor('to')}>
                <CoinImg src={toToken.logoURI} alt={toToken.symbol} onError={e => { (e.target as any).style.display = 'none'; }} />
                {toToken.symbol} ▼
              </CoinBtn>
            </PanelRow>
          </Panel>

          {/* Limit Price */}
          <LimitPriceBox>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Text small color="textSubtle">Limit Price</Text>
                <Tooltip content="Your order will execute when the market price reaches this level.">
                  <span style={{ cursor: 'help', fontSize: 12, color: '#7A6EAA' }}>ⓘ</span>
                </Tooltip>
              </div>
              <Text small color="textSubtle">
                Market: {marketPrice.toFixed(4)} {toToken.symbol}/{fromToken.symbol}
              </Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PriceInput
                placeholder={marketPrice ? marketPrice.toFixed(4) : '0.0'}
                value={limitPrice}
                onChange={e => setLimitPrice(e.target.value)}
                type="text" inputMode="decimal"
              />
              <Text small color="textSubtle">{toToken.symbol}/{fromToken.symbol}</Text>
              {priceDiff !== 0 && (
                <PctDiff $up={priceDiff > 0}>
                  {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(2)}%
                </PctDiff>
              )}
            </div>
            <PriceButtons>
              {[-5,-2,-1,0,1,2,5].map(pct => (
                <PriceBtn
                  key={pct}
                  $active={limitPrice === (marketPrice * (1 + pct / 100)).toFixed(6)}
                  onClick={() => setMarketOffset(pct)}
                >
                  {pct === 0 ? 'Market' : `${pct > 0 ? '+' : ''}${pct}%`}
                </PriceBtn>
              ))}
            </PriceButtons>
          </LimitPriceBox>

          {/* Expiry */}
          <div>
            <Text small color="textSubtle" style={{ marginBottom: 8 }}>Order Expires In</Text>
            <ExpiryRow>
              {EXPIRY_OPTIONS.filter(o => o.value !== 'custom').map(o => (
                <ExpiryBtn key={o.value} $active={expiry === o.value} onClick={() => setExpiry(o.value)}>
                  {o.label}
                </ExpiryBtn>
              ))}
            </ExpiryRow>
          </div>

          {/* Summary */}
          {fromAmt && limitPrice && (
            <InfoBox>
              <InfoRow>
                <Text small color="textSubtle">Sell</Text>
                <Text small bold>{fromAmt} {fromToken.symbol}</Text>
              </InfoRow>
              <InfoRow>
                <Text small color="textSubtle">Min. Receive</Text>
                <Text small bold>{estimatedReceive} {toToken.symbol}</Text>
              </InfoRow>
              <InfoRow>
                <Text small color="textSubtle">At Price</Text>
                <Text small bold>
                  1 {fromToken.symbol} = {parseFloat(limitPrice).toFixed(4)} {toToken.symbol}
                </Text>
              </InfoRow>
              <InfoRow>
                <Text small color="textSubtle">Expiry</Text>
                <Text small bold>{EXPIRY_OPTIONS.find(o => o.value === expiry)?.label}</Text>
              </InfoRow>
            </InfoBox>
          )}

          {!isConnected ? (
            <Button fullWidth scale="lg" onClick={connect}>🔓 Connect Wallet</Button>
          ) : (
            <Button
              fullWidth scale="lg"
              disabled={!fromAmt || !limitPrice || placing}
              isLoading={placing}
              onClick={handlePlace}
            >
              {placing ? 'Placing Order…' : !fromAmt ? 'Enter an amount' : !limitPrice ? 'Enter limit price' : 'Place Limit Order'}
            </Button>
          )}

          {/* Open orders toggle */}
          {orders.length > 0 && (
            <Button
              fullWidth
              variant="tertiary"
              scale="sm"
              onClick={() => setShowOrders(v => !v)}
            >
              {showOrders ? '▲ Hide' : '▼ Show'} Open Orders ({orders.filter(o => o.status === 'open').length})
            </Button>
          )}

          {/* Orders list */}
          {showOrders && orders.map(order => (
            <OpenOrderCard key={order.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text small bold>
                  {order.fromToken} → {order.toToken}
                </Text>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: order.status === 'open' ? '#1FC7D4' : order.status === 'filled' ? '#31D0AA' : '#7A6EAA',
                  textTransform: 'uppercase',
                }}>
                  {order.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Text small color="textSubtle">Sell {order.amount} {order.fromToken}</Text>
                  <Text small color="textSubtle">@ {parseFloat(order.limitPrice).toFixed(4)} {order.toToken}/{order.fromToken}</Text>
                </div>
                {order.status === 'open' && (
                  <CancelBtn onClick={() => cancelOrder(order.id)}>Cancel</CancelBtn>
                )}
              </div>
            </OpenOrderCard>
          ))}
        </Body>
      </Card>

      {selectFor && (
        <TokenSelectModal
          onDismiss={() => setSelectFor(null)}
          onSelect={t => { selectFor === 'from' ? setFromToken(t) : setToToken(t); }}
          selectedToken={selectFor === 'from' ? fromToken : toToken}
          otherToken={selectFor === 'from' ? toToken : fromToken}
        />
      )}
    </>
  );
}
