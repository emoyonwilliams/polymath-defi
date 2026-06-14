import { Navbar } from '../components/layout/Navbar'
import { useWalletContext } from '../hooks/useWalletContext'

export const Rewards = () => {
  const { isConnected, connect, isConnecting } = useWalletContext()

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="mb-12">
          <h1 className="text-5xl font-normal tracking-tighter mb-3" style={{ fontFamily: 'Lora, serif' }}>
            Rewards
          </h1>
          <p className="text-[#94A3B8] text-xl" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Track your yields, points, and Mantle incentives
          </p>
        </div>

        {!isConnected ? (
          <div className="border border-[#1E1E2E] bg-[#0F2A22] text-center py-20 rounded-3xl">
            <p className="text-2xl font-normal mb-3" style={{ fontFamily: 'Lora, serif' }}>
              Earn more on Mantle
            </p>
            <p className="text-[#94A3B8] mb-8 max-w-md mx-auto" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Connect your wallet to track real yields, claim rewards, and participate in Mantle campaigns.
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
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="border border-[#1E1E2E] bg-[#0F2A22] rounded-3xl p-8">
                <p className="text-sm text-[#94A3B8] mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>Total Yield Earned</p>
                <p className="text-5xl font-medium text-white mt-2">$0.00</p>
                <p className="text-[#94A3B8] text-sm mt-1">Lifetime across all protocols</p>
              </div>

              <div className="border border-[#1E1E2E] bg-[#0F2A22] rounded-3xl p-8">
                <p className="text-sm text-[#94A3B8] mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>Claimable Rewards</p>
                <p className="text-5xl font-medium text-white mt-2">$0.00</p>
                <button className="mt-4 px-6 py-2.5 bg-white text-black rounded-2xl text-sm font-medium hover:bg-gray-100 transition-all opacity-50 cursor-not-allowed">
                  Claim Now
                </button>
              </div>

              <div className="border border-[#1E1E2E] bg-[#0F2A22] rounded-3xl p-8">
                <p className="text-sm text-[#94A3B8] mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>Yield Points</p>
                <p className="text-5xl font-medium text-white mt-2">0</p>
                <p className="text-[#94A3B8] text-sm mt-1">Pioneer Tier • 0/5 protocols</p>
              </div>
            </div>

            {/* Rewards History */}
            <div className="border border-[#1E1E2E] bg-[#0F2A22] rounded-3xl p-8 mb-12">
              <h2 className="text-xl font-medium mb-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>Rewards History</h2>
              <div className="text-center py-16">
                <p className="text-[#94A3B8] mb-4">No rewards history yet.</p>
                <p className="text-sm text-[#94A3B8]">Start interacting with Mantle protocols (staking, lending, liquidity provision) to earn rewards.</p>
              </div>
            </div>

            {/* Campaign Progress */}
            <div className="border border-[#1E1E2E] bg-[#0F2A22] rounded-3xl p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>Mantle DeFi Pioneer</h2>
                  <p className="text-[#94A3B8] mt-1">Monitor 5 protocols to earn the Pioneer badge</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl text-[#94A3B8]">0/5</div>
                  <div className="text-xs text-[#94A3B8]">Progress</div>
                </div>
              </div>

              <div className="h-3 bg-[#1E1E2E] rounded-full overflow-hidden mb-6">
                <div className="h-3 w-0 bg-gradient-to-r from-[#10B981] to-emerald-500 rounded-full" />
              </div>

              <p className="text-sm text-[#94A3B8]">
                Complete campaigns to unlock exclusive Mantle rewards, higher yield multipliers, and special badges.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}