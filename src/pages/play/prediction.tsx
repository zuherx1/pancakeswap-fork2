import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { usePrediction } from '../../hooks/usePrediction';
import { useThemeContext } from '../../context/ThemeContext';
import RoundCard from '../../components/play/RoundCard';
import PredictionChart from '../../components/play/PredictionChart';
import { Text, Heading } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';

/* ─── Animations ─────────────────────────────────────────────────────────── */
const float = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}`;

/* ─── Page layout ─────────────────────────────────────────────────────────── */
const Page = styled.div`
  min-height: calc(100vh - 56px);
  background: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;

const Hero = styled.div`
  background: linear-gradient(135deg, #08060B 0%, #1a1139 50%, #0D0B1E 100%);
  padding: 40px 24px 32px;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
`;

const StarsBg = styled.div`
  position: absolute; inset: 0;
  background-image:
    radial-gradient(1px 1px at 20% 30%, white 0%, transparent 100%),
    radial-gradient(1px 1px at 60% 70%, white 0%, transparent 100%),
    radial-gradient(1px 1px at 80% 20%, white 0%, transparent 100%),
    radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,0.5) 0%, transparent 100%),
    radial-gradient(2px 2px at 90% 50%, rgba(255,255,255,0.3) 0%, transparent 100%);
`;

const HeroContent = styled.div`
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 32px; align-items: center;
  position: relative;

  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const HeroLeft = styled.div``;

const Crystal = styled.div`
  font-size: 72px;
  animation: ${float} 3s ease-in-out infinite;
  display: inline-block;
  margin-bottom: 12px;
  filter: drop-shadow(0 8px 32px rgba(118,69,217,0.6));
`;

const HeroTitle = styled(Heading)`
  color: white;
  font-size: clamp(28px,4vw,48px);
  margin-bottom: 8px;
`;

const HeroDesc = styled(Text)`
  color: rgba(255,255,255,0.7);
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const LivePricePill = styled.div<{ up: boolean }>`
  display: inline-flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 16px; padding: 10px 18px;
  backdrop-filter: blur(8px);
`;

const LiveDot = styled.div`
  width: 8px; height: 8px; border-radius: 50%;
  background: #31D0AA;
  animation: pulse 1.5s infinite;
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
`;

const PriceDisplay = styled.div<{ up: boolean }>`
  font-size: 28px; font-weight: 700;
  font-family: 'Roboto Mono', monospace;
  color: ${({ up }) => up ? '#31D0AA' : '#ED4B9E'};
`;

const HeroStats = styled.div`
  display: flex; gap: 20px; margin-top: 20px; flex-wrap: wrap;
`;

const HStat = styled.div`
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; padding: 10px 16px;
  backdrop-filter: blur(8px);
`;

const HStatVal = styled.div`font-size: 18px; font-weight: 700; color: white;`;
const HStatLbl = styled.div`font-size: 12px; color: rgba(255,255,255,0.6);`;

/* ─── Rounds area ─────────────────────────────────────────────────────────── */
const RoundsSection = styled.div`
  padding: 32px 24px;
  max-width: 1400px; margin: 0 auto;
`;

const SectionHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
`;

const RoundsScroll = styled.div`
  display: flex; gap: 20px;
  overflow-x: auto;
  padding-bottom: 16px;
  scrollbar-width: thin;
  &::-webkit-scrollbar { height: 6px; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.colors.textDisabled}; border-radius: 3px; }
`;

const InfoBanner = styled.div`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 20px; padding: 20px 24px;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 12px; margin-bottom: 24px;
`;

const HowToBox = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 20px; padding: 24px; margin-top: 32px;
  max-width: 800px;
`;

const StepGrid = styled.div`
  display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-top: 16px;
  @media (max-width: 576px) { grid-template-columns: 1fr; }
`;

const Step = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 16px; padding: 16px; text-align: center;
`;

export default function PredictionPage() {
  const { isDark } = useThemeContext();
  const pred = usePrediction();
  const {
    markPrice, priceHistory, rounds, timeLeft,
    selectedSide, setSelectedSide, betAmount, setBetAmount,
    placing, claiming, activeCard, setActiveCard,
    placeBet, claimWinnings, getPayoutMultiplier, isWinner,
  } = pred;

  const prevPrice = priceHistory.length > 1 ? priceHistory[priceHistory.length - 2].price : markPrice;
  const priceUp   = markPrice >= prevPrice;
  const liveRound = rounds.find(r => r.status === 'live');

  const totalPrize = rounds.reduce((s, r) => s + r.totalAmount, 0);
  const totalBets  = rounds.reduce((s, r) => s + (r.userBet ? 1 : 0), 0);

  return (
    <Page>
      {/* Hero */}
      <Hero>
        <StarsBg />
        <HeroContent>
          <HeroLeft>
            <Crystal>🔮</Crystal>
            <HeroTitle scale="xl">Prediction</HeroTitle>
            <HeroDesc>
              Predict whether BNB price will go UP or DOWN. Win BNB prizes every 5 minutes. No sign-up required.
            </HeroDesc>
            <LivePricePill up={priceUp}>
              <LiveDot />
              <div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>BNB/USD Live</div>
                <PriceDisplay up={priceUp}>${markPrice.toFixed(2)}</PriceDisplay>
              </div>
              <Text small style={{ color: priceUp ? '#31D0AA' : '#ED4B9E', fontWeight: 700 }}>
                {priceUp ? '▲' : '▼'} {Math.abs(((markPrice - prevPrice) / prevPrice) * 100).toFixed(3)}%
              </Text>
            </LivePricePill>
            <HeroStats>
              <HStat>
                <HStatVal>{rounds.filter(r => r.status !== 'next').length}</HStatVal>
                <HStatLbl>Rounds Today</HStatLbl>
              </HStat>
              <HStat>
                <HStatVal>{totalPrize.toFixed(1)} BNB</HStatVal>
                <HStatLbl>Prize Pool</HStatLbl>
              </HStat>
              <HStat>
                <HStatVal style={{ color: '#31D0AA' }}>3%</HStatVal>
                <HStatLbl>Treasury Fee</HStatLbl>
              </HStat>
            </HeroStats>
          </HeroLeft>

          {/* Live chart */}
          <div>
            <PredictionChart
              history={priceHistory}
              current={markPrice}
              lockPrice={liveRound?.lockPrice}
              isDark={isDark}
            />
          </div>
        </HeroContent>
      </Hero>

      <RoundsSection>
        <SectionHeader>
          <Heading scale="md">📈 Rounds</Heading>
          <Text small color="textSubtle">Click NEXT round card to place your bet</Text>
        </SectionHeader>

        {/* Info */}
        <InfoBanner>
          <div>
            <Text bold style={{ marginBottom: 4 }}>How to play</Text>
            <Text small color="textSubtle">
              1. Choose a round → 2. Predict UP or DOWN → 3. Confirm your BNB bet → 4. Collect winnings!
            </Text>
          </div>
          <Button variant="tertiary" scale="sm">📖 Learn more</Button>
        </InfoBanner>

        {/* Round cards scroll */}
        <RoundsScroll>
          {rounds.map(round => (
            <RoundCard
              key={round.epoch}
              round={round}
              timeLeft={timeLeft}
              oraclePrice={markPrice}
              isActive={activeCard === round.epoch}
              onActivate={() => setActiveCard(round.epoch)}
              selectedSide={selectedSide}
              setSelectedSide={setSelectedSide}
              betAmount={betAmount}
              setBetAmount={setBetAmount}
              onPlaceBet={placeBet}
              onClaim={claimWinnings}
              placing={placing}
              claiming={claiming}
              getPayoutMultiplier={getPayoutMultiplier}
              isWinner={isWinner}
            />
          ))}
        </RoundsScroll>

        {/* How it works */}
        <HowToBox>
          <Heading scale="md" style={{ marginBottom: 4 }}>🔮 How Prediction Works</Heading>
          <Text small color="textSubtle" style={{ marginBottom: 0 }}>Simple 5-minute prediction rounds</Text>
          <StepGrid>
            <Step>
              <div style={{ fontSize: 32, marginBottom: 8 }}>1️⃣</div>
              <Text bold small style={{ marginBottom: 4 }}>Choose a round</Text>
              <Text small color="textSubtle">Wait for a NEXT round and click to expand the card</Text>
            </Step>
            <Step>
              <div style={{ fontSize: 32, marginBottom: 8 }}>2️⃣</div>
              <Text bold small style={{ marginBottom: 4 }}>Predict &amp; Bet</Text>
              <Text small color="textSubtle">Enter UP or DOWN and set your BNB amount</Text>
            </Step>
            <Step>
              <div style={{ fontSize: 32, marginBottom: 8 }}>3️⃣</div>
              <Text bold small style={{ marginBottom: 4 }}>Collect Winnings</Text>
              <Text small color="textSubtle">If you predicted correctly, collect your share of the pool</Text>
            </Step>
          </StepGrid>
        </HowToBox>
      </RoundsSection>
    </Page>
  );
}
