import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button } from '../ui/Button';
import { Text } from '../ui/Typography';
import TokenLogo from '../ui/TokenLogo';
import { Badge, CoreTag, CommunityTag, HotTag } from '../ui/Badge';
import StakeModal from './StakeModal';
import { Farm } from '../../hooks/useFarms';
import { useWeb3 } from '../../context/Web3Context';

const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;

const Card = styled.div<{ expanded?: boolean }>`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px;
  overflow: hidden;
  transition: box-shadow 0.2s;
  &:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
`;

const CardTop = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
  align-items: center;
  padding: 20px 24px;
  gap: 16px;
  cursor: pointer;

  @media (max-width: 968px) {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
`;

const TokenPair = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoStack = styled.div`
  position: relative;
  width: 56px;
  height: 40px;
  flex-shrink: 0;
`;

const Logo1 = styled.div`position: absolute; left: 0; top: 0; z-index: 2;`;
const Logo2 = styled.div`position: absolute; left: 24px; top: 8px; z-index: 1;`;

const PairInfo = styled.div`display: flex; flex-direction: column; gap: 4px;`;

const TagRow = styled.div`display: flex; gap: 4px; flex-wrap: wrap;`;

const StatCol = styled.div``;
const StatLabel = styled.div`font-size: 12px; color: ${({ theme }) => theme.colors.textSubtle}; margin-bottom: 2px;`;
const StatValue = styled.div`font-size: 15px; font-weight: 700; color: ${({ theme }) => theme.colors.text};`;
const StatSub   = styled.div`font-size: 11px; color: ${({ theme }) => theme.colors.textSubtle};`;

const MultiplierBadge = styled.div`
  background: ${({ theme }) => theme.colors.secondary + '20'};
  color: ${({ theme }) => theme.colors.secondary};
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
`;

const ExpandBtn = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 8px;
  transition: transform 0.2s;
  &:hover { background: ${({ theme }) => theme.colors.input}; }
`;

/* Expanded panel */
const Expanded = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 20px 24px;
  background: ${({ theme }) => theme.colors.gradientCardHeader};
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const EarnedBox = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px;
  padding: 16px;
`;

const StakedBox = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px;
  padding: 16px;
`;

const LinksBox = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LinkBtn = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  padding: 4px 0;
  transition: opacity 0.15s;
  &:hover { opacity: 0.7; text-decoration: none; }
`;

const EarnedAmount = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 8px 0;
`;

const StakeRow = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const formatNumber = (n: number): string => {
  if (n >= 1e9) return `$${(n/1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n/1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n/1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
};

interface Props {
  farm:      Farm;
  expanded:  boolean;
  onExpand:  () => void;
  onStake:   (pid: number, amount: number) => Promise<void>;
  onUnstake: (pid: number, amount: number) => Promise<void>;
  onHarvest: (pid: number) => Promise<void>;
  loading:   boolean;
}

const FarmCard: React.FC<Props> = ({ farm, expanded, onExpand, onStake, onUnstake, onHarvest, loading }) => {
  const { isConnected, connect } = useWeb3();
  const [showStake, setShowStake] = useState(false);

  return (
    <>
      <Card expanded={expanded}>
        <CardTop onClick={onExpand}>
          {/* Token pair */}
          <TokenPair>
            <LogoStack>
              <Logo1><TokenLogo src={farm.token0.logoURI} symbol={farm.token0.symbol} size={32} /></Logo1>
              <Logo2><TokenLogo src={farm.token1.logoURI} symbol={farm.token1.symbol} size={28} /></Logo2>
            </LogoStack>
            <PairInfo>
              <Text bold style={{ fontSize: 16 }}>{farm.lpSymbol}</Text>
              <TagRow>
                {farm.isCore      && <CoreTag>Core</CoreTag>}
                {farm.isCommunity && <CommunityTag>Community</CommunityTag>}
                {farm.isNew       && <Badge variant="info">New</Badge>}
                {farm.isHot       && <HotTag>🔥 Hot</HotTag>}
                {farm.depositFee > 0 && <Badge variant="warning">{farm.depositFee}% Fee</Badge>}
              </TagRow>
            </PairInfo>
          </TokenPair>

          {/* Earned */}
          <StatCol>
            <StatLabel>Earned</StatLabel>
            <StatValue style={{ color: farm.userEarned > 0 ? '#31D0AA' : undefined }}>
              {farm.userEarned.toFixed(4)}
            </StatValue>
            <StatSub>CAKE</StatSub>
          </StatCol>

          {/* APR */}
          <StatCol>
            <StatLabel>APR</StatLabel>
            <StatValue style={{ color: '#31D0AA' }}>{farm.apr.toFixed(2)}%</StatValue>
            <StatSub>APY {farm.apy.toFixed(2)}%</StatSub>
          </StatCol>

          {/* Liquidity */}
          <StatCol>
            <StatLabel>Liquidity</StatLabel>
            <StatValue>{formatNumber(farm.liquidity)}</StatValue>
          </StatCol>

          {/* Multiplier */}
          <MultiplierBadge>✦ {farm.multiplier}</MultiplierBadge>

          {/* Expand */}
          <ExpandBtn style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            ▼
          </ExpandBtn>
        </CardTop>

        {/* Expanded detail */}
        {expanded && (
          <Expanded>
            {/* CAKE earned */}
            <EarnedBox>
              <Text small color="textSubtle" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                🥞 CAKE Earned
              </Text>
              <EarnedAmount>{farm.userEarned.toFixed(6)}</EarnedAmount>
              <Text small color="textSubtle">${(farm.userEarned * farm.tokenPrice).toFixed(4)}</Text>
              <Button
                fullWidth
                scale="sm"
                style={{ marginTop: 12 }}
                disabled={farm.userEarned === 0 || loading}
                onClick={() => onHarvest(farm.pid)}
                isLoading={loading}
              >
                Harvest
              </Button>
            </EarnedBox>

            {/* LP staked */}
            <StakedBox>
              <Text small color="textSubtle" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {farm.lpSymbol} Staked
              </Text>
              <EarnedAmount>{farm.userStaked.toFixed(8)}</EarnedAmount>
              {isConnected ? (
                <StakeRow>
                  {farm.userStaked > 0 && (
                    <Button scale="sm" variant="tertiary" onClick={() => setShowStake(true)} style={{ flex: 1 }}>
                      −
                    </Button>
                  )}
                  <Button scale="sm" fullWidth={farm.userStaked === 0} onClick={() => setShowStake(true)} style={{ flex: 1 }}>
                    {farm.userStaked > 0 ? '+' : 'Stake LP'}
                  </Button>
                </StakeRow>
              ) : (
                <Button scale="sm" fullWidth style={{ marginTop: 12 }} onClick={connect}>
                  🔓 Connect Wallet
                </Button>
              )}
            </StakedBox>

            {/* Links + info */}
            <LinksBox>
              <Text small bold>Details</Text>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text small color="textSubtle">Total Staked</Text>
                  <Text small bold>{formatNumber(farm.totalStaked)}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text small color="textSubtle">Deposit Fee</Text>
                  <Text small bold>{farm.depositFee}%</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text small color="textSubtle">Earn</Text>
                  <Text small bold>CAKE</Text>
                </div>
              </div>
              <LinkBtn href={`https://bscscan.com/address/${farm.lpAddress}`} target="_blank" rel="noreferrer">
                🔍 View Contract ↗
              </LinkBtn>
              <LinkBtn href="/trade/liquidity" target="_blank" rel="noreferrer">
                💧 Get {farm.lpSymbol} ↗
              </LinkBtn>
            </LinksBox>
          </Expanded>
        )}
      </Card>

      {showStake && (
        <StakeModal
          farm={farm}
          onDismiss={() => setShowStake(false)}
          onStake={onStake}
          onUnstake={onUnstake}
          loading={loading}
        />
      )}
    </>
  );
};

export default FarmCard;
