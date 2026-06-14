import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png'

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
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <div key={index} className="border border-[#1E1E2E] rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#16161F] transition-colors text-left"
          >
            <span className="font-medium text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{faq.question}</span>
            <span className={`text-[#10B981] transition-transform text-lg ${openIndex === index ? 'rotate-180 inline-block' : ''}`}>↓</span>
          </button>
          {openIndex === index && (
            <div className="px-6 py-4 bg-[#0F0F0F] border-t border-[#1E1E2E] text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
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
    <div className="min-h-screen bg-[#0F0F0F] text-white">

      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@400;500;600&display=swap');`}</style>

      {/* Navbar */}
      <nav className="border-b border-[#1E1E2E] sticky top-0 z-50 bg-[#0F0F0F]/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="Polymath" className="h-8 w-auto" />
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['About', 'Docs', 'Blog'].map(link => (
              <a key={link} href="#" className="text-[#94A3B8] hover:text-white transition-colors text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>{link}</a>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              <a href="https://x.com/polymath_defi" target="_blank" rel="noopener noreferrer" className="text-[#94A3B8] hover:text-[#10B981] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://discord.gg/xPhm5wGF" target="_blank" rel="noopener noreferrer" className="text-[#94A3B8] hover:text-[#10B981] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.445.865-.607 1.25a18.27 18.27 0 00-5.487 0c-.163-.39-.401-.875-.612-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.08.08 0 00.087-.027c.461-.63.873-1.295 1.226-1.994a.076.076 0 00-.042-.106 13.107 13.107 0 01-1.872-.892.077.077 0 00-.009-.128c.125-.093.25-.19.371-.287a.074.074 0 00.03-.104c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 00.033.104c.12.098.246.195.371.288a.077.077 0 00-.009.127c-.6.35-1.235.645-1.871.893a.076.076 0 00-.041.106c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.86 19.86 0 006.002-3.03.077.077 0 00.032-.054c.5-4.786-.838-8.95-3.549-12.676a.061.061 0 00-.031-.03z"/></svg>
              </a>
              <a href="https://t.me/polymathdefi" target="_blank" rel="noopener noreferrer" className="text-[#94A3B8] hover:text-[#10B981] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.365-1.337.348-.437-.01-1.276-.241-1.896-.44-.72-.23-1.29-.359-1.241-.756.027-.166.106-.536.956-1.114 3.555-2.502 8.9-6.17 8.9-6.17z"/></svg>
              </a>
            </div>
            <button
              onClick={() => navigate('/app/dashboard')}
              className="px-6 py-2.5 rounded-full font-medium transition-all text-sm bg-white hover:bg-gray-200"
              style={{ fontFamily: 'DM Sans, sans-serif', color: '#000000' }}
            >
              Launch App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-20 md:py-32 text-center">
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-normal tracking-tight leading-tight mb-6" style={{ fontFamily: 'Lora, serif' }}>
          Total{' '}
          <span className="italic" style={{ fontFamily: 'Lora, serif', fontStyle: 'italic', background: 'linear-gradient(135deg, #10B981, #00FF9F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            risk clarity
          </span>
          {' '}for
          <br />Mantle DeFi.
        </h1>
        <p className="text-lg md:text-xl text-[#94A3B8] max-w-2xl mx-auto leading-relaxed mb-10" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Monitor and understand risk across every live protocol on Mantle, on-chain and off-chain, in real time.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="px-8 py-3 rounded-full font-medium transition-all text-sm bg-white hover:bg-gray-200"
            style={{ fontFamily: 'DM Sans, sans-serif', color: '#000000' }}
          >
            Launch App
          </button>
          <button className="border border-white text-white hover:bg-white hover:text-[#0F0F0F] px-8 py-3 rounded-full font-medium transition-all" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Learn more →
          </button>
        </div>
      </section>

      {/* Protocol Strip */}
      <section className="border-y border-[#1E1E2E] py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[#94A3B8] text-sm mb-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>Monitoring the leaders of Mantle DeFi</p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            {['mETH', 'Aave', 'Merchant Moe', 'Agni Finance', 'INIT Capital', 'Fluxion', 'Ethena', 'Ondo', 'Mantle'].map(p => (
              <span key={p} className="text-white font-medium text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Why Polymath */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl text-center mb-16 font-normal" style={{ fontFamily: 'Lora, serif' }}>Why Polymath</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Health Intelligence', desc: 'Real-time risk monitoring across all live Mantle protocols — on-chain smart contract risk and off-chain institutional risk, unified.' },
            { title: 'Portfolio Clarity', desc: 'See your full Mantle position in one view. Asset values, APY, liquidity timelines, and bridge withdrawal windows.' },
            { title: 'On-chain Transparency', desc: 'Every risk assessment logged permanently to Mantle via smart contract. Immutable, auditable, verifiable by anyone.' },
          ].map((f, i) => (
            <div 
              key={i} 
              className="border border-[#1E1E2E] bg-[#0F2A22] p-8 rounded-xl hover:border-[#10B981] transition-all"
            >
              <h3 className="text-xl font-bold mb-4 text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{f.title}</h3>
              <p className="text-[#94A3B8] leading-relaxed" style={{ fontFamily: 'DM Sans, sans-serif' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl text-center mb-16 font-normal" style={{ fontFamily: 'Lora, serif' }}>How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Connect', desc: 'Link your wallet to load your Mantle positions and portfolio.' },
            { step: '2', title: 'Monitor', desc: 'Track risk metrics across protocols with real-time health scores.' },
            { step: '3', title: 'Stay Protected', desc: 'Get alerts before conditions change. Every signal logged on-chain.' },
          ].map((s, i) => (
            <div 
              key={i} 
              className="border border-[#1E1E2E] bg-[#0F2A22] p-8 rounded-xl hover:border-[#10B981] transition-all text-center"
            >
              <div className="w-12 h-12 bg-[#10B981] text-[#0F0F0F] rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                {s.step}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.title}</h3>
              <p className="text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-4xl text-center mb-16 font-normal" style={{ fontFamily: 'Lora, serif' }}>Frequently Asked Questions</h2>
        <Accordion />
      </section>

      {/* CTA */}
      <section 
        className="max-w-4xl mx-auto px-8 py-16 text-center mb-20 rounded-xl border border-[#1E1E2E] bg-[#0F2A22]"
      >
        <h2 className="text-4xl mb-4 font-normal" style={{ fontFamily: 'Lora, serif' }}>Ready to gain total risk clarity?</h2>
        <p className="text-[#94A3B8] mb-8 text-lg" style={{ fontFamily: 'DM Sans, sans-serif' }}>Start monitoring Mantle DeFi risks today with Polymath.</p>
        <button
          onClick={() => navigate('/app/dashboard')}
          className="px-8 py-3 rounded-full font-medium transition-all text-sm bg-white hover:bg-gray-200"
          style={{ fontFamily: 'DM Sans, sans-serif', color: '#000000' }}
        >
          Launch App
        </button>
      </section>

      {/* Final Clean Footer */}
      <footer className="border-t border-[#1E1E2E]">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={logo} alt="Polymath" className="h-8 w-auto" />
                <p className="text-[#94A3B8] text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>Total risk clarity for Mantle DeFi.</p>
              </div>
            </div>

            {[
              { 
                title: 'Product', 
                links: [
                  { name: 'Docs', url: '#' },
                  { name: 'Security', url: '#' }
                ]
              },
              { 
                title: 'Company', 
                links: [
                  { name: 'About', url: '#' },
                  { name: 'Blog', url: '#' }
                ]
              },
              { 
                title: 'Legal', 
                links: [
                  { name: 'Privacy', url: '#' },
                  { name: 'Terms', url: '#' },
                  { name: 'Cookies', url: '#' }
                ]
              },
            ].map(col => (
              <div key={col.title}>
                <h3 className="font-bold text-white mb-4 text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>{col.title}</h3>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link.name}>
                      <a 
                        href={link.url} 
                        className="text-[#94A3B8] hover:text-white transition-colors text-sm" 
                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-[#1E1E2E] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#94A3B8] text-sm" style={{ fontFamily: 'DM Sans, sans-serif' }}>
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
                  className="text-[#94A3B8] hover:text-[#10B981] transition-colors text-sm" 
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
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