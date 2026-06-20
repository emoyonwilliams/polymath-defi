// src/lib/tokens.ts

export interface TokenConfig {
    symbol: string;
    name: string;
    address: string;           // 'native' for MNT, otherwise contract address
    decimals: number;
    protocol?: string;
    note?: string;
  }
  
  export const TOKEN_LIST: TokenConfig[] = [
    {
      symbol: 'MNT',
      name: 'Mantle',
      address: 'native',
      decimals: 18,
    },
    {
      symbol: 'mETH',
      name: 'mETH',
      address: '0xcDA86A272531e8640cD7F1a92c01839911B90bb0',
      decimals: 18,
      protocol: 'meth',
    },
    {
      symbol: 'USDC',
      name: 'Aave USDC (Mock)',
      address: '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080',
      decimals: 6,
      protocol: 'aave',
    },
    {
      symbol: 'MOE',
      name: 'Merchant Moe',
      address: '0x89503b3e0db3cb324451ca7625fe8c27774d86b1',
      decimals: 18,
      protocol: 'merchant-moe',
    },
    {
      symbol: 'INIT',
      name: 'INIT USD Coin',
      address: '0x1b6a005c3863e08f6f0494b37bb6192b795cb62d',
      decimals: 6,
      protocol: 'init',
    },
    {
      symbol: 'USDY',
      name: 'Ondo USDY',
      address: '0x73c68bc2635aa369ccb31b7a354866ba9ca1babd',
      decimals: 18,
      protocol: 'usdy',
    },
    {
      symbol: 'USDe',
      name: 'Ethena USDe',
      address: '0x5039633649b17501005e7421c5057ba63bf4c4fb',
      decimals: 18,
      protocol: 'usde',
    },
    {
      symbol: 'FLUX',
      name: 'Fluxion Positions NFT',
      address: '0x5997484a39d6902abc9ba567fe7d0968e730c26d',
      decimals: 18,
      protocol: 'fluxion',
      note: 'NFT - Limited testnet support',
    },
  ];
  
  export const getTokenBySymbol = (symbol: string) => 
    TOKEN_LIST.find(t => t.symbol.toLowerCase() === symbol.toLowerCase());