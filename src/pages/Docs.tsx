import { useSearchParams } from 'react-router-dom'

export const Docs = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  // Read 'tab' parameter from URL, default to 'about' if missing or invalid
  const tabParam = searchParams.get('tab')
  const activeTab = (tabParam === 'about' || tabParam === 'docs' || tabParam === 'security' || tabParam === 'pricing' || tabParam === 'legal')
    ? tabParam
    : 'about'

  const handleTabChange = (tabId: 'about' | 'docs' | 'security' | 'pricing' | 'legal') => {
    setSearchParams({ tab: tabId })
  }

  return (
    <div className="text-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-2" style={{ fontFamily: 'Lora, serif' }}>Resources & Docs</h1>
          <p className="text-[#94A3B8] text-sm md:text-base font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Learn more about Polymath’s mission, architecture, and security protocols
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 bg-[#0E111A]/40 p-1.5 border border-white/[0.04] rounded-2xl mb-8 self-start inline-flex">
          {[
            { id: 'about', label: 'About Us' },
            { id: 'docs', label: 'Documentation' },
            { id: 'security', label: 'Security' },
            { id: 'pricing', label: 'Pricing & Sustainability' },
            { id: 'legal', label: 'Legal & Terms' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#F8FAFC] text-black shadow-md'
                  : 'text-[#64748B] hover:text-[#F8FAFC] hover:bg-white/[0.02]'
              }`}
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="border border-white/[0.04] bg-[#0E111A]/40 p-6 md:p-8 rounded-3xl shadow-2xl">
          {activeTab === 'about' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Lora, serif' }}>Our Mission</h2>
              <p className="text-[#94A3B8] leading-relaxed font-light text-sm md:text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Polymath was founded to bring absolute transparency to the Mantle DeFi ecosystem. While other dashboards focus exclusively on yields and positions, Polymath evaluates the **safety and risk profiles** of the smart contracts securing your capital.
              </p>
              <p className="text-[#94A3B8] leading-relaxed font-light text-sm md:text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                By unifying on-chain balance queries, real-time Pyth price oracle data, and advanced Gemini LLM security intelligence, Polymath provides a comprehensive threat-monitoring layer for Web3.
              </p>
              
              <h2 className="text-2xl font-light mt-8 mb-4" style={{ fontFamily: 'Lora, serif' }}>Business Model & Sustainability</h2>
              <p className="text-[#94A3B8] leading-relaxed font-light text-sm md:text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Polymath relies on a dual B2C and B2B sustainability structure:
              </p>
              <ul className="space-y-3.5 list-disc pl-6 text-[#94A3B8] text-sm font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <li>
                  <strong className="text-white">For Retail Users (100% Free):</strong> Instant dashboard position checking, Pyth-backed pricing formatting, custom safety threshold settings, and Telegram Bot risk alert integrations are fully accessible without costs.
                </li>
                <li>
                  <strong className="text-white">For Protocols (B2B Listing):</strong> Mantle projects can submit a listing application to be audited and integrated into our dynamic risk tracking suite. Protocols pay verification and maintenance fees to show their on-chain audit status directly to users.
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Lora, serif' }}>Metrics Glossary</h2>
                <div className="space-y-4">
                  {[
                    { name: 'Liquidity Depth & TVL', desc: 'The total value locked inside a pool. Low TVL makes a protocol vulnerable to price slippage and oracle manipulation.' },
                    { name: 'Oracle Health', desc: 'Pyth Hermes API latency check. If oracle price feeds experience deviations or late updates, liquidation engines can execute unfairly.' },
                    { name: 'Smart Contract Safety', desc: 'Analysis of code updates, multisig parameters, and past audits compiled to verify threat status.' },
                    { name: 'Bridge Wait Times', desc: 'The lock durations required to bridge capital back to Ethereum mainnet, determining absolute liquidity access speeds.' },
                  ].map((m, i) => (
                    <div key={i} className="border border-white/[0.03] bg-white/[0.01] p-4 rounded-xl">
                      <h4 className="text-sm font-semibold text-white mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>{m.name}</h4>
                      <p className="text-xs text-[#94A3B8] font-light leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>{m.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Lora, serif' }}>Structured AI Telemetry</h2>
                <p className="text-[#94A3B8] leading-relaxed font-light text-sm md:text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Risk scores and advisory details are generated using a backend proxy running Gemini 2.0 Flash. The model is forced via `generationConfig.responseSchema` to output strict JSON telemetry matching the internal dashboard type configurations exactly, preventing frontend errors and guaranteeing clean visual rendering.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Lora, serif' }}>On-Chain Auditing Registry</h2>
              <p className="text-[#94A3B8] leading-relaxed font-light text-sm md:text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Every risk report logged via the Health dashboard writes directly to the Mantle Sepolia blockchain. By creating an immutable history of security checks, users can audit whether a protocol’s safety scores have declined or improved over time.
              </p>

              <div className="border border-[#10B981]/15 bg-[#10B981]/5 p-5 rounded-2xl border-l-4 border-l-[#10B981] space-y-2">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>Deployed Contract Details</h4>
                <p className="text-xs text-[#94A3B8] font-light leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <strong className="text-white">Network:</strong> Mantle Sepolia Testnet (Chain ID 5003)
                </p>
                <p className="text-xs text-[#94A3B8] font-light leading-relaxed">
                  <strong className="text-white">Registry Address:</strong> <code className="bg-[#0E111A] px-2 py-0.5 rounded text-white border border-white/[0.04] text-[11px]">0x4a182a0CfCC7f8A6D0c1766e71F7D51F3E1c90c6</code>
                </p>
                <p className="text-xs text-[#94A3B8] font-light leading-relaxed">
                  <strong className="text-white">Explorer Link:</strong>{' '}
                  <a
                    href="https://explorer.sepolia.mantle.xyz/address/0x4a182a0CfCC7f8A6D0c1766e71F7D51F3E1c90c6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#10B981] underline hover:text-emerald-100 transition-colors"
                  >
                    View Registry on Explorer
                  </a>
                </p>
              </div>

              <h2 className="text-2xl font-light mt-8 mb-4" style={{ fontFamily: 'Lora, serif' }}>Hash Integrity Validation</h2>
              <p className="text-[#94A3B8] leading-relaxed font-light text-sm md:text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                To save gas, Polymath does not write raw paragraph summaries to the blockchain. Instead, it computes a standard `keccak256` hash of the risk report summary text frontend:
              </p>
              <pre className="bg-[#080A10]/60 p-4 rounded-xl border border-white/[0.04] text-[11px] text-emerald-400 overflow-x-auto">
{`const summaryHash = ethers.keccak256(ethers.toUtf8Bytes(summary))
await contract.logRisk(protocolAddress, riskScore, summaryHash)`}
              </pre>
              <p className="text-[#94A3B8] leading-relaxed font-light text-sm md:text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                This allows any third-party auditor to verify that a specific safety report exactly matches the hash permanently stamped on the Mantle ledger.
              </p>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Lora, serif' }}>Protocol & Enterprise Sustainability Models</h2>
                <p className="text-[#94A3B8] leading-relaxed font-light text-sm md:text-base mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  To maintain an objective, high-availability monitoring pipeline for the Mantle ecosystem, Polymath aligns incentives through B2B listing fees, automated position routing micro-fees, and customized treasury oversight dashboards.
                </p>
                
                {/* Retail Free Tier Notice */}
                <div className="border border-emerald-500/10 bg-emerald-950/10 p-5 rounded-2xl mb-8 flex gap-4 items-start">
                  <span className="material-symbols-outlined text-[#10B981] mt-0.5">info</span>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>Retail Monitoring is 100% Free</h4>
                    <p className="text-xs text-[#94A3B8] font-light leading-relaxed" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      All basic functionalities, including portfolio health scans, real-time Pyth price feed formatting, custom alert configuration, and real-time Telegram Bot triggers are entirely free for retail users.
                    </p>
                  </div>
                </div>
              </div>

              {/* B2B Tier Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Card 1: Listing verification */}
                <div className="border border-white/[0.04] bg-[#080A10]/40 pricing-card p-6 rounded-2xl flex flex-col justify-between hover:border-emerald-500/20 transition-all duration-300">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-[#10B981] flex items-center justify-center mb-5">
                      <span className="material-symbols-outlined text-xl">verified</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Protocol Listing & Auditing</h3>
                    <p className="text-xs text-[#94A3B8] leading-relaxed mb-6 font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Submit your Mantle smart contracts to our registry for automated code integrity verification, live liquidity monitoring, and permanent on-chain auditing logs.
                    </p>
                  </div>
                  <div>
                    <div className="border-t border-white/[0.04] pt-4 mt-2">
                      <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Custom Fee</p>
                      <p className="text-[11px] text-[#64748B] mt-1">One-time auditing + annual indexing</p>
                    </div>
                  </div>
                </div>

                {/* Card 2: Rebalancing Routing fee */}
                <div className="border border-white/[0.04] bg-[#080A10]/40 pricing-card p-6 rounded-2xl flex flex-col justify-between hover:border-emerald-500/20 transition-all duration-300">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-[#10B981] flex items-center justify-center mb-5">
                      <span className="material-symbols-outlined text-xl">swap_calls</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Yield Rebalancing Fee</h3>
                    <p className="text-xs text-[#94A3B8] leading-relaxed mb-6 font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Access our automated one-click aggregator to move assets across Mantle pools in response to real-time risk alerts and shifting yields.
                    </p>
                  </div>
                  <div>
                    <div className="border-t border-white/[0.04] pt-4 mt-2">
                      <p className="text-2xl font-bold text-[#10B981]" style={{ fontFamily: 'Outfit, sans-serif' }}>0.05%</p>
                      <p className="text-[11px] text-[#64748B] mt-1">Flat routing fee per transaction</p>
                    </div>
                  </div>
                </div>

                {/* Card 3: Institutional treasury dashboards */}
                <div className="border border-[#10B981]/20 bg-[#0E111A]/60 pricing-card p-6 rounded-2xl flex flex-col justify-between hover:border-[#10B981]/40 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#10B981] text-black text-[9px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                    Enterprise
                  </div>
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-[#10B981] flex items-center justify-center mb-5">
                      <span className="material-symbols-outlined text-xl">corporate_fare</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>Institutional Treasury</h3>
                    <p className="text-xs text-[#94A3B8] leading-relaxed mb-6 font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
                      Designed for DAOs, funds, and corporate treasuries. Get dedicated multi-wallet tracking, customized risk alert parameters, compliance exports, and priority SLA notifications.
                    </p>
                  </div>
                  <div>
                    <div className="border-t border-white/[0.04] pt-4 mt-2">
                      <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Contact Us</p>
                      <p className="text-[11px] text-[#64748B] mt-1">Bespoke SaaS subscription tiers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'legal' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Lora, serif' }}>Privacy Policy</h2>
                <p className="text-[#94A3B8] leading-relaxed font-light text-sm md:text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Polymath is a decentralized, non-custodial utility. We do not collect, store, or sell any personal identifying information, IP addresses, or wallet balances. All telemetry data read by the dashboard is retrieved directly from public RPC nodes on the Mantle blockchain.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Lora, serif' }}>Terms of Service</h2>
                <p className="text-[#94A3B8] leading-relaxed font-light text-sm md:text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  All risk ratings, scores, and AI advice generated by Polymath are for informational and educational purposes only. They do not constitute financial, legal, or investment advice. Smart contracts carry inherent risks, and you interact with DeFi protocols at your own discretion.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Lora, serif' }}>Cookie Policy</h2>
                <p className="text-[#94A3B8] leading-relaxed font-light text-sm md:text-base" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Polymath does not use cookies for tracking or analytical advertisements. We use browser Local Storage purely to persist your UI configuration settings (such as your theme preferences, active currency display, and Telegram Alerts identifier) locally on your device.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
