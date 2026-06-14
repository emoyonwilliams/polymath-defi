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
  { id: 'agent', label: 'Agent', comingSoon: true },
  { id: 'portfolio', label: 'Portfolio', comingSoon: false },
  { id: 'rewards', label: 'Rewards', comingSoon: true },
  { id: 'health', label: 'Health', comingSoon: false },
  { id: 'governance', label: 'Governance', comingSoon: true },
  { id: 'settings', label: 'Settings', comingSoon: false },
]