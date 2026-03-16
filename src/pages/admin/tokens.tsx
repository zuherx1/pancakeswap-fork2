import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Section, SectionTitle, SectionDesc,
  FormRow, FormGrid, Label, Hint,
  Input, Select, SaveBtn, SecondaryBtn,
  DangerBtn, Badge, PageDesc, Divider,
  useAdminToast,
} from '../../components/admin/AdminUI';
import { useAdmin, adminFetch } from '../../context/AdminContext';
import { TATUM_CHAINS } from '../../utils/tatum';

interface Token {
  id:              string;
  name:            string;
  symbol:          string;
  logoUrl:         string;
  logoEmoji:       string;
  contractAddress: string;
  chain:           string;
  decimals:        number;
  initialPrice:    number;
  enabled:         boolean;
  addedAt:         string;
}

interface MarketPair {
  id:           string;
  fromTokenId:  string;
  toTokenId:    string;
  fromSymbol:   string;
  toSymbol:     string;
  currentPrice: number;
  fee:          number;
  enabled:      boolean;
  volume24h:    number;
  createdAt:    string;
}

const emptyToken = () => ({
  name: '', symbol: '', logoUrl: '', logoEmoji: '🪙',
  contractAddress: '', chain: 'BSC', decimals: 18, initialPrice: 0,
});

export default function TokensPage() {
  const { token: authToken } = useAdmin();
  const { showToast, ToastComponent } = useAdminToast();

  const [tokens,     setTokens]     = useState<Token[]>([]);
  const [pairs,      setPairs]      = useState<MarketPair[]>([]);
  const [tokenForm,  setTokenForm]  = useState(emptyToken());
  const [pairForm,   setPairForm]   = useState({ fromTokenId:'', toTokenId:'', initialPrice:'', fee:'0.25' });
  const [savingTok,  setSavingTok]  = useState(false);
  const [savingPair, setSavingPair] = useState(false);
  const [editingTok, setEditingTok] = useState<string|null>(null);
  const [genWallet,  setGenWallet]  = useState<string|null>(null);
  const [genning,    setGenning]    = useState(false);
  const [view,       setView]       = useState<'tokens'|'pairs'>('tokens');

  const load = async () => {
    try {
      const [tr, pr] = await Promise.all([
        fetch('/api/tokens').then(r=>r.json()),
        fetch('/api/pairs').then(r=>r.json()),
      ]);
      if (Array.isArray(tr)) setTokens(tr);
      if (Array.isArray(pr)) setPairs(pr);
    } catch {}
  };

  useEffect(()=>{ load(); },[]);

  const handleAddToken = async () => {
    if (!authToken) return;
    if (!tokenForm.name||!tokenForm.symbol||!tokenForm.chain) {
      showToast('Name, symbol, and chain are required','error'); return;
    }
    setSavingTok(true);
    try {
      const res  = await adminFetch('/api/tokens', authToken, {
        method: 'POST',
        body: JSON.stringify(tokenForm),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Token ${tokenForm.symbol} added!`);
        setTokenForm(emptyToken());
        load();
        // Offer to generate wallet
        setGenWallet(data.token.id);
      } else showToast(data.error||'Failed to add token','error');
    } catch { showToast('Network error','error'); }
    finally { setSavingTok(false); }
  };

  const handleDeleteToken = async (id: string) => {
    if (!confirm('Delete this token? Any market pairs using it will also be removed.')) return;
    try {
      const res = await adminFetch(`/api/tokens?id=${id}`, authToken!, { method:'DELETE' });
      if (res.ok) { showToast('Token deleted'); load(); }
      else showToast('Failed to delete','error');
    } catch { showToast('Network error','error'); }
  };

  const handleGenerateWallet = async (tokenId: string) => {
    if (!authToken) return;
    const tok = tokens.find(t=>t.id===tokenId);
    if (!tok) return;
    setGenning(true);
    try {
      const res  = await adminFetch('/api/tatum?action=generate-wallet', authToken, {
        method: 'POST',
        body: JSON.stringify({ chain: tok.chain, tokenId }),
      });
      const data = await res.json();
      if (res.ok) { showToast(`Wallet created for ${tok.symbol}!`); setGenWallet(null); }
      else showToast(data.error||'Wallet generation failed. Check Tatum API key.','error');
    } catch { showToast('Network error','error'); }
    finally { setGenning(false); }
  };

  const handleAddPair = async () => {
    if (!authToken) return;
    if (!pairForm.fromTokenId||!pairForm.toTokenId||!pairForm.initialPrice) {
      showToast('All pair fields are required','error'); return;
    }
    if (pairForm.fromTokenId===pairForm.toTokenId) {
      showToast('From and To tokens must be different','error'); return;
    }
    setSavingPair(true);
    try {
      const res  = await adminFetch('/api/pairs', authToken, {
        method: 'POST',
        body: JSON.stringify(pairForm),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Pair ${data.pair.fromSymbol}/${data.pair.toSymbol} created!`);
        setPairForm({ fromTokenId:'', toTokenId:'', initialPrice:'', fee:'0.25' });
        load();
      } else showToast(data.error||'Failed to create pair','error');
    } catch { showToast('Network error','error'); }
    finally { setSavingPair(false); }
  };

  const handleDeletePair = async (id: string) => {
    if (!confirm('Delete this market pair?')) return;
    try {
      const res = await adminFetch(`/api/pairs?id=${id}`, authToken!, { method:'DELETE' });
      if (res.ok) { showToast('Pair deleted'); load(); }
    } catch { showToast('Network error','error'); }
  };

  const togglePair = async (id: string, enabled: boolean) => {
    try {
      await adminFetch('/api/pairs', authToken!, {
        method: 'PUT',
        body: JSON.stringify({ id, enabled }),
      });
      load();
    } catch {}
  };

  const chainList = Object.entries(TATUM_CHAINS);

  return (
    <AdminLayout title="Tokens &amp; Market Pairs">
      <PageDesc>Add custom tokens to your exchange and create market pairs for the native swap widget.</PageDesc>

      {/* Tab switcher */}
      <div style={{display:'flex',gap:8,marginBottom:24}}>
        <button
          onClick={()=>setView('tokens')}
          style={{
            padding:'10px 24px',borderRadius:12,fontFamily:'Kanit,sans-serif',
            fontWeight:700,fontSize:14,cursor:'pointer',
            background: view==='tokens'?'linear-gradient(135deg,#1FC7D4,#7645D9)':'rgba(255,255,255,0.07)',
            border: view==='tokens'?'none':'1px solid rgba(255,255,255,0.12)',
            color:'white',
          }}
        >
          🪙 Tokens ({tokens.length})
        </button>
        <button
          onClick={()=>setView('pairs')}
          style={{
            padding:'10px 24px',borderRadius:12,fontFamily:'Kanit,sans-serif',
            fontWeight:700,fontSize:14,cursor:'pointer',
            background: view==='pairs'?'linear-gradient(135deg,#1FC7D4,#7645D9)':'rgba(255,255,255,0.07)',
            border: view==='pairs'?'none':'1px solid rgba(255,255,255,0.12)',
            color:'white',
          }}
        >
          📊 Market Pairs ({pairs.length})
        </button>
      </div>

      {/* ── TOKENS VIEW ── */}
      {view==='tokens' && (
        <>
          <Section>
            <SectionTitle>➕ Add New Token</SectionTitle>
            <SectionDesc>Add a custom token or coin to your exchange. After adding, generate an exchange wallet for it.</SectionDesc>

            <FormGrid cols={2}>
              <FormRow>
                <Label>Token Name *</Label>
                <Input placeholder="e.g. My Token" value={tokenForm.name} onChange={e=>setTokenForm(f=>({...f,name:e.target.value}))} />
              </FormRow>
              <FormRow>
                <Label>Symbol *</Label>
                <Input placeholder="e.g. MTK" value={tokenForm.symbol} onChange={e=>setTokenForm(f=>({...f,symbol:e.target.value.toUpperCase()}))} />
              </FormRow>
              <FormRow>
                <Label>Blockchain *</Label>
                <Select value={tokenForm.chain} onChange={e=>setTokenForm(f=>({...f,chain:e.target.value}))}>
                  {chainList.map(([k,c])=>(
                    <option key={k} value={k}>{c.icon} {c.name}</option>
                  ))}
                </Select>
              </FormRow>
              <FormRow>
                <Label>Contract Address</Label>
                <Input placeholder="0x… (leave blank for native coin)" value={tokenForm.contractAddress} onChange={e=>setTokenForm(f=>({...f,contractAddress:e.target.value}))} />
                <Hint>Leave blank for native coins like BNB, ETH, SOL</Hint>
              </FormRow>
              <FormRow>
                <Label>Logo Emoji</Label>
                <Input placeholder="🪙" value={tokenForm.logoEmoji} onChange={e=>setTokenForm(f=>({...f,logoEmoji:e.target.value}))} style={{fontSize:20}} />
              </FormRow>
              <FormRow>
                <Label>Logo URL (optional)</Label>
                <Input placeholder="https://…/logo.png" value={tokenForm.logoUrl} onChange={e=>setTokenForm(f=>({...f,logoUrl:e.target.value}))} />
              </FormRow>
              <FormRow>
                <Label>Decimals</Label>
                <Input type="number" placeholder="18" value={tokenForm.decimals} onChange={e=>setTokenForm(f=>({...f,decimals:parseInt(e.target.value)||18}))} />
              </FormRow>
              <FormRow>
                <Label>Initial Price (USDT)</Label>
                <Input type="number" placeholder="0.001" value={tokenForm.initialPrice||''} onChange={e=>setTokenForm(f=>({...f,initialPrice:parseFloat(e.target.value)||0}))} />
                <Hint>Used as starting price for the native exchange widget</Hint>
              </FormRow>
            </FormGrid>

            <SaveBtn $loading={savingTok} onClick={handleAddToken}>
              {savingTok ? 'Adding…' : '➕ Add Token'}
            </SaveBtn>
          </Section>

          {/* Wallet generation prompt */}
          {genWallet && (
            <div style={{
              padding:'18px 20px',borderRadius:16,marginBottom:20,
              background:'rgba(31,199,212,0.1)',border:'1px solid rgba(31,199,212,0.3)',
              display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12,
            }}>
              <div>
                <div style={{fontWeight:700,color:'white',fontFamily:'Kanit,sans-serif',marginBottom:4}}>
                  🔑 Generate Exchange Wallet
                </div>
                <div style={{fontSize:13,color:'rgba(255,255,255,0.6)'}}>
                  Generate a Tatum.io wallet for this token to enable swapping.
                </div>
              </div>
              <div style={{display:'flex',gap:10}}>
                <SaveBtn $loading={genning} onClick={()=>handleGenerateWallet(genWallet)}>
                  {genning ? '⏳ Generating…' : '🔑 Generate Wallet'}
                </SaveBtn>
                <SecondaryBtn onClick={()=>setGenWallet(null)}>Skip</SecondaryBtn>
              </div>
            </div>
          )}

          {/* Tokens list */}
          <Section>
            <SectionTitle>🪙 All Tokens <Badge $color="#1FC7D4">{tokens.length}</Badge></SectionTitle>
            {tokens.length===0 && (
              <div style={{textAlign:'center',padding:'32px 0',color:'rgba(255,255,255,0.3)'}}>
                No tokens added yet. Add your first token above.
              </div>
            )}
            {tokens.map(tok=>{
              const chain = TATUM_CHAINS[tok.chain];
              return (
                <div key={tok.id} style={{
                  display:'flex',alignItems:'center',gap:14,
                  background:'rgba(255,255,255,0.03)',
                  border:'1px solid rgba(255,255,255,0.08)',
                  borderRadius:14,padding:'14px 18px',marginBottom:10,flexWrap:'wrap',
                }}>
                  <div style={{fontSize:28,flexShrink:0}}>
                    {tok.logoUrl ? <img src={tok.logoUrl} style={{width:32,height:32,borderRadius:'50%',objectFit:'contain'}} alt={tok.symbol}/> : tok.logoEmoji}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:4}}>
                      <span style={{fontWeight:700,color:'white',fontFamily:'Kanit,sans-serif'}}>{tok.name}</span>
                      <Badge $color="#1FC7D4">{tok.symbol}</Badge>
                      <Badge $color={chain?.icon?'#7645D9':'#666'}>{chain?.icon||''} {tok.chain}</Badge>
                      {tok.contractAddress && <Badge $color="#31D0AA">ERC-20</Badge>}
                    </div>
                    <div style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>
                      Price: ${tok.initialPrice} · Decimals: {tok.decimals}
                      {tok.contractAddress && ` · ${tok.contractAddress.slice(0,10)}…`}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8,flexShrink:0}}>
                    <SecondaryBtn onClick={()=>handleGenerateWallet(tok.id)} style={{padding:'7px 12px',fontSize:12}}>
                      🔑 Wallet
                    </SecondaryBtn>
                    <DangerBtn onClick={()=>handleDeleteToken(tok.id)} style={{padding:'7px 12px',fontSize:12}}>
                      Delete
                    </DangerBtn>
                  </div>
                </div>
              );
            })}
          </Section>
        </>
      )}

      {/* ── PAIRS VIEW ── */}
      {view==='pairs' && (
        <>
          <Section>
            <SectionTitle>➕ Create Market Pair</SectionTitle>
            <SectionDesc>Create a trading pair between two tokens. Both tokens must be added first.</SectionDesc>

            {tokens.length < 2 ? (
              <div style={{
                padding:'16px',borderRadius:12,
                background:'rgba(255,178,55,0.1)',border:'1px solid rgba(255,178,55,0.3)',
                color:'#FFB237',fontSize:14,
              }}>
                ⚠️ You need at least 2 tokens to create a market pair.{' '}
                <button onClick={()=>setView('tokens')} style={{color:'#1FC7D4',background:'none',border:'none',cursor:'pointer',fontFamily:'Kanit,sans-serif',fontWeight:700}}>
                  Add tokens first →
                </button>
              </div>
            ) : (
              <>
                <FormGrid cols={2}>
                  <FormRow>
                    <Label>From Token *</Label>
                    <Select value={pairForm.fromTokenId} onChange={e=>setPairForm(f=>({...f,fromTokenId:e.target.value}))}>
                      <option value="">Select token…</option>
                      {tokens.map(t=><option key={t.id} value={t.id}>{t.logoEmoji} {t.symbol} — {t.name}</option>)}
                    </Select>
                  </FormRow>
                  <FormRow>
                    <Label>To Token *</Label>
                    <Select value={pairForm.toTokenId} onChange={e=>setPairForm(f=>({...f,toTokenId:e.target.value}))}>
                      <option value="">Select token…</option>
                      {tokens.filter(t=>t.id!==pairForm.fromTokenId).map(t=><option key={t.id} value={t.id}>{t.logoEmoji} {t.symbol} — {t.name}</option>)}
                    </Select>
                  </FormRow>
                  <FormRow>
                    <Label>Initial Price *</Label>
                    <Input type="number" placeholder="e.g. 0.0042" value={pairForm.initialPrice} onChange={e=>setPairForm(f=>({...f,initialPrice:e.target.value}))} />
                    <Hint>How many "To" tokens = 1 "From" token</Hint>
                  </FormRow>
                  <FormRow>
                    <Label>Fee %</Label>
                    <Input type="number" placeholder="0.25" value={pairForm.fee} onChange={e=>setPairForm(f=>({...f,fee:e.target.value}))} />
                    <Hint>Swap fee charged to user (e.g. 0.25 = 0.25%)</Hint>
                  </FormRow>
                </FormGrid>

                {pairForm.fromTokenId && pairForm.toTokenId && pairForm.initialPrice && (
                  <div style={{
                    padding:'12px 16px',borderRadius:12,marginBottom:16,
                    background:'rgba(31,199,212,0.08)',border:'1px solid rgba(31,199,212,0.2)',
                    fontSize:14,color:'rgba(255,255,255,0.8)',
                  }}>
                    Preview: 1 <strong>{tokens.find(t=>t.id===pairForm.fromTokenId)?.symbol}</strong>
                    {' '}= {pairForm.initialPrice}{' '}
                    <strong>{tokens.find(t=>t.id===pairForm.toTokenId)?.symbol}</strong>
                    {' '}· {pairForm.fee}% fee
                  </div>
                )}

                <SaveBtn $loading={savingPair} onClick={handleAddPair}>
                  {savingPair ? 'Creating…' : '📊 Create Market Pair'}
                </SaveBtn>
              </>
            )}
          </Section>

          {/* Pairs list */}
          <Section>
            <SectionTitle>📊 Market Pairs <Badge $color="#7645D9">{pairs.length}</Badge></SectionTitle>
            {pairs.length===0 && (
              <div style={{textAlign:'center',padding:'32px 0',color:'rgba(255,255,255,0.3)'}}>
                No market pairs yet.
              </div>
            )}
            {pairs.map(pair=>(
              <div key={pair.id} style={{
                display:'flex',alignItems:'center',gap:14,
                background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.08)',
                borderRadius:14,padding:'14px 18px',marginBottom:10,flexWrap:'wrap',
              }}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:4}}>
                    <span style={{fontWeight:700,color:'white',fontFamily:'Kanit,sans-serif',fontSize:16}}>
                      {pair.fromSymbol}/{pair.toSymbol}
                    </span>
                    <Badge $color={pair.enabled?'#31D0AA':'#7A6EAA'}>
                      {pair.enabled ? '✓ Active' : 'Paused'}
                    </Badge>
                  </div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>
                    Price: {pair.currentPrice} · Fee: {pair.fee}% · Vol: {pair.volume24h||0}
                  </div>
                </div>
                <div style={{display:'flex',gap:8,flexShrink:0}}>
                  <SecondaryBtn onClick={()=>togglePair(pair.id,!pair.enabled)} style={{padding:'7px 12px',fontSize:12}}>
                    {pair.enabled ? 'Pause' : 'Enable'}
                  </SecondaryBtn>
                  <DangerBtn onClick={()=>handleDeletePair(pair.id)} style={{padding:'7px 12px',fontSize:12}}>
                    Delete
                  </DangerBtn>
                </div>
              </div>
            ))}
          </Section>
        </>
      )}

      {ToastComponent}
    </AdminLayout>
  );
}
