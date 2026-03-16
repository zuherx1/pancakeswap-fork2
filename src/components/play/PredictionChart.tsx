import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { PricePoint } from '../../hooks/usePrediction';

const Wrapper = styled.div`
  width: 100%;
  height: 200px;
  position: relative;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
`;

const PriceLabel = styled.div`
  position: absolute;
  top: 12px;
  left: 16px;
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSubtle};
`;

const CurrentPrice = styled.div<{ up: boolean }>`
  position: absolute;
  top: 28px;
  left: 16px;
  font-size: 22px;
  font-weight: 700;
  font-family: 'Roboto Mono', monospace;
  color: ${({ up, theme }) => up ? theme.colors.success : theme.colors.danger};
`;

interface Props {
  history:  PricePoint[];
  current:  number;
  lockPrice?: number;
  isDark?:  boolean;
}

const PredictionChart: React.FC<Props> = ({ history, current, lockPrice, isDark }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prev      = history.length > 1 ? history[history.length - 2].price : current;
  const up        = current >= prev;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length < 2) return;

    const dpr  = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    const ctx  = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const W = rect.width, H = rect.height;
    const pad = { top: 16, bottom: 16, left: 8, right: 60 };

    const prices = history.map(p => p.price);
    const minP   = Math.min(...prices) * 0.9995;
    const maxP   = Math.max(...prices) * 1.0005;
    const range  = maxP - minP;
    const toY    = (p: number) => pad.top + ((maxP - p) / range) * (H - pad.top - pad.bottom);
    const toX    = (i: number) => pad.left + (i / (history.length - 1)) * (W - pad.left - pad.right);

    // Clear
    ctx.fillStyle = isDark ? '#1A1720' : '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = isDark ? '#383241' : '#E7E3EB';
    ctx.lineWidth   = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i / 4) * (H - pad.top - pad.bottom);
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right + 8, y); ctx.stroke();
      const price = maxP - (i / 4) * range;
      ctx.fillStyle  = isDark ? '#B8ADD2' : '#7A6EAA';
      ctx.font       = '10px Roboto Mono, monospace';
      ctx.textAlign  = 'left';
      ctx.fillText(price.toFixed(1), W - pad.right + 12, y + 4);
    }

    // Lock price line
    if (lockPrice) {
      const ly = toY(lockPrice);
      ctx.strokeStyle = '#FFB237';
      ctx.lineWidth   = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(pad.left, ly); ctx.lineTo(W - pad.right + 8, ly); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#FFB237';
      ctx.font      = '10px Kanit, sans-serif';
      ctx.fillText(`Lock: ${lockPrice.toFixed(1)}`, W - pad.right + 12, ly - 2);
    }

    // Gradient fill
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, up ? 'rgba(49,208,170,0.25)' : 'rgba(237,75,158,0.25)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.moveTo(toX(0), H);
    history.forEach((p, i) => ctx.lineTo(toX(i), toY(p.price)));
    ctx.lineTo(toX(history.length - 1), H);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = up ? '#31D0AA' : '#ED4B9E';
    ctx.lineWidth   = 2;
    ctx.lineJoin    = 'round';
    history.forEach((p, i) => {
      if (i === 0) ctx.moveTo(toX(i), toY(p.price));
      else         ctx.lineTo(toX(i), toY(p.price));
    });
    ctx.stroke();

    // Current price dot
    const lastX = toX(history.length - 1);
    const lastY = toY(current);
    ctx.beginPath();
    ctx.arc(lastX, lastY, 5, 0, Math.PI * 2);
    ctx.fillStyle = up ? '#31D0AA' : '#ED4B9E';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lastX, lastY, 9, 0, Math.PI * 2);
    ctx.strokeStyle = (up ? '#31D0AA' : '#ED4B9E') + '40';
    ctx.lineWidth   = 2;
    ctx.stroke();
  }, [history, current, lockPrice, isDark, up]);

  return (
    <Wrapper>
      <PriceLabel>BNB/USD</PriceLabel>
      <CurrentPrice up={up}>${current.toFixed(2)}</CurrentPrice>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </Wrapper>
  );
};

export default PredictionChart;
