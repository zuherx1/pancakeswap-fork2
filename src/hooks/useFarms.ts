import { useState, useEffect, useCallback } from 'react';

export interface Farm {
  pid:           number;
  lpSymbol:      string;
  lpAddress:     string;
  token0:        { symbol: string; logoURI: string };
  token1:        { symbol: string; logoURI: string };
  apr:           number;
  apy:           number;
  liquidity:     number;
  multiplier:    string;
  isCore:        boolean;
  isCommunity:   boolean;
  isNew:         boolean;
  isHot:         boolean;
  depositFee:    number;
  earnToken:     string;
  userStaked:    number;
  userEarned:    number;
  userLPBalance: number;
  totalStaked:   number;
  tokenPrice:    number;
  cakePerBlock:  number;
}

const BASE_FARMS: Farm[] = [
  { pid:0,  lpSymbol:'CAKE-BNB LP',   lpAddress:'0x0eD7e52944161450477ee417DE9Cd3a859b14fD0', token0:{symbol:'CAKE', logoURI:'https://tokens.pancakeswap.finance/images/symbol/cake.png'},  token1:{symbol:'BNB',  logoURI:'https://tokens.pancakeswap.finance/images/symbol/bnb.png'},   apr:42.18, apy:52.41, liquidity:284000000, multiplier:'40X', isCore:true,  isCommunity:false, isNew:false, isHot:true,  depositFee:0,   earnToken:'CAKE', userStaked:0, userEarned:0, userLPBalance:0, totalStaked:14200000, tokenPrice:2.42, cakePerBlock:0.2 },
  { pid:1,  lpSymbol:'BNB-BUSD LP',   lpAddress:'0x58F876857a02D6762E0101bb5C46A8c1ED44Dc16', token0:{symbol:'BNB',  logoURI:'https://tokens.pancakeswap.finance/images/symbol/bnb.png'},   token1:{symbol:'BUSD', logoURI:'https://tokens.pancakeswap.finance/images/symbol/busd.png'},  apr:18.54, apy:20.32, liquidity:520000000, multiplier:'20X', isCore:true,  isCommunity:false, isNew:false, isHot:false, depositFee:0,   earnToken:'CAKE', userStaked:0, userEarned:0, userLPBalance:0, totalStaked:26000000, tokenPrice:2.42, cakePerBlock:0.1 },
  { pid:2,  lpSymbol:'USDT-BUSD LP',  lpAddress:'0x7EFaEf62fDdCCa950418312c6C702357a7cf9bff', token0:{symbol:'USDT', logoURI:'https://tokens.pancakeswap.finance/images/symbol/usdt.png'},  token1:{symbol:'BUSD', logoURI:'https://tokens.pancakeswap.finance/images/symbol/busd.png'},  apr:8.21,  apy:8.56,  liquidity:890000000, multiplier:'10X', isCore:true,  isCommunity:false, isNew:false, isHot:false, depositFee:0,   earnToken:'CAKE', userStaked:0, userEarned:0, userLPBalance:0, totalStaked:44500000, tokenPrice:2.42, cakePerBlock:0.05 },
  { pid:3,  lpSymbol:'ETH-BNB LP',    lpAddress:'0x74E4716E431f45807DCF19f284c7aA99F18a4fbc', token0:{symbol:'ETH',  logoURI:'https://tokens.pancakeswap.finance/images/symbol/eth.png'},   token1:{symbol:'BNB',  logoURI:'https://tokens.pancakeswap.finance/images/symbol/bnb.png'},   apr:24.67, apy:27.92, liquidity:312000000, multiplier:'25X', isCore:true,  isCommunity:false, isNew:true,  isHot:false, depositFee:0,   earnToken:'CAKE', userStaked:0, userEarned:0, userLPBalance:0, totalStaked:15600000, tokenPrice:2.42, cakePerBlock:0.15 },
  { pid:4,  lpSymbol:'BTCB-BNB LP',   lpAddress:'0x61EB789d75A95CAa3fF50ed7E47b96c132fEc082', token0:{symbol:'BTCB', logoURI:'https://tokens.pancakeswap.finance/images/symbol/btcb.png'},  token1:{symbol:'BNB',  logoURI:'https://tokens.pancakeswap.finance/images/symbol/bnb.png'},   apr:21.33, apy:23.78, liquidity:198000000, multiplier:'20X', isCore:true,  isCommunity:false, isNew:false, isHot:false, depositFee:0,   earnToken:'CAKE', userStaked:0, userEarned:0, userLPBalance:0, totalStaked:9900000,  tokenPrice:2.42, cakePerBlock:0.12 },
  { pid:5,  lpSymbol:'USDC-BUSD LP',  lpAddress:'0x2354ef4DF11afacb85a5C7f98B624072ECcddbB1', token0:{symbol:'USDC', logoURI:'https://tokens.pancakeswap.finance/images/symbol/usdc.png'},  token1:{symbol:'BUSD', logoURI:'https://tokens.pancakeswap.finance/images/symbol/busd.png'},  apr:7.88,  apy:8.19,  liquidity:672000000, multiplier:'8X',  isCore:true,  isCommunity:false, isNew:false, isHot:false, depositFee:0,   earnToken:'CAKE', userStaked:0, userEarned:0, userLPBalance:0, totalStaked:33600000, tokenPrice:2.42, cakePerBlock:0.04 },
  { pid:6,  lpSymbol:'ADA-BNB LP',    lpAddress:'0xBA51D1AB95756ca4eaB8197eC8e3241D4cAac07d', token0:{symbol:'ADA',  logoURI:'https://tokens.pancakeswap.finance/images/symbol/ada.png'},   token1:{symbol:'BNB',  logoURI:'https://tokens.pancakeswap.finance/images/symbol/bnb.png'},   apr:31.44, apy:36.89, liquidity:87000000,  multiplier:'15X', isCore:false, isCommunity:true,  isNew:false, isHot:false, depositFee:0.5, earnToken:'CAKE', userStaked:0, userEarned:0, userLPBalance:0, totalStaked:4350000,  tokenPrice:2.42, cakePerBlock:0.08 },
  { pid:7,  lpSymbol:'MATIC-BNB LP',  lpAddress:'0x7A6B6b9f2b78ddb2F9A7B5d15F8B60a348B29Aa',  token0:{symbol:'MATIC',logoURI:'https://tokens.pancakeswap.finance/images/symbol/matic.png'}, token1:{symbol:'BNB',  logoURI:'https://tokens.pancakeswap.finance/images/symbol/bnb.png'},   apr:28.91, apy:33.48, liquidity:64000000,  multiplier:'12X', isCore:false, isCommunity:true,  isNew:true,  isHot:false, depositFee:0.5, earnToken:'CAKE', userStaked:0, userEarned:0, userLPBalance:0, totalStaked:3200000,  tokenPrice:2.42, cakePerBlock:0.07 },
  { pid:8,  lpSymbol:'DOGE-BNB LP',   lpAddress:'0xac109C8025F272414fd9e2faA805a583708A017f', token0:{symbol:'DOGE', logoURI:'https://tokens.pancakeswap.finance/images/symbol/doge.png'},  token1:{symbol:'BNB',  logoURI:'https://tokens.pancakeswap.finance/images/symbol/bnb.png'},   apr:19.22, apy:21.23, liquidity:42000000,  multiplier:'8X',  isCore:false, isCommunity:true,  isNew:false, isHot:false, depositFee:0.5, earnToken:'CAKE', userStaked:0, userEarned:0, userLPBalance:0, totalStaked:2100000,  tokenPrice:2.42, cakePerBlock:0.05 },
];

export function useFarms() {
  const [farms,       setFarms]       = useState<Farm[]>(BASE_FARMS);
  const [search,      setSearch]      = useState('');
  const [sortBy,      setSortBy]      = useState<'hot'|'apr'|'earned'|'liquidity'|'latest'>('hot');
  const [filterType,  setFilterType]  = useState<'all'|'core'|'community'>('all');
  const [stakedOnly,  setStakedOnly]  = useState(false);
  const [expandedPid, setExpandedPid] = useState<number|null>(null);
  const [loading,     setLoading]     = useState(false);

  // Simulate APR fluctuation
  useEffect(() => {
    const t = setInterval(() => {
      setFarms(prev => prev.map(f => ({
        ...f,
        apr: +(f.apr * (1 + (Math.random() - 0.5) * 0.01)).toFixed(2),
        userEarned: f.userStaked > 0
          ? +(f.userEarned + f.cakePerBlock * 0.001).toFixed(6)
          : f.userEarned,
      })));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const filtered = farms
    .filter(f => {
      if (search) {
        const q = search.toLowerCase();
        if (!f.lpSymbol.toLowerCase().includes(q)) return false;
      }
      if (filterType === 'core'      && !f.isCore)      return false;
      if (filterType === 'community' && !f.isCommunity) return false;
      if (stakedOnly && f.userStaked === 0)             return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'hot')       return (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0);
      if (sortBy === 'apr')       return b.apr - a.apr;
      if (sortBy === 'earned')    return b.userEarned - a.userEarned;
      if (sortBy === 'liquidity') return b.liquidity - a.liquidity;
      if (sortBy === 'latest')    return b.pid - a.pid;
      return 0;
    });

  const stake = useCallback(async (pid: number, amount: number) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setFarms(prev => prev.map(f =>
      f.pid === pid ? { ...f, userStaked: f.userStaked + amount, userLPBalance: Math.max(0, f.userLPBalance - amount) } : f
    ));
    setLoading(false);
  }, []);

  const unstake = useCallback(async (pid: number, amount: number) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setFarms(prev => prev.map(f =>
      f.pid === pid ? { ...f, userStaked: Math.max(0, f.userStaked - amount), userLPBalance: f.userLPBalance + amount } : f
    ));
    setLoading(false);
  }, []);

  const harvest = useCallback(async (pid: number) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setFarms(prev => prev.map(f =>
      f.pid === pid ? { ...f, userEarned: 0 } : f
    ));
    setLoading(false);
  }, []);

  return {
    farms: filtered, search, setSearch, sortBy, setSortBy,
    filterType, setFilterType, stakedOnly, setStakedOnly,
    expandedPid, setExpandedPid, loading, stake, unstake, harvest,
  };
}
