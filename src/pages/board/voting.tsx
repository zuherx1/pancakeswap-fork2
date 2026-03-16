import React from 'react';
import styled from 'styled-components';
import { useVoting, Proposal } from '../../hooks/useVoting';
import { useWeb3 } from '../../context/Web3Context';
import ProposalDetailModal from '../../components/board/ProposalDetailModal';
import { Text, Heading } from '../../components/ui/Typography';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import PageHeader from '../../components/layout/PageHeader';

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const Page    = styled.div`min-height:calc(100vh - 56px); background:${({ theme }) => theme.colors.background};`;
const Content = styled.div`max-width:1100px; margin:0 auto; padding:24px 24px 60px;`;

const StatRow = styled.div`
  display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px;
  @media(max-width:768px){grid-template-columns:1fr 1fr;}
`;
const StatBox = styled.div`
  background:${({ theme }) => theme.colors.backgroundAlt};
  border:1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius:18px; padding:18px 20px;
`;
const SLabel = styled.div`font-size:12px; color:${({ theme }) => theme.colors.textSubtle}; text-transform:uppercase; letter-spacing:0.06em; margin-bottom:5px;`;
const SValue = styled.div`font-size:22px; font-weight:700; color:${({ theme }) => theme.colors.text};`;

const Controls = styled.div`
  display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:18px;
`;
const TabGroup = styled.div`
  display:flex; background:${({ theme }) => theme.colors.input};
  border-radius:12px; padding:3px; gap:3px;
`;
const TabBtn = styled.button<{active?:boolean}>`
  padding:7px 16px; border-radius:9px;
  font-size:13px; font-weight:600; font-family:'Kanit',sans-serif;
  border:none; cursor:pointer;
  background:${({ active,theme }) => active ? theme.colors.backgroundAlt : 'transparent'};
  color:${({ active,theme }) => active ? theme.colors.text : theme.colors.textSubtle};
  transition:all 0.15s; white-space:nowrap;
`;

const ProposalList = styled.div`display:flex; flex-direction:column; gap:12px;`;

const ProposalCard = styled.div`
  background:${({ theme }) => theme.colors.backgroundAlt};
  border:1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius:20px; padding:20px 24px;
  cursor:pointer; transition:all 0.2s;
  &:hover {
    border-color:${({ theme }) => theme.colors.primary};
    box-shadow:0 4px 20px rgba(0,0,0,0.08);
    transform:translateY(-1px);
  }
`;
const PTitle = styled.div`
  font-size:17px; font-weight:700; color:${({ theme }) => theme.colors.text};
  margin:10px 0 8px; line-height:1.3;
`;
const PMeta = styled.div`
  display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:14px;
`;
const PAuthor = styled.span`
  font-size:12px; color:${({ theme }) => theme.colors.textSubtle};
  font-family:'Roboto Mono',monospace;
`;

const VoteBarMini = styled.div`
  height:6px; border-radius:3px; overflow:hidden;
  background:${({ theme }) => theme.colors.input};
  display:flex; margin-bottom:6px;
`;
const ForFill  = styled.div<{pct:number}>`height:100%; width:${({pct})=>pct}%; background:#31D0AA; transition:width 0.6s;`;
const AgFill   = styled.div<{pct:number}>`height:100%; width:${({pct})=>pct}%; background:#ED4B9E; transition:width 0.6s;`;
const AbFill   = styled.div<{pct:number}>`height:100%; flex:1; background:#7A6EAA40;`;

const PFooter = styled.div`
  display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;
`;

const ResultChip = styled.div<{passed:boolean}>`
  display:inline-flex; align-items:center; gap:5px;
  padding:3px 10px; border-radius:8px; font-size:12px; font-weight:700;
  background:${({ passed,theme }) => passed ? theme.colors.success+'20' : theme.colors.danger+'20'};
  color:${({ passed,theme }) => passed ? theme.colors.success : theme.colors.danger};
`;

const EmptyState = styled.div`
  text-align:center; padding:60px 0;
  color:${({ theme }) => theme.colors.textSubtle};
`;

const GovBanner = styled.div`
  background:${({ theme }) => theme.colors.gradientBubblegum};
  border:1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius:20px; padding:20px 24px;
  display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;
  margin-bottom:24px;
`;

const fmt = (n:number) => n>=1e6 ? `${(n/1e6).toFixed(2)}M` : n>=1e3 ? `${(n/1e3).toFixed(1)}K` : n.toFixed(0);

export default function VotingPage() {
  const { isConnected, connect } = useWeb3();
  const {
    proposals, selected, setSelected,
    activeTab, setActiveTab, search, setSearch,
    voting, activeVote, setActiveVote,
    castVote, timeLeft,
  } = useVoting();

  const allProposals  = [
    { id:'pcs-0421', status:'active'  },
    { id:'pcs-0420', status:'active'  },
    { id:'pcs-0419', status:'active'  },
    { id:'pcs-0422', status:'pending' },
    { id:'pcs-0418', status:'closed'  },
    { id:'pcs-0417', status:'closed'  },
  ];
  const activeCnt   = allProposals.filter(p => p.status==='active').length;
  const totalVoters = 48210;
  const totalVotes  = 284;
  const totalCAKE   = '128.4M';

  return (
    <Page>
      <PageHeader
        title="🗳️ Voting"
        subtitle="Shape the future of PancakeSwap through community governance"
        background="linear-gradient(139.73deg,#F3EFFF 0%,#E5FDFF 100%)"
      />
      <Content>

        {/* Stats */}
        <StatRow>
          <StatBox>
            <SLabel>Active Proposals</SLabel>
            <SValue style={{ color:'#31D0AA' }}>{activeCnt}</SValue>
          </StatBox>
          <StatBox>
            <SLabel>Total Proposals</SLabel>
            <SValue>{totalVotes}</SValue>
          </StatBox>
          <StatBox>
            <SLabel>Unique Voters</SLabel>
            <SValue>{(totalVoters/1000).toFixed(1)}K</SValue>
          </StatBox>
          <StatBox>
            <SLabel>CAKE Voting Power</SLabel>
            <SValue style={{ color:'#7645D9' }}>{totalCAKE}</SValue>
          </StatBox>
        </StatRow>

        {/* Governance info banner */}
        <GovBanner>
          <div>
            <Text bold style={{ fontSize:17, marginBottom:5 }}>🗳️ How PancakeSwap Governance Works</Text>
            <Text small color="textSubtle" style={{ maxWidth:500 }}>
              Hold CAKE to vote on proposals. 1 CAKE = 1 vote. Voting is gasless via Snapshot off-chain signatures.
              Quorum of 300K CAKE required for proposals to pass.
            </Text>
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <Button scale="sm" variant="subtle" onClick={() => window.open('https://snapshot.org/#/cakevote.eth', '_blank')}>
              📸 View on Snapshot ↗
            </Button>
            {!isConnected && (
              <Button scale="sm" onClick={connect}>🔓 Connect Wallet</Button>
            )}
          </div>
        </GovBanner>

        {/* Controls */}
        <Controls>
          <TabGroup>
            {(['all','active','closed','pending'] as const).map(t => (
              <TabBtn key={t} active={activeTab===t} onClick={() => setActiveTab(t)}>
                {t === 'active' && activeCnt > 0 && <span style={{ color:'#31D0AA', marginRight:4 }}>●</span>}
                {t.charAt(0).toUpperCase()+t.slice(1)}
                {t === 'active' && ` (${activeCnt})`}
              </TabBtn>
            ))}
          </TabGroup>
          <Input
            placeholder="🔍 Search proposals"
            value={search}
            onChange={e => setSearch(e.target.value)}
            scale="sm"
            style={{ maxWidth:280 }}
          />
        </Controls>

        {/* Proposal list */}
        <ProposalList>
          {proposals.length === 0 ? (
            <EmptyState>
              <div style={{ fontSize:40, marginBottom:12 }}>🗳️</div>
              <Text style={{ fontSize:18 }}>No proposals found</Text>
            </EmptyState>
          ) : proposals.map(p => {
            const total   = p.scoresTotal || 1;
            const forPct  = (p.scoresFor     / total) * 100;
            const agPct   = (p.scoresAgainst / total) * 100;
            const abPct   = (p.scoresAbstain / total) * 100;
            const passed  = p.status==='closed' && p.scoresFor > p.scoresAgainst;

            return (
              <ProposalCard key={p.id} onClick={() => setSelected(p)}>
                <PMeta>
                  <Badge variant={p.status==='active' ? 'success' : p.status==='pending' ? 'warning' : 'default'}>
                    {p.status==='active' ? '🟢 Active' : p.status==='pending' ? '⏳ Pending' : '⚫ Closed'}
                  </Badge>
                  <Badge variant="secondary">{p.category}</Badge>
                  <PAuthor>by {p.author.slice(0,8)}…</PAuthor>
                  {p.status==='active' && (
                    <Badge variant="info">⏱ {timeLeft(p)}</Badge>
                  )}
                  {p.userVote && (
                    <Badge variant={p.userVote==='for' ? 'success' : p.userVote==='against' ? 'error' : 'default'}>
                      ✓ Voted {p.userVote.charAt(0).toUpperCase()+p.userVote.slice(1)}
                    </Badge>
                  )}
                </PMeta>

                <PTitle>{p.title}</PTitle>

                {/* Vote bar */}
                {p.scoresTotal > 0 && (
                  <VoteBarMini>
                    <ForFill pct={forPct} />
                    <AgFill  pct={agPct}  />
                    <AbFill  pct={abPct}  />
                  </VoteBarMini>
                )}

                <PFooter>
                  <div style={{ display:'flex', gap:16 }}>
                    {p.scoresTotal > 0 && (
                      <>
                        <Text small color="success">{forPct.toFixed(1)}% For</Text>
                        <Text small color="failure">{agPct.toFixed(1)}% Against</Text>
                        <Text small color="textSubtle">{fmt(p.scoresTotal)} total</Text>
                      </>
                    )}
                    {p.scoresTotal === 0 && <Text small color="textSubtle">No votes yet</Text>}
                  </div>
                  {p.status==='closed' && (
                    <ResultChip passed={passed}>{passed ? '✅ Passed' : '❌ Failed'}</ResultChip>
                  )}
                  <Button scale="sm" variant="tertiary" onClick={e => { e.stopPropagation(); setSelected(p); }}>
                    View →
                  </Button>
                </PFooter>
              </ProposalCard>
            );
          })}
        </ProposalList>

      </Content>

      {/* Detail modal */}
      {selected && (
        <ProposalDetailModal
          proposal={selected}
          onDismiss={() => setSelected(null)}
          onVote={castVote}
          voting={voting}
          timeLeft={timeLeft}
        />
      )}
    </Page>
  );
}
