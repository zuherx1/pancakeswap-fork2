import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from '../ui/Modal';
import { Text, Heading } from '../ui/Typography';
import { Button } from '../ui/Button';

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 20px;
`;

const PeriodBtn = styled.button<{ active?: boolean }>`
  padding: 10px;
  border-radius: 12px;
  font-size: 14px; font-weight: 600; font-family: 'Kanit', sans-serif;
  border: 1px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.cardBorder};
  background: ${({ active, theme }) => active ? theme.colors.primary + '15' : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.textSubtle};
  cursor: pointer; transition: all 0.15s; text-align: center;
`;

const InputWrap = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 14px;
  padding: 12px 16px;
  display: flex; align-items: center; gap: 8px;
  margin: 16px 0;
  &:focus-within { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const AmtInput = styled.input`
  flex: 1; background: transparent; border: none; outline: none;
  font-size: 20px; font-weight: 600; color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif;
  &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
`;

const ResultBox = styled.div`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px;
  padding: 20px;
  margin-top: 12px;
`;

const ResultRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder + '80'};
  &:last-child { border-bottom: none; }
`;

const PERIODS = [
  { label: '1 Day',   days: 1   },
  { label: '7 Days',  days: 7   },
  { label: '30 Days', days: 30  },
  { label: '1 Year',  days: 365 },
];

interface Props {
  onDismiss:   () => void;
  apr:         number;
  apy:         number;
  tokenSymbol: string;
  tokenPrice:  number;
}

const AprCalculatorModal: React.FC<Props> = ({ onDismiss, apr, apy, tokenSymbol, tokenPrice }) => {
  const [amount,     setAmount]     = useState('1000');
  const [activePct,  setActivePct]  = useState<'apr'|'apy'>('apr');
  const [compounded, setCompounded] = useState(true);

  const rate   = activePct === 'apr' ? apr : apy;
  const usdAmt = parseFloat(amount) || 0;

  const calcReturn = (days: number) => {
    if (!usdAmt || !rate) return { usd: 0, tokens: 0 };
    let usd: number;
    if (compounded) {
      usd = usdAmt * (Math.pow(1 + rate / 100 / 365, days) - 1);
    } else {
      usd = usdAmt * (rate / 100) * (days / 365);
    }
    return { usd: +usd.toFixed(4), tokens: +(usd / tokenPrice).toFixed(6) };
  };

  return (
    <Modal title="ROI Calculator" onDismiss={onDismiss}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {(['apr','apy'] as const).map(t => (
          <Button key={t} scale="sm" variant={activePct === t ? 'primary' : 'tertiary'}
            onClick={() => setActivePct(t)} style={{ flex: 1 }}>
            {t.toUpperCase()} {t === 'apr' ? `${apr.toFixed(2)}%` : `${apy.toFixed(2)}%`}
          </Button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <Button scale="sm" variant={compounded ? 'primary' : 'tertiary'} onClick={() => setCompounded(true)} style={{ flex: 1 }}>
          Compounded
        </Button>
        <Button scale="sm" variant={!compounded ? 'primary' : 'tertiary'} onClick={() => setCompounded(false)} style={{ flex: 1 }}>
          Simple
        </Button>
      </div>

      <Text small color="textSubtle" style={{ marginBottom: 6, marginTop: 12 }}>Stake Amount (USD)</Text>
      <InputWrap>
        <span style={{ fontSize: 18 }}>$</span>
        <AmtInput
          placeholder="1000"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          type="number"
          min="0"
        />
      </InputWrap>

      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
        {['100','1000','10000'].map(v => (
          <Button key={v} scale="sm" variant="tertiary" onClick={() => setAmount(v)} style={{ flex: 1 }}>
            ${v}
          </Button>
        ))}
      </div>

      <ResultBox>
        <Heading scale="md" style={{ marginBottom: 12, fontSize: 15 }}>Projected Returns</Heading>
        {PERIODS.map(({ label, days }) => {
          const { usd, tokens } = calcReturn(days);
          return (
            <ResultRow key={label}>
              <Text small color="textSubtle">{label}</Text>
              <div style={{ textAlign: 'right' }}>
                <Text small bold style={{ color: '#31D0AA' }}>${usd.toFixed(2)}</Text>
                <Text small color="textSubtle" style={{ fontSize: 11 }}>≈ {tokens} {tokenSymbol}</Text>
              </div>
            </ResultRow>
          );
        })}
      </ResultBox>

      <Text small color="textSubtle" textAlign="center" style={{ marginTop: 12, fontSize: 11 }}>
        Rates are estimates and subject to change. Past performance is not indicative of future returns.
      </Text>
    </Modal>
  );
};

export default AprCalculatorModal;
