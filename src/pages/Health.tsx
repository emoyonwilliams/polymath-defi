import { useState } from 'react'
import { Navbar } from '../components/layout/Navbar'
import { useProtocolHealth } from '../hooks/useProtocolHealth'
import { useWalletContext } from '../hooks/useWalletContext'
import { logRiskOnChain } from '../lib/registry'

// Import protocol logos
import methLogo from '../assets/protocols/meth.png'
import aaveLogo from '../assets/protocols/aave.png'
import merchantMoeLogo from '../assets/protocols/merchant-moe.png'
import agniLogo from '../assets/protocols/agni.png'
import initLogo from '../assets/protocols/init.png'
import fluxionLogo from '../assets/protocols/fluxion.png'
import usdyLogo from '../assets/protocols/usdy.png'
import usdeLogo from '../assets/protocols/usde.png'

const RISK_COLORS = {
  low: { text: 'text-[#10B981]', bg: 'bg-[#10B981]/10', border: 'border-[#10B981]/20' },
  medium: { text: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/20' },
  high: { text: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/20' },
  critical: { text: 'text-[#EF4444]', bg: 'bg-[#EF4444]/20', border: 'border-[#EF4444]/30' },
}

const PROTOCOL_TYPES: Record<string, string> = {
  meth: 'Liquid Staking',
  aave: 'Lending',
  'merchant-moe': 'DEX',
  agni: 'DEX',
  init: 'Money Market',
  fluxion: 'Derivatives',
  usdy: 'RWA',
  usde: 'Synthetic',
}

const RISK_TYPE: Record<string, string> = {
  meth: 'On-chain + Bridge',
  aave: 'On-chain',
  'merchant-moe': 'On-chain',
  agni: 'On-chain',
  init: 'On-chain',
  fluxion: 'On-chain',
  usdy: 'Off-chain + On-chain',
  usde: 'Off-chain + On-chain',
}

const PROTOCOL_LOGOS: Record<string, string> = {
  meth: methLogo,
  aave: aaveLogo,
  'merchant-moe': merchantMoeLogo,
  agni: agniLogo,
  init: initLogo,
  fluxion: fluxionLogo,
  usdy: usdyLogo,
  usde: usdeLogo,
}

export const Health = () => {
  const {
    healthData,
    globalInsight,
    isAnalyzing,
    lastChecked,
    analyzeAll,
    getCriticalCount,
    getWarningCount,
  } = useProtocolHealth()

  const { isConnected, signer } = useWalletContext()
  const [loggedTx, setLoggedTx] = useState<string | null>(null)
  const [isLogging, setIsLogging] = useState(false)

  const handleAnalyze = async () => {
    await analyzeAll()
  }

  const handleLogOnChain = async () => {
    if (!signer || !isConnected) return
    setIsLogging(true)
    const firstProtocol = healthData.find(p => p.assessment)
    if (firstProtocol?.assessment) {
      const tx = await logRiskOnChain(
        signer,
        '0x0000000000000000000000000000000000000001',
        firstProtocol.assessment.riskScore,
        firstProtocol.assessment.summary
      )
      if (tx) setLoggedTx(tx)
    }
    setIsLogging(false)
  }

  const formatTime = (ts: number | null) => {
    if (!ts) return 'Never'
    const diff = Math.floor((Date.now() - ts) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-normal mb-1" style={{ fontFamily: 'Lora, serif' }}>Health</h1>
            <p className="text-[#94A3B8] text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Protocol risk monitoring across Mantle DeFi
            </p>
          </div>
          <div className="flex gap-3">
            {isConnected && signer && healthData.some(p => p.assessment) && (
              <button 
                onClick={handleLogOnChain} 
                disabled={isLogging} 
                className="px-6 py-3 rounded-full font-medium text-sm border border-[#1E1E2E] bg-[#0F2A22] hover:bg-[#1A3A2E] hover:border-[#10B981] transition-all"
                style={{ fontFamily: 'DM Sans, sans-serif', color: '#FFFFFF' }}
              >
                {isLogging ? 'Logging...' : 'Log On-chain'}
              </button>
            )}
            <button 
              onClick={handleAnalyze} 
              disabled={isAnalyzing} 
              className="px-6 py-3 rounded-full font-medium text-sm bg-white hover:bg-gray-200 transition-all"
              style={{ fontFamily: 'DM Sans, sans-serif', color: '#000000' }}
            >
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Protocols Monitored', value: '8' },
            { label: 'Critical Alerts', value: String(getCriticalCount()) },
            { label: 'High Risk', value: String(getWarningCount()) },
            { label: 'Last Check', value: formatTime(lastChecked) },
          ].map(s => (
            <div key={s.label} className="border border-[#1E1E2E] bg-[#0F2A22] p-6 rounded-xl">
              <p className="text-xs text-[#94A3B8] mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.label}</p>
              <p className="text-2xl font-bold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.value}</p>
            </div>
          ))}
        </div>

        {loggedTx && (
          <div className="border border-[#10B981]/20 bg-[#0F2A22] p-6 rounded-xl mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                <p className="text-sm text-[#10B981] font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>Risk assessment logged on-chain</p>
              </div>
              <a 
                href={`https://explorer.sepolia.mantle.xyz/tx/${loggedTx}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-[#94A3B8] hover:text-white transition-colors"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                View on Explorer →
              </a>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1 font-mono break-all">{loggedTx}</p>
          </div>
        )}

        <div className="border border-[#1E1E2E] bg-[#0F2A22] p-8 rounded-xl mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <h2 className="text-sm font-semibold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>Health Insight</h2>
            <span className="text-xs text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>AI-powered • Demo Mode</span>
          </div>
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
              <p className="text-[#94A3B8] text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>Analyzing protocol health across Mantle...</p>
            </div>
          ) : globalInsight ? (
            <p className="text-[#94A3B8] leading-relaxed" style={{ fontFamily: 'DM Sans, sans-serif' }}>{globalInsight}</p>
          ) : (
            <p className="text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              {!isConnected 
                ? "Connect your wallet and run analysis for personalized risk insights." 
                : "Run Analysis to get real-time risk clarity across Mantle protocols."}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthData.map(protocol => {
            const assessment = protocol.assessment
            const level = assessment?.level || 'low'
            const colors = RISK_COLORS[level]
            const logo = PROTOCOL_LOGOS[protocol.protocolId]

            return (
              <div key={protocol.protocolId} className={`border p-8 rounded-xl ${colors.border} bg-[#0F2A22]`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {logo && (
                      <img 
                        src={logo} 
                        alt={protocol.name} 
                        className="w-10 h-10 object-contain"
                      />
                    )}
                    <div>
                      <h3 className="text-base font-semibold text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{protocol.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{PROTOCOL_TYPES[protocol.protocolId]}</span>
                        <span className="text-[#1E1E2E]">·</span>
                        <span className="text-xs text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{RISK_TYPE[protocol.protocolId]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {protocol.isLoading ? (
                      <div className="w-4 h-4 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" />
                    ) : assessment ? (
                      <>
                        <span className={`text-2xl font-bold ${colors.text}`}>{assessment.riskScore}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${colors.text} ${colors.bg}`}>{assessment.level}</span>
                      </>
                    ) : (
                      <span className="text-xs text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Not analyzed</span>
                    )}
                  </div>
                </div>

                {assessment ? (
                  <>
                    <p className="text-[#94A3B8] leading-relaxed mb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>{assessment.summary}</p>
                    <div className="space-y-1 mb-3">
                      {assessment.signals.map((signal, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className={`text-xs mt-0.5 ${colors.text}`}>-</span>
                          <span className="text-xs text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{signal}</span>
                        </div>
                      ))}
                    </div>
                    <div className={`text-xs px-3 py-2 rounded-lg ${colors.bg} ${colors.text}`}>
                      {assessment.recommendation}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-6">
                    <button 
                      onClick={handleAnalyze} 
                      disabled={!isConnected}
                      className="text-xs text-[#94A3B8] hover:text-white transition-colors px-6 py-2 border border-[#1E1E2E] rounded-full hover:border-[#10B981] disabled:opacity-50"
                      style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                      {!isConnected ? "Connect wallet to analyze" : "Click Run Analysis to assess risk"}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}