import { useState, useEffect, useCallback } from 'react';

export type LotteryStatus = 'open' | 'closed' | 'claimable';

export interface LotteryRound {
  id:            number;
  status:        LotteryStatus;
  startTime:     number;
  endTime:       number;
  ticketPrice:   number;   // in CAKE
  totalTickets:  number;
  totalPrize:    number;   // in CAKE
  winningNumbers: number[]; // 6 numbers 0-9
  prizePools:    number[];  // [match6, match5, match4, match3, match2, match1] in CAKE
  prizePerBracket: number[];
  countWinners:  number[];
  burnAmount:    number;
  treasuryAmount:number;
}

export interface UserTicket {
  id:       number;
  numbers:  number[];
  roundId:  number;
  claimed:  boolean;
  winBracket: number; // 0=no win, 1-6=brackets
}

const NOW = Date.now();
const DAY = 86400000;

function makeRound(id: number, status: LotteryStatus, endOffset: number): LotteryRound {
  const winNums = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10));
  const totalPool = 45000 + Math.random() * 20000;
  const pools = [
    totalPool * 0.40,
    totalPool * 0.20,
    totalPool * 0.10,
    totalPool * 0.05,
    totalPool * 0.035,
    totalPool * 0.025,
  ];
  return {
    id,
    status,
    startTime:   NOW - DAY * 3,
    endTime:     NOW + endOffset,
    ticketPrice: 2.50,
    totalTickets: 142000 + Math.floor(Math.random() * 20000),
    totalPrize:   totalPool,
    winningNumbers: winNums,
    prizePools:   pools,
    prizePerBracket: pools.map((p, i) => p / Math.max(1, [1,3,12,40,200,500][i])),
    countWinners: [1, 3, 12, 40, 200, 500],
    burnAmount:   totalPool * 0.20,
    treasuryAmount: totalPool * 0.10,
  };
}

const ROUNDS: LotteryRound[] = [
  makeRound(1042, 'open',      DAY * 1.5),
  makeRound(1041, 'claimable', -DAY),
  makeRound(1040, 'claimable', -DAY * 4),
  makeRound(1039, 'claimable', -DAY * 7),
];

const PRIZE_LABELS = [
  'Match all 6',
  'Match first 5',
  'Match first 4',
  'Match first 3',
  'Match first 2',
  'Match first 1',
];

const PRIZE_COLORS = ['#FFD700','#C0C0C0','#CD7F32','#1FC7D4','#7645D9','#ED4B9E'];

export function useLottery() {
  const [rounds,        setRounds]       = useState<LotteryRound[]>(ROUNDS);
  const [userTickets,   setUserTickets]  = useState<UserTicket[]>([]);
  const [activeRound,   setActiveRound]  = useState<LotteryRound>(ROUNDS[0]);
  const [buyCount,      setBuyCount]     = useState(1);
  const [buying,        setBuying]       = useState(false);
  const [claiming,      setClaiming]     = useState(false);
  const [viewHistory,   setViewHistory]  = useState(false);
  const [countdown,     setCountdown]    = useState('');
  const [editTickets,   setEditTickets]  = useState<number[][]>([]);
  const [randomizeAll,  setRandomizeAll] = useState(true);

  // Countdown timer
  useEffect(() => {
    const tick = () => {
      const open = rounds.find(r => r.status === 'open');
      if (!open) return;
      const ms   = open.endTime - Date.now();
      if (ms <= 0) { setCountdown('00h 00m 00s'); return; }
      const h = Math.floor(ms / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      const s = Math.floor((ms % 60000) / 1000);
      setCountdown(`${h.toString().padStart(2,'0')}h ${m.toString().padStart(2,'0')}m ${s.toString().padStart(2,'0')}s`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [rounds]);

  // Grow prize pool
  useEffect(() => {
    const t = setInterval(() => {
      setRounds(prev => prev.map(r =>
        r.status === 'open'
          ? { ...r, totalPrize: r.totalPrize + Math.random() * 5, totalTickets: r.totalTickets + Math.floor(Math.random() * 3) }
          : r
      ));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  // Sync active round
  useEffect(() => {
    const found = rounds.find(r => r.id === activeRound.id);
    if (found) setActiveRound(found);
  }, [rounds, activeRound.id]);

  // Generate edit tickets when buyCount changes
  useEffect(() => {
    setEditTickets(Array.from({ length: buyCount }, () =>
      Array.from({ length: 6 }, () => Math.floor(Math.random() * 10))
    ));
  }, [buyCount]);

  const randomizeTicket = useCallback((idx: number) => {
    setEditTickets(prev => prev.map((t, i) =>
      i === idx ? Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)) : t
    ));
  }, []);

  const updateTicketNumber = useCallback((ticketIdx: number, numIdx: number, val: number) => {
    setEditTickets(prev => prev.map((t, i) =>
      i === ticketIdx ? t.map((n, j) => j === numIdx ? Math.min(9, Math.max(0, val)) : n) : t
    ));
  }, []);

  const buyTickets = useCallback(async () => {
    setBuying(true);
    await new Promise(r => setTimeout(r, 1400));
    const newTickets: UserTicket[] = editTickets.map((nums, i) => ({
      id:         Date.now() + i,
      numbers:    nums,
      roundId:    activeRound.id,
      claimed:    false,
      winBracket: 0,
    }));
    setUserTickets(prev => [...prev, ...newTickets]);
    setRounds(prev => prev.map(r =>
      r.id === activeRound.id
        ? { ...r, totalTickets: r.totalTickets + buyCount, totalPrize: r.totalPrize + buyCount * r.ticketPrice * 0.8 }
        : r
    ));
    setBuyCount(1);
    setBuying(false);
  }, [editTickets, activeRound.id, buyCount]);

  const claimTickets = useCallback(async (roundId: number) => {
    setClaiming(true);
    await new Promise(r => setTimeout(r, 1000));
    setUserTickets(prev => prev.map(t =>
      t.roundId === roundId ? { ...t, claimed: true } : t
    ));
    setClaiming(false);
  }, []);

  const matchCount = (ticket: number[], winning: number[]): number => {
    let count = 0;
    for (let i = 0; i < 6; i++) {
      if (ticket[i] === winning[i]) count++;
      else break;
    }
    return count;
  };

  const totalCost = (buyCount * (rounds.find(r => r.status === 'open')?.ticketPrice || 2.5)).toFixed(3);

  return {
    rounds, activeRound, setActiveRound, userTickets,
    buyCount, setBuyCount, buying, claiming,
    editTickets, randomizeTicket, updateTicketNumber, randomizeAll, setRandomizeAll,
    buyTickets, claimTickets, countdown, viewHistory, setViewHistory,
    matchCount, totalCost, PRIZE_LABELS, PRIZE_COLORS,
  };
}
