export const CONTRACTS = {
  56: {
    factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    cake: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    masterchef: '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652',
    masterchefV2: '0xa5f8C5Dbd5F286960b9d90548680aE5ebFf07652',
    lottery: '0x5aF6D33DE2ccEC94efb1bDF8f92Bd58085432d2c',
    prediction: '0x18B2A687610328590Bc8F2e5fEdDe3b582A49cdA',
    multicall: '0xcA11bde05977b3631167028862bE2a173976CA11',
    wbnb: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    busd: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    usdt: '0x55d398326f99059fF775485246999027B3197955',
  },
  97: {
    factory: '0x6725F303b657a9451d8BA641348b6761A6CC7a17',
    router: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
    cake: '0xFa60D973F7642B748046464e165A65B7323b0C73',
    masterchef: '0x1d32c2945C8FDCBc7156c553B7cEa4325a17f4f9',
    masterchefV2: '0x1d32c2945C8FDCBc7156c553B7cEa4325a17f4f9',
    lottery: '',
    prediction: '',
    multicall: '0xca11bde05977b3631167028862be2a173976ca11',
    wbnb: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
    busd: '0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee',
    usdt: '0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c',
  },
};

export const getContract = (chainId: number, name: keyof typeof CONTRACTS[56]) => {
  return CONTRACTS[chainId as keyof typeof CONTRACTS]?.[name] || '';
};
