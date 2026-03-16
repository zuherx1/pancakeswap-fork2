import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Text } from '../ui/Typography';
import { Farm } from '../../hooks/useFarms';

const TabRow = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.input};
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ active?: boolean }>`
  flex: 1; padding: 8px;
  border-radius: 10px; border: none; cursor: pointer;
  font-size: 15px; font-weight: 600; font-family: 'Kanit', sans-serif;
  background: ${({ active, theme }) => active ? theme.colors.backgroundAlt : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.text : theme.colors.textSubtle};
  transition: all 0.15s;
`;

const InputWrap = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px;
  padding: 14px 16px;
  margin-bottom: 8px;
  &:focus-within { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const InputRow = styled.div`
  display: flex; align-items: center; gap: 8px;
`;

const AmtInput = styled.input`
  flex: 1; background: transparent; border: none; outline: none;
  font-size: 22px; font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif; min-width: 0;
  &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
`;

const MaxBtn = styled.button`
  padding: 4px 10px; border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary + '20'};
  color: ${({ theme }) => theme.colors.primary};
  border: none; cursor: pointer;
  font-size: 13px; font-weight: 700; font-family: 'Kanit', sans-serif;
  &:hover { background: ${({ theme }) => theme.colors.primary}; color: white; }
`;

const PctRow = styled.div`
  display: flex; gap: 8px; margin-bottom: 16px;
`;

const PctBtn = styled.button`
  flex: 1; padding: 6px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: transparent;
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 13px; font-weight: 600; font-family: 'Kanit', sans-serif;
  cursor: pointer; transition: all 0.15s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; color: ${({ theme }) => theme.colors.primary}; }
`;

const InfoBox = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 14px; padding: 14px 16px; margin-bottom: 16px;
`;

const InfoRow = styled.div`
  display: flex; justify-content: space-between; padding: 3px 0;
`;

interface Props {
  farm:    Farm;
  onDismiss: () => void;
  onStake:   (pid: number, amount: number) => Promise<void>;
  onUnstake: (pid: number, amount: number) => Promise<void>;
  loading:   boolean;
}

const StakeModal: React.FC<Props> = ({ farm, onDismiss, onStake, onUnstake, loading }) => {
  const [tab,    setTab]    = useState<'stake'|'unstake'>('stake');
  const [amount, setAmount] = useState('');

  const balance  = tab === 'stake' ? farm.userLPBalance : farm.userStaked;
  const setMax   = () => setAmount(String(balance));
  const setPct   = (pct: number) => setAmount(((balance * pct) / 100).toFixed(8));

  const handle = async () => {
    const n = Number(amount);
    if (!n || n <= 0) return;
    if (tab === 'stake') await onStake(farm.pid, n);
    else await onUnstake(farm.pid, n);
    onDismiss();
  };

  return (
    <Modal title={`${tab === 'stake' ? 'Stake' : 'Unstake'} ${farm.lpSymbol}`} onDismiss={onDismiss}>
      <TabRow>
        <Tab active={tab === 'stake'}   onClick={() => { setTab('stake');   setAmount(''); }}>Stake</Tab>
        <Tab active={tab === 'unstake'} onClick={() => { setTab('unstake'); setAmount(''); }}>Unstake</Tab>
      </TabRow>

      <InputWrap>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text small color="textSubtle">{tab === 'stake' ? 'Stake' : 'Unstake'} Amount</Text>
          <Text small color="textSubtle">
            {tab === 'stake' ? 'LP Balance' : 'Staked'}: {balance.toFixed(8)}
          </Text>
        </div>
        <InputRow>
          <AmtInput
            placeholder="0.0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            type="number"
            min="0"
          />
          <MaxBtn onClick={setMax}>MAX</MaxBtn>
        </InputRow>
      </InputWrap>

      <PctRow>
        {[25, 50, 75, 100].map(p => (
          <PctBtn key={p} onClick={() => setPct(p)}>{p === 100 ? 'MAX' : `${p}%`}</PctBtn>
        ))}
      </PctRow>

      <InfoBox>
        <InfoRow>
          <Text small color="textSubtle">APR</Text>
          <Text small bold color="success">{farm.apr.toFixed(2)}%</Text>
        </InfoRow>
        {tab === 'stake' && farm.depositFee > 0 && (
          <InfoRow>
            <Text small color="textSubtle">Deposit Fee</Text>
            <Text small bold color="warning">{farm.depositFee}%</Text>
          </InfoRow>
        )}
        <InfoRow>
          <Text small color="textSubtle">You will {tab === 'stake' ? 'stake' : 'unstake'}</Text>
          <Text small bold>{amount || '0'} LP</Text>
        </InfoRow>
      </InfoBox>

      <Button
        fullWidth scale="lg"
        onClick={handle}
        isLoading={loading}
        disabled={!amount || Number(amount) <= 0 || Number(amount) > balance || loading}
      >
        {loading ? 'Confirming…' : tab === 'stake' ? 'Confirm Stake' : 'Confirm Unstake'}
      </Button>

      {tab === 'stake' && (
        <Text small color="textSubtle" textAlign="center" style={{ marginTop: 10 }}>
          Get {farm.lpSymbol} by adding liquidity to the{' '}
          <a href="/trade/liquidity" style={{ color: '#1FC7D4' }}>{farm.lpSymbol.replace(' LP', '')} pool</a>
        </Text>
      )}
    </Modal>
  );
};

export default StakeModal;
