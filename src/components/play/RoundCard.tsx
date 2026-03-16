import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Button } from '../ui/Button';
import { Text } from '../ui/Typography';
import { Round, BetSide } from '../../hooks/usePrediction';
import { useWeb3 } from '../../context/Web3Context';

/* ─── Animations ─────────────────────────────────────────────────────────── */
const glow = keyframes`
  0%,100% { box-shadow: 0 0 0 0 rgba(31,199,212,0.4); }
  50%      { box-shadow: 0 0 0 12px rgba(31,199,212,0); }
`;
const slideUp = keyframes`
  from { opacity:0; transform:translateY(10px); }
  to   { opacity:1; transform:translateY(0); }
`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:0.4}`;

/* ─── Card container ─────────────────────────────────────────────────────── */
const Card = styled.div<{ status: string; isActive?: boolean }>`
  border-radius: 24px;
  overflow: hidden;
  border: 2px solid ${({ status, isActive, theme }) =>
    isActive        ? theme.colors.primary :
    status === 'live' ? theme.colors.primary :
    status === 'next' ? theme.colors.secondary :
    theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.backgroundAlt};
  min-width: 280px;
  max-width: 320px;
  width: 100%;
  flex-shrink: 0;
  transition: transform 0.2s;
  animation: ${({ status }) => status === 'live' ? css`${slideUp} 0.3s ease` : 'none'};
  ${({ status }) => status === 'live' && css`animation: ${glow} 2s ease infinite;`}

  &:hover { transform: ${({ status }) => status !== 'expired' ? 'translateY(-4px)' : 'none'}; }
`;

const CardStatus = styled.div<{ status: string }>`
  padding: 8px 20px;
  display: flex; align-items: center; justify-content: space-between;
  background: ${({ status }) =>
    status === 'live' ? 'linear-gradient(90deg,#1FC7D4,#7645D9)' :
    status === 'next' ? 'linear-gradient(90deg,#7645D9,#ED4B9E)' :
    'transparent'};
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
`;

const StatusLabel = styled.span<{ status: string }>`
  font-size: 13px; font-weight: 700; font-family: 'Kanit', sans-serif;
  color: ${({ status }) => ['live','next'].includes(status) ? 'white' : '#7A6EAA'};
  display: flex; align-items: center; gap: 6px;
`;

const LiveDot = styled.span`
  width: 7px; height: 7px; border-radius: 50%;
  background: white;
  animation: ${pulse} 1.2s ease infinite;
  display: inline-block;
`;

const EpochLabel = styled.span<{ status: string }>`
  font-size: 12px;
  color: ${({ status }) => ['live','next'].includes(status) ? 'rgba(255,255,255,0.8)' : '#7A6EAA'};
`;

/* ─── BULL section ───────────────────────────────────────────────────────── */
const BullSection = styled.div<{ isWinner?: boolean; isLoser?: boolean }>`
  background: ${({ isWinner, theme }) => isWinner ? theme.colors.success + '15' : 'transparent'};
  padding: 14px 20px 10px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  position: relative;
`;

const PayoutBadge = styled.div<{ side: 'bull' | 'bear' }>`
  position: absolute; top: 12px;
  ${({ side }) => side === 'bull' ? 'right: 16px;' : 'left: 16px;'}
  background: ${({ side, theme }) => side === 'bull' ? theme.colors.success + '20' : theme.colors.danger + '20'};
  color: ${({ side, theme }) => side === 'bull' ? theme.colors.success : theme.colors.danger};
  padding: 3px 10px; border-radius: 10px;
  font-size: 12px; font-weight: 700;
`;

const SideLabel = styled.div<{ side: 'bull'|'bear' }>`
  font-size: 22px; font-weight: 700;
  color: ${({ side, theme }) => side === 'bull' ? theme.colors.success : theme.colors.danger};
  display: flex; align-items: center; gap: 8px;
`;

const SideAmount = styled.div`
  font-size: 13px; color: ${({ theme }) => theme.colors.textSubtle}; margin-top: 2px;
`;

/* ─── Center price section ───────────────────────────────────────────────── */
const PriceSection = styled.div`
  padding: 14px 20px;
  text-align: center;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.input};
  position: relative;
`;

const PriceLock = styled.div<{ up?: boolean }>`
  font-size: 26px; font-weight: 700;
  font-family: 'Roboto Mono', monospace;
  color: ${({ up, theme }) => up === undefined ? theme.colors.text : up ? theme.colors.success : theme.colors.danger};
`;

const PriceDiff = styled.div<{ up: boolean }>`
  font-size: 13px; font-weight: 600;
  color: ${({ up, theme }) => up ? theme.colors.success : theme.colors.danger};
  margin-top: 2px;
`;

const PriceLabel = styled.div`
  font-size: 11px; color: ${({ theme }) => theme.colors.textSubtle};
  text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px;
`;

const CountdownBadge = styled.div`
  display: inline-flex; align-items: center; gap: 4px;
  background: ${({ theme }) => theme.colors.primary + '20'};
  color: ${({ theme }) => theme.colors.primary};
  padding: 4px 12px; border-radius: 20px;
  font-size: 13px; font-weight: 700;
  margin-top: 6px;
`;

const OracleBadge = styled.div`
  font-size: 11px; color: ${({ theme }) => theme.colors.textSubtle};
  margin-top: 4px; display: flex; align-items: center; justify-content: center; gap: 4px;
`;

/* ─── BEAR section ───────────────────────────────────────────────────────── */
const BearSection = styled.div<{ isWinner?: boolean }>`
  background: ${({ isWinner, theme }) => isWinner ? theme.colors.danger + '10' : 'transparent'};
  padding: 10px 20px 14px;
`;

/* ─── Bet panel ──────────────────────────────────────────────────────────── */
const BetPanel = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 14px 20px;
  background: ${({ theme }) => theme.colors.input};
  animation: ${slideUp} 0.2s ease;
`;

const BetInput = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 14px; padding: 10px 14px; margin: 8px 0;
  display: flex; align-items: center; gap: 8px;
  &:focus-within { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const AmtInput = styled.input`
  flex: 1; background: transparent; border: none; outline: none;
  font-size: 18px; font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif;
  &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
`;

const QuickBets = styled.div`display: flex; gap: 6px; margin-bottom: 8px;`;
const QBtn = styled.button`
  flex: 1; padding: 5px; border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: transparent; color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 12px; font-weight: 600; font-family: 'Kanit', sans-serif;
  cursor: pointer; transition: all 0.15s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; color: ${({ theme }) => theme.colors.primary}; }
`;

const UserBetBadge = styled.div<{ side: BetSide }>`
  background: ${({ side, theme }) => side === 'bull' ? theme.colors.success + '20' : theme.colors.danger + '20'};
  color: ${({ side, theme }) => side === 'bull' ? theme.colors.success : theme.colors.danger};
  border-radius: 10px; padding: 8px 12px;
  font-size: 13px; font-weight: 700;
  text-align: center; margin-top: 8px;
`;

/* ─── Helpers ──────────────────────────────────────────────────────────────── */
const fmt      = (n: number) => n.toFixed(2);
const fmtCount = (s: number) => `${Math.floor(s / 60).toString().padStart(2,'0')}:${(s % 60).toString().padStart(2,'0')}`;

interface Props {
  round:             Round;
  timeLeft:          number;
  oraclePrice:       number;
  isActive:          boolean;
  onActivate:        () => void;
  selectedSide:      BetSide | null;
  setSelectedSide:   (s: BetSide | null) => void;
  betAmount:         string;
  setBetAmount:      (v: string) => void;
  onPlaceBet:        (epoch: number, side: BetSide, amount: number) => Promise<void>;
  onClaim:           (epoch: number) => Promise<void>;
  placing:           boolean;
  claiming:          boolean;
  getPayoutMultiplier: (r: Round, side: BetSide) => string;
  isWinner:          (r: Round) => boolean;
}

const RoundCard: React.FC<Props> = ({
  round, timeLeft, oraclePrice, isActive, onActivate,
  selectedSide, setSelectedSide, betAmount, setBetAmount,
  onPlaceBet, onClaim, placing, claiming,
  getPayoutMultiplier, isWinner,
}) => {
  const { isConnected, connect } = useWeb3();

  const isLive      = round.status === 'live';
  const isNext      = round.status === 'next';
  const isExpired   = round.status === 'expired';
  const priceUp     = round.closePrice > round.lockPrice;
  const bullPct     = round.totalAmount > 0 ? (round.bullAmount / round.totalAmount) * 100 : 50;
  const bearPct     = 100 - bullPct;
  const userWon     = isWinner(round);
  const diffPct     = round.lockPrice > 0
    ? (((oraclePrice - round.lockPrice) / round.lockPrice) * 100).toFixed(2)
    : '0.00';
  const diffUp      = oraclePrice >= round.lockPrice;

  const handleBet = async () => {
    if (!selectedSide || !betAmount) return;
    await onPlaceBet(round.epoch, selectedSide, Number(betAmount));
  };

  return (
    <Card status={round.status} isActive={isActive} onClick={!isActive ? onActivate : undefined}>
      {/* Status bar */}
      <CardStatus status={round.status}>
        <StatusLabel status={round.status}>
          {isLive && <LiveDot />}
          {isLive ? 'LIVE' : isNext ? 'NEXT' : `#${round.epoch}`}
        </StatusLabel>
        <EpochLabel status={round.status}>
          {isLive ? `⏱ ${fmtCount(timeLeft)}` : isNext ? 'Starts soon' : isExpired ? (priceUp ? '▲ Bull wins' : '▼ Bear wins') : ''}
        </EpochLabel>
      </CardStatus>

      {/* BULL */}
      <BullSection isWinner={isExpired && priceUp}>
        <SideLabel side="bull">
          ▲ UP
          {isExpired && priceUp && <span style={{ fontSize: 14 }}>🏆</span>}
        </SideLabel>
        <SideAmount>{fmt(round.bullAmount)} BNB Prize Pool</SideAmount>
        <PayoutBadge side="bull">{getPayoutMultiplier(round, 'bull')}x Payout</PayoutBadge>
      </BullSection>

      {/* Price */}
      <PriceSection>
        {isExpired ? (
          <>
            <PriceLabel>Closed Price</PriceLabel>
            <PriceLock up={priceUp}>${fmt(round.closePrice)}</PriceLock>
            <PriceDiff up={priceUp}>
              {priceUp ? '▲' : '▼'} ${Math.abs(round.closePrice - round.lockPrice).toFixed(2)} ({Math.abs(((round.closePrice - round.lockPrice) / round.lockPrice) * 100).toFixed(2)}%)
            </PriceDiff>
            <div style={{ fontSize: 12, color: '#7A6EAA', marginTop: 4 }}>Lock: ${fmt(round.lockPrice)}</div>
          </>
        ) : isLive ? (
          <>
            <PriceLabel>Last Price</PriceLabel>
            <PriceLock up={diffUp}>${fmt(oraclePrice)}</PriceLock>
            <PriceDiff up={diffUp}>
              {diffUp ? '▲' : '▼'} {Math.abs(Number(diffPct))}%
            </PriceDiff>
            <OracleBadge>🔮 ChainLink Oracle</OracleBadge>
            <CountdownBadge>⏱ {fmtCount(timeLeft)}</CountdownBadge>
          </>
        ) : (
          <>
            <PriceLabel>Entry starts</PriceLabel>
            <PriceLock>${fmt(oraclePrice)}</PriceLock>
            <OracleBadge>Lock price TBD</OracleBadge>
          </>
        )}

        {/* Pool split bar */}
        <div style={{ marginTop: 10, height: 6, borderRadius: 4, overflow: 'hidden', background: '#E7E3EB', display: 'flex' }}>
          <div style={{ width: `${bullPct}%`, background: '#31D0AA', transition: 'width 0.5s' }} />
          <div style={{ flex: 1, background: '#ED4B9E' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <Text small color="success">{bullPct.toFixed(0)}% UP</Text>
          <Text small color="failure">{bearPct.toFixed(0)}% DOWN</Text>
        </div>
      </PriceSection>

      {/* BEAR */}
      <BearSection isWinner={isExpired && !priceUp}>
        <SideLabel side="bear">
          ▼ DOWN
          {isExpired && !priceUp && <span style={{ fontSize: 14 }}>🏆</span>}
        </SideLabel>
        <SideAmount>{fmt(round.bearAmount)} BNB Prize Pool</SideAmount>
        <PayoutBadge side="bear">{getPayoutMultiplier(round, 'bear')}x Payout</PayoutBadge>
      </BearSection>

      {/* User bet display */}
      {round.userBet && (
        <UserBetBadge side={round.userBet.side}>
          {round.userBet.side === 'bull' ? '▲' : '▼'} Your bet: {round.userBet.amount} BNB {round.userBet.claimed && '✓ Claimed'}
        </UserBetBadge>
      )}

      {/* Claim button */}
      {isExpired && userWon && round.userBet && !round.userBet.claimed && (
        <div style={{ padding: '12px 20px' }}>
          <Button fullWidth variant="secondary" onClick={e => { e.stopPropagation(); onClaim(round.epoch); }} isLoading={claiming}>
            🎁 Collect Winnings
          </Button>
        </div>
      )}

      {/* Bet panel */}
      {isNext && isActive && (
        <BetPanel onClick={e => e.stopPropagation()}>
          {!round.userBet ? (
            <>
              <Text small bold style={{ marginBottom: 8 }}>Set Position</Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <Button
                  scale="sm" fullWidth
                  style={{ background: selectedSide === 'bull' ? '#31D0AA' : undefined }}
                  onClick={() => setSelectedSide(selectedSide === 'bull' ? null : 'bull')}
                >
                  ▲ Enter UP
                </Button>
                <Button
                  scale="sm" fullWidth variant="danger"
                  style={{ opacity: selectedSide === 'bear' ? 1 : 0.7 }}
                  onClick={() => setSelectedSide(selectedSide === 'bear' ? null : 'bear')}
                >
                  ▼ Enter DOWN
                </Button>
              </div>

              {selectedSide && (
                <>
                  <BetInput>
                    <AmtInput
                      placeholder="0.00"
                      value={betAmount}
                      onChange={e => setBetAmount(e.target.value)}
                      type="number"
                      min="0.001"
                    />
                    <Text small bold>BNB</Text>
                  </BetInput>
                  <QuickBets>
                    {['0.1','0.5','1','5'].map(v => (
                      <QBtn key={v} onClick={() => setBetAmount(v)}>{v}</QBtn>
                    ))}
                  </QuickBets>
                  {!isConnected ? (
                    <Button fullWidth scale="sm" onClick={connect}>🔓 Connect</Button>
                  ) : (
                    <Button
                      fullWidth scale="sm"
                      variant={selectedSide === 'bull' ? 'primary' : 'danger'}
                      onClick={handleBet}
                      isLoading={placing}
                      disabled={!betAmount || Number(betAmount) <= 0}
                      style={{ background: selectedSide === 'bull' ? '#31D0AA' : undefined }}
                    >
                      {placing ? 'Confirming…' : `Confirm ${selectedSide === 'bull' ? '▲ UP' : '▼ DOWN'}`}
                    </Button>
                  )}
                </>
              )}
            </>
          ) : (
            <UserBetBadge side={round.userBet.side}>
              ✓ Bet placed: {round.userBet.side === 'bull' ? '▲ UP' : '▼ DOWN'} — {round.userBet.amount} BNB
            </UserBetBadge>
          )}
        </BetPanel>
      )}
    </Card>
  );
};

export default RoundCard;
