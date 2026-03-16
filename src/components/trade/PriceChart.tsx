import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Candle } from '../../hooks/usePerps';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  min-height: 280px;
  position: relative;
  background: ${({ theme }) => theme.colors.backgroundAlt};
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  display: block;
`;

const TimeframeRow = styled.div`
  display: flex;
  gap: 2px;
  padding: 8px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
`;

const TfBtn = styled.button<{ active?: boolean }>`
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Kanit', sans-serif;
  border: none;
  cursor: pointer;
  background: ${({ active, theme }) => active ? theme.colors.primary : 'transparent'};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.textSubtle};
  transition: all 0.15s;
  &:hover { background: ${({ theme }) => theme.colors.input}; color: ${({ theme }) => theme.colors.text}; }
`;

const TIMEFRAMES = ['1m', '5m', '15m', '1h', '4h', '1d'];

interface Props {
  candles: Candle[];
  symbol:  string;
  isDark?: boolean;
}

const PriceChart: React.FC<Props> = ({ candles, symbol, isDark }) => {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const [tf, setTf] = useState('15m');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !candles.length) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;

    const bg        = isDark ? '#1A1720' : '#FFFFFF';
    const gridColor = isDark ? '#383241' : '#E7E3EB';
    const textColor = isDark ? '#B8ADD2' : '#7A6EAA';
    const upColor   = '#31D0AA';
    const downColor = '#ED4B9E';

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const slice  = candles.slice(-50);
    const prices = slice.flatMap(c => [c.high, c.low]);
    const minP   = Math.min(...prices) * 0.999;
    const maxP   = Math.max(...prices) * 1.001;
    const pRange = maxP - minP;

    const padL = 60, padR = 10, padT = 10, padB = 30;
    const cW   = (W - padL - padR) / slice.length;

    const toY = (p: number) => padT + ((maxP - p) / pRange) * (H - padT - padB);

    // Grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth   = 0.5;
    for (let i = 0; i <= 5; i++) {
      const y = padT + (i / 5) * (H - padT - padB);
      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();
      const price = maxP - (i / 5) * pRange;
      ctx.fillStyle  = textColor;
      ctx.font       = '10px Kanit, sans-serif';
      ctx.textAlign  = 'right';
      ctx.fillText(price > 100 ? price.toFixed(1) : price.toFixed(4), padL - 4, y + 4);
    }

    // Candles
    slice.forEach((c, i) => {
      const x     = padL + i * cW + cW / 2;
      const isUp  = c.close >= c.open;
      const color = isUp ? upColor : downColor;

      ctx.strokeStyle = color;
      ctx.fillStyle   = color;
      ctx.lineWidth   = 1;

      // Wick
      ctx.beginPath();
      ctx.moveTo(x, toY(c.high));
      ctx.lineTo(x, toY(c.low));
      ctx.stroke();

      // Body
      const bodyTop    = toY(Math.max(c.open, c.close));
      const bodyBottom = toY(Math.min(c.open, c.close));
      const bodyH      = Math.max(bodyBottom - bodyTop, 1);
      const bodyW      = Math.max(cW * 0.65, 2);
      ctx.fillRect(x - bodyW / 2, bodyTop, bodyW, bodyH);
    });

    // Volume bars
    const maxVol = Math.max(...slice.map(c => c.volume));
    slice.forEach((c, i) => {
      const x     = padL + i * cW;
      const isUp  = c.close >= c.open;
      const volH  = ((c.volume / maxVol) * (H - padT - padB)) * 0.15;
      ctx.fillStyle = (isUp ? upColor : downColor) + '40';
      ctx.fillRect(x, H - padB - volH, cW * 0.85, volH);
    });

    // Time labels
    ctx.fillStyle = textColor;
    ctx.font      = '10px Kanit, sans-serif';
    ctx.textAlign = 'center';
    [0, 12, 24, 37, 49].forEach(i => {
      if (i >= slice.length) return;
      const x    = padL + i * cW + cW / 2;
      const date = new Date(slice[i].time);
      const lbl  = `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
      ctx.fillText(lbl, x, H - 6);
    });
  }, [candles, isDark]);

  return (
    <Wrapper>
      <TimeframeRow>
        {TIMEFRAMES.map(t => (
          <TfBtn key={t} active={tf === t} onClick={() => setTf(t)}>{t}</TfBtn>
        ))}
      </TimeframeRow>
      <canvas ref={canvasRef} style={{ width: '100%', height: 'calc(100% - 40px)', display: 'block' }} />
    </Wrapper>
  );
};

export default PriceChart;
