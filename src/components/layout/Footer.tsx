import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { PancakeLogo } from '../ui/Icons';

const FooterWrapper = styled.footer`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  padding: 40px 24px;
  margin-top: auto;
`;

const FooterInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr repeat(4, 1fr);
  gap: 32px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const BrandCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const BrandName = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const BrandDesc = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSubtle};
  line-height: 1.6;
  margin: 0;
`;

const SocialRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const SocialBtn = styled.a`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.input};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  text-decoration: none;
  transition: background 0.2s;
  &:hover { background: ${({ theme }) => theme.colors.inputSecondary}; }
`;

const FooterCol = styled.div``;

const ColTitle = styled.h4`
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.textSubtle};
  margin: 0 0 16px;
`;

const ColLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ColLink = styled.li`
  a {
    font-size: 14px;
    color: ${({ theme }) => theme.colors.text};
    text-decoration: none;
    transition: color 0.15s;
    &:hover { color: ${({ theme }) => theme.colors.primary}; text-decoration: none; }
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  margin: 32px 0 16px;
`;

const BottomRow = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
`;

const Copyright = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSubtle};
`;

const FOOTER_LINKS = {
  Trade: [
    { label: 'Swap',       href: '/trade/swap' },
    { label: 'Liquidity',  href: '/trade/liquidity' },
    { label: 'Buy Crypto', href: '/trade/buy-crypto' },
    { label: 'Perps',      href: '/perps' },
  ],
  Earn: [
    { label: 'Farms',      href: '/earn/farms' },
    { label: 'Pools',      href: '/earn/pools' },
  ],
  Play: [
    { label: 'Springboard',href: '/play/springboard' },
    { label: 'Prediction', href: '/play/prediction' },
    { label: 'Lottery',    href: '/play/lottery' },
    { label: 'CakePad',    href: '/play/cakepad' },
  ],
  Board: [
    { label: 'Info',       href: '/board/info' },
    { label: 'Burn',       href: '/board/burn' },
    { label: 'Voting',     href: '/board/voting' },
    { label: 'Blog',       href: '/board/blog' },
  ],
};

const Footer: React.FC = () => (
  <FooterWrapper>
    <FooterInner>
      <BrandCol>
        <BrandRow>
          <PancakeLogo size={32} />
          <BrandName>PancakeSwap</BrandName>
        </BrandRow>
        <BrandDesc>
          The most popular AMM on BSC by user count! Earn CAKE through yield farming or win it in the Lottery, then stake it in Syrup Pools to earn more tokens!
        </BrandDesc>
        <SocialRow>
          <SocialBtn href="https://twitter.com" target="_blank" rel="noreferrer">🐦</SocialBtn>
          <SocialBtn href="https://t.me" target="_blank" rel="noreferrer">✈️</SocialBtn>
          <SocialBtn href="https://discord.com" target="_blank" rel="noreferrer">💬</SocialBtn>
          <SocialBtn href="https://github.com" target="_blank" rel="noreferrer">🐙</SocialBtn>
          <SocialBtn href="https://reddit.com" target="_blank" rel="noreferrer">🟠</SocialBtn>
          <SocialBtn href="https://medium.com" target="_blank" rel="noreferrer">📰</SocialBtn>
        </SocialRow>
      </BrandCol>

      {Object.entries(FOOTER_LINKS).map(([section, links]) => (
        <FooterCol key={section}>
          <ColTitle>{section}</ColTitle>
          <ColLinks>
            {links.map((link) => (
              <ColLink key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </ColLink>
            ))}
          </ColLinks>
        </FooterCol>
      ))}
    </FooterInner>

    <Divider />

    <BottomRow>
      <Copyright>© {new Date().getFullYear()} PancakeSwap. All rights reserved.</Copyright>
      <div style={{ display: 'flex', gap: 16 }}>
        <Link href="/terms" style={{ fontSize: 14, color: 'inherit', opacity: 0.6 }}>Terms</Link>
        <Link href="/privacy" style={{ fontSize: 14, color: 'inherit', opacity: 0.6 }}>Privacy</Link>
      </div>
    </BottomRow>
  </FooterWrapper>
);

export default Footer;
