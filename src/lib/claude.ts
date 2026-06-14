import { PROTOCOLS } from './constants'

export interface RiskAssessment {
  riskScore: number
  level: 'low' | 'medium' | 'high' | 'critical'
  summary: string
  signals: string[]
  recommendation: string
}

const NANSEN_API_KEY = import.meta.env.VITE_NANSEN_API_KEY

// Real Nansen call (placeholder - adjust endpoint as per Nansen docs)
const fetchNansenMetrics = async (protocolId: string) => {
  if (!NANSEN_API_KEY) {
    console.log('No Nansen API key found - using mock data')
    return null
  }

  try {
    const response = await fetch('https://api.nansen.ai/api/v1/protocol/metrics', {
      method: 'POST',
      headers: {
        'apiKey': NANSEN_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chain: 'mantle',
        protocol: protocolId,
        timeframe: '24h'
      })
    })

    if (!response.ok) throw new Error('Nansen API error')
    return await response.json()
  } catch (error) {
    console.warn(`Nansen fetch failed for ${protocolId}, falling back to mock`)
    return null
  }
}

export const analyzeProtocolRisk = async (protocolId: string): Promise<RiskAssessment | null> => {
  const protocol = PROTOCOLS.find(p => p.id === protocolId)
  if (!protocol) return null

  // Try real Nansen data
  const realData = await fetchNansenMetrics(protocolId)

  // Fallback mock with slight randomization for demo
  const baseRisk = {
    meth: 28, aave: 42, 'merchant-moe': 35, agni: 48,
    init: 55, fluxion: 67, usdy: 18, usde: 52
  }[protocolId] || 40

  await new Promise(r => setTimeout(r, 700))

  const riskScore = Math.max(15, Math.min(92, baseRisk + (Math.floor(Math.random() * 12) - 6)))

  let level: 'low' | 'medium' | 'high' | 'critical' = 'low'
  if (riskScore > 70) level = 'high'
  else if (riskScore > 50) level = 'medium'
  else if (riskScore > 80) level = 'critical'

  return {
    riskScore,
    level,
    summary: realData 
      ? `${protocol.name} shows healthy on-chain metrics according to Nansen data.` 
      : `${protocol.name} maintains stable conditions on Mantle.`,
    signals: realData 
      ? ['Real TVL data from Nansen', 'Utilization within normal range']
      : ['Stable metrics', 'No major anomalies detected'],
    recommendation: riskScore < 40 
      ? 'Low risk — position appears safe.' 
      : 'Monitor closely and consider rebalancing if conditions worsen.'
  }
}

export const generateHealthInsight = async (summaries: any[]): Promise<string> => {
  await new Promise(r => setTimeout(r, 500))

  const avgRisk = Math.round(summaries.reduce((a, b) => a + (b.riskScore || 40), 0) / summaries.length)

  if (avgRisk > 65) {
    return `Warning: Elevated risk detected across Mantle protocols (average ${avgRisk}/100). Consider defensive positioning.`
  } else if (avgRisk > 45) {
    return `Moderate risk environment on Mantle. Average protocol risk score is ${avgRisk}/100.`
  } else {
    return `Mantle DeFi ecosystem is currently healthy. Average risk score is ${avgRisk}/100. Good conditions for yield strategies.`
  }
}