// Client-safe Tatum constants and types.
// This file can be imported from both browser and server code.

export interface TatumWallet {
  address:     string;
  privateKey?: string;
  mnemonic?:   string;
  xpub?:       string;
}

export interface TatumBalance {
  address:      string;
  balance:      string;
  currency:     string;
  decimals: number;
}

export interface TatumTx {
  txId:         string;
  status:       string;
}

// Supported chains and their Tatum identifiers
export const TATUM_CHAINS: Record<string, {
  name:     string;
  symbol:   string;
  tatumId:  string;
  chainId:  number;
  decimals: number;
  icon:     string;
  isEVM:    boolean;
}> = {
  BSC:      { name: 'BNB Smart Chain', symbol: 'BNB',   tatumId: 'BSC',      chainId: 56,    decimals: 18, icon: '🟡', isEVM: true  },
  ETH:      { name: 'Ethereum',        symbol: 'ETH',   tatumId: 'ETH',      chainId: 1,     decimals: 18, icon: '🔷', isEVM: true  },
  MATIC:    { name: 'Polygon',         symbol: 'MATIC', tatumId: 'MATIC',    chainId: 137,   decimals: 18, icon: '🟣', isEVM: true  },
  CELO:     { name: 'Celo',            symbol: 'CELO',  tatumId: 'CELO',     chainId: 42220, decimals: 18, icon: '💛', isEVM: true  },
  AVAX:     { name: 'Avalanche',       symbol: 'AVAX',  tatumId: 'AVAX',     chainId: 43114, decimals: 18, icon: '🔴', isEVM: true  },
  FTM:      { name: 'Fantom',          symbol: 'FTM',   tatumId: 'FTM',      chainId: 250,   decimals: 18, icon: '🔵', isEVM: true  },
  ARBITRUM: { name: 'Arbitrum',        symbol: 'ETH',   tatumId: 'ARBITRUM', chainId: 42161, decimals: 18, icon: '🔵', isEVM: true  },
  OPTIMISM: { name: 'Optimism',        symbol: 'ETH',   tatumId: 'OPTIMISM', chainId: 10,    decimals: 18, icon: '🔴', isEVM: true  },
  BASE:     { name: 'Base',            symbol: 'ETH',   tatumId: 'BASE',     chainId: 8453,  decimals: 18, icon: '🔹', isEVM: true  },
  BTC:      { name: 'Bitcoin',         symbol: 'BTC',   tatumId: 'BTC',      chainId: 0,     decimals: 8,  icon: '🟠', isEVM: false },
  LTC:      { name: 'Litecoin',        symbol: 'LTC',   tatumId: 'LTC',      chainId: 0,     decimals: 8,  icon: '⚪', isEVM: false },
  DOGE:     { name: 'Dogecoin',        symbol: 'DOGE',  tatumId: 'DOGE',     chainId: 0,     decimals: 8,  icon: '🐶', isEVM: false },
  SOL:      { name: 'Solana',          symbol: 'SOL',   tatumId: 'SOL',      chainId: 0,     decimals: 9,  icon: '🟣', isEVM: false },
  XRP:      { name: 'XRP Ledger',      symbol: 'XRP',   tatumId: 'XRP',      chainId: 0,     decimals: 6,  icon: '⚫', isEVM: false },
  TRX:      { name: 'TRON',            symbol: 'TRX',   tatumId: 'TRON',     chainId: 0,     decimals: 6,  icon: '🔴', isEVM: false },
};
