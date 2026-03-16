import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Text } from '../ui/Typography';
import TokenLogo from '../ui/TokenLogo';
import { SyrupPool } from '../../hooks/usePools';

const TabRow = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.input};
  border-radius: 12px; padding: 4px; margin-bottom: 20px;
`;

const Tab = styled.button<{ active?: boolean }>`
  flex: 1; padding: 8px; border-radius: 10px; border: none; cursor: pointer;
  font-size: 15px; font-weight: 600; font-family: 'Kanit', sans-serif;
  background: ${({ active, theme }) => active ? theme.colors.backgroundAlt : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.text : theme.colors.textSubtle};
  transition: all 0.15s;
`;

const InputWrap = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px; padding: 14px 16px; margin-bottom: 8px;
  &:focus-within { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const InputRow = styled.div`display: flex; align-items: center; gap: 8px;`;

const AmtInput = styled.input`
  flex: 1; background: transparent; border: none; outline: none;
  font-size: 22px; font-weight: 600; color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif; min-width: 0;
  &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
`;

const MaxBtn = styled.button`
  padding: 4px 10px; border-radius: 8px;
  background: ${({ theme }) => theme.colors.primary + '20'};
  color: ${({ theme }) => theme.colors.primary};
  border: none; cursor: pointer; font-size: 13px; font-weight: 700; font-family: 'Kanit', sans-serif;
  &:hover { background: ${({ theme }) => theme.colors.primary}; color: white; }
`;

const PctRow = styled.div`display: flex; gap: 8px; margin-bottom: 16px;`;

const PctBtn = styled.button`
  flex: 1; padding: 6px; border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: transparent; color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 13px; font-weight: 600; font-family: 'Kanit', sans-serif;
  cursor: pointer; transition: all 0.15s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; color: ${({ theme }) => theme.colors.primary}; }
`;

const InfoBox = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 14px; padding: 14px 16px; margin-bottom: 16px;
`;

const InfoRow = styled.div`display: flex; justify-content: space-between; padding: 4px 0;`;

const AutoWarning = styled.div`
  background: ${({ theme }) => theme.colors.warning + '15'};
  border: 1px solid ${({ theme }) => theme.colors.warning + '40'};
  border-radius: 12px; padding: 12px; margin-bottom: 12px;
`;

interface Props {
  pool:       SyrupPool;
  onDismiss:  () => void;
  onStake:    (id: number, amount: number) => Promise<void>;
  onUnstake:  (id: number, amount: number) => Promise<void>;
  loading:    boolean;
}

const PoolStakeModal: React.FC<Props> = ({ pool, onDismiss, onStake, onUnstake, loading }) => {
  const [tab,    setTab]    = useState<'stake'|'unstake'>('stake');
  const [amount, setAmount] = useState('');

  const isAuto  = pool.poolType === 'auto';
  const balance = tab === 'stake' ? 0 : pool.userStaked;
  const setMax  = () => setAmount(balance > 0 ? String(balance) : '100');
  const setPct  = (pct: number) => setAmount(balance > 0 ? ((balance * pct) / 100).toFixed(8) : '');

  const handle = async () => {
    const n = Number(amount);
    if (!n || n <= 0) return;
    tab === 'stake' ? await onStake(pool.sousId, n) : await onUnstake(pool.sousId, n);
    onDismiss();
  };

  const usdValue = (Number(amount) || 0) * pool.tokenPrice;

  return (
    <Modal
      title={`${tab === 'stake' ? 'Stake' : 'Unstake'} ${pool.stakingToken.symbol}`}
      onDismiss={onDismiss}
    >
      <TabRow>
        <Tab active={tab === 'stake'}   onClick={() => { setTab('stake');   setAmount(''); }}>Stake</Tab>
        <Tab active={tab === 'unstake'} onClick={() => { setTab('unstake'); setAmount(''); }}>Unstake</Tab>
      </TabRow>

      {isAuto && tab === 'unstake' && (
        <AutoWarning>
          <Text small color="warning">
            ⚠️ Unstaking from Auto CAKE has a <b>0.1% fee</b> if done within 72 hours of staking.
            Performance fee: {pool.performanceFee}%
          </Text>
        </AutoWarning>
      )}

      <InputWrap>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text small color="textSubtle">Amount</Text>
          <Text small color="textSubtle">
            {tab === 'stake' ? 'Balance' : 'Staked'}: {balance.toFixed(4)} {pool.stakingToken.symbol}
          </Text>
        </div>
        <InputRow>
          <TokenLogo src={pool.stakingToken.logoURI} symbol={pool.stakingToken.symbol} size={28} />
          <AmtInput
            placeholder="0.0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            type="number"
            min="0"
          />
          <MaxBtn onClick={setMax}>MAX</MaxBtn>
        </InputRow>
        {amount && <Text small color="textSubtle" style={{ marginTop: 6 }}>≈ ${usdValue.toFixed(2)}</Text>}
      </InputWrap>

      <PctRow>
        {[25, 50, 75, 100].map(p => (
          <PctBtn key={p} onClick={() => setPct(p)}>{p === 100 ? 'MAX' : `${p}%`}</PctBtn>
        ))}
      </PctRow>

      <InfoBox>
        <InfoRow>
          <Text small color="textSubtle">APR</Text>
          <Text small bold style={{ color: '#31D0AA' }}>{pool.apr.toFixed(2)}%</Text>
        </InfoRow>
        <InfoRow>
          <Text small color="textSubtle">APY (compounding weekly)</Text>
          <Text small bold style={{ color: '#31D0AA' }}>{pool.apy.toFixed(2)}%</Text>
        </InfoRow>
        {isAuto && (
          <InfoRow>
            <Text small color="textSubtle">Performance Fee</Text>
            <Text small bold>{pool.performanceFee}%</Text>
          </InfoRow>
        )}
        {pool.stakingLimit > 0 && (
          <InfoRow>
            <Text small color="textSubtle">Max Stake per User</Text>
            <Text small bold>{pool.stakingLimit.toLocaleString()} {pool.stakingToken.symbol}</Text>
          </InfoRow>
        )}
        {isAuto && (
          <>
            <InfoRow>
              <Text small color="textSubtle">Current Price per Share</Text>
              <Text small bold>{pool.pricePerShare.toFixed(8)} CAKE</Text>
            </InfoRow>
            {amount && (
              <InfoRow>
                <Text small color="textSubtle">Shares you'll receive</Text>
                <Text small bold>{(Number(amount) / pool.pricePerShare).toFixed(8)}</Text>
              </InfoRow>
            )}
          </>
        )}
      </InfoBox>

      <Button
        fullWidth scale="lg"
        onClick={handle}
        isLoading={loading}
        disabled={!amount || Number(amount) <= 0 || loading}
      >
        {loading ? 'Confirming…' : `Confirm ${tab === 'stake' ? 'Stake' : 'Unstake'}`}
      </Button>
    </Modal>
  );
};

export default PoolStakeModal;
