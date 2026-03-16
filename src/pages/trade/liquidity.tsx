import React from 'react';
import styled from 'styled-components';
import LiquidityCard from '../../components/trade/LiquidityCard';
import { Text } from '../../components/ui/Typography';

const PageWrapper = styled.div`
  min-height: calc(100vh - 56px);
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px 64px;
`;

export default function LiquidityPage() {
  return (
    <PageWrapper>
      <Text bold style={{ fontSize: 32, marginBottom: 8 }}>💧 Liquidity</Text>
      <Text color="textSubtle" style={{ marginBottom: 24 }}>Add liquidity to earn 0.25% of all trades proportional to your share.</Text>
      <LiquidityCard />
    </PageWrapper>
  );
}
