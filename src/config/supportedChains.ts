export interface Chain {
  id:          number;
  name:        string;
  shortName:   string;
  icon:        string;
  color:       string;
  rpcUrl:      string;
  explorerUrl: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  isTestnet?:  boolean;
}

export const SUPPORTED_CHAINS: Chain[] = [
  {
    id: 56,
    name: 'BNB Smart Chain',
    shortName: 'BNB Chain',
    icon: '🟡',
    color: '#F0B90B',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  },
  {
    id: 1,
    name: 'Ethereum',
    shortName: 'Ethereum',
    icon: '🔷',
    color: '#627EEA',
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  {
    id: 42161,
    name: 'Arbitrum One',
    shortName: 'Arbitrum',
    icon: '🔵',
    color: '#2D374B',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  {
    id: 324,
    name: 'zkSync Era',
    shortName: 'zkSync',
    icon: '⚡',
    color: '#4E529A',
    rpcUrl: 'https://mainnet.era.zksync.io',
    explorerUrl: 'https://explorer.zksync.io',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  {
    id: 1101,
    name: 'Polygon zkEVM',
    shortName: 'zkEVM',
    icon: '🟣',
    color: '#8247E5',
    rpcUrl: 'https://zkevm-rpc.com',
    explorerUrl: 'https://zkevm.polygonscan.com',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  {
    id: 59144,
    name: 'Linea',
    shortName: 'Linea',
    icon: '⬛',
    color: '#121212',
    rpcUrl: 'https://rpc.linea.build',
    explorerUrl: 'https://lineascan.build',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  {
    id: 8453,
    name: 'Base',
    shortName: 'Base',
    icon: '🔹',
    color: '#0052FF',
    rpcUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  },
  {
    id: 204,
    name: 'opBNB',
    shortName: 'opBNB',
    icon: '🟠',
    color: '#F0B90B',
    rpcUrl: 'https://opbnb-mainnet-rpc.bnbchain.org',
    explorerUrl: 'https://opbnb.bscscan.com',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  },
  {
    id: 204,
    name: 'Polygon POS',
    shortName: 'Polygon',
    icon: '🟣',
    color: '#8247E5',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
  {
    id: 97,
    name: 'BNB Testnet',
    shortName: 'BNB Testnet',
    icon: '🟡',
    color: '#F0B90B',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    explorerUrl: 'https://testnet.bscscan.com',
    nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
    isTestnet: true,
  },
];

export const getChainById = (id: number): Chain =>
  SUPPORTED_CHAINS.find(c => c.id === id) || SUPPORTED_CHAINS[0];

export const MAINNET_CHAINS  = SUPPORTED_CHAINS.filter(c => !c.isTestnet);
export const TESTNET_CHAINS  = SUPPORTED_CHAINS.filter(c =>  c.isTestnet);
