import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Section, SectionTitle, SectionDesc,
  FormRow, FormGrid, Label, Hint,
  Input, Select, SaveBtn, SecondaryBtn,
  DangerBtn, Badge, PageDesc,
  Toggle, ToggleRow, ToggleInfo, ToggleLabel, ToggleDesc,
  useAdminToast,
} from '../../components/admin/AdminUI';
import { useAdmin, adminFetch } from '../../context/AdminContext';
import { TATUM_CHAINS } from '../../utils/tatum';

interface ExchangeWallet {
  id: string; chain: string; address: string; balance: string;
  tokenId: string | null; createdAt: string;
  liquidityHistory: { type: string; amount: string; note: string; timestamp: string }[];
}

interface Token { id: string; name: string; symbol: string; logoEmoji: string; chain: string; }

export default function LiquidityPage() {
  const { token } = useAdmin();
  const { showToast, ToastComponent } = useAdminToast();

  const [wallets,       setWallets]      = useState<ExchangeWallet[]>([]);
  const [tokens,        setTokens]       = useState<Token[]>([]);
  const [liquidityMode, setLiquidityMode]= useState('fork');
  const [loading,       setLoading]      = useState(true);
  const [selWallet,     setSelWallet]    = useState('');
  const [addAmt,        setAddAmt]       = useState('');
  const [addNote,       setAddNote]      = useState('');
  const [adding,        setAdding]       = useState(false);
  const [balLoading,    setBalLoading]   = useState<string | null>(null);
  const [savingMode,    setSavingMode]   = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [wr, tr, lr] = await Promise.all([
        token ? adminFetch('/api/tatum?action=wallets', token).then(r => r.ok ? r.json() : []) : [],
        fetch('/api/tokens').then(r => r.ok ? r.json() : []),
        fetch('/api/admin/data?section=liquiditySettings').then(r => r.json()),
      ]);
      if (Array.isArray(wr)) setWallets(wr);
      if (Array.isArray(tr)) setTokens(tr);
      if (lr?.mode) setLiquidityMode(lr.mode);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [token]);

  const handleSaveMode = async () => {
    if (!token) return;
    setSavingMode(true);
    try {
      const res = await adminFetch('/api/admin/data', token, {
        method: 'POST',
        body: JSON.stringify({ section: 'liquiditySettings', payload: { mode: liquidityMode } }),
      });
      if (res.ok) showToast('Liquidity mode saved!');
      else showToast('Failed to save', 'error');
    } catch { showToast('Network error', 'error'); }
    finally { setSavingMode(false); }
  };

  const getLabel = (w: ExchangeWallet) => {
    const chain = TATUM_CHAINS[w.chain];
    const tok   = w.tokenId ? tokens.find(t => t.id === w.tokenId) : null;
    return `${chain?.icon || '🔗'} ${tok ? `${tok.symbol} (${chain?.name || w.chain})` : `${chain?.symbol || w.chain} — ${chain?.name || w.chain}`}`;
  };

  const selected = wallets.find(w => w.id === selWallet);

  const handleAdd = async () => {
    if (!token || !selWallet || !addAmt) { showToast('Select wallet and enter amount', 'error'); return; }
    setAdding(true);
    try {
      const res = await adminFetch('/api/tatum?action=add-liquidity', token, {
        method: 'POST',
        body: JSON.stringify({ walletId: selWallet, amount: addAmt, note: addNote }),
      });
      const data = await res.json();
      if (res.ok) { showToast('Liquidity record added!'); setAddAmt(''); setAddNote(''); load(); }
      else showToast(data.error || 'Failed', 'error');
    } catch { showToast('Network error', 'error'); }
    finally { setAdding(false); }
  };

  const refreshBal = async (wid: string) => {
    if (!token) return;
    setBalLoading(wid);
    try {
      const res = await adminFetch(`/api/tatum?action=balance&walletId=${wid}`, token);
      const data = await res.json();
      if (res.ok) {
        setWallets(ws => ws.map(w => w.id === wid ? { ...w, balance: data.balance } : w));
        showToast('Balance refreshed');
      }
    } catch {} finally { setBalLoading(null); }
  };

  return (
    <AdminLayout title="Liquidity Management">
      <PageDesc>Manage liquidity for exchange wallets and configure staking/liquidity mode.</PageDesc>

      {/* Liquidity Mode */}
      <Section>
        <SectionTitle>⚙️ Liquidity &amp; Staking Mode</SectionTitle>
        <SectionDesc>Choose how staking and liquidity farming works on your exchange.</SectionDesc>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { id: 'fork',   icon: '🍴', label: 'Fork Mode',   desc: 'Uses pre-built PancakeSwap farms and pools. Works immediately with simulated data.' },
            { id: 'native', icon: '⚡', label: 'Native Mode',  desc: 'Funds go to your exchange wallets. Real on-chain staking via Tatum.io.' },
          ].map(opt => (
            <div
              key={opt.id}
              onClick={() => setLiquidityMode(opt.id)}
              style={{
                flex: 1, minWidth: 200, padding: '18px 20px', borderRadius: 16,
                cursor: 'pointer', transition: 'all 0.2s',
                border: `2px solid ${liquidityMode === opt.id ? '#1FC7D4' : 'rgba(255,255,255,0.08)'}`,
                background: liquidityMode === opt.id ? 'rgba(31,199,212,0.1)' : 'rgba(255,255,255,0.03)',
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 8 }}>{opt.icon}</div>
              <div style={{ fontWeight: 700, color: 'white', fontFamily: 'Kanit,sans-serif', marginBottom: 6 }}>
                {opt.label}
                {liquidityMode === opt.id && <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 7px', borderRadius: 20, background: 'rgba(31,199,212,0.2)', color: '#1FC7D4' }}>Active</span>}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{opt.desc}</div>
            </div>
          ))}
        </div>
        <SaveBtn $loading={savingMode} onClick={handleSaveMode}>
          {savingMode ? 'Saving…' : '💾 Save Mode'}
        </SaveBtn>
      </Section>

      {/* How it works */}
      <Section>
        <SectionTitle>💡 How Liquidity Works</SectionTitle>
        {[
          { n:'1', t:'Generate wallets', d:'Create exchange wallets in Tatum.io section for each token.' },
          { n:'2', t:'Fund the wallets',  d:'Send crypto to wallet addresses. Record amounts here.' },
          { n:'3', t:'Users swap',        d:'Token A goes to exchange wallet A, Token B leaves exchange wallet B.' },
          { n:'4', t:'Perps payout',      d:'When users win perps, winnings are automatically sent from your exchange wallet to their address.' },
        ].map(s => (
          <div key={s.n} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#1FC7D4,#7645D9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white' }}>{s.n}</div>
            <div>
              <div style={{ fontWeight: 700, color: 'white', fontFamily: 'Kanit,sans-serif', marginBottom: 2 }}>{s.t}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{s.d}</div>
            </div>
          </div>
        ))}
      </Section>

      {/* Add liquidity */}
      <Section>
        <SectionTitle>➕ Add Liquidity Record</SectionTitle>
        {wallets.length === 0 ? (
          <div style={{ padding: '14px', borderRadius: 12, background: 'rgba(255,178,55,0.1)', border: '1px solid rgba(255,178,55,0.3)', color: '#FFB237', fontSize: 14 }}>
            ⚠️ No exchange wallets. <a href="/admin/tatum" style={{ color: '#1FC7D4', fontWeight: 700 }}>Generate wallets in Tatum.io →</a>
          </div>
        ) : (
          <>
            <FormRow>
              <Label>Select Wallet</Label>
              <Select value={selWallet} onChange={e => setSelWallet(e.target.value)}>
                <option value="">Choose wallet…</option>
                {wallets.map(w => <option key={w.id} value={w.id}>{getLabel(w)} — Bal: {w.balance || '0'}</option>)}
              </Select>
            </FormRow>

            {selected && (
              <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 12, background: 'rgba(31,199,212,0.08)', border: '1px solid rgba(31,199,212,0.2)', fontSize: 13 }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Send funds to:</div>
                <div style={{ fontFamily: 'monospace', color: '#1FC7D4', cursor: 'pointer', wordBreak: 'break-all' }}
                  onClick={() => { navigator.clipboard.writeText(selected.address); showToast('Copied!'); }}>
                  {selected.address} 📋
                </div>
                <div style={{ marginTop: 6 }}>Balance: <strong style={{ color: '#31D0AA' }}>{selected.balance || '0'} {TATUM_CHAINS[selected.chain]?.symbol}</strong></div>
              </div>
            )}

            <FormGrid cols={2}>
              <FormRow>
                <Label>Amount Added</Label>
                <Input type="number" placeholder="100.0" value={addAmt} onChange={e => setAddAmt(e.target.value)} />
              </FormRow>
              <FormRow>
                <Label>Note</Label>
                <Input placeholder="Initial liquidity…" value={addNote} onChange={e => setAddNote(e.target.value)} />
              </FormRow>
            </FormGrid>
            <SaveBtn $loading={adding} onClick={handleAdd}>{adding ? 'Recording…' : '💧 Add Liquidity Record'}</SaveBtn>
          </>
        )}
      </Section>

      {/* Wallets overview */}
      <Section>
        <SectionTitle>👛 Exchange Wallets <Badge $color="#1FC7D4">{wallets.length}</Badge></SectionTitle>
        {loading && <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.4)' }}>Loading…</div>}
        {!loading && wallets.length === 0 && <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.3)' }}>No wallets yet.</div>}
        {wallets.map(w => {
          const chainInfo = TATUM_CHAINS[w.chain];
          const tok = w.tokenId ? tokens.find(t => t.id === w.tokenId) : null;
          const hasBal = parseFloat(w.balance || '0') > 0;
          return (
            <div key={w.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${hasBal ? 'rgba(49,208,170,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 14, padding: '14px 16px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 22 }}>{chainInfo?.icon || '🔗'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: 'white', fontFamily: 'Kanit,sans-serif' }}>{tok ? `${tok.symbol}` : chainInfo?.symbol} Wallet</span>
                    <Badge $color="#7645D9">{w.chain}</Badge>
                    <Badge $color={hasBal ? '#31D0AA' : '#ED4B9E'}>{hasBal ? '✓ Funded' : '⚠ Empty'}</Badge>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: hasBal ? '#31D0AA' : 'rgba(255,255,255,0.3)', fontFamily: 'Kanit,sans-serif', marginBottom: 6 }}>
                    {w.balance || '0'} {chainInfo?.symbol}
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'rgba(31,199,212,0.6)', cursor: 'pointer' }}
                    onClick={() => { navigator.clipboard.writeText(w.address); showToast('Copied!'); }}>
                    {w.address.slice(0,20)}…{w.address.slice(-6)} 📋
                  </div>
                  {w.liquidityHistory?.length > 0 && (
                    <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                      {w.liquidityHistory.length} liquidity record{w.liquidityHistory.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexDirection: 'column' }}>
                  <SecondaryBtn onClick={() => refreshBal(w.id)} style={{ padding: '7px 12px', fontSize: 12 }}>
                    {balLoading === w.id ? '⏳' : '🔄'} Balance
                  </SecondaryBtn>
                  <SecondaryBtn onClick={() => { setSelWallet(w.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ padding: '7px 12px', fontSize: 12 }}>
                    💧 Add
                  </SecondaryBtn>
                </div>
              </div>
            </div>
          );
        })}
      </Section>

      {ToastComponent}
    </AdminLayout>
  );
}
