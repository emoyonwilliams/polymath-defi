export type Theme = 'dark' | 'light' | 'system'

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type NavSection = 
  | 'dashboard' 
  | 'agent' 
  | 'portfolio' 
  | 'rewards' 
  | 'health' 
  | 'governance' 
  | 'settings'

export interface Protocol {
  id: string
  name: string
  type: 'liquid-staking' | 'lending' | 'dex' | 'rwa' | 'derivatives'
  riskScore: number
  riskLevel: RiskLevel
  status: 'healthy' | 'warning' | 'critical'
  tvl: number
  lastUpdated: number
}

export interface RiskSignal {
  id: string
  protocolId: string
  type: 'on-chain' | 'off-chain' | 'both'
  severity: RiskLevel
  message: string
  timestamp: number
}

export interface WalletState {
  address: string | null
  isConnected: boolean
  chainId: number | null
  balance: string | null
}

export interface ProtocolHealth {
  protocolId: string
  status: 'healthy' | 'warning' | 'critical'
  riskScore: number
  signals: RiskSignal[]
  aiSummary: string
  lastChecked: number
}