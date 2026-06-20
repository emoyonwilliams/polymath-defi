import { useQuery } from '@tanstack/react-query'
import { useWalletContext } from '../hooks/useWalletContext'
import { getProvider } from '../lib/mantle'
import { ethers } from 'ethers'
import { fetchSpaceProposals } from '../lib/governance'

const MANTLE_TREASURY = '$3.9B'

export const Governance = () => {
  const { isConnected, address, connect, isConnecting } = useWalletContext()

  // Real Voting Power with TanStack Query
  const { data: votingPower = '0' } = useQuery({
    queryKey: ['votingPower', address],
    queryFn: async () => {
      if (!address) return '0'
      const provider = getProvider(true)
      const raw = await provider.getBalance(address)
      return parseFloat(ethers.formatEther(raw)).toFixed(2)
    },
    enabled: !!isConnected && !!address,
    staleTime: 30000,
  })

  // Live Proposals fetched from Snapshot Hub API
  const { data: proposals = [], isLoading: isLoadingProposals } = useQuery({
    queryKey: ['mantleProposals'],
    queryFn: () => fetchSpaceProposals('mantle.eth'),
    staleTime: 60000,
  })

  return (
    <div className="text-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-2" style={{ fontFamily: 'Lora, serif' }}>
            Governance
          </h1>
          <p className="text-[#94A3B8] text-sm md:text-base font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Participate in Mantle’s future and track proposals affecting your positions
          </p>
        </div>

        {!isConnected ? (
          <div className="border border-white/[0.04] bg-[#0E111A]/40 text-center py-20 rounded-3xl shadow-2xl px-6">
            <p className="text-3xl font-light mb-3" style={{ fontFamily: 'Lora, serif' }}>
              Shape Mantle’s Future
            </p>
            <p className="text-[#94A3B8] mb-8 text-sm md:text-base font-light max-w-md mx-auto" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Connect your wallet to see your voting power and track active Mantle Improvement Proposals (MIPs).
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
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="border border-white/[0.04] bg-[#0E111A]/40 rounded-2xl p-8 shadow-xl transition-all hover:border-[#10B981]/20">
                <p className="text-xs font-semibold tracking-wider text-[#64748B] uppercase mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Active Proposals</p>
                <p className="text-5xl font-semibold text-white mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{proposals.filter(p => p.status === 'Active').length}</p>
              </div>
              <div className="border border-white/[0.04] bg-[#0E111A]/40 rounded-2xl p-8 shadow-xl transition-all hover:border-[#10B981]/20">
                <p className="text-xs font-semibold tracking-wider text-[#64748B] uppercase mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Mantle Treasury</p>
                <p className="text-5xl font-semibold text-white mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{MANTLE_TREASURY}</p>
              </div>
              <div className="border border-white/[0.04] bg-[#0E111A]/40 rounded-2xl p-8 shadow-xl transition-all hover:border-[#10B981]/20">
                <p className="text-xs font-semibold tracking-wider text-[#64748B] uppercase mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Your Voting Power</p>
                <p className="text-5xl font-semibold text-white mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{votingPower} MNT</p>
                <p className="text-xs text-[#94A3B8] font-light mt-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Hold more MNT to increase power</p>
              </div>
            </div>

            {/* Proposals Feed */}
            <div className="border border-white/[0.04] bg-[#0E111A]/40 rounded-3xl p-6 md:p-8 shadow-2xl">
              <h2 className="text-2xl font-light mb-6" style={{ fontFamily: 'Lora, serif' }}>Active Proposals</h2>
              
              {isLoadingProposals ? (
                <div className="text-center py-12 text-[#94A3B8] font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Loading live proposals from Snapshot...
                </div>
              ) : proposals.length === 0 ? (
                <div className="text-center py-12 text-[#94A3B8] font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  No proposals found.
                </div>
              ) : (
                <div className="space-y-6">
                  {proposals.map((proposal, i) => (
                    <div key={i} className="border border-white/[0.04] bg-white/[0.01] p-6 rounded-2xl hover:border-white/[0.08] hover:bg-white/[0.02] transition-all duration-200">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                          <p className="text-xs font-semibold text-[#10B981] tracking-wider uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>{proposal.id}</p>
                          <p className="text-lg font-medium text-white mt-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{proposal.title}</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex-shrink-0 ${
                          proposal.status === 'Active' 
                            ? 'bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25' 
                            : 'bg-white/[0.04] text-[#94A3B8] border border-white/[0.05]'
                        }`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                          {proposal.status}
                        </span>
                      </div>

                      <p className="text-sm text-[#94A3B8] mt-4 font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>{proposal.impact}</p>

                      <div className="mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t border-white/[0.03]">
                        <div className="text-xs text-[#64748B] font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                          {proposal.deadline}
                        </div>
                        <a 
                          href={proposal.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-6 py-2.5 bg-[#F8FAFC] hover:bg-[#F8FAFC]/90 text-black rounded-full text-xs font-bold shadow-md hover:-translate-y-0.5 transition-all text-center sm:self-auto self-stretch"
                          style={{ fontFamily: 'Outfit, sans-serif' }}
                        >
                          Vote →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-10 pt-8 border-t border-white/[0.03] text-center">
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>Official Governance Links</p>
                <div className="flex flex-wrap justify-center gap-2.5">
                  {[
                    { label: 'Snapshot Voting', url: 'https://snapshot.org/#/bitdao.eth' },
                    { label: 'Forum', url: 'https://forum.mantle.xyz/' },
                    { label: 'Delegate', url: 'https://delegatevote.mantle.xyz/' },
                    { label: 'Treasury Monitor', url: 'https://treasurymonitor.mantle.xyz/' }
                  ].map(link => (
                    <a 
                      key={link.label}
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-4 py-2 text-xs font-medium border border-white/[0.04] bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.03] text-[#94A3B8] hover:text-[#F8FAFC] rounded-full transition-all duration-200"
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}