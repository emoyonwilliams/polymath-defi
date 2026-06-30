import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useWalletContext } from '../hooks/useWalletContext'
import { useProtocolHealth } from '../hooks/useProtocolHealth'
import { getProvider } from '../lib/mantle'
import { ethers } from 'ethers'
import { generateAgentResponse, signAgentResponse, verifyAgentSignature, type SignedAgentResponse } from '../lib/ai'
import { fetchSpaceProposals } from '../lib/governance'
import { fetchSmartMoneySignals } from '../lib/nansen'
import { fetchLiveAPYs } from '../lib/yields'
import { getOnChainEntryCount } from '../lib/registry'
import { HermesClient } from '@pythnetwork/hermes-client'
import { TOKEN_LIST, FALLBACK_PRICES } from '../lib/constants'

const hermesClient = new HermesClient("https://hermes.pyth.network", {});

const STARTER_PROMPTS = [
  "Analyze my current risk exposure",
  "Are any Pyth oracle feeds stale right now?",
  "What active governance proposals affect my holdings?",
  "What are smart money wallets doing on Mantle?",
]

// x402 Vault — any valid Mantle Sepolia address to receive MNT top-ups
const X402_VAULT_ADDRESS = '0x4a182a0CfCC7f8A6D0c1766e71F7D51F3E1c90c6'
const X402_TARIFF = 0.003 // MNT per prompt

interface AgentMessage {
  type: 'user' | 'agent'
  content: string
  signature?: string | null
  agentAddress?: string | null
  isOfflineFallback?: boolean
}

export const Agent = () => {
  const { isConnected, address, signer } = useWalletContext()
  const { healthData } = useProtocolHealth()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      type: 'agent',
      content: "Hello! I'm Polymath Research Agent — your autonomous AI co-pilot for Mantle DeFi.\n\nI can analyze protocol risk scores, monitor Pyth oracle feed latency, review active governance proposals, and surface Nansen smart money signals.\n\nConnect your wallet for personalized portfolio intelligence, or ask me anything about the Mantle ecosystem.",
    }
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [verifyingIdx, setVerifyingIdx] = useState<number | null>(null)
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; recovered: string } | null>(null)

  // x402 micropayment channel state
  const [channelBalance, setChannelBalance] = useState(0)
  const [promptCount, setPromptCount] = useState(0)
  const [isTopping, setIsTopping] = useState(false)

  // Sync x402 channel balance & promptCount with localStorage per connected wallet
  useEffect(() => {
    if (address) {
      const savedBal = localStorage.getItem(`x402_bal_${address}`)
      const savedCount = localStorage.getItem(`x402_count_${address}`)
      setChannelBalance(savedBal ? parseFloat(savedBal) : 0)
      setPromptCount(savedCount ? parseInt(savedCount, 10) : 0)
    } else {
      setChannelBalance(0)
      setPromptCount(0)
    }
  }, [address])

  const saveChannelState = (newBal: number, newCount: number) => {
    if (address) {
      localStorage.setItem(`x402_bal_${address}`, newBal.toString())
      localStorage.setItem(`x402_count_${address}`, newCount.toString())
    }
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  // ─── Telemetry Sources ─────────────────────────────────────────────────────

  // 0. Nansen smart money signals (cached 30 min, costs 1 credit per call)
  const { data: smartMoneyData = [] } = useQuery({
    queryKey: ['nansenSmartMoney'],
    queryFn: fetchSmartMoneySignals,
    staleTime: 1800000, // 30 minutes
    gcTime: 3600000,    // 1 hour
    refetchOnWindowFocus: false,
  })

  // 0b. Live DeFiLlama APYs (cached 5 min, free)
  const { data: liveAPYs } = useQuery({
    queryKey: ['defillamaYields'],
    queryFn: fetchLiveAPYs,
    staleTime: 300000, // 5 minutes
    gcTime: 600000,
    refetchOnWindowFocus: false,
  })

  // 0c. Live On-chain Audit Log count (refetched every 15s to update reputation dynamically)
  const { data: onChainLogCount = 0 } = useQuery({
    queryKey: ['onChainRiskLogCount'],
    queryFn: getOnChainEntryCount,
    refetchInterval: 15000,
    refetchOnWindowFocus: true
  })

  // 1. Wallet positions
  const { data: realPositions = [] } = useQuery({
    queryKey: ['agentBalances', address],
    queryFn: async () => {
      if (!address) return []
      const provider = getProvider(true)
      const fetched: any[] = []
      const priceMap: Record<string, number> = { ...FALLBACK_PRICES }

      for (const token of TOKEN_LIST) {
        try {
          let balance: number = 0
          if (token.address === 'native') {
            const bal = await provider.getBalance(address)
            balance = parseFloat(ethers.formatEther(bal))
          } else if (token.address !== null) {
            const contract = new ethers.Contract(token.address, ['function balanceOf(address) view returns (uint256)'], provider)
            const raw = await contract.balanceOf(address)
            balance = parseFloat(ethers.formatUnits(raw, token.decimals))
          } else {
            continue
          }

          if (balance > 0.0001) {
            const usdValue = balance * (priceMap[token.symbol] || 1)
            fetched.push({
              asset: token.symbol,
              protocol: token.protocol,
              balance: balance.toFixed(token.decimals > 6 ? 4 : 2),
              value: `$${usdValue.toFixed(2)}`,
              apy: `${token.apy}%`
            })
          }
        } catch (err) {}
      }
      return fetched
    },
    enabled: !!isConnected && !!address,
    staleTime: 30000,
  })

  // 2. Pyth oracle latency
  const { data: pythOracleState = [] } = useQuery({
    queryKey: ['pythOracleLatency'],
    queryFn: async () => {
      const priceIds = TOKEN_LIST.filter(t => t.priceId).map(t => t.priceId!) as string[]
      if (priceIds.length === 0) return []
      try {
        const priceUpdates = await hermesClient.getLatestPriceUpdates(priceIds)
        const now = Math.floor(Date.now() / 1000)
        return (priceUpdates.parsed || []).map((p: any, index: number) => {
          const token = TOKEN_LIST.find(t => t.priceId === priceIds[index])
          const publishTime = p.price?.publish_time || 0
          const ageSeconds = now - publishTime
          const price = p.price?.price ? Number(p.price.price) * Math.pow(10, p.price.expo) : 0
          return {
            feedId: priceIds[index].slice(0, 10) + '...',
            symbol: token?.symbol || 'Unknown',
            price: price.toFixed(2),
            ageSeconds,
            status: ageSeconds < 10 ? 'fresh' : ageSeconds < 60 ? 'stale' : 'critical',
          }
        })
      } catch { return [] }
    },
    staleTime: 15000,
    refetchInterval: 15000,
  })

  // 3. Governance proposals
  const { data: governanceState = [] } = useQuery({
    queryKey: ['agentGovernance'],
    queryFn: () => fetchSpaceProposals('mantle.eth'),
    staleTime: 60000,
  })

  // 4. Protocol health state (from useProtocolHealth hook)
  const protocolHealthState = healthData
    .filter(p => p.assessment !== null)
    .map(p => ({
      protocol: p.name,
      riskScore: p.assessment?.riskScore,
      level: p.assessment?.level,
      summary: p.assessment?.summary,
      signals: p.assessment?.signals,
    }))

  // ─── x402 Top-Up Handler ───────────────────────────────────────────────────

  const handleTopUp = async () => {
    if (!signer || !isConnected) return
    setIsTopping(true)
    try {
      const tx = await signer.sendTransaction({
        to: X402_VAULT_ADDRESS,
        value: ethers.parseEther('1'),
      })
      await tx.wait()
      const newBal = channelBalance + 1
      setChannelBalance(newBal)
      saveChannelState(newBal, promptCount)
    } catch (err) {
      console.error('x402 top-up failed:', err)
    } finally {
      setIsTopping(false)
    }
  }

  // ─── Signature Verification ────────────────────────────────────────────────

  const handleVerify = async (idx: number) => {
    const msg = messages[idx]
    if (!msg.signature || !msg.agentAddress) return
    setVerifyingIdx(idx)
    const valid = await verifyAgentSignature(msg.content, msg.signature, msg.agentAddress)
    setVerifyResult({ valid, recovered: msg.agentAddress })
  }

  // ─── Send Message ──────────────────────────────────────────────────────────

  const sendMessage = async (textToSend?: string) => {
    const queryText = textToSend || input
    if (!queryText.trim()) return

    const nextMessages: AgentMessage[] = [...messages, { type: 'user', content: queryText }]
    setMessages(nextMessages)
    if (!textToSend) setInput('')
    setIsThinking(true)

    try {
      const history = nextMessages
        .slice(0, -1)
        .map(m => ({
          role: m.type === 'user' ? 'user' : 'assistant',
          content: m.content
        }))

      const result: SignedAgentResponse = await generateAgentResponse(
        queryText,
        history,
        realPositions,
        protocolHealthState,
        pythOracleState,
        governanceState.map(p => ({ title: p.title, status: p.status, deadline: p.deadline, impact: p.impact })),
        smartMoneyData,
        liveAPYs,
      )

      // Sign with ERC-8004 if wallet connected
      let sig: { signature: string; agentAddress: string } | null = null
      if (signer) {
        sig = await signAgentResponse(result.response, signer)
      }

      // Deduct x402 tariff
      let nextBal = channelBalance
      if (channelBalance > 0) {
        nextBal = Math.max(0, channelBalance - X402_TARIFF)
        setChannelBalance(nextBal)
      }
      const nextCount = promptCount + 1
      setPromptCount(nextCount)
      saveChannelState(nextBal, nextCount)

      setMessages(prev => [...prev, {
        type: 'agent',
        content: result.response,
        signature: sig?.signature || result.signature,
        agentAddress: sig?.agentAddress || result.agentAddress,
        isOfflineFallback: result.isOfflineFallback
      }])
    } catch (err) {
      setMessages(prev => [...prev, { 
        type: 'agent', 
        content: 'I had trouble communicating with the AI nodes. Falling back to local offline heuristics mode.',
        isOfflineFallback: true
      }])
    } finally {
      setIsThinking(false)
    }
  }

  // ─── Compute Agent Reputation ──────────────────────────────────────────────
  const avgRisk = protocolHealthState.length > 0
    ? Math.round(protocolHealthState.reduce((sum, p) => sum + (p.riskScore || 50), 0) / protocolHealthState.length)
    : 50
  
  // Tie reputation to avg risk rating AND give +5 boost for each verified on-chain audit logged
  const reputation = Math.min(100, Math.max(0, 100 - avgRisk + (onChainLogCount * 5)))

  return (
    <div className="text-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-2" style={{ fontFamily: 'Lora, serif' }}>Research Agent</h1>
          <p className="text-[#94A3B8] text-sm md:text-base font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Autonomous AI co-pilot for Mantle DeFi — powered by live telemetry
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-6 items-start">

          {/* ─── Left Panel: Agent Intelligence Stack ─────────────────────── */}
          <div className="hidden md:flex md:col-span-4 flex-col gap-5 sticky top-24">

            {/* ERC-8004 Identity Card */}
            <div className="border border-white/[0.04] bg-[#0E111A]/40 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_#10B981]" />
                <h3 className="text-xs font-semibold tracking-wider text-[#64748B] uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>ERC-8004 Identity</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Agent Name</p>
                  <p className="text-sm font-medium text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Polymath Research Agent v1</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Identity Address</p>
                  <p className="text-xs text-[#94A3B8] font-mono break-all">
                    {isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Reputation</p>
                    <p className="text-2xl font-bold text-[#10B981]" style={{ fontFamily: 'Outfit, sans-serif' }}>{reputation}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Status</p>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">Active</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.03] pt-3 mt-3">
                  <div>
                    <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>On-Chain Audits</p>
                    <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{onChainLogCount} logged</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Trust Tier</p>
                    <span className="text-xs text-[#10B981] font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>{reputation >= 90 ? 'Guardian' : reputation >= 75 ? 'Pioneer' : 'Advisory'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* x402 Micropayment Channel */}
            <div className="border border-white/[0.04] bg-[#0E111A]/40 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="text-[#F59E0B] text-sm">⚡</span>
                <h3 className="text-xs font-semibold tracking-wider text-[#64748B] uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>x402 Payment Channel</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Tariff</p>
                    <p className="text-sm font-medium text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{X402_TARIFF} MNT / prompt</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Prompts Sent</p>
                    <p className="text-sm font-medium text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{promptCount}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Channel Balance</p>
                  <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{channelBalance.toFixed(4)} <span className="text-sm text-[#94A3B8] font-normal">MNT</span></p>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${channelBalance > 0 ? 'bg-[#10B981] animate-pulse' : 'bg-[#64748B]'}`} />
                  <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ fontFamily: 'Outfit, sans-serif', color: channelBalance > 0 ? '#10B981' : '#64748B' }}>
                    {channelBalance > 0 ? 'Streaming' : 'Depleted'}
                  </span>
                </div>

                {isConnected && signer && (
                  <button
                    onClick={handleTopUp}
                    disabled={isTopping}
                    className="w-full px-4 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#F59E0B] to-amber-500 hover:brightness-110 disabled:opacity-50 text-black transition-all shadow-lg"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {isTopping ? 'Confirming Transaction...' : 'Top Up Channel (+1 MNT)'}
                  </button>
                )}
              </div>
            </div>

            {/* Active AI Agent Skills */}
            <div className="border border-white/[0.04] bg-[#0E111A]/40 rounded-3xl p-6 shadow-xl">
              <h3 className="text-xs font-semibold tracking-wider text-[#64748B] uppercase mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Active Skills</h3>
              <div className="space-y-3">
                {[
                  { name: 'Risk Analyst', icon: '🛡️', status: protocolHealthState.length > 0 },
                  { name: 'Latency Inspector', icon: '⏱️', status: pythOracleState.length > 0 },
                  { name: 'Proposal Observer', icon: '🗳️', status: governanceState.length > 0 },
                ].map(skill => (
                  <div key={skill.name} className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                      <span className="text-base">{skill.icon}</span>
                      <span className="text-sm text-[#F8FAFC] font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>{skill.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${skill.status ? 'bg-[#10B981] shadow-[0_0_6px_#10B981]' : 'bg-[#64748B]'}`} />
                      <span className={`text-[10px] uppercase tracking-wider font-semibold ${skill.status ? 'text-[#10B981]' : 'text-[#64748B]'}`}>
                        {skill.status ? 'Live' : 'Idle'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Right Panel: Chat Interface ──────────────────────────────── */}
          <div className="col-span-12 md:col-span-8">
            <div className="border border-white/[0.04] bg-[#0E111A]/40 rounded-3xl h-[700px] flex flex-col overflow-hidden shadow-2xl relative">
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/[0.04] flex items-center justify-between bg-[#0A0C16]/20">
                <div>
                  <p className="text-lg font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Polymath Research Agent</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_#10B981]" />
                    <span className="text-xs text-[#10B981] font-medium uppercase tracking-wider">Live • On-chain Intelligence</span>
                  </div>
                </div>
                {/* Telemetry badges (desktop) */}
                <div className="hidden md:flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/[0.03] border border-white/[0.06] text-[#94A3B8]">
                    {pythOracleState.length} Feeds
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/[0.03] border border-white/[0.06] text-[#94A3B8]">
                    {governanceState.filter(p => p.status === 'Active').length} Proposals
                  </span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex flex-col max-w-[85%] sm:max-w-[75%]">
                      <div className={`px-5 py-4 rounded-2xl leading-relaxed text-sm md:text-base font-light shadow-md ${
                        msg.type === 'user'
                          ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-none'
                          : i === 0
                            ? 'welcome-message border border-white/[0.04] bg-white/[0.02]'
                            : 'bg-[#0E111A]/70 border border-white/[0.04] text-[#F8FAFC] rounded-tl-none'
                      }`}>
                        <div className="whitespace-pre-line">{msg.content}</div>
                      </div>

                      {/* ERC-8004 Signature Verification & Fallback Badge */}
                      {msg.type === 'agent' && i > 0 && (
                        <div className="mt-1.5 ml-1 flex flex-wrap items-center gap-3">
                          {msg.signature && (
                            verifyingIdx === i && verifyResult ? (
                              <div className={`flex items-center gap-1.5 text-[10px] font-medium ${verifyResult.valid ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                                <span>{verifyResult.valid ? '✓' : '✗'}</span>
                                <span>{verifyResult.valid ? `Verified: ${verifyResult.recovered.slice(0, 6)}...${verifyResult.recovered.slice(-4)}` : 'Signature mismatch'}</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleVerify(i)}
                                className="text-[10px] text-[#64748B] hover:text-[#10B981] transition-colors font-medium underline underline-offset-2"
                                style={{ fontFamily: 'Outfit, sans-serif' }}
                              >
                                Verify ERC-8004 Signature
                              </button>
                            )
                          )}
                          {msg.isOfflineFallback && (
                            <span className="text-[9px] text-[#F59E0B] font-semibold border border-[#F59E0B]/20 bg-[#F59E0B]/5 px-2 py-0.5 rounded-full" style={{ fontFamily: 'Outfit, sans-serif' }}>
                              Offline Fallback Heuristics
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-[#0E111A]/70 border border-white/[0.04] rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-3 shadow-md">
                      <div className="w-2 h-2 bg-[#10B981] rounded-full animate-ping shadow-[0_0_8px_#10B981]" />
                      <span className="text-[#94A3B8] text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>Analyzing on-chain telemetry...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Mobile Quick Prompts */}
              <div className="md:hidden px-6 pt-3 pb-1 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-2">
                {STARTER_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    className="inline-block px-4 py-2 text-xs rounded-full border border-white/[0.04] bg-[#0E111A]/60 text-[#94A3B8] active:border-[#10B981]/50 active:bg-white/[0.03] transition-all"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-5 border-t border-white/[0.04] bg-[#0A0C16]/20">
                {!isConnected && (
                  <div className="mb-3 text-center">
                    <p className="text-[#64748B] text-xs font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Connect your wallet for portfolio-specific intelligence. General ecosystem queries work without a wallet.
                    </p>
                  </div>
                )}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about risk, oracle latency, governance, or rebalancing..."
                    className="flex-1 bg-[#080A10]/60 border border-white/[0.05] rounded-xl px-5 py-3.5 focus:outline-none focus:border-[#10B981]/50 text-sm md:text-base font-light transition-colors"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim()}
                    className="px-6 md:px-8 bg-gradient-to-r from-[#10B981] to-emerald-600 hover:brightness-115 disabled:opacity-50 text-black font-semibold rounded-xl text-sm transition-all shadow-[0_2px_8px_rgba(16,185,129,0.1)] flex items-center justify-center gap-1.5"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    <span>Send</span>
                    <span className="material-symbols-outlined text-base">send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}