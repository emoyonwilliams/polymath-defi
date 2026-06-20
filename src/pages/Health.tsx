import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useProtocolHealth } from '../hooks/useProtocolHealth'
import { useWalletContext } from '../hooks/useWalletContext'
import { useSettings } from '../contexts/SettingsContext'
import { checkAndSendPortfolioAlerts } from '../lib/telegram'
import { logRiskOnChain } from '../lib/registry'
import { getProvider } from '../lib/mantle'
import { ethers } from 'ethers'

import methLogo from '../assets/protocols/meth.png'
import aaveLogo from '../assets/protocols/aave.png'
import merchantMoeLogo from '../assets/protocols/merchant-moe.png'
import agniLogo from '../assets/protocols/agni.png'
import initLogo from '../assets/protocols/init.png'
import fluxionLogo from '../assets/protocols/fluxion.png'
import usdyLogo from '../assets/protocols/usdy.png'
import usdeLogo from '../assets/protocols/usde.png'

const TOKEN_LIST = [
  { symbol: 'MNT', name: 'Mantle', address: 'native', decimals: 18, protocol: 'meth' },
  { symbol: 'mETH', name: 'mETH', address: '0xcDA86A272531e8640cD7F1a92c01839911B90bb0', decimals: 18, protocol: 'meth' },
  { symbol: 'USDC', name: 'Aave USDC', address: '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080', decimals: 6, protocol: 'aave' },
  { symbol: 'MOE', name: 'Merchant Moe', address: '0x89503b3e0db3cb324451ca7625fe8c27774d86b1', decimals: 18, protocol: 'merchant-moe' },
  { symbol: 'INIT', name: 'INIT USD Coin', address: '0x1b6a005c3863e08f6f0494b37bb6192b795cb62d', decimals: 6, protocol: 'init' },
  { symbol: 'USDY', name: 'Ondo USDY', address: '0x73c68bc2635aa369ccb31b7a354866ba9ca1babd', decimals: 18, protocol: 'usdy' },
  { symbol: 'USDe', name: 'Ethena USDe', address: '0x5039633649b17501005e7421c5057ba63bf4c4fb', decimals: 18, protocol: 'usde' },
  { symbol: 'FLUX', name: 'Fluxion Position', address: '0x5997484a39d6902abc9ba567fe7d0968e730c26d', decimals: 18, protocol: 'fluxion' },
]

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

const PROTOCOL_CONTRACTS: Record<string, string> = {
  meth: '0xcDA86A272531e8640cD7F1a92c01839911B90bb0',
  aave: '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080',
  'merchant-moe': '0x89503b3e0db3cb324451ca7625fe8c27774d86b1',
  init: '0x1b6a005c3863e08f6f0494b37bb6192b795cb62d',
  usdy: '0x73c68bc2635aa369ccb31b7a354866ba9ca1babd',
  usde: '0x5039633649b17501005e7421c5057ba63bf4c4fb',
  fluxion: '0x5997484a39d6902abc9ba567fe7d0968e730c26d',
  agni: '0x34d399625fe8c27774d86b1acab8129e2ce587fd',
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

  const { isConnected, address, signer } = useWalletContext()
  const { telegramChatId, enableTelegram, alertLevel } = useSettings()
  const [loggingStatus, setLoggingStatus] = useState<Record<string, 'loading' | 'success' | 'error' | null>>({})
  const [txHashes, setTxHashes] = useState<Record<string, string>>({})
  const [alertStatus, setAlertStatus] = useState<string>('')

  const handleAnalyze = async () => {
    setAlertStatus('')
    await analyzeAll()
    
    if (enableTelegram && telegramChatId) {
      setAlertStatus('Checking for portfolio alerts...')
      try {
        const assessments = healthData
          .filter(h => h.assessment !== null)
          .map(h => ({
            protocolId: h.protocolId,
            name: h.name,
            level: h.assessment!.level,
            riskScore: h.assessment!.riskScore,
            summary: h.assessment!.summary,
          }))

        const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
        if (token) {
          const sentTo = await checkAndSendPortfolioAlerts(
            token,
            telegramChatId,
            alertLevel,
            realBalances,
            assessments
          )
          if (sentTo.length > 0) {
            setAlertStatus(`Alerts dispatched to Telegram for: ${sentTo.join(', ')}`)
          } else {
            setAlertStatus('Ecosystem check complete. No portfolio thresholds breached.')
          }
        } else {
          setAlertStatus('Alert trigger skipped: VITE_TELEGRAM_BOT_TOKEN is not configured.')
        }
      } catch (err) {
        console.error('Failed to trigger portfolio alerts:', err)
        setAlertStatus('Error checking/sending alerts.')
      }
    }
  }

  const handleLogProtocolOnChain = async (protocolId: string, riskScore: number, summary: string) => {
    if (!signer || !isConnected) return
    
    setLoggingStatus(prev => ({ ...prev, [protocolId]: 'loading' }))
    
    const protocolAddress = PROTOCOL_CONTRACTS[protocolId] || '0x0000000000000000000000000000000000000001'
    
    try {
      const txHash = await logRiskOnChain(
        signer,
        protocolAddress,
        riskScore,
        summary
      )
      
      if (txHash) {
        setTxHashes(prev => ({ ...prev, [protocolId]: txHash }))
        setLoggingStatus(prev => ({ ...prev, [protocolId]: 'success' }))
      } else {
        setLoggingStatus(prev => ({ ...prev, [protocolId]: 'error' }))
      }
    } catch (err) {
      console.error('Failed to log risk on chain:', err)
      setLoggingStatus(prev => ({ ...prev, [protocolId]: 'error' }))
    }
  }

  const { data: realBalances = [] } = useQuery({
    queryKey: ['healthBalances', address],
    queryFn: async () => {
      if (!address) return []
      const provider = getProvider(true)
      const fetched: any[] = []

      for (const token of TOKEN_LIST) {
        try {
          let balance: number = 0

          if (token.address === 'native') {
            const bal = await provider.getBalance(address)
            balance = parseFloat(ethers.formatEther(bal))
          } else if (token.address !== null) {
            const contract = new ethers.Contract(
              token.address,
              ['function balanceOf(address) view returns (uint256)'],
              provider
            )
            const raw = await contract.balanceOf(address)
            balance = parseFloat(ethers.formatUnits(raw, token.decimals))
          } else {
            continue
          }

          if (balance > 0.0001) {
            fetched.push({ symbol: token.symbol, protocol: token.protocol, balance })
          }
        } catch (err) {}
      }
      return fetched
    },
    enabled: !!isConnected && !!address,
    staleTime: 30000,
  })

  const formatTime = (ts: number | null) => {
    if (!ts) return 'Never'
    const diff = Math.floor((Date.now() - ts) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return `${Math.floor(diff / 3600)}h ago`
  }

  return (
    <div className="text-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-2" style={{ fontFamily: 'Lora, serif' }}>Health</h1>
            <p className="text-[#94A3B8] text-sm md:text-base font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Protocol risk monitoring across Mantle DeFi • Live Data
            </p>
            {alertStatus && (
              <p className="text-[#10B981] text-xs mt-2 font-medium animate-pulse" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {alertStatus}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-6 py-3 rounded-full font-bold text-sm bg-[#F8FAFC] hover:bg-[#F8FAFC]/90 text-black shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>
        </div>

        {/* Detected Positions Banner */}
        {isConnected && realBalances.length > 0 && (
          <div className="border border-white/[0.04] bg-[#0E111A]/40 p-6 rounded-2xl shadow-xl mb-6">
            <p className="text-xs font-semibold tracking-wider text-[#64748B] uppercase mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Detected Positions</p>
            <div className="flex flex-wrap gap-2.5">
              {realBalances.map((b: any, i: number) => (
                <span 
                  key={i} 
                  className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/15 rounded-full text-xs font-semibold text-[#10B981] shadow-sm" 
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {b.symbol}: {b.balance.toFixed(4)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Protocols Monitored', value: '8' },
            { label: 'Critical Alerts', value: String(getCriticalCount()), critical: getCriticalCount() > 0 },
            { label: 'High Risk Alerts', value: String(getWarningCount()), warning: getWarningCount() > 0 },
            { label: 'Last Check', value: formatTime(lastChecked) },
          ].map(s => (
            <div key={s.label} className="border border-white/[0.04] bg-[#0E111A]/40 p-6 rounded-2xl shadow-xl transition-all hover:border-white/[0.08]">
              <p className="text-xs font-semibold tracking-wider text-[#64748B] uppercase mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.label}</p>
              <p 
                className={`text-3xl font-semibold mb-1 ${
                  s.critical ? 'text-[#EF4444]' : s.warning ? 'text-[#F59E0B]' : 'text-white'
                }`} 
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Global Health Insight Panel */}
        <div className="border border-white/[0.04] bg-[#0E111A]/40 p-6 md:p-8 rounded-2xl shadow-xl mb-8">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>Global Health Insight</h2>
          </div>
          {globalInsight ? (
            <p className="text-[#94A3B8] leading-relaxed text-sm md:text-base font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>{globalInsight}</p>
          ) : (
            <p className="text-[#94A3B8] font-light text-sm md:text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Run Analysis to retrieve real-time global risk clarity.
            </p>
          )}
        </div>

        {/* Protocol Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {healthData.map(protocol => {
            const assessment = protocol.assessment
            const level = assessment?.level || 'low'
            const colors = RISK_COLORS[level]
            const logo = PROTOCOL_LOGOS[protocol.protocolId]

            return (
              <div 
                key={protocol.protocolId} 
                className={`border p-6 md:p-8 rounded-2xl bg-[#0E111A]/40 shadow-xl flex flex-col justify-between transition-all duration-300 hover:border-white/[0.08] hover:bg-[#0E111A]/55 ${
                  assessment ? colors.border : 'border-white/[0.04]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      {logo && <img src={logo} alt={protocol.name} className="w-10 h-10 object-contain logo-invert rounded-xl" />}
                      <div>
                        <h3 className="text-base md:text-lg font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{protocol.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[#94A3B8] font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>{PROTOCOL_TYPES[protocol.protocolId]}</span>
                          <span className="text-white/10">•</span>
                          <span className="text-xs text-[#94A3B8] font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>{RISK_TYPE[protocol.protocolId]}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {assessment ? (
                        <>
                          <span className={`text-2xl font-bold ${colors.text}`} style={{ fontFamily: 'Outfit, sans-serif' }}>{assessment.riskScore}</span>
                          <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-bold shadow-sm ${colors.text} ${colors.bg}`}>{assessment.level}</span>
                        </>
                      ) : (
                        <span className="text-xs text-[#64748B] font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>Not analyzed</span>
                      )}
                    </div>
                  </div>

                  {assessment ? (
                    <>
                      <p className="text-[#94A3B8] leading-relaxed mb-4 text-sm font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>{assessment.summary}</p>
                      <div className="space-y-1.5 mb-6">
                        {assessment.signals.map((signal, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <span className={`text-xs mt-0.5 ${colors.text}`}>•</span>
                            <span className="text-xs text-[#64748B] font-light leading-snug" style={{ fontFamily: 'Outfit, sans-serif' }}>{signal}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center py-8">
                      <button
                        onClick={handleAnalyze}
                        className="text-xs font-semibold text-[#94A3B8] hover:text-white transition-all px-6 py-2.5 border border-white/[0.05] rounded-full hover:border-[#10B981]"
                        style={{ fontFamily: 'Outfit, sans-serif' }}
                      >
                        Run Analysis
                      </button>
                    </div>
                  )}
                </div>

                {assessment && (
                  <div className="mt-4 space-y-3">
                    <div className={`text-xs md:text-sm px-4 py-3 rounded-xl ${colors.bg} ${colors.text} font-medium border border-white/[0.01]`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                      {assessment.recommendation}
                    </div>

                    {isConnected && signer && (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-white/[0.03]">
                        {loggingStatus[protocol.protocolId] === 'success' ? (
                          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl">
                            <span className="text-xs text-[#10B981] font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>Logged successfully on Mantle Sepolia</span>
                            {txHashes[protocol.protocolId] && (
                              <a
                                href={`https://explorer.sepolia.mantle.xyz/tx/${txHashes[protocol.protocolId]}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-[#10B981] underline hover:text-emerald-100 transition-colors"
                                style={{ fontFamily: 'Outfit, sans-serif' }}
                              >
                                View Transaction
                              </a>
                            )}
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleLogProtocolOnChain(protocol.protocolId, assessment.riskScore, assessment.summary)}
                              disabled={loggingStatus[protocol.protocolId] === 'loading'}
                              className="px-4 py-2 rounded-full font-semibold text-xs border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.05] text-[#F8FAFC] hover:border-white/10 transition-all duration-200 disabled:opacity-50"
                              style={{ fontFamily: 'Outfit, sans-serif' }}
                            >
                              {loggingStatus[protocol.protocolId] === 'loading' ? 'Logging...' : 'Log On-chain'}
                            </button>
                            {loggingStatus[protocol.protocolId] === 'error' && (
                              <span className="text-xs text-[#EF4444] font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                                Failed to log risk. Try again.
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    )}
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