import { useState } from 'react'
import { Navbar } from '../components/layout/Navbar'
import { useWalletContext } from '../hooks/useWalletContext'

const STARTER_PROMPTS = [
  "Analyze my current risk exposure",
  "Compare mETH vs USDY yield right now",
  "What should I rebalance today?",
  "Is my portfolio safe?",
]

export const Agent = () => {
    const { isConnected } = useWalletContext()
  const [messages, setMessages] = useState([
    {
      type: 'agent',
      content: "Hello! I'm Polymath Agent — your AI risk co-pilot for Mantle DeFi.\n\nConnect your wallet to get personalized insights based on your actual positions."
    }
  ])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)

  const sendMessage = () => {
    if (!input.trim()) return
    if (!isConnected) {
      // Optional: gently remind user
      setMessages(prev => [...prev, { 
        type: 'agent', 
        content: "Please connect your wallet first to get personalized Mantle intelligence." 
      }])
      return
    }

    setMessages(prev => [...prev, { type: 'user', content: input }])
    const query = input.trim()
    setInput('')
    setIsThinking(true)

    setTimeout(() => {
      let response = "I've analyzed the current Mantle market conditions."

      if (query.toLowerCase().includes("risk")) {
        response = "Your overall risk exposure is moderate based on current on-chain data. mETH position is stable, but watch USDY institutional risk."
      } else if (query.toLowerCase().includes("rebalance") || query.toLowerCase().includes("move")) {
        response = "Strong opportunity detected: Consider moving part of your position from Merchant Moe to Fluxion for better risk-adjusted yield."
      } else if (query.toLowerCase().includes("safe") || query.toLowerCase().includes("meth")) {
        response = "Your mETH position currently appears safe with stable metrics."
      } else {
        response = "I've reviewed the latest on-chain data. Let me know more details about your portfolio for a more precise recommendation."
      }

      setMessages(prev => [...prev, { type: 'agent', content: response }])
      setIsThinking(false)
    }, 1100)
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        <div className="mb-12">
          <h1 className="text-5xl font-normal tracking-tighter mb-3" style={{ fontFamily: 'Lora, serif' }}>Agent</h1>
          <p className="text-[#94A3B8] text-xl" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Your AI-powered DeFi co-pilot for Mantle
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-3">
            <div className="border border-[#1E1E2E] bg-[#0F2A22] rounded-3xl p-8 sticky top-24">
              <h3 className="text-lg font-medium mb-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>Quick Prompts</h3>
              <div className="space-y-3">
                {STARTER_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(prompt)
                      sendMessage()
                    }}
                    className="w-full text-left p-5 rounded-2xl border border-[#1E1E2E] hover:border-[#10B981] hover:bg-[#1A3A2E] transition-all text-sm leading-snug"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Chat */}
          <div className="md:col-span-9">
            <div className="border border-[#1E1E2E] bg-[#0F2A22] rounded-3xl h-[700px] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-8 border-b border-[#1E1E2E]">
                <p className="text-2xl font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>Polymath Agent</p>
                <p className="text-sm text-[#10B981] mt-1">Live • Powered by Nansen + On-chain Intelligence</p>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[78%] px-6 py-5 rounded-3xl ${
                      msg.type === 'user' 
                        ? 'bg-white text-black' 
                        : 'bg-[#1A2A24] border border-[#25253A]'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-[#1A2A24] border border-[#25253A] rounded-3xl px-6 py-5 flex items-center gap-3">
                      <div className="w-2 h-2 bg-[#10B981] rounded-full animate-ping" />
                      <span className="text-[#94A3B8]">Analyzing on-chain data...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-8 border-t border-[#1E1E2E]">
                {!isConnected && (
                  <div className="mb-4 text-center">
                    <p className="text-[#94A3B8] text-sm">
                      Connect your wallet to get personalized Mantle intelligence and portfolio-specific recommendations.
                    </p>
                  </div>
                )}
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about your risk, yield, rebalancing, or portfolio health..."
                    className="flex-1 bg-[#1E1E2E] border border-[#2E2E3E] rounded-2xl px-6 py-5 focus:outline-none focus:border-[#10B981] text-base"
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!input.trim() || !isConnected}
                    className="px-10 bg-gradient-to-r from-[#10B981] to-emerald-600 hover:brightness-110 disabled:opacity-50 text-black font-medium rounded-2xl transition-all"
                  >
                    Send
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