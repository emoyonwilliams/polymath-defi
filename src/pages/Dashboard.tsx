import { useState, useEffect } from 'react'
import { Navbar } from '../components/layout/Navbar'
import { useWalletContext } from '../hooks/useWalletContext'
import { getMantleStats } from '../lib/mantle'

const MOCK_POSITIONS = [
  { asset: 'mETH', protocol: 'Mantle Staking', balance: '2.45', apy: '4.2%', value: '$8,234', risk: 'low' },
  { asset: 'USDY', protocol: 'Ondo Finance', balance: '5,000', apy: '5.1%', value: '$5,012', risk: 'low' },
  { asset: 'USDC', protocol: 'Aave V3', balance: '2,500', apy: '3.8%', value: '$2,500', risk: 'medium' },
  { asset: 'MNT', protocol: 'Merchant Moe', balance: '1,200', apy: '8.4%', value: '$1,890', risk: 'medium' },
]

const RISK_COLORS: Record<string, string> = {
  low: 'text-[#10B981] bg-[#10B981]/10',
  medium: 'text-[#F59E0B] bg-[#F59E0B]/10',
  high: 'text-[#EF4444] bg-[#EF4444]/10',
  critical: 'text-[#EF4444] bg-[#EF4444]/20',
}

export const Dashboard = () => {
  const { isConnected, connect, isConnecting } = useWalletContext()
  const [mantleStats, setMantleStats] = useState({ blockNumber: 0, gasPrice: '0' })
  const [activeTab, setActiveTab] = useState<'positions' | 'activity'>('positions')

  useEffect(() => {
    getMantleStats().then(setMantleStats)
    const interval = setInterval(() => getMantleStats().then(setMantleStats), 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">

        <div className="mb-8">
          <h1 className="text-3xl font-normal mb-1" style={{ fontFamily: 'Lora, serif' }}>Dashboard</h1>
          <p className="text-[#94A3B8] text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Your Mantle DeFi positions at a glance.
          </p>
        </div>

        {/* Stats Cards - Mock for visual appeal when connected */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Net Worth', value: isConnected ? '$17,636' : '--', sub: 'Total portfolio value' },
            { label: 'Yield Earned (24h)', value: isConnected ? '+$12.40' : '--', sub: 'Across all protocols' },
            { label: 'Current Avg APY', value: isConnected ? '5.2%' : '--', sub: 'Weighted average' },
            { label: 'Active Protocols', value: isConnected ? '4' : '--', sub: 'Positions open' },
          ].map(s => (
            <div key={s.label} className="border border-[#1E1E2E] bg-[#0F2A22] p-6 rounded-xl">
              <p className="text-xs text-[#94A3B8] mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.label}</p>
              <p className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.value}</p>
              <p className="text-xs text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Network Stats - Can integrate Nansen here later */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Mantle Block', value: mantleStats.blockNumber ? `#${mantleStats.blockNumber.toLocaleString()}` : '...' },
            { label: 'Gas Price', value: mantleStats.gasPrice ? `${parseFloat(mantleStats.gasPrice).toFixed(4)} Gwei` : '...' },
            { label: 'Network', value: 'Mantle Testnet (Sepolia)' },
          ].map(s => (
            <div key={s.label} className="border border-[#1E1E2E] bg-[#0F2A22] p-6 rounded-xl flex items-center justify-between">
              <p className="text-xs text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.label}</p>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <p className="text-sm font-medium text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border border-[#1E1E2E] bg-[#0F2A22] p-8 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-4">
              {(['positions', 'activity'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-medium pb-1 border-b-2 transition-colors capitalize ${
                    activeTab === tab
                      ? 'text-white border-[#10B981]'
                      : 'text-[#94A3B8] border-transparent hover:text-white'
                  }`}
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {!isConnected ? (
            <div className="text-center py-16">
              <p className="text-[#94A3B8] mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Connect your wallet to view your positions.</p>
              <button
                onClick={connect}
                disabled={isConnecting}
                className="px-8 py-3 rounded-full font-medium transition-all text-sm bg-white hover:bg-gray-200 text-black"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            </div>
          ) : activeTab === 'positions' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-[#94A3B8] border-b border-[#1E1E2E]">
                    <th className="text-left pb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>Asset</th>
                    <th className="text-left pb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>Protocol</th>
                    <th className="text-right pb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>Balance</th>
                    <th className="text-right pb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>APY</th>
                    <th className="text-right pb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>Value</th>
                    <th className="text-right pb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E1E2E]">
                  {MOCK_POSITIONS.map(p => (
                    <tr key={p.asset} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 text-sm font-medium text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{p.asset}</td>
                      <td className="py-4 text-sm text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{p.protocol}</td>
                      <td className="py-4 text-sm text-right text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{p.balance}</td>
                      <td className="py-4 text-sm text-right text-[#10B981]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{p.apy}</td>
                      <td className="py-4 text-sm text-right text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{p.value}</td>
                      <td className="py-4 text-right">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${RISK_COLORS[p.risk]}`} style={{ fontFamily: 'DM Sans, sans-serif' }}>
                          {p.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-[#94A3B8] text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>No recent activity to show.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}