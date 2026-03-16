import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Section, SectionTitle, SectionDesc,
  FormRow, FormGrid, Label, Hint, Input,
  ColorPickerWrap, ColorSwatch,
  SaveBtn, Divider, PageDesc,
  useAdminToast,
} from '../../components/admin/AdminUI';
import { useAdmin, adminFetch } from '../../context/AdminContext';

const DEFAULT_COLORS = {
  primaryColor:         '#1FC7D4',
  secondaryColor:       '#7645D9',
  backgroundColor:      '#FAF9FA',
  backgroundColorDark:  '#08060B',
  cardBorderColor:      '#E7E3EB',
  successColor:         '#31D0AA',
  warningColor:         '#FFB237',
  dangerColor:          '#ED4B9E',
};

interface SiteSettings {
  siteName:             string;
  logoUrl:              string;
  logoEmoji:            string;
  primaryColor:         string;
  secondaryColor:       string;
  backgroundColor:      string;
  backgroundColorDark:  string;
  cardBorderColor:      string;
  successColor:         string;
  warningColor:         string;
  dangerColor:          string;
  chainMode:            string;
}

const COLOR_FIELDS: { key: keyof SiteSettings; label: string; hint: string }[] = [
  { key: 'primaryColor',        label: 'Primary Color',        hint: 'Main brand color — buttons, links, active states' },
  { key: 'secondaryColor',      label: 'Secondary Color',      hint: 'Accent color — gradients, badges' },
  { key: 'backgroundColor',     label: 'Background (Light)',   hint: 'Page background in light mode' },
  { key: 'backgroundColorDark', label: 'Background (Dark)',    hint: 'Page background in dark mode' },
  { key: 'cardBorderColor',     label: 'Card Border',          hint: 'Border color for cards and panels' },
  { key: 'successColor',        label: 'Success Color',        hint: 'Positive values, confirmed transactions' },
  { key: 'warningColor',        label: 'Warning Color',        hint: 'Cautions, pending states' },
  { key: 'dangerColor',         label: 'Danger / Failure',     hint: 'Errors, negative values, destructive actions' },
];

export default function SiteSettingsPage() {
  const { token } = useAdmin();
  const { showToast, ToastComponent } = useAdminToast();
  const [settings, setSettings] = useState<SiteSettings>({
    siteName:            'PancakeSwap',
    logoUrl:             '',
    logoEmoji:           '🥞',
    chainMode:           'pancakeswap',
    ...DEFAULT_COLORS,
  });
  const [saving,   setSaving]   = useState(false);
  const [logoPreview, setLogoPreview] = useState('');

  useEffect(() => {
    fetch('/api/admin/data?section=siteSettings')
      .then(r => r.json())
      .then(d => { if (d && d.siteName) setSettings(s => ({ ...s, ...d })); })
      .catch(() => {});
  }, []);

  const handleChange = (key: keyof SiteSettings, value: string) => {
    setSettings(s => ({ ...s, [key]: value }));
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const url = ev.target?.result as string;
      setLogoPreview(url);
      handleChange('logoUrl', url);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/data', token, {
        method: 'POST',
        body: JSON.stringify({ section: 'siteSettings', payload: settings }),
      });
      if (res.ok) showToast('Site settings saved!');
      else showToast('Failed to save settings', 'error');
    } catch {
      showToast('Network error', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(s => ({ ...s, ...DEFAULT_COLORS }));
    showToast('Colors reset to defaults');
  };

  return (
    <AdminLayout title="Site Settings">
      <PageDesc>Customize your exchange name, logo, and brand colors.</PageDesc>

      {/* ── Identity ── */}
      <Section>
        <SectionTitle>🏷️ Site Identity</SectionTitle>

        <FormGrid cols={2}>
          <FormRow>
            <Label>Site Name</Label>
            <Input
              placeholder="PancakeSwap"
              value={settings.siteName}
              onChange={e => handleChange('siteName', e.target.value)}
            />
            <Hint>Shown in the header, browser tab, and emails.</Hint>
          </FormRow>

          <FormRow>
            <Label>Logo Emoji</Label>
            <Input
              placeholder="🥞"
              value={settings.logoEmoji}
              onChange={e => handleChange('logoEmoji', e.target.value)}
              style={{ fontSize: 22 }}
            />
            <Hint>Used when no image logo is uploaded.</Hint>
          </FormRow>
        </FormGrid>

        <FormRow>
          <Label>Logo Image (optional)</Label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Preview */}
            <div style={{
              width: 64, height: 64, borderRadius: 14,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', flexShrink: 0,
            }}>
              {(logoPreview || settings.logoUrl) ? (
                <img
                  src={logoPreview || settings.logoUrl}
                  alt="Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <span style={{ fontSize: 28 }}>{settings.logoEmoji}</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{
                display: 'inline-block', padding: '10px 18px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 12, cursor: 'pointer',
                color: 'rgba(255,255,255,0.7)', fontSize: 14,
                fontFamily: 'Kanit,sans-serif', fontWeight: 600,
              }}>
                📁 Upload Logo
                <input type="file" accept="image/*" onChange={handleLogoFile} style={{ display: 'none' }} />
              </label>
              <Hint style={{ marginTop: 6 }}>PNG, SVG, or WebP recommended. Max 2MB.</Hint>
              <Input
                placeholder="Or paste image URL…"
                value={settings.logoUrl}
                onChange={e => { handleChange('logoUrl', e.target.value); setLogoPreview(''); }}
                style={{ marginTop: 8 }}
              />
            </div>
          </div>
        </FormRow>
      </Section>

      {/* ── Colors ── */}
      <Section>
        <SectionTitle>🎨 Brand Colors</SectionTitle>
        <SectionDesc>These colors apply globally across your exchange. Changes take effect on next page load.</SectionDesc>

        <FormGrid cols={2}>
          {COLOR_FIELDS.map(({ key, label, hint }) => (
            <FormRow key={key}>
              <Label>{label}</Label>
              <ColorPickerWrap>
                <ColorSwatch $color={settings[key] as string}>
                  <input
                    type="color"
                    value={settings[key] as string}
                    onChange={e => handleChange(key, e.target.value)}
                  />
                </ColorSwatch>
                <Input
                  placeholder="#1FC7D4"
                  value={settings[key] as string}
                  onChange={e => handleChange(key, e.target.value)}
                  style={{ flex: 1 }}
                />
              </ColorPickerWrap>
              <Hint>{hint}</Hint>
            </FormRow>
          ))}
        </FormGrid>

        {/* Live preview */}
        <div style={{ marginBottom: 20 }}>
          <Label style={{ marginBottom: 12, display: 'block' }}>Live Preview</Label>
          <div style={{
            background: settings.backgroundColor,
            borderRadius: 16, padding: 20,
            border: `1px solid ${settings.cardBorderColor}`,
          }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { color: settings.primaryColor,   label: 'Primary'   },
                { color: settings.secondaryColor,  label: 'Secondary' },
                { color: settings.successColor,    label: 'Success'   },
                { color: settings.warningColor,    label: 'Warning'   },
                { color: settings.dangerColor,     label: 'Danger'    },
              ].map(({ color, label }) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: color, marginBottom: 4,
                    border: `1px solid ${settings.cardBorderColor}`,
                  }} />
                  <div style={{ fontSize: 11, color: '#666', fontFamily: 'Kanit,sans-serif' }}>{label}</div>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <button style={{
                  background: settings.primaryColor,
                  border: 'none', borderRadius: 10, padding: '10px 20px',
                  color: 'white', fontFamily: 'Kanit,sans-serif', fontWeight: 700,
                  cursor: 'default', fontSize: 14,
                }}>
                  Connect Wallet
                </button>
                <button style={{
                  background: settings.secondaryColor + '20',
                  border: `1px solid ${settings.secondaryColor}`,
                  borderRadius: 10, padding: '10px 20px',
                  color: settings.secondaryColor, fontFamily: 'Kanit,sans-serif', fontWeight: 700,
                  cursor: 'default', fontSize: 14,
                }}>
                  Swap
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleReset}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.4)', fontSize: 13,
            fontFamily: 'Kanit,sans-serif', textDecoration: 'underline',
            marginBottom: 16,
          }}
        >
          Reset colors to default
        </button>
      </Section>

      {/* ── Chain Mode ── */}
      <Section>
        <SectionTitle>⛓️ Top Bar Chain List</SectionTitle>
        <SectionDesc>
          Choose which chains appear when users click the network switcher in the top bar.
        </SectionDesc>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            {
              id: 'pancakeswap',
              icon: '🍴',
              label: 'PancakeSwap Chains',
              desc: 'BNB Chain, Ethereum, Arbitrum, zkSync, Polygon zkEVM, Linea, Base, opBNB — same as PancakeSwap.',
            },
            {
              id: 'tatum',
              icon: '🔗',
              label: 'Tatum.io Chains',
              desc: 'All 15 chains supported by Tatum.io: BSC, ETH, Polygon, Avalanche, Fantom, Solana, BTC, and more.',
            },
          ].map(opt => (
            <div
              key={opt.id}
              onClick={() => handleChange('chainMode', opt.id)}
              style={{
                flex: 1, minWidth: 200, padding: '18px 20px',
                borderRadius: 16, cursor: 'pointer', transition: 'all 0.2s',
                border: `2px solid ${settings.chainMode === opt.id ? '#1FC7D4' : 'rgba(255,255,255,0.08)'}`,
                background: settings.chainMode === opt.id ? 'rgba(31,199,212,0.1)' : 'rgba(255,255,255,0.03)',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>{opt.icon}</div>
              <div style={{
                fontWeight: 700, color: 'white', fontFamily: 'Kanit,sans-serif',
                marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {opt.label}
                {settings.chainMode === opt.id && (
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20,
                    background: 'rgba(31,199,212,0.2)', color: '#1FC7D4', fontWeight: 700 }}>
                    Active
                  </span>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                {opt.desc}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 14, padding: '10px 14px', borderRadius: 12,
          background: 'rgba(255,178,55,0.08)', border: '1px solid rgba(255,178,55,0.2)',
          fontSize: 13, color: 'rgba(255,255,255,0.55)',
        }}>
          ℹ️ This setting takes effect immediately after saving. Users will see the selected chain list when clicking the network button in the top bar.
        </div>
      </Section>

      <SaveBtn $loading={saving} onClick={handleSave}>
        {saving ? 'Saving…' : '💾 Save Site Settings'}
      </SaveBtn>

      {ToastComponent}
    </AdminLayout>
  );
}
