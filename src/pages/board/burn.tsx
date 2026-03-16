import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useBurn } from '../../hooks/useBurn';
import { useThemeContext } from '../../context/ThemeContext';
import LineChart from '../../components/board/LineChart';
import { Text, Heading } from '../../components/ui/Typography';
import PageHeader from '../../components/layout/PageHeader';

/* ─── Animations ─────────────────────────────────────────────────────────── */
const flicker = keyframes`0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.85;transform:scale(1.05)}`;
const countUp = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const Page    = styled.div`min-height:calc(100vh - 56px); background:${({ theme }) => theme.colors.background};`;
const Content = styled.div`max-width:1200px; margin:0 auto; padding:28px 24px 60px;`;

/* Hero burn counter */
const BurnHero = styled.div`
  background:linear-gradient(135deg,#280D5F 0%,#7645D9 50%,#ED4B9E 100%);
  border-radius:24px; padding:36px 32px; text-align:center;
  margin-bottom:28px; position:relative; overflow:hidden;
`;
const HeroBg = styled.div`
  position:absolute; inset:0;
  background:radial-gradient(circle at 50% 50%,rgba(255,215,0,0.08) 0%,transparent 60%);
`;
const FireEmoji = styled.div`
  font-size:64px; display:inline-block; margin-bottom:12px;
  animation:${flicker} 2s ease-in-out infinite;
  filter:drop-shadow(0 0 20px rgba(255,100,0,0.6));
`;
const BurnAmount = styled.div`
  font-size:clamp(36px,6vw,72px); font-weight:700;
  font-family:'Kanit',sans-serif; color:white;
  text-shadow:0 0 40px rgba(255,215,0,0.4);
  animation:${countUp} 0.5s ease;
`;
const BurnUSD = styled.div`font-size:20px; color:rgba(255,255,255,0.75); margin-top:6px;`;
const BurnSub = styled.div`font-size:14px; color:rgba(255,255,255,0.55); margin-top:8px;`;

/* Stats */
const StatGrid = styled.div`
  display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px;
  @media(max-width:768px){grid-template-columns:1fr 1fr;}
  @media(max-width:480px){grid-template-columns:1fr;}
`;
const StatCard = styled.div`
  background:${({ theme }) => theme.colors.backgroundAlt};
  border:1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius:20px; padding:20px 22px;
`;
const StatLabel = styled.div`font-size:12px; color:${({ theme }) => theme.colors.textSubtle}; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:6px;`;
const StatVal   = styled.div`font-size:22px; font-weight:700; color:${({ theme }) => theme.colors.text};`;

/* Supply bar */
const SupplyCard = styled.div`
  background:${({ theme }) => theme.colors.backgroundAlt};
  border:1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius:20px; padding:22px 24px; margin-bottom:28px;
`;
const SupplyBar = styled.div`
  height:16px; border-radius:8px; overflow:hidden;
  background:${({ theme }) => theme.colors.input};
  display:flex; margin:12px 0;
`;
const SupplyCirc   = styled.div<{pct:number}>`height:100%; width:${({pct})=>pct}%; background:#1FC7D4; transition:width 0.8s;`;
const SupplyBurned = styled.div<{pct:number}>`height:100%; width:${({pct})=>pct}%; background:linear-gradient(90deg,#ED4B9E,#FF6B6B); transition:width 0.8s;`;
const SupplyRest   = styled.div`flex:1; height:100%; background:${({ theme }) => theme.colors.input};`;

/* Charts */
const ChartGrid = styled.div`
  display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:28px;
  @media(max-width:768px){grid-template-columns:1fr;}
`;
const ChartCard = styled.div`
  background:${({ theme }) => theme.colors.backgroundAlt};
  border:1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius:20px; overflow:hidden; padding:18px 18px 8px;
`;

/* Burn events */
const EventsCard = styled.div`
  background:${({ theme }) => theme.colors.backgroundAlt};
  border:1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius:20px; overflow:hidden;
`;
const EventsHeader = styled.div`
  padding:16px 20px; border-bottom:1px solid ${({ theme }) => theme.colors.cardBorder};
  display:flex; align-items:center; justify-content:space-between;
`;
const EventRow = styled.div`
  display:grid; grid-template-columns:1fr 1fr 1fr 1fr;
  padding:14px 20px; border-bottom:1px solid ${({ theme }) => theme.colors.cardBorder};
  align-items:center; transition:background 0.15s;
  &:last-child{border-bottom:none;}
  &:hover{background:${({ theme }) => theme.colors.input};}
  @media(max-width:576px){grid-template-columns:1fr 1fr;}
`;
const TypeBadge = styled.div<{type:string}>`
  display:inline-flex; align-items:center; gap:5px;
  padding:3px 10px; border-radius:8px; font-size:12px; font-weight:700;
  background:${({ type }) =>
    type==='weekly' ? 'rgba(237,75,158,0.15)' :
    type==='auto'   ? 'rgba(49,208,170,0.15)' :
    'rgba(118,69,217,0.15)'};
  color:${({ type }) =>
    type==='weekly' ? '#ED4B9E' :
    type==='auto'   ? '#31D0AA' : '#7645D9'};
`;

const fmt = (n:number):string => {
  if(n>=1e6) return `${(n/1e6).toFixed(2)}M`;
  if(n>=1e3) return `${(n/1e3).toFixed(2)}K`;
  return n.toFixed(2);
};
const fmtUSD = (n:number):string => {
  if(n>=1e6) return `$${(n/1e6).toFixed(2)}M`;
  if(n>=1e3) return `$${(n/1e3).toFixed(0)}K`;
  return `$${n.toFixed(2)}`;
};

export default function BurnPage() {
  const { isDark } = useThemeContext();
  const {
    totalBurned, burnedUSD, burnedPct,
    totalSupply, maxSupply, circulatingSup,
    cakePrice, weeklyBurnAvg, autoBurnDay,
    burnHistory, weeklyBurns, burnEvents,
  } = useBurn();

  const circPct  = (circulatingSup / maxSupply) * 100;
  const burnedP  = (totalBurned    / maxSupply) * 100;

  return (
    <Page>
      <PageHeader
        title="🔥 Burn Dashboard"
        subtitle="Track CAKE token burn events and deflationary mechanics"
        background="linear-gradient(139.73deg,#FFF7DC 0%,#F3EFFF 100%)"
      />
      <Content>

        {/* Hero counter */}
        <BurnHero>
          <HeroBg />
          <FireEmoji>🔥</FireEmoji>
          <div style={{ fontSize:16, color:'rgba(255,255,255,0.7)', marginBottom:8, position:'relative' }}>
            Total CAKE Burned
          </div>
          <BurnAmount>{fmt(totalBurned)} CAKE</BurnAmount>
          <BurnUSD>{fmtUSD(burnedUSD)} burned forever</BurnUSD>
          <BurnSub>
            {burnedPct.toFixed(2)}% of max supply · Live burn in progress
            <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:'#31D0AA', marginLeft:8, animation:'pulse 1.5s infinite' }} />
          </BurnSub>
        </BurnHero>

        {/* Stats */}
        <StatGrid>
          <StatCard>
            <StatLabel>CAKE Price</StatLabel>
            <StatVal style={{ color:'#1FC7D4' }}>${cakePrice.toFixed(4)}</StatVal>
          </StatCard>
          <StatCard>
            <StatLabel>Weekly Burn (avg)</StatLabel>
            <StatVal style={{ color:'#ED4B9E' }}>🔥 {fmt(weeklyBurnAvg)} CAKE</StatVal>
          </StatCard>
          <StatCard>
            <StatLabel>Auto Burn / Day</StatLabel>
            <StatVal>{fmt(autoBurnDay)} CAKE</StatVal>
          </StatCard>
          <StatCard>
            <StatLabel>USD Burned (total)</StatLabel>
            <StatVal style={{ color:'#FFD700' }}>{fmtUSD(burnedUSD)}</StatVal>
          </StatCard>
        </StatGrid>

        {/* Supply breakdown */}
        <SupplyCard>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
            <Heading scale="md">Supply Breakdown</Heading>
            <Text small color="textSubtle">Max: {fmt(maxSupply)} CAKE</Text>
          </div>
          <SupplyBar>
            <SupplyCirc   pct={circPct} />
            <SupplyBurned pct={burnedP} />
            <SupplyRest />
          </SupplyBar>
          <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:12, height:12, borderRadius:3, background:'#1FC7D4' }} />
              <Text small>Circulating: {fmt(circulatingSup)} ({circPct.toFixed(1)}%)</Text>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:12, height:12, borderRadius:3, background:'linear-gradient(90deg,#ED4B9E,#FF6B6B)' }} />
              <Text small>Burned: {fmt(totalBurned)} ({burnedP.toFixed(1)}%)</Text>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:12, height:12, borderRadius:3, background:'#E7E3EB' }} />
              <Text small>Unminted: {fmt(maxSupply - totalSupply)} ({((maxSupply-totalSupply)/maxSupply*100).toFixed(1)}%)</Text>
            </div>
          </div>
        </SupplyCard>

        {/* Charts */}
        <ChartGrid>
          <ChartCard>
            <div style={{ fontWeight:700, marginBottom:12 }}>Cumulative Burn (52w)</div>
            <LineChart
              data={burnHistory}
              color="#ED4B9E"
              fillColor="#ED4B9E"
              isDark={isDark}
              formatY={v => `${(v/1e6).toFixed(0)}M`}
            />
          </ChartCard>
          <ChartCard>
            <div style={{ fontWeight:700, marginBottom:12 }}>Weekly Burns</div>
            <LineChart
              data={weeklyBurns}
              color="#FFD700"
              fillColor="#FFD700"
              isDark={isDark}
              formatY={v => `${(v/1e6).toFixed(1)}M`}
            />
          </ChartCard>
        </ChartGrid>

        {/* Burn events */}
        <EventsCard>
          <EventsHeader>
            <Heading scale="md">🔥 Recent Burn Events</Heading>
            <Text small color="textSubtle">On-chain burn transactions</Text>
          </EventsHeader>
          <EventRow style={{ background: 'none', cursor:'default', borderBottom:'1px solid' }}>
            {['Transaction','Type','Amount','USD Value'].map(h => (
              <Text key={h} small color="textSubtle" bold style={{ fontSize:12, textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</Text>
            ))}
          </EventRow>
          {burnEvents.map((e, i) => (
            <EventRow key={i}>
              <div>
                <a href={`https://bscscan.com/tx/${e.tx}`} target="_blank" rel="noreferrer"
                  style={{ color:'#1FC7D4', fontSize:13, fontFamily:'Roboto Mono,monospace', textDecoration:'none' }}
                  onClick={ev => ev.stopPropagation()}>
                  {e.tx} ↗
                </a>
                <Text small color="textSubtle" style={{ marginTop:2 }}>
                  {new Date(e.timestamp).toLocaleDateString()}
                </Text>
              </div>
              <TypeBadge type={e.type}>
                {e.type === 'weekly' ? '🔥 Weekly' : e.type === 'auto' ? '⚡ Auto' : '🤝 Manual'}
              </TypeBadge>
              <div>
                <Text bold style={{ color:'#ED4B9E' }}>🔥 {fmt(e.amount)} CAKE</Text>
              </div>
              <div>
                <Text bold>{fmtUSD(e.usdValue)}</Text>
              </div>
            </EventRow>
          ))}
        </EventsCard>

        {/* How burn works */}
        <div style={{ background:'rgba(237,75,158,0.05)', border:'1px solid rgba(237,75,158,0.15)', borderRadius:20, padding:'20px 24px', marginTop:24 }}>
          <Heading scale="md" style={{ marginBottom:12 }}>How CAKE Burn Works</Heading>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
            {[
              { icon:'📅', title:'Weekly Burns',   desc:'Each week, PancakeSwap burns CAKE using revenue from trading fees, lottery, and other products.' },
              { icon:'⚡', title:'Auto Burns',     desc:'A portion of every swap on PancakeSwap automatically contributes to the burn mechanism.' },
              { icon:'🗳️', title:'IFO Burns',      desc:'20% of every IFO raise is used to buy and burn CAKE tokens permanently.' },
            ].map(b => (
              <div key={b.title} style={{ background:'rgba(237,75,158,0.08)', borderRadius:14, padding:'14px 16px' }}>
                <div style={{ fontSize:28, marginBottom:8 }}>{b.icon}</div>
                <Text bold small style={{ marginBottom:6 }}>{b.title}</Text>
                <Text small color="textSubtle" style={{ lineHeight:1.5 }}>{b.desc}</Text>
              </div>
            ))}
          </div>
        </div>

      </Content>
    </Page>
  );
}
