import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Button } from '../ui/Button';
import { Text } from '../ui/Typography';
import { Badge } from '../ui/Badge';
import { IDOProject } from '../../hooks/useCakePad';

const pulse = keyframes`0%,100%{box-shadow:0 0 0 0 rgba(49,208,170,0.4)}50%{box-shadow:0 0 0 8px rgba(49,208,170,0)}`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px; overflow: hidden; cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
`;

const Banner = styled.div<{ status: string }>`
  height: 110px;
  background: ${({ status }) =>
    status === 'live'      ? 'linear-gradient(135deg,#0098A1,#7645D9)' :
    status === 'whitelist' ? 'linear-gradient(135deg,#1FC7D4,#31D0AA)' :
    status === 'upcoming'  ? 'linear-gradient(135deg,#F0B90B,#FF6B6B)' :
    status === 'claimable' ? 'linear-gradient(135deg,#7645D9,#ED4B9E)' :
    'linear-gradient(135deg,#383241,#524B63)'};
  position: relative; display: flex; align-items: center; justify-content: center;
`;

const LogoEmoji = styled.div`
  font-size: 56px; filter: drop-shadow(0 4px 12px rgba(0,0,0,0.25));
`;

const StatusPill = styled.div<{ status: string }>`
  position: absolute; top: 10px; right: 10px;
  padding: 3px 10px; border-radius: 16px;
  font-size: 11px; font-weight: 700; font-family: 'Kanit', sans-serif;
  color: white; backdrop-filter: blur(4px);
  background: ${({ status }) =>
    status === 'live'      ? 'rgba(49,208,170,0.85)' :
    status === 'whitelist' ? 'rgba(31,199,212,0.85)' :
    status === 'upcoming'  ? 'rgba(255,178,55,0.85)' :
    status === 'claimable' ? 'rgba(118,69,217,0.85)' :
    'rgba(122,110,170,0.85)'};
  ${({ status }) => status === 'live' && css`animation: ${pulse} 2s infinite;`}
`;

const FeaturedRibbon = styled.div`
  position: absolute; top: 10px; left: 10px;
  padding: 3px 10px; border-radius: 16px;
  font-size: 11px; font-weight: 700;
  background: rgba(255,215,0,0.85); color: #280D5F;
`;

const Body = styled.div`padding: 16px 18px 18px;`;

const Header = styled.div`display: flex; align-items: center; gap: 10px; margin-bottom: 8px;`;
const ProjectName   = styled.div`font-size: 17px; font-weight: 700; color: ${({ theme }) => theme.colors.text};`;
const ProjectSymbol = styled.div`font-size: 13px; color: ${({ theme }) => theme.colors.textSubtle};`;

const Tags = styled.div`display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 10px;`;

const Desc = styled.div`
  font-size: 12px; color: ${({ theme }) => theme.colors.textSubtle};
  line-height: 1.5; margin-bottom: 12px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
`;

const ProgressTrack = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 5px; height: 6px; overflow: hidden; margin: 6px 0 4px;
`;
const ProgressFill = styled.div<{ pct: number; status: string }>`
  height: 100%; border-radius: 5px;
  width: ${({ pct }) => Math.min(pct, 100)}%;
  background: ${({ status }) =>
    status === 'live' ? 'linear-gradient(90deg,#1FC7D4,#7645D9)' : '#31D0AA'};
  transition: width 0.6s ease;
`;

const MetaGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0 12px;
`;
const MetaBox = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 10px; padding: 8px 10px;
`;
const MetaLabel = styled.div`font-size: 10px; color: ${({ theme }) => theme.colors.textSubtle}; text-transform: uppercase; letter-spacing: 0.05em;`;
const MetaValue = styled.div`font-size: 13px; font-weight: 700; color: ${({ theme }) => theme.colors.text};`;

const ROIBadge = styled.div`
  display: inline-flex; align-items: center;
  background: rgba(49,208,170,0.15); color: #31D0AA;
  padding: 2px 8px; border-radius: 6px;
  font-size: 11px; font-weight: 700; margin-left: 6px;
`;

interface Props {
  project: IDOProject;
  onClick: () => void;
}

const IDOCard: React.FC<Props> = ({ project, onClick }) => {
  const pct = (project.raised / project.hardCap) * 100;
  const roi = project.listingPrice > 0 ? ((project.listingPrice / project.tokenPrice - 1) * 100) : 0;
  const athRoi = project.ath > 0 ? ((project.ath / project.tokenPrice - 1) * 100) : 0;
  const isFilled = pct >= 100;

  const STATUS_LABEL: Record<string, string> = {
    live: '🟢 LIVE', whitelist: '📋 WHITELIST', upcoming: '⏳ SOON',
    claimable: '🎁 CLAIM', ended: '✅ ENDED',
  };

  return (
    <Card onClick={onClick}>
      <Banner status={project.status}>
        <LogoEmoji>{project.logo}</LogoEmoji>
        <StatusPill status={project.status}>{STATUS_LABEL[project.status] || project.status.toUpperCase()}</StatusPill>
        {(project.status === 'live' || project.status === 'upcoming') && roi > 0 && (
          <FeaturedRibbon>⭐ {roi.toFixed(0)}% ROI</FeaturedRibbon>
        )}
        {(project.status === 'ended' || project.status === 'claimable') && athRoi > 0 && (
          <FeaturedRibbon>🚀 {athRoi.toFixed(0)}% ATH</FeaturedRibbon>
        )}
      </Banner>

      <Body>
        <Header>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ProjectName>{project.name}</ProjectName>
              {roi > 0 && <ROIBadge>+{roi.toFixed(0)}%</ROIBadge>}
            </div>
            <ProjectSymbol>${project.symbol} · {project.raiseToken} raise</ProjectSymbol>
          </div>
        </Header>

        <Tags>
          {project.category.slice(0, 2).map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
        </Tags>

        <Desc>{project.tagline}</Desc>

        {/* Progress bar (for non-upcoming) */}
        {project.status !== 'upcoming' && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <Text small color="textSubtle">Raised</Text>
              <Text small bold style={{ color: isFilled ? '#31D0AA' : undefined }}>
                {pct.toFixed(1)}% {isFilled && '🎉'}
              </Text>
            </div>
            <ProgressTrack>
              <ProgressFill pct={pct} status={project.status} />
            </ProgressTrack>
            <Text small color="textSubtle">
              ${project.raised.toLocaleString('en-US', { maximumFractionDigits: 0 })} / ${project.hardCap.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </Text>
          </div>
        )}

        {/* Meta stats */}
        <MetaGrid>
          <MetaBox>
            <MetaLabel>Token Price</MetaLabel>
            <MetaValue>${project.tokenPrice}</MetaValue>
          </MetaBox>
          <MetaBox>
            <MetaLabel>{project.status === 'upcoming' ? 'Hard Cap' : project.status === 'ended' || project.status === 'claimable' ? 'ATH Price' : 'Listing Price'}</MetaLabel>
            <MetaValue style={{ color: '#31D0AA' }}>
              {project.status === 'upcoming' ? `$${(project.hardCap / 1000).toFixed(0)}K` :
               project.status === 'ended' || project.status === 'claimable' ? (project.ath > 0 ? `$${project.ath}` : `$${project.listingPrice}`) :
               `$${project.listingPrice}`}
            </MetaValue>
          </MetaBox>
        </MetaGrid>

        <Button fullWidth
          variant={project.status === 'live' ? 'primary' : project.status === 'claimable' ? 'secondary' : project.status === 'whitelist' ? 'primary' : 'subtle'}
          style={{ fontSize: 14 }}>
          {project.status === 'live'      ? '🚀 Participate Now' :
           project.status === 'whitelist' ? '📋 Apply Whitelist' :
           project.status === 'upcoming'  ? '🔔 View Details'   :
           project.status === 'claimable' ? '🎁 Claim Tokens'   :
           '📊 View Results'}
        </Button>
      </Body>
    </Card>
  );
};

export default IDOCard;
