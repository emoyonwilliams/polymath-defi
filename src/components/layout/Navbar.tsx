import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { NAV_ITEMS } from '../../lib/constants'
import { useWalletContext } from '../../hooks/useWalletContext'

export const Navbar = () => {
  const { address, isConnected, isConnecting, connect, disconnect, formatAddress } = useWalletContext()
  const navigate = useNavigate()
  const location = useLocation()

  const isLandingPage = location.pathname === '/' || location.pathname === ''

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1E1E2E] bg-[#0F0F0F]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <div 
          className="flex items-center cursor-pointer flex-shrink-0"
          onClick={() => navigate('/')}
        >
          <img src={logo} alt="Polymath" className="h-8 w-auto" />
        </div>

        {/* Nav Items - Hidden on mobile, shown on md+ */}
        <div className="hidden md:flex items-center gap-2 mx-auto">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.id}
              to={`/app/${item.id}`}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white bg-white/10'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`
              }
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              <span className="material-symbols-outlined text-base">
                {item.id === 'dashboard' && 'dashboard'}
                {item.id === 'agent' && 'smart_toy'}
                {item.id === 'portfolio' && 'account_balance_wallet'}
                {item.id === 'rewards' && 'trophy'}
                {item.id === 'health' && 'monitoring'}
                {item.id === 'governance' && 'gavel'}
                {item.id === 'settings' && 'settings'}
              </span>
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {isLandingPage && (
            <div className="hidden md:flex items-center gap-4 text-[#94A3B8]">
              <a href="https://x.com/polymath_defi" target="_blank" rel="noopener noreferrer" className="hover:text-white">𝕏</a>
              <a href="https://discord.gg/xPhm5wGF" target="_blank" rel="noopener noreferrer" className="hover:text-white">D</a>
              <a href="https://t.me/polymathdefi" target="_blank" rel="noopener noreferrer" className="hover:text-white">✈️</a>
            </div>
          )}

          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#0F2A22] border border-[#1E1E2E] rounded-2xl">
                <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                <span className="text-sm text-white font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {formatAddress(address!)}
                </span>
              </div>
              <button
                onClick={disconnect}
                className="px-5 py-2 text-sm rounded-2xl border border-[#1E1E2E] hover:bg-[#1E1E2E] transition-colors"
                style={{ fontFamily: 'DM Sans, sans-serif' }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="px-6 py-2.5 rounded-2xl font-medium text-sm bg-white hover:bg-gray-100 text-black transition-all whitespace-nowrap"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}