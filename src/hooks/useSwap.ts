import { useState, useCallback, useEffect } from 'react';
import { BSC_TOKENS, Token } from '../constants/tokens';

export interface SwapState {
  inputToken: Token;
  outputToken: Token;
  inputAmount: string;
  outputAmount: string;
  slippage: number;
  deadline: number;
  priceImpact: string;
  minimumReceived: string;
  fee: string;
  route: string[];
  loading: boolean;
  error: string | null;
  exchangeRate: string;
}

const DEFAULT_INPUT  = BSC_TOKENS.find(t => t.symbol === 'BNB')!;
const DEFAULT_OUTPUT = BSC_TOKENS.find(t => t.symbol === 'CAKE')!;

// Simulated price feed (replace with real DEX router calls)
const MOCK_PRICES: Record<string, number> = {
  BNB: 580, WBNB: 580, CAKE: 2.4, BUSD: 1, USDT: 1,
  USDC: 1, ETH: 3200, BTCB: 67000, DAI: 1, ADA: 0.45,
  MATIC: 0.72, DOGE: 0.16,
};

export function useSwap() {
  const [state, setState] = useState<SwapState>({
    inputToken:       DEFAULT_INPUT,
    outputToken:      DEFAULT_OUTPUT,
    inputAmount:      '',
    outputAmount:     '',
    slippage:         0.5,
    deadline:         20,
    priceImpact:      '0.00',
    minimumReceived:  '0',
    fee:              '0',
    route:            [],
    loading:          false,
    error:            null,
    exchangeRate:     '0',
  });

  // Recalculate output whenever input changes
  useEffect(() => {
    if (!state.inputAmount || isNaN(Number(state.inputAmount))) {
      setState(s => ({ ...s, outputAmount: '', priceImpact: '0.00', minimumReceived: '0', fee: '0' }));
      return;
    }

    const inPrice  = MOCK_PRICES[state.inputToken.symbol]  || 1;
    const outPrice = MOCK_PRICES[state.outputToken.symbol] || 1;
    const inUSD    = Number(state.inputAmount) * inPrice;
    const rawOut   = inUSD / outPrice;

    // Simulate price impact
    const impact = Math.min((Number(state.inputAmount) * inPrice) / 10_000_000 * 100, 15);
    const afterImpact = rawOut * (1 - impact / 100);

    // 0.25% fee
    const fee     = rawOut * 0.0025;
    const netOut  = afterImpact - fee;
    const minRecv = netOut * (1 - state.slippage / 100);
    const rate    = outPrice > 0 ? (inPrice / outPrice).toFixed(6) : '0';

    setState(s => ({
      ...s,
      outputAmount:    netOut.toFixed(6),
      priceImpact:     impact.toFixed(2),
      minimumReceived: minRecv.toFixed(6),
      fee:             fee.toFixed(6),
      exchangeRate:    rate,
      route:           impact > 1
        ? [s.inputToken.symbol, 'WBNB', s.outputToken.symbol]
        : [s.inputToken.symbol, s.outputToken.symbol],
      error: impact > 5 ? 'High price impact!' : null,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.inputAmount, state.inputToken.symbol, state.outputToken.symbol, state.slippage]);

  const setInputToken  = useCallback((t: Token) => setState(s => ({ ...s, inputToken: t,  inputAmount: '', outputAmount: '' })), []);
  const setOutputToken = useCallback((t: Token) => setState(s => ({ ...s, outputToken: t, inputAmount: '', outputAmount: '' })), []);
  const setInputAmount = useCallback((v: string) => setState(s => ({ ...s, inputAmount: v })), []);
  const setSlippage    = useCallback((v: number) => setState(s => ({ ...s, slippage: v })), []);
  const setDeadline    = useCallback((v: number) => setState(s => ({ ...s, deadline: v })), []);

  const switchTokens = useCallback(() => {
    setState(s => ({
      ...s,
      inputToken:  s.outputToken,
      outputToken: s.inputToken,
      inputAmount: s.outputAmount,
    }));
  }, []);

  const executeSwap = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      // In production: call router contract via ethers.js
      await new Promise(r => setTimeout(r, 1500));
      setState(s => ({ ...s, loading: false, inputAmount: '', outputAmount: '' }));
      return true;
    } catch (e: any) {
      setState(s => ({ ...s, loading: false, error: e.message }));
      return false;
    }
  }, []);

  return { state, setInputToken, setOutputToken, setInputAmount, setSlippage, setDeadline, switchTokens, executeSwap };
}
