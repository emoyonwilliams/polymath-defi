export const MANTLE_RPC = 'https://rpc.mantle.xyz'
export const MANTLE_TESTNET_RPC = 'https://rpc.sepolia.mantle.xyz'
export const MANTLE_CHAIN_ID = 5000
export const MANTLE_TESTNET_CHAIN_ID = 5003
export const RISKLOG_CONTRACT_ADDRESS = '0x4a182a0CfCC7f8A6D0c1766e71F7D51F3E1c90c6'

export const PROTOCOLS = [
  {
    id: 'meth',
    name: 'mETH',
    type: 'liquid-staking',
    description: 'Mantle liquid staking protocol',
    color: '#10B981',
  },
  {
    id: 'aave',
    name: 'Aave V3',
    type: 'lending',
    description: 'Decentralised lending and borrowing',
    color: '#B6509E',
  },
  {
    id: 'merchant-moe',
    name: 'Merchant Moe',
    type: 'dex',
    description: 'Native Mantle DEX and liquidity protocol',
    color: '#F59E0B',
  },
  {
    id: 'agni',
    name: 'Agni Finance',
    type: 'dex',
    description: 'Concentrated liquidity DEX on Mantle',
    color: '#3B82F6',
  },
  {
    id: 'init',
    name: 'INIT Capital',
    type: 'lending',
    description: 'Liquidity hook money market',
    color: '#8B5CF6',
  },
  {
    id: 'fluxion',
    name: 'Fluxion',
    type: 'derivatives',
    description: 'Derivatives protocol on Mantle',
    color: '#EC4899',
  },
  {
    id: 'usdy',
    name: 'USDY',
    type: 'rwa',
    description: 'Ondo Finance yield-bearing stablecoin backed by US Treasuries',
    color: '#00D4AA',
  },
  {
    id: 'usde',
    name: 'USDe',
    type: 'rwa',
    description: 'Ethena synthetic dollar',
    color: '#6366F1',
  },
]

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', comingSoon: false },
  { id: 'agent', label: 'Agent', comingSoon: false },
  { id: 'portfolio', label: 'Portfolio', comingSoon: false },
  { id: 'rewards', label: 'Rewards', comingSoon: false },
  { id: 'health', label: 'Health', comingSoon: false },
  { id: 'governance', label: 'Governance', comingSoon: false },
  { id: 'settings', label: 'Settings', comingSoon: false },
  { id: 'docs', label: 'Docs', comingSoon: false },
]

// Canonical token list — single source of truth for all pages
export const TOKEN_LIST = [
  { symbol: 'MNT', name: 'Mantle', address: 'native', decimals: 18, protocol: 'Mantle', priceId: '0x4e3037c822d852d79af3ac80e35eb420ee3b870dca49f9344a38ef4773fb0585', apy: 0 },
  { symbol: 'mETH', name: 'mETH', address: '0xcDA86A272531e8640cD7F1a92c01839911B90bb0', decimals: 18, protocol: 'Mantle Staking', priceId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', apy: 4.8 },
  { symbol: 'USDC', name: 'Aave USDC', address: '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080', decimals: 6, protocol: 'Aave V3', priceId: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a', apy: 3.8 },
  { symbol: 'MOE', name: 'Merchant Moe', address: '0x89503b3e0db3cb324451ca7625fe8c27774d86b1', decimals: 18, protocol: 'Merchant Moe', apy: 8.4 },
  { symbol: 'INIT', name: 'INIT USD Coin', address: '0x1b6a005c3863e08f6f0494b37bb6192b795cb62d', decimals: 6, protocol: 'INIT Capital', apy: 5.5 },
  { symbol: 'USDY', name: 'Ondo USDY', address: '0x73c68bc2635aa369ccb31b7a354866ba9ca1babd', decimals: 18, protocol: 'Ondo Finance', apy: 5.1 },
  { symbol: 'USDe', name: 'Ethena USDe', address: '0x5039633649b17501005e7421c5057ba63bf4c4fb', decimals: 18, protocol: 'Ethena', apy: 4.2 },
  { symbol: 'FLUX', name: 'Fluxion Position', address: '0x5997484a39d6902abc9ba567fe7d0968e730c26d', decimals: 18, protocol: 'Fluxion', apy: 12.5 },
]

// Unified fallback prices when Pyth is unavailable
export const FALLBACK_PRICES: Record<string, number> = {
  MNT: 0.65, mETH: 3000, USDC: 1, MOE: 0.85,
  INIT: 1, USDY: 1.02, USDe: 1, FLUX: 120
}