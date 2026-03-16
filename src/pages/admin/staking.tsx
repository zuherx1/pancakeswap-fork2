import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Section, SectionTitle, SectionDesc,
  FormRow, FormGrid, Label, Hint,
  Input, Select, SaveBtn, SecondaryBtn,
  DangerBtn, Badge, PageDesc, Divider,
  Toggle, ToggleRow, ToggleInfo, ToggleLabel, ToggleDesc,
  useAdminToast,
} from '../../components/admin/AdminUI';
import { useAdmin, adminFetch } from '../../context/AdminContext';
import { TATUM_CHAINS } from '../../utils/tatum';

interface StakingPool {
  id:             string;
  name:           string;
  tokenSymbol:    string;
  rewardSymbol:   string;
  aprPercent:     number;
  lockDays:       number;
  minStake:       number;
  minClaimAmount: number;
  description:    string;
  rewardWalletId: string | null;
  enabled:        boolean;
  totalStaked:    number;
  createdAt:      string;
}

interface ExchangeWallet {
  id: string; chain: string; address: string; balance: string; tokenId: string | null;
}

const DEFAULT_FORM = {
  name: '', tokenSymbol: '', rewardSymbol: '',
  aprPercent: '50', lockDays: '0', minStake: '0',
  minClaimAmount: '0.0001', description: '', rewardWalletId: '', enabled: true,
};

export default function LocalStakingAdminPage() {
  const { token } = useAdmin();
  const { showToast, ToastComponent } = useAdminToast();

  const [pools,      setPools]      = useState<StakingPool[]>([]);
  const [wallets,    setWallets]    = useState<ExchangeWallet[]>([]);
  const [allStakes,  setAllStakes]  = useState<any[]>([]);
  const [payouts,    setPayouts]    = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [form,       setForm]       = useState(DEFAULT_FORM);
  const [editId,     setEditId]     = useState<string | null>(null);
  const [view,       setView]       = useState<'pools' | 'stakes' | 'payouts'>('pools');
  const [tokens,     setTokens]     = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [pr, wr, sr, tr] = await Promise.all([
        fetch('/api/staking?action=pools').then(r => r.ok ? r.json() : []),
        token ? adminFetch('/api/tatum?action=wallets', token).then(r => r.ok ? r.json() : []) : Promise.resolve([]),
        token ? adminFetch('/api/staking?action=all-stakes', token).then(r => r.ok ? r.json() : {}) : Promise.resolve({}),
        fetch('/api/tokens').then(r => r.ok ? r.json() : []),
      ]);
      if (Array.isArray(pr)) setPools(pr);
      if (Array.isArray(wr)) setWallets(wr);
      if (Array.isArray(tr)) setTokens(tr);
      if (sr?.stakes) setAllStakes(sr.stakes);
      if (sr?.payouts) setPayouts(sr.payouts);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [token]);

  const getWalletLabel = (w: ExchangeWallet) => {
    const chain = TATUM_CHAINS[w.chain];
    const tok   = w.tokenId ? tokens.find((t: any) => t.id === w.tokenId) : null;
    return `${chain?.icon || '🔗'} ${tok ? tok.symbol : chain?.symbol || w.chain} — Balance: ${w.balance || '0'}`;
  };

  const handleSave = async () => {
    if (!token) return;
    if (!form.name || !form.tokenSymbol || !form.rewardSymbol || !form.aprPercent) {
      showToast('Name, token, reward token, and APR are required', 'error'); return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        aprPercent:     parseFloat(form.aprPercent),
        lockDays:       parseInt(form.lockDays) || 0,
        minStake:       parseFloat(form.minStake) || 0,
        minClaimAmount: parseFloat(form.minClaimAmount) || 0.0001,
        rewardWalletId: form.rewardWalletId || null,
      };

      let res;
      if (editId) {
        res = await adminFetch('/api/staking?action=update-pool', token, {
          method: 'PUT', body: JSON.stringify({ id: editId, ...payload }),
        });
      } else {
        res = await adminFetch('/api/staking?action=create-pool', token, {
          method: 'POST', body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok) {
        showToast(editId ? 'Pool updated!' : 'Pool created!');
        setForm(DEFAULT_FORM); setEditId(null); load();
      } else showToast(data.error || 'Failed', 'error');
    } catch { showToast('Network error', 'error'); }
    finally   { setSaving(false); }
  };

  const handleEdit = (pool: StakingPool) => {
    setForm({
      name:           pool.name,
      tokenSymbol:    pool.tokenSymbol,
      rewardSymbol:   pool.rewardSymbol,
      aprPercent:     String(pool.aprPercent),
      lockDays:       String(pool.lockDays),
      minStake:       String(pool.minStake),
      minClaimAmount: String(pool.minClaimAmount),
      description:    pool.description || '',
      rewardWalletId: pool.rewardWalletId || '',
      enabled:        pool.enabled,
    });
    setEditId(pool.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete pool "${name}"?`)) return;
    try {
      const res = await adminFetch(`/api/staking?action=delete-pool&id=${id}`, token!, { method: 'DELETE' });
      if (res.ok) { showToast('Pool deleted'); load(); }
      else showToast('Failed to delete', 'error');
    } catch { showToast('Network error', 'error'); }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await adminFetch('/api/staking?action=update-pool', token!, {
        method: 'PUT', body: JSON.stringify({ id, enabled }),
      });
      setPools(ps => ps.map(p => p.id === id ? { ...p, enabled } : p));
      showToast(enabled ? 'Pool enabled' : 'Pool paused');
    } catch { showToast('Failed', 'error'); }
  };

  const handleManualPayout = async (stakeId: string) => {
    if (!token) return;
    try {
      const res  = await adminFetch('/api/staking?action=claim', token, {
        method: 'POST', body: JSON.stringify({ stakeId }),
      });
      const data = await res.json();
      if (res.ok) { showToast(data.message || 'Payout sent!'); load(); }
      else showToast(data.error || 'Payout failed', 'error');
    } catch { showToast('Network error', 'error'); }
  };

  // APR → daily rate preview
  const dailyRate = form.aprPercent ? (parseFloat(form.aprPercent) / 365).toFixed(4) : '0';
  const monthlyRate = form.aprPercent ? (parseFloat(form.aprPercent) / 12).toFixed(2) : '0';

  const totalTVL   = pools.reduce((s, p) => s + (p.totalStaked || 0), 0);
  const activeStakesCount = allStakes.filter((s: any) => s.status === 'active').length;

  return (
    <AdminLayout title="Local Staking">
      <PageDesc>
        Create staking pools with custom APR rates. Users stake tokens and earn rewards automatically paid from your exchange wallets via Tatum.io.
      </PageDesc>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { icon: '🏊', label: 'Active Pools',    val: String(pools.filter(p => p.enabled).length) },
          { icon: '💰', label: 'Total TVL',        val: `${totalTVL.toFixed(2)}` },
          { icon: '👥', label: 'Active Stakes',    val: String(activeStakesCount) },
          { icon: '💸', label: 'Total Payouts',    val: String(payouts.length) },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1FC7D4', fontFamily: 'Kanit,sans-serif' }}>{s.val}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* View switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['pools','stakes','payouts'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: '9px 20px', borderRadius: 12, fontFamily: 'Kanit,sans-serif', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            background: view === v ? 'linear-gradient(135deg,#1FC7D4,#7645D9)' : 'rgba(255,255,255,0.07)',
            border: view === v ? 'none' : '1px solid rgba(255,255,255,0.1)', color: 'white',
          }}>
            {v === 'pools' ? `🏊 Pools (${pools.length})` : v === 'stakes' ? `👥 Stakes (${activeStakesCount})` : `💸 Payouts (${payouts.length})`}
          </button>
        ))}
      </div>

      {/* ── Pools view ── */}
      {view === 'pools' && (
        <>
          <Section>
            <SectionTitle>{editId ? '✏️ Edit Pool' : '➕ Create Staking Pool'}</SectionTitle>
            <SectionDesc>
              Configure how much users earn. APR is automatically calculated — users earn proportionally to time staked.
              Rewards are sent from your exchange wallet via Tatum.io when users claim.
            </SectionDesc>

            <FormGrid cols={2}>
              <FormRow>
                <Label>Pool Name *</Label>
                <Input placeholder="e.g. CAKE Staking Pool, BNB Yield Farm" value={form.name} onChange={e => setForm(f => ({...f,name:e.target.value}))} />
              </FormRow>
              <FormRow>
                <Label>Description</Label>
                <Input placeholder="Short description for users" value={form.description} onChange={e => setForm(f => ({...f,description:e.target.value}))} />
              </FormRow>
              <FormRow>
                <Label>Staking Token Symbol *</Label>
                <Input placeholder="e.g. CAKE, BNB, USDT" value={form.tokenSymbol} onChange={e => setForm(f => ({...f,tokenSymbol:e.target.value.toUpperCase()}))} />
                <Hint>Token users will stake</Hint>
              </FormRow>
              <FormRow>
                <Label>Reward Token Symbol *</Label>
                <Input placeholder="e.g. CAKE, BNB, USDT" value={form.rewardSymbol} onChange={e => setForm(f => ({...f,rewardSymbol:e.target.value.toUpperCase()}))} />
                <Hint>Token users receive as rewards (can be same as staking token)</Hint>
              </FormRow>
              <FormRow>
                <Label>APR % (Annual Rate) *</Label>
                <Input type="number" min="0" max="10000" step="0.1" placeholder="50" value={form.aprPercent} onChange={e => setForm(f => ({...f,aprPercent:e.target.value}))} />
                <Hint>
                  Annual reward rate. Daily: ~{dailyRate}% · Monthly: ~{monthlyRate}%
                </Hint>
              </FormRow>
              <FormRow>
                <Label>Lock Period (days)</Label>
                <Input type="number" min="0" placeholder="0 = no lock" value={form.lockDays} onChange={e => setForm(f => ({...f,lockDays:e.target.value}))} />
                <Hint>0 = flexible (unstake anytime). e.g. 30 = 30-day lock</Hint>
              </FormRow>
              <FormRow>
                <Label>Minimum Stake Amount</Label>
                <Input type="number" min="0" step="any" placeholder="0" value={form.minStake} onChange={e => setForm(f => ({...f,minStake:e.target.value}))} />
                <Hint>Minimum amount users must stake (0 = no minimum)</Hint>
              </FormRow>
              <FormRow>
                <Label>Min Claim Amount</Label>
                <Input type="number" min="0" step="any" placeholder="0.0001" value={form.minClaimAmount} onChange={e => setForm(f => ({...f,minClaimAmount:e.target.value}))} />
                <Hint>Minimum rewards needed before user can claim</Hint>
              </FormRow>
            </FormGrid>

            <FormRow>
              <Label>Reward Exchange Wallet</Label>
              <Select value={form.rewardWalletId} onChange={e => setForm(f => ({...f,rewardWalletId:e.target.value}))}>
                <option value="">Auto-detect by token symbol</option>
                {wallets.map(w => (
                  <option key={w.id} value={w.id}>{getWalletLabel(w)}</option>
                ))}
              </Select>
              <Hint>Exchange wallet that rewards are paid from. Leave blank to auto-detect by reward symbol.</Hint>
            </FormRow>

            {/* APR preview */}
            {form.aprPercent && form.tokenSymbol && (
              <div style={{
                padding: '16px 18px', borderRadius: 14, marginBottom: 16,
                background: 'rgba(31,199,212,0.08)', border: '1px solid rgba(31,199,212,0.2)',
              }}>
                <div style={{ fontWeight: 700, color: 'white', fontFamily: 'Kanit,sans-serif', marginBottom: 10 }}>
                  📊 Reward Preview
                </div>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  {[
                    { label: `Per 100 ${form.tokenSymbol} / day`,   val: `${(100 * parseFloat(form.aprPercent)/100/365).toFixed(6)} ${form.rewardSymbol}` },
                    { label: `Per 100 ${form.tokenSymbol} / month`, val: `${(100 * parseFloat(form.aprPercent)/100/12).toFixed(4)} ${form.rewardSymbol}` },
                    { label: `Per 100 ${form.tokenSymbol} / year`,  val: `${(100 * parseFloat(form.aprPercent)/100).toFixed(2)} ${form.rewardSymbol}` },
                  ].map(r => (
                    <div key={r.label}>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>{r.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#31D0AA', fontFamily: 'Kanit,sans-serif' }}>{r.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <SaveBtn $loading={saving} onClick={handleSave}>
                {saving ? 'Saving…' : editId ? '💾 Update Pool' : '🏊 Create Pool'}
              </SaveBtn>
              {editId && (
                <SecondaryBtn onClick={() => { setForm(DEFAULT_FORM); setEditId(null); }}>
                  Cancel
                </SecondaryBtn>
              )}
            </div>
          </Section>

          {/* Pools list */}
          <Section>
            <SectionTitle>🏊 All Pools <Badge $color="#1FC7D4">{pools.length}</Badge></SectionTitle>
            {loading && <div style={{textAlign:'center',padding:'24px',color:'rgba(255,255,255,0.4)'}}>Loading…</div>}
            {!loading && pools.length === 0 && (
              <div style={{textAlign:'center',padding:'32px 0',color:'rgba(255,255,255,0.3)'}}>No pools yet. Create your first pool above.</div>
            )}
            {pools.map(pool => (
              <div key={pool.id} style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${pool.enabled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
                borderRadius: 16, padding: '18px 20px', marginBottom: 12,
                opacity: pool.enabled ? 1 : 0.65,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, color: 'white', fontFamily: 'Kanit,sans-serif', fontSize: 16 }}>{pool.name}</span>
                      <Badge $color={pool.enabled ? '#31D0AA' : '#7A6EAA'}>{pool.enabled ? '✓ Active' : 'Paused'}</Badge>
                      <Badge $color="#FFB237">{pool.aprPercent}% APR</Badge>
                      {pool.lockDays > 0 && <Badge $color="#7645D9">🔒 {pool.lockDays}d lock</Badge>}
                    </div>

                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 8 }}>
                      {[
                        { label:'Stake',    val:`${pool.tokenSymbol}`   },
                        { label:'Earn',     val:`${pool.rewardSymbol}`  },
                        { label:'APR',      val:`${pool.aprPercent}%`   },
                        { label:'TVL',      val:`${(pool.totalStaked||0).toFixed(2)} ${pool.tokenSymbol}` },
                        { label:'Min stake',val:`${pool.minStake||0} ${pool.tokenSymbol}`                 },
                        { label:'Min claim',val:`${pool.minClaimAmount||0.0001} ${pool.rewardSymbol}`     },
                      ].map(s => (
                        <div key={s.label}>
                          <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',marginBottom:2}}>{s.label}</div>
                          <div style={{fontSize:13,fontWeight:700,color:'rgba(255,255,255,0.85)',fontFamily:'Kanit,sans-serif'}}>{s.val}</div>
                        </div>
                      ))}
                    </div>

                    {pool.description && (
                      <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',fontStyle:'italic'}}>{pool.description}</div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexDirection: 'column', flexShrink: 0 }}>
                    <SecondaryBtn onClick={() => handleEdit(pool)} style={{padding:'7px 12px',fontSize:12}}>✏️ Edit</SecondaryBtn>
                    <SecondaryBtn onClick={() => handleToggle(pool.id, !pool.enabled)} style={{padding:'7px 12px',fontSize:12}}>
                      {pool.enabled ? '⏸ Pause' : '▶ Enable'}
                    </SecondaryBtn>
                    <DangerBtn onClick={() => handleDelete(pool.id, pool.name)} style={{padding:'7px 12px',fontSize:12}}>🗑️ Delete</DangerBtn>
                  </div>
                </div>
              </div>
            ))}
          </Section>
        </>
      )}

      {/* ── Stakes view ── */}
      {view === 'stakes' && (
        <Section>
          <SectionTitle>👥 All User Stakes <Badge $color="#7645D9">{allStakes.length}</Badge></SectionTitle>
          {allStakes.length === 0 ? (
            <div style={{textAlign:'center',padding:'32px 0',color:'rgba(255,255,255,0.3)'}}>No stakes yet.</div>
          ) : (
            allStakes.map((s: any) => (
              <div key={s.id} style={{
                background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.07)',
                borderRadius:14,padding:'14px 16px',marginBottom:10,
              }}>
                <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:6}}>
                      <span style={{fontWeight:700,color:'white',fontFamily:'Kanit,sans-serif'}}>{s.poolName}</span>
                      <Badge $color={s.status==='active'?'#31D0AA':'#7A6EAA'}>{s.status}</Badge>
                    </div>
                    <div style={{fontSize:13,marginBottom:4}}>
                      <span style={{color:'rgba(255,255,255,0.4)'}}>Amount: </span>
                      <span style={{fontWeight:700,color:'white'}}>{s.amount} {s.tokenSymbol}</span>
                      <span style={{color:'rgba(255,255,255,0.3)',margin:'0 8px'}}>·</span>
                      <span style={{color:'rgba(255,255,255,0.4)'}}>Earned: </span>
                      <span style={{fontWeight:700,color:'#31D0AA'}}>{(s.totalClaimed||0).toFixed(6)} {s.rewardSymbol}</span>
                    </div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',fontFamily:'monospace'}}>
                      {s.userAddress}
                    </div>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginTop:4}}>
                      Staked: {new Date(s.stakedAt).toLocaleString()}
                    </div>
                  </div>
                  {s.status === 'active' && (
                    <SecondaryBtn onClick={() => handleManualPayout(s.id)} style={{padding:'7px 14px',fontSize:12}}>
                      💸 Pay Rewards
                    </SecondaryBtn>
                  )}
                </div>
              </div>
            ))
          )}
        </Section>
      )}

      {/* ── Payouts view ── */}
      {view === 'payouts' && (
        <Section>
          <SectionTitle>💸 Payout History <Badge $color="#31D0AA">{payouts.length}</Badge></SectionTitle>
          {payouts.length === 0 ? (
            <div style={{textAlign:'center',padding:'32px 0',color:'rgba(255,255,255,0.3)'}}>No payouts yet.</div>
          ) : (
            payouts.map((p: any, i: number) => (
              <div key={i} style={{
                display:'flex',alignItems:'center',justifyContent:'space-between',
                padding:'12px 16px',borderRadius:12,marginBottom:8,
                background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',
                flexWrap:'wrap',gap:8,
              }}>
                <div>
                  <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:4}}>
                    <span style={{fontWeight:700,color:'#31D0AA',fontFamily:'Kanit,sans-serif'}}>
                      +{(p.amount||p.rewardAmount||0).toFixed(6)} {p.symbol||p.rewardSymbol}
                    </span>
                    <Badge $color={p.status==='sent'?'#31D0AA':'#FFB237'}>{p.status}</Badge>
                    <Badge $color="#7645D9">{p.type}</Badge>
                  </div>
                  <div style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>
                    {p.poolName} · {new Date(p.timestamp).toLocaleString()}
                  </div>
                  {p.txId && (
                    <div style={{fontSize:11,fontFamily:'monospace',color:'rgba(31,199,212,0.6)',marginTop:3}}>
                      TX: {p.txId.slice(0,20)}…
                    </div>
                  )}
                </div>
                <div style={{fontSize:11,fontFamily:'monospace',color:'rgba(255,255,255,0.3)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis'}}>
                  → {p.userAddress?.slice(0,16)}…
                </div>
              </div>
            ))
          )}
        </Section>
      )}

      {ToastComponent}
    </AdminLayout>
  );
}
