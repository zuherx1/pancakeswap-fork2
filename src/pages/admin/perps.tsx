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

interface LocalMarket {
  id:           string;
  symbol:       string;
  baseAsset:    string;
  quoteAsset:   string;
  markPrice:    number;
  initialPrice: number;
  maxLeverage:  number;
  fundingRate:  number;
  makerFee:     number;
  takerFee:     number;
  enabled:      boolean;
  createdAt:    string;
}

const QUOTE_ASSETS  = ['USDT', 'USDC', 'BUSD', 'BTC', 'ETH'];
const LEVERAGE_OPTS = [5, 10, 20, 25, 50, 75, 100, 125, 150];

export default function PerpsAdminPage() {
  const { token } = useAdmin();
  const { showToast, ToastComponent } = useAdminToast();

  const [markets,   setMarkets]   = useState<LocalMarket[]>([]);
  const [perpsMode, setPerpsMode] = useState('fork');
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);

  const [form, setForm] = useState({
    baseAsset:    '',
    quoteAsset:   'USDT',
    initialPrice: '',
    maxLeverage:  '50',
    fundingRate:  '0.0001',
    makerFee:     '0.02',
    takerFee:     '0.07',
  });

  const load = async () => {
    setLoading(true);
    try {
      const [mr, sr] = await Promise.all([
        fetch('/api/perps?action=markets').then(r => r.json()),
        fetch('/api/perps?action=settings').then(r => r.json()),
      ]);
      if (Array.isArray(mr)) setMarkets(mr);
      if (sr?.mode) setPerpsMode(sr.mode);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSetMode = async (mode: string) => {
    if (!token) return;
    try {
      const res = await adminFetch('/api/perps?action=set-mode', token, {
        method: 'POST',
        body: JSON.stringify({ mode }),
      });
      if (res.ok) {
        setPerpsMode(mode);
        showToast(`Perps mode set to ${mode === 'fork' ? 'PancakeSwap Fork' : 'Local Perps'}`);
      }
    } catch { showToast('Failed to change mode', 'error'); }
  };

  const handleAdd = async () => {
    if (!token) return;
    if (!form.baseAsset || !form.initialPrice) {
      showToast('Base asset and initial price are required', 'error'); return;
    }
    setSaving(true);
    try {
      const symbol = `${form.baseAsset.toUpperCase()}${form.quoteAsset}`;
      const res    = await adminFetch('/api/perps?action=add-market', token, {
        method: 'POST',
        body: JSON.stringify({ ...form, symbol }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Market ${symbol} added!`);
        setForm({ baseAsset: '', quoteAsset: 'USDT', initialPrice: '', maxLeverage: '50', fundingRate: '0.0001', makerFee: '0.02', takerFee: '0.07' });
        load();
      } else showToast(data.error || 'Failed to add market', 'error');
    } catch { showToast('Network error', 'error'); }
    finally   { setSaving(false); }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    if (!token) return;
    try {
      await adminFetch('/api/perps?action=update-market', token, {
        method: 'PUT',
        body: JSON.stringify({ id, enabled }),
      });
      setMarkets(ms => ms.map(m => m.id === id ? { ...m, enabled } : m));
      showToast(enabled ? 'Market enabled' : 'Market paused');
    } catch { showToast('Failed', 'error'); }
  };

  const handleUpdatePrice = async (id: string, newPrice: string) => {
    if (!token || !newPrice) return;
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) return;
    try {
      await adminFetch('/api/perps?action=update-market', token, {
        method: 'PUT',
        body: JSON.stringify({ id, markPrice: price, indexPrice: price }),
      });
      setMarkets(ms => ms.map(m => m.id === id ? { ...m, markPrice: price, indexPrice: price } : m));
      showToast('Price updated');
    } catch { showToast('Failed', 'error'); }
  };

  const handleDelete = async (id: string, symbol: string) => {
    if (!confirm(`Delete ${symbol} perpetual market? This cannot be undone.`)) return;
    if (!token) return;
    try {
      const res = await adminFetch(`/api/perps?action=delete-market&id=${id}`, token, { method: 'DELETE' });
      if (res.ok) { showToast(`${symbol} deleted`); load(); }
      else showToast('Failed to delete', 'error');
    } catch { showToast('Network error', 'error'); }
  };

  return (
    <AdminLayout title="Perps Markets">
      <PageDesc>Configure perpetual futures markets and choose between PancakeSwap fork perps or local perps.</PageDesc>

      {/* Mode Selector */}
      <Section>
        <SectionTitle>📈 Perps Mode</SectionTitle>
        <SectionDesc>Choose which perps engine to show users on the Perps page.</SectionDesc>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            {
              id:    'fork',
              icon:  '🍴',
              label: 'PancakeSwap Fork',
              desc:  '48 pairs pre-loaded including stocks (AAPL, AMZN, TSLA). Powered by Aster/ApolloX data. Works immediately.',
              badge: 'Pre-built',
            },
            {
              id:    'local',
              icon:  '⚡',
              label: 'Local Perps',
              desc:  'Your own custom markets configured below. Full control over pairs, leverage, fees and initial prices.',
              badge: 'Custom',
            },
          ].map(opt => (
            <div
              key={opt.id}
              onClick={() => handleSetMode(opt.id)}
              style={{
                flex: 1, minWidth: 220, padding: '20px',
                borderRadius: 18, cursor: 'pointer', transition: 'all 0.2s',
                border: `2px solid ${perpsMode === opt.id ? '#1FC7D4' : 'rgba(255,255,255,0.08)'}`,
                background: perpsMode === opt.id ? 'rgba(31,199,212,0.1)' : 'rgba(255,255,255,0.03)',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{opt.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: 'white', fontFamily: 'Kanit,sans-serif' }}>{opt.label}</span>
                <Badge $color={perpsMode === opt.id ? '#1FC7D4' : '#666'}>{opt.badge}</Badge>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{opt.desc}</div>
              {perpsMode === opt.id && (
                <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: '#31D0AA' }}>✓ Active</div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Add Market */}
      <Section>
        <SectionTitle>➕ Add Local Market</SectionTitle>
        <SectionDesc>
          Add a custom perpetual market. The initial price sets the starting mark price.
          Users will see a live TradingView chart for each market.
        </SectionDesc>

        <FormGrid cols={3}>
          <FormRow>
            <Label>Base Asset *</Label>
            <Input
              placeholder="e.g. BTC, ETH, MYTOKEN"
              value={form.baseAsset}
              onChange={e => setForm(f => ({ ...f, baseAsset: e.target.value.toUpperCase() }))}
            />
            <Hint>The asset being traded (e.g. BTC)</Hint>
          </FormRow>
          <FormRow>
            <Label>Quote Asset *</Label>
            <Select value={form.quoteAsset} onChange={e => setForm(f => ({ ...f, quoteAsset: e.target.value }))}>
              {QUOTE_ASSETS.map(q => <option key={q} value={q}>{q}</option>)}
            </Select>
            <Hint>Settlement currency (usually USDT)</Hint>
          </FormRow>
          <FormRow>
            <Label>Initial Price *</Label>
            <Input
              type="number" min="0" step="any"
              placeholder="e.g. 42000"
              value={form.initialPrice}
              onChange={e => setForm(f => ({ ...f, initialPrice: e.target.value }))}
            />
            <Hint>Starting mark price in {form.quoteAsset}</Hint>
          </FormRow>
          <FormRow>
            <Label>Max Leverage</Label>
            <Select value={form.maxLeverage} onChange={e => setForm(f => ({ ...f, maxLeverage: e.target.value }))}>
              {LEVERAGE_OPTS.map(l => <option key={l} value={l}>{l}×</option>)}
            </Select>
          </FormRow>
          <FormRow>
            <Label>Maker Fee (%)</Label>
            <Input
              type="number" step="0.001" placeholder="0.02"
              value={form.makerFee}
              onChange={e => setForm(f => ({ ...f, makerFee: e.target.value }))}
            />
            <Hint>Fee for limit orders (maker)</Hint>
          </FormRow>
          <FormRow>
            <Label>Taker Fee (%)</Label>
            <Input
              type="number" step="0.001" placeholder="0.07"
              value={form.takerFee}
              onChange={e => setForm(f => ({ ...f, takerFee: e.target.value }))}
            />
            <Hint>Fee for market orders (taker)</Hint>
          </FormRow>
        </FormGrid>

        {/* Preview */}
        {form.baseAsset && form.initialPrice && (
          <div style={{
            padding: '12px 16px', borderRadius: 12, marginBottom: 16,
            background: 'rgba(31,199,212,0.08)', border: '1px solid rgba(31,199,212,0.2)',
            fontSize: 14, color: 'rgba(255,255,255,0.8)',
          }}>
            Preview: <strong>{form.baseAsset.toUpperCase()}{form.quoteAsset}</strong>
            {' '}· Initial price: <strong>{form.initialPrice} {form.quoteAsset}</strong>
            {' '}· Max leverage: <strong>{form.maxLeverage}×</strong>
            {' '}· Fees: <strong>{form.makerFee}% / {form.takerFee}%</strong>
          </div>
        )}

        <SaveBtn $loading={saving} onClick={handleAdd}>
          {saving ? 'Adding…' : '➕ Add Market'}
        </SaveBtn>
      </Section>

      {/* Markets list */}
      <Section>
        <SectionTitle>
          📊 Local Markets
          <Badge $color="#7645D9">{markets.length}</Badge>
          {perpsMode === 'local' && <Badge $color="#31D0AA" style={{ marginLeft: 6 }}>Active</Badge>}
        </SectionTitle>

        {loading && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.4)' }}>Loading…</div>
        )}

        {!loading && markets.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>
            No local markets yet. Add your first market above.
          </div>
        )}

        {markets.map(market => {
          const [editPrice, setEditPrice] = React.useState('');
          const [editing, setEditing] = React.useState(false);

          return (
            <div key={market.id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${market.enabled ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
              borderRadius: 16, padding: '16px 18px', marginBottom: 12,
              opacity: market.enabled ? 1 : 0.6,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: 'white', fontFamily: 'Kanit,sans-serif', fontSize: 16 }}>
                      {market.symbol}
                    </span>
                    <Badge $color={market.enabled ? '#31D0AA' : '#7A6EAA'}>
                      {market.enabled ? '✓ Active' : 'Paused'}
                    </Badge>
                    <Badge $color="#FFB237">{market.maxLeverage}× Max</Badge>
                  </div>

                  {/* Stats grid */}
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 10 }}>
                    {[
                      { label: 'Mark Price',   val: `${market.markPrice.toFixed(market.markPrice > 100 ? 2 : 6)} ${market.quoteAsset}` },
                      { label: 'Initial Price', val: `${market.initialPrice} ${market.quoteAsset}` },
                      { label: 'Maker Fee',     val: `${market.makerFee}%`  },
                      { label: 'Taker Fee',     val: `${market.takerFee}%`  },
                      { label: 'Funding Rate',  val: `${(market.fundingRate * 100).toFixed(4)}%` },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>{s.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)', fontFamily: 'Kanit,sans-serif' }}>
                          {s.val}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Update price inline */}
                  {editing ? (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                      <Input
                        type="number" placeholder={String(market.markPrice)}
                        value={editPrice}
                        onChange={e => setEditPrice(e.target.value)}
                        style={{ width: 160, padding: '6px 10px', fontSize: 13 }}
                        autoFocus
                      />
                      <SaveBtn
                        $loading={false}
                        onClick={() => { handleUpdatePrice(market.id, editPrice); setEditing(false); setEditPrice(''); }}
                        style={{ padding: '6px 14px', fontSize: 13 }}
                      >
                        Update
                      </SaveBtn>
                      <SecondaryBtn onClick={() => setEditing(false)} style={{ padding: '6px 12px', fontSize: 13 }}>
                        Cancel
                      </SecondaryBtn>
                    </div>
                  ) : null}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexDirection: 'column', flexShrink: 0 }}>
                  <SecondaryBtn
                    onClick={() => { setEditing(e => !e); setEditPrice(String(market.markPrice)); }}
                    style={{ padding: '7px 12px', fontSize: 12 }}
                  >
                    ✏️ Update Price
                  </SecondaryBtn>
                  <SecondaryBtn
                    onClick={() => handleToggle(market.id, !market.enabled)}
                    style={{ padding: '7px 12px', fontSize: 12 }}
                  >
                    {market.enabled ? '⏸ Pause' : '▶ Enable'}
                  </SecondaryBtn>
                  <DangerBtn
                    onClick={() => handleDelete(market.id, market.symbol)}
                    style={{ padding: '7px 12px', fontSize: 12 }}
                  >
                    🗑️ Delete
                  </DangerBtn>
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
