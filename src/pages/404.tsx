import React from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { Button } from '../components/ui/Button';
import { Heading, Text } from '../components/ui/Typography';

const float = keyframes`0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}`;

const Wrapper = styled.div`
  min-height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.gradientBubblegum};
  text-align: center;
  padding: 40px 24px;
`;

const Bunny = styled.div`
  font-size: 96px;
  animation: ${float} 3s ease-in-out infinite;
  margin-bottom: 24px;
`;

export default function Custom404() {
  return (
    <Wrapper>
      <Bunny>🐰</Bunny>
      <Heading scale="xl" style={{ marginBottom: 12 }}>404</Heading>
      <Text style={{ fontSize: 20, marginBottom: 8 }}>Oops, page not found.</Text>
      <Text color="textSubtle" style={{ marginBottom: 32 }}>
        Looks like this bunny got lost in the pancake fields.
      </Text>
      <Link href="/">
        <Button scale="lg">🏠 Back to Home</Button>
      </Link>
    </Wrapper>
  );
}
