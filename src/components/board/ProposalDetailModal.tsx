import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Text, Heading } from '../ui/Typography';
import { Badge } from '../ui/Badge';
import { Proposal, VoteChoice } from '../../hooks/useVoting';
import { useWeb3 } from '../../context/Web3Context';

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const Tabs = styled.div`
  display:flex; background:${({ theme }) => theme.colors.input};
  border-radius:12px; padding:4px; gap:4px; margin-bottom:20px;
`;
const Tab = styled.button<{ active?:boolean }>`
  flex:1; padding:7px; border-radius:10px; border:none; cursor:pointer;
  font-size:13px; font-weight:600; font-family:'Kanit',sans-serif;
  background:${({ active,theme }) => active ? theme.colors.backgroundAlt : 'transparent'};
  color:${({ active,theme }) => active ? theme.colors.text : theme.colors.textSubtle};
  transition:all 0.15s;
`;

const VoteOption = styled.button<{ choice:VoteChoice; selected?:boolean; hasVoted?:boolean }>`
  width:100%; display:flex; align-items:center; justify-content:space-between;
  padding:14px 18px; border-radius:16px; margin-bottom:8px;
  font-size:15px; font-weight:600; font-family:'Kanit',sans-serif;
  cursor:${({ hasVoted }) => hasVoted ? 'default' : 'pointer'};
  transition:all 0.15s;
  border:2px solid ${({ selected, choice, theme }) => {
    if (!selected) return theme.colors.cardBorder;
    if (choice === 'for')     return theme.colors.success;
    if (choice === 'against') return theme.colors.danger;
    return theme.colors.primary;
  }};
  background:${({ selected, choice, theme }) => {
    if (!selected) return theme.colors.input;
    if (choice === 'for')     return theme.colors.success  + '15';
    if (choice === 'against') return theme.colors.danger   + '15';
    return theme.colors.primary + '15';
  }};
  color:${({ selected, choice, theme }) => {
    if (!selected) return theme.colors.text;
    if (choice === 'for')     return theme.colors.success;
    if (choice === 'against') return theme.colors.danger;
    return theme.colors.primary;
  }};
  &:hover:not(:disabled) {
    border-color:${({ choice, theme }) =>
      choice === 'for'     ? theme.colors.success  :
      choice === 'against' ? theme.colors.danger   :
      theme.colors.primary};
  }
`;

const VoteBar = styled.div`margin-bottom:16px;`;
const VBarRow = styled.div`display:flex; align-items:center; gap:10px; margin-bottom:8px;`;
const VBarTrack = styled.div`flex:1; height:8px; border-radius:4px; background:${({ theme }) => theme.colors.input}; overflow:hidden;`;
const VBarFill = styled.div<{ pct:number; $color:string }>`
  height:100%; border-radius:4px;
  width:${({ pct }) => pct}%;
  background:${({ $color }) => $color};
  transition:width 0.6s ease;
`;

const ResultBox = styled.div<{ won:boolean }>`
  display:inline-flex; align-items:center; gap:6px;
  padding:6px 14px; border-radius:10px;
  background:${({ won,theme }) => won ? theme.colors.success+'20' : theme.colors.danger+'20'};
  color:${({ won,theme }) => won ? theme.colors.success : theme.colors.danger};
  font-size:14px; font-weight:700;
`;

const MarkdownBody = styled.div`
  font-size:14px; line-height:1.7; color:${({ theme }) => theme.colors.text};
  max-height:320px; overflow-y:auto;
  h2 { font-size:16px; font-weight:700; margin:16px 0 8px; color:${({ theme }) => theme.colors.text}; }
  p  { margin:0 0 10px; }
  ul { padding-left:20px; margin:0 0 10px; }
  li { margin-bottom:4px; }
`;

const InfoRow = styled.div`
  display:flex; justify-content:space-between; padding:7px 0;
  border-bottom:1px solid ${({ theme }) => theme.colors.cardBorder+'60'};
  &:last-child{border-bottom:none;}
`;

const AuthorBadge = styled.div`
  font-size:12px; color:${({ theme }) => theme.colors.textSubtle};
  font-family:'Roboto Mono',monospace;
  background:${({ theme }) => theme.colors.input};
  padding:4px 10px; border-radius:8px; cursor:pointer;
  &:hover{color:${({ theme }) => theme.colors.primary};}
`;

/* ─── Simple markdown renderer ─────────────────────────────────────────── */
const renderMd = (text: string) => {
  return text
    .replace(/## (.*)/g, '<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n- (.*)/g, '\n<li>$1</li>')
    .replace(/(<li>.*<\/li>(\n|$))+/gs, match => `<ul>${match}</ul>`)
    .split('\n\n')
    .map(p => p.startsWith('<') ? p : `<p>${p}</p>`)
    .join('');
};

interface Props {
  proposal:   Proposal;
  onDismiss:  () => void;
  onVote:     (id: string, choice: VoteChoice, power: number) => Promise<void>;
  voting:     boolean;
  timeLeft:   (p: Proposal) => string;
}

const ProposalDetailModal: React.FC<Props> = ({ proposal, onDismiss, onVote, voting, timeLeft }) => {
  const { isConnected, connect } = useWeb3();
  const [tab,          setTab]          = useState<'proposal'|'votes'|'info'>('proposal');
  const [chosenVote,   setChosenVote]   = useState<VoteChoice | null>(proposal.userVote || null);
  const [cakeAmt,      setCakeAmt]      = useState('100');

  const total  = proposal.scoresTotal || 1;
  const forPct = (proposal.scoresFor     / total) * 100;
  const agPct  = (proposal.scoresAgainst / total) * 100;
  const abPct  = (proposal.scoresAbstain / total) * 100;

  const isActive  = proposal.status === 'active';
  const hasPassed = proposal.status === 'closed' && proposal.scoresFor > proposal.scoresAgainst;
  const quorumMet = proposal.scoresTotal >= proposal.quorum;

  const fmt = (n:number) => n >= 1e6 ? `${(n/1e6).toFixed(2)}M` : n >= 1e3 ? `${(n/1e3).toFixed(1)}K` : n.toFixed(0);

  const voteChoices: { key: VoteChoice; label: string; icon: string; color: string }[] = [
    { key:'for',     label:'For',     icon:'✅', color:'#31D0AA' },
    { key:'against', label:'Against', icon:'❌', color:'#ED4B9E' },
    { key:'abstain', label:'Abstain', icon:'⚪', color:'#7A6EAA' },
  ];

  return (
    <Modal title={`PCS-${proposal.id.replace('pcs-','').toUpperCase()}`} onDismiss={onDismiss}>
      {/* Status row */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
        <Badge variant={proposal.status==='active' ? 'success' : proposal.status==='pending' ? 'warning' : 'default'}>
          {proposal.status==='active' ? '🟢 Active' : proposal.status==='pending' ? '⏳ Pending' : '⚫ Closed'}
        </Badge>
        <Badge variant="secondary">{proposal.category}</Badge>
        {proposal.status==='active' && <Badge variant="info">⏱ {timeLeft(proposal)}</Badge>}
        {proposal.status==='closed' && (
          <ResultBox won={hasPassed}>{hasPassed ? '✅ Passed' : '❌ Failed'}</ResultBox>
        )}
      </div>

      <Heading scale="md" style={{ marginBottom:16, lineHeight:1.3 }}>{proposal.title}</Heading>

      {/* Tabs */}
      <Tabs>
        <Tab active={tab==='proposal'} onClick={() => setTab('proposal')}>Proposal</Tab>
        <Tab active={tab==='votes'}    onClick={() => setTab('votes')}>Votes</Tab>
        <Tab active={tab==='info'}     onClick={() => setTab('info')}>Info</Tab>
      </Tabs>

      {/* ── Proposal tab ── */}
      {tab === 'proposal' && (
        <>
          <MarkdownBody dangerouslySetInnerHTML={{ __html: renderMd(proposal.body) }} />

          {/* Vote results */}
          <div style={{ marginTop:20, marginBottom:16 }}>
            <Text bold style={{ marginBottom:10 }}>Current Results</Text>
            <VoteBar>
              {[
                { label:'For',     pct:forPct, score:proposal.scoresFor,     color:'#31D0AA' },
                { label:'Against', pct:agPct,  score:proposal.scoresAgainst, color:'#ED4B9E' },
                { label:'Abstain', pct:abPct,  score:proposal.scoresAbstain, color:'#7A6EAA' },
              ].map(v => (
                <VBarRow key={v.label}>
                  <Text small style={{ width:55, flexShrink:0 }}>{v.label}</Text>
                  <VBarTrack><VBarFill pct={v.pct} $color={v.color} /></VBarTrack>
                  <Text small bold style={{ width:60, textAlign:'right', flexShrink:0, color:v.color }}>
                    {v.pct.toFixed(1)}%
                  </Text>
                  <Text small color="textSubtle" style={{ width:70, textAlign:'right', flexShrink:0 }}>
                    {fmt(v.score)}
                  </Text>
                </VBarRow>
              ))}
            </VoteBar>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <Text small color="textSubtle">Total: {fmt(proposal.scoresTotal)} CAKE</Text>
              <Text small color={quorumMet ? 'success' : 'failure'}>
                Quorum: {fmt(proposal.scoresTotal)} / {fmt(proposal.quorum)} {quorumMet ? '✅' : '❌'}
              </Text>
            </div>
          </div>

          {/* Voting UI */}
          {isActive && (
            <>
              <Text bold style={{ marginBottom:10 }}>Cast Your Vote</Text>
              {voteChoices.map(v => (
                <VoteOption
                  key={v.key}
                  choice={v.key}
                  selected={chosenVote === v.key}
                  hasVoted={!!proposal.userVote}
                  onClick={() => !proposal.userVote && setChosenVote(v.key)}
                  disabled={!!proposal.userVote}
                >
                  <span>{v.icon} {v.label}</span>
                  {chosenVote === v.key && <span>✓ Selected</span>}
                  {proposal.userVote === v.key && <span>✓ Your vote</span>}
                </VoteOption>
              ))}

              {chosenVote && !proposal.userVote && (
                <div style={{ marginTop:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <Text small color="textSubtle">Voting power (CAKE):</Text>
                    <input
                      type="number"
                      value={cakeAmt}
                      onChange={e => setCakeAmt(e.target.value)}
                      style={{
                        padding:'6px 12px', borderRadius:10, border:'1px solid #E7E3EB',
                        background:'transparent', fontSize:14, fontWeight:700,
                        color:'inherit', fontFamily:'Kanit,sans-serif', width:120, outline:'none',
                      }}
                    />
                  </div>
                  {!isConnected ? (
                    <Button fullWidth onClick={connect}>🔓 Connect to Vote</Button>
                  ) : (
                    <Button
                      fullWidth
                      variant={chosenVote==='for' ? 'primary' : chosenVote==='against' ? 'danger' : 'secondary'}
                      isLoading={voting}
                      disabled={voting || !cakeAmt || Number(cakeAmt) <= 0}
                      onClick={() => onVote(proposal.id, chosenVote, Number(cakeAmt))}
                    >
                      {voting ? 'Broadcasting vote…' : `Vote ${chosenVote.charAt(0).toUpperCase()+chosenVote.slice(1)}`}
                    </Button>
                  )}
                </div>
              )}

              {proposal.userVote && (
                <div style={{ textAlign:'center', padding:'12px', background:'rgba(49,208,170,0.1)', borderRadius:14, marginTop:8 }}>
                  <Text bold color="success">✅ You already voted: {proposal.userVote.charAt(0).toUpperCase()+proposal.userVote.slice(1)}</Text>
                </div>
              )}
            </>
          )}

          {proposal.status === 'pending' && (
            <div style={{ background:'rgba(255,178,55,0.1)', borderRadius:14, padding:14, textAlign:'center' }}>
              <Text bold color="warning">⏳ Voting hasn't started yet</Text>
              <Text small color="textSubtle" style={{ marginTop:4 }}>
                Starts {new Date(proposal.startTime).toLocaleDateString()}
              </Text>
            </div>
          )}
        </>
      )}

      {/* ── Votes tab ── */}
      {tab === 'votes' && (
        <div>
          <Text small color="textSubtle" style={{ marginBottom:12 }}>
            {proposal.votes.length || Math.floor(proposal.scoresTotal / 1000)} addresses voted
          </Text>
          {proposal.scoresTotal === 0 ? (
            <div style={{ textAlign:'center', padding:'32px 0' }}>
              <Text color="textSubtle">No votes yet</Text>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { addr:'0x8f3C...A063', choice:'for'    as VoteChoice, power:820000  },
                { addr:'0x0E09...82',   choice:'for'    as VoteChoice, power:642000  },
                { addr:'0x3f34...aA',   choice:'for'    as VoteChoice, power:418000  },
                { addr:'0xCf7a...aa',   choice:'against'as VoteChoice, power:280000  },
                { addr:'0xDeAd...ef',   choice:'for'    as VoteChoice, power:196000  },
                { addr:'0x1234...56',   choice:'abstain'as VoteChoice, power:142000  },
              ].map((v, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'10px 14px', borderRadius:12,
                  background: v.choice==='for' ? '#31D0AA10' : v.choice==='against' ? '#ED4B9E10' : '#7A6EAA10',
                  border:`1px solid ${v.choice==='for' ? '#31D0AA30' : v.choice==='against' ? '#ED4B9E30' : '#7A6EAA30'}`,
                }}>
                  <Text small style={{ fontFamily:'Roboto Mono,monospace' }}>{v.addr}</Text>
                  <Badge variant={v.choice==='for' ? 'success' : v.choice==='against' ? 'error' : 'default'}>
                    {v.choice.charAt(0).toUpperCase()+v.choice.slice(1)}
                  </Badge>
                  <Text small bold>{(v.power/1000).toFixed(0)}K CAKE</Text>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Info tab ── */}
      {tab === 'info' && (
        <div>
          {[
            ['Proposal ID',  proposal.id.toUpperCase()],
            ['Space',        proposal.space],
            ['Author',       proposal.author.slice(0,10)+'...'+proposal.author.slice(-4)],
            ['Snapshot',     `Block #${proposal.snapshot.toLocaleString()}`],
            ['Start Date',   new Date(proposal.startTime).toLocaleString()],
            ['End Date',     new Date(proposal.endTime).toLocaleString()],
            ['Quorum',       `${(proposal.quorum/1000).toFixed(0)}K CAKE`],
            ['Strategy',     'erc20-balance-of (CAKE)'],
          ].map(([label, value]) => (
            <InfoRow key={label as string}>
              <Text small color="textSubtle">{label}</Text>
              <Text small bold>{value}</Text>
            </InfoRow>
          ))}
          <div style={{ marginTop:16 }}>
            <Button scale="sm" variant="subtle" onClick={() => window.open(`https://snapshot.org/#/cakevote.eth/proposal/${proposal.id}`, '_blank')}>
              📸 View on Snapshot ↗
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ProposalDetailModal;
