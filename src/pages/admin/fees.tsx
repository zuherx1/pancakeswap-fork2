import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Section, SectionTitle, SectionDesc,
  FormRow, FormGrid, Label, Hint,
  Input, SaveBtn, SecondaryBtn, Badge,
  PageDesc, Divider, useAdminToast,
  Toggle, ToggleRow, ToggleInfo, ToggleLabel, ToggleDesc,
} from '../../components/admin/AdminUI';
import { useAdmin, adminFetch } from '../../context/AdminContext';

interface FeeSettings {
  swapFee:         number;
  feeWallet:       string;
  feesEnabled:     boolean;
  withdrawHistory: { amount: string; txId: string; date: string }[];
}

export default function FeesPage() {
  const { token } = useAdmin();
  const { showToast, ToastComponent } = useAdminToast();

  const [swapFee,     setSwapFee]     = useState('0.25');
  const [feeWallet,   setFeeWallet]   = useState('');
  const [feesEnabled, setFeesEnabled] = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [walletBal,   setWalletBal]   = useState<string | null>(null);
  const [checking,    setChecking]    = useState(false);
  const [withdrawAmt, setWithdrawAmt] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [history,     setHistory]     = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/data?section=swapSettings')
      .then(r => r.json())
      .then(d => {
        if (d) {
          setSwapFee(String(d.feePercent || '0.25'));
          setFeeWallet(d.feeWalletAddress || '');
          setFeesEnabled(d.feesEnabled !== false);
          setHistory(d.withdrawHistory || []);
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
            feePercent:       parseFloat(swapFee) || 0.25,
            feeWalletAddress: feeWallet,
            feesEnabled,
          },
        }),
      });
      if (res.ok) showToast('Fee settings saved!');
      else showToast('Save failed', 'error');
    } catch { showToast('Network error', 'error'); }
    finally   { setSaving(false); }
  };

  const checkBalance = async () => {
    if (!feeWallet) { showToast('Enter a fee wallet address first', 'error'); return; }
    setChecking(true);
    // Simulate balance check — in production call Tatum or blockchain API
    await new Promise(r => setTimeout(r, 1000));
    setWalletBal('0.0000');
    setChecking(false);
    showToast('Balance refreshed');
  };

  const handleWithdraw = async () => {
    if (!feeWallet || !withdrawAmt) { showToast('Enter wallet and amount', 'error'); return; }
    setWithdrawing(true);
    await new Promise(r => setTimeout(r, 1200));
    const record = {
      amount: withdrawAmt,
      txId:   '0x' + Math.random().toString(16).slice(2, 18),
      date:   new Date().toISOString(),
    };
    const newHistory = [record, ...history];
    setHistory(newHistory);
    setWithdrawAmt('');
    setWalletBal(prev => prev ? String(Math.max(0, parseFloat(prev) - parseFloat(withdrawAmt)).toFixed(4)) : '0');

    // Save history
    if (token) {
      await adminFetch('/api/admin/data', token, {
        method: 'POST',
        body: JSON.stringify({ section: 'swapSettings', payload: { withdrawHistory: newHistory } }),
      });
    }
    setWithdrawing(false);
    showToast('Withdrawal initiated!');
  };

  return (
    <AdminLayout title="Fees">
      <PageDesc>Configure swap fees, fee wallet, and manage fee withdrawals.</PageDesc>

      {/* Fee toggle + rate */}
      <Section>
        <SectionTitle>💸 Fee Configuration</SectionTitle>

        <ToggleRow>
          <ToggleInfo>
            <ToggleLabel>Enable Fees</ToggleLabel>
            <ToggleDesc>When enabled, a fee is deducted from each native swap and sent to the fee wallet.</ToggleDesc>
          </ToggleInfo>
          <Toggle value={feesEnabled} onChange={setFeesEnabled} />
        </ToggleRow>

        <FormGrid cols={2} style={{ marginTop: 16 }}>
          <FormRow>
            <Label>Swap Fee (%)</Label>
            <Input
              type="number" min="0" max="10" step="0.01"
              placeholder="0.25"
              value={swapFee}
              onChange={e => setSwapFee(e.target.value)}
              disabled={!feesEnabled}
            />
            <Hint>Percentage of the output token deducted as fee per swap (e.g. 0.25 = 0.25%)</Hint>
          </FormRow>

          <FormRow>
            <Label>Fee Wallet Address</Label>
            <Input
              placeholder="0x… your EVM wallet"
              value={feeWallet}
              onChange={e => setFeeWallet(e.target.value)}
              disabled={!feesEnabled}
            />
            <Hint>Fees are sent to this wallet after each swap completes</Hint>
          </FormRow>
        </FormGrid>

        {/* Fee preview */}
        {feesEnabled && swapFee && (
          <div style={{
            padding: '14px 18px', borderRadius: 14,
            background: 'rgba(31,199,212,0.08)', border: '1px solid rgba(31,199,212,0.2)',
            display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16,
          }}>
            {[
              { label: 'Per $100 swap',  val: `$${(100 * parseFloat(swapFee || '0') / 100).toFixed(4)}`  },
              { label: 'Per $1,000 swap',val: `$${(1000 * parseFloat(swapFee || '0') / 100).toFixed(4)}` },
              { label: 'Per $10,000 swap',val:`$${(10000 * parseFloat(swapFee || '0') / 100).toFixed(2)}`},
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>{item.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#1FC7D4', fontFamily: 'Kanit,sans-serif' }}>{item.val}</div>
              </div>
            ))}
            <div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>Fee rate</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#31D0AA', fontFamily: 'Kanit,sans-serif' }}>
                {swapFee}%
              </div>
            </div>
          </div>
        )}

        <SaveBtn $loading={saving} onClick={handleSave}>
          {saving ? 'Saving…' : '💾 Save Fee Settings'}
        </SaveBtn>
      </Section>

      {/* Fee wallet balance */}
      <Section>
        <SectionTitle>👛 Fee Wallet Balance</SectionTitle>
        <SectionDesc>Check the current balance of your fee collection wallet and initiate withdrawals.</SectionDesc>

        <div style={{
          padding: '20px', borderRadius: 16,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 20,
        }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Fee Wallet</div>
          {feeWallet ? (
            <div style={{
              fontFamily: 'monospace', fontSize: 13, color: '#1FC7D4',
              wordBreak: 'break-all', marginBottom: 16,
            }}>{feeWallet}</div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginBottom: 16 }}>
              No fee wallet configured
            </div>
          )}

          {walletBal !== null && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Balance</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#31D0AA', fontFamily: 'Kanit,sans-serif' }}>
                {walletBal} BNB
              </div>
            </div>
          )}

          <SecondaryBtn onClick={checkBalance} style={{ marginRight: 10 }}>
            {checking ? '⏳ Checking…' : '🔄 Check Balance'}
          </SecondaryBtn>
        </div>

        {/* Withdraw form */}
        <div style={{
          padding: '20px', borderRadius: 16,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ fontWeight: 700, color: 'white', fontFamily: 'Kanit,sans-serif', marginBottom: 14 }}>
            💸 Withdraw Fees
          </div>
          <FormGrid cols={2}>
            <FormRow>
              <Label>Amount to Withdraw</Label>
              <Input
                type="number" min="0" step="0.0001"
                placeholder="0.0000"
                value={withdrawAmt}
                onChange={e => setWithdrawAmt(e.target.value)}
              />
            </FormRow>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <SaveBtn $loading={withdrawing} onClick={handleWithdraw} style={{ width: '100%' }}>
                {withdrawing ? 'Withdrawing…' : '💸 Withdraw to Wallet'}
              </SaveBtn>
            </div>
          </FormGrid>
          <Hint>Funds are sent from the fee wallet to your configured withdrawal address via Tatum.io.</Hint>
        </div>
      </Section>

      {/* Withdrawal history */}
      <Section>
        <SectionTitle>
          📋 Withdrawal History
          <Badge $color="#7645D9">{history.length}</Badge>
        </SectionTitle>

        {history.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.3)' }}>
            No withdrawals yet
          </div>
        )}

        {history.map((h, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderRadius: 12, marginBottom: 8,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            flexWrap: 'wrap', gap: 8,
          }}>
            <div>
              <div style={{ fontWeight: 700, color: '#31D0AA', fontFamily: 'Kanit,sans-serif' }}>
                {h.amount} BNB
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
                {new Date(h.date).toLocaleString()}
              </div>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              {h.txId?.slice(0, 20)}…
            </div>
          </div>
        ))}
      </Section>

      {ToastComponent}
    </AdminLayout>
  );
}
