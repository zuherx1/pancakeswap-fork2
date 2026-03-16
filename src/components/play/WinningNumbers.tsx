import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const bounce = keyframes`
  0%   { transform: scale(0) rotate(-180deg); opacity: 0; }
  60%  { transform: scale(1.2) rotate(10deg); }
  80%  { transform: scale(0.95); }
  100% { transform: scale(1) rotate(0deg); opacity: 1; }
`;

const Ball = styled.div<{ $color: string; revealed: boolean; delay: number }>`
  width: 48px; height: 48px; border-radius: 50%;
  background: ${({ revealed, $color }) => revealed ? $color : '#383241'};
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; color: white;
  font-family: 'Roboto Mono', monospace;
  transition: background 0.3s;
  box-shadow: ${({ revealed, $color }) => revealed ? `0 4px 16px ${$color}60` : 'none'};
  animation: ${({ revealed }) => revealed ? bounce : 'none'} 0.5s ease forwards;
  animation-delay: ${({ delay }) => delay}ms;
  opacity: ${({ revealed }) => revealed ? 1 : 0.3};
  flex-shrink: 0;
`;

const SmallBall = styled(Ball)`
  width: 32px; height: 32px;
  font-size: 13px;
`;

const Row = styled.div`
  display: flex; gap: 8px; align-items: center; flex-wrap: wrap;
`;

const COLORS = ['#1FC7D4', '#7645D9', '#ED4B9E', '#31D0AA', '#FFB237', '#F0B90B'];

interface Props {
  numbers:   number[];
  size?:     'sm' | 'md';
  animate?:  boolean;
  matchMask?: boolean[]; // which balls to highlight as matched
}

const WinningNumbers: React.FC<Props> = ({ numbers, size = 'md', animate = false, matchMask }) => {
  const [revealed, setRevealed] = useState<boolean[]>(animate ? Array(6).fill(false) : Array(6).fill(true));

  useEffect(() => {
    if (!animate) return;
    numbers.forEach((_, i) => {
      setTimeout(() => {
        setRevealed(prev => prev.map((v, j) => j <= i ? true : v));
      }, i * 400 + 200);
    });
  }, [animate, numbers]);

  const BallComp = size === 'sm' ? SmallBall : Ball;

  return (
    <Row>
      {numbers.map((n, i) => (
        <BallComp
          key={i}
          $color={matchMask ? (matchMask[i] ? COLORS[i] : '#383241') : COLORS[i]}
          revealed={revealed[i]}
          delay={i * 100}
          style={{ opacity: matchMask && !matchMask[i] ? 0.35 : 1 }}
        >
          {revealed[i] ? n : '?'}
        </BallComp>
      ))}
    </Row>
  );
};

export default WinningNumbers;
