import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Button } from '../ui/Button';
import { Text } from '../ui/Typography';
import { useWeb3 } from '../../context/Web3Context';

const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const Card = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px;
  overflow: hidden;
  width: 100%;
  max-width: 440px;
`;

const Body = styled.div`padding: 20px 20px 24px;`;

const Panel = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 18px; padding: 14px 16px; margin-bottom: 8px;
  transition: border-color 0.2s;
  &:focus-within { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const PanelLabel = styled.div`
  display: flex; justify-content: space-between; margin-bottom: 8px;
`;

const PanelRow = styled.div`display: flex; align-items: center; gap: 10px;`;

const AmtInput = styled.input`
  flex: 1; background: transparent; border: none; outline: none;
  font-size: 24px; font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif; min-width: 0;
  &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
`;

const UsdVal = styled.div`font-size: 12px; color: ${({ theme }) => theme.colors.textSubtle}; margin-top: 3px;`;

const TokenBtn = styled.button`
  display: flex; align-items: center; gap: 7px;
  padding: 8px 12px; border-radius: 14px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  cursor: pointer; white-space: nowrap; flex-shrink: 0;
  font-size: 14px; font-weight: 700; font-family: 'Kanit', sans-serif;
  color: ${({ theme }) => theme.colors.text};
  transition: border-color 0.15s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const SwitchBtn = styled.button`
  width: 34px; height: 34px; border-radius: 12px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 18px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: all 0.2s; margin: -4px auto;
  position: relative; z-index: 1;
  &:hover { background: ${({ theme }) => theme.colors.primary}; color: white; transform: rotate(180deg); }
`;

const InfoBox = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 14px; padding: 12px 14px; margin-bottom: 12px;
`;

const InfoRow = styled.div`
  display: flex; justify-content: space-between; align-items: center; padding: 4px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder + '50'};
  &:last-child { border-bottom: none; }
`;

const ErrorBox = styled.div`
  background: ${({ theme }) => theme.colors.danger + '18'};
  border: 1px solid ${({ theme }) => theme.colors.danger + '50'};
  border-radius: 12px; padding: 10px 14px;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 13px; margin-bottom: 12px;
`;

const NoLiqBox = styled.div`
  background: ${({ theme }) => theme.colors.warning + '15'};
  border: 1px solid ${({ theme }) => theme.colors.warning + '40'};
  border-radius: 14px; padding: 16px;
  text-align: center; margin-bottom: 12px;
`;

const SuccessBox = styled.div`
  background: ${({ theme }) => theme.colors.success + '15'};
  border: 1px solid ${({ theme }) => theme.colors.success + '40'};
  border-radius: 16px; padding: 20px; text-align: center;
`;

const Loader = styled.div`
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white; border-radius: 50%;
  animation: ${spin} 0.7s linear infinite;
  display: inline-block; vertical-align: middle; margin-right: 6px;
`;

const TokenDropdown = styled.div`
  position: absolute; top: calc(100% + 8px); left: 0; right: 0; z-index: 200;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px; overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  max-height: 280px; overflow-y: auto;
`;

const TokenOption = styled.div<{ $selected?: boolean }>`
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; cursor: pointer;
  background: ${({ $selected, theme }) => $selected ? theme.colors.input : 'transparent'};
  transition: background 0.1s;
  &:hover { background: ${({ theme }) => theme.colors.input}; }
`;

const SearchInput = styled.input`
  width: 100%; padding: 10px 16px;
  border: none; border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: transparent; outline: none;
  font-size: 14px; color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif;
  &::placeholder { color: ${({ theme }) => theme.colors.textSubtle}; }
`;

const DropWrapper = styled.div`position: relative;`;

const ChainBadge = styled.span`
  font-size: 10px; padding: 2px 7px; border-radius: 6px;
  background: ${({ theme }) => theme.colors.primary + '20'};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 700;
`;

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface NativeToken {
  id: string; name: string; symbol: string;
  logoEmoji: string; logoUrl: string;
  chain: string; decimals: number;
}

interface Pair {
  id: string;
  fromToken: NativeToken; toToken: NativeToken;
  currentPrice: number; fee: number;
  hasLiquidity: boolean;
  fromWalletAddress: string | null;
  toWalletAddress:   string | null;
  toWalletBalance:   string;
}

interface Quote {
  fromAmount: number; toAmount: number;
  feeAmount: number; feePercent: number;
  hasLiquidity: boolean;
}

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function NativeSwapCard() {
  const { account, connect, isConnected } = useWeb3();

  const [pairs,       setPairs]      = useState<Pair[]>([]);
  const [fromToken,   setFromToken]  = useState<NativeToken | null>(null);
  const [toToken,     setToToken]    = useState<NativeToken | null>(null);
  const [fromAmount,  setFromAmount] = useState('');
  const [quote,       setQuote]      = useState<Quote | null>(null);
  const [quoting,     setQuoting]    = useState(false);
  const [swapping,    setSwapping]   = useState(false);
  const [error,       setError]      = useState('');
  const [swapResult,  setSwapResult] = useState<any>(null);
  const [showFrom,    setShowFrom]   = useState(false);
  const [showTo,      setShowTo]     = useState(false);
  const [searchFrom,  setSearchFrom] = useState('');
  const [searchTo,    setSearchTo]   = useState('');
  const quoteTimer = useRef<any>(null);

  // Load pairs from API
  useEffect(() => {
    fetch('/api/exchange?action=pairs')
      .then(r => r.ok ? r.json() : [])
      .then((p: Pair[]) => {
        setPairs(p);
        if (p.length > 0) {
          setFromToken(p[0].fromToken);
          setToToken(p[0].toToken);
        }
      })
      .catch(() => {});
  }, []);

  // Get unique tokens from pairs
  const allTokens = React.useMemo(() => {
    const seen = new Set<string>();
    const list: NativeToken[] = [];
    pairs.forEach(p => {
      if (!seen.has(p.fromToken.id)) { seen.add(p.fromToken.id); list.push(p.fromToken); }
      if (!seen.has(p.toToken.id))   { seen.add(p.toToken.id);   list.push(p.toToken);   }
    });
    return list;
  }, [pairs]);

  // Find current active pair
  const activePair = React.useMemo(() => {
    if (!fromToken || !toToken) return null;
    return pairs.find(p =>
      p.fromToken.id === fromToken.id && p.toToken.id === toToken.id
    ) || pairs.find(p =>
      p.fromToken.id === toToken.id && p.toToken.id === fromToken.id
    ) || null;
  }, [pairs, fromToken, toToken]);

  // Get quote when amount changes
  useEffect(() => {
    setQuote(null); setError('');
    if (!fromAmount || !activePair || isNaN(+fromAmount) || +fromAmount <= 0) return;
    clearTimeout(quoteTimer.current);
    quoteTimer.current = setTimeout(async () => {
      setQuoting(true);
      try {
        const res  = await fetch(`/api/exchange?action=quote&pairId=${activePair.id}&fromAmount=${fromAmount}`);
        const data = await res.json();
        if (res.ok) setQuote(data);
        else setError(data.error || 'Could not get quote');
      } catch { setError('Network error'); }
      finally   { setQuoting(false); }
    }, 500);
    return () => clearTimeout(quoteTimer.current);
  }, [fromAmount, activePair?.id]);

  const handleSwitch = () => {
    const tmp = fromToken;
    setFromToken(toToken);
    setToToken(tmp);
    setFromAmount('');
    setQuote(null);
    setError('');
  };

  const handleSwap = async () => {
    if (!activePair || !fromAmount || !account) return;
    setSwapping(true); setError('');
    try {
      const res  = await fetch('/api/exchange?action=swap', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pairId:      activePair.id,
          fromAmount,
          userAddress: account,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSwapResult(data);
      } else {
        setError(data.error || 'Swap failed');
      }
    } catch { setError('Network error. Please try again.'); }
    finally   { setSwapping(false); }
  };

  const resetSwap = () => {
    setSwapResult(null); setFromAmount(''); setQuote(null); setError('');
  };

  const fromTokens = allTokens.filter(t =>
    t.id !== toToken?.id &&
    (!searchFrom || t.symbol.toLowerCase().includes(searchFrom.toLowerCase()) || t.name.toLowerCase().includes(searchFrom.toLowerCase()))
  );

  const toTokens = allTokens.filter(t =>
    t.id !== fromToken?.id &&
    (!searchTo || t.symbol.toLowerCase().includes(searchTo.toLowerCase()) || t.name.toLowerCase().includes(searchTo.toLowerCase()))
  );

  const noLiquidity = quote && !quote.hasLiquidity;
  const canSwap     = !!activePair && !!fromAmount && !!quote && quote.hasLiquidity && !error && isConnected;

  // ── Success state ──
  if (swapResult) {
    return (
      <Card>
        <Body>
          <SuccessBox>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <Text bold style={{ fontSize: 18, marginBottom: 8 }}>Swap Initiated!</Text>
            <Text small color="textSubtle" style={{ marginBottom: 16, lineHeight: 1.6 }}>
              Send <strong>{fromAmount} {fromToken?.symbol}</strong> to the address below.
              You will receive <strong>{quote?.toAmount?.toFixed(6)} {toToken?.symbol}</strong> in your wallet.
            </Text>

            <div style={{
              background: 'rgba(31,199,212,0.1)', border: '1px solid rgba(31,199,212,0.2)',
              borderRadius: 12, padding: '12px 14px', marginBottom: 12,
              cursor: 'pointer', wordBreak: 'break-all', fontSize: 13,
              fontFamily: 'monospace', color: '#1FC7D4',
            }}
              onClick={() => navigator.clipboard.writeText(swapResult.depositAddress)}
            >
              {swapResult.depositAddress}
              <span style={{ fontSize: 11, opacity: 0.6, display: 'block', marginTop: 4 }}>
                📋 Click to copy deposit address
              </span>
            </div>

            <InfoBox>
              <InfoRow>
                <Text small color="textSubtle">You send</Text>
                <Text small bold>{fromAmount} {fromToken?.symbol}</Text>
              </InfoRow>
              <InfoRow>
                <Text small color="textSubtle">You receive</Text>
                <Text small bold>{quote?.toAmount?.toFixed(6)} {toToken?.symbol}</Text>
              </InfoRow>
              <InfoRow>
                <Text small color="textSubtle">Fee</Text>
                <Text small bold>{quote?.feeAmount?.toFixed(6)} {toToken?.symbol}</Text>
              </InfoRow>
              <InfoRow>
                <Text small color="textSubtle">Swap ID</Text>
                <Text small style={{ fontSize: 11 }}>{swapResult.swapId}</Text>
              </InfoRow>
            </InfoBox>

            <Button fullWidth onClick={resetSwap} style={{ marginTop: 4 }}>New Swap</Button>
          </SuccessBox>
        </Body>
      </Card>
    );
  }

  // ── No pairs configured ──
  if (pairs.length === 0) {
    return (
      <Card>
        <Body>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔧</div>
            <Text bold style={{ marginBottom: 8 }}>No Trading Pairs Configured</Text>
            <Text small color="textSubtle">
              An admin needs to add tokens and create market pairs before the native exchange is available.
            </Text>
          </div>
        </Body>
      </Card>
    );
  }

  return (
    <Card>
      <Body>
        {/* FROM panel */}
        <Panel>
          <PanelLabel>
            <Text small color="textSubtle">You Send</Text>
            {account && <Text small color="textSubtle">Balance: —</Text>}
          </PanelLabel>
          <PanelRow>
            <div style={{ flex: 1, minWidth: 0 }}>
              <AmtInput
                placeholder="0.0"
                value={fromAmount}
                onChange={e => { if (/^\d*\.?\d*$/.test(e.target.value)) setFromAmount(e.target.value); }}
                type="text" inputMode="decimal"
              />
              <UsdVal>
                {fromToken && activePair
                  ? `≈ $${(+fromAmount * (activePair.currentPrice || 1) * 1).toFixed(2)}`
                  : ''}
              </UsdVal>
            </div>
            <DropWrapper>
              <TokenBtn onClick={() => { setShowFrom(v => !v); setShowTo(false); }}>
                <span style={{ fontSize: 20 }}>{fromToken?.logoEmoji || '🪙'}</span>
                <span>{fromToken?.symbol || 'Select'}</span>
                {fromToken && <ChainBadge>{fromToken.chain}</ChainBadge>}
                <span style={{ fontSize: 10 }}>▼</span>
              </TokenBtn>
              {showFrom && (
                <TokenDropdown>
                  <SearchInput
                    placeholder="Search token…"
                    value={searchFrom}
                    onChange={e => setSearchFrom(e.target.value)}
                    autoFocus
                  />
                  {fromTokens.map(t => (
                    <TokenOption
                      key={t.id}
                      $selected={t.id === fromToken?.id}
                      onClick={() => {
                        setFromToken(t); setShowFrom(false); setSearchFrom('');
                        setFromAmount(''); setQuote(null);
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{t.logoEmoji}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{t.symbol}</div>
                        <div style={{ fontSize: 12, opacity: 0.6 }}>{t.name}</div>
                      </div>
                      <ChainBadge style={{ marginLeft: 'auto' }}>{t.chain}</ChainBadge>
                    </TokenOption>
                  ))}
                  {fromTokens.length === 0 && (
                    <div style={{ padding: '16px', textAlign: 'center', opacity: 0.5, fontSize: 13 }}>No tokens found</div>
                  )}
                </TokenDropdown>
              )}
            </DropWrapper>
          </PanelRow>
        </Panel>

        {/* Switch button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <SwitchBtn onClick={handleSwitch}>⇅</SwitchBtn>
        </div>

        {/* TO panel */}
        <Panel>
          <PanelLabel>
            <Text small color="textSubtle">You Receive</Text>
            {quoting && <Text small color="textSubtle" style={{ fontSize: 11 }}>Calculating…</Text>}
          </PanelLabel>
          <PanelRow>
            <div style={{ flex: 1, minWidth: 0 }}>
              <AmtInput
                placeholder="0.0"
                value={quoting ? '' : (quote?.toAmount?.toFixed(6) || '')}
                readOnly
                style={{ opacity: quoting ? 0.4 : 1 }}
              />
              {quote && !quoting && (
                <UsdVal>≈ ${quote.toAmount.toFixed(2)}</UsdVal>
              )}
            </div>
            <DropWrapper>
              <TokenBtn onClick={() => { setShowTo(v => !v); setShowFrom(false); }}>
                <span style={{ fontSize: 20 }}>{toToken?.logoEmoji || '🪙'}</span>
                <span>{toToken?.symbol || 'Select'}</span>
                {toToken && <ChainBadge>{toToken.chain}</ChainBadge>}
                <span style={{ fontSize: 10 }}>▼</span>
              </TokenBtn>
              {showTo && (
                <TokenDropdown>
                  <SearchInput
                    placeholder="Search token…"
                    value={searchTo}
                    onChange={e => setSearchTo(e.target.value)}
                    autoFocus
                  />
                  {toTokens.map(t => (
                    <TokenOption
                      key={t.id}
                      $selected={t.id === toToken?.id}
                      onClick={() => {
                        setToToken(t); setShowTo(false); setSearchTo('');
                        setFromAmount(''); setQuote(null);
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{t.logoEmoji}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{t.symbol}</div>
                        <div style={{ fontSize: 12, opacity: 0.6 }}>{t.name}</div>
                      </div>
                      <ChainBadge style={{ marginLeft: 'auto' }}>{t.chain}</ChainBadge>
                    </TokenOption>
                  ))}
                  {toTokens.length === 0 && (
                    <div style={{ padding: '16px', textAlign: 'center', opacity: 0.5, fontSize: 13 }}>No tokens found</div>
                  )}
                </TokenDropdown>
              )}
            </DropWrapper>
          </PanelRow>
        </Panel>

        {/* No liquidity warning */}
        {noLiquidity && (
          <NoLiqBox>
            <div style={{ fontSize: 24, marginBottom: 8 }}>💧</div>
            <Text bold style={{ marginBottom: 4 }}>Insufficient Liquidity</Text>
            <Text small color="textSubtle">
              Not enough {toToken?.symbol} liquidity in the exchange wallet.
              Available: {activePair?.toWalletBalance} {toToken?.symbol}
            </Text>
          </NoLiqBox>
        )}

        {/* Error */}
        {error && <ErrorBox>⚠️ {error}</ErrorBox>}

        {/* Quote info */}
        {quote && quote.hasLiquidity && !error && (
          <InfoBox>
            <InfoRow>
              <Text small color="textSubtle">Rate</Text>
              <Text small bold>
                1 {fromToken?.symbol} = {activePair?.currentPrice?.toFixed(6)} {toToken?.symbol}
              </Text>
            </InfoRow>
            <InfoRow>
              <Text small color="textSubtle">Fee ({quote.feePercent}%)</Text>
              <Text small bold>{quote.feeAmount.toFixed(6)} {toToken?.symbol}</Text>
            </InfoRow>
            <InfoRow>
              <Text small color="textSubtle">You receive</Text>
              <Text small bold style={{ color: '#31D0AA' }}>
                {quote.toAmount.toFixed(6)} {toToken?.symbol}
              </Text>
            </InfoRow>
          </InfoBox>
        )}

        {/* Action button */}
        {!isConnected ? (
          <Button fullWidth scale="lg" onClick={connect}>🔓 Connect Wallet</Button>
        ) : (
          <Button
            fullWidth scale="lg"
            disabled={!canSwap || swapping}
            onClick={handleSwap}
            style={{ marginTop: 4 }}
          >
            {swapping ? (
              <><Loader />Processing…</>
            ) : !fromAmount          ? 'Enter an amount'
              : !activePair          ? 'No pair available'
              : noLiquidity          ? 'No Liquidity'
              : error                ? 'Cannot swap'
              : !quote               ? 'Getting rate…'
              : `Swap ${fromToken?.symbol} → ${toToken?.symbol}`}
          </Button>
        )}

        <Text small color="textSubtle" textAlign="center" style={{ marginTop: 10, fontSize: 11 }}>
          Native exchange · Powered by Tatum.io · Non-custodial
        </Text>
      </Body>
    </Card>
  );
}
