export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
  chainId: number;
}

export const BSC_TOKENS: Token[] = [
  {
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    symbol: 'WBNB',
    name: 'Wrapped BNB',
    decimals: 18,
    logoURI: 'https://tokens.pancakeswap.finance/images/symbol/bnb.png',
    chainId: 56,
  },
  {
    address: 'BNB',
    symbol: 'BNB',
    name: 'BNB',
    decimals: 18,
    logoURI: 'https://tokens.pancakeswap.finance/images/symbol/bnb.png',
    chainId: 56,
  },
  {
    address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    symbol: 'CAKE',
    name: 'PancakeSwap Token',
    decimals: 18,
    logoURI: 'https://tokens.pancakeswap.finance/images/symbol/cake.png',
    chainId: 56,
  },
  {
    address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    symbol: 'BUSD',
    name: 'Binance USD',
    decimals: 18,
    logoURI: 'https://tokens.pancakeswap.finance/images/symbol/busd.png',
    chainId: 56,
  },
  {
    address: '0x55d398326f99059fF775485246999027B3197955',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 18,
    logoURI: 'https://tokens.pancakeswap.finance/images/symbol/usdt.png',
    chainId: 56,
  },
  {
    address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 18,
    logoURI: 'https://tokens.pancakeswap.finance/images/symbol/usdc.png',
    chainId: 56,
  },
  {
    address: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    symbol: 'ETH',
    name: 'Ethereum Token',
    decimals: 18,
    logoURI: 'https://tokens.pancakeswap.finance/images/symbol/eth.png',
    chainId: 56,
  },
  {
    address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    symbol: 'BTCB',
    name: 'BTCB Token',
    decimals: 18,
    logoURI: 'https://tokens.pancakeswap.finance/images/symbol/btcb.png',
    chainId: 56,
  },
  {
    address: '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3',
    symbol: 'DAI',
    name: 'Dai Token',
    decimals: 18,
    logoURI: 'https://tokens.pancakeswap.finance/images/symbol/dai.png',
    chainId: 56,
  },
  {
    address: '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',
    symbol: 'ADA',
    name: 'Cardano Token',
    decimals: 18,
    logoURI: 'https://tokens.pancakeswap.finance/images/symbol/ada.png',
    chainId: 56,
  },
  {
    address: '0xCC42724C6683B7E57334c4E856f4c9965ED682bD',
    symbol: 'MATIC',
    name: 'Matic Token',
    decimals: 18,
    logoURI: 'https://tokens.pancakeswap.finance/images/symbol/matic.png',
    chainId: 56,
  },
  {
    address: '0xbA2aE424d960c26247Dd6c32edC70B295c744C43',
    symbol: 'DOGE',
    name: 'Dogecoin',
    decimals: 8,
    logoURI: 'https://tokens.pancakeswap.finance/images/symbol/doge.png',
    chainId: 56,
  },
];

export const getNativeToken = (chainId: number): Token => ({
  address: 'BNB',
  symbol: 'BNB',
  name: 'BNB',
  decimals: 18,
  logoURI: 'https://tokens.pancakeswap.finance/images/symbol/bnb.png',
  chainId,
});
