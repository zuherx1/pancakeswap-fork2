import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Text, Heading } from '../ui/Typography';
import { Badge } from '../ui/Badge';
import { ILOProject } from '../../hooks/useSpringboard';
import { useWeb3 } from '../../context/Web3Context';

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const Tabs = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.input};
  border-radius: 12px; padding: 4px; gap: 4px; margin-bottom: 20px;
`;

const Tab = styled.button<{ active?: boolean }>`
  flex: 1; padding: 8px; border-radius: 10px; border: none; cursor: pointer;
  font-size: 14px; font-weight: 600; font-family: 'Kanit', sans-serif;
  background: ${({ active, theme }) => active ? theme.colors.backgroundAlt : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.text : theme.colors.textSubtle};
  transition: all 0.15s;
`;

const ProgressTrack = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 8px; height: 12px; overflow: hidden; margin: 8px 0;
`;

const ProgressFill = styled.div<{ pct: number; status: string }>`
  height: 100%; border-radius: 8px;
  width: ${({ pct }) => Math.min(pct, 100)}%;
  background: ${({ status }) =>
    status === 'ended'  ? '#31D0AA' :
    status === 'live'   ? 'linear-gradient(90deg,#1FC7D4,#7645D9)' :
    '#BDC2C4'};
  transition: width 0.6s ease;
`;

const InfoGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;
`;

const InfoBox = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 14px; padding: 12px 14px;
`;

const InfoLabel = styled.div`font-size: 11px; color: ${({ theme }) => theme.colors.textSubtle}; margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.06em;`;
const InfoValue = styled.div`font-size: 14px; font-weight: 700; color: ${({ theme }) => theme.colors.text};`;

const VestingRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 0; border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder + '60'};
  &:last-child { border-bottom: none; }
`;

const CommitBox = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px; padding: 14px 16px; margin: 12px 0;
  &:focus-within { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const AmtInput = styled.input`
  width: 100%; background: transparent; border: none; outline: none;
  font-size: 24px; font-weight: 700; color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif;
  &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
`;

const AllocationBar = styled.div`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 14px; padding: 14px 16px; margin: 12px 0;
`;

const TagRow = styled.div`display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px;`;

interface Props {
  project:    ILOProject;
  onDismiss:  () => void;
  onCommit:   (id: string, amount: number) => Promise<void>;
  onClaim:    (id: string) => Promise<void>;
  committing: boolean;
  claiming:   boolean;
}

const ProjectDetailModal: React.FC<Props> = ({
  project, onDismiss, onCommit, onClaim, committing, claiming,
}) => {
  const { isConnected, connect } = useWeb3();
  const [tab, setTab] = useState<'sale'|'info'|'vesting'>('sale');
  const [amount, setAmount] = useState('');

  const pct       = (project.currentRaise / project.totalRaise) * 100;
  const isSoldOut = project.currentRaise >= project.totalRaise;
  const tokens    = amount ? (Number(amount) / project.tokenPrice).toFixed(2) : '0';
  const canCommit = project.saleStatus === 'live' && !isSoldOut && Number(amount) >= project.minPerUser && Number(amount) <= project.maxPerUser;

  const statusColor = {
    live: '#31D0AA', upcoming: '#FFB237', ended: '#7A6EAA', claimed: '#1FC7D4',
  }[project.saleStatus];

  return (
    <Modal title={`${project.logoURI} ${project.name} (${project.symbol})`} onDismiss={onDismiss}>
      {/* Tags */}
      <TagRow>
        {project.tags.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
        <Badge variant={project.saleStatus === 'live' ? 'success' : project.saleStatus === 'upcoming' ? 'warning' : 'default'}>
          {project.saleStatus.toUpperCase()}
        </Badge>
      </TagRow>

      {/* Tabs */}
      <Tabs>
        <Tab active={tab === 'sale'}    onClick={() => setTab('sale')}>Sale</Tab>
        <Tab active={tab === 'info'}    onClick={() => setTab('info')}>Info</Tab>
        <Tab active={tab === 'vesting'} onClick={() => setTab('vesting')}>Vesting</Tab>
      </Tabs>

      {/* ── Sale tab ── */}
      {tab === 'sale' && (
        <>
          {/* Progress */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text small color="textSubtle">Total raised</Text>
              <Text small bold>{pct.toFixed(1)}% {isSoldOut && '🎉 Sold Out!'}</Text>
            </div>
            <ProgressTrack>
              <ProgressFill pct={pct} status={project.saleStatus} />
            </ProgressTrack>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text small bold>{project.currentRaise.toLocaleString()} {project.raiseToken}</Text>
              <Text small color="textSubtle">/ {project.totalRaise.toLocaleString()} {project.raiseToken}</Text>
            </div>
          </div>

          {/* Stats grid */}
          <InfoGrid>
            <InfoBox>
              <InfoLabel>Token Price</InfoLabel>
              <InfoValue>{project.tokenPrice} {project.raiseToken}</InfoValue>
            </InfoBox>
            <InfoBox>
              <InfoLabel>Tokens for Sale</InfoLabel>
              <InfoValue>{(project.tokensForSale / 1e6).toFixed(1)}M {project.symbol}</InfoValue>
            </InfoBox>
            <InfoBox>
              <InfoLabel>Min Commit</InfoLabel>
              <InfoValue>{project.minPerUser} {project.raiseToken}</InfoValue>
            </InfoBox>
            <InfoBox>
              <InfoLabel>Max Commit</InfoLabel>
              <InfoValue>{project.maxPerUser.toLocaleString()} {project.raiseToken}</InfoValue>
            </InfoBox>
            <InfoBox>
              <InfoLabel>Participants</InfoLabel>
              <InfoValue>{project.participants.toLocaleString()}</InfoValue>
            </InfoBox>
            <InfoBox>
              <InfoLabel>Sale Type</InfoLabel>
              <InfoValue style={{ textTransform: 'capitalize' }}>{project.saleType}</InfoValue>
            </InfoBox>
          </InfoGrid>

          {/* User allocation */}
          {project.userCommitted > 0 && (
            <AllocationBar>
              <Text small bold style={{ marginBottom: 8 }}>Your Commitment</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Text small color="textSubtle">Committed</Text>
                  <Text bold>{project.userCommitted} {project.raiseToken}</Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text small color="textSubtle">Est. allocation</Text>
                  <Text bold>{(project.userCommitted / project.tokenPrice).toFixed(2)} {project.symbol}</Text>
                </div>
              </div>
            </AllocationBar>
          )}

          {/* Commit section */}
          {project.saleStatus === 'live' && !isSoldOut && (
            <>
              <CommitBox>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text small color="textSubtle">Amount ({project.raiseToken})</Text>
                  <Text small color="textSubtle">≈ {tokens} {project.symbol}</Text>
                </div>
                <AmtInput
                  placeholder={`${project.minPerUser} – ${project.maxPerUser}`}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  type="number"
                  min={project.minPerUser}
                  max={project.maxPerUser}
                />
              </CommitBox>
              {!isConnected ? (
                <Button fullWidth scale="lg" onClick={connect}>🔓 Connect Wallet</Button>
              ) : (
                <Button
                  fullWidth scale="lg"
                  onClick={() => onCommit(project.id, Number(amount))}
                  isLoading={committing}
                  disabled={!canCommit || committing}
                >
                  {committing ? 'Committing…' : 'Commit'}
                </Button>
              )}
              {amount && Number(amount) < project.minPerUser && (
                <Text small color="failure" textAlign="center" style={{ marginTop: 8 }}>
                  Minimum is {project.minPerUser} {project.raiseToken}
                </Text>
              )}
            </>
          )}

          {/* Claim section */}
          {project.saleStatus === 'ended' && project.userCommitted > 0 && (
            <Button fullWidth scale="lg" variant="secondary" onClick={() => onClaim(project.id)} isLoading={claiming}>
              {claiming ? 'Claiming…' : `🎁 Claim ${(project.userCommitted / project.tokenPrice).toFixed(2)} ${project.symbol}`}
            </Button>
          )}

          {project.saleStatus === 'claimed' && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <Text style={{ fontSize: 32 }}>🎉</Text>
              <Text bold style={{ color: '#31D0AA' }}>Tokens claimed successfully!</Text>
            </div>
          )}

          {project.saleStatus === 'upcoming' && (
            <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(255,178,55,0.1)', borderRadius: 14 }}>
              <Text bold color="warning">⏳ Sale starts in {Math.ceil((project.startTime - Date.now()) / 86400000)} days</Text>
            </div>
          )}
        </>
      )}

      {/* ── Info tab ── */}
      {tab === 'info' && (
        <>
          <Text style={{ lineHeight: 1.7, marginBottom: 16 }}>{project.description}</Text>
          <InfoGrid>
            <InfoBox>
              <InfoLabel>Chain</InfoLabel>
              <InfoValue>🟡 BNB Chain</InfoValue>
            </InfoBox>
            <InfoBox>
              <InfoLabel>Total Supply</InfoLabel>
              <InfoValue>{(project.tokensForSale * 5 / 1e6).toFixed(0)}M</InfoValue>
            </InfoBox>
          </InfoGrid>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Button scale="sm" variant="subtle" onClick={() => window.open(project.website, '_blank')}>🌐 Website</Button>
            <Button scale="sm" variant="subtle" onClick={() => window.open(project.twitter, '_blank')}>🐦 Twitter</Button>
            <Button scale="sm" variant="subtle" onClick={() => window.open(project.telegram, '_blank')}>✈️ Telegram</Button>
          </div>
        </>
      )}

      {/* ── Vesting tab ── */}
      {tab === 'vesting' && (
        <>
          <AllocationBar style={{ marginBottom: 16 }}>
            <Text small bold style={{ marginBottom: 8 }}>Token Release Schedule</Text>
            <VestingRow>
              <Text small color="textSubtle">TGE Release</Text>
              <Text small bold style={{ color: '#1FC7D4' }}>{project.tgePercent}%</Text>
            </VestingRow>
            <VestingRow>
              <Text small color="textSubtle">Cliff Period</Text>
              <Text small bold>{project.cliffDuration} days</Text>
            </VestingRow>
            <VestingRow>
              <Text small color="textSubtle">Vesting Duration</Text>
              <Text small bold>{project.vestingDuration} days</Text>
            </VestingRow>
            <VestingRow>
              <Text small color="textSubtle">Linear Release</Text>
              <Text small bold>{(100 - project.tgePercent).toFixed(0)}% over {project.vestingDuration} days</Text>
            </VestingRow>
          </AllocationBar>
          <Text small color="textSubtle" style={{ lineHeight: 1.6 }}>
            {project.tgePercent}% of tokens will be released immediately at Token Generation Event (TGE).
            The remaining {100 - project.tgePercent}% will vest linearly over {project.vestingDuration} days,
            after a {project.cliffDuration}-day cliff period.
          </Text>
        </>
      )}
    </Modal>
  );
};

export default ProjectDetailModal;
