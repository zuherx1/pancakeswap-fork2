import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button } from '../ui/Button';
import { Text } from '../ui/Typography';
import { useWeb3 } from '../../context/Web3Context';

const spin  = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.4}`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px; overflow: hidden;
  transition: transform .2s, border-color .2s;
  &:hover { transform: translateY(-3px); border-color: ${({ theme }) => theme.colors.primary}; }
`;

const CardTop = styled.div<{ $color: string }>`
  padding: 20px 22px 16px;
  background: linear-gradient(135deg, ${({ $color }) => $color + '18'}, transparent);
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
`;

const TokenRow = styled.div`display: flex; align-items: center; gap: 10px; margin-bottom: 8px;`;
const TokenEmoji = styled.div`font-size: 36px;`;

const AprBadge = styled.div<{ $color: string }>`
  display: inline-block; padding: 3px 10px; border-radius: 20px;
  background: ${({ $color }) => $color + '20'};
  border: 1px solid ${({ $color }) => $color + '40'};
  color: ${({ $color }) => $color};
  font-size: 13px; font-weight: 700; font-family: 'Kanit', sans-serif;
`;

const LockBadge = styled.div`
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 9px; border-radius: 20px;
  background: ${({ theme }) => theme.colors.secondary + '18'};
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 12px; font-weight: 600; margin-left: 6px;
`;

const StatRow = styled.div`
  display: flex; justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder + '50'};
  &:last-child { border-bottom: none; }
`;

const CardBody = styled.div`padding: 16px 20px;`;

const AmtInput = styled.input`
  width: 100%; background: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 12px; padding: 10px 14px;
  font-size: 18px; font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif; outline: none;
  transition: border-color .2s; margin-bottom: 10px;
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
  &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
`;

const RewardBox = styled.div`
  background: ${({ theme }) => theme.colors.success + '12'};
  border: 1px solid ${({ theme }) => theme.colors.success + '30'};
  border-radius: 14px; padding: 12px 16px; margin-bottom: 12px;
`;

const Spinner = styled.div`
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.3); border-top-color: white;
  border-radius: 50%; animation: ${spin} .7s linear infinite;
  display: inline-block; vertical-align: middle; margin-right: 6px;
`;

const PendingDot = styled.span`
  display: inline-block; width: 8px; height: 8px; border-radius: 50%;
  background: ${({ theme }) => theme.colors.success};
  animation: ${pulse} 1.5s ease infinite; margin-right: 6px;
`;

const ToastWrap = styled.div<{ $win: boolean }>`
  position: fixed; bottom: 24px; right: 20px; z-index: 999;
  padding: 14px 18px; border-radius: 16px; min-width: 280px;
  background: ${({ $win, theme }) => $win ? theme.colors.success + '18' : theme.colors.danger + '18'};
  border: 1px solid ${({ $win, theme }) => $win ? theme.colors.success + '50' : theme.colors.danger + '50'};
  box-shadow: 0 8px 32px rgba(0,0,0,.2);
`;

const POOL_COLORS = ['#1FC7D4','#7645D9','#31D0AA','#FFB237','#ED4B9E','#F0B90B'];
const TOKEN_EMOJIS: Record<string, string> = {
  CAKE:'🥞', BNB:'🟡', ETH:'🔷', USDT:'💵', USDC:'💵', BTC:'🟠', SOL:'🟣', BNB_LP:'💧', default:'🪙',
};

interface Pool {
  id: string; name: string; tokenSymbol: string; rewardSymbol: string;
  aprPercent: number; lockDays: number; minStake: number;
  minClaimAmount: number; description: string; totalStaked: number; enabled: boolean;
}

interface Stake {
  id: string; poolId: string; poolName: string;
  tokenSymbol: string; rewardSymbol: string;
  amount: number; stakedAt: string; totalClaimed: number;
  pendingRewards: number; status: string;
}

export default function LocalStakingWidget() {
  const { account, connect, isConnected } = useWeb3();
  const [pools,    setPools]    = useState<Pool[]>([]);
  const [stakes,   setStakes]   = useState<Stake[]>([]);
  const [amounts,  setAmounts]  = useState<Record<string, string>>({});
  const [loading,  setLoading]  = useState(true);
  const [busy,     setBusy]     = useState<string | null>(null);
  const [toast,    setToast]    = useState<{ msg: string; win: boolean } | null>(null);

  const showToast = (msg: string, win: boolean) => {
    setToast({ msg, win });
    setTimeout(() => setToast(null), 5500);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const pr = await fetch('/api/staking?action=pools').then(r => r.ok ? r.json() : []);
      if (Array.isArray(pr)) setPools(pr);

      if (account) {
        const sr = await fetch(`/api/staking?action=my-stakes&address=${account}`).then(r => r.ok ? r.json() : []);
        if (Array.isArray(sr)) setStakes(sr);
      }
    } catch {} finally { setLoading(false); }
  }, [account]);

  useEffect(() => { loadData(); }, [loadData]);

  // Refresh pending rewards every 30s
  useEffect(() => {
    const t = setInterval(() => { if (account) loadData(); }, 30000);
    return () => clearInterval(t);
  }, [account, loadData]);

  const getStake = (poolId: string) => stakes.find(s => s.poolId === poolId && s.status === 'active');

  const handleStake = async (pool: Pool) => {
    const amount = parseFloat(amounts[pool.id] || '0');
    if (!amount || amount <= 0) { showToast('Enter an amount to stake', false); return; }
    if (pool.minStake > 0 && amount < pool.minStake) {
      showToast(`Minimum stake is ${pool.minStake} ${pool.tokenSymbol}`, false); return;
    }
    if (!isConnected || !account) { showToast('Connect your wallet first', false); return; }

    setBusy(`stake-${pool.id}`);
    try {
      const res  = await fetch('/api/staking?action=stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poolId: pool.id, amount, userAddress: account }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Successfully staked ${amount} ${pool.tokenSymbol}! Earning ${pool.aprPercent}% APR 🎉`, true);
        setAmounts(a => ({ ...a, [pool.id]: '' }));
        loadData();
      } else {
        showToast(data.error || 'Stake failed', false);
      }
    } catch { showToast('Network error', false); }
    finally   { setBusy(null); }
  };

  const handleClaim = async (stake: Stake) => {
    setBusy(`claim-${stake.id}`);
    try {
      const res  = await fetch('/api/staking?action=claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stakeId: stake.id }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Claimed ${stake.pendingRewards?.toFixed(6)} ${stake.rewardSymbol}! 💰`, true);
        loadData();
      } else {
        showToast(data.error || 'Claim failed', false);
      }
    } catch { showToast('Network error', false); }
    finally   { setBusy(null); }
  };

  const handleUnstake = async (stake: Stake) => {
    if (!confirm(`Unstake ${stake.amount} ${stake.tokenSymbol}? Your principal + unclaimed rewards will be sent to your wallet.`)) return;
    setBusy(`unstake-${stake.id}`);
    try {
      const res  = await fetch('/api/staking?action=unstake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stakeId: stake.id }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Unstaked successfully!', true);
        loadData();
      } else {
        showToast(data.error || 'Unstake failed', false);
      }
    } catch { showToast('Network error', false); }
    finally   { setBusy(null); }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <Spinner />
        <Text color="textSubtle" style={{ marginTop: 12 }}>Loading staking pools…</Text>
      </div>
    );
  }

  if (pools.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏊</div>
        <Text bold style={{ fontSize: 20, marginBottom: 8 }}>No Local Staking Pools Yet</Text>
        <Text color="textSubtle">An admin needs to create staking pools before you can stake.</Text>
      </div>
    );
  }

  return (
    <>
      <Grid>
        {pools.map((pool, idx) => {
          const color    = POOL_COLORS[idx % POOL_COLORS.length];
          const userStake = getStake(pool.id);
          const pendingR  = userStake?.pendingRewards || 0;
          const isStaked  = !!userStake;
          const staking   = busy === `stake-${pool.id}`;
          const claiming  = busy === `claim-${userStake?.id}`;
          const unstaking = busy === `unstake-${userStake?.id}`;
          const emoji     = TOKEN_EMOJIS[pool.tokenSymbol] || TOKEN_EMOJIS.default;
          const rEmoji    = TOKEN_EMOJIS[pool.rewardSymbol] || TOKEN_EMOJIS.default;

          return (
            <Card key={pool.id}>
              <CardTop $color={color}>
                <TokenRow>
                  <TokenEmoji>{emoji}</TokenEmoji>
                  <div>
                    <Text bold style={{ fontSize: 18 }}>{pool.name}</Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <AprBadge $color={color}>{pool.aprPercent}% APR</AprBadge>
                      {pool.lockDays > 0 && <LockBadge>🔒 {pool.lockDays}d</LockBadge>}
                    </div>
                  </div>
                </TokenRow>
                {pool.description && (
                  <Text small color="textSubtle" style={{ marginTop: 4, lineHeight: 1.5 }}>
                    {pool.description}
                  </Text>
                )}
              </CardTop>

              <CardBody>
                {/* Pool stats */}
                <div style={{ marginBottom: 14 }}>
                  <StatRow>
                    <Text small color="textSubtle">Stake</Text>
                    <Text small bold>{pool.tokenSymbol}</Text>
                  </StatRow>
                  <StatRow>
                    <Text small color="textSubtle">Earn</Text>
                    <Text small bold>{rEmoji} {pool.rewardSymbol}</Text>
                  </StatRow>
                  <StatRow>
                    <Text small color="textSubtle">Total Staked</Text>
                    <Text small bold>{(pool.totalStaked || 0).toFixed(2)} {pool.tokenSymbol}</Text>
                  </StatRow>
                  {pool.minStake > 0 && (
                    <StatRow>
                      <Text small color="textSubtle">Min Stake</Text>
                      <Text small bold>{pool.minStake} {pool.tokenSymbol}</Text>
                    </StatRow>
                  )}
                </div>

                {/* User stake info */}
                {isStaked && userStake && (
                  <RewardBox>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text small color="textSubtle">Your Stake</Text>
                      <Text small bold>{userStake.amount} {pool.tokenSymbol}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <Text small color="textSubtle">Total Earned</Text>
                      <Text small bold style={{ color: '#31D0AA' }}>
                        {(userStake.totalClaimed || 0).toFixed(6)} {pool.rewardSymbol}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <PendingDot />
                        <Text small color="textSubtle">Pending Rewards</Text>
                      </div>
                      <Text small bold style={{ color: '#31D0AA' }}>
                        {pendingR.toFixed(6)} {pool.rewardSymbol}
                      </Text>
                    </div>
                  </RewardBox>
                )}

                {/* Connect wallet */}
                {!isConnected && (
                  <Button fullWidth scale="md" onClick={connect} style={{ marginBottom: 8 }}>
                    🔓 Connect Wallet to Stake
                  </Button>
                )}

                {/* Stake input */}
                {isConnected && !isStaked && (
                  <>
                    <AmtInput
                      type="text" inputMode="decimal"
                      placeholder={`Amount to stake (${pool.tokenSymbol})`}
                      value={amounts[pool.id] || ''}
                      onChange={e => { if (/^\d*\.?\d*$/.test(e.target.value)) setAmounts(a => ({ ...a, [pool.id]: e.target.value })); }}
                    />
                    <Button
                      fullWidth scale="md"
                      disabled={staking || !amounts[pool.id]}
                      onClick={() => handleStake(pool)}
                      style={{ background: color, borderColor: color }}
                    >
                      {staking ? <><Spinner />Staking…</> : `Stake ${pool.tokenSymbol} →`}
                    </Button>
                  </>
                )}

                {/* Already staked — claim / unstake */}
                {isConnected && isStaked && userStake && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      scale="sm"
                      disabled={claiming || pendingR < (pool.minClaimAmount || 0.0001)}
                      onClick={() => handleClaim(userStake)}
                      style={{ flex: 1 }}
                    >
                      {claiming ? <><Spinner />Claiming…</> : `💰 Claim ${pendingR > 0 ? pendingR.toFixed(4) : ''}`}
                    </Button>
                    <Button
                      scale="sm"
                      variant="subtle"
                      disabled={unstaking}
                      onClick={() => handleUnstake(userStake)}
                      style={{ flex: 1 }}
                    >
                      {unstaking ? <><Spinner />Unstaking…</> : '↩ Unstake'}
                    </Button>
                  </div>
                )}

                {/* APR estimate */}
                {amounts[pool.id] && parseFloat(amounts[pool.id]) > 0 && (
                  <Text small color="textSubtle" style={{ marginTop: 8, textAlign: 'center', fontSize: 11 }}>
                    ≈ {(parseFloat(amounts[pool.id]) * pool.aprPercent / 100 / 365).toFixed(6)} {pool.rewardSymbol} per day
                  </Text>
                )}
              </CardBody>
            </Card>
          );
        })}
      </Grid>

      {/* Toast */}
      {toast && (
        <ToastWrap $win={toast.win}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{toast.win ? '🎉' : '⚠️'}</span>
            <div style={{ fontSize: 13, color: 'white', lineHeight: 1.6, flex: 1 }}>{toast.msg}</div>
            <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 16 }}>✕</button>
          </div>
        </ToastWrap>
      )}
    </>
  );
}
