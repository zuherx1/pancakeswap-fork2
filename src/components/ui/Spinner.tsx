import React from 'react';
import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div<{ size?: number }>`
  width: ${({ size = 40 }) => size}px;
  height: ${({ size = 40 }) => size}px;
  animation: ${rotate} 0.8s linear infinite;

  svg { width: 100%; height: 100%; }
`;

const LoadingDots = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    animation: bounce 1.2s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }

  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-8px); }
  }
`;

export const Spinner: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <SpinnerContainer size={size}>
    <svg viewBox="0 0 50 50" fill="none">
      <circle cx="25" cy="25" r="20" stroke="#E7E3EB" strokeWidth="4" />
      <path
        d="M25 5 A20 20 0 0 1 45 25"
        stroke="#1FC7D4"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  </SpinnerContainer>
);

export const DotsLoader: React.FC = () => (
  <LoadingDots>
    <span /><span /><span />
  </LoadingDots>
);

const PageLoaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  flex-direction: column;
  gap: 16px;
`;

export const PageLoader: React.FC = () => (
  <PageLoaderWrapper>
    <Spinner size={64} />
  </PageLoaderWrapper>
);
