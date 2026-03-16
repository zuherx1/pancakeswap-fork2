import React from 'react';
import styled from 'styled-components';
import BuyCryptoWidget from '../../components/trade/BuyCryptoWidget';
import { Heading, Text } from '../../components/ui/Typography';

const PageWrapper = styled.div`
  min-height: calc(100vh - 56px);
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px 64px;
`;

const Title = styled(Heading)`
  text-align: center;
  margin-bottom: 8px;
  font-size: 36px;
`;

const Sub = styled(Text)`
  text-align: center;
  margin-bottom: 28px;
  color: ${({ theme }) => theme.colors.textSubtle};
`;

const Features = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 32px;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 480px;
`;

const Feature = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;
`;

const FeatureIcon = styled.div`
  width: 48px; height: 48px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
`;

export default function BuyCryptoPage() {
  return (
    <PageWrapper>
      <Title scale="lg">Buy Crypto</Title>
      <Sub>Exchange, buy and sell 900+ cryptocurrencies instantly</Sub>
      <BuyCryptoWidget />
      <Features>
        <Feature>
          <FeatureIcon>⚡</FeatureIcon>
          <Text small bold>Instant</Text>
          <Text small color="textSubtle">Swaps in minutes</Text>
        </Feature>
        <Feature>
          <FeatureIcon>🔒</FeatureIcon>
          <Text small bold>Non-custodial</Text>
          <Text small color="textSubtle">No registration</Text>
        </Feature>
        <Feature>
          <FeatureIcon>🌐</FeatureIcon>
          <Text small bold>900+ Coins</Text>
          <Text small color="textSubtle">Cross-chain support</Text>
        </Feature>
        <Feature>
          <FeatureIcon>💰</FeatureIcon>
          <Text small bold>Best Rates</Text>
          <Text small color="textSubtle">10+ liquidity sources</Text>
        </Feature>
      </Features>
    </PageWrapper>
  );
}
