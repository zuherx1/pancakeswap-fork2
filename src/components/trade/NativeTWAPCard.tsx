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
  &:focus-within { border-color: ${({ theme }) => theme.colors.primary}; }
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
  color: ${({ theme }) => theme.colors.text}; transition: border-color 0.15s; flex-shrink: 0;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;
const ConfigGrid = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 10px;`;
const ConfigBox = styled.div`
  background: ${({ theme }) => theme.colors.input}; border-radius: 14px; padding: 12px 14px;
`;
const ConfigLabel = styled.div`font-size: 12px; color: ${({ theme }) => theme.colors.textSubtle}; margin-bottom: 6px;`;
const ConfigInput = styled.input`
  width: 100%; background: transparent; border: none; outline: none;
  font-size: 18px; font-weight: 600; color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif;
`;
const ConfigSelect = styled.select`
  width: 100%; background: transparent; border: none; outline: none;
  font-size: 15px; font-weight: 600; color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif; cursor: pointer;
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

export default function NativeTWAPCard() {
  const { account, connect, isConnected } = useWeb3();
  const [pairs,      setPairs]      = useState<any[]>([]);
  const [activePair, setActivePair] = useState<any>(null);
  const [amount,     setAmount]     = useState('');
  const [numOrders,  setNumOrders]  = useState('10');
  const [interval,   setInterval]   = useState('1');
  const [unit,       setUnit]       = useState('hours');
  const [placing,    setPlacing]    = useState(false);
  const [result,     setResult]     = useState<any>(null);

  useEffect(() => {
    fetch('/api/exchange?action=pairs')
      .then(r => r.ok ? r.json() : [])
      .then(p => { setPairs(p); if (p.length) setActivePair(p[0]); })
      .catch(() => {});
  }, []);

  const perOrder = () => {
    const n = parseInt(numOrders) || 1;
    const a = parseFloat(amount) || 0;
    return a > 0 ? (a / n).toFixed(6) : '0';
  };

  const totalDuration = () => {
    const n = parseInt(numOrders) || 1;
    const iv = parseFloat(interval) || 1;
    const mult = unit === 'minutes' ? 1 : unit === 'hours' ? 60 : 1440;
    const mins = n * iv * mult;
    if (mins < 60) return `${mins} min`;
    if (mins < 1440) return `${(mins/60).toFixed(1)}h`;
    return `${(mins/1440).toFixed(1)}d`;
  };

  const handlePlace = async () => {
    if (!activePair || !amount || !isConnected) return;
    setPlacing(true);
    await new Promise(r => setTimeout(r, 800));
    setResult({
      orders:    parseInt(numOrders),
      perOrder:  perOrder(),
      symbol:    activePair.fromToken.symbol,
      toSymbol:  activePair.toToken.symbol,
      duration:  totalDuration(),
    });
    setPlacing(false);
  };

  if (result) {
    return (
      <Card>
        <Body>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <Text bold style={{ fontSize: 18, marginBottom: 8 }}>TWAP Order Placed!</Text>
            <InfoBox style={{ textAlign: 'left', marginTop: 16 }}>
              <InfoRow><Text small color="textSubtle">Orders</Text><Text small bold>{result.orders}</Text></InfoRow>
              <InfoRow><Text small color="textSubtle">Per order</Text><Text small bold>{result.perOrder} {result.symbol}</Text></InfoRow>
              <InfoRow><Text small color="textSubtle">Buying</Text><Text small bold>{result.toSymbol}</Text></InfoRow>
              <InfoRow><Text small color="textSubtle">Duration</Text><Text small bold>{result.duration}</Text></InfoRow>
            </InfoBox>
            <Button fullWidth onClick={() => { setResult(null); setAmount(''); }} style={{ marginTop: 16 }}>
              New TWAP Order
            </Button>
          </div>
        </Body>
      </Card>
    );
  }

  return (
    <Card>
      <Body>
        <div style={{ marginBottom: 16 }}>
          <Text bold style={{ fontSize: 18 }}>TWAP</Text>
          <Text small color="textSubtle">Split your order over time</Text>
        </div>

        {pairs.length > 1 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
            {pairs.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePair(p)}
                style={{
                  padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                  fontFamily: 'Kanit,sans-serif', cursor: 'pointer',
                  border: `1px solid ${activePair?.id === p.id ? '#1FC7D4' : 'rgba(255,255,255,0.12)'}`,
                  background: activePair?.id === p.id ? 'rgba(31,199,212,0.15)' : 'transparent',
                  color: activePair?.id === p.id ? '#1FC7D4' : 'rgba(255,255,255,0.5)',
                }}
              >
                {p.fromToken.symbol}/{p.toToken.symbol}
              </button>
            ))}
          </div>
        )}

        <Panel>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text small color="textSubtle">Total Amount to Sell</Text>
          </div>
          <PanelRow>
            <AmtInput
              placeholder="0.0"
              value={amount}
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

        <Panel style={{ marginBottom: 12 }}>
          <Text small color="textSubtle" style={{ marginBottom: 8 }}>Buying at market price</Text>
          <PanelRow>
            <Text bold style={{ flex: 1, opacity: 0.6 }}>Market Price</Text>
            <TokenBtn>
              <span style={{ fontSize: 20 }}>{activePair?.toToken?.logoEmoji || '🪙'}</span>
              {activePair?.toToken?.symbol || 'Select'}
              {activePair && <ChainBadge>{activePair.toToken.chain}</ChainBadge>}
            </TokenBtn>
          </PanelRow>
        </Panel>

        <ConfigGrid style={{ marginBottom: 12 }}>
          <ConfigBox>
            <ConfigLabel>No. of Orders</ConfigLabel>
            <ConfigInput type="number" min="2" max="100" value={numOrders} onChange={e => setNumOrders(e.target.value)} />
          </ConfigBox>
          <ConfigBox>
            <ConfigLabel>Interval</ConfigLabel>
            <div style={{ display: 'flex', gap: 6 }}>
              <ConfigInput type="number" min="1" value={interval} onChange={e => setInterval(e.target.value)} style={{ width: 40 }} />
              <ConfigSelect value={unit} onChange={e => setUnit(e.target.value)}>
                <option value="minutes">Min</option>
                <option value="hours">Hrs</option>
                <option value="days">Days</option>
              </ConfigSelect>
            </div>
          </ConfigBox>
        </ConfigGrid>

        {amount && (
          <InfoBox style={{ marginBottom: 12 }}>
            <InfoRow><Text small color="textSubtle">Per Order</Text><Text small bold>{perOrder()} {activePair?.fromToken?.symbol}</Text></InfoRow>
            <InfoRow><Text small color="textSubtle">Total Orders</Text><Text small bold>{numOrders}</Text></InfoRow>
            <InfoRow><Text small color="textSubtle">Total Duration</Text><Text small bold>{totalDuration()}</Text></InfoRow>
          </InfoBox>
        )}

        {!isConnected ? (
          <Button fullWidth scale="lg" onClick={connect}>🔓 Connect Wallet</Button>
        ) : (
          <Button fullWidth scale="lg" disabled={!amount || !activePair || placing} isLoading={placing} onClick={handlePlace}>
            {placing ? 'Placing…' : amount ? 'Place TWAP Order' : 'Enter amount'}
          </Button>
        )}
      </Body>
    </Card>
  );
}
