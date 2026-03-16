import { useState, useEffect, useCallback, useRef } from 'react';

export type RoundStatus = 'live' | 'next' | 'expired' | 'cancelled';
export type BetSide     = 'bull' | 'bear';

export interface Round {
  epoch:        number;
  status:       RoundStatus;
  lockPrice:    number;
  closePrice:   number;
  bullAmount:   number;
  bearAmount:   number;
  totalAmount:  number;
  rewardAmount: number;
  startTime:    number;
  lockTime:     number;
  closeTime:    number;
  oraclePrice:  number;
  userBet?:     { side: BetSide; amount: number; claimed: boolean };
}

export interface PricePoint { time: number; price: number; }

const ROUND_DURATION = 300; // 5 min in seconds
const INTERVAL_SECS  = 5;

function makeRound(epoch: number, now: number, basePrice: number, status: RoundStatus): Round {
  const spread   = (Math.random() - 0.5) * 40;
  const lock     = +(basePrice + spread).toFixed(2);
  const close    = status === 'expired' ? +(lock + (Math.random() - 0.5) * 30).toFixed(2) : 0;
  const bull     = +(Math.random() * 8000 + 2000).toFixed(2);
  const bear     = +(Math.random() * 8000 + 2000).toFixed(2);
  const total    = +(bull + bear).toFixed(2);
  const treasury = total * 0.03;
  const offsetSec= status === 'live'    ? -60
                 : status === 'next'    ? ROUND_DURATION
                 : -ROUND_DURATION * 2;
  return {
    epoch,
    status,
    lockPrice:   lock,
    closePrice:  close,
    bullAmount:  bull,
    bearAmount:  bear,
    totalAmount: total,
    rewardAmount: +(total - treasury).toFixed(2),
    startTime:   now + offsetSec - ROUND_DURATION,
    lockTime:    now + offsetSec,
    closeTime:   now + offsetSec + ROUND_DURATION,
    oraclePrice: lock,
  };
}

export function usePrediction() {
  const [markPrice,    setMarkPrice]    = useState(582.40);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [rounds,       setRounds]       = useState<Round[]>([]);
  const [timeLeft,     setTimeLeft]     = useState(ROUND_DURATION);
  const [selectedSide, setSelectedSide] = useState<BetSide | null>(null);
  const [betAmount,    setBetAmount]    = useState('');
  const [placing,      setPlacing]      = useState(false);
  const [claiming,     setClaiming]     = useState(false);
  const [chartType,    setChartType]    = useState<'line'|'candle'>('line');
  const [activeCard,   setActiveCard]   = useState<number | null>(null);
  const epochRef = useRef(100);

  // Init rounds
  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    const base = 582.40;
    const initial: Round[] = [
      makeRound(epochRef.current - 3, now, base, 'expired'),
      makeRound(epochRef.current - 2, now, base, 'expired'),
      makeRound(epochRef.current - 1, now, base, 'expired'),
      makeRound(epochRef.current,     now, base, 'live'),
      makeRound(epochRef.current + 1, now, base, 'next'),
    ];
    setRounds(initial);

    // Init price history
    const history: PricePoint[] = [];
    let p = base * 0.97;
    for (let i = 60; i >= 0; i--) {
      p = +(p + (Math.random() - 0.495) * 3).toFixed(2);
      history.push({ time: Date.now() - i * 5000, price: p });
    }
    setPriceHistory(history);
  }, []);

  // Live price tick
  useEffect(() => {
    const t = setInterval(() => {
      setMarkPrice(prev => {
        const next = +(prev + (Math.random() - 0.495) * 1.8).toFixed(2);
        setPriceHistory(h => [...h.slice(-80), { time: Date.now(), price: next }]);
        // Update live round oracle price
        setRounds(rs => rs.map(r =>
          r.status === 'live' ? { ...r, oraclePrice: next } : r
        ));
        return next;
      });
    }, INTERVAL_SECS * 1000);
    return () => clearInterval(t);
  }, []);

  // Countdown + round rotation
  useEffect(() => {
    const t = setInterval(() => {
      setRounds(prev => {
        const live = prev.find(r => r.status === 'live');
        if (!live) return prev;
        const now      = Math.floor(Date.now() / 1000);
        const remaining = live.lockTime - now;
        setTimeLeft(Math.max(remaining, 0));

        if (remaining <= 0) {
          // Expire live → close it, promote next → live, create new next
          epochRef.current += 1;
          const base    = live.oraclePrice;
          const newNext = makeRound(epochRef.current + 1, now, base, 'next');
          return prev.map(r => {
            if (r.status === 'live') {
              return { ...r, status: 'expired' as RoundStatus, closePrice: base };
            }
            if (r.status === 'next') {
              return { ...r, status: 'live' as RoundStatus, lockTime: now + ROUND_DURATION, closeTime: now + ROUND_DURATION * 2 };
            }
            return r;
          }).concat(newNext).slice(-6);
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const placeBet = useCallback(async (epoch: number, side: BetSide, amount: number) => {
    setPlacing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRounds(prev => prev.map(r =>
      r.epoch === epoch
        ? {
            ...r,
            userBet: { side, amount, claimed: false },
            bullAmount: side === 'bull' ? r.bullAmount + amount : r.bullAmount,
            bearAmount: side === 'bear' ? r.bearAmount + amount : r.bearAmount,
            totalAmount: r.totalAmount + amount,
          }
        : r
    ));
    setPlacing(false);
    setSelectedSide(null);
    setBetAmount('');
  }, []);

  const claimWinnings = useCallback(async (epoch: number) => {
    setClaiming(true);
    await new Promise(r => setTimeout(r, 800));
    setRounds(prev => prev.map(r =>
      r.epoch === epoch && r.userBet
        ? { ...r, userBet: { ...r.userBet, claimed: true } }
        : r
    ));
    setClaiming(false);
  }, []);

  const getPayoutMultiplier = (round: Round, side: BetSide) => {
    if (side === 'bull') return round.bullAmount > 0 ? (round.rewardAmount / round.bullAmount).toFixed(2) : '0';
    return round.bearAmount > 0 ? (round.rewardAmount / round.bearAmount).toFixed(2) : '0';
  };

  const isWinner = (round: Round): boolean => {
    if (!round.userBet || round.status !== 'expired') return false;
    const bullWon = round.closePrice > round.lockPrice;
    return (bullWon && round.userBet.side === 'bull') || (!bullWon && round.userBet.side === 'bear');
  };

  return {
    markPrice, priceHistory, rounds, timeLeft,
    selectedSide, setSelectedSide, betAmount, setBetAmount,
    placing, claiming, chartType, setChartType,
    activeCard, setActiveCard,
    placeBet, claimWinnings, getPayoutMultiplier, isWinner,
  };
}
