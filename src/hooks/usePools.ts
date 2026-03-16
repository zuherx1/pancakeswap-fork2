import { useState, useEffect, useCallback } from 'react';

export type PoolType = 'auto' | 'manual' | 'community';

export interface SyrupPool {
  sousId:         number;
  poolType:       PoolType;
  stakingToken:   { symbol: string; logoURI: string; decimals: number };
  earningToken:   { symbol: string; logoURI: string; decimals: number };
  contractAddress: string;
  apr:            number;
  apy:            number;
  totalStaked:    number;
  liquidity:      number;
  endBlock:       number;
  blocksRemaining:number;
  isFinished:     boolean;
  isNew:          boolean;
  isHot:          boolean;
  performanceFee: number; // for auto pool (2%)
  userStaked:     number;
  userEarned:     number;
  userShares:     number;  // for auto pool
  pricePerShare:  number;  // for auto pool
  tokenPrice:     number;
  stakingLimit:   number;
  harvestInterval:number;  // blocks
  lastHarvestTime:number;
}

const POOLS: SyrupPool[] = [
  {
    sousId: 0, poolType: 'auto',
    stakingToken:  { symbol: 'CAKE', logoURI: 'https://tokens.pancakeswap.finance/images/symbol/cake.png', decimals: 18 },
    earningToken:  { symbol: 'CAKE', logoURI: 'https://tokens.pancakeswap.finance/images/symbol/cake.png', decimals: 18 },
    contractAddress: '0xa80240Eb5d7E05d3F250cF94208E85Ef1a1000BB',
    apr: 68.24, apy: 97.82, totalStaked: 142000000, liquidity: 343640000,
    endBlock: 99999999, blocksRemaining: 9999999,
    isFinished: false, isNew: false, isHot: true, performanceFee: 2,
    userStaked: 0, userEarned: 0, userShares: 0, pricePerShare: 1.0842,
    tokenPrice: 2.42, stakingLimit: 0, harvestInterval: 5765, lastHarvestTime: 0,
  },
  {
    sousId: 1, poolType: 'manual',
    stakingToken:  { symbol: 'CAKE', logoURI: 'https://tokens.pancakeswap.finance/images/symbol/cake.png', decimals: 18 },
    earningToken:  { symbol: 'CAKE', logoURI: 'https://tokens.pancakeswap.finance/images/symbol/cake.png', decimals: 18 },
    contractAddress: '0x73feaa1eE314F2c655E8cec6E67bbFa68Ca29A59',
    apr: 62.14, apy: 87.55, totalStaked: 88000000, liquidity: 212960000,
    endBlock: 99999999, blocksRemaining: 9999999,
    isFinished: false, isNew: false, isHot: false, performanceFee: 0,
    userStaked: 0, userEarned: 0, userShares: 0, pricePerShare: 1,
    tokenPrice: 2.42, stakingLimit: 0, harvestInterval: 5765, lastHarvestTime: 0,
  },
  {
    sousId: 2, poolType: 'community',
    stakingToken:  { symbol: 'CAKE', logoURI: 'https://tokens.pancakeswap.finance/images/symbol/cake.png', decimals: 18 },
    earningToken:  { symbol: 'BNB',  logoURI: 'https://tokens.pancakeswap.finance/images/symbol/bnb.png',  decimals: 18 },
    contractAddress: '0xBb2B8038a1640196FbE3e38816F3e67Cba72D940',
    apr: 14.22, apy: 15.28, totalStaked: 22000000, liquidity: 53240000,
    endBlock: 99999999, blocksRemaining: 9999999,
    isFinished: false, isNew: true, isHot: false, performanceFee: 0,
    userStaked: 0, userEarned: 0, userShares: 0, pricePerShare: 1,
    tokenPrice: 2.42, stakingLimit: 0, harvestInterval: 28800, lastHarvestTime: 0,
  },
  {
    sousId: 3, poolType: 'community',
    stakingToken:  { symbol: 'CAKE', logoURI: 'https://tokens.pancakeswap.finance/images/symbol/cake.png', decimals: 18 },
    earningToken:  { symbol: 'ETH',  logoURI: 'https://tokens.pancakeswap.finance/images/symbol/eth.png',  decimals: 18 },
    contractAddress: '0x1b96B92314C44b159149f7E0303511fB2Fc4774f',
    apr: 18.91, apy: 20.84, totalStaked: 31000000, liquidity: 75020000,
    endBlock: 99999999, blocksRemaining: 9999999,
    isFinished: false, isNew: true, isHot: true, performanceFee: 0,
    userStaked: 0, userEarned: 0, userShares: 0, pricePerShare: 1,
    tokenPrice: 2.42, stakingLimit: 5000, harvestInterval: 28800, lastHarvestTime: 0,
  },
  {
    sousId: 4, poolType: 'community',
    stakingToken:  { symbol: 'CAKE', logoURI: 'https://tokens.pancakeswap.finance/images/symbol/cake.png', decimals: 18 },
    earningToken:  { symbol: 'USDT', logoURI: 'https://tokens.pancakeswap.finance/images/symbol/usdt.png', decimals: 18 },
    contractAddress: '0x9C57Bc8A0c128a3B1ebB5300e7f94bfFE35b4B78',
    apr: 9.42, apy: 9.88, totalStaked: 18000000, liquidity: 43560000,
    endBlock: 99999999, blocksRemaining: 9999999,
    isFinished: false, isNew: false, isHot: false, performanceFee: 0,
    userStaked: 0, userEarned: 0, userShares: 0, pricePerShare: 1,
    tokenPrice: 2.42, stakingLimit: 0, harvestInterval: 28800, lastHarvestTime: 0,
  },
  {
    sousId: 5, poolType: 'community',
    stakingToken:  { symbol: 'CAKE', logoURI: 'https://tokens.pancakeswap.finance/images/symbol/cake.png', decimals: 18 },
    earningToken:  { symbol: 'ADA',  logoURI: 'https://tokens.pancakeswap.finance/images/symbol/ada.png',  decimals: 18 },
    contractAddress: '0x6ab8463a4185b80905e05a9ff80a2d672f4cced8',
    apr: 22.18, apy: 24.77, totalStaked: 9500000, liquidity: 22990000,
    endBlock: 99999999, blocksRemaining: 9999999,
    isFinished: false, isNew: false, isHot: false, performanceFee: 0,
    userStaked: 0, userEarned: 0, userShares: 0, pricePerShare: 1,
    tokenPrice: 2.42, stakingLimit: 10000, harvestInterval: 28800, lastHarvestTime: 0,
  },
  {
    sousId: 6, poolType: 'community',
    stakingToken:  { symbol: 'CAKE', logoURI: 'https://tokens.pancakeswap.finance/images/symbol/cake.png', decimals: 18 },
    earningToken:  { symbol: 'DOGE', logoURI: 'https://tokens.pancakeswap.finance/images/symbol/doge.png', decimals: 8  },
    contractAddress: '0x50416827aB9B46890a82Be086Ab6A27Ff7fdCedD',
    apr: 16.54, apy: 17.99, totalStaked: 7200000, liquidity: 17424000,
    endBlock: 28000000, blocksRemaining: 240000,
    isFinished: false, isNew: false, isHot: false, performanceFee: 0,
    userStaked: 0, userEarned: 0, userShares: 0, pricePerShare: 1,
    tokenPrice: 2.42, stakingLimit: 0, harvestInterval: 28800, lastHarvestTime: 0,
  },
];

export function usePools() {
  const [pools,        setPools]       = useState<SyrupPool[]>(POOLS);
  const [search,       setSearch]      = useState('');
  const [sortBy,       setSortBy]      = useState<'hot'|'apr'|'earned'|'latest'|'totalStaked'>('hot');
  const [filterType,   setFilterType]  = useState<'all'|'auto'|'manual'|'community'>('all');
  const [stakedOnly,   setStakedOnly]  = useState(false);
  const [finishedOnly, setFinishedOnly]= useState(false);
  const [expandedId,   setExpandedId]  = useState<number|null>(null);
  const [loading,      setLoading]     = useState(false);

  // Live APR tick + earned accumulation
  useEffect(() => {
    const t = setInterval(() => {
      setPools(prev => prev.map(p => ({
        ...p,
        apr: +(p.apr * (1 + (Math.random() - 0.5) * 0.005)).toFixed(2),
        userEarned: p.userStaked > 0
          ? +(p.userEarned + (p.apr / 100 / 365 / 24 / 120) * p.userStaked).toFixed(8)
          : p.userEarned,
        pricePerShare: p.poolType === 'auto'
          ? +(p.pricePerShare * (1 + p.apr / 100 / 365 / 24 / 120)).toFixed(8)
          : p.pricePerShare,
      })));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const filtered = pools
    .filter(p => {
      if (search) {
        const q = search.toLowerCase();
        if (!p.earningToken.symbol.toLowerCase().includes(q) &&
            !p.stakingToken.symbol.toLowerCase().includes(q)) return false;
      }
      if (filterType !== 'all' && p.poolType !== filterType) return false;
      if (stakedOnly   && p.userStaked === 0)  return false;
      if (!finishedOnly && p.isFinished)        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'hot')        return (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0) || b.apr - a.apr;
      if (sortBy === 'apr')        return b.apr - a.apr;
      if (sortBy === 'earned')     return b.userEarned - a.userEarned;
      if (sortBy === 'totalStaked')return b.totalStaked - a.totalStaked;
      if (sortBy === 'latest')     return b.sousId - a.sousId;
      return 0;
    });

  const stake = useCallback(async (sousId: number, amount: number) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setPools(prev => prev.map(p => {
      if (p.sousId !== sousId) return p;
      const shares = p.poolType === 'auto' ? amount / p.pricePerShare : amount;
      return { ...p, userStaked: p.userStaked + amount, userShares: p.userShares + shares };
    }));
    setLoading(false);
  }, []);

  const unstake = useCallback(async (sousId: number, amount: number) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setPools(prev => prev.map(p => {
      if (p.sousId !== sousId) return p;
      return { ...p, userStaked: Math.max(0, p.userStaked - amount), userShares: Math.max(0, p.userShares - amount / p.pricePerShare) };
    }));
    setLoading(false);
  }, []);

  const harvest = useCallback(async (sousId: number) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setPools(prev => prev.map(p => p.sousId === sousId ? { ...p, userEarned: 0 } : p));
    setLoading(false);
  }, []);

  const compoundAll = useCallback(async (sousId: number) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setPools(prev => prev.map(p =>
      p.sousId === sousId ? { ...p, userStaked: p.userStaked + p.userEarned, userEarned: 0 } : p
    ));
    setLoading(false);
  }, []);

  return {
    pools: filtered, search, setSearch, sortBy, setSortBy,
    filterType, setFilterType, stakedOnly, setStakedOnly,
    finishedOnly, setFinishedOnly, expandedId, setExpandedId,
    loading, stake, unstake, harvest, compoundAll,
  };
}
