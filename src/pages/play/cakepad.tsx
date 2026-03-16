import React, { useState } from 'react';
import styled from 'styled-components';
import { useCakePad, TIERS } from '../../hooks/useCakePad';
import { useWeb3 } from '../../context/Web3Context';
import IDOCard from '../../components/play/IDOCard';
import IDODetailModal from '../../components/play/IDODetailModal';
import { Text, Heading } from '../../components/ui/Typography';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

/* ─── Animations ─────────────────────────────────────────────────────────── */
// Animations are defined in global CSS (css/main.css) to avoid runtime keyframe injection issues.

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const Page = styled.div`min-height:calc(100vh - 56px); background:${({ theme }) => theme.colors.background};`;

const Hero = styled.div`
  background: linear-gradient(135deg,#7645D9 0%,#ED4B9E 50%,#FFB237 100%);
  padding: 56px 24px 44px; position: relative; overflow: hidden; text-align: center;
`;
const HeroBg = styled.div`
  position: absolute; inset: 0;
  background:
    radial-gradient(circle at 15% 50%,rgba(255,255,255,0.1) 0%,transparent 40%),
    radial-gradient(circle at 85% 30%,rgba(255,255,255,0.07) 0%,transparent 35%);
`;
const CakeFloat = styled.div`
  font-size: 72px; display: inline-block; margin-bottom: 14px;
  animation: float 4s ease-in-out infinite;
  filter: drop-shadow(0 8px 24px rgba(0,0,0,0.25));
`;
const HeroTitle = styled(Heading)`color:white; font-size:clamp(28px,5vw,52px); margin-bottom:8px;`;
const HeroSub   = styled(Text)`color:rgba(255,255,255,0.82); font-size:17px; max-width:520px; margin:0 auto 24px; line-height:1.6;`;
const HeroStats = styled.div`display:flex; gap:28px; justify-content:center; flex-wrap:wrap; position:relative;`;
const HStat     = styled.div`text-align:center;`;
const HStatVal  = styled.div`font-size:26px; font-weight:700; color:white; font-family:'Kanit',sans-serif;`;
const HStatLbl  = styled.div`font-size:12px; color:rgba(255,255,255,0.65);`;

/* ─── Tier section ───────────────────────────────────────────────────────── */
const TierSection = styled.div`
  max-width:1200px; margin:0 auto; padding:32px 24px 0;
`;
const TierScroll = styled.div`
  display:flex; gap:12px; overflow-x:auto; padding-bottom:8px;
  scrollbar-width:none; &::-webkit-scrollbar{display:none;}
`;
const TierCard = styled.div<{ $color:string; isUser?:boolean }>`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border:2px solid ${({ isUser,$color }) => isUser ? $color : 'transparent'};
  border-radius:20px; padding:18px 20px; min-width:160px; text-align:center;
  flex-shrink:0; cursor:pointer; transition:all 0.2s;
  box-shadow:${({ isUser,$color }) => isUser ? `0 0 20px ${$color}40` : 'none'};
  &:hover { transform:translateY(-3px); border-color:${({ $color }) => $color}; }
`;
const TierEmoji = styled.div`font-size:40px; margin-bottom:8px;`;
const TierName  = styled.div<{ $color:string }>`font-size:15px; font-weight:700; color:${({ $color }) => $color};`;
const TierReq   = styled.div`font-size:12px; color:${({ theme }) => theme.colors.textSubtle}; margin-top:3px;`;
const TierAlloc = styled.div`font-size:13px; font-weight:700; color:${({ theme }) => theme.colors.text}; margin-top:6px;`;

/* ─── CAKE calculator ────────────────────────────────────────────────────── */
const CalcCard = styled.div`
  max-width:1200px; margin:20px auto 0; padding:0 24px;
`;
const CalcInner = styled.div`
  background:${({ theme }) => theme.colors.backgroundAlt};
  border:1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius:20px; padding:20px 24px;
  display:flex; align-items:center; gap:16px; flex-wrap:wrap;
`;
const CalcInput = styled.input`
  flex:1; min-width:140px; background:${({ theme }) => theme.colors.input};
  border:1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius:12px; padding:10px 14px;
  font-size:16px; font-weight:600; color:${({ theme }) => theme.colors.text};
  font-family:'Kanit',sans-serif; outline:none;
  &:focus{border-color:${({ theme }) => theme.colors.primary};}
`;
const TierResult = styled.div<{ $color:string }>`
  display:flex; align-items:center; gap:8px;
  background:${({ $color }) => $color+'15'};
  border:1px solid ${({ $color }) => $color};
  border-radius:12px; padding:8px 16px;
  font-size:15px; font-weight:700; color:${({ $color }) => $color};
`;

/* ─── Controls ────────────────────────────────────────────────────────────── */
const Controls = styled.div`
  max-width:1200px; margin:24px auto 0; padding:0 24px;
  display:flex; align-items:center; gap:12px; flex-wrap:wrap;
`;
const TabGroup = styled.div`
  display:flex; background:${({ theme }) => theme.colors.input};
  border-radius:14px; padding:4px; gap:4px;
`;
const TabBtn = styled.button<{ active?:boolean }>`
  padding:7px 16px; border-radius:10px;
  font-size:13px; font-weight:600; font-family:'Kanit',sans-serif;
  border:none; cursor:pointer;
  background:${({ active,theme }) => active ? theme.colors.backgroundAlt : 'transparent'};
  color:${({ active,theme }) => active ? theme.colors.text : theme.colors.textSubtle};
  transition:all 0.15s;
  box-shadow:${({ active }) => active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'};
`;

/* ─── Grid ────────────────────────────────────────────────────────────────── */
const Grid = styled.div`
  max-width:1200px; margin:20px auto; padding:0 24px 60px;
  display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:22px;
`;

const ApplyBanner = styled.div`
  max-width:1200px; margin:0 24px; padding:28px 32px;
  background:${({ theme }) => theme.colors.gradientInverseBubblegum};
  border:1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius:24px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px;
`;

export default function CakePadPage() {
  const { isConnected } = useWeb3();
  const {
    projects, selected, setSelected,
    activeTab, setActiveTab, search, setSearch,
    commitAmt, setCommitAmt, committing, claiming,
    commit, claim, applyWhitelist,
    cakeInput, setCakeInput, getUserTier, TIERS: tiers,
  } = useCakePad();

  const userTier   = getUserTier(Number(cakeInput) || 0);
  const liveCount  = projects.filter(p => p.status === 'live').length;
  const totalRaised= 18_400_000;

  return (
    <Page>
      {/* Hero */}
      <Hero>
        <HeroBg />
        <CakeFloat>🎂</CakeFloat>
        <HeroTitle scale="xl">CakePad</HeroTitle>
        <HeroSub>The premier IDO launchpad powered by CAKE. Stake CAKE to unlock exclusive tier allocations.</HeroSub>
        <HeroStats>
          <HStat><HStatVal>${(totalRaised/1e6).toFixed(1)}M+</HStatVal><HStatLbl>Total Raised</HStatLbl></HStat>
          <HStat><HStatVal>68+</HStatVal><HStatLbl>Projects Launched</HStatLbl></HStat>
          <HStat><HStatVal>210K+</HStatVal><HStatLbl>Participants</HStatLbl></HStat>
          <HStat><HStatVal style={{ color:'#FFD700' }}>12.4x</HStatVal><HStatLbl>Avg ATH ROI</HStatLbl></HStat>
        </HeroStats>
      </Hero>

      {/* Tier showcase */}
      <TierSection>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
          <Heading scale="md">🏅 Participation Tiers</Heading>
          <Text small color="textSubtle">Hold CAKE to unlock better allocations</Text>
        </div>
        <TierScroll>
          {[...tiers].reverse().map(tier => (
            <TierCard key={tier.name} $color={tier.color}>
              <TierEmoji>{tier.icon}</TierEmoji>
              <TierName $color={tier.color}>{tier.name}</TierName>
              <TierReq>{tier.minCAKE > 0 ? `${tier.minCAKE.toLocaleString()}+ CAKE` : 'No min.'}</TierReq>
              <TierAlloc>Up to ${tier.allocation.toLocaleString()}</TierAlloc>
              <Text small color="textSubtle" style={{ marginTop:4 }}>{tier.multiplier}x multiplier</Text>
            </TierCard>
          ))}
        </TierScroll>
      </TierSection>

      {/* CAKE tier calculator */}
      <CalcCard>
        <CalcInner>
          <Text bold style={{ whiteSpace:'nowrap' }}>🧮 Tier Calculator</Text>
          <CalcInput
            placeholder="Enter your CAKE amount…"
            value={cakeInput}
            onChange={e => setCakeInput(e.target.value)}
            type="number" min="0"
          />
          <TierResult $color={userTier.color}>
            {userTier.icon} {userTier.name} Tier
            {Number(cakeInput) > 0 && ` — up to $${userTier.allocation.toLocaleString()}`}
          </TierResult>
          {Number(cakeInput) > 0 && (() => {
            const nextTier = tiers.find(t => t.minCAKE > (Number(cakeInput) || 0));
            return nextTier ? (
              <Text small color="textSubtle">
                {(nextTier.minCAKE - Number(cakeInput)).toLocaleString()} more CAKE for {nextTier.icon} {nextTier.name}
              </Text>
            ) : <Text small color="success">🏆 Maximum tier reached!</Text>;
          })()}
        </CalcInner>
      </CalcCard>

      {/* Apply banner */}
      <div style={{ maxWidth:1200, margin:'24px auto 0', padding:'0 24px' }}>
        <ApplyBanner style={{ margin:0 }}>
          <div>
            <Text bold style={{ fontSize:19, marginBottom:5 }}>🚀 Launch your token on CakePad</Text>
            <Text small color="textSubtle">Access 2M+ CAKE holders, guaranteed liquidity and community support on BNB Chain.</Text>
          </div>
          <Button variant="secondary" scale="md">Apply to Launch →</Button>
        </ApplyBanner>
      </div>

      {/* Controls */}
      <Controls>
        <TabGroup>
          {(['all','live','whitelist','upcoming','ended'] as const).map(t => (
            <TabBtn key={t} active={activeTab === t} onClick={() => setActiveTab(t)}>
              {t === 'live' && liveCount > 0 && <span style={{ color:'#31D0AA', marginRight:4 }}>●</span>}
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'live' && liveCount > 0 && ` (${liveCount})`}
            </TabBtn>
          ))}
        </TabGroup>
        <Input
          placeholder="🔍 Search IDOs"
          value={search}
          onChange={e => setSearch(e.target.value)}
          scale="sm"
          style={{ maxWidth:240 }}
        />
      </Controls>

      {/* IDO grid */}
      <Grid>
        {projects.length === 0 ? (
          <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 0' }}>
            <Text style={{ fontSize:40 }}>🔍</Text>
            <Text color="textSubtle" style={{ fontSize:18, marginTop:12 }}>No projects found</Text>
          </div>
        ) : (
          projects.map(p => (
            <IDOCard key={p.id} project={p} onClick={() => setSelected(p)} />
          ))
        )}
      </Grid>

      {/* IDO detail modal */}
      {selected && (
        <IDODetailModal
          project={selected}
          onDismiss={() => setSelected(null)}
          onCommit={commit}
          onClaim={claim}
          onApply={applyWhitelist}
          commitAmt={commitAmt}
          setCommitAmt={setCommitAmt}
          committing={committing}
          claiming={claiming}
        />
      )}
    </Page>
  );
}
