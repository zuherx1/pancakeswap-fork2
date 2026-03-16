import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Button } from '../ui/Button';
import { Text } from '../ui/Typography';
import { Badge, HotTag } from '../ui/Badge';
import { ILOProject } from '../../hooks/useSpringboard';
import TokenLogo from '../ui/TokenLogo';

const pulse = keyframes`0%,100%{box-shadow:0 0 0 0 rgba(49,208,170,0.4)}50%{box-shadow:0 0 0 8px rgba(49,208,170,0)}`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.12); }
`;

const CardBanner = styled.div<{ status: string }>`
  height: 120px;
  background: ${({ status }) =>
    status === 'live'     ? 'linear-gradient(135deg,#0098A1 0%,#7645D9 100%)' :
    status === 'upcoming' ? 'linear-gradient(135deg,#F0B90B 0%,#FF6B6B 100%)' :
    status === 'ended'    ? 'linear-gradient(135deg,#383241 0%,#524B63 100%)' :
    'linear-gradient(135deg,#1FC7D4 0%,#31D0AA 100%)'};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BannerEmoji = styled.div`
  font-size: 64px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
`;

const StatusPill = styled.div<{ status: string }>`
  position: absolute;
  top: 12px; right: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px; font-weight: 700;
  font-family: 'Kanit', sans-serif;
  background: ${({ status }) =>
    status === 'live'     ? 'rgba(49,208,170,0.9)' :
    status === 'upcoming' ? 'rgba(255,178,55,0.9)' :
    'rgba(122,110,170,0.9)'};
  color: white;
  backdrop-filter: blur(4px);
  ${({ status }) => status === 'live' && 'animation: pulse 2s infinite;'}

  @keyframes pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(49,208,170,0.5); }
    50%      { box-shadow: 0 0 0 6px rgba(49,208,170,0); }
  }
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: 12px; left: 12px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px; font-weight: 700;
  background: rgba(118,69,217,0.85);
  color: white;
  backdrop-filter: blur(4px);
`;

const CardBody = styled.div`padding: 18px 20px 20px;`;

const ProjectHeader = styled.div`
  display: flex; align-items: center; gap: 12px; margin-bottom: 10px;
`;

const LogoCircle = styled.div`
  width: 44px; height: 44px; border-radius: 50%;
  background: ${({ theme }) => theme.colors.gradientBold};
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; flex-shrink: 0;
  border: 2px solid ${({ theme }) => theme.colors.backgroundAlt};
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
`;

const ProjectName = styled.div`font-size: 18px; font-weight: 700; color: ${({ theme }) => theme.colors.text};`;
const ProjectSymbol = styled.div`font-size: 13px; color: ${({ theme }) => theme.colors.textSubtle};`;

const TagRow = styled.div`display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 12px;`;

const Desc = styled.div`
  font-size: 13px; color: ${({ theme }) => theme.colors.textSubtle};
  line-height: 1.5; margin-bottom: 14px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
`;

const ProgressSection = styled.div`margin-bottom: 14px;`;

const ProgressTrack = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 6px; height: 8px; overflow: hidden; margin: 6px 0 4px;
`;

const ProgressFill = styled.div<{ pct: number; status: string }>`
  height: 100%; border-radius: 6px;
  width: ${({ pct }) => Math.min(pct, 100)}%;
  background: ${({ status }) =>
    status === 'ended' ? '#31D0AA' :
    status === 'live'  ? 'linear-gradient(90deg,#1FC7D4,#7645D9)' : '#BDC2C4'};
  transition: width 0.8s ease;
`;

const ProgressRow = styled.div`display: flex; justify-content: space-between;`;

const StatsRow = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;
`;

const StatBox = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 12px; padding: 10px 12px;
`;

const StatLabel = styled.div`font-size: 11px; color: ${({ theme }) => theme.colors.textSubtle}; margin-bottom: 2px;`;
const StatValue = styled.div`font-size: 14px; font-weight: 700; color: ${({ theme }) => theme.colors.text};`;

const RaiseRow = styled.div`
  display: flex; align-items: center; gap: 6px; margin-bottom: 4px;
`;

interface Props {
  project:   ILOProject;
  onClick:   () => void;
}

const ProjectCard: React.FC<Props> = ({ project, onClick }) => {
  const pct       = (project.currentRaise / project.totalRaise) * 100;
  const isSoldOut = project.currentRaise >= project.totalRaise;

  return (
    <Card onClick={onClick}>
      <CardBanner status={project.saleStatus}>
        <BannerEmoji>{project.logoURI}</BannerEmoji>
        <StatusPill status={project.saleStatus}>
          {project.saleStatus === 'live' ? '🟢 LIVE' : project.saleStatus === 'upcoming' ? '⏳ SOON' : project.saleStatus === 'ended' ? '✅ ENDED' : '🎉 CLAIMED'}
        </StatusPill>
        {project.isFeatured && <FeaturedBadge>⭐ Featured</FeaturedBadge>}
      </CardBanner>

      <CardBody>
        <ProjectHeader>
          <LogoCircle>{project.logoURI}</LogoCircle>
          <div>
            <ProjectName>{project.name}</ProjectName>
            <ProjectSymbol>${project.symbol}</ProjectSymbol>
          </div>
        </ProjectHeader>

        <TagRow>
          {project.tags.slice(0, 3).map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
          {project.isNew && <Badge variant="info">New</Badge>}
        </TagRow>

        <Desc>{project.description}</Desc>

        {/* Progress */}
        {project.saleStatus !== 'upcoming' && (
          <ProgressSection>
            <ProgressRow>
              <Text small color="textSubtle">Progress {isSoldOut && '🎉'}</Text>
              <Text small bold style={{ color: isSoldOut ? '#31D0AA' : undefined }}>{pct.toFixed(1)}%</Text>
            </ProgressRow>
            <ProgressTrack>
              <ProgressFill pct={pct} status={project.saleStatus} />
            </ProgressTrack>
            <RaiseRow>
              <img src={project.raiseTokenLogo} alt="" style={{ width: 14, height: 14, borderRadius: '50%' }} />
              <Text small bold>{project.currentRaise.toLocaleString()}</Text>
              <Text small color="textSubtle">/ {project.totalRaise.toLocaleString()} {project.raiseToken}</Text>
            </RaiseRow>
          </ProgressSection>
        )}

        {/* Stats */}
        <StatsRow>
          <StatBox>
            <StatLabel>Token Price</StatLabel>
            <StatValue>{project.tokenPrice} {project.raiseToken}</StatValue>
          </StatBox>
          <StatBox>
            <StatLabel>
              {project.saleStatus === 'upcoming' ? 'Starts In' : 'Participants'}
            </StatLabel>
            <StatValue>
              {project.saleStatus === 'upcoming'
                ? `${Math.ceil((project.startTime - Date.now()) / 86400000)}d`
                : project.participants.toLocaleString()
              }
            </StatValue>
          </StatBox>
        </StatsRow>

        <Button
          fullWidth
          variant={project.saleStatus === 'live' ? 'primary' : project.saleStatus === 'upcoming' ? 'secondary' : 'subtle'}
        >
          {project.saleStatus === 'live'     ? '🚀 Join Sale'       :
           project.saleStatus === 'upcoming' ? '🔔 View Details'    :
           project.saleStatus === 'ended'    ? '📋 View Results'    :
           '🎉 Claimed'}
        </Button>
      </CardBody>
    </Card>
  );
};

export default ProjectCard;
