import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/ui/Button';
import { Text, Heading } from '../../components/ui/Typography';
import TokenSelectModal from '../../components/trade/TokenSelectModal';
import { Token, getTokensByChain } from '../../constants/tokens';
import { useWeb3 } from '../../context/Web3Context';
import { useSettings } from '../../context/SettingsContext';

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const Page = styled.div`
  min-height: calc(100vh - 56px);
  background: ${({ theme }) => theme.colors.background};
`;

const Inner = styled.div`
  max-width: 560px; margin: 0 auto;
  padding: 32px 16px 64px;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px; overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
`;

const CardBody = styled.div`padding: 20px 24px 24px;`;

const TabRow = styled.div`
  display: flex; gap: 4px;
  background: ${({ theme }) => theme.colors.input};
  border-radius: 14px; padding: 4px; margin-bottom: 20px;
`;

const Tab = styled.button<{ $on?: boolean }>`
  flex: 1; padding: 9px; border-radius: 10px;
  font-size: 15px; font-weight: 700; font-family: 'Kanit', sans-serif;
  cursor: pointer; border: none; transition: all .15s;
  background: ${({ $on, theme }) => $on ? theme.colors.backgroundAlt : 'transparent'};
  color: ${({ $on, theme }) => $on ? theme.colors.text : theme.colors.textSubtle};
  box-shadow: ${({ $on }) => $on ? '0 1px 4px rgba(0,0,0,.1)' : 'none'};
`;

const TokenPanel = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 18px; padding: 14px 16px; margin-bottom: 8px;
  &:focus-within { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const PanelRow = styled.div`display: flex; align-items: center; gap: 10px;`;

const AmtInput = styled.input`
  flex: 1; background: transparent; border: none; outline: none;
  font-size: 22px; font-weight: 700; color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif; min-width: 0;
  &::placeholder { color: ${({ theme }) => theme.colors.textDisabled}; }
`;

const TokenSelectBtn = styled.button`
  display: flex; align-items: center; gap: 7px;
  padding: 8px 12px; border-radius: 14px; flex-shrink: 0;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  color: ${({ theme }) => theme.colors.text};
  font-size: 15px; font-weight: 700; font-family: 'Kanit', sans-serif;
  cursor: pointer; transition: all .15s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const PlusIcon = styled.div`
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 50%; margin: 4px auto;
  background: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  color: ${({ theme }) => theme.colors.textSubtle}; font-size: 18px;
`;

const InfoRow = styled.div`
  display: flex; justify-content: space-between; padding: 7px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder + '50'};
  &:last-child { border-bottom: none; }
`;

const InfoBox = styled.div`
  background: ${({ theme }) => theme.colors.input};
  border-radius: 14px; padding: 14px 16px; margin-bottom: 16px;
`;

const PositionCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 16px; overflow: hidden; margin-bottom: 12px;
`;

const PositionHeader = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; cursor: pointer;
  &:hover { background: ${({ theme }) => theme.colors.input}; }
`;

const PositionBody = styled.div<{ $open: boolean }>`
  max-height: ${({ $open }) => $open ? '400px' : '0'};
  overflow: hidden; transition: max-height .3s ease;
  padding: ${({ $open }) => $open ? '0 18px 16px' : '0 18px'};
`;

const PercentBar = styled.div`
  display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap;
`;

const PctBtn = styled.button<{ $on?: boolean }>`
  padding: 6px 14px; border-radius: 10px; font-size: 14px; font-weight: 700;
  font-family: 'Kanit', sans-serif; cursor: pointer;
  border: 1px solid ${({ $on, theme }) => $on ? theme.colors.primary : theme.colors.cardBorder};
  background: ${({ $on, theme }) => $on ? theme.colors.primary + '15' : 'transparent'};
  color: ${({ $on, theme }) => $on ? theme.colors.primary : theme.colors.textSubtle};
  transition: all .15s;
`;

const BigPercent = styled.div`
  font-size: 60px; font-weight: 700; text-align: center;
  color: ${({ theme }) => theme.colors.text}; font-family: 'Kanit', sans-serif;
  margin-bottom: 8px;
`;

const Slider = styled.input`
  width: 100%; margin-bottom: 16px; cursor: pointer; accent-color: ${({ theme }) => theme.colors.primary};
`;

const TokenImg = styled.img`
  width: 26px; height: 26px; border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`;

const FallbackIcon = styled.div`
  width: 26px; height: 26px; border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary + '20'};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: ${({ theme }) => theme.colors.primary};
`;

/* ─── Mock LP positions ──────────────────────────────────────────────────── */
const MOCK_POSITIONS = [
  { id:'1', token0:'BNB',  token1:'CAKE', token0Amount:'1.24',  token1Amount:'348.2',  share:'0.0142%', usdValue:'$1,284', lpAmount:'0.00342' },
  { id:'2', token0:'ETH',  token1:'USDT', token0Amount:'0.412', token1Amount:'1,324',  share:'0.0033%', usdValue:'$2,648', lpAmount:'0.000892' },
];

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function LiquidityPage() {
  const { account, connect, isConnected } = useWeb3();
  const { settings } = useSettings();
  const chainId      = settings.activeChainId || 56;

  const [tab,        setTab]        = useState<'add' | 'remove'>('add');
  const [token0,     setToken0]     = useState<Token | null>(null);
  const [token1,     setToken1]     = useState<Token | null>(null);
  const [amount0,    setAmount0]    = useState('');
  const [amount1,    setAmount1]    = useState('');
  const [modal,      setModal]      = useState<'token0' | 'token1' | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [positions,  setPositions]  = useState(MOCK_POSITIONS);
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const [removePct,  setRemovePct]  = useState(50);
  const [removing,   setRemoving]   = useState<string | null>(null);

  // Preset common pairs
  useEffect(() => {
    const tokens = getTokensByChain(chainId);
    const t0 = tokens.find(t => t.symbol === 'BNB' || t.symbol === 'ETH');
    const t1 = tokens.find(t => t.symbol === 'USDT');
    if (t0) setToken0(t0);
    if (t1) setToken1(t1);
  }, [chainId]);

  // Simulate paired amount calculation (1 BNB ≈ 340 USDT price ratio)
  const handleAmount0Change = (val: string) => {
    if (!/^\d*\.?\d*$/.test(val)) return;
    setAmount0(val);
    const num = parseFloat(val);
    if (!isNaN(num) && token0 && token1) {
      const ratio = token0.symbol === 'BNB' ? 340 : token0.symbol === 'ETH' ? 2800 : 1;
      setAmount1((num * ratio).toFixed(4));
    }
  };

  const handleAmount1Change = (val: string) => {
    if (!/^\d*\.?\d*$/.test(val)) return;
    setAmount1(val);
    const num = parseFloat(val);
    if (!isNaN(num) && token0 && token1) {
      const ratio = token0.symbol === 'BNB' ? 340 : token0.symbol === 'ETH' ? 2800 : 1;
      setAmount0((num / ratio).toFixed(6));
    }
  };

  const handleAddLiquidity = async () => {
    if (!token0 || !token1 || !amount0 || !amount1) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1800));
    // Add mock position
    const newPos = {
      id:          Date.now().toString(),
      token0:      token0.symbol,
      token1:      token1.symbol,
      token0Amount: amount0,
      token1Amount: amount1,
      share:       '0.0001%',
      usdValue:    `$${(parseFloat(amount0) * 340).toFixed(0)}`,
      lpAmount:    (parseFloat(amount0) * 0.001).toFixed(6),
    };
    setPositions(prev => [newPos, ...prev]);
    setLoading(false);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); setAmount0(''); setAmount1(''); setTab('remove'); }, 2500);
  };

  const handleRemoveLiquidity = async (posId: string) => {
    setRemoving(posId);
    await new Promise(r => setTimeout(r, 1500));
    setPositions(prev => prev.filter(p => p.id !== posId));
    setRemoving(null);
    setExpanded(null);
  };

  const renderTokenIcon = (symbol: string, logoURI?: string) => {
    if (logoURI) return <TokenImg src={logoURI} alt={symbol} onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />;
    return <FallbackIcon>{symbol.slice(0,2)}</FallbackIcon>;
  };

  const pool0 = token0 ? getTokensByChain(chainId).find(t => t.symbol === token0.symbol) : null;
  const pool1 = token1 ? getTokensByChain(chainId).find(t => t.symbol === token1.symbol) : null;

  const canAdd = !!token0 && !!token1 && !!amount0 && !!amount1 && isConnected;

  return (
    <Page>
      <Inner>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <Heading scale="xl" style={{ marginBottom:6 }}>💧 Liquidity</Heading>
          <Text color="textSubtle">Add liquidity to earn 0.17% of all trades on this pair, proportional to your share of the pool.</Text>
        </div>

        <Card>
          <CardHeader>
            <Text bold style={{ fontSize:18 }}>
              {tab === 'add' ? 'Add Liquidity' : 'Your Positions'}
            </Text>
            <TabRow style={{ margin:0, background:'transparent', padding:0 }}>
              <Tab $on={tab==='add'}    onClick={() => setTab('add')}    style={{ padding:'6px 16px', fontSize:13 }}>Add</Tab>
              <Tab $on={tab==='remove'} onClick={() => setTab('remove')} style={{ padding:'6px 16px', fontSize:13 }}>
                Remove
                {positions.length > 0 && (
                  <span style={{
                    marginLeft:6, fontSize:11, background:'rgba(31,199,212,0.2)',
                    color:'#1FC7D4', padding:'1px 6px', borderRadius:20,
                  }}>{positions.length}</span>
                )}
              </Tab>
            </TabRow>
          </CardHeader>

          <CardBody>
            {/* ── Add Liquidity ── */}
            {tab === 'add' && (
              <>
                {success && (
                  <div style={{
                    padding:'14px', borderRadius:14, marginBottom:16, textAlign:'center',
                    background:'rgba(49,208,170,0.12)', border:'1px solid rgba(49,208,170,0.3)',
                    color:'#31D0AA', fontWeight:700, fontFamily:'Kanit,sans-serif',
                  }}>
                    ✅ Liquidity added successfully! LP tokens sent to your wallet.
                  </div>
                )}

                {/* Token 0 */}
                <TokenPanel>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <Text small color="textSubtle">Input</Text>
                    {account && <Text small color="textSubtle">Balance: 1.248</Text>}
                  </div>
                  <PanelRow>
                    <AmtInput
                      placeholder="0.0"
                      value={amount0}
                      onChange={e => handleAmount0Change(e.target.value)}
                    />
                    <TokenSelectBtn onClick={() => setModal('token0')}>
                      {token0 ? (
                        <>
                          {pool0?.logoURI && <img src={pool0.logoURI} width={20} height={20} style={{ borderRadius:'50%' }} alt="" />}
                          {token0.symbol}
                        </>
                      ) : 'Select token'}
                      <span style={{ fontSize:10 }}>▼</span>
                    </TokenSelectBtn>
                  </PanelRow>
                </TokenPanel>

                <PlusIcon>＋</PlusIcon>

                {/* Token 1 */}
                <TokenPanel>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <Text small color="textSubtle">Input</Text>
                    {account && <Text small color="textSubtle">Balance: 2,840</Text>}
                  </div>
                  <PanelRow>
                    <AmtInput
                      placeholder="0.0"
                      value={amount1}
                      onChange={e => handleAmount1Change(e.target.value)}
                    />
                    <TokenSelectBtn onClick={() => setModal('token1')}>
                      {token1 ? (
                        <>
                          {pool1?.logoURI && <img src={pool1.logoURI} width={20} height={20} style={{ borderRadius:'50%' }} alt="" />}
                          {token1.symbol}
                        </>
                      ) : 'Select token'}
                      <span style={{ fontSize:10 }}>▼</span>
                    </TokenSelectBtn>
                  </PanelRow>
                </TokenPanel>

                {/* Prices & pool share */}
                {token0 && token1 && amount0 && (
                  <InfoBox style={{ marginTop:12 }}>
                    <Text small color="textSubtle" style={{ fontWeight:700, marginBottom:8 }}>
                      Prices &amp; Pool Share
                    </Text>
                    <InfoRow>
                      <Text small color="textSubtle">{token1?.symbol} per {token0?.symbol}</Text>
                      <Text small bold>340.24</Text>
                    </InfoRow>
                    <InfoRow>
                      <Text small color="textSubtle">{token0?.symbol} per {token1?.symbol}</Text>
                      <Text small bold>0.00294</Text>
                    </InfoRow>
                    <InfoRow>
                      <Text small color="textSubtle">Share of pool</Text>
                      <Text small bold>&lt; 0.01%</Text>
                    </InfoRow>
                  </InfoBox>
                )}

                {!isConnected ? (
                  <Button fullWidth scale="lg" onClick={connect}>🔓 Connect Wallet</Button>
                ) : (
                  <Button
                    fullWidth scale="lg"
                    disabled={!canAdd || loading}
                    isLoading={loading}
                    onClick={handleAddLiquidity}
                  >
                    {loading ? 'Adding Liquidity…' :
                     !token0 || !token1 ? 'Select tokens' :
                     !amount0 ? 'Enter an amount' :
                     'Supply Liquidity'}
                  </Button>
                )}

                <Text small color="textSubtle" style={{ textAlign:'center', marginTop:10, fontSize:11 }}>
                  By adding liquidity you'll earn 0.17% of all trades on this pair proportional to your share. Fees are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
                </Text>
              </>
            )}

            {/* ── Remove / Positions ── */}
            {tab === 'remove' && (
              <>
                {positions.length === 0 && (
                  <div style={{ textAlign:'center', padding:'32px 0' }}>
                    <div style={{ fontSize:48, marginBottom:12 }}>💧</div>
                    <Text bold style={{ marginBottom:8 }}>No liquidity found</Text>
                    <Text small color="textSubtle" style={{ marginBottom:20 }}>
                      You haven't added any liquidity yet.
                    </Text>
                    <Button scale="md" onClick={() => setTab('add')}>+ Add Liquidity</Button>
                  </div>
                )}

                {positions.map(pos => (
                  <PositionCard key={pos.id}>
                    <PositionHeader onClick={() => setExpanded(expanded === pos.id ? null : pos.id)}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ display:'flex', alignItems:'center' }}>
                          <div style={{ marginRight:-8, zIndex:2 }}>
                            {renderTokenIcon(pos.token0, getTokensByChain(chainId).find(t => t.symbol === pos.token0)?.logoURI)}
                          </div>
                          <div style={{ zIndex:1 }}>
                            {renderTokenIcon(pos.token1, getTokensByChain(chainId).find(t => t.symbol === pos.token1)?.logoURI)}
                          </div>
                        </div>
                        <div>
                          <Text bold>{pos.token0}/{pos.token1}</Text>
                          <Text small color="textSubtle">{pos.usdValue}</Text>
                        </div>
                      </div>
                      <span style={{ fontSize:18, opacity:0.5 }}>{expanded === pos.id ? '▲' : '▼'}</span>
                    </PositionHeader>

                    <PositionBody $open={expanded === pos.id}>
                      <div style={{ paddingTop:12 }}>
                        <InfoBox>
                          <InfoRow>
                            <Text small color="textSubtle">Pooled {pos.token0}</Text>
                            <Text small bold>{pos.token0Amount} {pos.token0}</Text>
                          </InfoRow>
                          <InfoRow>
                            <Text small color="textSubtle">Pooled {pos.token1}</Text>
                            <Text small bold>{pos.token1Amount} {pos.token1}</Text>
                          </InfoRow>
                          <InfoRow>
                            <Text small color="textSubtle">Your pool share</Text>
                            <Text small bold>{pos.share}</Text>
                          </InfoRow>
                          <InfoRow>
                            <Text small color="textSubtle">LP Tokens</Text>
                            <Text small bold>{pos.lpAmount}</Text>
                          </InfoRow>
                        </InfoBox>

                        <Text small color="textSubtle" style={{ marginBottom:8 }}>Amount to remove</Text>
                        <BigPercent>{removePct}%</BigPercent>
                        <Slider
                          type="range" min={1} max={100} value={removePct}
                          onChange={e => setRemovePct(Number(e.target.value))}
                        />
                        <PercentBar>
                          {[25,50,75,100].map(p => (
                            <PctBtn key={p} $on={removePct === p} onClick={() => setRemovePct(p)}>
                              {p === 100 ? 'Max' : `${p}%`}
                            </PctBtn>
                          ))}
                        </PercentBar>

                        <InfoBox style={{ marginBottom:12 }}>
                          <InfoRow>
                            <Text small color="textSubtle">You will receive {pos.token0}</Text>
                            <Text small bold>{(parseFloat(pos.token0Amount) * removePct / 100).toFixed(6)}</Text>
                          </InfoRow>
                          <InfoRow>
                            <Text small color="textSubtle">You will receive {pos.token1}</Text>
                            <Text small bold>{(parseFloat(pos.token1Amount.replace(',','')) * removePct / 100).toFixed(4)}</Text>
                          </InfoRow>
                        </InfoBox>

                        <div style={{ display:'flex', gap:10 }}>
                          <Button
                            fullWidth scale="md"
                            variant="subtle"
                            onClick={() => setExpanded(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            fullWidth scale="md"
                            isLoading={removing === pos.id}
                            onClick={() => handleRemoveLiquidity(pos.id)}
                            style={{ background:'#ED4B9E', borderColor:'#ED4B9E' }}
                          >
                            {removing === pos.id ? 'Removing…' : 'Remove Liquidity'}
                          </Button>
                        </div>
                      </div>
                    </PositionBody>
                  </PositionCard>
                ))}

                {positions.length > 0 && (
                  <Button fullWidth variant="subtle" onClick={() => setTab('add')} style={{ marginTop:8 }}>
                    + Add More Liquidity
                  </Button>
                )}
              </>
            )}
          </CardBody>
        </Card>

        {/* Don't see your liquidity? */}
        <div style={{ textAlign:'center', marginTop:20 }}>
          <Text small color="textSubtle">
            If you staked your LP tokens in a Farm, unstake them to see them here.
          </Text>
        </div>
      </Inner>

      {/* Token select modals */}
      {modal === 'token0' && (
        <TokenSelectModal
          title="Select first token"
          selectedToken={token0 || undefined}
          disabledToken={token1 || undefined}
          onSelectToken={t => { setToken0(t); setAmount0(''); setAmount1(''); }}
          onDismiss={() => setModal(null)}
        />
      )}
      {modal === 'token1' && (
        <TokenSelectModal
          title="Select second token"
          selectedToken={token1 || undefined}
          disabledToken={token0 || undefined}
          onSelectToken={t => { setToken1(t); setAmount0(''); setAmount1(''); }}
          onDismiss={() => setModal(null)}
        />
      )}
    </Page>
  );
}
