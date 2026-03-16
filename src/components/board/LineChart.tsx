import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { ChartPoint } from '../../hooks/useInfo';

const Wrapper = styled.div`
  width: 100%;
  height: 200px;
  position: relative;
`;

interface Props {
  data:      ChartPoint[];
  color?:    string;
  label?:    string;
  formatY?:  (v: number) => string;
  isDark?:   boolean;
  fillColor?:string;
}

const LineChart: React.FC<Props> = ({
  data, color = '#1FC7D4', label, formatY, isDark, fillColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    const dpr  = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    const ctx  = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;

    const pad  = { top: 20, bottom: 28, left: 8, right: 72 };
    const vals = data.map(d => d.value);
    const minV = Math.min(...vals) * 0.97;
    const maxV = Math.max(...vals) * 1.01;
    const rng  = maxV - minV;

    const toX = (i: number) => pad.left + (i / (data.length - 1)) * (W - pad.left - pad.right);
    const toY = (v: number) => pad.top + ((maxV - v) / rng) * (H - pad.top - pad.bottom);

    // Background
    ctx.fillStyle = isDark ? '#1A1720' : '#FFFFFF';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = isDark ? '#38324160' : '#E7E3EB60';
    ctx.lineWidth   = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (i / 4) * (H - pad.top - pad.bottom);
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right + 4, y); ctx.stroke();
      const v = maxV - (i / 4) * rng;
      ctx.fillStyle  = isDark ? '#B8ADD250' : '#7A6EAA80';
      ctx.font       = '10px Roboto Mono, monospace';
      ctx.textAlign  = 'left';
      ctx.fillText(formatY ? formatY(v) : v.toFixed(0), W - pad.right + 8, y + 4);
    }

    // Fill gradient
    const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
    grad.addColorStop(0, (fillColor || color) + '40');
    grad.addColorStop(1, (fillColor || color) + '00');
    ctx.beginPath();
    ctx.moveTo(toX(0), H - pad.bottom);
    data.forEach((d, i) => ctx.lineTo(toX(i), toY(d.value)));
    ctx.lineTo(toX(data.length - 1), H - pad.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2.5;
    ctx.lineJoin    = 'round';
    data.forEach((d, i) => i === 0 ? ctx.moveTo(toX(i), toY(d.value)) : ctx.lineTo(toX(i), toY(d.value)));
    ctx.stroke();

    // X axis date labels
    ctx.fillStyle = isDark ? '#B8ADD270' : '#7A6EAA70';
    ctx.font      = '10px Kanit, sans-serif';
    ctx.textAlign = 'center';
    [0, Math.floor(data.length / 3), Math.floor(data.length * 2 / 3), data.length - 1].forEach(i => {
      if (i >= data.length) return;
      const d    = new Date(data[i].time);
      const lbl  = `${d.getMonth() + 1}/${d.getDate()}`;
      ctx.fillText(lbl, toX(i), H - 6);
    });
  }, [data, color, formatY, isDark, fillColor]);

  return (
    <Wrapper>
      {label && (
        <div style={{ position: 'absolute', top: 0, left: 8, fontSize: 11, color: '#7A6EAA', fontWeight: 600 }}>
          {label}
        </div>
      )}
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </Wrapper>
  );
};

export default LineChart;
