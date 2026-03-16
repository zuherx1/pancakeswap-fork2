import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { Button } from '../components/ui/Button';
import { BunnyIcon } from '../components/ui/Icons';

/* ─── Animations ─────────────────────────────────────────────────────────── */
const float   = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}`;
const fadeUp  = keyframes`from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}`;
const shimmer = keyframes`0%{background-position:-400px 0}100%{background-position:400px 0}`;
const spin    = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;

/* ─── Hero ─────────────────────────────────────────────────────────────── */
const Hero = styled.section`
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  padding: 80px 24px 72px;
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const HeroBg = styled.div`
  position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(ellipse 80% 60% at 50% 0%, ${({ theme }) => theme.colors.primary}18, transparent 70%);
`;

const BunnyFloat = styled.div`
  animation: ${float} 3.2s ease-in-out infinite;
  display: inline-block; margin-bottom: 28px;
`;

const HeroTitle = styled.h1`
  font-size: clamp(32px, 6vw, 68px);
  font-weight: 700; color: ${({ theme }) => theme.colors.text};
  margin: 0 0 16px; line-height: 1.1;
  font-family: 'Kanit', sans-serif;
  animation: ${fadeUp} 0.5s ease;
`;

const HeroSub = styled.p`
  font-size: clamp(16px, 2.5vw, 20px);
  color: ${({ theme }) => theme.colors.textSubtle};
  margin: 0 0 40px; max-width: 600px; margin-left: auto; margin-right: auto;
  animation: ${fadeUp} 0.5s 0.1s ease both;
`;

const HeroBtns = styled.div`
  display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
  animation: ${fadeUp} 0.5s 0.2s ease both;
`;

const StatsRow = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr);
  max-width: 820px; margin: 56px auto 0; gap: 20px;
  animation: ${fadeUp} 0.5s 0.3s ease both;
  @media(max-width:576px){ grid-template-columns:1fr; }
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px; padding: 24px;
  backdrop-filter: blur(8px);
  transition: transform 0.2s, border-color 0.2s;
  &:hover { transform: translateY(-3px); border-color: ${({ theme }) => theme.colors.primary}; }
`;

const StatValue = styled.div`
  font-size: 32px; font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif;
`;

const StatLabel = styled.div`
  font-size: 13px; color: ${({ theme }) => theme.colors.textSubtle}; margin-top: 4px;
`;

/* ─── Social strip ──────────────────────────────────────────────────────── */
const SocialStrip = styled.div`
  display: flex; justify-content: center; align-items: center;
  gap: 8px; margin-top: 40px; flex-wrap: wrap;
`;

const SocialChip = styled.a`
  display: flex; align-items: center; gap: 7px;
  padding: 8px 16px; border-radius: 20px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 13px; font-weight: 600; font-family: 'Kanit',sans-serif;
  text-decoration: none; transition: all 0.15s;
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.input};
    text-decoration: none;
  }
`;

/* ─── Page sections wrapper ─────────────────────────────────────────────── */
const PageSection = styled.section`
  max-width: 1200px; margin: 0 auto; padding: 72px 24px;
`;

const SectionTag = styled.div`
  display: inline-block;
  padding: 4px 14px; border-radius: 20px; margin-bottom: 14px;
  background: ${({ theme }) => theme.colors.primary}18;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 13px; font-weight: 700; font-family: 'Kanit',sans-serif;
  border: 1px solid ${({ theme }) => theme.colors.primary}30;
`;

const SectionH2 = styled.h2`
  font-size: clamp(28px, 4vw, 42px); font-weight: 700;
  color: ${({ theme }) => theme.colors.text}; margin: 0 0 10px;
  font-family: 'Kanit', sans-serif;
`;

const SectionSub = styled.p`
  font-size: 16px; color: ${({ theme }) => theme.colors.textSubtle}; margin: 0 0 48px;
  max-width: 560px;
`;

/* ─── Featured section ──────────────────────────────────────────────────── */
const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const FeaturedCard = styled.a`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px; padding: 28px;
  text-decoration: none; display: block;
  transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-5px);
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 12px 32px rgba(0,0,0,0.1);
    text-decoration: none;
  }
`;

const FeaturedLogo = styled.div`
  font-size: 44px; margin-bottom: 14px;
`;

const FeaturedName = styled.div`
  font-size: 18px; font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit',sans-serif; margin-bottom: 8px;
`;

const FeaturedDesc = styled.div`
  font-size: 13px; color: ${({ theme }) => theme.colors.textSubtle};
  line-height: 1.6; margin-bottom: 18px;
`;

const ArrowLink = styled.div`
  font-size: 13px; font-weight: 700; color: ${({ theme }) => theme.colors.primary};
  font-family: 'Kanit',sans-serif; display: flex; align-items: center; gap: 4px;
`;

/* ─── Swap Best Prices section ──────────────────────────────────────────── */
const SwapBestWrap = styled.div`
  display: flex; gap: 48px; align-items: center;
  @media(max-width:820px){ flex-direction:column; }
`;

const SwapBestText = styled.div`flex: 1;`;

const SwapBestVisual = styled.div`
  flex: 1; max-width: 460px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px; padding: 28px;
`;

const PriceRow = styled.div`
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  &:last-child { border-bottom: none; }
`;

const PairName = styled.div`
  display: flex; align-items: center; gap: 10px;
  font-size: 15px; font-weight: 700; color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit',sans-serif;
`;

const PriceInfo = styled.div`text-align: right;`;

const PriceVal = styled.div`
  font-size: 15px; font-weight: 700; color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit',sans-serif;
`;

const PriceChange = styled.div<{ $up: boolean }>`
  font-size: 12px; font-weight: 600;
  color: ${({ $up, theme }) => $up ? theme.colors.success : theme.colors.danger};
`;

const TokenDot = styled.div<{ $color: string }>`
  width: 32px; height: 32px; border-radius: 50%;
  background: ${({ $color }) => $color};
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; flex-shrink: 0;
`;

const CheckList = styled.ul`
  list-style: none; padding: 0; margin: 0 0 28px; display: flex; flex-direction: column; gap: 12px;
`;

const CheckItem = styled.li`
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 15px; color: ${({ theme }) => theme.colors.textSubtle}; line-height: 1.5;
`;

const CheckDot = styled.div`
  width: 22px; height: 22px; border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary}20;
  border: 1px solid ${({ theme }) => theme.colors.primary}40;
  display: flex; align-items: center; justify-content: center;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px; flex-shrink: 0; margin-top: 2px;
`;

/* ─── Earn Trading Fees section ─────────────────────────────────────────── */
const EarnWrap = styled.div`
  display: flex; gap: 48px; align-items: center;
  @media(max-width:820px){ flex-direction:column-reverse; }
`;

const EarnGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
  flex: 1; max-width: 460px;
  @media(max-width:480px){ grid-template-columns:1fr; }
`;

const EarnCard = styled.div<{ $accent: string }>`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 18px; padding: 20px;
  border-top: 3px solid ${({ $accent }) => $accent};
  transition: transform 0.2s;
  &:hover { transform: translateY(-3px); }
`;

const EarnIcon = styled.div`font-size: 28px; margin-bottom: 8px;`;
const EarnLabel = styled.div`
  font-size: 14px; font-weight: 700;
  color: ${({ theme }) => theme.colors.text}; margin-bottom: 4px;
  font-family: 'Kanit',sans-serif;
`;
const EarnApr = styled.div<{ $color: string }>`
  font-size: 22px; font-weight: 700;
  color: ${({ $color }) => $color}; font-family: 'Kanit',sans-serif;
`;
const EarnSub = styled.div`font-size: 12px; color: ${({ theme }) => theme.colors.textSubtle};`;

/* ─── Feature Grid section ──────────────────────────────────────────────── */
const FeatureGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px;
`;

const FeatureCard = styled.a`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 24px; padding: 28px;
  text-decoration: none; display: block;
  transition: transform 0.2s, border-color 0.2s;
  &:hover {
    transform: translateY(-4px); border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 12px 32px rgba(0,0,0,0.08); text-decoration: none;
  }
`;

const FeatureIcon = styled.div`font-size: 44px; margin-bottom: 16px;`;
const FeatureTitle = styled.h3`
  font-size: 20px; font-weight: 700; color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px; font-family: 'Kanit',sans-serif;
`;
const FeatureDesc = styled.p`
  font-size: 14px; color: ${({ theme }) => theme.colors.textSubtle};
  margin: 0 0 18px; line-height: 1.6;
`;

/* ─── Data ───────────────────────────────────────────────────────────────── */
const SOCIAL_ICONS: Record<string, string> = {
  twitter: '🐦', telegram: '✈️', discord: '💬',
  github: '🐙', reddit: '🟠', medium: '📰',
  youtube: '▶️', instagram: '📸',
};

const SOCIAL_LABELS: Record<string, string> = {
  twitter: 'Twitter', telegram: 'Telegram', discord: 'Discord',
  github: 'GitHub', reddit: 'Reddit', medium: 'Medium',
  youtube: 'YouTube', instagram: 'Instagram',
};

const LIVE_PRICES = [
  { symbol: 'BNB',  color: '#F0B90B', emoji: '🟡', price: '$582.40', change: '+2.34%', up: true  },
  { symbol: 'ETH',  color: '#627EEA', emoji: '🔷', price: '$3,218',  change: '-0.85%', up: false },
  { symbol: 'BTC',  color: '#F7931A', emoji: '🟠', price: '$67,420', change: '+1.12%', up: true  },
  { symbol: 'CAKE', color: '#1FC7D4', emoji: '🥞', price: '$2.42',   change: '+5.60%', up: true  },
  { symbol: 'SOL',  color: '#9945FF', emoji: '🟣', price: '$168.30', change: '+3.21%', up: true  },
];

const EARN_CARDS = [
  { icon: '🌾', label: 'LP Farms',     apr: 'Up to 120%',  color: '#31D0AA', accent: '#31D0AA', href: '/earn/farms'   },
  { icon: '🍯', label: 'Syrup Pools',  apr: 'Up to 80%',   color: '#7645D9', accent: '#7645D9', href: '/earn/pools'   },
  { icon: '💧', label: 'Liquidity',    apr: '0.17% fee',   color: '#1FC7D4', accent: '#1FC7D4', href: '/trade/liquidity'},
  { icon: '🔮', label: 'Prediction',   apr: '2x payouts',  color: '#FFB237', accent: '#FFB237', href: '/play/prediction'},
];

const ALL_FEATURES = [
  { icon: '🔄', title: 'Trade',       desc: 'Swap tokens with best prices across all chains.',            href: '/trade/swap'       },
  { icon: '⏱',  title: 'TWAP',        desc: 'Split large orders over time to minimize price impact.',     href: '/trade/swap'       },
  { icon: '📋', title: 'Limit Orders',desc: 'Set the exact price you want and execute automatically.',    href: '/trade/swap'       },
  { icon: '📈', title: 'Perpetuals',  desc: 'Trade perps with up to 150x leverage on 48+ pairs.',        href: '/perps'            },
  { icon: '🌾', title: 'Farms',       desc: 'Provide liquidity to earn CAKE and trading fees.',           href: '/earn/farms'       },
  { icon: '🍯', title: 'Pools',       desc: 'Stake CAKE to earn other tokens. No impermanent loss.',      href: '/earn/pools'       },
  { icon: '🚀', title: 'Springboard', desc: 'Participate in new token launches and ILOs.',                href: '/play/springboard' },
  { icon: '🎰', title: 'Lottery',     desc: 'Win millions in CAKE every week with low-cost tickets.',     href: '/play/lottery'     },
  { icon: '🔮', title: 'Prediction',  desc: 'Predict BNB price and win up to 2x your stake.',            href: '/play/prediction'  },
];

interface LandingData {
  heroTitle:        string;
  heroSubtitle:     string;
  stat1Value:       string; stat1Label:  string;
  stat2Value:       string; stat2Label:  string;
  stat3Value:       string; stat3Label:  string;
  socialLinks:      Record<string, string>;
  featuredProjects: { id: string; name: string; description: string; logo: string; link: string }[];
}

const DEFAULTS: LandingData = {
  heroTitle:    'The #1 DEX on BNB Chain',
  heroSubtitle: 'Trade, earn, and win crypto on the most popular decentralized exchange',
  stat1Value: '$4.2B', stat1Label: 'Total Value Locked',
  stat2Value: '$1.8B', stat2Label: '24h Trading Volume',
  stat3Value: '2.8M+', stat3Label: 'Active Users',
  socialLinks: {
    twitter: 'https://twitter.com', telegram: 'https://t.me',
    discord: 'https://discord.com', github: 'https://github.com',
  },
  featuredProjects: [
    { id: '1', name: 'CAKE Token',   description: 'Stake CAKE to earn rewards and govern the protocol.',  logo: '🥞', link: '/earn/pools'    },
    { id: '2', name: 'Yield Farms',  description: 'Provide liquidity and earn CAKE and other tokens.',    logo: '🌾', link: '/earn/farms'    },
    { id: '3', name: 'Perpetuals',   description: 'Trade perpetual futures with up to 150x leverage.',   logo: '📈', link: '/perps'         },
  ],
};

export default function Home() {
  const [land, setLand] = useState<LandingData>(DEFAULTS);

  useEffect(() => {
    fetch('/api/admin/data?section=landingPage')
      .then(r => r.json())
      .then(d => { if (d?.heroTitle) setLand({ ...DEFAULTS, ...d, socialLinks: { ...DEFAULTS.socialLinks, ...(d.socialLinks || {}) }, featuredProjects: d.featuredProjects?.length ? d.featuredProjects : DEFAULTS.featuredProjects }); })
      .catch(() => {});
  }, []);

  const activeSocials = Object.entries(land.socialLinks).filter(([, v]) => v);

  return (
    <>
      {/* ── Hero ── */}
      <Hero>
        <HeroBg />
        <BunnyFloat><BunnyIcon size={100} /></BunnyFloat>
        <HeroTitle>{land.heroTitle}</HeroTitle>
        <HeroSub>{land.heroSubtitle}</HeroSub>
        <HeroBtns>
          <Link href="/trade/swap"><Button scale="xl">Trade Now</Button></Link>
          <Link href="/earn/farms"><Button scale="xl" variant="secondary">Earn Yield</Button></Link>
        </HeroBtns>

        <StatsRow>
          {[
            { val: land.stat1Value, lbl: land.stat1Label },
            { val: land.stat2Value, lbl: land.stat2Label },
            { val: land.stat3Value, lbl: land.stat3Label },
          ].map((s, i) => (
            <StatCard key={i}>
              <StatValue>{s.val}</StatValue>
              <StatLabel>{s.lbl}</StatLabel>
            </StatCard>
          ))}
        </StatsRow>

        {/* Social links */}
        {activeSocials.length > 0 && (
          <SocialStrip>
            {activeSocials.map(([key, url]) => (
              <SocialChip key={key} href={url} target="_blank" rel="noreferrer">
                <span style={{ fontSize: 16 }}>{SOCIAL_ICONS[key] || '🔗'}</span>
                {SOCIAL_LABELS[key] || key}
              </SocialChip>
            ))}
          </SocialStrip>
        )}
      </Hero>

      {/* ── Featured on Exchange ── */}
      <PageSection>
        <SectionTag>⭐ Featured</SectionTag>
        <SectionH2>Featured on Exchange</SectionH2>
        <SectionSub>Discover the latest projects, pools, and opportunities available on the exchange.</SectionSub>
        <FeaturedGrid>
          {land.featuredProjects.map(project => (
            <Link key={project.id} href={project.link} style={{ textDecoration: 'none' }}>
              <FeaturedCard>
                <FeaturedLogo>{project.logo}</FeaturedLogo>
                <FeaturedName>{project.name}</FeaturedName>
                <FeaturedDesc>{project.description}</FeaturedDesc>
                <ArrowLink>Learn more →</ArrowLink>
              </FeaturedCard>
            </Link>
          ))}
        </FeaturedGrid>
      </PageSection>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'var(--card-border, #E7E3EB)', maxWidth: 1200, margin: '0 auto' }} />

      {/* ── Swap Best Prices ── */}
      <PageSection>
        <SwapBestWrap>
          <SwapBestText>
            <SectionTag>🔄 Trade</SectionTag>
            <SectionH2>Swap with Best Prices</SectionH2>
            <SectionSub>
              Our smart routing algorithm finds the best price across multiple liquidity sources, 
              saving you money on every trade.
            </SectionSub>
            <CheckList>
              {[
                'Best execution price across all liquidity pools',
                'Smart routing splits trades for optimal rates',
                'Low 0.25% trading fee — lowest on BNB Chain',
                'TWAP orders to minimize price impact on large trades',
                'Limit orders — buy or sell at your target price',
              ].map(item => (
                <CheckItem key={item}>
                  <CheckDot>✓</CheckDot>
                  {item}
                </CheckItem>
              ))}
            </CheckList>
            <Link href="/trade/swap">
              <Button scale="lg">Start Trading →</Button>
            </Link>
          </SwapBestText>

          <SwapBestVisual>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-subtle)', fontFamily: 'Kanit,sans-serif', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Live Prices
            </div>
            {LIVE_PRICES.map(coin => (
              <PriceRow key={coin.symbol}>
                <PairName>
                  <TokenDot $color={coin.color}>{coin.emoji}</TokenDot>
                  {coin.symbol}/USDT
                </PairName>
                <PriceInfo>
                  <PriceVal>{coin.price}</PriceVal>
                  <PriceChange $up={coin.up}>{coin.change}</PriceChange>
                </PriceInfo>
              </PriceRow>
            ))}
            <Link href="/trade/swap" style={{ textDecoration: 'none' }}>
              <div style={{
                marginTop: 16, padding: '12px 18px', borderRadius: 14,
                background: 'linear-gradient(135deg, #1FC7D420, #7645D920)',
                border: '1px solid #1FC7D430',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer',
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Kanit,sans-serif' }}>
                  🔄 Swap Now
                </span>
                <span style={{ fontSize: 13, color: '#1FC7D4' }}>Best rates →</span>
              </div>
            </Link>
          </SwapBestVisual>
        </SwapBestWrap>
      </PageSection>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'var(--card-border, #E7E3EB)', maxWidth: 1200, margin: '0 auto' }} />

      {/* ── Earn Trading Fees ── */}
      <PageSection>
        <EarnWrap>
          <EarnGrid>
            {EARN_CARDS.map(card => (
              <Link key={card.href} href={card.href} style={{ textDecoration: 'none' }}>
                <EarnCard $accent={card.accent}>
                  <EarnIcon>{card.icon}</EarnIcon>
                  <EarnLabel>{card.label}</EarnLabel>
                  <EarnApr $color={card.color}>{card.apr}</EarnApr>
                  <EarnSub>APR</EarnSub>
                </EarnCard>
              </Link>
            ))}
          </EarnGrid>

          <div style={{ flex: 1 }}>
            <SectionTag>💰 Earn</SectionTag>
            <SectionH2>Earn Trading Fees</SectionH2>
            <SectionSub>
              Put your crypto to work. Provide liquidity, stake tokens, or participate in 
              yield farms to earn passive income from trading fees and rewards.
            </SectionSub>
            <CheckList>
              {[
                'Earn 0.17% of every trade in your liquidity pair',
                'Compound rewards automatically with Auto CAKE pool',
                'No lock-up periods — withdraw anytime',
                'Audited smart contracts — your funds are safe',
              ].map(item => (
                <CheckItem key={item}>
                  <CheckDot>✓</CheckDot>
                  {item}
                </CheckItem>
              ))}
            </CheckList>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/earn/farms"><Button scale="lg">🌾 Start Farming →</Button></Link>
              <Link href="/earn/pools"><Button scale="lg" variant="secondary">🍯 Stake CAKE</Button></Link>
            </div>
          </div>
        </EarnWrap>
      </PageSection>

      {/* ── Divider ── */}
      <div style={{ height: 1, background: 'var(--card-border, #E7E3EB)', maxWidth: 1200, margin: '0 auto' }} />

      {/* ── All Features ── */}
      <PageSection>
        <SectionTag>🚀 Everything</SectionTag>
        <SectionH2>Everything you need to DeFi</SectionH2>
        <SectionSub>
          A complete DeFi ecosystem — trade, earn, and play all in one place.
        </SectionSub>
        <FeatureGrid>
          {ALL_FEATURES.map(f => (
            <Link key={f.title} href={f.href} style={{ textDecoration: 'none' }}>
              <FeatureCard>
                <FeatureIcon>{f.icon}</FeatureIcon>
                <FeatureTitle>{f.title}</FeatureTitle>
                <FeatureDesc>{f.desc}</FeatureDesc>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1FC7D4', fontFamily: 'Kanit,sans-serif' }}>
                  Go →
                </div>
              </FeatureCard>
            </Link>
          ))}
        </FeatureGrid>
      </PageSection>

      {/* ── CTA Banner ── */}
      <section style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{
          maxWidth: 800, margin: '0 auto', padding: '56px 40px',
          background: 'linear-gradient(135deg, #1FC7D415, #7645D915)',
          border: '1px solid #1FC7D430',
          borderRadius: 32,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🥞</div>
          <h2 style={{ fontSize: 36, fontWeight: 700, fontFamily: 'Kanit,sans-serif', margin: '0 0 12px' }}>
            Ready to get started?
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-subtle)', margin: '0 0 32px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Connect your wallet and start trading in seconds. No registration required.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/trade/swap"><Button scale="xl">🔄 Start Trading</Button></Link>
            <Link href="/earn/farms"><Button scale="xl" variant="secondary">💰 Earn Now</Button></Link>
          </div>
        </div>
      </section>
    </>
  );
}
