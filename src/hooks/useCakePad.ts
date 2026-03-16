import { useState, useEffect, useCallback } from 'react';

export type IDOStatus   = 'upcoming' | 'whitelist' | 'live' | 'ended' | 'claimable';
export type TierName    = 'Pancake' | 'Syrup' | 'Butter' | 'Cream' | 'Gold';

export interface Tier {
  name:           TierName;
  icon:           string;
  minCAKE:        number;
  multiplier:     number;
  allocation:     number;   // USD
  color:          string;
  whitelistSpots: number;
}

export interface IDOProject {
  id:              string;
  name:            string;
  symbol:          string;
  logo:            string;
  banner:          string;
  tagline:         string;
  description:     string;
  category:        string[];
  status:          IDOStatus;
  // Sale info
  hardCap:         number;
  softCap:         number;
  raised:          number;
  tokenPrice:      number;   // in USD
  listingPrice:    number;   // in USD
  tokensForSale:   number;
  raiseToken:      string;
  // Times
  whitelistStart:  number;
  whitelistEnd:    number;
  saleStart:       number;
  saleEnd:         number;
  claimStart:      number;
  // Vesting
  tge:             number;   // % at TGE
  cliff:           number;   // months
  vesting:         number;   // months linear
  // Tiers
  tierAllocations: Record<TierName, number>;  // USD per tier
  // Stats
  participants:    number;
  website:         string;
  twitter:         string;
  whitepaper:      string;
  audit:           string;
  // User
  userTier:        TierName | null;
  userCommitted:   number;
  userAllocation:  number;
  isWhitelisted:   boolean;
  hasClaimed:      boolean;
  // Token metrics
  totalSupply:     number;
  initialMcap:     number;
  fdv:             number;
  // ATH info (for ended)
  ath:             number;
  athDate:         string;
}

// Use a fixed reference timestamp to avoid hydration mismatches
// (server and client must render the same output).
const NOW = 1700000000000; // 2023-11-14T22:13:20.000Z
const DAY = 86_400_000;

export const TIERS: Tier[] = [
  { name: 'Pancake', icon: '🥞', minCAKE: 0,     multiplier: 1,   allocation: 100,   color: '#BDC2C4', whitelistSpots: 0    },
  { name: 'Syrup',   icon: '🍯', minCAKE: 200,   multiplier: 2,   allocation: 300,   color: '#1FC7D4', whitelistSpots: 2000 },
  { name: 'Butter',  icon: '🧈', minCAKE: 500,   multiplier: 5,   allocation: 750,   color: '#31D0AA', whitelistSpots: 800  },
  { name: 'Cream',   icon: '🍦', minCAKE: 1500,  multiplier: 15,  allocation: 2000,  color: '#7645D9', whitelistSpots: 300  },
  { name: 'Gold',    icon: '🥇', minCAKE: 5000,  multiplier: 50,  allocation: 6000,  color: '#FFD700', whitelistSpots: 80   },
];

const PROJECTS: IDOProject[] = [
  {
    id: '1', name: 'QuantumFi', symbol: 'QFI', logo: '⚛️',
    banner: '', tagline: 'Next-gen cross-chain DeFi aggregator',
    description: 'QuantumFi is a next-generation DeFi aggregator that leverages quantum-resistant cryptography and cross-chain liquidity to deliver the best rates across 30+ chains simultaneously.',
    category: ['DeFi', 'Aggregator', 'Cross-chain'],
    status: 'live',
    hardCap: 1500000, softCap: 750000, raised: 982400,
    tokenPrice: 0.08, listingPrice: 0.12,
    tokensForSale: 18750000, raiseToken: 'USDT',
    whitelistStart: NOW - DAY * 5, whitelistEnd: NOW - DAY * 2,
    saleStart:      NOW - DAY,     saleEnd: NOW + DAY * 1.5,
    claimStart:     NOW + DAY * 3,
    tge: 20, cliff: 1, vesting: 9,
    tierAllocations: { Pancake: 100, Syrup: 300, Butter: 750, Cream: 2000, Gold: 6000 },
    participants: 8420, website: '#', twitter: '#', whitepaper: '#', audit: '#',
    userTier: null, userCommitted: 0, userAllocation: 0, isWhitelisted: false, hasClaimed: false,
    totalSupply: 500000000, initialMcap: 4000000, fdv: 40000000, ath: 0, athDate: '',
  },
  {
    id: '2', name: 'NexaChain', symbol: 'NEXA', logo: '🔗',
    banner: '', tagline: 'Modular L2 blockchain for DeFi',
    description: 'NexaChain is a modular Layer-2 blockchain specifically designed for high-throughput DeFi applications, offering 100,000 TPS with sub-second finality.',
    category: ['Layer 2', 'Infrastructure', 'Scaling'],
    status: 'upcoming',
    hardCap: 3000000, softCap: 1500000, raised: 0,
    tokenPrice: 0.15, listingPrice: 0.22,
    tokensForSale: 20000000, raiseToken: 'USDT',
    whitelistStart: NOW + DAY * 2, whitelistEnd: NOW + DAY * 4,
    saleStart:      NOW + DAY * 5, saleEnd: NOW + DAY * 7,
    claimStart:     NOW + DAY * 10,
    tge: 15, cliff: 2, vesting: 12,
    tierAllocations: { Pancake: 150, Syrup: 450, Butter: 1125, Cream: 3000, Gold: 9000 },
    participants: 0, website: '#', twitter: '#', whitepaper: '#', audit: '#',
    userTier: null, userCommitted: 0, userAllocation: 0, isWhitelisted: false, hasClaimed: false,
    totalSupply: 1000000000, initialMcap: 15000000, fdv: 150000000, ath: 0, athDate: '',
  },
  {
    id: '3', name: 'MetaVault', symbol: 'MVT', logo: '🏛️',
    banner: '', tagline: 'Institutional-grade yield vaults',
    description: 'MetaVault brings institutional-grade yield optimization strategies to retail DeFi users with gas-efficient vaults and transparent risk scoring.',
    category: ['Yield', 'Vaults', 'Institutional'],
    status: 'whitelist',
    hardCap: 800000, softCap: 400000, raised: 0,
    tokenPrice: 0.05, listingPrice: 0.08,
    tokensForSale: 16000000, raiseToken: 'CAKE',
    whitelistStart: NOW - DAY,     whitelistEnd: NOW + DAY,
    saleStart:      NOW + DAY * 2, saleEnd: NOW + DAY * 4,
    claimStart:     NOW + DAY * 6,
    tge: 25, cliff: 0, vesting: 6,
    tierAllocations: { Pancake: 75, Syrup: 225, Butter: 562, Cream: 1500, Gold: 4500 },
    participants: 1240, website: '#', twitter: '#', whitepaper: '#', audit: '#',
    userTier: null, userCommitted: 0, userAllocation: 0, isWhitelisted: false, hasClaimed: false,
    totalSupply: 300000000, initialMcap: 2400000, fdv: 24000000, ath: 0, athDate: '',
  },
  {
    id: '4', name: 'GameForge', symbol: 'GFG', logo: '🎮',
    banner: '', tagline: 'Web3 gaming infrastructure protocol',
    description: 'GameForge provides a complete Web3 gaming infrastructure with NFT standards, in-game economies, and cross-game asset interoperability.',
    category: ['GameFi', 'NFT', 'Infrastructure'],
    status: 'claimable',
    hardCap: 2000000, softCap: 1000000, raised: 2000000,
    tokenPrice: 0.10, listingPrice: 0.18,
    tokensForSale: 20000000, raiseToken: 'USDT',
    whitelistStart: NOW - DAY * 14, whitelistEnd: NOW - DAY * 12,
    saleStart:      NOW - DAY * 11, saleEnd: NOW - DAY * 9,
    claimStart:     NOW - DAY * 7,
    tge: 20, cliff: 1, vesting: 10,
    tierAllocations: { Pancake: 100, Syrup: 300, Butter: 750, Cream: 2000, Gold: 6000 },
    participants: 12800, website: '#', twitter: '#', whitepaper: '#', audit: '#',
    userTier: null, userCommitted: 0, userAllocation: 0, isWhitelisted: false, hasClaimed: false,
    totalSupply: 700000000, initialMcap: 9000000, fdv: 126000000,
    ath: 0.62, athDate: 'Mar 2025',
  },
  {
    id: '5', name: 'SolarPay', symbol: 'SLRP', logo: '☀️',
    banner: '', tagline: 'Decentralized payment rails for Web3',
    description: 'SolarPay builds decentralized payment rails enabling instant, fee-less transactions for merchants and consumers across all major blockchains.',
    category: ['Payments', 'DeFi', 'Web3'],
    status: 'ended',
    hardCap: 1200000, softCap: 600000, raised: 1200000,
    tokenPrice: 0.06, listingPrice: 0.09,
    tokensForSale: 20000000, raiseToken: 'USDT',
    whitelistStart: NOW - DAY * 21, whitelistEnd: NOW - DAY * 18,
    saleStart:      NOW - DAY * 17, saleEnd: NOW - DAY * 15,
    claimStart:     NOW - DAY * 13,
    tge: 15, cliff: 1, vesting: 12,
    tierAllocations: { Pancake: 100, Syrup: 300, Butter: 750, Cream: 2000, Gold: 6000 },
    participants: 9650, website: '#', twitter: '#', whitepaper: '#', audit: '#',
    userTier: null, userCommitted: 0, userAllocation: 0, isWhitelisted: false, hasClaimed: false,
    totalSupply: 400000000, initialMcap: 3600000, fdv: 36000000,
    ath: 0.48, athDate: 'Feb 2025',
  },
];

export function useCakePad() {
  const [projects,    setProjects]   = useState<IDOProject[]>(PROJECTS);
  const [selected,    setSelected]   = useState<IDOProject | null>(null);
  const [activeTab,   setActiveTab]  = useState<'all'|'upcoming'|'whitelist'|'live'|'ended'>('all');
  const [search,      setSearch]     = useState('');
  const [commitAmt,   setCommitAmt]  = useState('');
  const [committing,  setCommitting] = useState(false);
  const [claiming,    setClaiming]   = useState(false);
  const [userCAKE,    setUserCAKE]   = useState(0);    // held CAKE for tier calc
  const [cakeInput,   setCakeInput]  = useState('');

  // Simulate raise growing
  useEffect(() => {
    const t = setInterval(() => {
      setProjects(prev => prev.map(p => {
        if (p.status !== 'live') return p;
        const tick = p.hardCap * 0.0003 * Math.random();
        return {
          ...p,
          raised:       Math.min(p.raised + tick, p.hardCap),
          participants: p.participants + (Math.random() > 0.6 ? 1 : 0),
        };
      }));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  // Sync selected
  useEffect(() => {
    if (selected) {
      const updated = projects.find(p => p.id === selected.id);
      if (updated) setSelected(updated);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  const filtered = projects.filter(p => {
    if (activeTab !== 'all' && p.status !== activeTab &&
        !(activeTab === 'ended' && (p.status === 'ended' || p.status === 'claimable'))) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.symbol.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const getUserTier = (cake: number): Tier => {
    const tiers = [...TIERS].reverse();
    return tiers.find(t => cake >= t.minCAKE) || TIERS[0];
  };

  const commit = useCallback(async (id: string, amount: number) => {
    setCommitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setProjects(prev => prev.map(p =>
      p.id === id
        ? { ...p, userCommitted: p.userCommitted + amount, raised: Math.min(p.raised + amount, p.hardCap), participants: p.participants + (p.userCommitted === 0 ? 1 : 0) }
        : p
    ));
    setCommitAmt('');
    setCommitting(false);
  }, []);

  const claim = useCallback(async (id: string) => {
    setClaiming(true);
    await new Promise(r => setTimeout(r, 1000));
    setProjects(prev => prev.map(p =>
      p.id === id ? { ...p, hasClaimed: true, userAllocation: p.userCommitted / p.tokenPrice } : p
    ));
    setClaiming(false);
  }, []);

  const applyWhitelist = useCallback(async (id: string) => {
    await new Promise(r => setTimeout(r, 800));
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isWhitelisted: true } : p));
  }, []);

  return {
    projects: filtered, selected, setSelected,
    activeTab, setActiveTab, search, setSearch,
    commitAmt, setCommitAmt, committing, claiming,
    commit, claim, applyWhitelist,
    userCAKE, setUserCAKE, cakeInput, setCakeInput,
    getUserTier, TIERS,
  };
}
