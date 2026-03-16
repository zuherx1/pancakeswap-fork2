import React, { useEffect, useRef, memo } from 'react';
import styled from 'styled-components';
import { useThemeContext } from '../../context/ThemeContext';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  min-height: 480px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 16px;
  overflow: hidden;
  position: relative;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  z-index: 1;
`;

interface Props {
  symbol?: string;      // e.g. "BINANCE:BNBUSDT"
  interval?: string;   // e.g. "15"
  height?: number;
}

const TradingViewChart: React.FC<Props> = ({
  symbol   = 'BINANCE:BNBUSDT',
  interval = '15',
  height   = 480,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef    = useRef<HTMLScriptElement | null>(null);
  const { isDark }   = useThemeContext();

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'tradingview-widget-container__widget';
    containerRef.current.appendChild(container);

    const script = document.createElement('script');
    script.type  = 'text/javascript';
    script.src   = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize:          true,
      symbol,
      interval,
      timezone:          'Etc/UTC',
      theme:             isDark ? 'dark' : 'light',
      style:             '1',
      locale:            'en',
      backgroundColor:   isDark ? '#1A1720' : '#FFFFFF',
      gridColor:         isDark ? '#383241' : '#E7E3EB',
      hide_top_toolbar:  false,
      hide_legend:       false,
      save_image:        false,
      calendar:          false,
      hide_volume:       false,
      support_host:      'https://www.tradingview.com',
      withdateranges:    true,
      allow_symbol_change: true,
      details:           true,
      hotlist:           false,
      news:              [],
      studies:           ['MASimple@tv-basicstudies'],
      container_id:      'tv_chart',
    });

    containerRef.current.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [symbol, interval, isDark]);

  return (
    <Wrapper style={{ height }}>
      <div
        ref={containerRef}
        className="tradingview-widget-container"
        style={{ height: '100%', width: '100%' }}
      />
    </Wrapper>
  );
};

export default memo(TradingViewChart);

/* ── Symbol map: convert our pair format to TradingView format ─────────── */
export const PAIR_TO_TV_SYMBOL: Record<string, string> = {
  'BNB/USDT':   'BINANCE:BNBUSDT',
  'BTC/USDT':   'BINANCE:BTCUSDT',
  'ETH/USDT':   'BINANCE:ETHUSDT',
  'SOL/USDT':   'BINANCE:SOLUSDT',
  'CAKE/USDT':  'BINANCE:CAKEUSDT',
  'ADA/USDT':   'BINANCE:ADAUSDT',
  'XRP/USDT':   'BINANCE:XRPUSDT',
  'DOGE/USDT':  'BINANCE:DOGEUSDT',
  'DOT/USDT':   'BINANCE:DOTUSDT',
  'AVAX/USDT':  'BINANCE:AVAXUSDT',
  'MATIC/USDT': 'BINANCE:MATICUSDT',
  'LINK/USDT':  'BINANCE:LINKUSDT',
  'LTC/USDT':   'BINANCE:LTCUSDT',
  'BCH/USDT':   'BINANCE:BCHUSDT',
  'UNI/USDT':   'BINANCE:UNIUSDT',
  'ATOM/USDT':  'BINANCE:ATOMUSDT',
  'NEAR/USDT':  'BINANCE:NEARUSDT',
  'FTM/USDT':   'BINANCE:FTMUSDT',
  'AAVE/USDT':  'BINANCE:AAVEUSDT',
};

export function toTVSymbol(fromSymbol: string, toSymbol: string): string {
  const key = `${fromSymbol.toUpperCase()}/${toSymbol.toUpperCase()}`;
  return PAIR_TO_TV_SYMBOL[key] || `BINANCE:${fromSymbol.toUpperCase()}${toSymbol.toUpperCase()}`;
}
