import { useQuery } from '@tanstack/react-query'
import { useWalletContext } from '../hooks/useWalletContext'
import { getProvider } from '../lib/mantle'
import { ethers } from 'ethers'
import { useSettings } from '../contexts/SettingsContext'
import { convertAndFormat } from './Dashboard'
import { HermesClient } from '@pythnetwork/hermes-client'
import { useProtocolHealth } from '../hooks/useProtocolHealth'
import { TOKEN_LIST, FALLBACK_PRICES } from '../lib/constants'
import { fetchLiveAPYs } from '../lib/yields'

const hermesClient = new HermesClient("https://hermes.pyth.network", {});

const getRiskColor = (score: number) => {
  if (score < 30) return 'text-[#10B981]'
  if (score < 60) return 'text-[#F59E0B]'
  return 'text-[#EF4444]'
}

export const Portfolio = () => {
  const { isConnected, address, connect, isConnecting } = useWalletContext()
  const { healthData } = useProtocolHealth()

  const { currency } = useSettings()

  // Fetch live DeFiLlama APYs (cached 5 minutes)
  const { data: liveAPYs } = useQuery({
    queryKey: ['defillamaYields'],
    queryFn: fetchLiveAPYs,
    staleTime: 300000,
    gcTime: 600000,
    refetchOnWindowFocus: false,
  })

  // Real Balance Fetching with TanStack Query (Safe version)
  const { data: portfolioData } = useQuery({
    queryKey: ['portfolioBalances', address],
    queryFn: async () => {
      if (!address) return { positions: [], ethPrice: 3000, mntPrice: 0.65 }
      const provider = getProvider(true)
      const fetched: any[] = []

      const priceIds = TOKEN_LIST.filter(t => t.priceId).map(t => t.priceId!) as string[]
      let priceMap: Record<string, number> = { ...FALLBACK_PRICES }

      if (priceIds.length > 0) {
        try {
          const priceUpdates = await hermesClient.getLatestPriceUpdates(priceIds)
          priceUpdates.parsed?.forEach((p: any, index: number) => {
            const token = TOKEN_LIST.find(t => t.priceId === priceIds[index])
            if (token && p.price?.price) {
              const price = Number(p.price.price) * Math.pow(10, p.price.expo)
              priceMap[token.symbol] = price
            }
          })
        } catch (e) {}
      }

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
            continue // skip unverified contracts
          }

          if (balance > 0.0001) {
            const usdPrice = priceMap[token.symbol] || 1
            const usdValue = balance * usdPrice

            fetched.push({
              asset: token.symbol,
              protocol: token.protocol,
              balance: balance.toFixed(token.decimals > 6 ? 4 : 2),
              usdValue,
              riskScore: healthData.find(h => h.name.toLowerCase().includes(token.protocol.toLowerCase().split(' ')[0]))?.assessment?.riskScore ?? null,
              liquidity: 'instant',
              apy: liveAPYs?.[token.symbol] ?? token.apy
            })
          }
        } catch (err) {}
      }
      const ethPrice = priceMap['mETH'] || 3000
      const mntPrice = priceMap['MNT'] || 0.65
      return { positions: fetched, ethPrice, mntPrice }
    },
    enabled: !!isConnected && !!address,
    staleTime: 30000,
    gcTime: 300000,
  })

  const realPositions = portfolioData?.positions || []
  const ethPrice = portfolioData?.ethPrice || 3000
  const mntPrice = portfolioData?.mntPrice || 0.65

  const totalUsd = realPositions.reduce((sum, p) => sum + p.usdValue, 0)
  const totalValue = convertAndFormat(totalUsd, currency, ethPrice, mntPrice)

  // Dynamic Best APY
  const bestAPY = realPositions.length > 0 
    ? Math.max(...realPositions.map(p => p.apy || 0)).toFixed(1) + '%' 
    : '—'

  // Dynamic Avg Risk Score
  const avgRiskScore = realPositions.length > 0 
    ? Math.round(realPositions.reduce((sum, p) => sum + p.riskScore, 0) / realPositions.length) 
    : 0

  return (
    <div className="text-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-2" style={{ fontFamily: 'Lora, serif' }}>Portfolio</h1>
          <p className="text-[#94A3B8] text-sm md:text-base font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Your assets, risk profile & liquidity • Powered by Pyth Network + Nansen + On-chain Data
          </p>
        </div>

        {!isConnected ? (
          <div className="border border-white/[0.04] bg-[#0E111A]/40 text-center py-20 rounded-3xl shadow-2xl px-6">
            <p className="text-3xl font-light mb-3" style={{ fontFamily: 'Lora, serif' }}>Yield shouldn't be a guessing game.</p>
            <p className="text-[#94A3B8] mb-8 text-sm md:text-base font-light max-w-md mx-auto" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Connect your wallet to see your real Mantle portfolio.
            </p>
            <button 
              onClick={connect} 
              disabled={isConnecting} 
              className="px-8 py-3.5 rounded-full font-bold text-sm bg-[#F8FAFC] hover:bg-[#F8FAFC]/90 text-black shadow-xl transition-all duration-200 hover:-translate-y-0.5"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Value', value: totalValue },
                { label: '24h Change', value: `+${convertAndFormat(0, currency, ethPrice, mntPrice)}`, positive: true },
                { label: 'Best APY', value: bestAPY },
                { label: 'Avg Risk Score', value: `${avgRiskScore} / 100` },
              ].map(s => (
                <div key={s.label} className="border border-white/[0.04] bg-[#0E111A]/40 p-6 rounded-2xl shadow-xl transition-all hover:border-[#10B981]/20">
                  <p className="text-xs font-semibold tracking-wider text-[#64748B] uppercase mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.label}</p>
                  <p className={`text-3xl font-semibold mb-2 ${s.positive ? 'text-[#10B981]' : 'text-white'}`} style={{ fontFamily: 'Outfit, sans-serif' }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Assets Table */}
            <div className="border border-white/[0.04] bg-[#0E111A]/40 p-6 md:p-8 rounded-2xl shadow-2xl mb-6">
              <h2 className="text-xl font-light mb-6" style={{ fontFamily: 'Lora, serif' }}>Assets</h2>
              <div className="overflow-x-auto -mx-6 md:mx-0">
                <div className="inline-block min-w-full align-middle px-6 md:px-0">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-xs text-[#64748B] border-b border-white/[0.04] font-semibold tracking-wider uppercase">
                        <th className="text-left pb-4">Asset</th>
                        <th className="text-left pb-4">Protocol</th>
                        <th className="text-right pb-4">Balance</th>
                        <th className="text-right pb-4">APY</th>
                        <th className="text-right pb-4">Value</th>
                        <th className="text-right pb-4">Risk Score</th>
                        <th className="text-right pb-4">Liquidity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                      {realPositions.length > 0 ? (
                        realPositions.map((p, i) => (
                          <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-4 font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{p.asset}</td>
                            <td className="py-4 text-[#94A3B8]" style={{ fontFamily: 'Outfit, sans-serif' }}>{p.protocol}</td>
                            <td className="py-4 text-right font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>{p.balance}</td>
                            <td className="py-4 text-right text-[#10B981] font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>{p.apy}%</td>
                            <td className="py-4 text-right text-white font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
                              {convertAndFormat(p.usdValue, currency, ethPrice, mntPrice)}
                            </td>
                            <td className="py-4 text-right" style={{ fontFamily: 'Outfit, sans-serif' }}>
                              {p.riskScore !== null ? (
                                <span className={`font-bold ${getRiskColor(p.riskScore)}`}>{p.riskScore}</span>
                              ) : (
                                <span className="text-[#64748B] text-xs" title="Run Health analysis to generate risk scores">—</span>
                              )}
                            </td>
                            <td className="py-4 text-right text-[#10B981] font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>instant</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center py-20 text-[#94A3B8] font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
                            No positions found. Start interacting with Mantle protocols.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Liquidity Timeline */}
            <div className="border border-white/[0.04] bg-[#0E111A]/40 p-6 md:p-8 rounded-2xl shadow-xl">
              <h2 className="text-xl font-light mb-2" style={{ fontFamily: 'Lora, serif' }}>Liquidity Timeline</h2>
              <p className="text-xs text-[#94A3B8] mb-6 font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>Shows which assets are instantly accessible vs locked.</p>
              {realPositions.length === 0 ? (
                <p className="text-center text-[#94A3B8] py-8 font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>No liquidity data available yet.</p>
              ) : (
                <div className="space-y-4">
                  {realPositions.map(p => (
                    <div key={p.asset} className="flex items-center gap-4">
                      <span className="text-sm font-medium text-white w-16" style={{ fontFamily: 'Outfit, sans-serif' }}>{p.asset}</span>
                      <div className="flex-1 h-2.5 bg-white/[0.03] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" style={{ width: '100%' }} />
                      </div>
                      <span className="text-xs w-24 text-right text-[#10B981] font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>instant</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}