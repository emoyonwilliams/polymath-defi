import { useState } from 'react'
import { useSettings } from '../contexts/SettingsContext'
import { Sun, Moon } from 'lucide-react'
import { sendTestAlert } from '../lib/telegram'

export const Settings = () => {
  const {
    currency, setCurrency,
    theme, setTheme,
    highTVL, setHighTVL,
    mediumTVL, setMediumTVL,
    deltaThreshold, setDeltaThreshold,
    alertLevel, setAlertLevel,
    telegramChatId, setTelegramChatId,
    enableTelegram, setEnableTelegram,
    resetToDefaults,
  } = useSettings()

  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [testFeedback, setTestFeedback] = useState('')

  const handleSendTestAlert = async () => {
    const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN
    if (!token) {
      setTestStatus('error')
      setTestFeedback('Missing VITE_TELEGRAM_BOT_TOKEN in environment (.env)')
      return
    }
    if (!telegramChatId) {
      setTestStatus('error')
      setTestFeedback('Please enter your Telegram Chat ID first.')
      return
    }

    setTestStatus('sending')
    setTestFeedback('')
    try {
      const success = await sendTestAlert(token, telegramChatId)
      if (success) {
        setTestStatus('success')
        setTestFeedback('Test alert sent! Check your Telegram channel or direct messages.')
      } else {
        setTestStatus('error')
        setTestFeedback('Failed to send alert. Verify Chat ID and Bot Token.')
      }
    } catch (err) {
      setTestStatus('error')
      setTestFeedback('An unexpected error occurred during test dispatch.')
    }
  }

  return (
    <div className="text-[#F8FAFC]">
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-8">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-light tracking-tight mb-2" style={{ fontFamily: 'Lora, serif' }}>
            Settings
          </h1>
          <p className="text-[#94A3B8] text-sm md:text-base font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Customize thresholds and preferences. Changes apply app-wide.
          </p>
        </div>

        {/* Display */}
        <div className="border border-white/[0.04] bg-[#0E111A]/40 p-6 md:p-8 rounded-2xl shadow-xl mb-6">
          <h2 className="text-xs font-semibold tracking-wider text-[#64748B] uppercase mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Display
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Theme</p>
                <p className="text-xs text-[#64748B] font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>Dark or Light mode</p>
              </div>
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 text-[#94A3B8] hover:text-[#F8FAFC] transition-all duration-200"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span className="capitalize">{theme}</span>
              </button>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Currency</p>
                <p className="text-xs text-[#64748B] font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>Display values in your preferred currency</p>
              </div>
              <div className="flex gap-1.5 bg-[#080A10]/60 settings-pill-container p-1 border border-white/[0.05] rounded-xl">
                {(['USD', 'ETH', 'MNT'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currency === c 
                        ? 'bg-[#F8FAFC] text-black shadow-md' 
                        : 'text-[#64748B] hover:text-[#F8FAFC] hover:bg-white/[0.02]'
                    }`}
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Risk Thresholds */}
        <div className="border border-white/[0.04] bg-[#0E111A]/40 p-6 md:p-8 rounded-2xl shadow-xl mb-6">
          <h2 className="text-xs font-semibold tracking-wider text-[#64748B] uppercase mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Risk Thresholds
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>High TVL (Safest)</p>
                <p className="text-xs text-[#64748B] font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>Green badge threshold</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#64748B] text-sm font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>$</span>
                <input
                  type="number"
                  value={highTVL}
                  onChange={(e) => setHighTVL(e.target.value)}
                  className="w-32 bg-[#080A10]/60 border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]/50 transition-colors font-light"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Medium TVL (Caution)</p>
                <p className="text-xs text-[#64748B] font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>Yellow badge threshold</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#64748B] text-sm font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>$</span>
                <input
                  type="number"
                  value={mediumTVL}
                  onChange={(e) => setMediumTVL(e.target.value)}
                  className="w-32 bg-[#080A10]/60 border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]/50 transition-colors font-light"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rebalance & Alerts */}
        <div className="border border-white/[0.04] bg-[#0E111A]/40 p-6 md:p-8 rounded-2xl shadow-xl mb-6">
          <h2 className="text-xs font-semibold tracking-wider text-[#64748B] uppercase mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Rebalance & Alerts
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Delta Threshold</p>
                <p className="text-xs text-[#64748B] font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>Min yield difference to suggest rebalance</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={deltaThreshold}
                  onChange={(e) => setDeltaThreshold(e.target.value)}
                  className="w-24 bg-[#080A10]/60 border border-white/[0.05] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#10B981]/50 transition-colors font-light"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                />
                <span className="text-[#64748B] text-sm font-semibold" style={{ fontFamily: 'Outfit, sans-serif' }}>%</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Alert Level</p>
                <p className="text-xs text-[#64748B] font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>Which risk events trigger notifications</p>
              </div>
              <div className="flex gap-1.5 bg-[#080A10]/60 settings-pill-container p-1 border border-white/[0.05] rounded-xl">
                {(['all', 'critical', 'none'] as const).map(a => (
                  <button
                    key={a}
                    onClick={() => setAlertLevel(a)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${
                      alertLevel === a 
                        ? 'bg-[#F8FAFC] text-black shadow-md' 
                        : 'text-[#64748B] hover:text-[#F8FAFC] hover:bg-white/[0.02]'
                    }`}
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Telegram Alerts Integration */}
        <div className="border border-white/[0.04] bg-[#0E111A]/40 p-6 md:p-8 rounded-2xl shadow-xl mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-[#10B981] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg">notifications_active</span>
            </div>
            <h2 className="text-xs font-semibold tracking-wider text-[#64748B] uppercase" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Telegram Alerts Integration
            </h2>
          </div>
          
          <p className="text-xs text-[#94A3B8] font-light leading-relaxed mb-6" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Receive instant, personalized notifications on Telegram when a protocol you hold assets in crosses your designated risk threshold.
          </p>

          <div className="space-y-6">
            {/* Steps Guide */}
            <div className="bg-[#080A10]/60 telegram-setup-box p-4 rounded-xl border border-white/[0.03] space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'Outfit, sans-serif' }}>Setup Guide</h4>
              <ol className="list-decimal pl-4 space-y-1 text-[11px] text-[#64748B] font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <li>Open Telegram and search for <a href="https://t.me/polymath_alerts_bot" target="_blank" rel="noopener noreferrer" className="text-[#10B981] underline hover:text-emerald-100">@polymath_alerts_bot</a> (or your custom bot).</li>
                <li>Send the command <code className="bg-[#0E111A] text-white px-1.5 py-0.5 rounded text-[10px]">/start</code> to retrieve your personal Chat ID.</li>
                <li>Copy the numeric Chat ID, paste it below, and toggle alerts to active.</li>
              </ol>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Enable Personal Alerts</p>
                <p className="text-xs text-[#64748B] font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>Toggle DM notifications on or off</p>
              </div>
              <button
                onClick={() => setEnableTelegram(!enableTelegram)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  enableTelegram ? 'bg-[#10B981]' : 'bg-white/[0.08]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enableTelegram ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Telegram Chat ID</p>
                <p className="text-xs text-[#64748B] font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>Your numeric user identifier</p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 987654321"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="w-40 bg-[#080A10]/60 border border-white/[0.05] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#10B981]/50 transition-colors font-light"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                />
                <button
                  onClick={handleSendTestAlert}
                  disabled={testStatus === 'sending'}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] text-[#94A3B8] hover:text-[#F8FAFC] disabled:opacity-50"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {testStatus === 'sending' ? 'Sending...' : 'Test Connection'}
                </button>
              </div>
            </div>

            {testFeedback && (
              <div className={`p-3.5 rounded-xl border text-xs font-light flex items-center gap-2 ${
                testStatus === 'success' 
                  ? 'border-emerald-500/10 bg-emerald-950/10 text-emerald-400' 
                  : 'border-red-500/10 bg-red-950/10 text-red-400'
              }`} style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span className="material-symbols-outlined text-base">
                  {testStatus === 'success' ? 'check_circle' : 'error'}
                </span>
                {testFeedback}
              </div>
            )}
          </div>
        </div>

        {/* Reset */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/[0.03]">
          <p className="text-xs text-[#64748B] font-light" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Settings saved locally. Changes apply across the app.
          </p>
          <button
            onClick={resetToDefaults}
            className="text-xs font-bold text-[#94A3B8] hover:text-[#F8FAFC] border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] hover:border-white/10 px-4 py-2.5 rounded-full transition-all duration-200"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  )
}