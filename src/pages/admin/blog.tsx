import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Section, SectionTitle, SectionDesc,
  FormRow, FormGrid, Label, Hint,
  Input, Textarea, Select, SaveBtn,
  SecondaryBtn, DangerBtn, Badge,
  PageDesc, Divider, useAdminToast,
} from '../../components/admin/AdminUI';
import { useAdmin, adminFetch } from '../../context/AdminContext';

interface BlogPost {
  id:          string;
  title:       string;
  excerpt:     string;
  content:     string;
  category:    string;
  coverEmoji:  string;
  author:      string;
  published:   boolean;
  createdAt:   string;
}

const CATEGORIES = ['Announcements', 'Tutorials', 'Updates', 'Community', 'DeFi', 'Security'];

const emptyPost = (): BlogPost => ({
  id:         Date.now().toString(),
  title:      '',
  excerpt:    '',
  content:    '',
  category:   'Announcements',
  coverEmoji: '📰',
  author:     'Admin',
  published:  false,
  createdAt:  new Date().toISOString(),
});

export default function BlogAdminPage() {
  const { token } = useAdmin();
  const { showToast, ToastComponent } = useAdminToast();
  const [posts,   setPosts]  = useState<BlogPost[]>([]);
  const [editing, setEditing]= useState<BlogPost | null>(null);
  const [saving,  setSaving] = useState(false);
  const [view,    setView]   = useState<'list' | 'edit'>('list');

  useEffect(() => {
    fetch('/api/admin/data?section=blogPosts')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setPosts(d); })
      .catch(() => {});
  }, []);

  const saveAll = async (updated: BlogPost[]) => {
    if (!token) return;
    setSaving(true);
    try {
      const res = await adminFetch('/api/admin/data', token, {
        method: 'POST',
        body: JSON.stringify({ section: 'blogPosts', payload: updated }),
      });
      if (res.ok) { setPosts(updated); showToast('Blog posts saved!'); }
      else showToast('Save failed', 'error');
    } catch { showToast('Network error', 'error'); }
    finally   { setSaving(false); }
  };

  const handleNew = () => { setEditing(emptyPost()); setView('edit'); };

  const handleEdit = (post: BlogPost) => { setEditing({ ...post }); setView('edit'); };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this post?')) return;
    saveAll(posts.filter(p => p.id !== id));
  };

  const handleSavePost = () => {
    if (!editing) return;
    const exists = posts.find(p => p.id === editing.id);
    const updated = exists
      ? posts.map(p => p.id === editing.id ? editing : p)
      : [...posts, editing];
    saveAll(updated);
    setView('list');
    setEditing(null);
  };

  const setField = (k: keyof BlogPost, v: any) =>
    setEditing(e => e ? { ...e, [k]: v } : null);

  const togglePublish = (id: string) => {
    const updated = posts.map(p => p.id === id ? { ...p, published: !p.published } : p);
    saveAll(updated);
  };

  if (view === 'edit' && editing) {
    return (
      <AdminLayout title={editing.title ? `Edit: ${editing.title}` : 'New Post'}>
        <div style={{ marginBottom: 16 }}>
          <SecondaryBtn onClick={() => { setView('list'); setEditing(null); }}>
            ← Back to Posts
          </SecondaryBtn>
        </div>

        <Section>
          <SectionTitle>📝 Post Details</SectionTitle>

          <FormGrid cols={2}>
            <FormRow>
              <Label>Title</Label>
              <Input
                placeholder="Post title…"
                value={editing.title}
                onChange={e => setField('title', e.target.value)}
              />
            </FormRow>
            <FormRow>
              <Label>Cover Emoji</Label>
              <Input
                placeholder="📰"
                value={editing.coverEmoji}
                onChange={e => setField('coverEmoji', e.target.value)}
                style={{ fontSize: 22 }}
              />
            </FormRow>
          </FormGrid>

          <FormGrid cols={2}>
            <FormRow>
              <Label>Category</Label>
              <Select value={editing.category} onChange={e => setField('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </FormRow>
            <FormRow>
              <Label>Author</Label>
              <Input
                placeholder="Admin"
                value={editing.author}
                onChange={e => setField('author', e.target.value)}
              />
            </FormRow>
          </FormGrid>

          <FormRow>
            <Label>Excerpt (short description)</Label>
            <Textarea
              placeholder="A short summary shown in the blog listing…"
              value={editing.excerpt}
              onChange={e => setField('excerpt', e.target.value)}
              style={{ minHeight: 70 }}
            />
          </FormRow>

          <FormRow>
            <Label>Full Content</Label>
            <Textarea
              placeholder="Write your full post content here. Markdown is supported."
              value={editing.content}
              onChange={e => setField('content', e.target.value)}
              style={{ minHeight: 260 }}
            />
            <Hint>Supports basic Markdown: **bold**, *italic*, ## Heading, - list items</Hint>
          </FormRow>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 14, fontFamily: 'Kanit,sans-serif' }}>
              <input
                type="checkbox"
                checked={editing.published}
                onChange={e => setField('published', e.target.checked)}
                style={{ width: 16, height: 16, cursor: 'pointer' }}
              />
              Publish immediately
            </label>
          </div>
        </Section>

        <div style={{ display: 'flex', gap: 12 }}>
          <SaveBtn $loading={saving} onClick={handleSavePost}>
            {saving ? 'Saving…' : '💾 Save Post'}
          </SaveBtn>
          <SecondaryBtn onClick={() => { setView('list'); setEditing(null); }}>Cancel</SecondaryBtn>
        </div>

        {ToastComponent}
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Blog Posts">
      <PageDesc>Create, edit, and manage blog posts shown in the Board → Blog section.</PageDesc>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <SaveBtn onClick={handleNew}>+ New Post</SaveBtn>
      </div>

      <Section>
        <SectionTitle>📋 All Posts <Badge $color="#7645D9">{posts.length}</Badge></SectionTitle>

        {posts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>
            No blog posts yet. Click "+ New Post" to create one.
          </div>
        )}

        {posts.map(post => (
          <div key={post.id} style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: '16px 18px', marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
          }}>
            <div style={{ fontSize: 28, flexShrink: 0 }}>{post.coverEmoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, color: 'white', fontFamily: 'Kanit,sans-serif', marginBottom: 4 }}>
                {post.title || 'Untitled Post'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Badge $color="#7645D9">{post.category}</Badge>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                  {new Date(post.createdAt).toLocaleDateString()} · {post.author}
                </span>
                <Badge $color={post.published ? '#31D0AA' : '#FFB237'}>
                  {post.published ? '✓ Published' : '⏳ Draft'}
                </Badge>
              </div>
              {post.excerpt && (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.excerpt}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <SecondaryBtn onClick={() => togglePublish(post.id)} style={{ padding: '7px 14px', fontSize: 13 }}>
                {post.published ? 'Unpublish' : 'Publish'}
              </SecondaryBtn>
              <SecondaryBtn onClick={() => handleEdit(post)} style={{ padding: '7px 14px', fontSize: 13 }}>
                ✏️ Edit
              </SecondaryBtn>
              <DangerBtn onClick={() => handleDelete(post.id)} style={{ padding: '7px 14px', fontSize: 13 }}>
                Delete
              </DangerBtn>
            </div>
          </div>
        ))}
      </Section>

      {ToastComponent}
    </AdminLayout>
  );
}
