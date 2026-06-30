import { type ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface AppLayoutProps {
  children: ReactNode
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#08080C] text-[#F8FAFC] relative overflow-hidden">
      <Sidebar />

      {/* Ultra Seamless Infinite Ticker */}
      <div className="bg-[#0A0D14] border-b border-white/[0.04] py-2 overflow-hidden whitespace-nowrap z-35 relative">
        <div className="inline-flex animate-marquee items-center gap-10 text-xs font-semibold tracking-wider uppercase text-[#10B981]">
          <span>Total risk clarity for Mantle DeFi</span>
          <span className="text-white/10">•</span>
          <span>Real-time on-chain risk monitoring</span>
          <span className="text-white/10">•</span>
          <span>AI-powered insights by Nansen + Pyth + GitHub Models</span>
          <span className="text-white/10">•</span>

          <span>Total risk clarity for Mantle DeFi</span>
          <span className="text-white/10">•</span>
          <span>Real-time on-chain risk monitoring</span>
          <span className="text-white/10">•</span>
          <span>AI-powered insights by Nansen + Pyth + GitHub Models</span>
          <span className="text-white/10">•</span>

          <span>Total risk clarity for Mantle DeFi</span>
          <span className="text-white/10">•</span>
          <span>Real-time on-chain risk monitoring</span>
          <span className="text-white/10">•</span>
          <span>AI-powered insights by Nansen + Pyth + GitHub Models</span>
          <span className="text-white/10">•</span>

          <span>Total risk clarity for Mantle DeFi</span>
          <span className="text-white/10">•</span>
          <span>Real-time on-chain risk monitoring</span>
          <span className="text-white/10">•</span>
          <span>AI-powered insights by Nansen + Pyth + GitHub Models</span>
          <span className="text-white/10">•</span>
        </div>
      </div>

      <main className="md:ml-60 pt-16 md:pt-0 min-h-[calc(100vh-40px)]">
        {children}
      </main>
    </div>
  )
}