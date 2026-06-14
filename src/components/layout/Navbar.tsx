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
      <div className="max-w-7xl mx-auto px-0 h-16 flex items-center justify-between">

        {/* Logo - Far Left (only the cube, no text) */}
        <div 
          className="flex items-center cursor-pointer flex-shrink-0 -ml-10" 
          onClick={() => navigate('/')}
        >
          <img src={logo} alt="Polymath" className="h-9 w-auto" />
        </div>

        {/* Nav Items - Centered with good breathing space */}
        <div className="hidden md:flex items-center gap-6 text-sm mx-auto">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.id}
              to={`/app/${item.id}`}
              className={({ isActive }) =>
                `flex items-center gap-1 px-22 py-2 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'text-white bg-white/5'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`
              }
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              <span className="material-symbols-outlined text-[15px]">
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

        {/* Right Side - Wallet Area (same distance from edge as logo) */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {isLandingPage && (
            <div className="hidden md:flex items-center gap-4 text-[#94A3B8]">
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">𝕏</a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">D</a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">✈️</a>
            </div>
          )}

          {isConnected ? (
            <div className="flex items-center gap-300">
              <div className="px-5 py-2.5 bg-[#0F2A22] border border-[#1E1E2E] rounded-2xl flex items-center gap-1.5">
                <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                <span className="text-sm text-white font-medium" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {formatAddress(address!)}
                </span>
              </div>
              <button
                onClick={disconnect}
                className="px-6 py-2.5 rounded-full font-medium text-sm border border-[#1E1E2E] bg-[#0F2A22] hover:bg-[#1A3A2E] hover:border-[#10B981] transition-all"
                style={{ fontFamily: 'DM Sans, sans-serif', color: '#FFFFFF' }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="px-6 py-2.5 rounded-full font-medium text-sm bg-white hover:bg-gray-100 text-black transition-all"
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
