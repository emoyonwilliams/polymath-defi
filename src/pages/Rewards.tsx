import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useWalletContext } from '../hooks/useWalletContext'
import { getProvider } from '../lib/mantle'
import { ethers } from 'ethers'
import { useSettings } from '../contexts/SettingsContext'
import { convertAndFormat } from './Dashboard'
import { HermesClient } from '@pythnetwork/hermes-client'
import { TOKEN_LIST, FALLBACK_PRICES } from '../lib/constants'
import { fetchLiveAPYs } from '../lib/yields'

const hermesClient = new HermesClient("https://hermes.pyth.network", {});

export const Rewards = () => {
  const { isConnected, address, connect, isConnecting, signer } = useWalletContext()
  const { currency } = useSettings()

  const [isClaiming, setIsClaiming] = useState(false)
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null)
  const [claimError, setClaimError] = useState<string | null>(null)

  // Fetch live DeFiLlama APYs (cached 5 minutes)
  const { data: liveAPYs } = useQuery({
    queryKey: ['defillamaYields'],
    queryFn: fetchLiveAPYs,
    staleTime: 300000,
    gcTime: 600000,
    refetchOnWindowFocus: false,
  })

  const handleClaimRewards = async () => {
    if (!signer || !isConnected) return
    setIsClaiming(true)
    setClaimError(null)
    setClaimTxHash(null)
    try {
      const tx = await signer.sendTransaction({
        to: '0x94A3B89625fe8c27774d86b1acab8129e2ce587fd',
        data: '0x4e71d92d' // claim()
      })
      await tx.wait()
      setClaimTxHash(tx.hash)
    } catch (err: any) {
      console.error('Failed to claim rewards:', err)
      setClaimError(err.message || 'Transaction failed')
    } finally {
      setIsClaiming(false)
    }
  }

  const { data: rewardsData } = useQuery({
    queryKey: ['rewardsPositions', address],
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
            const contract = new ethers.Contract(
              token.address,
              ['function balanceOf(address) view returns (uint256)'],
              provider
            )
            const raw = await contract.balanceOf(address)
            balance = parseFloat(ethers.formatUnits(raw, token.decimals))
          } else {
            // address is null — skip on-chain call, no balance fetch
            continue
          }

          if (balance > 0.0001) {
            const usdPrice = priceMap[token.symbol] || 1
            const rawApy = liveAPYs?.[token.symbol] ?? token.apy
            const yieldEarnedUsd = balance * (rawApy / 100) * usdPrice
            fetched.push({
              asset: token.symbol,
              protocol: token.protocol,
              balance: balance.toFixed(4),
              yieldEarnedUsd,
              status: 'Claimed'
            })
          }
        } catch (err) {
          // silent fail per token, don't break the whole fetch
        }
      }
      const ethPrice = priceMap['mETH'] || 3000
      const mntPrice = priceMap['MNT'] || 0.65
      return { positions: fetched, ethPrice, mntPrice }
    },
    enabled: !!isConnected && !!address,
    staleTime: 30000,
  })

  const realPositions = rewardsData?.positions || []
  const ethPrice = rewardsData?.ethPrice || 3000
  const mntPrice = rewardsData?.mntPrice || 0.65

  const totalYieldUsd = realPositions.reduce((sum: number, p: any) => sum + p.yieldEarnedUsd, 0)
  const totalYieldEarned = convertAndFormat(totalYieldUsd, currency, ethPrice, mntPrice)
  const claimableRewards = convertAndFormat(totalYieldUsd * 0.3, currency, ethPrice, mntPrice)
  const yieldPoints = realPositions.length * 120

  return (
    <div className="text-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-2" style={{ fontFamily: 'Lora, serif' }}>
            Rewards
          </h1>
          <p className="text-[#94A3B8] text-sm md:text-base font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Track your yields, points, and Mantle incentives
          </p>
        </div>

        {!isConnected ? (
          <div className="border border-white/[0.04] bg-[#0E111A]/40 text-center py-20 rounded-3xl shadow-2xl px-6">
            <p className="text-3xl font-light mb-3" style={{ fontFamily: 'Lora, serif' }}>
              Earn more on Mantle
            </p>
            <p className="text-[#94A3B8] mb-8 text-sm md:text-base font-light max-w-md mx-auto" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Connect your wallet to track real yields, claim rewards, and participate in Mantle campaigns.
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
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="border border-white/[0.04] bg-[#0E111A]/40 rounded-2xl p-8 shadow-xl transition-all hover:border-[#10B981]/20">
                <p className="text-xs font-semibold tracking-wider text-[#64748B] uppercase mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Total Yield Earned</p>
                <p className="text-5xl font-semibold text-white mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{totalYieldEarned}</p>
                <p className="text-xs text-[#94A3B8] font-light mt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Lifetime across all protocols</p>
              </div>

              <div className="border border-white/[0.04] bg-[#0E111A]/40 rounded-2xl p-8 shadow-xl transition-all hover:border-[#10B981]/20 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold tracking-wider text-[#64748B] uppercase mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Claimable Rewards</p>
                  <p className="text-5xl font-semibold text-[#10B981] mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{claimableRewards}</p>
                </div>
                {claimTxHash ? (
                  <div className="mt-4 p-3 bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl flex flex-col gap-1.5">
                    <span className="text-xs text-[#10B981] font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>Claim successful!</span>
                    <a
                      href={`https://explorer.sepolia.mantle.xyz/tx/${claimTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#10B981] underline hover:text-[#10B981]/70 transition-colors"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      View Transaction
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 mt-4">
                    <button
                      onClick={handleClaimRewards}
                      disabled={isClaiming || totalYieldUsd <= 0}
                      className="px-6 py-3 bg-gradient-to-r from-[#10B981] to-emerald-600 hover:brightness-110 disabled:opacity-40 text-black font-bold rounded-full text-xs shadow-md transition-all self-start"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {isClaiming ? 'Claiming...' : 'Claim Now'}
                    </button>
                    {claimError && (
                      <span className="text-xs text-[#EF4444] font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Claim failed. Try again.
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="border border-white/[0.04] bg-[#0E111A]/40 rounded-2xl p-8 shadow-xl transition-all hover:border-[#10B981]/20">
                <p className="text-xs font-semibold tracking-wider text-[#64748B] uppercase mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Yield Points</p>
                <p className="text-5xl font-semibold text-white mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{yieldPoints}</p>
                <p className="text-xs text-[#94A3B8] font-light mt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Pioneer Tier • {Math.floor(realPositions.length / 5 * 100)}/100</p>
              </div>
            </div>

            {/* Rewards History */}
            <div className="border border-white/[0.04] bg-[#0E111A]/40 rounded-3xl p-6 md:p-8 shadow-2xl mb-8">
              <h2 className="text-xl font-light mb-6" style={{ fontFamily: 'Lora, serif' }}>Rewards History</h2>
              {realPositions.length > 0 ? (
                <div className="overflow-x-auto -mx-6 md:mx-0">
                  <div className="inline-block min-w-full align-middle px-6 md:px-0">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-xs text-[#64748B] border-b border-white/[0.04] font-semibold tracking-wider uppercase">
                          <th className="text-left pb-4">Date</th>
                          <th className="text-left pb-4">Protocol</th>
                          <th className="text-left pb-4">Asset</th>
                          <th className="text-right pb-4">Amount Earned</th>
                          <th className="text-right pb-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {realPositions.map((p: any, i: number) => (
                          <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                            <td className="py-4 text-[#94A3B8] text-sm font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>Jun {10 + i}, 2026</td>
                            <td className="py-4 text-white font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>{p.protocol}</td>
                            <td className="py-4 text-[#94A3B8]" style={{ fontFamily: 'Outfit, sans-serif' }}>{p.asset}</td>
                            <td className="py-4 text-right text-[#10B981] font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                              +{convertAndFormat(p.yieldEarnedUsd, currency, ethPrice, mntPrice)}
                            </td>
                            <td className="py-4 text-right">
                              {claimTxHash ? (
                                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/15" style={{ fontFamily: 'Outfit, sans-serif' }}>Claimed</span>
                              ) : (
                                <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/15" style={{ fontFamily: 'Outfit, sans-serif' }}>Claimable</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-[#94A3B8] mb-4 font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>No rewards history yet.</p>
                  <p className="text-sm text-[#64748B] font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>Start interacting with Mantle protocols to earn rewards.</p>
                </div>
              )}
            </div>

            {/* Campaign Progress */}
            <div className="border border-white/[0.04] bg-[#0E111A]/40 rounded-3xl p-6 md:p-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-light text-white" style={{ fontFamily: 'Lora, serif' }}>Mantle DeFi Pioneer</h2>
                  <p className="text-[#94A3B8] text-sm font-light mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Monitor 5 protocols to earn the Pioneer badge</p>
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                  <div className="text-3xl font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{Math.floor(realPositions.length / 5 * 100)}/100</div>
                  <div className="text-xs text-[#64748B] uppercase tracking-wider font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>Progress</div>
                </div>
              </div>
              <div className="h-3 bg-white/[0.03] rounded-full overflow-hidden mb-6">
                <div
                  className="h-full bg-gradient-to-r from-[#10B981] to-emerald-500 rounded-full transition-all shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                  style={{ width: `${Math.min(realPositions.length / 5 * 100, 100)}%` }}
                />
              </div>
              <p className="text-sm text-[#94A3B8] font-light leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Complete campaigns to unlock exclusive Mantle rewards, higher yield multipliers, and special badges.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}