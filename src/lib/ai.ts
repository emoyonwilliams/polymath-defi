// src/lib/ai.ts — Provider-agnostic AI module (backed by GitHub Models / OpenAI-compatible API)
import { PROTOCOLS } from './constants'

export interface RiskAssessment {
  riskScore: number
  level: 'low' | 'medium' | 'high' | 'critical'
  summary: string
  signals: string[]
  recommendation: string
}

export interface SignedAgentResponse {
  response: string
  signature: string | null
  agentAddress: string | null
  isOfflineFallback?: boolean
}

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || ''
const API_BASE = 'https://models.inference.ai.azure.com/chat/completions'

// Models — gpt-4o-mini for fast structured tasks, gpt-4o for nuanced agent chat
const FAST_MODEL = 'gpt-4o-mini'
const AGENT_MODEL = 'gpt-4o'

// ─── Helper: Call GitHub Models API ───────────────────────────────────────────

const callModel = async (
  model: string,
  messages: { role: string; content: string }[],
  jsonMode: boolean = false
): Promise<string> => {
  const body: any = { model, messages, max_tokens: 1024 }
  if (jsonMode) {
    body.response_format = { type: 'json_object' }
  }

  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`GitHub Models API error (${response.status}): ${errorBody}`)
  }

  const json = await response.json()
  return json.choices?.[0]?.message?.content || ''
}

// ─── Fallback Mock Assessment Generator ──────────────────────────────────────

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

// ─── Protocol Risk Analysis ──────────────────────────────────────────────────

export const analyzeProtocolRisk = async (protocolId: string): Promise<RiskAssessment | null> => {
  const protocol = PROTOCOLS.find(p => p.id === protocolId)
  if (!protocol) return null

  if (!GITHUB_TOKEN) {
    console.log('No GitHub token found - using mock fallback for risk assessment')
    return getMockAssessment(protocolId, protocol.name)
  }

  const systemPrompt = `You are a DeFi risk analyst specializing in the Mantle ecosystem.
You must respond with a valid JSON object containing exactly these fields:
- riskScore: integer from 0 to 100 (higher means more risky)
- level: one of "low", "medium", "high", or "critical"
- summary: 1-2 sentence description of the key risk factors
- signals: array of exactly 3 key risk indicators observed (e.g. "TVL volatility", "Multisig custody")
- recommendation: 1 short actionable advice statement

Respond ONLY with the JSON object. No markdown, no code fences, no extra text.`

  const userPrompt = `Perform a risk assessment for the protocol "${protocol.name}" (Type: ${protocol.type}).
Evaluate both on-chain factors (smart contract security, TVL, liquidation risk) and off-chain RWA custodian/backing factors.`

  try {
    const text = await callModel(FAST_MODEL, [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ], true)

    return JSON.parse(text) as RiskAssessment
  } catch (error) {
    console.warn(`AI analysis failed for ${protocolId}, falling back to mock:`, error)
    return getMockAssessment(protocolId, protocol.name)
  }
}

// ─── Global Health Insight ───────────────────────────────────────────────────

export const generateHealthInsight = async (summaries: any[]): Promise<string> => {
  if (!GITHUB_TOKEN) {
    const avgRisk = Math.round(summaries.reduce((a, b) => a + (b.riskScore || 40), 0) / summaries.length)
    if (avgRisk > 65) {
      return `Warning: Elevated risk detected across Mantle protocols (average ${avgRisk}/100). Consider defensive positioning.`
    } else if (avgRisk > 45) {
      return `Moderate risk environment on Mantle. Average protocol risk score is ${avgRisk}/100.`
    } else {
      return `Mantle DeFi ecosystem is currently healthy. Average risk score is ${avgRisk}/100. Good conditions for yield strategies.`
    }
  }

  try {
    const text = await callModel(FAST_MODEL, [
      {
        role: 'system',
        content: 'You are a DeFi risk analyst. Provide a concise 1-2 sentence market summary.'
      },
      {
        role: 'user',
        content: `The following is a list of risk levels for various protocols on the Mantle network:
${JSON.stringify(summaries)}
Provide a concise 1-2 sentence market summary insight indicating the overall state of the Mantle DeFi ecosystem and whether investors should hold, rebalance, or take cover.`
      }
    ])
    return text.trim() || 'Mantle DeFi ecosystem is currently stable.'
  } catch (e) {
    console.warn('AI health insight generation failed, using mock insight:', e)
    const avgRisk = Math.round(summaries.reduce((a, b) => a + (b.riskScore || 40), 0) / summaries.length)
    return `Mantle DeFi environment is stable. The average protocol risk score sits at ${avgRisk}/100.`
  }
}

// ─── Agent Co-pilot Response ─────────────────────────────────────────────────

export const generateAgentResponse = async (
  userMessage: string,
  history: { role: string; content: string }[],
  portfolioState: any,
  protocolHealthState?: any,
  pythOracleState?: any,
  governanceState?: any,
  smartMoneyState?: any,
  liveYieldsState?: any
): Promise<SignedAgentResponse> => {
  const getMockResponse = (msg: string) => {
    if (msg.toLowerCase().includes('risk')) {
      return 'Your overall risk exposure is moderate. Native MNT is safe, but monitor secondary synthetic protocols.'
    } else if (msg.toLowerCase().includes('rebalance') || msg.toLowerCase().includes('move')) {
      return 'Actionable Insight: You could rebalance USDC from Aave V3 to Fluxion for a higher yield with a minor risk increase.'
    } else if (msg.toLowerCase().includes('oracle') || msg.toLowerCase().includes('latency') || msg.toLowerCase().includes('pyth')) {
      return 'Pyth oracle feeds are currently operational. Feed latency data will be available once telemetry is loaded.'
    } else if (msg.toLowerCase().includes('governance') || msg.toLowerCase().includes('proposal')) {
      return 'There are active governance proposals on Snapshot for the Mantle ecosystem. Run Health analysis to load full telemetry.'
    } else {
      return 'I have analyzed the current Mantle market state. Let me know if you would like me to compare yields, check oracle latency, or review governance proposals.'
    }
  }

  if (!GITHUB_TOKEN) {
    await new Promise(r => setTimeout(r, 600))
    return { response: getMockResponse(userMessage), signature: null, agentAddress: null }
  }

  // Build rich system context from all telemetry sources
  let telemetryContext = ''

  if (portfolioState && (Array.isArray(portfolioState) ? portfolioState.length > 0 : true)) {
    telemetryContext += `\n\n## User Portfolio State\n${JSON.stringify(portfolioState)}`
  }

  if (protocolHealthState && protocolHealthState.length > 0) {
    telemetryContext += `\n\n## Live Protocol Risk Assessments (8 Mantle protocols)\n${JSON.stringify(protocolHealthState)}`
  }

  if (pythOracleState && pythOracleState.length > 0) {
    telemetryContext += `\n\n## Pyth Oracle Feed Latency\n${JSON.stringify(pythOracleState)}`
  }

  if (governanceState && governanceState.length > 0) {
    telemetryContext += `\n\n## Active Snapshot Governance Proposals\n${JSON.stringify(governanceState)}`
  }

  if (smartMoneyState && smartMoneyState.length > 0) {
    telemetryContext += `\n\n## Nansen Smart Money Holdings\nThe following shows what institutional funds and historically profitable traders are holding across Mantle and Ethereum for tokens relevant to this ecosystem:\n${JSON.stringify(smartMoneyState)}`
  }

  if (liveYieldsState && Object.keys(liveYieldsState).length > 0) {
    telemetryContext += `\n\n## Live DeFiLlama Yield Rates\nReal-time APY data for Mantle protocols (updated every 5 minutes):\n${JSON.stringify(liveYieldsState)}`
  }

  const systemInstructions = `You are Polymath Research Agent — an autonomous AI risk co-pilot for Mantle DeFi.

Your capabilities include:
1. Portfolio Risk Analysis — evaluating user positions against live protocol risk scores
2. Oracle Latency Inspection — monitoring Pyth Hermes feed staleness and price confidence
3. Governance Proposal Observation — analyzing active Snapshot proposals and their impact on user holdings
4. Smart Money Intelligence — surfacing Nansen institutional fund and smart trader holdings data

You have access to the following LIVE telemetry data:
${telemetryContext || '\n(No telemetry loaded yet — user may need to run Health analysis first)'}

Guidelines:
- Be direct and avoid long preambles. Focus on actionable intelligence.
- When discussing risk, reference specific protocol scores and levels from the telemetry.
- When discussing oracle health, cite specific feed ages in seconds.
- When discussing governance, reference actual proposal titles and deadlines.
- When discussing smart money, cite specific token symbols, holder counts, and 24h balance changes from Nansen data.
- If the user has no wallet connected, you can still answer questions about general ecosystem health, oracle status, governance, and smart money signals.
- If portfolio-specific data is missing, acknowledge it and suggest connecting a wallet.`

  const contents = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'assistant',
    content: h.content
  }))

  contents.push({ role: 'user', content: userMessage })

  try {
    const text = await callModel(AGENT_MODEL, [
      { role: 'system', content: systemInstructions },
      ...contents,
    ])

    return {
      response: text.trim() || 'I am reviewing the latest on-chain logs. Please ask again.',
      signature: null,
      agentAddress: null,
      isOfflineFallback: false
    }
  } catch (error) {
    console.warn('AI Agent generation failed, falling back to local simulation:', error)
    await new Promise(r => setTimeout(r, 400))
    return { 
      response: getMockResponse(userMessage), 
      signature: null, 
      agentAddress: null,
      isOfflineFallback: true
    }
  }
}

// ─── ERC-8004 Signature Utilities ────────────────────────────────────────────

export const signAgentResponse = async (
  responseText: string,
  signer: any
): Promise<{ signature: string; agentAddress: string } | null> => {
  if (!signer) return null
  try {
    const { ethers } = await import('ethers')
    const messageHash = ethers.id(responseText)
    const signature = await signer.signMessage(messageHash)
    const agentAddress = await signer.getAddress()
    return { signature, agentAddress }
  } catch (error) {
    console.warn('Failed to sign agent response:', error)
    return null
  }
}

export const verifyAgentSignature = async (
  responseText: string,
  signature: string,
  expectedAddress: string
): Promise<boolean> => {
  try {
    const { ethers } = await import('ethers')
    const messageHash = ethers.id(responseText)
    const recovered = ethers.verifyMessage(messageHash, signature)
    return recovered.toLowerCase() === expectedAddress.toLowerCase()
  } catch {
    return false
  }
}
