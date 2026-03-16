import React, { useState } from 'react';
import styled from 'styled-components';

interface TokenLogoProps {
  src?: string;
  symbol?: string;
  size?: number;
}

const Wrapper = styled.div<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.input};
  flex-shrink: 0;
`;

const Img = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Fallback = styled.div<{ size: number }>`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(139.73deg, #E5FDFF 0%, #F3EFFF 100%);
  color: #7645D9;
  font-weight: 700;
  font-size: ${({ size }) => Math.max(size / 3, 10)}px;
`;

const TokenLogo: React.FC<TokenLogoProps> = ({ src, symbol, size = 32 }) => {
  const [error, setError] = useState(false);
  return (
    <Wrapper size={size}>
      {src && !error ? (
        <Img src={src} alt={symbol || ''} onError={() => setError(true)} />
      ) : (
        <Fallback size={size}>{(symbol || '?')[0]}</Fallback>
      )}
    </Wrapper>
  );
};

export default TokenLogo;
