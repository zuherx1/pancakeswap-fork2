import { useState, useEffect } from 'react';
import { ChartPoint } from './useInfo';

export interface BurnEvent {
  tx:        string;
  amount:    number;
  usdValue:  number;
  timestamp: number;
  type:      'weekly' | 'auto' | 'manual';
}

function makeBurnHistory(): ChartPoint[] {
  const points: ChartPoint[] = [];
  let cumulative = 120000000;
  for (let i = 52; i >= 0; i--) {
    cumulative += 1800000 + Math.random() * 600000;
    points.push({ time: Date.now() - i * 7 * 86400000, value: cumulative });
  }
  return points;
}

function makeWeeklyBurns(): ChartPoint[] {
  const points: ChartPoint[] = [];
  for (let i = 20; i >= 0; i--) {
    points.push({ time: Date.now() - i * 7 * 86400000, value: 1800000 + Math.random() * 800000 });
  }
  return points;
}

const BURN_EVENTS: BurnEvent[] = [
  { tx:'0xabc...111', amount:2840000, usdValue:6872800, timestamp:Date.now()-86400000*1,  type:'weekly' },
  { tx:'0xdef...222', amount:180400,  usdValue:436568,  timestamp:Date.now()-86400000*2,  type:'auto'   },
  { tx:'0xabc...333', amount:2410000, usdValue:5832200, timestamp:Date.now()-86400000*8,  type:'weekly' },
  { tx:'0xdef...444', amount:165200,  usdValue:399784,  timestamp:Date.now()-86400000*9,  type:'auto'   },
  { tx:'0xabc...555', amount:3120000, usdValue:7550400, timestamp:Date.now()-86400000*15, type:'weekly' },
  { tx:'0xdef...666', amount:201800,  usdValue:488356,  timestamp:Date.now()-86400000*16, type:'auto'   },
  { tx:'0xabc...777', amount:2680000, usdValue:6484800, timestamp:Date.now()-86400000*22, type:'weekly' },
  { tx:'0xabc...888', amount:2950000, usdValue:7138000, timestamp:Date.now()-86400000*29, type:'weekly' },
];

export function useBurn() {
  const [totalBurned,  setTotalBurned]  = useState(152_480_312);
  const [burnHistory,  setBurnHistory]  = useState<ChartPoint[]>(makeBurnHistory());
  const [weeklyBurns,  setWeeklyBurns]  = useState<ChartPoint[]>(makeWeeklyBurns());
  const [burnEvents,   setBurnEvents]   = useState<BurnEvent[]>(BURN_EVENTS);
  const [cakePrice,    setCakePrice]    = useState(2.42);
  const [totalSupply,  setTotalSupply]  = useState(388_000_000);
  const [maxSupply]                     = useState(750_000_000);

  // Live burn simulation
  useEffect(() => {
    const t = setInterval(() => {
      const autoBurn = Math.random() * 50;
      setTotalBurned(prev => {
        const next = prev + autoBurn;
        setBurnHistory(h => {
          const last = h[h.length - 1];
          return [...h.slice(0, -1), { ...last, value: last.value + autoBurn }];
        });
        return next;
      });
      setTotalSupply(prev => prev - autoBurn);
      setCakePrice(prev => +(prev + (Math.random() - 0.498) * 0.02).toFixed(4));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const burnedUSD     = totalBurned * cakePrice;
  const burnedPct     = (totalBurned / maxSupply) * 100;
  const circulatingSup= totalSupply - totalBurned;
  const weeklyBurnAvg = BURN_EVENTS.filter(e => e.type === 'weekly').reduce((s, e) => s + e.amount, 0) / 4;
  const autoBurnDay   = 180000;

  return {
    totalBurned, burnedUSD, burnedPct,
    totalSupply, maxSupply, circulatingSup,
    cakePrice, weeklyBurnAvg, autoBurnDay,
    burnHistory, weeklyBurns, burnEvents,
  };
}
