import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '../ui/Button';
import { Text } from '../ui/Typography';
import { useWeb3 } from '../../context/Web3Context';

const Card = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px; overflow: hidden; width: 100%; max-width: 440px;
`;
const Body = styled.div`padding: 20px 20px 24px;`;
const Panel = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 18px; padding: 14px 16px; margin-bottom: 8px;
  &:focus-within { border-color: ${({ theme }) => theme.colors.secondary}; }
`;
const PanelRow = styled.div`display: flex; align-items: center; gap: 10px;`;
const AmtInput = styled.input`
  flex: 1; background: transparent; border: none; outline: none;
  font-size: 24px; font-weight: 600; color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif; min-width: 0;
  &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
`;
const TokenBtn = styled.button`
  display: flex; align-items: center; gap: 7px; padding: 8px 12px; border-radius: 14px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  cursor: pointer; font-size: 14px; font-weight: 700; font-family: 'Kanit', sans-serif;
  color: ${({ theme }) => theme.colors.text}; flex-shrink: 0;
  &:hover { border-color: ${({ theme }) => theme.colors.secondary}; }
`;
const PriceBox = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 18px; padding: 14px 16px; margin-bottom: 8px;
  &:focus-within { border-color: ${({ theme }) => theme.colors.secondary}; }
`;
const OffsetBtns = styled.div`display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;`;
const OffsetBtn = styled.button<{ $active?: boolean }>`
  padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 600;
  font-family: 'Kanit', sans-serif; cursor: pointer;
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.secondary : theme.colors.cardBorder};
  background: ${({ $active, theme }) => $active ? theme.colors.secondary + '20' : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.secondary : theme.colors.textSubtle};
  &:hover { border-color: ${({ theme }) => theme.colors.secondary}; }
`;
const ExpiryRow = styled.div`display: flex; gap: 6px; flex-wrap: wrap;`;
const ExpiryBtn = styled.button<{ $active?: boolean }>`
  flex: 1; min-width: 60px; padding: 8px; border-radius: 12px;
  font-size: 13px; font-weight: 600; font-family: 'Kanit', sans-serif; cursor: pointer;
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.cardBorder};
  background: ${({ $active, theme }) => $active ? theme.colors.primary + '15' : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.textSubtle};
`;
const InfoBox = styled.div`background: ${({ theme }) => theme.colors.input}; border-radius: 14px; padding: 12px 14px;`;
const InfoRow = styled.div`
  display: flex; justify-content: space-between; padding: 4px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder + '50'};
  &:last-child { border-bottom: none; }
`;
const ChainBadge = styled.span`
  font-size: 10px; padding: 2px 7px; border-radius: 6px;
  background: ${({ theme }) => theme.colors.primary + '20'};
  color: ${({ theme }) => theme.colors.primary}; font-weight: 700;
`;
const OrderCard = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 14px; padding: 12px 14px; margin-bottom: 8px;
`;
const CancelBtn = styled.button`
  font-size: 12px; color: ${({ theme }) => theme.colors.danger};
  background: none; border: none; cursor: pointer; font-family: 'Kanit', sans-serif; font-weight: 600;
`;

const EXPIRY_OPTIONS = [
  { label: '1 Day', value: '1d' }, { label: '3 Days', value: '3d' },
  { label: '7 Days', value: '7d' }, { label: '30 Days', value: '30d' },
];

interface LimitOrder {
  id: string; fromSymbol: string; toSymbol: string;
  amount: string; limitPrice: string; expiry: string;
  status: 'open'|'filled'|'cancelled';
}

export default function NativeLimitCard() {
  const { account, connect, isConnected } = useWeb3();
  const [pairs,      setPairs]     = useState<any[]>([]);
  const [activePair, setActivePair]= useState<any>(null);
  const [amount,     setAmount]    = useState('');
  const [limitPrice, setLimitPrice]= useState('');
  const [expiry,     setExpiry]    = useState('7d');
  const [placing,    setPlacing]   = useState(false);
  const [orders,     setOrders]    = useState<LimitOrder[]>([]);
  const [showOrders, setShowOrders]= useState(false);

  useEffect(() => {
    fetch('/api/exchange?action=pairs')
      .then(r => r.ok ? r.json() : [])
      .then(p => { setPairs(p); if (p.length) setActivePair(p[0]); })
      .catch(() => {});
  }, []);

  const marketPrice = activePair?.currentPrice || 0;
  const estimatedReceive = amount && limitPrice
    ? (parseFloat(amount) / parseFloat(limitPrice)).toFixed(6) : '';
  const priceDiff = limitPrice && marketPrice
    ? ((parseFloat(limitPrice) - marketPrice) / marketPrice) * 100 : 0;

  const setOffset = (pct: number) => {
    if (!marketPrice) return;
    setLimitPrice((marketPrice * (1 + pct / 100)).toFixed(6));
  };

  const handlePlace = async () => {
    if (!amount || !limitPrice || !activePair) return;
    setPlacing(true);
    await new Promise(r => setTimeout(r, 800));
    setOrders(prev => [{
      id: Date.now().toString(),
      fromSymbol: activePair.fromToken.symbol,
      toSymbol:   activePair.toToken.symbol,
      amount, limitPrice, expiry, status: 'open',
    }, ...prev]);
    setAmount(''); setLimitPrice(''); setPlacing(false); setShowOrders(true);
  };

  const cancelOrder = (id: string) =>
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' as const } : o));

  return (
    <Card>
      <Body>
        <div style={{ marginBottom: 16 }}>
          <Text bold style={{ fontSize: 18 }}>Limit Order</Text>
          <Text small color="textSubtle">Buy or sell at a specific price</Text>
        </div>

        {pairs.length > 1 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {pairs.map(p => (
              <button key={p.id} onClick={() => setActivePair(p)} style={{
                padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                fontFamily: 'Kanit,sans-serif', cursor: 'pointer',
                border: `1px solid ${activePair?.id === p.id ? '#7645D9' : 'rgba(255,255,255,0.12)'}`,
                background: activePair?.id === p.id ? 'rgba(118,69,217,0.15)' : 'transparent',
                color: activePair?.id === p.id ? '#7645D9' : 'rgba(255,255,255,0.5)',
              }}>
                {p.fromToken.symbol}/{p.toToken.symbol}
              </button>
            ))}
          </div>
        )}

        {/* You Pay */}
        <Panel>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text small color="textSubtle">You Pay</Text>
          </div>
          <PanelRow>
            <AmtInput placeholder="0.0" value={amount}
              onChange={e => { if (/^\d*\.?\d*$/.test(e.target.value)) setAmount(e.target.value); }}
              type="text" inputMode="decimal"
            />
            <TokenBtn>
              <span style={{ fontSize: 20 }}>{activePair?.fromToken?.logoEmoji || '🪙'}</span>
              {activePair?.fromToken?.symbol || 'Select'}
              {activePair && <ChainBadge>{activePair.fromToken.chain}</ChainBadge>}
            </TokenBtn>
          </PanelRow>
        </Panel>

        <div style={{ textAlign: 'center', fontSize: 20, opacity: 0.5, margin: '4px 0' }}>↓</div>

        {/* You Get */}
        <Panel style={{ marginBottom: 12 }}>
          <Text small color="textSubtle" style={{ marginBottom: 8 }}>You Get (estimated)</Text>
          <PanelRow>
            <AmtInput placeholder="0.0" value={estimatedReceive} readOnly style={{ opacity: 0.7 }} />
            <TokenBtn>
              <span style={{ fontSize: 20 }}>{activePair?.toToken?.logoEmoji || '🪙'}</span>
              {activePair?.toToken?.symbol || 'Select'}
              {activePair && <ChainBadge>{activePair.toToken.chain}</ChainBadge>}
            </TokenBtn>
          </PanelRow>
        </Panel>

        {/* Limit Price */}
        <PriceBox style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text small color="textSubtle">Limit Price</Text>
            <Text small color="textSubtle" style={{ fontSize: 11 }}>
              Market: {marketPrice.toFixed(4)} {activePair?.toToken?.symbol}/{activePair?.fromToken?.symbol}
            </Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AmtInput
              placeholder={marketPrice ? marketPrice.toFixed(4) : '0.0'}
              value={limitPrice}
              onChange={e => setLimitPrice(e.target.value)}
              type="text" inputMode="decimal"
            />
            <Text small color="textSubtle">{activePair?.toToken?.symbol}/{activePair?.fromToken?.symbol}</Text>
            {priceDiff !== 0 && (
              <span style={{ fontSize: 12, fontWeight: 700, color: priceDiff > 0 ? '#31D0AA' : '#ED4B9E' }}>
                {priceDiff > 0 ? '+' : ''}{priceDiff.toFixed(2)}%
              </span>
            )}
          </div>
          <OffsetBtns>
            {[-5, -2, -1, 0, 1, 2, 5].map(pct => (
              <OffsetBtn key={pct} $active={limitPrice === (marketPrice * (1 + pct/100)).toFixed(6)} onClick={() => setOffset(pct)}>
                {pct === 0 ? 'Market' : `${pct > 0 ? '+' : ''}${pct}%`}
              </OffsetBtn>
            ))}
          </OffsetBtns>
        </PriceBox>

        {/* Expiry */}
        <div style={{ marginBottom: 12 }}>
          <Text small color="textSubtle" style={{ marginBottom: 8 }}>Expires In</Text>
          <ExpiryRow>
            {EXPIRY_OPTIONS.map(o => (
              <ExpiryBtn key={o.value} $active={expiry === o.value} onClick={() => setExpiry(o.value)}>
                {o.label}
              </ExpiryBtn>
            ))}
          </ExpiryRow>
        </div>

        {/* Summary */}
        {amount && limitPrice && (
          <InfoBox style={{ marginBottom: 12 }}>
            <InfoRow><Text small color="textSubtle">Sell</Text><Text small bold>{amount} {activePair?.fromToken?.symbol}</Text></InfoRow>
            <InfoRow><Text small color="textSubtle">At Price</Text><Text small bold>{limitPrice} {activePair?.toToken?.symbol}/{activePair?.fromToken?.symbol}</Text></InfoRow>
            <InfoRow><Text small color="textSubtle">Expires</Text><Text small bold>{EXPIRY_OPTIONS.find(o => o.value === expiry)?.label}</Text></InfoRow>
          </InfoBox>
        )}

        {!isConnected ? (
          <Button fullWidth scale="lg" onClick={connect}>🔓 Connect Wallet</Button>
        ) : (
          <Button fullWidth scale="lg" disabled={!amount || !limitPrice || placing} isLoading={placing} onClick={handlePlace}>
            {placing ? 'Placing…' : !amount ? 'Enter amount' : !limitPrice ? 'Enter limit price' : 'Place Limit Order'}
          </Button>
        )}

        {orders.length > 0 && (
          <Button fullWidth variant="tertiary" scale="sm" onClick={() => setShowOrders(v => !v)} style={{ marginTop: 8 }}>
            {showOrders ? '▲ Hide' : '▼ Show'} Open Orders ({orders.filter(o => o.status === 'open').length})
          </Button>
        )}

        {showOrders && orders.map(order => (
          <OrderCard key={order.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text small bold>{order.fromSymbol} → {order.toSymbol}</Text>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                color: order.status === 'open' ? '#1FC7D4' : '#7A6EAA' }}>
                {order.status}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text small color="textSubtle">Sell {order.amount} {order.fromSymbol}</Text>
                <Text small color="textSubtle">@ {order.limitPrice}</Text>
              </div>
              {order.status === 'open' && <CancelBtn onClick={() => cancelOrder(order.id)}>Cancel</CancelBtn>}
            </div>
          </OrderCard>
        ))}
      </Body>
    </Card>
  );
}
