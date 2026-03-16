import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button } from '../ui/Button';
import { Text } from '../ui/Typography';
import TokenLogo from '../ui/TokenLogo';
import { Badge, HotTag } from '../ui/Badge';
import PoolStakeModal from './PoolStakeModal';
import AprCalculatorModal from './AprCalculatorModal';
import { SyrupPool } from '../../hooks/usePools';
import { useWeb3 } from '../../context/Web3Context';
import Tooltip from '../ui/Tooltip';

const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:0.3}`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px;
  overflow: hidden;
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.10); transform: translateY(-2px); }
`;

const CardHeader = styled.div<{ isAuto?: boolean; isManual?: boolean }>`
  background: ${({ isAuto, isManual, theme }) =>
    isAuto   ? 'linear-gradient(139.73deg,#E5FDFF 0%,#F3EFFF 100%)' :
    isManual ? theme.colors.gradientCardHeader :
    theme.colors.gradientCardHeader};
  padding: 20px 20px 16px;
  position: relative;
`;

const TokenStack = styled.div`
  display: flex;
  align-items: flex-end;
  gap: -8px;
  margin-bottom: 12px;
  position: relative;
  width: 72px;
  height: 44px;
`;

const EarnLogo = styled.div`position: absolute; left: 0; bottom: 0; z-index: 2;`;
const StakeLogo= styled.div`position: absolute; right: 0; top: 0; z-index: 1; opacity: 0.85;`;

const PoolTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const PoolSubtitle = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSubtle};
`;

const TagRow = styled.div`
  display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px;
`;

const AutoBadge = styled.div`
  background: linear-gradient(139.73deg,#1FC7D4,#7645D9);
  color: white;
  padding: 3px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex; align-items: center; gap: 4px;
`;

const AutoDot = styled.span`
  width: 6px; height: 6px; border-radius: 50%;
  background: white;
  animation: ${pulse} 1.5s ease infinite;
`;

const CardBody = styled.div`padding: 16px 20px 20px;`;

const StatRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder + '60'};
  &:last-of-type { border-bottom: none; }
`;

const StatLabel = styled.div`font-size: 13px; color: ${({ theme }) => theme.colors.textSubtle}; display: flex; align-items: center; gap: 4px;`;
const StatValue = styled.div`font-size: 14px; font-weight: 700; color: ${({ theme }) => theme.colors.text};`;

const AprRow = styled.div`display: flex; align-items: center; gap: 6px;`;
const AprCalcBtn = styled.button`
  background: transparent; border: none; cursor: pointer;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 16px; padding: 0;
  &:hover { opacity: 0.7; }
`;

const EarnedSection = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 16px; padding: 14px; margin: 12px 0;
`;

const EarnedLabel = styled.div`font-size: 12px; color: ${({ theme }) => theme.colors.textSubtle}; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.06em;`;
const EarnedAmt   = styled.div`font-size: 22px; font-weight: 700; color: ${({ theme }) => theme.colors.text};`;
const EarnedUsd   = styled.div`font-size: 12px; color: ${({ theme }) => theme.colors.textSubtle};`;

const StakedSection = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 16px; padding: 14px; margin-bottom: 12px;
`;

const BtnRow = styled.div`display: flex; gap: 8px;`;

const ExpandSection = styled.div<{ open: boolean }>`
  max-height: ${({ open }) => open ? '400px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const ExpandInner = styled.div`
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
`;

const ExpandRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 4px 0;
`;

const LinkBtn = styled.a`
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: ${({ theme }) => theme.colors.primary};
  text-decoration: none; padding: 4px 0;
  &:hover { opacity: 0.7; text-decoration: none; }
`;

const ExpandToggle = styled.button`
  width: 100%; background: transparent; border: none; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px; color: ${({ theme }) => theme.colors.primary};
  font-size: 14px; font-weight: 600; font-family: 'Kanit', sans-serif;
  transition: opacity 0.15s;
  &:hover { opacity: 0.7; }
`;

const fmt = (n: number) => {
  if (n >= 1e9) return `$${(n/1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n/1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n/1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
};

interface Props {
  pool:       SyrupPool;
  expanded:   boolean;
  onExpand:   () => void;
  onStake:    (id: number, amount: number) => Promise<void>;
  onUnstake:  (id: number, amount: number) => Promise<void>;
  onHarvest:  (id: number) => Promise<void>;
  onCompound: (id: number) => Promise<void>;
  loading:    boolean;
}

const PoolCard: React.FC<Props> = ({
  pool, expanded, onExpand, onStake, onUnstake, onHarvest, onCompound, loading,
}) => {
  const { isConnected, connect } = useWeb3();
  const [showStake, setShowStake] = useState(false);
  const [showCalc,  setShowCalc]  = useState(false);

  const isAuto   = pool.poolType === 'auto';
  const isManual = pool.poolType === 'manual';

  const autoStaked = isAuto && pool.userShares > 0
    ? pool.userShares * pool.pricePerShare
    : pool.userStaked;

  return (
    <>
      <Card>
        <CardHeader isAuto={isAuto} isManual={isManual}>
          <TokenStack>
            <EarnLogo>
              <TokenLogo src={pool.earningToken.logoURI} symbol={pool.earningToken.symbol} size={40} />
            </EarnLogo>
            <StakeLogo>
              <TokenLogo src={pool.stakingToken.logoURI} symbol={pool.stakingToken.symbol} size={28} />
            </StakeLogo>
          </TokenStack>

          <PoolTitle>
            {isAuto ? 'Auto CAKE' : `Earn ${pool.earningToken.symbol}`}
          </PoolTitle>
          <PoolSubtitle>
            Stake {pool.stakingToken.symbol}
          </PoolSubtitle>

          <TagRow>
            {isAuto   && <AutoBadge><AutoDot />Auto</AutoBadge>}
            {isManual && <Badge variant="secondary">Manual</Badge>}
            {pool.isNew && <Badge variant="info">New</Badge>}
            {pool.isHot && <HotTag>🔥 Hot</HotTag>}
            {pool.stakingLimit > 0 && (
              <Tooltip content={`Max ${pool.stakingLimit.toLocaleString()} ${pool.stakingToken.symbol} per wallet`}>
                <Badge variant="warning">Limited</Badge>
              </Tooltip>
            )}
          </TagRow>
        </CardHeader>

        <CardBody>
          {/* APR/APY */}
          <StatRow>
            <StatLabel>
              {isAuto ? 'APY' : 'APR'}
              <Tooltip content={isAuto ? 'Automatically compounded, based on current APR' : 'Annual Percentage Rate based on current rates'}>
                <span style={{ cursor: 'help', fontSize: 13 }}>ⓘ</span>
              </Tooltip>
            </StatLabel>
            <AprRow>
              <StatValue style={{ color: '#31D0AA' }}>
                {isAuto ? pool.apy.toFixed(2) : pool.apr.toFixed(2)}%
              </StatValue>
              <AprCalcBtn onClick={() => setShowCalc(true)} title="ROI Calculator">🧮</AprCalcBtn>
            </AprRow>
          </StatRow>

          {/* Total staked */}
          <StatRow>
            <StatLabel>Total staked</StatLabel>
            <StatValue>{fmt(pool.liquidity)}</StatValue>
          </StatRow>

          {/* Ends */}
          {!pool.isFinished && (
            <StatRow>
              <StatLabel>Ends in</StatLabel>
              <StatValue style={{ color: '#7645D9' }}>
                {(pool.blocksRemaining / 28800).toFixed(0)} days
              </StatValue>
            </StatRow>
          )}

          {/* Earned section */}
          {isAuto ? (
            <EarnedSection>
              <EarnedLabel>🥞 Recent CAKE profit</EarnedLabel>
              <EarnedAmt>{pool.userEarned.toFixed(6)}</EarnedAmt>
              <EarnedUsd>≈ ${(pool.userEarned * pool.tokenPrice).toFixed(4)}</EarnedUsd>
            </EarnedSection>
          ) : (
            <EarnedSection>
              <EarnedLabel>{pool.earningToken.symbol} Earned</EarnedLabel>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <EarnedAmt>{pool.userEarned.toFixed(6)}</EarnedAmt>
                  <EarnedUsd>≈ ${(pool.userEarned * pool.tokenPrice).toFixed(4)}</EarnedUsd>
                </div>
                <Button
                  scale="sm" variant="secondary"
                  disabled={pool.userEarned === 0 || loading}
                  onClick={() => onHarvest(pool.sousId)}
                  isLoading={loading}
                >
                  Harvest
                </Button>
              </div>
            </EarnedSection>
          )}

          {/* Staked section */}
          <StakedSection>
            <EarnedLabel>
              {isAuto ? '🥞 CAKE staked (est.)' : `${pool.stakingToken.symbol} staked`}
            </EarnedLabel>
            {isConnected ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
                  <div>
                    <EarnedAmt>{autoStaked.toFixed(4)}</EarnedAmt>
                    <EarnedUsd>≈ ${(autoStaked * pool.tokenPrice).toFixed(4)}</EarnedUsd>
                  </div>
                  {isAuto && pool.userEarned > 0 && (
                    <Button scale="sm" variant="tertiary" onClick={() => onCompound(pool.sousId)} isLoading={loading}>
                      Compound
                    </Button>
                  )}
                </div>
                <BtnRow>
                  {pool.userStaked > 0 && (
                    <Button scale="sm" variant="tertiary" onClick={() => setShowStake(true)} style={{ flex: 1 }}>−</Button>
                  )}
                  <Button scale="sm" fullWidth={pool.userStaked === 0} onClick={() => setShowStake(true)} style={{ flex: 1 }}>
                    {pool.userStaked > 0 ? '+' : 'Stake'}
                  </Button>
                </BtnRow>
              </>
            ) : (
              <Button scale="sm" fullWidth style={{ marginTop: 8 }} onClick={connect}>
                🔓 Connect Wallet
              </Button>
            )}
          </StakedSection>

          {/* Expand toggle */}
          <ExpandToggle onClick={onExpand}>
            {expanded ? '▲ Hide' : '▼ Details'}
          </ExpandToggle>

          <ExpandSection open={expanded}>
            <ExpandInner>
              {isAuto && (
                <>
                  <ExpandRow>
                    <Text small color="textSubtle">Performance Fee</Text>
                    <Text small bold>{pool.performanceFee}%</Text>
                  </ExpandRow>
                  <ExpandRow>
                    <Text small color="textSubtle">Price per Share</Text>
                    <Text small bold>{pool.pricePerShare.toFixed(8)} CAKE</Text>
                  </ExpandRow>
                </>
              )}
              <ExpandRow>
                <Text small color="textSubtle">Total Staked</Text>
                <Text small bold>{pool.totalStaked.toLocaleString()} {pool.stakingToken.symbol}</Text>
              </ExpandRow>
              {pool.stakingLimit > 0 && (
                <ExpandRow>
                  <Text small color="textSubtle">Max per wallet</Text>
                  <Text small bold>{pool.stakingLimit.toLocaleString()} {pool.stakingToken.symbol}</Text>
                </ExpandRow>
              )}
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <LinkBtn href={`https://bscscan.com/address/${pool.contractAddress}`} target="_blank" rel="noreferrer">
                  🔍 View Contract ↗
                </LinkBtn>
                <LinkBtn href="https://pancakeswap.finance" target="_blank" rel="noreferrer">
                  📖 See Token Info ↗
                </LinkBtn>
                {pool.poolType !== 'auto' && (
                  <LinkBtn href="https://docs.pancakeswap.finance" target="_blank" rel="noreferrer">
                    📚 View Project Site ↗
                  </LinkBtn>
                )}
              </div>
            </ExpandInner>
          </ExpandSection>
        </CardBody>
      </Card>

      {showStake && (
        <PoolStakeModal
          pool={pool}
          onDismiss={() => setShowStake(false)}
          onStake={onStake}
          onUnstake={onUnstake}
          loading={loading}
        />
      )}
      {showCalc && (
        <AprCalculatorModal
          onDismiss={() => setShowCalc(false)}
          apr={pool.apr}
          apy={pool.apy}
          tokenSymbol={pool.earningToken.symbol}
          tokenPrice={pool.tokenPrice}
        />
      )}
    </>
  );
};

export default PoolCard;
