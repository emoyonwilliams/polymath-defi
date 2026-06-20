import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Accordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const faqs = [
    { question: 'What protocols does Polymath monitor?', answer: 'Polymath monitors mETH, Aave V3, Merchant Moe, Agni Finance, INIT Capital, Fluxion, USDY (Ondo), and USDe (Ethena) — all live on Mantle.' },
    { question: 'How real-time is the risk monitoring?', answer: 'Risk metrics are updated in real-time as new transactions and events occur on the Mantle network, giving you instant visibility into protocol health.' },
    { question: 'Do I stay in control of my funds?', answer: 'Yes. Polymath is fully non-custodial. We never have access to your assets — we only read on-chain data.' },
    { question: 'What makes Polymath different from other dashboards?', answer: "We monitor both on-chain smart contract risk and off-chain institutional risk — unique to Mantle's RWA asset stack. Every assessment is logged permanently on-chain." },
    { question: 'How often is risk data updated?', answer: 'Protocol health is assessed in real time. You can trigger a fresh analysis at any time from the Health section.' },
  ]

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div 
          key={index} 
          className="border border-white/[0.04] bg-[#0E111A]/50 rounded-2xl overflow-hidden transition-all duration-200 hover:border-white/[0.08]"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/[0.01] transition-colors text-left"
          >
            <span className="font-semibold text-[#F8FAFC] text-base md:text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>{faq.question}</span>
            <span className={`text-[#10B981] transition-transform duration-250 ${openIndex === index ? 'rotate-180' : ''} material-symbols-outlined text-xl`}>
              expand_more
            </span>
          </button>
          {openIndex === index && (
            <div 
              className="px-6 py-5 bg-[#080A10]/70 border-t border-white/[0.03] text-[#94A3B8] text-sm md:text-base leading-relaxed" 
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export const Landing = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#08080C] text-[#F8FAFC] overflow-x-hidden">

      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400;1,500&family=Outfit:wght@300;400;500;600;700&display=swap');`}</style>

      {/* Navbar */}
      <nav className="border-b border-white/[0.04] sticky top-0 z-50 bg-[#08080C]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
            <div 
              aria-label="Polymath"
              role="img"
              className="h-8 logo-masked transition-transform duration-200 group-hover:scale-[1.03] group-hover:brightness-110" 
            />
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a onClick={() => navigate('/app/docs?tab=about')} className="text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer transition-colors text-sm font-medium focus:outline-none" style={{ fontFamily: 'Outfit, sans-serif' }}>About</a>
            <a onClick={() => navigate('/app/docs?tab=docs')} className="text-[#94A3B8] hover:text-[#F8FAFC] cursor-pointer transition-colors text-sm font-medium focus:outline-none" style={{ fontFamily: 'Outfit, sans-serif' }}>Docs</a>
            <a href="https://polymathdefi.substack.com/p/total-risk-clarity?r=8mp3mp" target="_blank" rel="noopener noreferrer" className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors text-sm font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>Blog</a>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <a href="https://x.com/polymath_defi" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-[#10B981] transition-colors p-1.5 rounded-lg hover:bg-white/[0.02]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://discord.gg/xPhm5wGF" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-[#10B981] transition-colors p-1.5 rounded-lg hover:bg-white/[0.02]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.445.865-.607 1.25a18.27 18.27 0 00-5.487 0c-.163-.39-.401-.875-.612-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.08.08 0 00.087-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 00-.042-.106 13.107 13.107 0 01-1.872-.892.077.077 0 00-.009-.128c.125-.093.25-.19.371-.287a.074.074 0 00.03-.104c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 00.033.104c.12.098.246.195.371.288a.077.077 0 00-.009.127c-.6.35-1.235.645-1.871.893a.076.076 0 00-.041.106c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.86 19.86 0 006.002-3.03.077.077 0 00.032-.054c.5-4.786-.838-8.95-3.549-12.676a.061.061 0 00-.031-.03z"/></svg>
              </a>
              <a href="https://t.me/polymathdefi" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-[#10B981] transition-colors p-1.5 rounded-lg hover:bg-white/[0.02]">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.365-1.337.348-.437-.01-1.276-.241-1.896-.44-.72-.23-1.29-.359-1.241-.756.027-.166.106-.536.956-1.114 3.555-2.502 8.9-6.17 8.9-6.17z"/></svg>
              </a>
            </div>
            <button
              onClick={() => navigate('/app/dashboard')}
              className="px-6 py-2.5 rounded-full font-semibold text-xs transition-all duration-200 bg-[#F8FAFC] hover:bg-[#F8FAFC]/90 text-black shadow-lg"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-36 text-center relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.06),transparent_60%)] pointer-events-none" />
        <h1 className="text-5xl md:text-7xl lg:text-[85px] font-light tracking-tight leading-[1.1] mb-8" style={{ fontFamily: 'Lora, serif' }}>
          Total{' '}
          <span className="italic font-medium" style={{ background: 'linear-gradient(135deg, #10B981, #00FF9F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            risk clarity
          </span>
          {' '}for
          <br />Mantle DeFi.
        </h1>
        <p className="text-lg md:text-xl text-[#94A3B8] max-w-2xl mx-auto leading-relaxed mb-12 font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Monitor and understand risk across every live protocol on Mantle, on-chain and off-chain, in real time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="px-8 py-3.5 rounded-full font-bold text-sm bg-[#F8FAFC] hover:bg-[#F8FAFC]/90 text-black shadow-xl transition-all duration-200 hover:-translate-y-0.5"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Launch App
          </button>
          <button 
            className="border border-white/10 hover:border-white/20 text-[#F8FAFC] hover:bg-white/[0.03] px-8 py-3.5 rounded-full font-medium text-sm transition-all duration-200 hover:-translate-y-0.5" 
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Learn more →
          </button>
        </div>
      </section>

      {/* Protocol Strip */}
      <section className="border-y border-white/[0.04] bg-[#0A0D16]/30 py-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[#64748B] text-xs font-semibold tracking-widest uppercase mb-8" style={{ fontFamily: 'Outfit, sans-serif' }}>Monitoring the leaders of Mantle DeFi</p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-14">
            {['mETH', 'Aave', 'Merchant Moe', 'Agni Finance', 'INIT Capital', 'Fluxion', 'Ethena', 'Ondo', 'Mantle'].map(p => (
              <span key={p} className="text-[#94A3B8] hover:text-[#F8FAFC] font-medium text-sm transition-colors duration-200 cursor-default" style={{ fontFamily: 'Outfit, sans-serif' }}>{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Why Polymath */}
      <section className="max-w-7xl mx-auto px-6 py-28">
        <h2 className="text-4xl md:text-5xl text-center mb-20 font-light" style={{ fontFamily: 'Lora, serif' }}>Why Polymath</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Health Intelligence', desc: 'Real-time risk monitoring across all live Mantle protocols — on-chain smart contract risk and off-chain institutional risk, unified.' },
            { title: 'Portfolio Clarity', desc: 'See your full Mantle position in one view. Asset values, APY, liquidity timelines, and bridge withdrawal windows.' },
            { title: 'On-chain Transparency', desc: 'Every risk assessment logged permanently to Mantle via smart contract. Immutable, auditable, verifiable by anyone.' },
          ].map((f, i) => (
            <div 
              key={i} 
              className="border border-white/[0.04] bg-[#0E111A]/40 p-8 rounded-2xl hover:border-[#10B981]/25 hover:bg-[#0E111A]/60 transition-all duration-300 shadow-xl"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-[#10B981] flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[22px]">
                  {i === 0 ? 'health_and_safety' : i === 1 ? 'account_balance_wallet' : 'database'}
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-4 text-[#F8FAFC]" style={{ fontFamily: 'Outfit, sans-serif' }}>{f.title}</h3>
              <p className="text-[#94A3B8] leading-relaxed font-light text-sm md:text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-4xl md:text-5xl text-center mb-20 font-light" style={{ fontFamily: 'Lora, serif' }}>How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Connect', desc: 'Link your wallet to load your Mantle positions and portfolio.' },
            { step: '2', title: 'Monitor', desc: 'Track risk metrics across protocols with real-time health scores.' },
            { step: '3', title: 'Stay Protected', desc: 'Get alerts before conditions change. Every signal logged on-chain.' },
          ].map((s, i) => (
            <div 
              key={i} 
              className="border border-white/[0.04] bg-[#0E111A]/40 p-8 rounded-2xl hover:border-[#10B981]/25 transition-all duration-350 text-center shadow-xl"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-emerald-600 text-black rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-6 shadow-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {s.step}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-[#F8FAFC]" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.title}</h3>
              <p className="text-[#94A3B8] text-sm md:text-base font-light leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-28">
        <h2 className="text-4xl md:text-5xl text-center mb-20 font-light" style={{ fontFamily: 'Lora, serif' }}>Frequently Asked Questions</h2>
        <Accordion />
      </section>

      {/* CTA */}
      <section 
        className="max-w-5xl mx-auto px-8 py-20 text-center mb-28 rounded-3xl border border-white/[0.04] bg-gradient-to-br from-[#0E111A]/80 to-[#0A0D16]/50 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04),transparent_70%)] pointer-events-none" />
        <h2 className="text-4xl md:text-5xl mb-6 font-light" style={{ fontFamily: 'Lora, serif' }}>Ready to gain total risk clarity?</h2>
        <p className="text-[#94A3B8] mb-10 text-base md:text-lg max-w-xl mx-auto font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>Start monitoring Mantle DeFi risks today with Polymath.</p>
        <button
          onClick={() => navigate('/app/dashboard')}
          className="px-10 py-4 rounded-full font-bold text-sm bg-[#F8FAFC] hover:bg-[#F8FAFC]/90 text-black shadow-xl transition-all duration-200 hover:-translate-y-0.5 relative z-10"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          Launch App
        </button>
      </section>

      {/* Final Clean Footer */}
      <footer className="border-t border-white/[0.04] bg-[#05060A]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex flex-col gap-4 mb-4">
                <div 
                  aria-label="Polymath"
                  role="img"
                  className="h-8 self-start logo-masked" 
                />
                <p className="text-[#64748B] text-sm leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>Total risk clarity for Mantle DeFi.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#F8FAFC] mb-5 text-sm uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>Product</h3>
              <ul className="space-y-3">
                <li>
                  <a onClick={() => navigate('/app/docs?tab=docs')} className="text-[#64748B] hover:text-[#F8FAFC] cursor-pointer transition-colors text-sm font-light focus:outline-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Docs
                  </a>
                </li>
                <li>
                  <a onClick={() => navigate('/app/docs?tab=security')} className="text-[#64748B] hover:text-[#F8FAFC] cursor-pointer transition-colors text-sm font-light focus:outline-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Security
                  </a>
                </li>
                <li>
                  <a onClick={() => navigate('/app/docs?tab=pricing')} className="text-[#64748B] hover:text-[#F8FAFC] cursor-pointer transition-colors text-sm font-light focus:outline-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[#F8FAFC] mb-5 text-sm uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>Company</h3>
              <ul className="space-y-3">
                <li>
                  <a onClick={() => navigate('/app/docs?tab=about')} className="text-[#64748B] hover:text-[#F8FAFC] cursor-pointer transition-colors text-sm font-light focus:outline-none" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    About
                  </a>
                </li>
                <li>
                  <a href="https://polymathdefi.substack.com/p/total-risk-clarity?r=8mp3mp" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-[#F8FAFC] transition-colors text-sm font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[#F8FAFC] mb-5 text-sm uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>Legal</h3>
              <ul className="space-y-3">
                {[
                  { name: 'Privacy', tab: 'legal' },
                  { name: 'Terms', tab: 'legal' },
                  { name: 'Cookies', tab: 'legal' }
                ].map(item => (
                  <li key={item.name}>
                    <a 
                      onClick={() => navigate(`/app/docs?tab=${item.tab}`)} 
                      className="text-[#64748B] hover:text-[#F8FAFC] cursor-pointer transition-colors text-sm font-light" 
                      style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/[0.04] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#64748B] text-sm font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
              © 2026 Polymath. All rights reserved.
            </p>
            <div className="flex gap-6">
              {[
                { name: 'Twitter', url: 'https://x.com/polymath_defi' },
                { name: 'Discord', url: 'https://discord.gg/xPhm5wGF' },
                { name: 'Telegram', url: 'https://t.me/polymathdefi' },
              ].map(s => (
                <a 
                  key={s.name} 
                  href={s.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#64748B] hover:text-[#10B981] transition-colors text-sm font-light" 
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {s.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}