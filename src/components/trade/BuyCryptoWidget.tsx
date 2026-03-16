import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Text } from '../ui/Typography';
import Modal from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

/* ─── API ────────────────────────────────────────────────────────────────── */
const API_KEY = process.env.NEXT_PUBLIC_CHANGENOW_API_KEY || '09b6cc57fbb3d824819b93ef437fa36f814c9bf6bab99027a234dd9060010a53';
const BASE_V2 = 'https://api.changenow.io/v2';
const HEADERS  = { 'x-changenow-api-key': API_KEY, 'Content-Type': 'application/json' };

/* ─── Static coin list (shown instantly, extended by API) ─────────────────── */
const POPULAR_COINS = [
  { ticker:'eth',  name:'Ethereum',   icon:'https://changenow.io/images/sprite/currencies/eth.svg',  usdPrice:3200  },
  { ticker:'btc',  name:'Bitcoin',    icon:'https://changenow.io/images/sprite/currencies/btc.svg',  usdPrice:67000 },
  { ticker:'bnb',  name:'BNB',        icon:'https://changenow.io/images/sprite/currencies/bnb.svg',  usdPrice:580   },
  { ticker:'sol',  name:'Solana',     icon:'https://changenow.io/images/sprite/currencies/sol.svg',  usdPrice:165   },
  { ticker:'usdt', name:'Tether',     icon:'https://changenow.io/images/sprite/currencies/usdt.svg', usdPrice:1     },
  { ticker:'usdc', name:'USD Coin',   icon:'https://changenow.io/images/sprite/currencies/usdc.svg', usdPrice:1     },
  { ticker:'ada',  name:'Cardano',    icon:'https://changenow.io/images/sprite/currencies/ada.svg',  usdPrice:0.45  },
  { ticker:'dot',  name:'Polkadot',   icon:'https://changenow.io/images/sprite/currencies/dot.svg',  usdPrice:8     },
  { ticker:'matic',name:'Polygon',    icon:'https://changenow.io/images/sprite/currencies/matic.svg',usdPrice:0.7   },
  { ticker:'xrp',  name:'XRP',        icon:'https://changenow.io/images/sprite/currencies/xrp.svg',  usdPrice:0.55  },
  { ticker:'ltc',  name:'Litecoin',   icon:'https://changenow.io/images/sprite/currencies/ltc.svg',  usdPrice:82    },
  { ticker:'doge', name:'Dogecoin',   icon:'https://changenow.io/images/sprite/currencies/doge.svg', usdPrice:0.16  },
  { ticker:'trx',  name:'TRON',       icon:'https://changenow.io/images/sprite/currencies/trx.svg',  usdPrice:0.12  },
  { ticker:'avax', name:'Avalanche',  icon:'https://changenow.io/images/sprite/currencies/avax.svg', usdPrice:35    },
  { ticker:'link', name:'Chainlink',  icon:'https://changenow.io/images/sprite/currencies/link.svg', usdPrice:14    },
  { ticker:'near', name:'NEAR',       icon:'https://changenow.io/images/sprite/currencies/near.svg', usdPrice:7     },
  { ticker:'atom', name:'Cosmos',     icon:'https://changenow.io/images/sprite/currencies/atom.svg', usdPrice:9     },
  { ticker:'xlm',  name:'Stellar',    icon:'https://changenow.io/images/sprite/currencies/xlm.svg',  usdPrice:0.11  },
  { ticker:'cake', name:'PancakeSwap',icon:'https://changenow.io/images/sprite/currencies/cake.svg', usdPrice:2.42  },
];

export interface Coin {
  ticker:    string;
  name:      string;
  icon:      string;
  usdPrice:  number;
}

/* ─── Animations ─────────────────────────────────────────────────────────── */
const spin  = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;
const pulse = keyframes`0%,100%{opacity:1}50%{opacity:0.3}`;

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const Card = styled.div`
  background:${({theme})=>theme.colors.backgroundAlt};
  border:1px solid ${({theme})=>theme.colors.cardBorder};
  border-radius:24px;
  overflow:hidden;
  width:100%;
  max-width:480px;
  box-shadow:0 4px 32px rgba(0,0,0,0.06);
`;

const Tabs = styled.div`
  display:flex;
  border-bottom:1px solid ${({theme})=>theme.colors.cardBorder};
`;

const Tab = styled.button<{$active?:boolean}>`
  flex:1;
  padding:14px 8px;
  font-size:14px;
  font-weight:600;
  font-family:'Kanit',sans-serif;
  cursor:pointer;
  border:none;
  background:transparent;
  color:${({$active,theme})=>$active?theme.colors.text:theme.colors.textSubtle};
  border-bottom:2px solid ${({$active,theme})=>$active?theme.colors.primary:'transparent'};
  transition:all 0.15s;
  &:hover{color:${({theme})=>theme.colors.text};background:${({theme})=>theme.colors.input};}
`;

const Body = styled.div`padding:16px;`;

const Panel = styled.div`
  background:${({theme})=>theme.colors.input};
  border:1px solid ${({theme})=>theme.colors.cardBorder};
  border-radius:16px;
  padding:14px 16px;
  margin-bottom:8px;
  &:focus-within{border-color:${({theme})=>theme.colors.primary};}
  transition:border-color 0.2s;
`;

const PanelRow = styled.div`display:flex;align-items:center;gap:10px;`;

const AmtInput = styled.input`
  flex:1;
  background:transparent;
  border:none;
  outline:none;
  font-size:24px;
  font-weight:600;
  color:${({theme})=>theme.colors.text};
  font-family:'Kanit',sans-serif;
  min-width:0;
  &::placeholder{color:${({theme})=>theme.colors.textDisabled};}
`;

const UsdVal = styled.div`font-size:12px;color:${({theme})=>theme.colors.textSubtle};margin-top:3px;`;

const CoinBtn = styled.button`
  display:flex;
  align-items:center;
  gap:7px;
  padding:8px 12px;
  border-radius:14px;
  background:${({theme})=>theme.colors.backgroundAlt};
  border:1px solid ${({theme})=>theme.colors.cardBorder};
  cursor:pointer;
  white-space:nowrap;
  font-size:14px;
  font-weight:700;
  font-family:'Kanit',sans-serif;
  color:${({theme})=>theme.colors.text};
  transition:border-color 0.15s;
  flex-shrink:0;
  &:hover{border-color:${({theme})=>theme.colors.primary};}
`;

const CoinImg = styled.img`
  width:22px;height:22px;border-radius:50%;
  object-fit:contain;
  background:${({theme})=>theme.colors.input};
`;

const SwitchRow = styled.div`
  display:flex;
  justify-content:center;
  position:relative;
  z-index:1;
  margin:-4px 0;
`;

const SwitchBtn = styled.button`
  width:34px;height:34px;border-radius:12px;
  background:${({theme})=>theme.colors.backgroundAlt};
  border:1px solid ${({theme})=>theme.colors.cardBorder};
  color:${({theme})=>theme.colors.primary};
  font-size:18px;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;
  transition:all 0.2s;
  &:hover{background:${({theme})=>theme.colors.primary};color:white;transform:rotate(180deg);}
`;

const InfoBox = styled.div`
  background:${({theme})=>theme.colors.input};
  border-radius:14px;
  padding:12px 14px;
  margin-bottom:10px;
`;

const InfoRow = styled.div`
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:4px 0;
`;

const ErrorBox = styled.div`
  background:${({theme})=>theme.colors.danger+'18'};
  border:1px solid ${({theme})=>theme.colors.danger+'50'};
  border-radius:12px;
  padding:10px 14px;
  color:${({theme})=>theme.colors.danger};
  font-size:13px;
  margin-bottom:10px;
`;

const AddrInput = styled.input`
  width:100%;
  background:${({theme})=>theme.colors.input};
  border:1px solid ${({theme})=>theme.colors.cardBorder};
  border-radius:14px;
  padding:10px 14px;
  font-size:13px;
  color:${({theme})=>theme.colors.text};
  font-family:'Kanit',sans-serif;
  outline:none;
  margin-bottom:10px;
  transition:border-color 0.2s;
  &:focus{border-color:${({theme})=>theme.colors.primary};}
  &::placeholder{color:${({theme})=>theme.colors.textDisabled};}
`;

const Spinner = styled.div`
  width:14px;height:14px;
  border:2px solid rgba(255,255,255,0.3);
  border-top-color:white;
  border-radius:50%;
  animation:${spin} 0.7s linear infinite;
  display:inline-block;
  vertical-align:middle;
  margin-right:6px;
`;

/* Transaction success view */
const TxCard = styled.div`
  background:${({theme})=>theme.colors.backgroundAlt};
  border:1px solid ${({theme})=>theme.colors.cardBorder};
  border-radius:24px;
  overflow:hidden;
  width:100%;
  max-width:480px;
  box-shadow:0 4px 32px rgba(0,0,0,0.06);
`;

const DepositBox = styled.div`
  background:${({theme})=>theme.colors.success+'12'};
  border:1px solid ${({theme})=>theme.colors.success+'30'};
  border-radius:14px;
  padding:14px;
  margin-bottom:12px;
`;

const PulseDot = styled.span`
  display:inline-block;
  width:8px;height:8px;
  border-radius:50%;
  background:${({theme})=>theme.colors.success};
  margin-right:6px;
  animation:${pulse} 1.5s ease-in-out infinite;
`;

const CopyBtn = styled.button`
  width:100%;
  padding:10px;
  border-radius:12px;
  border:1px solid ${({theme})=>theme.colors.cardBorder};
  background:transparent;
  color:${({theme})=>theme.colors.text};
  font-family:'Kanit',sans-serif;
  font-size:13px;
  font-weight:600;
  cursor:pointer;
  transition:all 0.15s;
  margin-bottom:8px;
  &:hover{background:${({theme})=>theme.colors.input};}
`;

/* Coin selector modal */
const CoinRow = styled.div<{$selected?:boolean}>`
  display:flex;
  align-items:center;
  gap:10px;
  padding:9px 12px;
  border-radius:12px;
  cursor:pointer;
  transition:background 0.1s;
  background:${({$selected,theme})=>$selected?theme.colors.primary+'15':'transparent'};
  &:hover{background:${({theme})=>theme.colors.input};}
`;

const CoinListWrap = styled.div`
  max-height:320px;
  overflow-y:auto;
  display:flex;
  flex-direction:column;
  gap:2px;
`;

/* Fiat iframe */
const FiatFrame = styled.iframe`
  width:100%;
  height:440px;
  border:none;
  display:block;
`;

/* ─── Main component ─────────────────────────────────────────────────────── */
type TabType = 'exchange' | 'buy' | 'sell';

const BuyCryptoWidget: React.FC = () => {
  const [tab,          setTab]          = useState<TabType>('exchange');
  const [coins,        setCoins]        = useState<Coin[]>(POPULAR_COINS);
  const [fromCoin,     setFromCoin]     = useState<Coin>(POPULAR_COINS[0]); // ETH
  const [toCoin,       setToCoin]       = useState<Coin>(POPULAR_COINS[2]); // BNB
  const [fromAmount,   setFromAmount]   = useState('');
  const [toAmount,     setToAmount]     = useState('');
  const [address,      setAddress]      = useState('');
  const [minAmount,    setMinAmount]    = useState(0);
  const [estimating,   setEstimating]   = useState(false);
  const [creating,     setCreating]     = useState(false);
  const [error,        setError]        = useState('');
  const [rateInfo,     setRateInfo]     = useState<any>(null);
  const [transaction,  setTransaction]  = useState<any>(null);
  const [copyLabel,    setCopyLabel]    = useState('Copy deposit address');
  const [modalFor,     setModalFor]     = useState<'from'|'to'|null>(null);
  const [coinSearch,   setCoinSearch]   = useState('');
  const [fiatLoaded,   setFiatLoaded]   = useState({buy:false,sell:false});
  const estimateTimer = useRef<any>(null);

  /* Load full currency list from API */
  useEffect(() => {
    fetch(`https://api.changenow.io/v1/currencies?active=true&flow=standard&api_key=${API_KEY}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const mapped: Coin[] = data.slice(0, 300).map((c: any) => ({
          ticker:   c.ticker,
          name:     c.name,
          icon:     `https://changenow.io/images/sprite/currencies/${c.ticker}.svg`,
          usdPrice: 0,
        }));
        const merged = [...POPULAR_COINS];
        mapped.forEach(c => { if (!merged.find(m => m.ticker === c.ticker)) merged.push(c); });
        setCoins(merged);
      })
      .catch(() => {});
  }, []);

  /* Load min amount when pair changes */
  useEffect(() => {
    fetch(`https://api.changenow.io/v1/min-amount/${fromCoin.ticker}_${toCoin.ticker}?api_key=${API_KEY}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setMinAmount(d.minAmount || 0); })
      .catch(() => {});
  }, [fromCoin.ticker, toCoin.ticker]);

  /* Estimate on amount change */
  useEffect(() => {
    setError(''); setRateInfo(null); setToAmount('');
    if (!fromAmount || isNaN(+fromAmount) || +fromAmount <= 0) return;
    clearTimeout(estimateTimer.current);
    estimateTimer.current = setTimeout(async () => {
      setEstimating(true);
      try {
        const params = new URLSearchParams({
          fromCurrency: fromCoin.ticker,
          toCurrency:   toCoin.ticker,
          fromAmount:   fromAmount,
          flow:         'standard',
        });
        const r = await fetch(`${BASE_V2}/exchange/estimated-amount?${params}`, { headers: HEADERS });
        const d = await r.json();
        if (!r.ok || d.error) {
          setError(d.message || d.error || 'Could not estimate. Try a different amount.');
          setEstimating(false);
          return;
        }
        const est = parseFloat(d.estimatedAmount).toFixed(6);
        setToAmount(est);
        setRateInfo({
          rate:    `1 ${fromCoin.ticker.toUpperCase()} ≈ ${(parseFloat(est) / +fromAmount).toFixed(6)} ${toCoin.ticker.toUpperCase()}`,
          estTime: '2–10 min',
        });
        if (minAmount > 0 && +fromAmount < minAmount) {
          setError(`Minimum amount is ${minAmount} ${fromCoin.ticker.toUpperCase()}`);
        }
      } catch {
        setError('Could not reach the exchange API. Please try again.');
      } finally {
        setEstimating(false);
      }
    }, 600);
    return () => clearTimeout(estimateTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromAmount, fromCoin.ticker, toCoin.ticker]);

  const handleSwitch = () => {
    const tmp = fromCoin; setFromCoin(toCoin); setToCoin(tmp);
    setFromAmount(''); setToAmount(''); setError(''); setRateInfo(null);
  };

  const handleExchange = async () => {
    if (!fromAmount || !address.trim()) { setError('Please enter an amount and wallet address.'); return; }
    if (minAmount > 0 && +fromAmount < minAmount) { setError(`Minimum is ${minAmount} ${fromCoin.ticker.toUpperCase()}`); return; }
    setCreating(true); setError('');
    try {
      const body = {
        fromCurrency: fromCoin.ticker,
        toCurrency:   toCoin.ticker,
        fromAmount:   +fromAmount,
        address:      address.trim(),
        flow:         'standard',
        type:         'direct',
      };
      const r = await fetch(`${BASE_V2}/exchange`, { method: 'POST', headers: HEADERS, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok || d.error) { setError(d.message || d.error || 'Exchange creation failed.'); setCreating(false); return; }
      setTransaction({ ...d, estReceive: toAmount });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(transaction.payinAddress || '').then(() => {
      setCopyLabel('Copied!');
      setTimeout(() => setCopyLabel('Copy deposit address'), 1800);
    }).catch(() => {});
  };

  const resetExchange = () => {
    setTransaction(null); setFromAmount(''); setToAmount('');
    setAddress(''); setError(''); setRateInfo(null);
  };

  const buildFiatUrl = (type: 'buy' | 'sell') => {
    const params = new URLSearchParams({
      API_KEY,
      from:            type === 'buy' ? 'usd' : fromCoin.ticker,
      to:              type === 'buy' ? toCoin.ticker : 'usd',
      amount:          '100',
      link_id:         API_KEY,
      backgroundColor: 'transparent',
      isFiat:          'true',
    });
    return `https://changenow.io/embeds/exchange-widget/v2/widget.html?${params}`;
  };

  /* Filtered coin list for modal */
  const filteredCoins = coinSearch
    ? coins.filter(c => c.ticker.toLowerCase().includes(coinSearch.toLowerCase()) || c.name.toLowerCase().includes(coinSearch.toLowerCase()))
    : coins;

  const fromUSD = fromAmount && fromCoin.usdPrice ? `≈ $${(+fromAmount * fromCoin.usdPrice).toFixed(2)}` : '';
  const toUSD   = toAmount   && toCoin.usdPrice   ? `≈ $${(+toAmount   * toCoin.usdPrice).toFixed(2)}`  : '';

  /* ── Transaction success view ── */
  if (transaction) {
    return (
      <TxCard>
        <Body>
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <div style={{ fontSize:40, marginBottom:8 }}>✅</div>
            <Text bold style={{ fontSize:18 }}>Exchange Created!</Text>
            <Text small color="textSubtle" style={{ marginTop:4 }}>
              Send your {fromCoin.ticker.toUpperCase()} to complete the exchange
            </Text>
          </div>

          <DepositBox>
            <Text small color="textSubtle" style={{ marginBottom:6 }}>
              Send {fromCoin.ticker.toUpperCase()} to this address:
            </Text>
            <Text bold style={{ fontSize:13, wordBreak:'break-all', lineHeight:1.5 }}>
              {transaction.payinAddress}
            </Text>
          </DepositBox>

          <InfoBox>
            <InfoRow>
              <Text small color="textSubtle">Amount to send</Text>
              <Text small bold>{fromAmount} {fromCoin.ticker.toUpperCase()}</Text>
            </InfoRow>
            <InfoRow>
              <Text small color="textSubtle">You will receive</Text>
              <Text small bold>≈{transaction.estReceive} {toCoin.ticker.toUpperCase()}</Text>
            </InfoRow>
            <InfoRow>
              <Text small color="textSubtle">Recipient</Text>
              <Text small bold style={{ fontSize:11, maxWidth:180, overflow:'hidden', textOverflow:'ellipsis' }}>
                {address}
              </Text>
            </InfoRow>
            <InfoRow>
              <Text small color="textSubtle">Status</Text>
              <Text small bold><PulseDot />Awaiting deposit</Text>
            </InfoRow>
            <InfoRow>
              <Text small color="textSubtle">Transaction ID</Text>
              <Text small style={{ fontSize:11 }}>{transaction.id}</Text>
            </InfoRow>
          </InfoBox>

          <CopyBtn onClick={copyAddress}>{copyLabel}</CopyBtn>

          <Button
            fullWidth
            variant="subtle"
            scale="sm"
            style={{ marginBottom:8 }}
            onClick={() => window.open(`https://changenow.io/exchange/txs/${transaction.id}`, '_blank')}
          >
            🔍 Track on ChangeNow ↗
          </Button>

          <Button fullWidth onClick={resetExchange}>New Exchange</Button>
        </Body>
      </TxCard>
    );
  }

  return (
    <>
      <Card>
        {/* Tabs */}
        <Tabs>
          <Tab $active={tab==='exchange'} onClick={()=>setTab('exchange')}>🔄 Exchange</Tab>
          <Tab $active={tab==='buy'}      onClick={()=>setTab('buy')}>💳 Buy</Tab>
          <Tab $active={tab==='sell'}     onClick={()=>setTab('sell')}>💵 Sell</Tab>
        </Tabs>

        {/* ── Exchange tab ── */}
        {tab === 'exchange' && (
          <Body>
            {/* From panel */}
            <Panel>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <Text small color="textSubtle">You send</Text>
                <Text small color="textSubtle" style={{ fontSize:11 }}>
                  {minAmount > 0 ? `Min: ${minAmount} ${fromCoin.ticker.toUpperCase()}` : ''}
                </Text>
              </div>
              <PanelRow>
                <div style={{ flex:1, minWidth:0 }}>
                  <AmtInput
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={e => { if (/^\d*\.?\d*$/.test(e.target.value)) setFromAmount(e.target.value); }}
                    type="text"
                    inputMode="decimal"
                  />
                  {fromUSD && <UsdVal>{fromUSD}</UsdVal>}
                </div>
                <CoinBtn onClick={() => { setModalFor('from'); setCoinSearch(''); }}>
                  <CoinImg src={fromCoin.icon} alt={fromCoin.ticker} onError={e=>{(e.target as any).style.opacity=0}} />
                  {fromCoin.ticker.toUpperCase()}
                  <span style={{ fontSize:10, color:'var(--textSubtle)' }}>▼</span>
                </CoinBtn>
              </PanelRow>
            </Panel>

            {/* Switch */}
            <SwitchRow>
              <SwitchBtn onClick={handleSwitch}>⇅</SwitchBtn>
            </SwitchRow>

            {/* To panel */}
            <Panel>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <Text small color="textSubtle">You receive</Text>
                {estimating && <Text small color="textSubtle" style={{ fontSize:11 }}>Estimating…</Text>}
              </div>
              <PanelRow>
                <div style={{ flex:1, minWidth:0 }}>
                  <AmtInput
                    placeholder="0.0"
                    value={estimating ? '' : toAmount}
                    readOnly
                    style={{ opacity: estimating ? 0.4 : 1 }}
                  />
                  {toUSD && !estimating && <UsdVal>{toUSD}</UsdVal>}
                </div>
                <CoinBtn onClick={() => { setModalFor('to'); setCoinSearch(''); }}>
                  <CoinImg src={toCoin.icon} alt={toCoin.ticker} onError={e=>{(e.target as any).style.opacity=0}} />
                  {toCoin.ticker.toUpperCase()}
                  <span style={{ fontSize:10 }}>▼</span>
                </CoinBtn>
              </PanelRow>
            </Panel>

            {/* Rate info */}
            {rateInfo && !error && (
              <InfoBox>
                <InfoRow>
                  <Text small color="textSubtle">Rate</Text>
                  <Text small bold>{rateInfo.rate}</Text>
                </InfoRow>
                <InfoRow>
                  <Text small color="textSubtle">Min amount</Text>
                  <Text small bold>{minAmount > 0 ? `${minAmount} ${fromCoin.ticker.toUpperCase()}` : '—'}</Text>
                </InfoRow>
                <InfoRow>
                  <Text small color="textSubtle">Network fee</Text>
                  <Text small bold>Included</Text>
                </InfoRow>
                <InfoRow>
                  <Text small color="textSubtle">Estimated time</Text>
                  <Text small bold>2–10 min</Text>
                </InfoRow>
              </InfoBox>
            )}

            {/* Wallet address */}
            {toAmount && !error && (
              <div>
                <Text small color="textSubtle" style={{ marginBottom:6 }}>
                  Recipient {toCoin.ticker.toUpperCase()} wallet address
                </Text>
                <AddrInput
                  placeholder={`Your ${toCoin.ticker.toUpperCase()} address`}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                />
              </div>
            )}

            {/* Error */}
            {error && <ErrorBox>⚠️ {error}</ErrorBox>}

            {/* Action button */}
            <Button
              fullWidth
              scale="lg"
              disabled={!fromAmount || !toAmount || !!error || creating}
              onClick={handleExchange}
              style={{ marginTop:4 }}
            >
              {creating ? (
                <><Spinner />Creating exchange…</>
              ) : !fromAmount ? 'Enter an amount'
                : error     ? 'Fix error above'
                : !toAmount ? 'Getting rate…'
                : 'Exchange Now →'}
            </Button>

            <Text small color="textSubtle" textAlign="center" style={{ marginTop:10, fontSize:11 }}>
              Non-custodial · No sign-up · 900+ assets · Powered by ChangeNow
            </Text>
          </Body>
        )}

        {/* ── Buy tab (fiat onramp) ── */}
        {tab === 'buy' && (
          <FiatFrame
            src={buildFiatUrl('buy')}
            title="Buy Crypto"
            allow="clipboard-write; payment"
          />
        )}

        {/* ── Sell tab (fiat offramp) ── */}
        {tab === 'sell' && (
          <FiatFrame
            src={buildFiatUrl('sell')}
            title="Sell Crypto"
            allow="clipboard-write; payment"
          />
        )}
      </Card>

      {/* ── Coin selector modal ── */}
      {modalFor && (
        <Modal
          title={`Select ${modalFor === 'from' ? 'Send' : 'Receive'} Coin`}
          onDismiss={() => setModalFor(null)}
        >
          <Input
            placeholder="Search name or ticker…"
            value={coinSearch}
            onChange={e => setCoinSearch(e.target.value)}
            style={{ marginBottom:12 }}
            autoFocus
          />
          <CoinListWrap>
            {filteredCoins.slice(0, 80).map(c => {
              const isSel = modalFor === 'from' ? fromCoin.ticker === c.ticker : toCoin.ticker === c.ticker;
              return (
                <CoinRow
                  key={c.ticker}
                  $selected={isSel}
                  onClick={() => {
                    if (modalFor === 'from') setFromCoin(c);
                    else setToCoin(c);
                    setModalFor(null);
                    setFromAmount(''); setToAmount(''); setError(''); setRateInfo(null);
                  }}
                >
                  <CoinImg src={c.icon} alt={c.ticker} style={{ width:28, height:28 }} onError={e=>{(e.target as any).style.display='none'}} />
                  <div style={{ flex:1 }}>
                    <Text bold style={{ fontSize:14 }}>{c.ticker.toUpperCase()}</Text>
                    <Text small color="textSubtle">{c.name}</Text>
                  </div>
                  {isSel && <span style={{ color:'#1FC7D4', fontSize:14 }}>✓</span>}
                </CoinRow>
              );
            })}
            {filteredCoins.length === 0 && (
              <Text color="textSubtle" textAlign="center" style={{ padding:'24px 0' }}>No coins found</Text>
            )}
          </CoinListWrap>
        </Modal>
      )}
    </>
  );
};

export default BuyCryptoWidget;
