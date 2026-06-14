import { useState, useEffect } from 'react'
import { Navbar } from '../components/layout/Navbar'

export const Settings = () => {
  const [currency, setCurrency] = useState<'USD' | 'ETH' | 'MNT'>('USD')
  const [highTVL, setHighTVL] = useState('1000000')
  const [mediumTVL, setMediumTVL] = useState('100000')
  const [deltaThreshold, setDeltaThreshold] = useState('0.5')
  const [alertLevel, setAlertLevel] = useState<'all' | 'critical' | 'none'>('all')

  // Load from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('polymath-currency') as 'USD' | 'ETH' | 'MNT' | null
    const savedHighTVL = localStorage.getItem('polymath-highTVL')
    const savedMediumTVL = localStorage.getItem('polymath-mediumTVL')
    const savedDelta = localStorage.getItem('polymath-deltaThreshold')
    const savedAlert = localStorage.getItem('polymath-alertLevel') as 'all' | 'critical' | 'none' | null

    if (savedCurrency) setCurrency(savedCurrency)
    if (savedHighTVL) setHighTVL(savedHighTVL)
    if (savedMediumTVL) setMediumTVL(savedMediumTVL)
    if (savedDelta) setDeltaThreshold(savedDelta)
    if (savedAlert) setAlertLevel(savedAlert)
  }, [])

  const saveSetting = (key: string, value: string) => {
    localStorage.setItem(`polymath-${key}`, value)
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        <h1 
          className="text-3xl font-normal mb-2" 
          style={{ fontFamily: 'Lora, serif' }}
        >
          Settings
        </h1>
        <p className="text-[#94A3B8] mb-10" style={{ fontFamily: 'DM Sans, sans-serif' }}>
          Customize thresholds and preferences.
        </p>

        {/* Display */}
        <div className="border border-[#1E1E2E] bg-[#0F2A22] p-8 rounded-xl mb-6">
          <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Display
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>Theme</p>
                <p className="text-xs text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Dark mode (optimized for Polymath)</p>
              </div>
              <div className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium">
                Dark
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>Currency</p>
                <p className="text-xs text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Display values in your preferred currency</p>
              </div>
              <div className="flex gap-2">
                {(['USD', 'ETH', 'MNT'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setCurrency(c)
                      saveSetting('currency', c)
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      currency === c
                        ? 'bg-white text-black'
                        : 'bg-[#1E1E2E] text-[#94A3B8] hover:bg-[#2A2A3A]'
                    }`}
                    style={{ fontFamily: 'DM Sans, sans-serif' }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Thresholds */}
        <div className="border border-[#1E1E2E] bg-[#0F2A22] p-8 rounded-xl mb-6">
          <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Risk Thresholds
          </h2>
          <p className="text-xs text-[#94A3B8] mb-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Pools with TVL above these thresholds get colored risk badges.
          </p>
          <div className="space-y-6">
            {/* High TVL */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  High TVL <span className="text-[#10B981]">(safest)</span>
                </p>
                <p className="text-xs text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Green badge threshold</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#94A3B8] text-sm">$</span>
                <input
                  type="number"
                  value={highTVL}
                  onChange={e => {
                    setHighTVL(e.target.value)
                    saveSetting('highTVL', e.target.value)
                  }}
                  className="w-32 bg-[#1E1E2E] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                />
              </div>
            </div>

            {/* Medium TVL */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  Medium TVL <span className="text-[#F59E0B]">(caution)</span>
                </p>
                <p className="text-xs text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Yellow badge threshold</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#94A3B8] text-sm">$</span>
                <input
                  type="number"
                  value={mediumTVL}
                  onChange={e => {
                    setMediumTVL(e.target.value)
                    saveSetting('mediumTVL', e.target.value)
                  }}
                  className="w-32 bg-[#1E1E2E] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Alert Preferences */}
        <div className="border border-[#1E1E2E] bg-[#0F2A22] p-8 rounded-xl mb-6">
          <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Alert Preferences
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>Alert Level</p>
              <p className="text-xs text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Which risk events trigger notifications</p>
            </div>
            <div className="flex gap-2">
              {(['all', 'critical', 'none'] as const).map(a => (
                <button
                  key={a}
                  onClick={() => {
                    setAlertLevel(a)
                    saveSetting('alertLevel', a)
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    alertLevel === a
                      ? 'bg-white text-black'
                      : 'bg-[#1E1E2E] text-[#94A3B8] hover:bg-[#2A2A3A]'
                  }`}
                  style={{ fontFamily: 'DM Sans, sans-serif' }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Rebalance Sensitivity */}
        <div className="border border-[#1E1E2E] bg-[#0F2A22] p-8 rounded-xl mb-6">
          <h2 className="text-sm font-semibold text-[#94A3B8] uppercase tracking-wider mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            Rebalance Sensitivity
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>Delta Threshold</p>
              <p className="text-xs text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>Min yield difference to suggest rebalance</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                value={deltaThreshold}
                onChange={e => {
                  setDeltaThreshold(e.target.value)
                  saveSetting('deltaThreshold', e.target.value)
                }}
                className="w-24 bg-[#1E1E2E] border border-[#2E2E3E] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]"
              />
              <span className="text-[#94A3B8] text-sm">%</span>
            </div>
          </div>
        </div>

        {/* Reset */}
        <div className="flex justify-between items-center pt-4">
          <p className="text-xs text-[#94A3B8]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            All settings are saved locally in your browser.
          </p>
          <button
            onClick={() => {
              setCurrency('USD')
              setHighTVL('1000000')
              setMediumTVL('100000')
              setDeltaThreshold('0.5')
              setAlertLevel('all')

              localStorage.setItem('polymath-currency', 'USD')
              localStorage.setItem('polymath-highTVL', '1000000')
              localStorage.setItem('polymath-mediumTVL', '100000')
              localStorage.setItem('polymath-deltaThreshold', '0.5')
              localStorage.setItem('polymath-alertLevel', 'all')
            }}
            className="text-sm text-[#94A3B8] hover:text-white transition-colors"
            style={{ fontFamily: 'DM Sans, sans-serif' }}
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  )
}