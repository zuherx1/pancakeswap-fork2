import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Section, SectionTitle, SectionDesc,
  FormRow, FormGrid, Label, Hint,
  Input, SaveBtn, Badge, PageDesc, Divider,
  Toggle, ToggleRow, ToggleInfo, ToggleLabel, ToggleDesc,
  useAdminToast,
} from '../../components/admin/AdminUI';
import { useAdmin, adminFetch } from '../../context/AdminContext';

export default function SwapSettingsPage() {
  const { token } = useAdmin();
  const { showToast, ToastComponent } = useAdminToast();
  const [swapMode,   setSwapMode]   = useState('fork');
  const [feePercent, setFeePercent] = useState('0.25');
  const [feeWallet,  setFeeWallet]  = useState('');
  const [slippage,   setSlippage]   = useState('0.5');
  const [deadline,   setDeadline]   = useState('20');
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    fetch('/api/admin/data?section=swapSettings')
      .then(r => r.json())
      .then(d => {
        if (d) {
          setSwapMode(d.mode || 'fork');
          setFeePercent(String(d.feePercent || '0.25'));
          setFeeWallet(d.feeWalletAddress || '');
          setSlippage(String(d.defaultSlippage || '0.5'));
          setDeadline(String(d.defaultDeadline || '20'));
        }
      }).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/data', token, {
        method: 'POST',
        body: JSON.stringify({
          section: 'swapSettings',
          payload: {
            mode:              swapMode,
            feePercent:        parseFloat(feePercent) || 0.25,
            feeWalletAddress:  feeWallet,
            defaultSlippage:   parseFloat(slippage) || 0.5,
            defaultDeadline:   parseInt(deadline) || 20,
          },
        }),
      });
      if (res.ok) showToast('Swap settings saved!');
      else showToast('Save failed', 'error');
    } catch { showToast('Network error', 'error'); }
    finally   { setSaving(false); }
  };

  return (
    <AdminLayout title="Swap Settings">
      <PageDesc>Choose which swap widget to show users and configure fees.</PageDesc>

      {/* Mode selector */}
      <Section>
        <SectionTitle>🔄 Swap Mode</SectionTitle>
        <SectionDesc>Choose which swap widget is shown on the Trade page.</SectionDesc>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            {
              id: 'fork', icon: '🍴', label: 'PancakeSwap Fork',
              desc: 'Uses ChangeNow API for crypto exchanges. Works out of the box.',
              badge: 'Recommended',
            },
            {
              id: 'native', icon: '⚡', label: 'Native Exchange',
              desc: 'Uses your own Tatum.io exchange wallets. Requires setup.',
              badge: 'Custom',
            },
          ].map(opt => (
            <div
              key={opt.id}
              onClick={() => setSwapMode(opt.id)}
              style={{
                flex: 1, minWidth: 200, padding: '20px',
                borderRadius: 18, cursor: 'pointer', transition: 'all 0.2s',
                border: `2px solid ${swapMode === opt.id ? '#1FC7D4' : 'rgba(255,255,255,0.08)'}`,
                background: swapMode === opt.id ? 'rgba(31,199,212,0.1)' : 'rgba(255,255,255,0.03)',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{opt.icon}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontWeight: 700, color: 'white', fontFamily: 'Kanit,sans-serif' }}>{opt.label}</span>
                <Badge $color={swapMode === opt.id ? '#1FC7D4' : '#666'}>{opt.badge}</Badge>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{opt.desc}</div>
              {swapMode === opt.id && (
                <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: '#1FC7D4' }}>✓ Active</div>
              )}
            </div>
          ))}
        </div>

        <div style={{
          padding: '12px 16px', borderRadius: 12,
          background: 'rgba(255,178,55,0.08)', border: '1px solid rgba(255,178,55,0.2)',
          fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6,
        }}>
          {swapMode === 'fork'
            ? '🍴 Fork mode uses ChangeNow API — no extra setup needed. Users can swap 900+ tokens instantly.'
            : '⚡ Native mode uses your Tatum.io exchange wallets. Make sure wallets are funded with liquidity before enabling.'}
        </div>
      </Section>

      {/* Fees */}
      <Section>
        <SectionTitle>💸 Fee Settings</SectionTitle>
        <SectionDesc>
          {swapMode === 'fork'
            ? 'Fees in fork mode are collected via ChangeNow affiliate commission (0.4% per trade).'
            : 'Fees in native mode are deducted from the output amount and sent to your fee wallet.'}
        </SectionDesc>

        <FormGrid cols={2}>
          <FormRow>
            <Label>Fee Percentage (%)</Label>
            <Input
              type="number" min="0" max="10" step="0.01"
              placeholder="0.25"
              value={feePercent}
              onChange={e => setFeePercent(e.target.value)}
              disabled={swapMode === 'fork'}
            />
            <Hint>
              {swapMode === 'fork'
                ? 'Not applicable in fork mode (ChangeNow collects fees)'
                : '% of output amount charged as fee (e.g. 0.25 = 0.25%)'}
            </Hint>
          </FormRow>
          <FormRow>
            <Label>Fee Wallet Address</Label>
            <Input
              placeholder="0x… (your wallet to receive fees)"
              value={feeWallet}
              onChange={e => setFeeWallet(e.target.value)}
              disabled={swapMode === 'fork'}
            />
            <Hint>
              {swapMode === 'fork'
                ? 'Not applicable in fork mode'
                : 'EVM wallet address where swap fees are sent'}
            </Hint>
          </FormRow>
        </FormGrid>
      </Section>

      {/* Default swap settings */}
      <Section>
        <SectionTitle>⚙️ Default Settings</SectionTitle>
        <SectionDesc>Default values pre-filled in the swap widget for new users.</SectionDesc>

        <FormGrid cols={2}>
          <FormRow>
            <Label>Default Slippage (%)</Label>
            <Input type="number" min="0.01" max="50" step="0.01" placeholder="0.5" value={slippage} onChange={e => setSlippage(e.target.value)} />
            <Hint>Default slippage tolerance for swaps (e.g. 0.5 = 0.5%)</Hint>
          </FormRow>
          <FormRow>
            <Label>Default Deadline (minutes)</Label>
            <Input type="number" min="1" max="60" placeholder="20" value={deadline} onChange={e => setDeadline(e.target.value)} />
            <Hint>Transaction expires if not confirmed within this time</Hint>
          </FormRow>
        </FormGrid>
      </Section>

      <SaveBtn $loading={saving} onClick={handleSave}>
        {saving ? 'Saving…' : '💾 Save Swap Settings'}
      </SaveBtn>

      {ToastComponent}
    </AdminLayout>
  );
}
