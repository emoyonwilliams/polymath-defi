import { Navbar } from '../components/layout/Navbar'
import { useWalletContext } from '../hooks/useWalletContext'

const ASSETS = [
  {
    asset: 'mETH',
    protocol: 'Mantle Staking',
    balance: '2.45',
    apy: '4.2%',
    value: '$8,234',
    riskScore: 28,
    liquidity: 'instant',
    type: 'liquid-staking',
  },
  {
    asset: 'USDY',
    protocol: 'Ondo Finance',
    balance: '5,000',
    apy: '5.1%',
    value: '$5,012',
    riskScore: 18,
    liquidity: 'instant',
    type: 'rwa',
  },
  {
    asset: 'USDC',
    protocol: 'Aave V3',
    balance: '2,500',
    apy: '3.8%',
    value: '$2,500',
    riskScore: 42,
    liquidity: 'instant',
    type: 'lending',
  },
  {
    asset: 'MNT',
    protocol: 'Merchant Moe',
    balance: '1,200',
    apy: '8.4%',
    value: '$1,890',
    riskScore: 35,
    liquidity: '7-day bridge',
    type: 'dex',
  },
]

const getRiskColor = (score: number) => {
  if (score < 30) return 'text-[#10B981]'
  if (score < 60) return 'text-[#F59E0B]'
  return 'text-[#EF4444]'
}

const getRiskLabel = (score: number) => {
  if (score < 30) return 'Low'
  if (score < 60) return 'Medium'
  return 'High'
}

export const Portfolio = () => {
  const { isConnected, connect, isConnecting } = useWalletContext()

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">

        <div className="mb-8">
          <h1 className="text-3xl font-normal mb-1" style={{ fontFamily: 'Lora, serif' }}>Portfolio</h1>
          <p className="text-[#94A3B8] text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Your assets, their risk profile, and liquidity timelines • Powered by Nansen
          </p>
        </div>

        {!isConnected ? (
          <div className="border border-[#1E1E2E] bg-[#0F2A22] text-center py-20 rounded-xl">
            <p className="text-2xl font-normal mb-2" style={{ fontFamily: 'Lora, serif' }}>
              Yield shouldn't be a guessing game.
            </p>
            <p className="text-[#94A3B8] mb-6 text-sm max-w-md mx-auto" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Connect your wallet to see where your assets could earn more across Mantle protocols.
            </p>
            <button 
              onClick={connect} 
              disabled={isConnecting} 
              className="px-8 py-3 rounded-full font-medium transition-all text-sm bg-white hover:bg-gray-200"
              style={{ fontFamily: 'DM Sans, sans-serif', color: '#000000' }}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        ) : (
          <>
            {/* Stats Cards - Mock for visual appeal */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Value', value: '$17,636' },
                { label: '24h Change', value: '+$42.10', positive: true },
                { label: 'Best APY', value: '8.4% (MNT)' },
                { label: 'Avg Risk Score', value: '30.8 / 100' },
              ].map(s => (
                <div key={s.label} className="border border-[#1E1E2E] bg-[#0F2A22] p-6 rounded-xl">
                  <p className="text-xs text-[#94A3B8] mb-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.label}</p>
                  <p className={`text-xl font-bold ${s.positive ? 'text-[#10B981]' : 'text-white'}`} style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Assets Table - Mock for demo appeal */}
            <div className="border border-[#1E1E2E] bg-[#0F2A22] p-8 rounded-xl mb-6">
              <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>Assets</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-[#94A3B8] border-b border-[#1E1E2E]">
                      <th className="text-left pb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>Asset</th>
                      <th className="text-left pb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>Protocol</th>
                      <th className="text-right pb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>Balance</th>
                      <th className="text-right pb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>APY</th>
                      <th className="text-right pb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>Value</th>
                      <th className="text-right pb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>Risk Score</th>
                      <th className="text-right pb-3" style={{ fontFamily: 'DM Sans, sans-serif' }}>Liquidity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E1E2E]">
                    {ASSETS.map(a => (
                      <tr key={a.asset} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 text-sm font-medium text-white">{a.asset}</td>
                        <td className="py-4 text-sm text-[#94A3B8]">{a.protocol}</td>
                        <td className="py-4 text-sm text-right text-white">{a.balance}</td>
                        <td className="py-4 text-sm text-right text-[#10B981]">{a.apy}</td>
                        <td className="py-4 text-sm text-right text-white">{a.value}</td>
                        <td className="py-4 text-right">
                          <span className={`text-sm font-bold ${getRiskColor(a.riskScore)}`}>
                            {a.riskScore}
                          </span>
                          <span className={`text-xs ml-1 ${getRiskColor(a.riskScore)}`}>
                            ({getRiskLabel(a.riskScore)})
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            a.liquidity === 'instant'
                              ? 'text-[#10B981] bg-[#10B981]/10'
                              : 'text-[#F59E0B] bg-[#F59E0B]/10'
                          }`}>
                            {a.liquidity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Liquidity Timeline - Mock for appeal */}
            <div className="border border-[#1E1E2E] bg-[#0F2A22] p-8 rounded-xl">
              <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Liquidity Timeline
              </h2>
              <p className="text-xs text-[#94A3B8] mb-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Shows which assets are instantly accessible vs locked in Mantle's 7-day bridge withdrawal period.
              </p>
              <div className="space-y-3">
                {ASSETS.map(a => (
                  <div key={a.asset} className="flex items-center gap-4">
                    <span className="text-sm text-white w-16" style={{ fontFamily: 'DM Sans, sans-serif' }}>{a.asset}</span>
                    <div className="flex-1 h-2 bg-[#1E1E2E] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          a.liquidity === 'instant' ? 'bg-[#10B981]' : 'bg-[#F59E0B]'
                        }`}
                        style={{ width: a.liquidity === 'instant' ? '100%' : '30%' }}
                      />
                    </div>
                    <span className={`text-xs w-24 text-right ${
                      a.liquidity === 'instant' ? 'text-[#10B981]' : 'text-[#F59E0B]'
                    }`} style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      {a.liquidity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}