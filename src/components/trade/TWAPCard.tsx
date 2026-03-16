import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Button } from '../ui/Button';
import { Text } from '../ui/Typography';
import TokenLogo from '../ui/TokenLogo';
import { BSC_TOKENS, Token } from '../../constants/tokens';
import TokenSelectModal from './TokenSelectModal';
import { useWeb3 } from '../../context/Web3Context';
import Tooltip from '../ui/Tooltip';

/* ─── TWAP = Time-Weighted Average Price order ──────────────────────────── */

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

const ConfigGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
`;

const ConfigBox = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 14px; padding: 12px 14px;
`;

const ConfigLabel = styled.div`
  font-size: 12px; color: ${({ theme }) => theme.colors.textSubtle};
  margin-bottom: 6px; display: flex; align-items: center; gap: 4px;
`;

const ConfigInput = styled.input`
  width: 100%; background: transparent; border: none; outline: none;
  font-size: 18px; font-weight: 600; color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif;
  &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
`;

const ConfigSelect = styled.select`
  width: 100%; background: transparent; border: none; outline: none;
  font-size: 15px; font-weight: 600; color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif; cursor: pointer;
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

const InfoTip = styled.span`
  cursor: help; font-size: 12px; color: ${({ theme }) => theme.colors.textSubtle};
`;

export default function TWAPCard() {
  const { isConnected, connect } = useWeb3();
  const [fromToken,  setFromToken]  = useState<Token>(BSC_TOKENS.find(t => t.symbol === 'BNB')!);
  const [toToken,    setToToken]    = useState<Token>(BSC_TOKENS.find(t => t.symbol === 'CAKE')!);
  const [amount,     setAmount]     = useState('');
  const [numOrders,  setNumOrders]  = useState('10');
  const [interval,   setInterval]   = useState('1');
  const [intervalUnit, setIntervalUnit] = useState('hours');
  const [placing,    setPlacing]    = useState(false);
  const [selectFor,  setSelectFor]  = useState<'from'|'to'|null>(null);

  const totalDuration = () => {
    const n    = parseInt(numOrders) || 1;
    const iv   = parseFloat(interval) || 1;
    const mult = intervalUnit === 'minutes' ? 1 : intervalUnit === 'hours' ? 60 : 1440;
    const mins = n * iv * mult;
    if (mins < 60)  return `${mins} minutes`;
    if (mins < 1440) return `${(mins / 60).toFixed(1)} hours`;
    return `${(mins / 1440).toFixed(1)} days`;
  };

  const perOrder = () => {
    const n = parseInt(numOrders) || 1;
    const a = parseFloat(amount) || 0;
    return a > 0 ? (a / n).toFixed(6) : '0';
  };

  const handlePlace = async () => {
    setPlacing(true);
    await new Promise(r => setTimeout(r, 1200));
    setPlacing(false);
    setAmount('');
    alert(`TWAP order placed! ${numOrders} orders of ${perOrder()} ${fromToken.symbol} every ${interval} ${intervalUnit}`);
  };

  return (
    <>
      <Card>
        <CardTop>
          <div>
            <Text bold style={{ fontSize: 18 }}>TWAP</Text>
            <Text small color="textSubtle">Time-Weighted Average Price</Text>
          </div>
          <Tooltip content="Split a large order into many smaller orders over time to minimize price impact.">
            <span style={{ cursor: 'help', fontSize: 18 }}>ⓘ</span>
          </Tooltip>
        </CardTop>

        <Body>
          {/* Sell token */}
          <Panel>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text small color="textSubtle">Sell</Text>
              <Text small color="textSubtle">Balance: 0.00</Text>
            </div>
            <PanelRow>
              <AmtInput
                placeholder="0.0"
                value={amount}
                onChange={e => { if (/^\d*\.?\d*$/.test(e.target.value)) setAmount(e.target.value); }}
                type="text" inputMode="decimal"
              />
              <CoinBtn onClick={() => setSelectFor('from')}>
                <CoinImg src={fromToken.logoURI} alt={fromToken.symbol} onError={e => { (e.target as any).style.display = 'none'; }} />
                {fromToken.symbol} ▼
              </CoinBtn>
            </PanelRow>
          </Panel>

          <div style={{ textAlign: 'center', fontSize: 20, color: '#7A6EAA' }}>↓</div>

          {/* Buy token */}
          <Panel>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text small color="textSubtle">Buy</Text>
            </div>
            <PanelRow>
              <Text bold style={{ fontSize: 24, flex: 1, color: '#7A6EAA' }}>Market Price</Text>
              <CoinBtn onClick={() => setSelectFor('to')}>
                <CoinImg src={toToken.logoURI} alt={toToken.symbol} onError={e => { (e.target as any).style.display = 'none'; }} />
                {toToken.symbol} ▼
              </CoinBtn>
            </PanelRow>
          </Panel>

          {/* Config */}
          <ConfigGrid>
            <ConfigBox>
              <ConfigLabel>
                No. of Orders
                <Tooltip content="How many smaller orders to split your trade into.">
                  <InfoTip>ⓘ</InfoTip>
                </Tooltip>
              </ConfigLabel>
              <ConfigInput
                type="number" min="2" max="100"
                placeholder="10"
                value={numOrders}
                onChange={e => setNumOrders(e.target.value)}
              />
            </ConfigBox>

            <ConfigBox>
              <ConfigLabel>
                Time Interval
                <Tooltip content="How often each order executes.">
                  <InfoTip>ⓘ</InfoTip>
                </Tooltip>
              </ConfigLabel>
              <div style={{ display: 'flex', gap: 6 }}>
                <ConfigInput
                  type="number" min="1" style={{ width: 50 }}
                  placeholder="1"
                  value={interval}
                  onChange={e => setInterval(e.target.value)}
                />
                <ConfigSelect value={intervalUnit} onChange={e => setIntervalUnit(e.target.value)}>
                  <option value="minutes">Mins</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </ConfigSelect>
              </div>
            </ConfigBox>
          </ConfigGrid>

          {/* Summary */}
          {amount && (
            <InfoBox>
              <InfoRow>
                <Text small color="textSubtle">Per Order</Text>
                <Text small bold>{perOrder()} {fromToken.symbol}</Text>
              </InfoRow>
              <InfoRow>
                <Text small color="textSubtle">Total Orders</Text>
                <Text small bold>{numOrders}</Text>
              </InfoRow>
              <InfoRow>
                <Text small color="textSubtle">Total Duration</Text>
                <Text small bold>{totalDuration()}</Text>
              </InfoRow>
              <InfoRow>
                <Text small color="textSubtle">Execution</Text>
                <Text small bold>Every {interval} {intervalUnit}</Text>
              </InfoRow>
              <InfoRow>
                <Text small color="textSubtle">Total to Sell</Text>
                <Text small bold>{amount} {fromToken.symbol}</Text>
              </InfoRow>
            </InfoBox>
          )}

          {!isConnected ? (
            <Button fullWidth scale="lg" onClick={connect}>🔓 Connect Wallet</Button>
          ) : (
            <Button
              fullWidth scale="lg"
              disabled={!amount || placing}
              isLoading={placing}
              onClick={handlePlace}
            >
              {placing ? 'Placing TWAP…' : amount ? 'Place TWAP Order' : 'Enter an amount'}
            </Button>
          )}

          <Text small color="textSubtle" textAlign="center" style={{ fontSize: 11 }}>
            TWAP minimizes price impact by spreading your trade over time.
          </Text>
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
