import { useState } from 'react';

export type BlogCategory = 'Product' | 'Tutorial' | 'Tokenomics' | 'Community' | 'Partnership' | 'Security';

export interface BlogPost {
  id:          string;
  title:       string;
  slug:        string;
  excerpt:     string;
  body:        string;
  author:      string;
  authorAvatar:string;
  category:    BlogCategory;
  tags:        string[];
  publishedAt: number;
  readTime:    number;  // minutes
  coverEmoji:  string;
  featured:    boolean;
  views:       number;
  likes:       number;
}

const NOW = Date.now();
const DAY = 86_400_000;

export const POSTS: BlogPost[] = [
  {
    id:'1', title:'PancakeSwap V4: The Future of DEX Trading',
    slug:'pancakeswap-v4-announcement',
    excerpt:'We\'re thrilled to announce PancakeSwap V4 — a complete overhaul of our AMM architecture bringing concentrated liquidity, hooks, and 10x better capital efficiency.',
    body:`# PancakeSwap V4: The Future of DEX Trading\n\nToday we're announcing PancakeSwap V4, the most ambitious upgrade in our history.\n\n## What's New in V4\n\n### Concentrated Liquidity\nLiquidity providers can now concentrate their capital within specific price ranges, earning up to 10x more fees.\n\n### Hooks Architecture\nDevelopers can now build custom AMM logic directly into liquidity pools using our new hooks system.\n\n### Lower Gas Fees\nV4's singleton architecture reduces gas costs by up to 99% for complex multi-hop swaps.\n\n## Timeline\n- Testnet: Q1 2025\n- Mainnet: Q2 2025\n\nStay tuned for more updates!`,
    author:'PancakeSwap Team', authorAvatar:'🥞',
    category:'Product', tags:['V4','AMM','Concentrated Liquidity'],
    publishedAt:NOW - DAY, readTime:5, coverEmoji:'🚀',
    featured:true, views:42800, likes:1840,
  },
  {
    id:'2', title:'How to Maximize Your Yield Farming Returns in 2025',
    slug:'maximize-yield-farming-2025',
    excerpt:'A comprehensive guide to getting the most out of PancakeSwap farms — covering impermanent loss, optimal strategies, and new farm multipliers.',
    body:`# How to Maximize Your Yield Farming Returns in 2025\n\nYield farming on PancakeSwap can be highly profitable if approached correctly.\n\n## Understanding APR vs APY\n\nAPR is the simple annual rate, while APY accounts for compounding. Always compare APY when evaluating farms.\n\n## Impermanent Loss\n\nIL occurs when the price ratio of your LP tokens changes. Stable pairs like USDT-BUSD have minimal IL.\n\n## Best Strategies\n\n1. Start with high-multiplier core farms\n2. Auto-compound your CAKE rewards daily\n3. Use Syrup Pools for single-asset staking\n4. Diversify across multiple farms\n\n## Risk Management\n\nNever invest more than you can afford to lose. Start small and learn the mechanics.`,
    author:'DeFi Research', authorAvatar:'📊',
    category:'Tutorial', tags:['Farming','Yield','Strategy'],
    publishedAt:NOW - DAY*2, readTime:8, coverEmoji:'🌾',
    featured:true, views:31200, likes:1240,
  },
  {
    id:'3', title:'CAKE Tokenomics Update: New Burn Mechanisms',
    slug:'cake-tokenomics-burn-update',
    excerpt:'We\'re introducing two new CAKE burn mechanisms that will significantly reduce circulating supply and boost long-term token value.',
    body:`# CAKE Tokenomics Update\n\nPancakeSwap is strengthening CAKE's deflationary mechanics with two new burn mechanisms.\n\n## New Burn Sources\n\n### Protocol Revenue Burns\n5% of all protocol revenue will be used to buy and burn CAKE weekly.\n\n### Auto-Burn on Swaps\nEvery swap on PancakeSwap V3 now contributes a tiny fraction to continuous auto-burns.\n\n## Impact Analysis\n\nBased on current volumes, these new mechanisms are expected to burn an additional 15-20M CAKE annually.`,
    author:'PancakeSwap Team', authorAvatar:'🥞',
    category:'Tokenomics', tags:['CAKE','Burn','Tokenomics'],
    publishedAt:NOW - DAY*4, readTime:4, coverEmoji:'🔥',
    featured:false, views:18600, likes:892,
  },
  {
    id:'4', title:'PancakeSwap x Binance: Expanded Partnership',
    slug:'pancakeswap-binance-partnership',
    excerpt:'We\'re deepening our partnership with Binance to bring more users to DeFi, with exclusive liquidity incentives and co-marketing initiatives.',
    body:`# PancakeSwap x Binance Expanded Partnership\n\nWe're thrilled to announce an expanded strategic partnership with Binance.\n\n## What This Means\n\n- Binance users get seamless access to PancakeSwap\n- Exclusive CAKE rewards for Binance Web3 Wallet users\n- Co-marketing campaigns reaching 150M+ users\n\n## Launch Timeline\n\nThe integration goes live on March 1st, 2025.`,
    author:'Business Dev', authorAvatar:'🤝',
    category:'Partnership', tags:['Binance','Partnership','Integration'],
    publishedAt:NOW - DAY*6, readTime:3, coverEmoji:'🤝',
    featured:false, views:28400, likes:1620,
  },
  {
    id:'5', title:'Security Audit Results: PancakeSwap V3 Passes with Zero Critical Issues',
    slug:'v3-security-audit-results',
    excerpt:'PancakeSwap V3 smart contracts have been audited by three leading security firms with zero critical vulnerabilities found.',
    body:`# Security Audit Results\n\nWe're proud to share the results of our comprehensive PancakeSwap V3 security audit.\n\n## Audit Partners\n\n- **Trail of Bits**: Zero critical, zero high issues\n- **Certik**: Passed with full score\n- **Quantstamp**: Zero critical findings\n\n## Scope\n\nAll V3 contracts including factory, router, position manager, and oracle were audited.\n\n## Our Commitment\n\nSecurity is our #1 priority. We conduct quarterly audits and maintain a $1M bug bounty program.`,
    author:'Security Team', authorAvatar:'🔒',
    category:'Security', tags:['Audit','Security','V3'],
    publishedAt:NOW - DAY*9, readTime:6, coverEmoji:'🔒',
    featured:false, views:14200, likes:640,
  },
  {
    id:'6', title:'Community Recap: January 2025 — Record $4.2B TVL',
    slug:'community-recap-january-2025',
    excerpt:'January 2025 was our biggest month ever with record TVL, volume, and over 1.2 million new users joining PancakeSwap.',
    body:`# Community Recap: January 2025\n\nJanuary 2025 was a historic month for PancakeSwap!\n\n## Key Milestones\n\n- 🏆 $4.2B TVL — all-time high\n- 📈 $38B monthly trading volume\n- 👥 1.2M new unique users\n- 🔥 12.4M CAKE burned\n\n## Top Farms\n\nThe CAKE-BNB farm saw the highest volume and liquidity additions of any month.\n\n## Looking Ahead\n\nFebruary brings exciting new partnerships and the upcoming V4 testnet launch.`,
    author:'Community', authorAvatar:'🌍',
    category:'Community', tags:['Recap','Community','TVL'],
    publishedAt:NOW - DAY*12, readTime:5, coverEmoji:'🌍',
    featured:false, views:22100, likes:1180,
  },
];

export function useBlog() {
  const [posts]          = useState<BlogPost[]>(POSTS);
  const [activeCategory, setActiveCategory] = useState<BlogCategory | 'All'>('All');
  const [search,         setSearch]         = useState('');
  const [selectedPost,   setSelectedPost]   = useState<BlogPost | null>(null);
  const [likedPosts,     setLikedPosts]     = useState<Set<string>>(new Set());

  const categories: (BlogCategory | 'All')[] = [
    'All', 'Product', 'Tutorial', 'Tokenomics', 'Community', 'Partnership', 'Security',
  ];

  const filtered = posts.filter(p => {
    if (activeCategory !== 'All' && p.category !== activeCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.excerpt.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const featured    = posts.filter(p => p.featured);
  const recent      = posts.filter(p => !p.featured).slice(0, 4);

  const toggleLike  = (id: string) => {
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return {
    posts: filtered, featured, recent, categories,
    activeCategory, setActiveCategory, search, setSearch,
    selectedPost, setSelectedPost, likedPosts, toggleLike,
  };
}
