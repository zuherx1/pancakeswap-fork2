import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Text, Heading } from '../ui/Typography';
import { Badge } from '../ui/Badge';
import { IDOProject, TIERS, TierName } from '../../hooks/useCakePad';
import { useWeb3 } from '../../context/Web3Context';

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const Tabs = styled.div`
  display: flex; background: ${({ theme }) => theme.colors.input};
  border-radius: 12px; padding: 4px; gap: 4px; margin-bottom: 20px;
`;
const Tab = styled.button<{ active?: boolean }>`
  flex: 1; padding: 7px; border-radius: 10px; border: none; cursor: pointer;
  font-size: 13px; font-weight: 600; font-family: 'Kanit', sans-serif;
  background: ${({ active, theme }) => active ? theme.colors.backgroundAlt : 'transparent'};
  color: ${({ active, theme }) => active ? theme.colors.text : theme.colors.textSubtle};
  transition: all 0.15s;
`;

const ProgressTrack = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 8px; height: 10px; overflow: hidden; margin: 6px 0 4px;
`;
const ProgressFill = styled.div<{ pct: number; status: string }>`
  height: 100%; border-radius: 8px;
  width: ${({ pct }) => Math.min(pct, 100)}%;
  background: ${({ status }) =>
    status === 'live'     ? 'linear-gradient(90deg,#1FC7D4,#7645D9)' :
    status === 'ended' || status === 'claimable' ? '#31D0AA' : '#BDC2C4'};
  transition: width 0.6s ease;
`;

const InfoGrid = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;`;
const InfoBox  = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 12px; padding: 10px 12px;
`;
const InfoLabel = styled.div`font-size: 11px; color: ${({ theme }) => theme.colors.textSubtle}; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;`;
const InfoValue = styled.div`font-size: 14px; font-weight: 700; color: ${({ theme }) => theme.colors.text};`;

const TierGrid = styled.div`display: flex; flex-direction: column; gap: 8px;`;
const TierRow = styled.div<{ $color: string; isUser?: boolean }>`
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; border-radius: 14px;
  background: ${({ isUser, $color }) => isUser ? $color + '15' : 'transparent'};
  border: 1px solid ${({ isUser, $color, theme }) => isUser ? $color : theme.colors.cardBorder};
  transition: background 0.15s;
`;
const TierIcon = styled.div<{ $color: string }>`
  width: 36px; height: 36px; border-radius: 50%;
  background: ${({ $color }) => $color + '20'};
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
`;

const VestingTrack = styled.div`
  position: relative; height: 8px;
  background: ${({ theme }) => theme.colors.input};
  border-radius: 4px; margin: 16px 0 8px; overflow: visible;
`;
const VestingTGE = styled.div<{ pct: number }>`
  position: absolute; left: 0; top: 0; height: 100%;
  width: ${({ pct }) => pct}%;
  background: #1FC7D4; border-radius: 4px 0 0 4px;
`;
const VestingLinear = styled.div<{ start: number; end: number }>`
  position: absolute; top: 0; height: 100%;
  left: ${({ start }) => start}%;
  width: ${({ start, end }) => end - start}%;
  background: linear-gradient(90deg, #7645D9, #ED4B9E);
  border-radius: 0 4px 4px 0;
`;

const CommitBox = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px; padding: 12px 16px; margin: 10px 0;
  &:focus-within { border-color: ${({ theme }) => theme.colors.primary}; }
`;
const AmtInput = styled.input`
  width: 100%; background: transparent; border: none; outline: none;
  font-size: 22px; font-weight: 700; color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif;
  &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
`;

const ROIBadge = styled.div<{ positive?: boolean }>`
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 8px;
  background: ${({ positive, theme }) => positive ? theme.colors.success + '20' : theme.colors.danger + '20'};
  color: ${({ positive, theme }) => positive ? theme.colors.success : theme.colors.danger};
  font-size: 13px; font-weight: 700;
`;

interface Props {
  project:        IDOProject;
  onDismiss:      () => void;
  onCommit:       (id: string, amt: number) => Promise<void>;
  onClaim:        (id: string) => Promise<void>;
  onApply:        (id: string) => Promise<void>;
  commitAmt:      string;
  setCommitAmt:   (v: string) => void;
  committing:     boolean;
  claiming:       boolean;
}

const IDODetailModal: React.FC<Props> = ({
  project, onDismiss, onCommit, onClaim, onApply,
  commitAmt, setCommitAmt, committing, claiming,
}) => {
  const { isConnected, connect } = useWeb3();
  const [tab, setTab] = useState<'sale'|'info'|'vesting'|'tiers'>('sale');

  const pct     = (project.raised / project.hardCap) * 100;
  const roi     = project.listingPrice > 0 ? ((project.listingPrice / project.tokenPrice - 1) * 100) : 0;
  const athRoi  = project.ath > 0 ? ((project.ath / project.tokenPrice - 1) * 100) : 0;
  const tokens  = commitAmt ? (Number(commitAmt) / project.tokenPrice).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '0';

  const statusColor: Record<string, string> = {
    live:      '#31D0AA', upcoming: '#FFB237', whitelist: '#1FC7D4',
    ended:     '#7A6EAA', claimable: '#7645D9',
  };

  const cliffPct    = project.cliff > 0 ? (project.cliff / (project.cliff + project.vesting)) * 80 + 10 : 10;
  const vestEndPct  = 90;

  return (
    <Modal title={`${project.logo} ${project.name} (${project.symbol})`} onDismiss={onDismiss}>
      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {project.category.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
        <Badge variant={project.status === 'live' ? 'success' : project.status === 'upcoming' ? 'warning' : 'default'}
          style={{ background: statusColor[project.status] + '20', color: statusColor[project.status] }}>
          {project.status.toUpperCase()}
        </Badge>
        {roi > 0 && <ROIBadge positive>{roi.toFixed(0)}% listing ROI</ROIBadge>}
        {athRoi > 0 && <ROIBadge positive>🚀 {athRoi.toFixed(0)}% ATH ROI</ROIBadge>}
      </div>

      <Tabs>
        <Tab active={tab === 'sale'}    onClick={() => setTab('sale')}>Sale</Tab>
        <Tab active={tab === 'info'}    onClick={() => setTab('info')}>Info</Tab>
        <Tab active={tab === 'vesting'} onClick={() => setTab('vesting')}>Vesting</Tab>
        <Tab active={tab === 'tiers'}   onClick={() => setTab('tiers')}>Tiers</Tab>
      </Tabs>

      {/* ── Sale tab ── */}
      {tab === 'sale' && (
        <>
          {/* Progress */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text small color="textSubtle">Raised</Text>
              <Text small bold>{pct.toFixed(1)}% {pct >= 100 && '🎉 Filled!'}</Text>
            </div>
            <ProgressTrack><ProgressFill pct={pct} status={project.status} /></ProgressTrack>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text small bold>${project.raised.toLocaleString('en-US', { maximumFractionDigits: 0 })}</Text>
              <Text small color="textSubtle">/ ${project.hardCap.toLocaleString('en-US', { maximumFractionDigits: 0 })}</Text>
            </div>
          </div>

          <InfoGrid>
            <InfoBox>
              <InfoLabel>Token Price</InfoLabel>
              <InfoValue>${project.tokenPrice}</InfoValue>
            </InfoBox>
            <InfoBox>
              <InfoLabel>Listing Price</InfoLabel>
              <InfoValue style={{ color: '#31D0AA' }}>${project.listingPrice}</InfoValue>
            </InfoBox>
            <InfoBox>
              <InfoLabel>Hard Cap</InfoLabel>
              <InfoValue>${(project.hardCap / 1000).toFixed(0)}K</InfoValue>
            </InfoBox>
            <InfoBox>
              <InfoLabel>Soft Cap</InfoLabel>
              <InfoValue>${(project.softCap / 1000).toFixed(0)}K</InfoValue>
            </InfoBox>
            <InfoBox>
              <InfoLabel>For Sale</InfoLabel>
              <InfoValue>{(project.tokensForSale / 1e6).toFixed(1)}M {project.symbol}</InfoValue>
            </InfoBox>
            <InfoBox>
              <InfoLabel>Participants</InfoLabel>
              <InfoValue>{project.participants.toLocaleString()}</InfoValue>
            </InfoBox>
          </InfoGrid>

          {/* User commitment */}
          {project.userCommitted > 0 && (
            <div style={{ background: 'rgba(31,199,212,0.08)', borderRadius: 14, padding: '12px 16px', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Text small color="textSubtle">Committed</Text>
                  <Text bold>${project.userCommitted.toLocaleString()}</Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text small color="textSubtle">Est. Tokens</Text>
                  <Text bold>{(project.userCommitted / project.tokenPrice).toLocaleString()} {project.symbol}</Text>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {project.status === 'live' && pct < 100 && (
            <>
              <CommitBox>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text small color="textSubtle">Amount ({project.raiseToken})</Text>
                  <Text small color="textSubtle">≈ {tokens} {project.symbol}</Text>
                </div>
                <AmtInput
                  placeholder="Enter amount"
                  value={commitAmt}
                  onChange={e => setCommitAmt(e.target.value)}
                  type="number" min="0"
                />
              </CommitBox>
              {!isConnected
                ? <Button fullWidth scale="lg" onClick={connect}>🔓 Connect Wallet</Button>
                : <Button fullWidth scale="lg" onClick={() => onCommit(project.id, Number(commitAmt))} isLoading={committing} disabled={!commitAmt || Number(commitAmt) <= 0 || committing}>
                    {committing ? 'Committing…' : 'Commit'}
                  </Button>
              }
            </>
          )}

          {project.status === 'whitelist' && !project.isWhitelisted && (
            <Button fullWidth scale="lg" variant="secondary" onClick={() => onApply(project.id)}>
              📋 Apply for Whitelist
            </Button>
          )}
          {project.status === 'whitelist' && project.isWhitelisted && (
            <div style={{ background: 'rgba(49,208,170,0.1)', borderRadius: 14, padding: 14, textAlign: 'center' }}>
              <Text bold color="success">✅ You are whitelisted!</Text>
              <Text small color="textSubtle">Sale starts on {new Date(project.saleStart).toLocaleDateString()}</Text>
            </div>
          )}
          {project.status === 'upcoming' && (
            <div style={{ background: 'rgba(255,178,55,0.1)', borderRadius: 14, padding: 14, textAlign: 'center' }}>
              <Text bold color="warning">⏳ Whitelist opens {new Date(project.whitelistStart).toLocaleDateString()}</Text>
            </div>
          )}
          {project.status === 'claimable' && project.userCommitted > 0 && !project.hasClaimed && (
            <Button fullWidth scale="lg" variant="secondary" onClick={() => onClaim(project.id)} isLoading={claiming}>
              🎁 Claim {(project.userCommitted / project.tokenPrice).toFixed(0)} {project.symbol}
            </Button>
          )}
          {project.hasClaimed && (
            <div style={{ textAlign: 'center', padding: 14 }}>
              <Text style={{ fontSize: 28 }}>🎉</Text>
              <Text bold color="success">Tokens claimed successfully!</Text>
            </div>
          )}
          {(project.status === 'ended' || project.status === 'claimable') && project.ath > 0 && (
            <div style={{ background: 'rgba(255,215,0,0.08)', borderRadius: 14, padding: '12px 16px', marginTop: 12, textAlign: 'center' }}>
              <Text small color="textSubtle">All-Time High</Text>
              <Text bold style={{ fontSize: 20, color: '#FFD700' }}>${project.ath} ({athRoi.toFixed(0)}% ROI)</Text>
              <Text small color="textSubtle">{project.athDate}</Text>
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
              <InfoLabel>Total Supply</InfoLabel>
              <InfoValue>{(project.totalSupply / 1e6).toFixed(0)}M</InfoValue>
            </InfoBox>
            <InfoBox>
              <InfoLabel>Initial MCap</InfoLabel>
              <InfoValue>${(project.initialMcap / 1e6).toFixed(2)}M</InfoValue>
            </InfoBox>
            <InfoBox>
              <InfoLabel>FDV</InfoLabel>
              <InfoValue>${(project.fdv / 1e6).toFixed(1)}M</InfoValue>
            </InfoBox>
            <InfoBox>
              <InfoLabel>Raise Token</InfoLabel>
              <InfoValue>{project.raiseToken}</InfoValue>
            </InfoBox>
          </InfoGrid>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button scale="sm" variant="subtle">🌐 Website</Button>
            <Button scale="sm" variant="subtle">🐦 Twitter</Button>
            <Button scale="sm" variant="subtle">📄 Whitepaper</Button>
            <Button scale="sm" variant="subtle">🔒 Audit</Button>
          </div>
        </>
      )}

      {/* ── Vesting tab ── */}
      {tab === 'vesting' && (
        <>
          <div style={{ background: 'rgba(31,199,212,0.08)', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <Text small bold style={{ marginBottom: 12 }}>Token Release Schedule</Text>
            <VestingTrack>
              <VestingTGE pct={project.tge} />
              {project.cliff === 0 && <VestingLinear start={project.tge} end={90} />}
              {project.cliff > 0  && <VestingLinear start={cliffPct} end={vestEndPct} />}
            </VestingTrack>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7A6EAA' }}>
              <span>TGE</span>
              {project.cliff > 0 && <span>Cliff End</span>}
              <span>Full Unlock</span>
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: '#1FC7D4' }} />
                <Text small>TGE {project.tge}%</Text>
              </div>
              {project.cliff > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, background: '#383241' }} />
                  <Text small>Cliff {project.cliff}mo</Text>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: '#7645D9' }} />
                <Text small>Linear {project.vesting}mo</Text>
              </div>
            </div>
          </div>
          {[
            ['TGE Release',     `${project.tge}% unlocked at launch`],
            ['Cliff Period',    project.cliff > 0 ? `${project.cliff} month${project.cliff > 1 ? 's' : ''} lock-up` : 'No cliff'],
            ['Vesting Duration',`${project.vesting} months linear vesting`],
            ['Monthly Unlock',  `${((100 - project.tge) / project.vesting).toFixed(2)}% per month after cliff`],
          ].map(([label, value]) => (
            <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <Text small color="textSubtle">{label}</Text>
              <Text small bold>{value}</Text>
            </div>
          ))}
        </>
      )}

      {/* ── Tiers tab ── */}
      {tab === 'tiers' && (
        <TierGrid>
          {TIERS.slice().reverse().map(tier => (
            <TierRow key={tier.name} $color={tier.color}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <TierIcon $color={tier.color}>{tier.icon}</TierIcon>
                <div>
                  <Text bold>{tier.name}</Text>
                  <Text small color="textSubtle">{tier.minCAKE > 0 ? `${tier.minCAKE.toLocaleString()}+ CAKE` : 'No CAKE required'}</Text>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Text bold style={{ color: tier.color }}>${project.tierAllocations[tier.name]}</Text>
                <Text small color="textSubtle">max allocation</Text>
                <Text small color="textSubtle">{tier.whitelistSpots > 0 ? `${tier.whitelistSpots.toLocaleString()} spots` : 'Public'}</Text>
              </div>
            </TierRow>
          ))}
          <div style={{ background: 'rgba(118,69,217,0.07)', borderRadius: 14, padding: '12px 16px', marginTop: 4 }}>
            <Text small color="textSubtle" style={{ lineHeight: 1.6 }}>
              🔒 Tier is determined by your CAKE holdings at snapshot time. Higher tiers guarantee larger allocations and whitelist priority.
            </Text>
          </div>
        </TierGrid>
      )}
    </Modal>
  );
};

export default IDODetailModal;
