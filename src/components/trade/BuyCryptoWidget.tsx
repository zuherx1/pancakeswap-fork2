import React, { useState } from 'react';
import styled from 'styled-components';
import { Text } from '../ui/Typography';

/* ─── Transak iframe widget ─────────────────────────────────────────────────
   Transak works WITHOUT an API key in sandbox/production mode.
   Users can buy/sell crypto with cards, bank transfer, Apple Pay etc.
   Supported in 150+ countries.
   ─────────────────────────────────────────────────────────────────────────── */

const Wrap = styled.div`
  width: 100%; max-width: 500px;
  display: flex; flex-direction: column; gap: 0;
`;

const TabRow = styled.div`
  display: flex; gap: 0;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 20px 20px 0 0; border-bottom: none;
  padding: 6px;
`;

const Tab = styled.button<{ $on?: boolean }>`
  flex: 1; padding: 10px 8px; border-radius: 14px;
  font-size: 15px; font-weight: 700; font-family: 'Kanit', sans-serif;
  cursor: pointer; border: none; transition: all .15s;
  background: ${({ $on, theme }) => $on ? theme.colors.primary : 'transparent'};
  color: ${({ $on, theme }) => $on ? 'white' : theme.colors.textSubtle};
  &:hover { color: ${({ theme }) => theme.colors.text}; }
`;

const Frame = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 0 0 20px 20px; overflow: hidden;
  height: 600px;
`;

const InfoBox = styled.div`
  display: flex; gap: 8px; align-items: flex-start;
  padding: 10px 14px; border-radius: 12px; margin-bottom: 8px;
  background: ${({ theme }) => theme.colors.primary + '10'};
  border: 1px solid ${({ theme }) => theme.colors.primary + '25'};
  font-size: 12px; color: ${({ theme }) => theme.colors.textSubtle};
  line-height: 1.5;
`;

type Mode = 'buy' | 'sell';

/* Transak widget URLs — no API key required for basic use */
function getTransakUrl(mode: Mode): string {
  const base   = 'https://global.transak.com';
  const params = new URLSearchParams({
    apiKey:              'f8bf1a0b-a7c6-4b14-b5e0-32e0d3040c3e', // public demo key — replace with your own from transak.com
    network:             'bsc',
    defaultCryptoCurrency: mode === 'buy' ? 'BNB' : 'USDT',
    fiatCurrency:        'USD',
    productsAvailed:     mode === 'buy' ? 'BUY' : 'SELL',
    hideMenu:            '1',
    themeColor:          '1FC7D4',
    colorMode:           'DARK',
    exchangeScreenTitle: mode === 'buy' ? 'Buy Crypto' : 'Sell Crypto',
  });
  return `${base}?${params.toString()}`;
}

export default function BuyCryptoWidget() {
  const [mode, setMode] = useState<Mode>('buy');

  return (
    <Wrap>
      <InfoBox>
        <span>💡</span>
        <span>
          Buy &amp; sell crypto with credit card, debit card, Apple Pay, Google Pay, or bank transfer.
          Powered by <a href="https://transak.com" target="_blank" rel="noreferrer" style={{ color: '#1FC7D4' }}>Transak</a> — available in 150+ countries.
        </span>
      </InfoBox>

      <TabRow>
        <Tab $on={mode === 'buy'}  onClick={() => setMode('buy')}>💳 Buy Crypto</Tab>
        <Tab $on={mode === 'sell'} onClick={() => setMode('sell')}>💰 Sell Crypto</Tab>
      </TabRow>

      <Frame>
        <iframe
          key={mode} /* remount on tab switch */
          src={getTransakUrl(mode)}
          title={mode === 'buy' ? 'Buy Crypto' : 'Sell Crypto'}
          allow="camera; microphone; payment; clipboard-read; clipboard-write"
          style={{ width: '100%', height: '100%', border: 'none' }}
          loading="lazy"
        />
      </Frame>

      <Text small color="textSubtle" style={{ textAlign: 'center', marginTop: 10, fontSize: 11 }}>
        Powered by Transak · Regulated in 150+ countries · KYC may be required for large amounts
      </Text>
    </Wrap>
  );
}
