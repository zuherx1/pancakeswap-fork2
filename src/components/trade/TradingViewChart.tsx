import React, { useMemo, memo } from 'react';
import styled from 'styled-components';
import { useThemeContext } from '../../context/ThemeContext';

const Wrapper = styled.div<{ $height: number }>`
  width: 100%;
  height: ${({ $height }) => $height}px;
  min-height: 300px;
  border-radius: 16px;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  position: relative;
`;

interface Props {
  symbol?:   string;
  interval?: string;
  height?:   number;
}

let widgetCounter = 0;

const TradingViewChart: React.FC<Props> = ({
  symbol   = 'BINANCE:BNBUSDT',
  interval = '15',
  height   = 500,
}) => {
  const { isDark } = useThemeContext();
  // Stable ID per mount
  const frameId = useMemo(() => `tv_adv_${++widgetCounter}`, []);

  const src = useMemo(() => {
    const base = 'https://www.tradingview.com/widgetembed/';
    const p    = new URLSearchParams({
      frameElementId:    frameId,
      symbol:            symbol,
      interval:          interval,
      theme:             isDark ? 'dark' : 'light',
      style:             '1',
      locale:            'en',
      enable_publishing: '0',
      allow_symbol_change: '1',
      save_image:        '0',
      hideideas:         '1',
      hide_side_toolbar: '0',
      withdateranges:    '1',
      hide_legend:       '0',
      calendar:          '0',
      hotlist:           '0',
      news:              '0',
      details:           '0',
      studies:           '[]',
      overrides:         '{}',
      studies_overrides: '{}',
      toolbarbg:         isDark ? '1A1720' : 'f4f7f9',
      utm_source:        typeof window !== 'undefined' ? window.location.hostname : '',
    });
    return `${base}?${p.toString()}`;
  }, [symbol, interval, isDark, frameId]);

  return (
    <Wrapper $height={height}>
      <iframe
        id={frameId}
        src={src}
        title={`TradingView Chart — ${symbol}`}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-top-navigation"
        allow="autoplay; fullscreen"
        loading="lazy"
      />
    </Wrapper>
  );
};

export default memo(TradingViewChart);

/* ── Symbol helpers ─────────────────────────────────────────────────────── */
export const PAIR_TO_TV: Record<string, string> = {
  // BNB Chain majors
  'BNB/USDT': 'BINANCE:BNBUSDT',    'BNB/USDC': 'BINANCE:BNBUSDC',
  'BTC/USDT': 'BINANCE:BTCUSDT',    'BTC/USDC': 'BINANCE:BTCUSDC',
  'ETH/USDT': 'BINANCE:ETHUSDT',    'ETH/USDC': 'BINANCE:ETHUSDC',
  'CAKE/USDT':'BINANCE:CAKEUSDT',   'CAKE/BNB': 'BINANCE:CAKEBNB',
  'SOL/USDT': 'BINANCE:SOLUSDT',    'XRP/USDT': 'BINANCE:XRPUSDT',
  'ADA/USDT': 'BINANCE:ADAUSDT',    'DOT/USDT': 'BINANCE:DOTUSDT',
  'DOGE/USDT':'BINANCE:DOGEUSDT',   'MATIC/USDT':'BINANCE:MATICUSDT',
  'AVAX/USDT':'BINANCE:AVAXUSDT',   'LINK/USDT':'BINANCE:LINKUSDT',
  'UNI/USDT': 'BINANCE:UNIUSDT',    'ATOM/USDT':'BINANCE:ATOMUSDT',
  'NEAR/USDT':'BINANCE:NEARUSDT',   'FTM/USDT': 'BINANCE:FTMUSDT',
  'LTC/USDT': 'BINANCE:LTCUSDT',    'BCH/USDT': 'BINANCE:BCHUSDT',
  'TRX/USDT': 'BINANCE:TRXUSDT',    'SHIB/USDT':'BINANCE:SHIBUSDT',
  'AXS/USDT': 'BINANCE:AXSUSDT',    'SAND/USDT':'BINANCE:SANDUSDT',
  'MANA/USDT':'BINANCE:MANAUSDT',   'GALA/USDT':'BINANCE:GALAUSDT',
  'ARB/USDT': 'BINANCE:ARBUSDT',    'OP/USDT':  'BINANCE:OPUSDT',
  'INJ/USDT': 'BINANCE:INJUSDT',    'SUI/USDT': 'BINANCE:SUIUSDT',
  'APT/USDT': 'BINANCE:APTUSDT',    'PEPE/USDT':'BINANCE:PEPEUSDT',
  'WIF/USDT': 'BINANCE:WIFUSDT',    'BONK/USDT':'BINANCE:BONKUSDT',
  'FLOKI/USDT':'BINANCE:FLOKIUSDT', 'WLD/USDT': 'BINANCE:WLDUSDT',
  'LDO/USDT': 'BINANCE:LDOUSDT',    'MKR/USDT': 'BINANCE:MKRUSDT',
  'CRV/USDT': 'BINANCE:CRVUSDT',    'SNX/USDT': 'BINANCE:SNXUSDT',
  'AAVE/USDT':'BINANCE:AAVEUSDT',   'COMP/USDT':'BINANCE:COMPUSDT',
  'SUSHI/USDT':'BINANCE:SUSHIUSDT', '1INCH/USDT':'BINANCE:1INCHUSDT',
  'GRT/USDT': 'BINANCE:GRTUSDT',    'FET/USDT': 'BINANCE:FETUSDT',
  'RNDR/USDT':'BINANCE:RNDRUSDT',   'PYTH/USDT':'BINANCE:PYTHUSDT',
  'STRK/USDT':'BINANCE:STRKUSDT',   'JTO/USDT': 'BINANCE:JTOUSDT',
  // Stock perps
  'AAPL/USD': 'NASDAQ:AAPL',        'AMZN/USD': 'NASDAQ:AMZN',
  'TSLA/USD': 'NASDAQ:TSLA',        'MSFT/USD': 'NASDAQ:MSFT',
  'GOOGL/USD':'NASDAQ:GOOGL',       'NVDA/USD': 'NASDAQ:NVDA',
  // BTCUSDT perps
  'BTCUSDT':  'BINANCE:BTCUSDT',    'ETHUSDT':  'BINANCE:ETHUSDT',
  'BNBUSDT':  'BINANCE:BNBUSDT',    'SOLUSDT':  'BINANCE:SOLUSDT',
};

export function toTVSymbol(from: string, to: string): string {
  const key = `${from.toUpperCase()}/${to.toUpperCase()}`;
  if (PAIR_TO_TV[key]) return PAIR_TO_TV[key];
  // Try the combined symbol (for perps)
  const combined = `${from.toUpperCase()}${to.toUpperCase()}`;
  if (PAIR_TO_TV[combined]) return PAIR_TO_TV[combined];
  return `BINANCE:${from.toUpperCase()}${to.toUpperCase()}`;
}

export function perpSymbolToTV(symbol: string): string {
  // e.g. "BTCUSDT" → "BINANCE:BTCUSDT"
  if (PAIR_TO_TV[symbol]) return PAIR_TO_TV[symbol];
  if (symbol.endsWith('USDT')) return `BINANCE:${symbol}`;
  if (symbol.endsWith('USD'))  return `NASDAQ:${symbol.replace('USD', '')}`;
  return `BINANCE:${symbol}`;
}
