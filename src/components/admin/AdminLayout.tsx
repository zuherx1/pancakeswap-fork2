import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useAdmin } from '../../context/AdminContext';
import Link from 'next/link';

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const Wrapper = styled.div`
  display: flex; min-height: 100vh;
  background: #0D0B1E;
  font-family: 'Kanit', sans-serif;
`;

const Sidebar = styled.div<{ open: boolean }>`
  width: 260px; flex-shrink: 0;
  background: #12101A;
  border-right: 1px solid rgba(255,255,255,0.08);
  display: flex; flex-direction: column;
  transition: transform 0.25s;
  position: fixed; top: 0; left: 0; bottom: 0;
  z-index: 100;

  @media(max-width:968px){
    transform: translateX(${({ open }) => open ? '0' : '-100%'});
  }
`;

const SidebarTop = styled.div`
  padding: 24px 20px 16px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  display: flex; align-items: center; gap: 10px;
`;

const SiteName = styled.div`
  font-size: 18px; font-weight: 700; color: white;
`;

const SiteTag = styled.div`
  font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px;
`;

const Nav = styled.nav`
  flex: 1; overflow-y: auto; padding: 12px 10px;
`;

const NavSection = styled.div`
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: rgba(255,255,255,0.3);
  padding: 12px 10px 6px;
`;

const NavItem = styled.a<{ active?: boolean }>`
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px;
  color: ${({ active }) => active ? 'white' : 'rgba(255,255,255,0.55)'};
  background: ${({ active }) => active ? 'rgba(31,199,212,0.15)' : 'transparent'};
  border: 1px solid ${({ active }) => active ? 'rgba(31,199,212,0.3)' : 'transparent'};
  font-size: 14px; font-weight: ${({ active }) => active ? 600 : 400};
  text-decoration: none; cursor: pointer; transition: all 0.15s;
  margin-bottom: 2px;
  &:hover {
    background: rgba(255,255,255,0.07); color: white; text-decoration: none;
  }
  span.icon { font-size: 16px; flex-shrink: 0; }
`;

const SidebarBottom = styled.div`
  padding: 16px; border-top: 1px solid rgba(255,255,255,0.07);
`;

const UserBadge = styled.div`
  display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 12px;
  background: rgba(255,255,255,0.05);
  margin-bottom: 8px;
`;

const UserAvatar = styled.div`
  width: 32px; height: 32px; border-radius: 50%;
  background: linear-gradient(135deg,#1FC7D4,#7645D9);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: white; flex-shrink: 0;
`;

const LogoutBtn = styled.button`
  width: 100%; padding: 10px;
  background: rgba(237,75,158,0.12);
  border: 1px solid rgba(237,75,158,0.25);
  border-radius: 10px; color: #ED4B9E;
  font-size: 14px; font-weight: 600;
  font-family: 'Kanit',sans-serif; cursor: pointer;
  transition: all 0.15s;
  &:hover { background: rgba(237,75,158,0.2); }
`;

const Main = styled.div`
  flex: 1; margin-left: 260px;
  background: #0D0B1E; min-height: 100vh;

  @media(max-width:968px){ margin-left: 0; }
`;

const TopBar = styled.div`
  background: #12101A;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  padding: 0 24px; height: 56px;
  display: flex; align-items: center; justify-content: space-between;
  position: sticky; top: 0; z-index: 50;
`;

const PageTitle = styled.h1`
  font-size: 18px; font-weight: 700; color: white; margin: 0;
`;

const HamBtn = styled.button`
  display: none; background: none; border: none;
  color: white; font-size: 22px; cursor: pointer;
  @media(max-width:968px){ display: block; }
`;

const Overlay = styled.div<{ open: boolean }>`
  display: ${({ open }) => open ? 'block' : 'none'};
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5); z-index: 99;
  @media(min-width:969px){ display: none; }
`;

const Content = styled.div`padding: 24px;`;

const BackLink = styled.a`
  display: inline-flex; align-items: center; gap: 6px;
  color: rgba(255,255,255,0.5); font-size: 13px;
  text-decoration: none; padding: 6px 12px;
  border-radius: 8px; transition: all 0.15s;
  &:hover { color: white; background: rgba(255,255,255,0.07); text-decoration: none; }
`;

const NAV_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { icon: '🏠', label: 'Dashboard',      href: '/admin/dashboard'  },
    ],
  },
  {
    title: 'Appearance',
    items: [
      { icon: '🎨', label: 'Site Settings',  href: '/admin/site'       },
      { icon: '🖼️', label: 'Landing Page',   href: '/admin/landing'    },
      { icon: '📝', label: 'Blog Posts',      href: '/admin/blog'       },
    ],
  },
  {
    title: 'Exchange',
    items: [
      { icon: '🔄', label: 'Swap Settings',  href: '/admin/swap'       },
      { icon: '💰', label: 'Tokens & Pairs', href: '/admin/tokens'     },
      { icon: '💧', label: 'Liquidity',       href: '/admin/liquidity'  },
      { icon: '🏊', label: 'Local Staking',   href: '/admin/staking'   },
      { icon: '💸', label: 'Fees',            href: '/admin/fees'       },
    ],
  },
  {
    title: 'Trading',
    items: [
      { icon: '📈', label: 'Perps Markets',  href: '/admin/perps'      },
    ],
  },
  {
    title: 'Integrations',
    items: [
      { icon: '🔗', label: 'Tatum.io',       href: '/admin/tatum'      },
    ],
  },
  {
    title: 'Admin',
    items: [
      { icon: '👥', label: 'Admins',         href: '/admin/admins'     },
    ],
  },
];

interface Props {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<Props> = ({ children, title }) => {
  const router    = useRouter();
  const { user, logout, isLoggedIn, loading } = useAdmin();
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isLoggedIn) router.replace('/admin');
  }, [isLoggedIn, loading, router]);

  if (loading || !isLoggedIn) return null;

  return (
    <Wrapper>
      <Overlay open={sideOpen} onClick={() => setSideOpen(false)} />

      <Sidebar open={sideOpen}>
        <SidebarTop>
          <div style={{ fontSize: 28 }}>🥞</div>
          <div>
            <SiteName>Admin Panel</SiteName>
            <SiteTag>Exchange Management</SiteTag>
          </div>
        </SidebarTop>

        <Nav>
          {NAV_SECTIONS.map(section => (
            <div key={section.title}>
              <NavSection>{section.title}</NavSection>
              {section.items.map(item => (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                  <NavItem active={router.pathname === item.href}>
                    <span className="icon">{item.icon}</span>
                    {item.label}
                  </NavItem>
                </Link>
              ))}
            </div>
          ))}
        </Nav>

        <SidebarBottom>
          <UserBadge>
            <UserAvatar>{user?.username?.[0]?.toUpperCase() || 'A'}</UserAvatar>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{user?.username}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{user?.role}</div>
            </div>
          </UserBadge>
          <LogoutBtn onClick={() => { logout(); router.replace('/admin'); }}>
            Sign Out
          </LogoutBtn>
        </SidebarBottom>
      </Sidebar>

      <Main>
        <TopBar>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <HamBtn onClick={() => setSideOpen(v => !v)}>☰</HamBtn>
            <PageTitle>{title}</PageTitle>
          </div>
          <Link href="/" target="_blank" style={{ textDecoration: 'none' }}>
            <BackLink>View Site ↗</BackLink>
          </Link>
        </TopBar>
        <Content>{children}</Content>
      </Main>
    </Wrapper>
  );
};

export default AdminLayout;
