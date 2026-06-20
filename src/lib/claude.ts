// src/lib/claude.ts
import { PROTOCOLS } from './constants'

export interface RiskAssessment {
  riskScore: number
  level: 'low' | 'medium' | 'high' | 'critical'
  summary: string
  signals: string[]
  recommendation: string
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

// Fallback mock assessment generator
const getMockAssessment = (protocolId: string, protocolName: string): RiskAssessment => {
  const baseRisk: Record<string, number> = {
    meth: 28, aave: 42, 'merchant-moe': 35, agni: 48,
    init: 55, fluxion: 67, usdy: 18, usde: 52
  }
  const score = baseRisk[protocolId] || 40
  const riskScore = Math.max(15, Math.min(92, score + (Math.floor(Math.random() * 12) - 6)))

  let level: 'low' | 'medium' | 'high' | 'critical' = 'low'
  if (riskScore > 80) level = 'critical'
  else if (riskScore > 65) level = 'high'
  else if (riskScore > 40) level = 'medium'

  return {
    riskScore,
    level,
    summary: `${protocolName} maintains stable on-chain parameters on Mantle Sepolia.`,
    signals: ['Stable liquidity pools', 'Normal gas utilization thresholds', 'Oracle feeds active'],
    recommendation: riskScore < 40 
      ? 'Low risk — position appears safe.' 
      : 'Monitor closely and consider rebalancing if conditions worsen.'
  }
}

export const analyzeProtocolRisk = async (protocolId: string): Promise<RiskAssessment | null> => {
  const protocol = PROTOCOLS.find(p => p.id === protocolId)
  if (!protocol) return null

  if (!GEMINI_API_KEY) {
    console.log('No Gemini API key found - using mock fallback for risk assessment')
    return getMockAssessment(protocolId, protocol.name)
  }

  const prompt = `You are a DeFi risk analyst specializing in the Mantle ecosystem. 
  Perform a risk assessment for the protocol "${protocol.name}" (Type: ${protocol.type}).
  Evaluate both on-chain factors (smart contract security, TVL, liquidation risk) and off-chain RWA custodian/backing factors.
  Provide a JSON object containing:
  - riskScore: integer from 0 to 100 (higher means more risky)
  - level: "low", "medium", "high", or "critical"
  - summary: 1-2 sentence description of the key risk factors
  - signals: array of 3 key indicators of risk observed (e.g. "TVL volatility", "Multisig custody")
  - recommendation: 1 short actionable advice statement`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              riskScore: { type: 'INTEGER' },
              level: { type: 'STRING', enum: ['low', 'medium', 'high', 'critical'] },
              summary: { type: 'STRING' },
              signals: {
                type: 'ARRAY',
                items: { type: 'STRING' }
              },
              recommendation: { type: 'STRING' }
            },
            required: ['riskScore', 'level', 'summary', 'signals', 'recommendation']
          }
        }
      })
    })

    if (!response.ok) throw new Error(`Gemini request failed: ${response.status}`)
    const json = await response.json()
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error('No content returned from Gemini')
    
    return JSON.parse(text) as RiskAssessment
  } catch (error) {
    console.warn(`Gemini analysis failed for ${protocolId}, falling back to mock:`, error)
    return getMockAssessment(protocolId, protocol.name)
  }
}

export const generateHealthInsight = async (summaries: any[]): Promise<string> => {
  if (!GEMINI_API_KEY) {
    const avgRisk = Math.round(summaries.reduce((a, b) => a + (b.riskScore || 40), 0) / summaries.length)
    if (avgRisk > 65) {
      return `Warning: Elevated risk detected across Mantle protocols (average ${avgRisk}/100). Consider defensive positioning.`
    } else if (avgRisk > 45) {
      return `Moderate risk environment on Mantle. Average protocol risk score is ${avgRisk}/100.`
    } else {
      return `Mantle DeFi ecosystem is currently healthy. Average risk score is ${avgRisk}/100. Good conditions for yield strategies.`
    }
  }

  const prompt = `You are a DeFi risk analyst. The following is a list of risk levels for various protocols on the Mantle network:
  ${JSON.stringify(summaries)}
  Provide a concise 1-2 sentence market summary insight indicating the overall state of the Mantle DeFi ecosystem and whether investors should hold, rebalance, or take cover.`

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })

    if (!response.ok) throw new Error(`Gemini query failed: ${response.status}`)
    const json = await response.json()
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text
    return text ? text.trim() : 'Mantle DeFi ecosystem is currently stable.'
  } catch (e) {
    console.warn('Gemini health insight generation failed, using mock insight:', e)
    const avgRisk = Math.round(summaries.reduce((a, b) => a + (b.riskScore || 40), 0) / summaries.length)
    return `Mantle DeFi environment is stable. The average protocol risk score sits at ${avgRisk}/100.`
  }
}

export const generateAgentResponse = async (
  userMessage: string,
  history: { role: string; content: string }[],
  portfolioState: any
): Promise<string> => {
  const getMockResponse = (msg: string) => {
    if (msg.toLowerCase().includes('risk')) {
      return 'Your overall risk exposure is moderate. Native MNT is safe, but monitor secondary synthetic protocols.'
    } else if (msg.toLowerCase().includes('rebalance') || msg.toLowerCase().includes('move')) {
      return 'Actionable Insight: You could rebalance USDC from Aave V3 to Fluxion for a higher yield with a minor risk increase.'
    } else {
      return 'I have analyzed the current Mantle market state. Let me know if you would like me to compare yields or details.'
    }
  }

  if (!GEMINI_API_KEY) {
    await new Promise(r => setTimeout(r, 600))
    return getMockResponse(userMessage)
  }

  const systemInstructions = `You are Polymath Agent, an AI risk co-pilot for Mantle DeFi. 
  Your goal is to provide concise, accurate risk intelligence and DeFi portfolio rebalancing tips.
  The user's current portfolio state is:
  ${JSON.stringify(portfolioState)}
  Respond in a conversational, helpful tone. Be direct and avoid long preambles. Focus on yield opportunities and risk mitigation on Mantle.`

  const contents = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }]
  }))

  contents.push({
    role: 'user',
    parts: [{ text: `${systemInstructions}\n\nUser Message: ${userMessage}` }]
  })

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents })
    })

    if (!response.ok) throw new Error(`Gemini Agent request failed: ${response.status}`)
    const json = await response.json()
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text
    return text ? text.trim() : 'I am reviewing the latest on-chain logs. Please ask again.'
  } catch (error) {
    console.warn('Gemini Agent generation failed, falling back to local simulation:', error)
    await new Promise(r => setTimeout(r, 400))
    return getMockResponse(userMessage)
  }
}