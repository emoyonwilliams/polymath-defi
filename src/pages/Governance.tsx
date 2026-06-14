import { Navbar } from '../components/layout/Navbar'
import { useWalletContext } from '../hooks/useWalletContext'

export const Governance = () => {
  const { isConnected, connect, isConnecting } = useWalletContext()

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="mb-12">
          <h1 className="text-5xl font-normal tracking-tighter mb-3" style={{ fontFamily: 'Lora, serif' }}>
            Governance
          </h1>
          <p className="text-[#94A3B8] text-xl" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Participate in Mantle’s future and track proposals affecting your positions
          </p>
        </div>

        {!isConnected ? (
          <div className="border border-[#1E1E2E] bg-[#0F2A22] text-center py-20 rounded-3xl">
            <p className="text-2xl font-normal mb-3" style={{ fontFamily: 'Lora, serif' }}>
              Shape Mantle’s Future
            </p>
            <p className="text-[#94A3B8] mb-8 max-w-md mx-auto" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Connect your wallet to see your voting power and track active Mantle Improvement Proposals (MIPs).
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
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="border border-[#1E1E2E] bg-[#0F2A22] rounded-3xl p-8">
                <p className="text-sm text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Active Proposals</p>
                <p className="text-5xl font-medium mt-3">Check Snapshot</p>
              </div>
              <div className="border border-[#1E1E2E] bg-[#0F2A22] rounded-3xl p-8">
                <p className="text-sm text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Mantle Treasury</p>
                <p className="text-5xl font-medium mt-3">$3.9B</p>
              </div>
              <div className="border border-[#1E1E2E] bg-[#0F2A22] rounded-3xl p-8">
                <p className="text-sm text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Your Voting Power</p>
                <p className="text-5xl font-medium mt-3">0 MNT</p>
                <p className="text-sm text-[#94A3B8] mt-1">Hold MNT to gain voting power</p>
              </div>
            </div>

            {/* Real Governance Section */}
            <div className="border border-[#1E1E2E] bg-[#0F2A22] rounded-3xl p-8">
              <h2 className="text-2xl font-medium mb-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>Mantle Governance</h2>
              
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mb-6">
                  <span className="text-5xl">🗳️</span>
                </div>
                <h3 className="text-xl font-medium mb-3">Active Proposals</h3>
                <p className="text-[#94A3B8] mb-8 max-w-md mx-auto">
                  View and vote on current Mantle Improvement Proposals (MIPs) on Snapshot.
                </p>
                <a 
                  href="https://snapshot.org/#/bitdao.eth" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-medium hover:bg-gray-100 transition-all"
                >
                  Go to Voting Portal →
                </a>
              </div>

              <div className="mt-8 text-center text-sm text-[#94A3B8]">
                <p>Official Governance Links:</p>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-3">
                  <a href="https://snapshot.org/#/bitdao.eth" target="_blank" rel="noopener noreferrer" className="hover:text-white">Snapshot Voting</a>
                  <a href="https://forum.mantle.xyz/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Forum</a>
                  <a href="https://delegatevote.mantle.xyz/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Delegate</a>
                  <a href="https://treasurymonitor.mantle.xyz/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Treasury Monitor</a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}