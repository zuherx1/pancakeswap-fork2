import { useState, useCallback } from 'react';

export type ProposalStatus = 'active' | 'closed' | 'pending';
export type VoteChoice     = 'for' | 'against' | 'abstain';

export interface Vote {
  voter:   string;
  choice:  VoteChoice;
  power:   number;
  time:    number;
}

export interface Proposal {
  id:           string;
  title:        string;
  body:          string;
  author:       string;
  status:       ProposalStatus;
  startTime:    number;
  endTime:      number;
  snapshot:     number;
  quorum:       number;
  space:        string;
  choices:      string[];
  votes:        Vote[];
  scores:       number[];
  scoresTotal:  number;
  scoresFor:    number;
  scoresAgainst:number;
  scoresAbstain:number;
  category:     string;
  discussion:   string;
  userVote?:    VoteChoice;
}

const NOW = Date.now();
const DAY = 86_400_000;

const PROPOSALS: Proposal[] = [
  {
    id: 'pcs-0421',
    title: 'Reduce CAKE Emission Rate by 15% Starting Block 38,000,000',
    body: `## Summary\n\nThis proposal aims to reduce the CAKE emission rate by 15% starting from block 38,000,000 to combat inflation and support long-term token value.\n\n## Motivation\n\nCAKE emissions have remained high relative to current protocol revenues. A 15% reduction would:\n- Decrease selling pressure on CAKE\n- Improve APR sustainability for farmers\n- Align emissions with current demand\n\n## Specification\n\nReduce the CAKE per block from 40 to 34, effective at block 38,000,000 (~14 days from now).\n\n## Voting Options\n- For: Support the 15% reduction\n- Against: Keep current emissions\n- Abstain: No preference`,
    author: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    status: 'active',
    startTime: NOW - DAY * 2,
    endTime:   NOW + DAY * 5,
    snapshot:  37800000,
    quorum:    300000,
    space:     'cakevote.eth',
    choices:   ['For', 'Against', 'Abstain'],
    votes: [],
    scores:       [4820000, 1240000, 380000],
    scoresTotal:  6440000,
    scoresFor:    4820000,
    scoresAgainst:1240000,
    scoresAbstain:380000,
    category:  'Emission',
    discussion: '#',
    userVote: undefined,
  },
  {
    id: 'pcs-0420',
    title: 'Add MATIC-BNB Farm with 12x Multiplier',
    body: `## Summary\n\nProposal to add a new MATIC-BNB liquidity pool farm with a 12x CAKE multiplier to attract Polygon ecosystem liquidity to BNB Chain.\n\n## Rationale\n\nMATIC is one of the top 20 tokens by market cap with a growing ecosystem. Adding a MATIC-BNB farm would:\n- Attract Polygon users to PancakeSwap\n- Increase TVL significantly\n- Create synergy between BNB Chain and Polygon ecosystems\n\n## Implementation\n\nThe farm would be added via MasterChef V2 with a 12x weight.`,
    author: '0x0000000000000000000000000000000000000042',
    status: 'active',
    startTime: NOW - DAY * 1,
    endTime:   NOW + DAY * 6,
    snapshot:  37820000,
    quorum:    200000,
    space:     'cakevote.eth',
    choices:   ['For', 'Against', 'Abstain'],
    votes: [],
    scores:       [2180000, 820000, 140000],
    scoresTotal:  3140000,
    scoresFor:    2180000,
    scoresAgainst:820000,
    scoresAbstain:140000,
    category:  'Farm',
    discussion: '#',
    userVote: undefined,
  },
  {
    id: 'pcs-0419',
    title: 'Integrate zkSync Era as Supported Chain',
    body: `## Summary\n\nThis proposal seeks community approval to deploy PancakeSwap V3 contracts on zkSync Era mainnet.\n\n## Benefits\n- Access to zkSync's growing DeFi ecosystem\n- Lower transaction fees for users\n- Expanded multichain presence\n\n## Timeline\n\nIf approved, deployment would begin within 30 days of the vote closing.`,
    author: '0x3f349bBaFEc1551819B8be1EfEA2fC46cA749aA',
    status: 'active',
    startTime: NOW - DAY * 3,
    endTime:   NOW + DAY * 4,
    snapshot:  37760000,
    quorum:    400000,
    space:     'cakevote.eth',
    choices:   ['For', 'Against', 'Abstain'],
    votes: [],
    scores:       [6820000, 540000, 280000],
    scoresTotal:  7640000,
    scoresFor:    6820000,
    scoresAgainst:540000,
    scoresAbstain:280000,
    category:  'Chain',
    discussion: '#',
    userVote: undefined,
  },
  {
    id: 'pcs-0418',
    title: 'Increase Lottery Burn Rate from 20% to 25%',
    body: `## Summary\n\nIncrease the portion of each Lottery round that is used to buy and burn CAKE tokens from 20% to 25%.\n\n## Rationale\n\nIncreasing the burn rate would make CAKE more deflationary and reward long-term holders.`,
    author: '0xCf7ad23Cd3CaDbD9735AFf958023239c6A063aa',
    status: 'closed',
    startTime: NOW - DAY * 14,
    endTime:   NOW - DAY * 7,
    snapshot:  37500000,
    quorum:    300000,
    space:     'cakevote.eth',
    choices:   ['For', 'Against', 'Abstain'],
    votes: [],
    scores:       [5640000, 1820000, 420000],
    scoresTotal:  7880000,
    scoresFor:    5640000,
    scoresAgainst:1820000,
    scoresAbstain:420000,
    category:  'Tokenomics',
    discussion: '#',
    userVote: undefined,
  },
  {
    id: 'pcs-0417',
    title: 'Deploy PancakeSwap V3 on Linea',
    body: `## Summary\n\nDeploy V3 contracts on Linea mainnet to capture Ethereum-native users seeking lower fees.\n\n## Outcome\n\nThis proposal passed with 72% approval.`,
    author: '0xDeAdBeEf000000000000000000000000deadbeef',
    status: 'closed',
    startTime: NOW - DAY * 21,
    endTime:   NOW - DAY * 14,
    snapshot:  37200000,
    quorum:    300000,
    space:     'cakevote.eth',
    choices:   ['For', 'Against', 'Abstain'],
    votes: [],
    scores:       [7200000, 2100000, 680000],
    scoresTotal:  9980000,
    scoresFor:    7200000,
    scoresAgainst:2100000,
    scoresAbstain:680000,
    category:  'Chain',
    discussion: '#',
    userVote: undefined,
  },
  {
    id: 'pcs-0422',
    title: 'Launch CAKE Staking V2 with Boosted APR Tiers',
    body: `## Summary\n\nIntroduce a new CAKE Staking V2 system with tiered APR based on lock duration.\n\n## Tiers\n- 30 days: Base APR\n- 90 days: 1.5x APR\n- 180 days: 2x APR\n- 365 days: 3x APR`,
    author: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    status: 'pending',
    startTime: NOW + DAY * 2,
    endTime:   NOW + DAY * 9,
    snapshot:  38000000,
    quorum:    300000,
    space:     'cakevote.eth',
    choices:   ['For', 'Against', 'Abstain'],
    votes: [],
    scores:       [0, 0, 0],
    scoresTotal:  0,
    scoresFor:    0,
    scoresAgainst:0,
    scoresAbstain:0,
    category:  'Staking',
    discussion: '#',
    userVote: undefined,
  },
];

export function useVoting() {
  const [proposals,   setProposals]   = useState<Proposal[]>(PROPOSALS);
  const [selected,    setSelected]    = useState<Proposal | null>(null);
  const [activeTab,   setActiveTab]   = useState<'all'|'active'|'closed'|'pending'>('all');
  const [search,      setSearch]      = useState('');
  const [voting,      setVoting]      = useState(false);
  const [activeVote,  setActiveVote]  = useState<VoteChoice | null>(null);
  const [cakeBalance, setCakeBalance] = useState(0);

  const filtered = proposals.filter(p => {
    if (activeTab !== 'all' && p.status !== activeTab) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const castVote = useCallback(async (id: string, choice: VoteChoice, power: number) => {
    setVoting(true);
    await new Promise(r => setTimeout(r, 1200));
    setProposals(prev => prev.map(p => {
      if (p.id !== id) return p;
      const delta = power;
      return {
        ...p,
        userVote:      choice,
        scoresFor:     choice === 'for'     ? p.scoresFor     + delta : p.scoresFor,
        scoresAgainst: choice === 'against' ? p.scoresAgainst + delta : p.scoresAgainst,
        scoresAbstain: choice === 'abstain' ? p.scoresAbstain + delta : p.scoresAbstain,
        scoresTotal:   p.scoresTotal + delta,
        scores: [
          choice === 'for'     ? p.scores[0] + delta : p.scores[0],
          choice === 'against' ? p.scores[1] + delta : p.scores[1],
          choice === 'abstain' ? p.scores[2] + delta : p.scores[2],
        ],
      };
    }));
    // Sync selected
    setSelected(prev => {
      if (!prev || prev.id !== id) return prev;
      const updated = proposals.find(p => p.id === id);
      return updated ? { ...updated, userVote: choice } : prev;
    });
    setVoting(false);
    setActiveVote(null);
  }, [proposals]);

  const timeLeft = (p: Proposal) => {
    const ms  = p.endTime - Date.now();
    if (ms <= 0) return 'Ended';
    const d   = Math.floor(ms / DAY);
    const h   = Math.floor((ms % DAY) / 3600000);
    if (d > 0) return `${d}d ${h}h left`;
    return `${h}h left`;
  };

  return {
    proposals: filtered, selected, setSelected,
    activeTab, setActiveTab, search, setSearch,
    voting, activeVote, setActiveVote,
    cakeBalance, setCakeBalance,
    castVote, timeLeft,
  };
}
