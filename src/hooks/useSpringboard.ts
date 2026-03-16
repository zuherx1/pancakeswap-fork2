import { useState, useEffect, useCallback } from 'react';

export type SaleStatus = 'upcoming' | 'live' | 'ended' | 'claimed';
export type SaleType   = 'public' | 'whitelist' | 'both';

export interface ILOProject {
  id:              string;
  name:            string;
  symbol:          string;
  logoURI:         string;
  bannerURI:       string;
  description:     string;
  website:         string;
  twitter:         string;
  telegram:        string;
  contractAddress: string;
  saleStatus:      SaleStatus;
  saleType:        SaleType;
  raiseToken:      string;  // e.g. CAKE or BNB
  raiseTokenLogo:  string;
  totalRaise:      number;
  currentRaise:    number;
  tokenPrice:      number;  // in raiseToken
  tokensForSale:   number;
  minPerUser:      number;
  maxPerUser:      number;
  startTime:       number;  // timestamp
  endTime:         number;
  vestingDuration: number;  // days
  cliffDuration:   number;  // days
  tgePercent:      number;  // % released at TGE
  userCommitted:   number;
  userAllocation:  number;
  isWhitelisted:   boolean;
  participants:    number;
  tags:            string[];
  chainId:         number;
  isNew:           boolean;
  isFeatured:      boolean;
}

const NOW = Date.now();
const DAY = 86400000;

const PROJECTS: ILOProject[] = [
  {
    id: '1', name: 'NovaDEX', symbol: 'NOVA', logoURI: '🌟',
    bannerURI: '', description: 'Next-generation DEX aggregator with AI-powered routing across 50+ chains.',
    website: '#', twitter: '#', telegram: '#',
    contractAddress: '0xabc...123',
    saleStatus: 'live', saleType: 'both',
    raiseToken: 'CAKE', raiseTokenLogo: 'https://tokens.pancakeswap.finance/images/symbol/cake.png',
    totalRaise: 500000, currentRaise: 342800,
    tokenPrice: 0.05, tokensForSale: 10000000,
    minPerUser: 50, maxPerUser: 5000,
    startTime: NOW - DAY, endTime: NOW + 2 * DAY,
    vestingDuration: 180, cliffDuration: 30, tgePercent: 15,
    userCommitted: 0, userAllocation: 0,
    isWhitelisted: true, participants: 4821,
    tags: ['DEX', 'AI', 'Multi-chain'], chainId: 56,
    isNew: true, isFeatured: true,
  },
  {
    id: '2', name: 'YieldForge', symbol: 'YFG', logoURI: '⚒️',
    bannerURI: '', description: 'Automated yield optimization protocol with cross-chain vaults and auto-compounding strategies.',
    website: '#', twitter: '#', telegram: '#',
    contractAddress: '0xdef...456',
    saleStatus: 'live', saleType: 'public',
    raiseToken: 'CAKE', raiseTokenLogo: 'https://tokens.pancakeswap.finance/images/symbol/cake.png',
    totalRaise: 300000, currentRaise: 289100,
    tokenPrice: 0.12, tokensForSale: 2500000,
    minPerUser: 100, maxPerUser: 3000,
    startTime: NOW - 2 * DAY, endTime: NOW + DAY,
    vestingDuration: 90, cliffDuration: 0, tgePercent: 25,
    userCommitted: 0, userAllocation: 0,
    isWhitelisted: false, participants: 6234,
    tags: ['Yield', 'DeFi', 'Vaults'], chainId: 56,
    isNew: false, isFeatured: true,
  },
  {
    id: '3', name: 'ChainPulse', symbol: 'CPL', logoURI: '💓',
    bannerURI: '', description: 'On-chain analytics and intelligence platform for DeFi traders.',
    website: '#', twitter: '#', telegram: '#',
    contractAddress: '0x111...789',
    saleStatus: 'upcoming', saleType: 'whitelist',
    raiseToken: 'BNB', raiseTokenLogo: 'https://tokens.pancakeswap.finance/images/symbol/bnb.png',
    totalRaise: 1000, currentRaise: 0,
    tokenPrice: 0.008, tokensForSale: 125000000,
    minPerUser: 0.1, maxPerUser: 5,
    startTime: NOW + 3 * DAY, endTime: NOW + 5 * DAY,
    vestingDuration: 365, cliffDuration: 60, tgePercent: 10,
    userCommitted: 0, userAllocation: 0,
    isWhitelisted: false, participants: 0,
    tags: ['Analytics', 'Data', 'Tools'], chainId: 56,
    isNew: true, isFeatured: false,
  },
  {
    id: '4', name: 'MetaRealm', symbol: 'MRL', logoURI: '🌌',
    bannerURI: '', description: 'Immersive blockchain-native metaverse with player-owned economy and NFT land.',
    website: '#', twitter: '#', telegram: '#',
    contractAddress: '0x222...abc',
    saleStatus: 'upcoming', saleType: 'both',
    raiseToken: 'CAKE', raiseTokenLogo: 'https://tokens.pancakeswap.finance/images/symbol/cake.png',
    totalRaise: 800000, currentRaise: 0,
    tokenPrice: 0.02, tokensForSale: 40000000,
    minPerUser: 200, maxPerUser: 10000,
    startTime: NOW + 5 * DAY, endTime: NOW + 7 * DAY,
    vestingDuration: 270, cliffDuration: 30, tgePercent: 20,
    userCommitted: 0, userAllocation: 0,
    isWhitelisted: false, participants: 0,
    tags: ['Metaverse', 'NFT', 'GameFi'], chainId: 56,
    isNew: true, isFeatured: false,
  },
  {
    id: '5', name: 'LiquidStake', symbol: 'LSTK', logoURI: '💧',
    bannerURI: '', description: 'Liquid staking derivatives protocol for BNB Chain with yield-bearing tokens.',
    website: '#', twitter: '#', telegram: '#',
    contractAddress: '0x333...def',
    saleStatus: 'ended', saleType: 'public',
    raiseToken: 'CAKE', raiseTokenLogo: 'https://tokens.pancakeswap.finance/images/symbol/cake.png',
    totalRaise: 250000, currentRaise: 250000,
    tokenPrice: 0.15, tokensForSale: 1666666,
    minPerUser: 50, maxPerUser: 2000,
    startTime: NOW - 7 * DAY, endTime: NOW - DAY,
    vestingDuration: 120, cliffDuration: 14, tgePercent: 30,
    userCommitted: 0, userAllocation: 0,
    isWhitelisted: false, participants: 3810,
    tags: ['Liquid Staking', 'LST', 'BNB'], chainId: 56,
    isNew: false, isFeatured: false,
  },
];

export function useSpringboard() {
  const [projects,    setProjects]   = useState<ILOProject[]>(PROJECTS);
  const [activeTab,   setActiveTab]  = useState<'all'|'live'|'upcoming'|'ended'>('all');
  const [search,      setSearch]     = useState('');
  const [selected,    setSelected]   = useState<ILOProject | null>(null);
  const [commitAmt,   setCommitAmt]  = useState('');
  const [committing,  setCommitting] = useState(false);
  const [claiming,    setClaiming]   = useState(false);

  // Simulate raise progress ticking up on live projects
  useEffect(() => {
    const t = setInterval(() => {
      setProjects(prev => prev.map(p => {
        if (p.saleStatus !== 'live') return p;
        const tick = p.totalRaise * 0.0002 * Math.random();
        const next = Math.min(p.currentRaise + tick, p.totalRaise);
        return { ...p, currentRaise: +next.toFixed(2), participants: p.participants + (Math.random() > 0.7 ? 1 : 0) };
      }));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const filtered = projects.filter(p => {
    if (activeTab !== 'all' && p.saleStatus !== activeTab) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.symbol.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const commit = useCallback(async (projectId: string, amount: number) => {
    setCommitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, userCommitted: p.userCommitted + amount, currentRaise: Math.min(p.currentRaise + amount, p.totalRaise), participants: p.participants + (p.userCommitted === 0 ? 1 : 0) }
        : p
    ));
    setCommitAmt('');
    setCommitting(false);
  }, []);

  const claim = useCallback(async (projectId: string) => {
    setClaiming(true);
    await new Promise(r => setTimeout(r, 1000));
    setProjects(prev => prev.map(p =>
      p.id === projectId ? { ...p, saleStatus: 'claimed' as SaleStatus, userAllocation: p.userCommitted / p.tokenPrice } : p
    ));
    setClaiming(false);
  }, []);

  return {
    projects: filtered, activeTab, setActiveTab, search, setSearch,
    selected, setSelected, commitAmt, setCommitAmt,
    committing, claiming, commit, claim,
  };
}
