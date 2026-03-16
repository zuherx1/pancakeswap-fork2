import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useLottery } from '../../hooks/useLottery';
import { useWeb3 } from '../../context/Web3Context';
import { Button } from '../../components/ui/Button';
import { Text, Heading } from '../../components/ui/Typography';
import { Badge } from '../../components/ui/Badge';
import WinningNumbers from '../../components/play/WinningNumbers';
import BuyTicketsModal from '../../components/play/BuyTicketsModal';

/* ─── Animations ─────────────────────────────────────────────────────────── */
const float   = keyframes`0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-14px) rotate(3deg)}`;
const shimmer = keyframes`0%{background-position:-200% center}100%{background-position:200% center}`;
const spin    = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;

/* ─── Page ───────────────────────────────────────────────────────────────── */
const Page = styled.div`min-height:calc(100vh - 56px); background:${({ theme }) => theme.colors.background};`;

/* ─── Hero ───────────────────────────────────────────────────────────────── */
const Hero = styled.div`
  background: linear-gradient(135deg, #7645D9 0%, #1FC7D4 50%, #31D0AA 100%);
  padding: 60px 24px 48px;
  position: relative; overflow: hidden; text-align: center;
`;

const HeroBg = styled.div`
  position: absolute; inset: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 30%, rgba(255,255,255,0.07) 0%, transparent 40%);
`;

const TicketFloat = styled.div`
  font-size: 80px;
  animation: ${float} 4s ease-in-out infinite;
  display: inline-block; margin-bottom: 16px;
  filter: drop-shadow(0 8px 24px rgba(0,0,0,0.2));
`;

const JackpotAmount = styled.div`
  font-size: clamp(40px, 8vw, 88px);
  font-weight: 700;
  font-family: 'Kanit', sans-serif;
  background: linear-gradient(90deg, #FFD700, #FFEC6E, #FFD700);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 3s linear infinite;
  line-height: 1;
`;

const JackpotLabel = styled.div`
  font-size: 18px; color: rgba(255,255,255,0.85);
  margin-bottom: 8px;
`;

const CountdownPill = styled.div`
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(0,0,0,0.25); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 20px; padding: 10px 20px;
  margin: 20px 0;
`;

const CountdownTime = styled.span`
  font-size: 22px; font-weight: 700; color: white;
  font-family: 'Roboto Mono', monospace;
`;

const TicketCount = styled.div`
  font-size: 14px; color: rgba(255,255,255,0.75);
  margin-bottom: 24px;
`;

/* ─── Main content ───────────────────────────────────────────────────────── */
const Content = styled.div`max-width: 960px; margin: 0 auto; padding: 40px 24px 60px;`;

/* ─── Prize breakdown ────────────────────────────────────────────────────── */
const PrizeCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px; overflow: hidden; margin-bottom: 24px;
`;

const PrizeHeader = styled.div`
  background: ${({ theme }) => theme.colors.gradientCardHeader};
  padding: 20px 24px;
  display: flex; justify-content: space-between; align-items: center;
`;

const PrizeGrid = styled.div`
  display: grid; grid-template-columns: repeat(3,1fr);
  gap: 0;
  @media (max-width: 576px) { grid-template-columns: 1fr; }
`;

const PrizeTier = styled.div<{ $color: string }>`
  padding: 18px 20px;
  border-right: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  &:nth-child(3n) { border-right: none; }
  text-align: center;
  transition: background 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.input}; }
`;

const TierIcon = styled.div<{ $color: string }>`
  width: 44px; height: 44px; border-radius: 50%;
  background: ${({ $color }) => $color + '20'};
  border: 2px solid ${({ $color }) => $color};
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 8px;
  font-size: 20px;
`;

const TierAmount = styled.div<{ $color: string }>`
  font-size: 18px; font-weight: 700;
  color: ${({ $color }) => $color};
  font-family: 'Kanit', sans-serif;
`;

const TierLabel = styled.div`
  font-size: 12px; color: ${({ theme }) => theme.colors.textSubtle};
  margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.06em;
`;

const TierWinners = styled.div`
  font-size: 12px; color: ${({ theme }) => theme.colors.textSubtle};
  margin-top: 4px;
`;

/* ─── Winning numbers section ────────────────────────────────────────────── */
const WinCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px; padding: 24px; margin-bottom: 24px;
`;

const RoundSelect = styled.div`
  display: flex; align-items: center; gap: 8px; margin-bottom: 20px; flex-wrap: wrap;
`;

const RoundBtn = styled.button<{ active?: boolean }>`
  padding: 6px 14px; border-radius: 10px;
  font-size: 13px; font-weight: 600; font-family: 'Kanit', sans-serif;
  border: 1px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.cardBorder};
  background: ${({ active, theme }) => active ? theme.colors.primary + '15' : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.textSubtle};
  cursor: pointer; transition: all 0.15s;
`;

/* ─── My tickets ─────────────────────────────────────────────────────────── */
const TicketsCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px; padding: 24px; margin-bottom: 24px;
`;

const TicketItem = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 14px; padding: 14px 16px;
  display: flex; align-items: center; gap: 14px;
  margin-bottom: 10px; flex-wrap: wrap;
`;

const TicketId = styled.div`
  font-size: 12px; color: ${({ theme }) => theme.colors.textSubtle};
  min-width: 70px;
`;

/* ─── How to play ────────────────────────────────────────────────────────── */
const HowCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px; padding: 24px;
`;

const StepGrid = styled.div`
  display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; margin-top: 16px;
  @media (max-width: 768px) { grid-template-columns: 1fr 1fr; }
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;

const StepBox = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 16px; padding: 16px; text-align: center;
`;

const TIER_ICONS = ['🏆','🥈','🥉','🎖️','🎗️','🎀'];

export default function LotteryPage() {
  const { isConnected, connect } = useWeb3();
  const lottery = useLottery();
  const {
    rounds, activeRound, setActiveRound, userTickets,
    buyCount, setBuyCount, buying, claiming,
    editTickets, randomizeTicket, updateTicketNumber,
    randomizeAll, setRandomizeAll,
    buyTickets, claimTickets, countdown,
    matchCount, totalCost, PRIZE_LABELS, PRIZE_COLORS,
  } = lottery;

  const [showBuy, setShowBuy] = useState(false);

  const openRound       = rounds.find(r => r.status === 'open');
  const myTickets       = userTickets.filter(t => t.roundId === activeRound.id);
  const claimableTickets= myTickets.filter(t => {
    if (activeRound.status !== 'claimable' || t.claimed) return false;
    return matchCount(t.numbers, activeRound.winningNumbers) > 0;
  });
  const hasClaimable    = claimableTickets.length > 0;

  return (
    <Page>
      {/* Hero */}
      <Hero>
        <HeroBg />
        <TicketFloat>🎰</TicketFloat>
        <JackpotLabel>Total Prize Pool</JackpotLabel>
        <JackpotAmount>
          {openRound ? openRound.totalPrize.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '0'} CAKE
        </JackpotAmount>
        <TicketCount>
          🎟️ {openRound?.totalTickets.toLocaleString()} tickets sold
          &nbsp;·&nbsp; 🎟️ {(openRound?.ticketPrice || 2.5)} CAKE / ticket
        </TicketCount>

        {openRound && (
          <CountdownPill>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>Draw in</span>
            <CountdownTime>{countdown}</CountdownTime>
          </CountdownPill>
        )}

        {!isConnected ? (
          <Button scale="xl" style={{ background: '#FFD700', color: '#280D5F', fontWeight: 700 }} onClick={connect}>
            🔓 Connect to Buy Tickets
          </Button>
        ) : (
          <Button scale="xl" style={{ background: '#FFD700', color: '#280D5F', fontWeight: 700 }} onClick={() => setShowBuy(true)}>
            🎟️ Buy Tickets
          </Button>
        )}
      </Hero>

      <Content>
        {/* Prize breakdown */}
        <PrizeCard>
          <PrizeHeader>
            <div>
              <Heading scale="md" style={{ marginBottom: 4 }}>🏆 Prize Distribution</Heading>
              <Text small color="textSubtle">Round #{activeRound.id}</Text>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Text small color="textSubtle">Total</Text>
              <Text bold style={{ color: '#1FC7D4', fontSize: 20 }}>
                {activeRound.totalPrize.toLocaleString('en-US', { maximumFractionDigits: 0 })} CAKE
              </Text>
            </div>
          </PrizeHeader>

          <PrizeGrid>
            {PRIZE_LABELS.map((label, i) => (
              <PrizeTier key={i} $color={PRIZE_COLORS[i]}>
                <TierIcon $color={PRIZE_COLORS[i]}>{TIER_ICONS[i]}</TierIcon>
                <TierLabel>{label}</TierLabel>
                <TierAmount $color={PRIZE_COLORS[i]}>
                  {(activeRound.prizePools[i] || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} CAKE
                </TierAmount>
                <TierWinners>
                  {activeRound.countWinners[i]} winner{activeRound.countWinners[i] !== 1 ? 's' : ''}
                </TierWinners>
                <Text small color="textSubtle" style={{ fontSize: 11, marginTop: 2 }}>
                  ≈{(activeRound.prizePerBracket[i] || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} CAKE each
                </Text>
              </PrizeTier>
            ))}
          </PrizeGrid>

          {/* Burn + treasury */}
          <div style={{ padding: '14px 24px', display: 'flex', gap: 24, flexWrap: 'wrap', borderTop: `1px solid` }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span>🔥</span>
              <div>
                <Text small color="textSubtle">Burned</Text>
                <Text small bold>{(activeRound.burnAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} CAKE</Text>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span>🏛️</span>
              <div>
                <Text small color="textSubtle">Treasury</Text>
                <Text small bold>{(activeRound.treasuryAmount || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })} CAKE</Text>
              </div>
            </div>
          </div>
        </PrizeCard>

        {/* Winning numbers */}
        <WinCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <Heading scale="md">🎯 Winning Numbers</Heading>
            <RoundSelect>
              {rounds.map(r => (
                <RoundBtn key={r.id} active={activeRound.id === r.id} onClick={() => setActiveRound(r)}>
                  #{r.id} {r.status === 'open' ? '🟢' : r.status === 'claimable' ? '🔵' : '⚫'}
                </RoundBtn>
              ))}
            </RoundSelect>
          </div>

          {activeRound.status === 'open' ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>🔮</Text>
              <Text color="textSubtle">Numbers will be drawn when the round closes</Text>
              <Text small color="textSubtle" style={{ marginTop: 4 }}>Draw in: {countdown}</Text>
            </div>
          ) : (
            <>
              <WinningNumbers numbers={activeRound.winningNumbers} animate size="md" />
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {activeRound.winningNumbers.map((n, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: PRIZE_COLORS[i], display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14,
                      fontFamily: 'Roboto Mono',
                    }}>{n}</div>
                    <Text small color="textSubtle" style={{ fontSize: 10 }}>#{i + 1}</Text>
                  </div>
                ))}
              </div>
            </>
          )}
        </WinCard>

        {/* My tickets */}
        <TicketsCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Heading scale="md">🎟️ My Tickets</Heading>
            <div style={{ display: 'flex', gap: 8 }}>
              {hasClaimable && (
                <Button scale="sm" variant="secondary" onClick={() => claimTickets(activeRound.id)} isLoading={claiming}>
                  🎁 Collect Winnings
                </Button>
              )}
              {activeRound.status === 'open' && (
                <Button scale="sm" onClick={() => setShowBuy(true)}>+ Buy More</Button>
              )}
            </div>
          </div>

          {myTickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>🎟️</Text>
              <Text color="textSubtle">No tickets for Round #{activeRound.id}</Text>
              {activeRound.status === 'open' && (
                <Button scale="sm" style={{ marginTop: 12 }} onClick={() => setShowBuy(true)}>Buy Tickets</Button>
              )}
            </div>
          ) : (
            <div>
              <Text small color="textSubtle" style={{ marginBottom: 10 }}>
                {myTickets.length} ticket{myTickets.length > 1 ? 's' : ''} in this round
              </Text>
              {myTickets.slice(0, 8).map(ticket => {
                const matches = activeRound.status !== 'open'
                  ? ticket.numbers.map((n, i) => n === activeRound.winningNumbers[i])
                  : null;
                const matchCt = matches ? matches.filter(Boolean).length : 0;
                const isWinner = matchCt > 0 && activeRound.status !== 'open';
                return (
                  <TicketItem key={ticket.id}>
                    <TicketId>#{ticket.id.toString().slice(-4)}</TicketId>
                    <WinningNumbers
                      numbers={ticket.numbers}
                      size="sm"
                      matchMask={matches || undefined}
                    />
                    {isWinner ? (
                      <Badge variant="success" style={{ marginLeft: 'auto' }}>
                        🎉 Match {matchCt}! {ticket.claimed ? '✓' : ''}
                      </Badge>
                    ) : activeRound.status !== 'open' ? (
                      <Badge style={{ marginLeft: 'auto' }}>No match</Badge>
                    ) : (
                      <Badge variant="info" style={{ marginLeft: 'auto' }}>Entered</Badge>
                    )}
                  </TicketItem>
                );
              })}
              {myTickets.length > 8 && (
                <Text small color="textSubtle" textAlign="center" style={{ marginTop: 8 }}>
                  +{myTickets.length - 8} more tickets
                </Text>
              )}
            </div>
          )}
        </TicketsCard>

        {/* How to play */}
        <HowCard>
          <Heading scale="md" style={{ marginBottom: 4 }}>🎲 How to Play</Heading>
          <Text small color="textSubtle" style={{ marginBottom: 0 }}>4 simple steps to win CAKE</Text>
          <StepGrid>
            {[
              { icon: '🎟️', title: 'Buy Tickets',      desc: 'Purchase tickets using CAKE. Each ticket has 6 numbers.' },
              { icon: '⏳', title: 'Wait for Draw',     desc: 'Draws happen every 12 hours. Numbers are drawn by Chainlink VRF.' },
              { icon: '🔢', title: 'Match Numbers',     desc: 'Match the winning numbers in exact order from left to right.' },
              { icon: '💰', title: 'Collect Prizes',    desc: 'Claim your CAKE prize based on how many numbers you matched.' },
            ].map((s, i) => (
              <StepBox key={i}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>{s.icon}</div>
                <Text bold small style={{ marginBottom: 6 }}>{s.title}</Text>
                <Text small color="textSubtle" style={{ lineHeight: 1.5 }}>{s.desc}</Text>
              </StepBox>
            ))}
          </StepGrid>
        </HowCard>
      </Content>

      {/* Buy modal */}
      {showBuy && (
        <BuyTicketsModal
          onDismiss={() => setShowBuy(false)}
          buyCount={buyCount}
          setBuyCount={setBuyCount}
          editTickets={editTickets}
          randomizeTicket={randomizeTicket}
          updateTicketNumber={updateTicketNumber}
          randomizeAll={randomizeAll}
          setRandomizeAll={setRandomizeAll}
          totalCost={totalCost}
          ticketPrice={openRound?.ticketPrice || 2.5}
          onBuy={buyTickets}
          buying={buying}
        />
      )}
    </Page>
  );
}
