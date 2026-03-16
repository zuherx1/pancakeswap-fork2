import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useSpringboard } from '../../hooks/useSpringboard';
import ProjectCard from '../../components/play/ProjectCard';
import ProjectDetailModal from '../../components/play/ProjectDetailModal';
import { Text, Heading } from '../../components/ui/Typography';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

/* ─── Animations ─────────────────────────────────────────────────────────── */
const float = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}`;
const glow  = keyframes`0%,100%{opacity:0.6}50%{opacity:1}`;

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const Page = styled.div`
  min-height: calc(100vh - 56px);
  background: ${({ theme }) => theme.colors.background};
`;

const Hero = styled.div`
  background: linear-gradient(135deg, #0098A1 0%, #7645D9 50%, #ED4B9E 100%);
  padding: 60px 24px;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const HeroBg = styled.div`
  position: absolute; inset: 0;
  background: radial-gradient(circle at 30% 50%, rgba(255,255,255,0.08) 0%, transparent 60%),
              radial-gradient(circle at 70% 50%, rgba(255,255,255,0.05) 0%, transparent 60%);
`;

const RocketFloat = styled.div`
  font-size: 80px;
  animation: ${float} 3s ease-in-out infinite;
  display: inline-block;
  margin-bottom: 16px;
  filter: drop-shadow(0 8px 24px rgba(0,0,0,0.3));
`;

const HeroTitle = styled(Heading)`
  color: white;
  font-size: clamp(28px, 5vw, 52px);
  margin-bottom: 12px;
  position: relative;
`;

const HeroSub = styled(Text)`
  color: rgba(255,255,255,0.85);
  font-size: 18px;
  max-width: 560px;
  margin: 0 auto 32px;
  position: relative;
  line-height: 1.6;
`;

const HeroStats = styled.div`
  display: flex; gap: 32px; justify-content: center;
  flex-wrap: wrap; position: relative;
`;

const HeroStat = styled.div`
  text-align: center;
`;

const HeroStatVal = styled.div`
  font-size: 28px; font-weight: 700; color: white;
  font-family: 'Kanit', sans-serif;
`;

const HeroStatLabel = styled.div`
  font-size: 13px; color: rgba(255,255,255,0.7);
`;

const Controls = styled.div`
  max-width: 1200px; margin: 32px auto 0; padding: 0 24px;
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
`;

const TabGroup = styled.div`
  display: flex; background: ${({ theme }) => theme.colors.input};
  border-radius: 14px; padding: 4px; gap: 4px;
`;

const TabBtn = styled.button<{ active?: boolean }>`
  padding: 8px 18px; border-radius: 10px;
  font-size: 14px; font-weight: 600; font-family: 'Kanit', sans-serif;
  border: none; cursor: pointer;
  background: ${({ active, theme }) => active ? theme.colors.backgroundAlt : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.text : theme.colors.textSubtle};
  transition: all 0.15s;
  box-shadow: ${({ active }) => active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'};
`;

const Grid = styled.div`
  max-width: 1200px; margin: 24px auto; padding: 0 24px 60px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
`;

const ApplyBanner = styled.div`
  max-width: 1200px; margin: 0 auto; padding: 0 24px;
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px;
  padding: 32px;
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 20px;
  margin: 0 24px 24px;
`;

const EmptyState = styled.div`
  grid-column: 1 / -1;
  text-align: center; padding: 80px 0;
`;

export default function SpringboardPage() {
  const {
    projects, activeTab, setActiveTab, search, setSearch,
    selected, setSelected, commitAmt, setCommitAmt,
    committing, claiming, commit, claim,
  } = useSpringboard();

  const liveCount     = projects.filter(p => p.saleStatus === 'live').length;
  const upcomingCount = projects.filter(p => p.saleStatus === 'upcoming').length;
  const totalRaised   = 2840000;

  return (
    <Page>
      {/* Hero */}
      <Hero>
        <HeroBg />
        <RocketFloat>🚀</RocketFloat>
        <HeroTitle scale="xl">Springboard</HeroTitle>
        <HeroSub>
          The premier launchpad on BNB Chain. Discover, invest and grow with the next generation of DeFi projects.
        </HeroSub>
        <HeroStats>
          <HeroStat>
            <HeroStatVal>${(totalRaised / 1e6).toFixed(1)}M+</HeroStatVal>
            <HeroStatLabel>Total Raised</HeroStatLabel>
          </HeroStat>
          <HeroStat>
            <HeroStatVal>42+</HeroStatVal>
            <HeroStatLabel>Projects Launched</HeroStatLabel>
          </HeroStat>
          <HeroStat>
            <HeroStatVal>128K+</HeroStatVal>
            <HeroStatLabel>Participants</HeroStatLabel>
          </HeroStat>
          <HeroStat>
            <HeroStatVal style={{ color: '#31D0AA' }}>100%</HeroStatVal>
            <HeroStatLabel>Success Rate</HeroStatLabel>
          </HeroStat>
        </HeroStats>
      </Hero>

      {/* Controls */}
      <Controls>
        <TabGroup>
          {(['all','live','upcoming','ended'] as const).map(t => (
            <TabBtn key={t} active={activeTab === t} onClick={() => setActiveTab(t)}>
              {t === 'live' && liveCount > 0 && <span style={{ marginRight: 4, color: '#31D0AA' }}>●</span>}
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'live' && liveCount > 0 && ` (${liveCount})`}
              {t === 'upcoming' && upcomingCount > 0 && ` (${upcomingCount})`}
            </TabBtn>
          ))}
        </TabGroup>
        <Input
          placeholder="🔍 Search projects"
          value={search}
          onChange={e => setSearch(e.target.value)}
          scale="sm"
          style={{ maxWidth: 260 }}
        />
      </Controls>

      {/* Apply to launch banner */}
      <div style={{ maxWidth: 1200, margin: '24px auto 0', padding: '0 24px' }}>
        <ApplyBanner style={{ margin: 0 }}>
          <div>
            <Text bold style={{ fontSize: 20, marginBottom: 6 }}>🌱 Launch your project on Springboard</Text>
            <Text small color="textSubtle">
              Join the most trusted launchpad on BNB Chain. Access 2M+ users, liquidity and community support.
            </Text>
          </div>
          <Button variant="secondary" scale="md">Apply to Launch →</Button>
        </ApplyBanner>
      </div>

      {/* Project grid */}
      <Grid>
        {projects.length === 0 ? (
          <EmptyState>
            <Text style={{ fontSize: 48 }}>🔍</Text>
            <Text color="textSubtle" style={{ fontSize: 18, marginTop: 12 }}>No projects found</Text>
          </EmptyState>
        ) : (
          projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => setSelected(project)}
            />
          ))
        )}
      </Grid>

      {/* Project detail modal */}
      {selected && (
        <ProjectDetailModal
          project={selected}
          onDismiss={() => setSelected(null)}
          onCommit={commit}
          onClaim={claim}
          committing={committing}
          claiming={claiming}
        />
      )}
    </Page>
  );
}
