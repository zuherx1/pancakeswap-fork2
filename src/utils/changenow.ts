const API_KEY  = process.env.NEXT_PUBLIC_CHANGENOW_API_KEY || '';
const BASE_V2  = 'https://api.changenow.io/v2';
const BASE_V1  = 'https://api.changenow.io/v1';

const headers = {
  'Content-Type': 'application/json',
  'x-changenow-api-key': API_KEY,
};

export interface CNcurrency {
  ticker:    string;
  name:      string;
  image:     string;
  network?:  string;
  isFiat?:   boolean;
  hasExternalId?: boolean;
  isStable?: boolean;
  supportsFixedRate?: boolean;
}

export interface CNestimate {
  estimatedAmount: number;
  transactionSpeedForecast?: string;
  warningMessage?: string | null;
  rateId?: string;
  fromAmount?: number;
}

export interface CNtransaction {
  id:            string;
  payinAddress:  string;
  payoutAddress: string;
  fromCurrency:  string;
  toCurrency:    string;
  fromAmount:    number;
  toAmount:      number;
  status?:       string;
}

export interface CNstatus {
  id:           string;
  status:       string;
  payinAddress: string;
  fromCurrency: string;
  toCurrency:   string;
  fromAmount:   number;
  expectedSendAmount: number;
  expectedReceiveAmount: number;
  updatedAt:    string;
}

/* ── Available currencies ─────────────────────────────────────────────────── */
export async function getCurrencies(active = true): Promise<CNcurrency[]> {
  const res = await fetch(`${BASE_V1}/currencies?active=${active}&flow=standard`, { headers });
  if (!res.ok) throw new Error('Failed to fetch currencies');
  return res.json();
}

/* ── Min amount ───────────────────────────────────────────────────────────── */
export async function getMinAmount(from: string, to: string): Promise<number> {
  const res = await fetch(`${BASE_V1}/min-amount/${from}_${to}?api_key=${API_KEY}`);
  if (!res.ok) return 0;
  const data = await res.json();
  return data.minAmount ?? 0;
}

/* ── Estimated exchange amount ────────────────────────────────────────────── */
export async function getEstimate(
  fromCurrency: string,
  toCurrency:   string,
  fromAmount:   number,
  flow:         'standard' | 'fixed-rate' = 'standard',
): Promise<CNestimate> {
  const params = new URLSearchParams({
    fromCurrency,
    toCurrency,
    fromAmount: String(fromAmount),
    flow,
  });
  const res = await fetch(`${BASE_V2}/exchange/estimated-amount?${params}`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Estimation failed');
  }
  return res.json();
}

/* ── Create exchange transaction ──────────────────────────────────────────── */
export async function createExchange(payload: {
  fromCurrency:   string;
  toCurrency:     string;
  fromAmount:     number;
  address:        string;
  flow?:          string;
  refundAddress?: string;
  rateId?:        string;
}): Promise<CNtransaction> {
  const body = {
    ...payload,
    flow: payload.flow || 'standard',
    type: 'direct',
  };
  const res = await fetch(`${BASE_V2}/exchange`, {
    method:  'POST',
    headers,
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create exchange');
  }
  return res.json();
}

/* ── Transaction status ───────────────────────────────────────────────────── */
export async function getTransactionStatus(id: string): Promise<CNstatus> {
  const res = await fetch(`${BASE_V2}/exchange/by-id?id=${id}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch status');
  return res.json();
}

/* ── Popular currencies list (fallback) ───────────────────────────────────── */
export const POPULAR_CRYPTO: CNcurrency[] = [
  { ticker: 'btc',  name: 'Bitcoin',       image: 'https://changenow.io/images/sprite/currencies/btc.svg'  },
  { ticker: 'eth',  name: 'Ethereum',      image: 'https://changenow.io/images/sprite/currencies/eth.svg'  },
  { ticker: 'bnb',  name: 'BNB',           image: 'https://changenow.io/images/sprite/currencies/bnb.svg'  },
  { ticker: 'usdt', name: 'Tether USD',    image: 'https://changenow.io/images/sprite/currencies/usdt.svg' },
  { ticker: 'usdc', name: 'USD Coin',      image: 'https://changenow.io/images/sprite/currencies/usdc.svg' },
  { ticker: 'sol',  name: 'Solana',        image: 'https://changenow.io/images/sprite/currencies/sol.svg'  },
  { ticker: 'ada',  name: 'Cardano',       image: 'https://changenow.io/images/sprite/currencies/ada.svg'  },
  { ticker: 'dot',  name: 'Polkadot',      image: 'https://changenow.io/images/sprite/currencies/dot.svg'  },
  { ticker: 'matic',name: 'Polygon',       image: 'https://changenow.io/images/sprite/currencies/matic.svg'},
  { ticker: 'ltc',  name: 'Litecoin',      image: 'https://changenow.io/images/sprite/currencies/ltc.svg'  },
  { ticker: 'xrp',  name: 'XRP',           image: 'https://changenow.io/images/sprite/currencies/xrp.svg'  },
  { ticker: 'doge', name: 'Dogecoin',      image: 'https://changenow.io/images/sprite/currencies/doge.svg' },
  { ticker: 'trx',  name: 'TRON',          image: 'https://changenow.io/images/sprite/currencies/trx.svg'  },
  { ticker: 'avax', name: 'Avalanche',     image: 'https://changenow.io/images/sprite/currencies/avax.svg' },
  { ticker: 'link', name: 'Chainlink',     image: 'https://changenow.io/images/sprite/currencies/link.svg' },
  { ticker: 'cake', name: 'PancakeSwap',   image: 'https://changenow.io/images/sprite/currencies/cake.svg' },
];

export const FIAT_CURRENCIES: CNcurrency[] = [
  { ticker: 'usd', name: 'US Dollar',     image: '🇺🇸', isFiat: true },
  { ticker: 'eur', name: 'Euro',          image: '🇪🇺', isFiat: true },
  { ticker: 'gbp', name: 'British Pound', image: '🇬🇧', isFiat: true },
  { ticker: 'cad', name: 'Canadian Dollar',image:'🇨🇦', isFiat: true },
  { ticker: 'aud', name: 'Australian Dollar',image:'🇦🇺',isFiat: true },
];
