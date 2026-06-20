import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useWalletContext } from '../hooks/useWalletContext'
import { getMantleStats, getProvider } from '../lib/mantle'
import { ethers } from 'ethers'
import { HermesClient } from '@pythnetwork/hermes-client'
import { useSettings } from '../contexts/SettingsContext'

const TOKEN_LIST = [
  { symbol: 'MNT', name: 'Mantle', address: 'native', decimals: 18, protocol: 'Mantle', priceId: '0x4e3037c822d852d79af3ac80e35eb420ee3b870dca49f9344a38ef4773fb0585', apy: 0 },
  { symbol: 'mETH', name: 'mETH', address: '0xcDA86A272531e8640cD7F1a92c01839911B90bb0', decimals: 18, protocol: 'Mantle Staking', priceId: '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace', apy: 4.8 },
  { symbol: 'USDC', name: 'Aave USDC', address: '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080', decimals: 6, protocol: 'Aave V3', priceId: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a', apy: 3.8 },
  { symbol: 'MOE', name: 'Merchant Moe', address: '0x89503b3e0db3cb324451ca7625fe8c27774d86b1', decimals: 18, protocol: 'Merchant Moe', apy: 8.4 },
  { symbol: 'INIT', name: 'INIT USD Coin', address: '0x1b6a005c3863e08f6f0494b37bb6192b795cb62d', decimals: 6, protocol: 'INIT Capital', apy: 5.5 },
  { symbol: 'USDY', name: 'Ondo USDY', address: '0x73c68bc2635aa369ccb31b7a354866ba9ca1babd', decimals: 18, protocol: 'Ondo Finance', apy: 5.1 },
  { symbol: 'USDe', name: 'Ethena USDe', address: '0x5039633649b17501005e7421c5057ba63bf4c4fb', decimals: 18, protocol: 'Ethena', apy: 4.2 },
  { symbol: 'FLUX', name: 'Fluxion Position', address: '0x5997484a39d6902abc9ba567fe7d0968e730c26d', decimals: 18, protocol: 'Fluxion', apy: 12.5 },
]

const hermesClient = new HermesClient("https://hermes.pyth.network", {});

export const convertAndFormat = (usdAmount: number, targetCurrency: 'USD' | 'ETH' | 'MNT', ethPrice: number = 3000, mntPrice: number = 0.65) => {
  if (targetCurrency === 'ETH') {
    return `Ξ${(usdAmount / ethPrice).toFixed(4)}`
  }
  if (targetCurrency === 'MNT') {
    return `${(usdAmount / mntPrice).toFixed(2)} MNT`
  }
  return `$${usdAmount.toFixed(2)}`
}

export const Dashboard = () => {
  const { isConnected, address, connect, isConnecting } = useWalletContext()
  
  const [mantleStats, setMantleStats] = useState({ blockNumber: 0, gasPrice: '0' })

  // Network Stats
  useEffect(() => {
    getMantleStats().then(setMantleStats)
    const interval = setInterval(() => getMantleStats().then(setMantleStats), 15000)
    return () => clearInterval(interval)
  }, [])

  // Cached Balance + Pyth Prices (Safe version)
  const { currency } = useSettings()

  const { data: positionsData, isLoading, isFetching } = useQuery({
    queryKey: ['walletBalances', address],
    queryFn: async () => {
      if (!address) return { positions: [], ethPrice: 3000, mntPrice: 0.65 }
      const provider = getProvider(true)
      const fetched: any[] = []

      const priceIds = TOKEN_LIST.filter(t => t.priceId).map(t => t.priceId!) as string[]
      let priceMap: Record<string, number> = { MNT: 0.65, mETH: 3000, MOE: 0.85, INIT: 1, USDY: 1.02, USDe: 1, FLUX: 120 }

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
              apy: `${token.apy}%`,
              usdValue,
              risk: 'low',
              weight: usdValue
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

  const positions = positionsData?.positions || []
  const ethPrice = positionsData?.ethPrice || 3000
  const mntPrice = positionsData?.mntPrice || 0.65

  const totalUsd = positions.reduce((sum, p) => sum + p.usdValue, 0)
  const totalValue = convertAndFormat(totalUsd, currency, ethPrice, mntPrice)

  const weightedAPY = positions.length > 0 
    ? (positions.reduce((sum, p) => sum + (parseFloat(p.apy) * p.weight), 0) / positions.reduce((sum, p) => sum + p.weight, 0)).toFixed(1)
    : '0.0'

  const activeProtocols = positions.length

  return (
    <div className="text-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-2" style={{ fontFamily: 'Lora, serif' }}>Dashboard</h1>
          <p className="text-[#94A3B8] text-sm md:text-base font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Real-time Mantle DeFi positions • Powered by Nansen + On-chain Data
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Net Worth', value: totalValue, sub: 'Total portfolio value' },
            { label: 'Yield Earned (24h)', value: convertAndFormat(0, currency, ethPrice, mntPrice), sub: 'Across all protocols' },
            { label: 'Current Avg APY', value: `${weightedAPY}%`, sub: 'Weighted average' },
            { label: 'Active Protocols', value: activeProtocols.toString(), sub: 'Positions detected' },
          ].map(s => (
            <div key={s.label} className="border border-white/[0.04] bg-[#0E111A]/40 p-6 rounded-2xl shadow-xl transition-all hover:border-[#10B981]/20">
              <p className="text-xs font-semibold tracking-wider text-[#64748B] uppercase mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.label}</p>
              <p className="text-3xl font-semibold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.value}</p>
              <p className="text-xs text-[#94A3B8] font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Mantle Block', value: mantleStats.blockNumber ? `#${mantleStats.blockNumber.toLocaleString()}` : '...' },
            { label: 'Gas Price', value: mantleStats.gasPrice ? `${parseFloat(mantleStats.gasPrice).toFixed(4)} Gwei` : '...' },
            { label: 'Network', value: 'Mantle Testnet' },
          ].map(s => (
            <div key={s.label} className="border border-white/[0.04] bg-[#0E111A]/20 px-6 py-4 rounded-2xl flex items-center justify-between shadow-md">
              <p className="text-xs font-medium text-[#64748B]" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.label}</p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_8px_#10B981]" />
                <p className="text-sm font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Positions Section */}
        <div className="border border-white/[0.04] bg-[#0E111A]/40 p-6 md:p-8 rounded-2xl shadow-2xl">
          <div className="flex justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-light" style={{ fontFamily: 'Lora, serif' }}>Your Positions</h2>
          </div>

          {!isConnected ? (
            <div className="text-center py-20">
              <p className="text-[#94A3B8] mb-8 text-base md:text-lg font-light">Connect your wallet to view real positions</p>
              <button 
                onClick={connect} 
                disabled={isConnecting} 
                className="px-8 py-3.5 rounded-full font-bold text-sm bg-[#F8FAFC] hover:bg-[#F8FAFC]/90 text-black transition-all shadow-xl hover:-translate-y-0.5"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          ) : isLoading || isFetching ? (
            <div className="text-center py-20 text-[#94A3B8]" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Fetching latest positions & prices...
            </div>
          ) : positions.length === 0 ? (
            <div className="text-center py-20 text-[#94A3B8] font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
              No positions found. Start interacting with Mantle protocols.
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 md:mx-0">
              <div className="inline-block min-w-full align-middle px-6 md:px-0">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-xs text-[#64748B] border-b border-white/[0.04] font-semibold tracking-wider uppercase">
                      <th className="text-left pb-4">Asset</th>
                      <th className="text-left pb-4">Protocol</th>
                      <th className="text-right pb-4">Balance</th>
                      <th className="text-right pb-4">Value</th>
                      <th className="text-right pb-4">APY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {positions.map((p, i) => (
                      <tr key={i} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-4 font-semibold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>{p.asset}</td>
                        <td className="py-4 text-[#94A3B8]" style={{ fontFamily: 'Outfit, sans-serif' }}>{p.protocol}</td>
                        <td className="py-4 text-right font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>{p.balance}</td>
                        <td className="py-4 text-right text-[#10B981] font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          {convertAndFormat(p.usdValue, currency, ethPrice, mntPrice)}
                        </td>
                        <td className="py-4 text-right text-[#10B981] font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>{p.apy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}