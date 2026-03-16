import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useBlog, BlogPost, BlogCategory } from '../../hooks/useBlog';
import { Text, Heading } from '../../components/ui/Typography';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import PageHeader from '../../components/layout/PageHeader';

/* ─── Animations ─────────────────────────────────────────────────────────── */
const fadeIn = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const Page    = styled.div`min-height:calc(100vh - 56px); background:${({ theme }) => theme.colors.background};`;
const Content = styled.div`max-width:1200px; margin:0 auto; padding:28px 24px 60px;`;

/* Featured */
const FeaturedGrid = styled.div`
  display:grid; grid-template-columns:2fr 1fr; gap:20px; margin-bottom:36px;
  @media(max-width:768px){grid-template-columns:1fr;}
`;

const FeaturedCard = styled.div`
  background:${({ theme }) => theme.colors.backgroundAlt};
  border:1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius:24px; overflow:hidden; cursor:pointer;
  transition:all 0.2s;
  &:hover{transform:translateY(-3px); box-shadow:0 12px 32px rgba(0,0,0,0.1); border-color:${({ theme }) => theme.colors.primary};}
`;
const FeaturedBanner = styled.div<{$color:string}>`
  height:180px; background:${({ $color }) => $color};
  display:flex; align-items:center; justify-content:center; position:relative;
`;
const FeaturedEmoji = styled.div`font-size:72px; filter:drop-shadow(0 4px 12px rgba(0,0,0,0.25));`;
const FeaturedBody  = styled.div`padding:20px 22px;`;

const SmallCard = styled.div`
  background:${({ theme }) => theme.colors.backgroundAlt};
  border:1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius:20px; overflow:hidden; cursor:pointer;
  transition:all 0.2s;
  &:hover{transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,0.08); border-color:${({ theme }) => theme.colors.primary};}
`;
const SmallBanner = styled.div<{$color:string}>`
  height:100px; background:${({ $color }) => $color};
  display:flex; align-items:center; justify-content:center;
`;
const SmallBody   = styled.div`padding:14px 16px;`;

/* Grid */
const Controls = styled.div`display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:18px;`;

const CatChip = styled.button<{active?:boolean}>`
  padding:6px 14px; border-radius:20px;
  font-size:13px; font-weight:600; font-family:'Kanit',sans-serif;
  border:1px solid ${({ active,theme }) => active ? theme.colors.primary : theme.colors.cardBorder};
  background:${({ active,theme }) => active ? theme.colors.primary+'15' : 'transparent'};
  color:${({ active,theme }) => active ? theme.colors.primary : theme.colors.textSubtle};
  cursor:pointer; transition:all 0.15s; white-space:nowrap;
`;

const PostsGrid = styled.div`
  display:grid; grid-template-columns:repeat(auto-fill,minmax(340px,1fr)); gap:20px;
`;
const PostCard = styled.div`
  background:${({ theme }) => theme.colors.backgroundAlt};
  border:1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius:20px; overflow:hidden; cursor:pointer;
  transition:all 0.2s;
  &:hover{transform:translateY(-3px); box-shadow:0 8px 24px rgba(0,0,0,0.1); border-color:${({ theme }) => theme.colors.primary};}
`;
const PostBanner = styled.div<{$color:string}>`
  height:100px; background:${({ $color }) => $color};
  display:flex; align-items:center; justify-content:center;
  font-size:48px; filter:drop-shadow(0 2px 8px rgba(0,0,0,0.2));
`;
const PostBody   = styled.div`padding:16px 18px;`;
const PostTitle  = styled.div`font-size:16px; font-weight:700; color:${({ theme }) => theme.colors.text}; margin:8px 0 6px; line-height:1.3;`;
const PostExcerpt= styled.div`font-size:13px; color:${({ theme }) => theme.colors.textSubtle}; line-height:1.5; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-bottom:12px;`;
const PostMeta   = styled.div`display:flex; align-items:center; gap:8px; flex-wrap:wrap;`;

/* Detail view */
const DetailPage = styled.div`
  max-width:780px; margin:0 auto; animation:${fadeIn} 0.3s ease;
`;
const DetailBanner = styled.div<{$color:string}>`
  height:220px; border-radius:20px;
  background:${({ $color }) => $color};
  display:flex; align-items:center; justify-content:center;
  font-size:96px; margin-bottom:28px;
  filter:drop-shadow(0 8px 24px rgba(0,0,0,0.2));
`;
const DetailBody = styled.div`
  background:${({ theme }) => theme.colors.backgroundAlt};
  border:1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius:20px; padding:32px;
`;
const MDBody = styled.div`
  font-size:15px; line-height:1.8; color:${({ theme }) => theme.colors.text};
  h1{font-size:24px;font-weight:700;margin:0 0 16px;color:${({ theme }) => theme.colors.text};}
  h2{font-size:19px;font-weight:700;margin:24px 0 10px;color:${({ theme }) => theme.colors.text};}
  h3{font-size:16px;font-weight:700;margin:16px 0 8px;color:${({ theme }) => theme.colors.text};}
  p{margin:0 0 14px;}
  ul{padding-left:22px;margin:0 0 14px;}
  li{margin-bottom:6px;}
  strong{font-weight:700;}
  code{background:${({ theme }) => theme.colors.input};padding:2px 6px;border-radius:4px;font-size:13px;font-family:'Roboto Mono',monospace;}
`;

/* Colors per category */
const CAT_COLORS: Record<string, string> = {
  Product:     'linear-gradient(135deg,#0098A1,#7645D9)',
  Tutorial:    'linear-gradient(135deg,#31D0AA,#1FC7D4)',
  Tokenomics:  'linear-gradient(135deg,#ED4B9E,#FF6B6B)',
  Community:   'linear-gradient(135deg,#F0B90B,#FFB237)',
  Partnership: 'linear-gradient(135deg,#7645D9,#ED4B9E)',
  Security:    'linear-gradient(135deg,#280D5F,#7645D9)',
};

const renderMd = (text: string) =>
  text
    .replace(/^# (.*)/gm,   '<h1>$1</h1>')
    .replace(/^## (.*)/gm,  '<h2>$1</h2>')
    .replace(/^### (.*)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g,    '<code>$1</code>')
    .replace(/^- (.*)/gm,   '<li>$1</li>')
    .replace(/(<li>.*<\/li>(\n|$))+/gs, m => `<ul>${m}</ul>`)
    .split('\n\n')
    .map(p => p.startsWith('<') ? p : p.trim() ? `<p>${p}</p>` : '')
    .join('');

const fmt = (n:number) => n>=1000 ? `${(n/1000).toFixed(1)}K` : String(n);

export default function BlogPage() {
  const {
    posts, featured, categories,
    activeCategory, setActiveCategory, search, setSearch,
    selectedPost, setSelectedPost, likedPosts, toggleLike,
  } = useBlog();

  /* ── Detail view ── */
  if (selectedPost) {
    return (
      <Page>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'20px 24px 60px' }}>
          <Button scale="sm" variant="tertiary" onClick={() => setSelectedPost(null)} style={{ marginBottom:20 }}>
            ← Back to Blog
          </Button>
          <DetailPage>
            <DetailBanner $color={CAT_COLORS[selectedPost.category]}>
              {selectedPost.coverEmoji}
            </DetailBanner>
            <DetailBody>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
                <Badge variant="secondary">{selectedPost.category}</Badge>
                {selectedPost.tags.map(t => <Badge key={t}>{t}</Badge>)}
              </div>
              <Heading scale="lg" style={{ marginBottom:12, lineHeight:1.2 }}>{selectedPost.title}</Heading>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24, flexWrap:'wrap' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:20 }}>{selectedPost.authorAvatar}</span>
                  <Text small bold>{selectedPost.author}</Text>
                </div>
                <Text small color="textSubtle">{new Date(selectedPost.publishedAt).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}</Text>
                <Text small color="textSubtle">⏱ {selectedPost.readTime} min read</Text>
                <Text small color="textSubtle">👁 {fmt(selectedPost.views)} views</Text>
              </div>
              <MDBody dangerouslySetInnerHTML={{ __html: renderMd(selectedPost.body) }} />
              <div style={{ display:'flex', gap:12, marginTop:24, paddingTop:20, borderTop:'1px solid', flexWrap:'wrap' }}>
                <Button
                  scale="sm" variant={likedPosts.has(selectedPost.id) ? 'secondary' : 'tertiary'}
                  onClick={() => toggleLike(selectedPost.id)}
                >
                  {likedPosts.has(selectedPost.id) ? '❤️' : '🤍'} {selectedPost.likes + (likedPosts.has(selectedPost.id) ? 1 : 0)} Likes
                </Button>
                <Button scale="sm" variant="subtle" onClick={() => window.open('https://twitter.com', '_blank')}>
                  🐦 Share on Twitter
                </Button>
              </div>
            </DetailBody>
          </DetailPage>
        </div>
      </Page>
    );
  }

  /* ── List view ── */
  return (
    <Page>
      <PageHeader
        title="📝 Blog"
        subtitle="News, updates and DeFi insights from the PancakeSwap team"
        background="linear-gradient(139.73deg,#E5FDFF 0%,#F3EFFF 100%)"
      />
      <Content>

        {/* Featured posts */}
        {featured.length > 0 && (
          <>
            <Heading scale="md" style={{ marginBottom:16 }}>✨ Featured</Heading>
            <FeaturedGrid>
              <FeaturedCard onClick={() => setSelectedPost(featured[0])}>
                <FeaturedBanner $color={CAT_COLORS[featured[0].category]}>
                  <FeaturedEmoji>{featured[0].coverEmoji}</FeaturedEmoji>
                  <div style={{ position:'absolute', top:12, left:12 }}>
                    <Badge variant="secondary">{featured[0].category}</Badge>
                  </div>
                </FeaturedBanner>
                <FeaturedBody>
                  <PostTitle style={{ fontSize:20 }}>{featured[0].title}</PostTitle>
                  <PostExcerpt style={{ WebkitLineClamp:3 }}>{featured[0].excerpt}</PostExcerpt>
                  <PostMeta>
                    <Text small color="textSubtle">{featured[0].authorAvatar} {featured[0].author}</Text>
                    <Text small color="textSubtle">·</Text>
                    <Text small color="textSubtle">⏱ {featured[0].readTime}m</Text>
                    <Text small color="textSubtle">·</Text>
                    <Text small color="textSubtle">👁 {fmt(featured[0].views)}</Text>
                    <Text small color="textSubtle">·</Text>
                    <Text small color="textSubtle">❤️ {fmt(featured[0].likes)}</Text>
                  </PostMeta>
                </FeaturedBody>
              </FeaturedCard>

              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {featured.slice(1, 3).map(post => (
                  <SmallCard key={post.id} onClick={() => setSelectedPost(post)}>
                    <SmallBanner $color={CAT_COLORS[post.category]}>
                      <span style={{ fontSize:44 }}>{post.coverEmoji}</span>
                    </SmallBanner>
                    <SmallBody>
                      <Badge variant="secondary" style={{ marginBottom:6 }}>{post.category}</Badge>
                      <PostTitle style={{ fontSize:15 }}>{post.title}</PostTitle>
                      <PostMeta>
                        <Text small color="textSubtle">⏱ {post.readTime}m</Text>
                        <Text small color="textSubtle">👁 {fmt(post.views)}</Text>
                        <Text small color="textSubtle">{new Date(post.publishedAt).toLocaleDateString()}</Text>
                      </PostMeta>
                    </SmallBody>
                  </SmallCard>
                ))}
              </div>
            </FeaturedGrid>
          </>
        )}

        {/* Controls */}
        <Controls>
          {categories.map(c => (
            <CatChip key={c} active={activeCategory===c} onClick={() => setActiveCategory(c)}>
              {c}
            </CatChip>
          ))}
          <div style={{ flex:1 }} />
          <Input
            placeholder="🔍 Search posts"
            value={search}
            onChange={e => setSearch(e.target.value)}
            scale="sm"
            style={{ maxWidth:240 }}
          />
        </Controls>

        {/* All posts grid */}
        <PostsGrid>
          {posts.length === 0 ? (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'60px 0' }}>
              <Text style={{ fontSize:40 }}>📝</Text>
              <Text color="textSubtle" style={{ fontSize:18, marginTop:12 }}>No posts found</Text>
            </div>
          ) : posts.map(post => (
            <PostCard key={post.id} onClick={() => setSelectedPost(post)}>
              <PostBanner $color={CAT_COLORS[post.category]}>{post.coverEmoji}</PostBanner>
              <PostBody>
                <div style={{ display:'flex', gap:6, marginBottom:2 }}>
                  <Badge variant="secondary">{post.category}</Badge>
                  {post.featured && <Badge variant="info">⭐ Featured</Badge>}
                </div>
                <PostTitle>{post.title}</PostTitle>
                <PostExcerpt>{post.excerpt}</PostExcerpt>
                <PostMeta>
                  <span style={{ fontSize:16 }}>{post.authorAvatar}</span>
                  <Text small color="textSubtle">{post.author}</Text>
                  <Text small color="textSubtle">·</Text>
                  <Text small color="textSubtle">⏱ {post.readTime}m</Text>
                  <Text small color="textSubtle">·</Text>
                  <Text small color="textSubtle">👁 {fmt(post.views)}</Text>
                  <Text small color="textSubtle">·</Text>
                  <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:4 }}>
                    <button
                      onClick={e => { e.stopPropagation(); toggleLike(post.id); }}
                      style={{ background:'none', border:'none', cursor:'pointer', fontSize:14 }}
                    >
                      {likedPosts.has(post.id) ? '❤️' : '🤍'}
                    </button>
                    <Text small color="textSubtle">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</Text>
                  </div>
                </PostMeta>
              </PostBody>
            </PostCard>
          ))}
        </PostsGrid>
      </Content>
    </Page>
  );
}
