import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Section, SectionTitle, SectionDesc,
  FormRow, FormGrid, Label, Hint,
  Input, Select, SaveBtn, DangerBtn,
  SecondaryBtn, Badge, PageDesc, Divider,
  useAdminToast,
} from '../../components/admin/AdminUI';
import { useAdmin, adminFetch } from '../../context/AdminContext';

interface AdminUser {
  id:        string;
  username:  string;
  email:     string;
  role:      string;
  createdAt: string;
}

export default function AdminsPage() {
  const { token, user: currentUser } = useAdmin();
  const { showToast, ToastComponent }  = useAdminToast();
  const [admins,   setAdmins]   = useState<AdminUser[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [adding,   setAdding]   = useState(false);
  const [form,     setForm]     = useState({ username: '', password: '', email: '', role: 'admin' });
  const [saving,   setSaving]   = useState(false);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/admins', token);
      if (res.ok) setAdmins(await res.json());
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [token]);

  const handleAdd = async () => {
    if (!form.username || !form.password) { showToast('Username and password are required', 'error'); return; }
    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/admins', token!, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Admin "${form.username}" added!`);
        setForm({ username: '', password: '', email: '', role: 'admin' });
        setAdding(false);
        load();
      } else {
        showToast(data.error || 'Failed to add admin', 'error');
      }
    } catch { showToast('Network error', 'error'); }
    finally   { setSaving(false); }
  };

  const handleDelete = async (id: string, username: string) => {
    if (!confirm(`Remove admin "${username}"? This cannot be undone.`)) return;
    try {
      const res = await adminFetch(`/api/admin/admins?id=${id}`, token!, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) { showToast(`Admin "${username}" removed`); load(); }
      else showToast(data.error || 'Failed to remove', 'error');
    } catch { showToast('Network error', 'error'); }
  };

  const roleColor = (role: string) =>
    role === 'superadmin' ? '#FFB237' : '#1FC7D4';

  return (
    <AdminLayout title="Admin Users">
      <PageDesc>Manage who has access to this admin panel. You can add multiple admins with different roles.</PageDesc>

      {/* Add admin */}
      <Section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: adding ? 20 : 0 }}>
          <SectionTitle style={{ margin: 0 }}>➕ Add New Admin</SectionTitle>
          <SecondaryBtn onClick={() => setAdding(v => !v)}>
            {adding ? 'Cancel' : '+ Add Admin'}
          </SecondaryBtn>
        </div>

        {adding && (
          <>
            <Divider />
            <FormGrid cols={2}>
              <FormRow>
                <Label>Username *</Label>
                <Input
                  placeholder="newadmin"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  autoFocus
                />
              </FormRow>
              <FormRow>
                <Label>Password *</Label>
                <Input
                  type="password"
                  placeholder="Strong password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <Hint>Min 8 characters recommended</Hint>
              </FormRow>
              <FormRow>
                <Label>Email (optional)</Label>
                <Input
                  type="email"
                  placeholder="admin@yourexchange.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
              </FormRow>
              <FormRow>
                <Label>Role</Label>
                <Select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="admin">Admin — Standard access</option>
                  <option value="superadmin">Superadmin — Full access</option>
                  <option value="editor">Editor — Blog & content only</option>
                </Select>
              </FormRow>
            </FormGrid>
            <SaveBtn $loading={saving} onClick={handleAdd}>
              {saving ? 'Adding…' : '+ Add Admin'}
            </SaveBtn>
          </>
        )}
      </Section>

      {/* Current admins list */}
      <Section>
        <SectionTitle>
          👥 Current Admins
          <Badge $color="#7645D9">{admins.length}</Badge>
        </SectionTitle>

        {loading && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.4)' }}>Loading…</div>
        )}

        {!loading && admins.map(admin => (
          <div key={admin.id} style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${admin.id === currentUser?.id ? 'rgba(31,199,212,0.3)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 14, padding: '16px 18px', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
          }}>
            {/* Avatar */}
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: `linear-gradient(135deg, ${roleColor(admin.role)}, #7645D9)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {admin.username[0]?.toUpperCase()}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: 'white', fontFamily: 'Kanit,sans-serif' }}>{admin.username}</span>
                <Badge $color={roleColor(admin.role)}>{admin.role}</Badge>
                {admin.id === currentUser?.id && <Badge $color="#31D0AA">You</Badge>}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                {admin.email || 'No email set'} · Added {new Date(admin.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* Actions — can't delete yourself or the last superadmin */}
            {admin.id !== currentUser?.id && (
              <DangerBtn
                onClick={() => handleDelete(admin.id, admin.username)}
                style={{ padding: '7px 14px', fontSize: 13 }}
              >
                Remove
              </DangerBtn>
            )}
          </div>
        ))}
      </Section>

      {/* Role descriptions */}
      <Section>
        <SectionTitle>🔑 Role Permissions</SectionTitle>
        {[
          { role: 'superadmin', color: '#FFB237', desc: 'Full access to all settings, tokens, perps, fees, and admin management.' },
          { role: 'admin',      color: '#1FC7D4', desc: 'Full access to all settings except adding/removing other admins.' },
          { role: 'editor',     color: '#31D0AA', desc: 'Can only edit blog posts and landing page content.' },
        ].map(r => (
          <div key={r.role} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <Badge $color={r.color} style={{ flexShrink: 0, marginTop: 2 }}>{r.role}</Badge>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{r.desc}</div>
          </div>
        ))}
      </Section>

      {ToastComponent}
    </AdminLayout>
  );
}
