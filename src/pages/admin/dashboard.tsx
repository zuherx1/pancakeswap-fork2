import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import AdminLayout from '../../components/admin/AdminLayout';
import Link from 'next/link';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  margin-bottom: 28px;
`;

const StatCard = styled.div`
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 20px;
`;

const StatIcon = styled.div`font-size: 28px; margin-bottom: 10px;`;
const StatVal  = styled.div`font-size: 26px; font-weight: 700; color: #1FC7D4;`;
const StatLbl  = styled.div`font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 4px;`;

const QuickGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
`;

const QuickCard = styled.a`
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 18px;
  text-decoration: none;
  transition: all 0.2s;
  display: block;
  &:hover {
    background: rgba(31,199,212,0.08);
    border-color: rgba(31,199,212,0.3);
    transform: translateY(-2px);
    text-decoration: none;
  }
`;

const QIcon  = styled.div`font-size: 24px; margin-bottom: 8px;`;
const QTitle = styled.div`font-size: 14px; font-weight: 600; color: white; margin-bottom: 4px;`;
const QDesc  = styled.div`font-size: 12px; color: rgba(255,255,255,0.4);`;

const SectionTitle = styled.h2`
  font-size: 16px; font-weight: 700; color: white;
  margin: 0 0 14px; font-family: 'Kanit', sans-serif;
`;

const StatusRow = styled.div`
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 14px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 8px;
`;

const StatusLabel = styled.div`font-size: 14px; color: rgba(255,255,255,0.7);`;
const StatusBadge = styled.div<{ ok?: boolean }>`
  font-size: 12px; font-weight: 700;
  padding: 4px 12px; border-radius: 20px;
  background: ${({ ok }) => ok ? 'rgba(49,208,170,0.15)' : 'rgba(237,75,158,0.15)'};
  color: ${({ ok }) => ok ? '#31D0AA' : '#ED4B9E'};
  border: 1px solid ${({ ok }) => ok ? 'rgba(49,208,170,0.3)' : 'rgba(237,75,158,0.3)'};
`;

const QUICK_ACTIONS = [
  { icon: '🎨', title: 'Site Settings',  desc: 'Name, logo, colors',     href: '/admin/site'      },
  { icon: '🖼️', title: 'Landing Page',   desc: 'Hero text, stats',       href: '/admin/landing'   },
  { icon: '🔗', title: 'Tatum.io',       desc: 'Connect API',            href: '/admin/tatum'     },
  { icon: '💰', title: 'Add Token',      desc: 'Tokens & market pairs',  href: '/admin/tokens'    },
  { icon: '💸', title: 'Fees',           desc: 'Fee wallet settings',    href: '/admin/fees'      },
  { icon: '👥', title: 'Manage Admins',  desc: 'Add / remove admins',    href: '/admin/admins'    },
  { icon: '📝', title: 'Blog Posts',     desc: 'Edit or publish posts',  href: '/admin/blog'      },
  { icon: '🔄', title: 'Swap Settings',  desc: 'Native vs fork swap',    href: '/admin/swap'      },
];

export default function DashboardPage() {
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetch('/api/admin/data').then(r => r.json()).then(setSettings).catch(() => {});
  }, []);

  const tokenCount   = settings.tokens?.length || 0;
  const pairCount    = settings.marketPairs?.length || 0;
  const walletCount  = settings.exchangeWallets?.length || 0;
  const blogCount    = settings.blogPosts?.length || 0;
  const tatumOk      = !!settings.tatumSettings?.apiKey;
  const swapMode     = settings.swapSettings?.mode || 'fork';
  const perpsMode    = settings.perpsSettings?.mode || 'fork';

  return (
    <AdminLayout title="Dashboard">
      {/* Stats */}
      <Grid>
        <StatCard>
          <StatIcon>🪙</StatIcon>
          <StatVal>{tokenCount}</StatVal>
          <StatLbl>Custom Tokens</StatLbl>
        </StatCard>
        <StatCard>
          <StatIcon>📊</StatIcon>
          <StatVal>{pairCount}</StatVal>
          <StatLbl>Market Pairs</StatLbl>
        </StatCard>
        <StatCard>
          <StatIcon>👛</StatIcon>
          <StatVal>{walletCount}</StatVal>
          <StatLbl>Exchange Wallets</StatLbl>
        </StatCard>
        <StatCard>
          <StatIcon>📝</StatIcon>
          <StatVal>{blogCount}</StatVal>
          <StatLbl>Blog Posts</StatLbl>
        </StatCard>
      </Grid>

      {/* System status */}
      <SectionTitle>System Status</SectionTitle>
      <div style={{ marginBottom: 28 }}>
        <StatusRow>
          <StatusLabel>🔗 Tatum.io API</StatusLabel>
          <StatusBadge ok={tatumOk}>{tatumOk ? '✓ Connected' : '✗ Not configured'}</StatusBadge>
        </StatusRow>
        <StatusRow>
          <StatusLabel>🔄 Swap Mode</StatusLabel>
          <StatusBadge ok>{swapMode === 'fork' ? '🍴 Fork (PancakeSwap)' : '🏠 Native Exchange'}</StatusBadge>
        </StatusRow>
        <StatusRow>
          <StatusLabel>📈 Perps Mode</StatusLabel>
          <StatusBadge ok>{perpsMode === 'fork' ? '🍴 Fork (PancakeSwap)' : '🏠 Local Perps'}</StatusBadge>
        </StatusRow>
        <StatusRow>
          <StatusLabel>💸 Fee Collection</StatusLabel>
          <StatusBadge ok={!!settings.swapSettings?.feeWalletAddress}>
            {settings.swapSettings?.feeWalletAddress ? `✓ ${settings.swapSettings.feePercent || 0.25}% fee active` : '✗ Not configured'}
          </StatusBadge>
        </StatusRow>
      </div>

      {/* Quick actions */}
      <SectionTitle>Quick Actions</SectionTitle>
      <QuickGrid>
        {QUICK_ACTIONS.map(a => (
          <Link key={a.href} href={a.href} style={{ textDecoration: 'none' }}>
            <QuickCard>
              <QIcon>{a.icon}</QIcon>
              <QTitle>{a.title}</QTitle>
              <QDesc>{a.desc}</QDesc>
            </QuickCard>
          </Link>
        ))}
      </QuickGrid>
    </AdminLayout>
  );
}
