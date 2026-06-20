import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useWalletContext } from '../hooks/useWalletContext'
import { getProvider } from '../lib/mantle'
import { ethers } from 'ethers'
import { generateAgentResponse } from '../lib/claude'

const STARTER_PROMPTS = [
  "Analyze my current risk exposure",
  "Compare mETH vs USDY yield right now",
  "What should I rebalance today?",
  "Is my portfolio safe?",
]

const TOKEN_LIST = [
  { symbol: 'MNT', name: 'Mantle', address: 'native', decimals: 18, protocol: 'Mantle', apy: 0 },
  { symbol: 'mETH', name: 'mETH', address: '0xcDA86A272531e8640cD7F1a92c01839911B90bb0', decimals: 18, protocol: 'Mantle Staking', apy: 4.8 },
  { symbol: 'USDC', name: 'Aave USDC', address: '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080', decimals: 6, protocol: 'Aave V3', apy: 3.8 },
  { symbol: 'MOE', name: 'Merchant Moe', address: '0x89503b3e0db3cb324451ca7625fe8c27774d86b1', decimals: 18, protocol: 'Merchant Moe', apy: 8.4 },
  { symbol: 'INIT', name: 'INIT USD Coin', address: '0x1b6a005c3863e08f6f0494b37bb6192b795cb62d', decimals: 6, protocol: 'INIT Capital', apy: 5.5 },
  { symbol: 'USDY', name: 'Ondo USDY', address: '0x73c68bc2635aa369ccb31b7a354866ba9ca1babd', decimals: 18, protocol: 'Ondo Finance', apy: 5.1 },
  { symbol: 'USDe', name: 'Ethena USDe', address: '0x5039633649b17501005e7421c5057ba63bf4c4fb', decimals: 18, protocol: 'Ethena', apy: 4.2 },
  { symbol: 'FLUX', name: 'Fluxion Position', address: '0x5997484a39d6902abc9ba567fe7d0968e730c26d', decimals: 18, protocol: 'Fluxion', apy: 12.5 },
]

export const Agent = () => {
  const { isConnected, address } = useWalletContext()
  const [messages, setMessages] = useState([
    {
      type: 'agent',
      content: "Hello! I'm Polymath Agent — your AI risk co-pilot for Mantle DeFi.\n\nConnect your wallet to get personalized insights based on your actual positions."
    }
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)

  // Fetch user positions to provide context to Gemini RAG
  const { data: realPositions = [] } = useQuery({
    queryKey: ['agentBalances', address],
    queryFn: async () => {
      if (!address) return []
      const provider = getProvider(true)
      const fetched: any[] = []
      const priceMap: Record<string, number> = { MNT: 0.65, mETH: 2600, USDC: 1, MOE: 0.85, INIT: 1, USDY: 1.02, USDe: 1, FLUX: 120 }

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

  const sendMessage = async (textToSend?: string) => {
    const queryText = textToSend || input
    if (!queryText.trim()) return
    if (!isConnected) {
      setMessages(prev => [...prev, { 
        type: 'agent', 
        content: "Please connect your wallet first to get personalized Mantle intelligence." 
      }])
      return
    }

    const nextMessages = [...messages, { type: 'user', content: queryText }]
    setMessages(nextMessages)
    if (!textToSend) setInput('')
    setIsThinking(true)

    try {
      const history = nextMessages
        .slice(0, -1) // exclude current prompt
        .map(m => ({
          role: m.type === 'user' ? 'user' : 'model',
          content: m.content
        }))

      const response = await generateAgentResponse(queryText, history, realPositions)
      setMessages(prev => [...prev, { type: 'agent', content: response }])
    } catch (err) {
      setMessages(prev => [...prev, { type: 'agent', content: 'I had trouble communicating with the AI nodes. Please try again.' }])
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="text-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-2" style={{ fontFamily: 'Lora, serif' }}>Agent</h1>
          <p className="text-[#94A3B8] text-sm md:text-base font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Your AI-powered DeFi co-pilot for Mantle
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Sidebar - Quick Prompts (Desktop Only Sidebar) */}
          <div className="hidden md:block md:col-span-3 sticky top-24">
            <div className="border border-white/[0.04] bg-[#0E111A]/40 rounded-3xl p-6 shadow-xl">
              <h3 className="text-sm font-semibold tracking-wider text-[#64748B] uppercase mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Quick Prompts</h3>
              <div className="space-y-2.5">
                {STARTER_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      sendMessage(prompt)
                    }}
                    className="w-full text-left px-4 py-3.5 rounded-xl border border-white/[0.04] bg-white/[0.01] hover:border-[#10B981]/30 hover:bg-white/[0.03] text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-all duration-200 leading-snug font-light"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="col-span-12 md:col-span-9">
            <div className="border border-white/[0.04] bg-[#0E111A]/40 rounded-3xl h-[650px] flex flex-col overflow-hidden shadow-2xl relative">
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/[0.04] flex items-center justify-between bg-[#0A0C16]/20">
                <div>
                  <p className="text-lg font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Polymath Agent</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_#10B981]" />
                    <span className="text-xs text-[#10B981] font-medium uppercase tracking-wider">Live • On-chain Intelligence</span>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-[75%] px-5 py-4 rounded-2xl leading-relaxed text-sm md:text-base font-light shadow-md ${
                      msg.type === 'user' 
                        ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-none' 
                        : i === 0
                          ? `welcome-message border border-white/[0.04] bg-white/[0.02]`
                          : 'bg-[#0E111A]/70 border border-white/[0.04] text-[#F8FAFC] rounded-tl-none'
                    }`}>
                      <div className="whitespace-pre-line">{msg.content}</div>
                    </div>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-[#0E111A]/70 border border-white/[0.04] rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-3 shadow-md">
                      <div className="w-2 h-2 bg-[#10B981] rounded-full animate-ping shadow-[0_0_8px_#10B981]" />
                      <span className="text-[#94A3B8] text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>Analyzing on-chain data...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Quick Prompts (Horizontal Scrollable list above input) */}
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
                  <div className="mb-4 text-center">
                    <p className="text-[#64748B] text-xs font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Connect your wallet to get personalized Mantle intelligence and portfolio-specific recommendations.
                    </p>
                  </div>
                )}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about risk, average APY, or portfolio health..."
                    className="flex-1 bg-[#080A10]/60 border border-white/[0.05] rounded-xl px-5 py-3.5 focus:outline-none focus:border-[#10B981]/50 text-sm md:text-base font-light transition-colors"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || !isConnected}
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