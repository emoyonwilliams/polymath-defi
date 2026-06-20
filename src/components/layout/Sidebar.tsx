import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { useWalletContext } from '../../hooks/useWalletContext'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'agent', label: 'Agent', icon: 'smart_toy' },
  { id: 'portfolio', label: 'Portfolio', icon: 'account_balance_wallet' },
  { id: 'rewards', label: 'Rewards', icon: 'trophy' },
  { id: 'health', label: 'Health', icon: 'monitoring' },
  { id: 'governance', label: 'Governance', icon: 'gavel' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
  { id: 'docs', label: 'Docs', icon: 'description' },
]

export const Sidebar = () => {
  const { address, isConnected, isConnecting, connect, disconnect, formatAddress } = useWalletContext()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#08080C] md:bg-transparent">
      {/* Logo */}
      <div
        className="px-6 py-6 cursor-pointer flex-shrink-0 group"
        onClick={() => { navigate('/'); setMobileOpen(false) }}
      >
        <img 
          src={logo} 
          alt="Polymath" 
          className="h-7 w-auto logo-invert transition-transform duration-200 group-hover:scale-[1.03] group-hover:brightness-110" 
        />
      </div>

      {/* Divider */}
      <div className="mx-6 border-t border-white/[0.04]" />

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.id}
            to={`/app/${item.id}`}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/0 text-[#10B981] border-l-2 border-[#10B981]'
                  : 'text-[#64748B] hover:text-[#F8FAFC] hover:bg-white/[0.02]'
              }`
            }
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {({ isActive }) => (
              <>
                <span
                  className={`material-symbols-outlined text-[21px] transition-colors ${
                    isActive ? 'text-[#10B981]' : 'text-[#64748B] group-hover:text-[#F8FAFC]'
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-6 border-t border-white/[0.04]" />

      {/* Wallet Section */}
      <div className="px-4 py-6 flex-shrink-0">
        {isConnected ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 px-4 py-3.5 bg-emerald-950/20 border border-emerald-500/10 rounded-2xl">
              <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse shadow-[0_0_8px_#10B981] flex-shrink-0" />
              <span className="text-sm text-[#F8FAFC] font-medium truncate" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {formatAddress(address!)}
              </span>
            </div>
            <button
              onClick={disconnect}
              className="w-full px-4 py-3 text-sm font-medium rounded-2xl border border-white/[0.05] hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-[#64748B] hover:text-[#F8FAFC] transition-all duration-200"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={connect}
            disabled={isConnecting}
            className="w-full px-4 py-3.5 rounded-2xl font-semibold text-sm bg-gradient-to-r from-[#10B981] to-emerald-600 hover:brightness-110 text-black shadow-[0_4px_12px_rgba(16,185,129,0.15)] transition-all duration-200 disabled:opacity-50"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}

        {/* Social links */}
        <div className="flex items-center justify-center gap-5 mt-5">
          <a href="https://x.com/polymath_defi" target="_blank" rel="noopener noreferrer"
            className="text-[#64748B] hover:text-[#F8FAFC] text-xs transition-colors duration-200">𝕏</a>
          <a href="https://discord.gg/xPhm5wGF" target="_blank" rel="noopener noreferrer"
            className="text-[#64748B] hover:text-[#F8FAFC] text-xs transition-colors duration-200">Discord</a>
          <a href="https://t.me/polymathdefi" target="_blank" rel="noopener noreferrer"
            className="text-[#64748B] hover:text-[#F8FAFC] text-xs transition-colors duration-200">Telegram</a>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col bg-[#08080C] border-r border-white/[0.04] z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-16 bg-[#08080C] border-b border-white/[0.04] flex items-center justify-between px-6">
        <img
          src={logo}
          alt="Polymath"
          className="h-6 w-auto cursor-pointer logo-invert"
          onClick={() => navigate('/')}
        />
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-[#64748B] hover:text-[#F8FAFC] transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`md:hidden fixed left-0 top-0 h-screen w-72 bg-[#08080C] border-r border-white/[0.04] z-50 transform transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-5 right-5 z-55">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 text-[#64748B] hover:text-[#F8FAFC] transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
        <SidebarContent />
      </aside>
    </>
  )
}