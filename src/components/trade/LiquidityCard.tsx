import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '../ui/Button';
import { Text, Heading } from '../ui/Typography';
import TokenLogo from '../ui/TokenLogo';
import { BSC_TOKENS, Token } from '../../constants/tokens';
import TokenSelectModal from './TokenSelectModal';
import { useWeb3 } from '../../context/Web3Context';

const Card = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px;
  padding: 24px;
  width: 100%;
  max-width: 480px;
`;

const TabRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
`;

const Tab = styled.button<{ active?: boolean }>`
  flex: 1;
  padding: 10px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Kanit', sans-serif;
  cursor: pointer;
  border: 1px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.cardBorder};
  background: ${({ active, theme }) => active ? theme.colors.primary + '15' : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.textSubtle};
  transition: all 0.15s;
`;

const TokenPanel = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 8px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const AmountInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif;
  min-width: 0;
  &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
`;

const TokenBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  font-family: 'Kanit', sans-serif;
  color: ${({ theme }) => theme.colors.text};
  transition: border-color 0.15s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const PlusIcon = styled.div`
  text-align: center;
  font-size: 24px;
  color: ${({ theme }) => theme.colors.textSubtle};
  margin: 4px 0;
`;

const InfoBox = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 16px;
  padding: 16px;
  margin: 12px 0;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
`;

const LiquidityCard: React.FC = () => {
  const { isConnected, connect } = useWeb3();
  const [tab, setTab] = useState<'add' | 'remove'>('add');
  const [token0, setToken0] = useState<Token>(BSC_TOKENS.find(t => t.symbol === 'BNB')!);
  const [token1, setToken1] = useState<Token>(BSC_TOKENS.find(t => t.symbol === 'CAKE')!);
  const [amount0, setAmount0] = useState('');
  const [amount1, setAmount1] = useState('');
  const [selectingToken, setSelectingToken] = useState<0 | 1 | null>(null);
  const [removePercent, setRemovePercent] = useState(25);

  const handleAmount0 = (v: string) => {
    setAmount0(v);
    // Simulate price ratio
    if (v && !isNaN(Number(v))) setAmount1((Number(v) * 241.67).toFixed(6));
  };

  return (
    <>
      <Card>
        <TabRow>
          <Tab active={tab === 'add'} onClick={() => setTab('add')}>Add Liquidity</Tab>
          <Tab active={tab === 'remove'} onClick={() => setTab('remove')}>Remove</Tab>
        </TabRow>

        {tab === 'add' ? (
          <>
            <Text small color="textSubtle" style={{ marginBottom: 12 }}>
              Add liquidity to receive LP tokens
            </Text>

            <TokenPanel>
              <Row>
                <Text small color="textSubtle">Token A</Text>
                <Text small color="textSubtle">Balance: 0.00</Text>
              </Row>
              <Row>
                <AmountInput
                  placeholder="0.0"
                  value={amount0}
                  onChange={e => handleAmount0(e.target.value)}
                />
                <TokenBtn onClick={() => setSelectingToken(0)}>
                  <TokenLogo src={token0.logoURI} symbol={token0.symbol} size={20} />
                  {token0.symbol} ▼
                </TokenBtn>
              </Row>
            </TokenPanel>

            <PlusIcon>+</PlusIcon>

            <TokenPanel>
              <Row>
                <Text small color="textSubtle">Token B</Text>
                <Text small color="textSubtle">Balance: 0.00</Text>
              </Row>
              <Row>
                <AmountInput placeholder="0.0" value={amount1} onChange={e => setAmount1(e.target.value)} />
                <TokenBtn onClick={() => setSelectingToken(1)}>
                  <TokenLogo src={token1.logoURI} symbol={token1.symbol} size={20} />
                  {token1.symbol} ▼
                </TokenBtn>
              </Row>
            </TokenPanel>

            {amount0 && amount1 && (
              <InfoBox>
                <Heading scale="md" style={{ fontSize: 14, marginBottom: 8 }}>Prices &amp; Pool Share</Heading>
                <InfoRow>
                  <Text small color="textSubtle">{token1.symbol} per {token0.symbol}</Text>
                  <Text small bold>241.67</Text>
                </InfoRow>
                <InfoRow>
                  <Text small color="textSubtle">{token0.symbol} per {token1.symbol}</Text>
                  <Text small bold>0.004138</Text>
                </InfoRow>
                <InfoRow>
                  <Text small color="textSubtle">Share of Pool</Text>
                  <Text small bold>{"<"}0.01%</Text>
                </InfoRow>
              </InfoBox>
            )}

            {!isConnected ? (
              <Button fullWidth scale="lg" onClick={connect} style={{ marginTop: 8 }}>🔓 Connect Wallet</Button>
            ) : (
              <Button fullWidth scale="lg" disabled={!amount0 || !amount1} style={{ marginTop: 8 }}>
                {amount0 && amount1 ? 'Supply' : 'Enter amounts'}
              </Button>
            )}
          </>
        ) : (
          <>
            <Text small color="textSubtle" style={{ marginBottom: 16 }}>
              Remove liquidity to get tokens back
            </Text>
            <InfoBox>
              <Text bold style={{ marginBottom: 12 }}>Amount to Remove: {removePercent}%</Text>
              <input
                type="range"
                min={1}
                max={100}
                value={removePercent}
                onChange={e => setRemovePercent(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#1FC7D4' }}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                {[25, 50, 75, 100].map(p => (
                  <Button key={p} scale="sm" variant="tertiary" onClick={() => setRemovePercent(p)}
                    style={{ flex: 1 }}>
                    {p === 100 ? 'MAX' : `${p}%`}
                  </Button>
                ))}
              </div>
            </InfoBox>
            <InfoBox>
              <Text bold style={{ marginBottom: 8 }}>You will receive</Text>
              <InfoRow>
                <Text small>{token0.symbol}</Text>
                <Text small bold>0.00</Text>
              </InfoRow>
              <InfoRow>
                <Text small>{token1.symbol}</Text>
                <Text small bold>0.00</Text>
              </InfoRow>
            </InfoBox>
            {!isConnected ? (
              <Button fullWidth scale="lg" onClick={connect}>🔓 Connect Wallet</Button>
            ) : (
              <Button fullWidth scale="lg" variant="danger">Remove Liquidity</Button>
            )}
          </>
        )}
      </Card>

      {selectingToken !== null && (
        <TokenSelectModal
          onDismiss={() => setSelectingToken(null)}
          onSelect={(t) => { if (selectingToken === 0) setToken0(t); else setToken1(t); }}
          selectedToken={selectingToken === 0 ? token0 : token1}
          otherToken={selectingToken === 0 ? token1 : token0}
        />
      )}
    </>
  );
};

export default LiquidityCard;
