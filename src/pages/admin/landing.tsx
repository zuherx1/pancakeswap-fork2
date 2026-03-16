import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Section, SectionTitle, SectionDesc,
  FormRow, FormGrid, Label, Hint,
  Input, Textarea, SaveBtn, SecondaryBtn, DangerBtn,
  Divider, PageDesc, Badge, useAdminToast,
} from '../../components/admin/AdminUI';
import { useAdmin, adminFetch } from '../../context/AdminContext';

const SOCIAL_FIELDS = [
  { key: 'twitter',   label: 'Twitter / X',  icon: '🐦', placeholder: 'https://twitter.com/yourexchange'  },
  { key: 'telegram',  label: 'Telegram',     icon: '✈️',  placeholder: 'https://t.me/yourexchange'         },
  { key: 'discord',   label: 'Discord',      icon: '💬', placeholder: 'https://discord.gg/yourexchange'   },
  { key: 'github',    label: 'GitHub',       icon: '🐙', placeholder: 'https://github.com/yourexchange'  },
  { key: 'reddit',    label: 'Reddit',       icon: '🟠', placeholder: 'https://reddit.com/r/yourexchange' },
  { key: 'medium',    label: 'Medium / Blog',icon: '📰', placeholder: 'https://yourexchange.medium.com'   },
  { key: 'youtube',   label: 'YouTube',      icon: '▶️',  placeholder: 'https://youtube.com/c/...'         },
  { key: 'instagram', label: 'Instagram',    icon: '📸', placeholder: 'https://instagram.com/...'          },
];

interface FeaturedProject {
  id:          string;
  name:        string;
  description: string;
  logo:        string;
  link:        string;
}

interface LandingData {
  heroTitle:        string;
  heroSubtitle:     string;
  stat1Value:       string;
  stat1Label:       string;
  stat2Value:       string;
  stat2Label:       string;
  stat3Value:       string;
  stat3Label:       string;
  socialLinks:      Record<string, string>;
  featuredProjects: FeaturedProject[];
}

const DEFAULT_DATA: LandingData = {
  heroTitle:    'The #1 DEX on BNB Chain',
  heroSubtitle: 'Trade, earn, and win crypto on the most popular decentralized exchange',
  stat1Value:   '$4.2B',
  stat1Label:   'Total Value Locked',
  stat2Value:   '$1.8B',
  stat2Label:   '24h Trading Volume',
  stat3Value:   '2.8M+',
  stat3Label:   'Active Users',
  socialLinks:  {},
  featuredProjects: [
    { id: '1', name: 'CAKE Token',   description: 'Stake CAKE to earn rewards and govern the protocol.',  logo: '🥞', link: '/earn/pools'   },
    { id: '2', name: 'Yield Farms',  description: 'Provide liquidity and earn CAKE and other tokens.',    logo: '🌾', link: '/earn/farms'   },
    { id: '3', name: 'Perpetuals',   description: 'Trade perpetual futures with up to 150x leverage.',   logo: '📈', link: '/perps'        },
  ],
};

const emptyProject = (): FeaturedProject => ({
  id:          Date.now().toString(),
  name:        '',
  description: '',
  logo:        '🪙',
  link:        '/',
});

export default function LandingPageAdmin() {
  const { token } = useAdmin();
  const { showToast, ToastComponent } = useAdminToast();
  const [data,    setData]    = useState<LandingData>(DEFAULT_DATA);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    fetch('/api/admin/data?section=landingPage')
      .then(r => r.json())
      .then(d => {
        if (d && d.heroTitle) {
          setData({
            ...DEFAULT_DATA,
            ...d,
            socialLinks:      { ...(d.socialLinks      || {}) },
            featuredProjects: Array.isArray(d.featuredProjects) ? d.featuredProjects : DEFAULT_DATA.featuredProjects,
          });
        }
      })
      .catch(() => {});
  }, []);

  const set = (key: keyof LandingData, val: any) => setData(d => ({ ...d, [key]: val }));
  const setSocial = (k: string, v: string) =>
    setData(d => ({ ...d, socialLinks: { ...d.socialLinks, [k]: v } }));

  const addProject   = () => set('featuredProjects', [...data.featuredProjects, emptyProject()]);
  const removeProject = (id: string) =>
    set('featuredProjects', data.featuredProjects.filter(p => p.id !== id));
  const updateProject = (id: string, field: keyof FeaturedProject, val: string) =>
    set('featuredProjects', data.featuredProjects.map(p => p.id === id ? { ...p, [field]: val } : p));

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/data', token, {
        method: 'POST',
        body: JSON.stringify({ section: 'landingPage', payload: data }),
      });
      if (res.ok) showToast('Landing page saved!');
      else showToast('Save failed', 'error');
    } catch { showToast('Network error', 'error'); }
    finally   { setSaving(false); }
  };

  return (
    <AdminLayout title="Landing Page">
      <PageDesc>Edit hero text, stats, social links, and featured projects shown on your homepage.</PageDesc>

      {/* ── Hero ── */}
      <Section>
        <SectionTitle>🦸 Hero Section</SectionTitle>
        <SectionDesc>The first thing visitors see at the top of your homepage.</SectionDesc>

        <FormRow>
          <Label>Main Headline</Label>
          <Input
            placeholder="The #1 DEX on BNB Chain"
            value={data.heroTitle}
            onChange={e => set('heroTitle', e.target.value)}
          />
          <Hint>Shown in large text above the swap widget on the homepage.</Hint>
        </FormRow>

        <FormRow>
          <Label>Subtitle</Label>
          <Textarea
            placeholder="Trade, earn, and win crypto on the most popular decentralized exchange"
            value={data.heroSubtitle}
            onChange={e => set('heroSubtitle', e.target.value)}
          />
          <Hint>Shown below the headline.</Hint>
        </FormRow>

        {/* Live preview */}
        <div style={{
          background: 'rgba(31,199,212,0.05)', border: '1px solid rgba(31,199,212,0.15)',
          borderRadius: 14, padding: '20px 24px',
        }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Preview
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'white', fontFamily: 'Kanit,sans-serif', marginBottom: 8 }}>
            {data.heroTitle || 'Your headline here'}
          </div>
          <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)' }}>
            {data.heroSubtitle || 'Your subtitle here'}
          </div>
        </div>
      </Section>

      {/* ── Stats ── */}
      <Section>
        <SectionTitle>📊 Stats Bar</SectionTitle>
        <SectionDesc>Three key metrics shown in the stats section below the hero.</SectionDesc>

        <FormGrid cols={3}>
          {/* Stat 1 */}
          <div>
            <Label style={{ marginBottom: 8, display: 'block' }}>Stat 1 Value</Label>
            <Input placeholder="$4.2B" value={data.stat1Value} onChange={e => set('stat1Value', e.target.value)} />
            <Label style={{ margin: '10px 0 8px', display: 'block' }}>Stat 1 Label</Label>
            <Input placeholder="Total Value Locked" value={data.stat1Label} onChange={e => set('stat1Label', e.target.value)} />
          </div>
          {/* Stat 2 */}
          <div>
            <Label style={{ marginBottom: 8, display: 'block' }}>Stat 2 Value</Label>
            <Input placeholder="$1.8B" value={data.stat2Value} onChange={e => set('stat2Value', e.target.value)} />
            <Label style={{ margin: '10px 0 8px', display: 'block' }}>Stat 2 Label</Label>
            <Input placeholder="24h Trading Volume" value={data.stat2Label} onChange={e => set('stat2Label', e.target.value)} />
          </div>
          {/* Stat 3 */}
          <div>
            <Label style={{ marginBottom: 8, display: 'block' }}>Stat 3 Value</Label>
            <Input placeholder="2.8M+" value={data.stat3Value} onChange={e => set('stat3Value', e.target.value)} />
            <Label style={{ margin: '10px 0 8px', display: 'block' }}>Stat 3 Label</Label>
            <Input placeholder="Active Users" value={data.stat3Label} onChange={e => set('stat3Label', e.target.value)} />
          </div>
        </FormGrid>

        {/* Stats preview */}
        <div style={{
          display: 'flex', gap: 0,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, overflow: 'hidden',
        }}>
          {[
            { val: data.stat1Value, lbl: data.stat1Label },
            { val: data.stat2Value, lbl: data.stat2Label },
            { val: data.stat3Value, lbl: data.stat3Label },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, padding: '16px 20px', textAlign: 'center',
              borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1FC7D4', fontFamily: 'Kanit,sans-serif' }}>{s.val || '—'}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{s.lbl || '—'}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Social Links ── */}
      <Section>
        <SectionTitle>🔗 Social Media Links</SectionTitle>
        <SectionDesc>Links shown in the footer and landing page. Leave blank to hide an icon.</SectionDesc>

        <FormGrid cols={2}>
          {SOCIAL_FIELDS.map(f => (
            <FormRow key={f.key}>
              <Label>{f.icon} {f.label}</Label>
              <Input
                placeholder={f.placeholder}
                value={data.socialLinks[f.key] || ''}
                onChange={e => setSocial(f.key, e.target.value)}
              />
            </FormRow>
          ))}
        </FormGrid>

        {/* Social preview */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
          {SOCIAL_FIELDS.filter(f => data.socialLinks[f.key]).map(f => (
            <div key={f.key} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 20,
              background: 'rgba(31,199,212,0.12)',
              border: '1px solid rgba(31,199,212,0.25)',
              fontSize: 13, color: '#1FC7D4',
            }}>
              <span>{f.icon}</span>
              <span style={{ fontWeight: 600, fontFamily: 'Kanit,sans-serif' }}>{f.label}</span>
            </div>
          ))}
          {SOCIAL_FIELDS.filter(f => data.socialLinks[f.key]).length === 0 && (
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>No social links set yet</div>
          )}
        </div>
      </Section>

      {/* ── Featured Projects ── */}
      <Section>
        <SectionTitle>⭐ Featured on Exchange</SectionTitle>
        <SectionDesc>Up to 6 cards shown in the "Featured" section on the landing page. Same as PancakeSwap's featured section.</SectionDesc>

        {data.featuredProjects.map((project, idx) => (
          <div key={project.id} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: 18, marginBottom: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Badge>Feature #{idx + 1}</Badge>
              <DangerBtn onClick={() => removeProject(project.id)} style={{ padding: '6px 14px', fontSize: 13 }}>
                Remove
              </DangerBtn>
            </div>

            <FormGrid cols={2}>
              <FormRow>
                <Label>Project Name</Label>
                <Input
                  placeholder="CAKE Token"
                  value={project.name}
                  onChange={e => updateProject(project.id, 'name', e.target.value)}
                />
              </FormRow>
              <FormRow>
                <Label>Logo Emoji / Icon</Label>
                <Input
                  placeholder="🥞"
                  value={project.logo}
                  onChange={e => updateProject(project.id, 'logo', e.target.value)}
                  style={{ fontSize: 20 }}
                />
              </FormRow>
            </FormGrid>

            <FormRow>
              <Label>Short Description</Label>
              <Input
                placeholder="Stake CAKE to earn rewards and govern the protocol."
                value={project.description}
                onChange={e => updateProject(project.id, 'description', e.target.value)}
              />
            </FormRow>

            <FormRow>
              <Label>Link (URL or path)</Label>
              <Input
                placeholder="/earn/pools"
                value={project.link}
                onChange={e => updateProject(project.id, 'link', e.target.value)}
              />
              <Hint>Use a path like /earn/pools or a full URL like https://example.com</Hint>
            </FormRow>

            {/* Card preview */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12, padding: '14px 16px',
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <div style={{ fontSize: 32, flexShrink: 0 }}>{project.logo || '🪙'}</div>
              <div>
                <div style={{ fontWeight: 700, color: 'white', fontFamily: 'Kanit,sans-serif', marginBottom: 4 }}>
                  {project.name || 'Project Name'}
                </div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>
                  {project.description || 'Description will appear here'}
                </div>
              </div>
            </div>
          </div>
        ))}

        {data.featuredProjects.length < 6 && (
          <SecondaryBtn onClick={addProject} style={{ width: '100%', padding: '14px', fontSize: 15 }}>
            + Add Featured Project
          </SecondaryBtn>
        )}
        {data.featuredProjects.length >= 6 && (
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 8 }}>
            Maximum 6 featured projects reached
          </div>
        )}
      </Section>

      <SaveBtn $loading={saving} onClick={handleSave}>
        {saving ? 'Saving…' : '💾 Save Landing Page'}
      </SaveBtn>

      {ToastComponent}
    </AdminLayout>
  );
}
