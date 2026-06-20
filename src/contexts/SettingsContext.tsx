import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type Currency = 'USD' | 'ETH' | 'MNT'
type AlertLevel = 'all' | 'critical' | 'none'
type Theme = 'dark' | 'light'

interface Settings {
  currency: Currency
  theme: Theme
  highTVL: string
  mediumTVL: string
  deltaThreshold: string
  alertLevel: AlertLevel
  telegramChatId: string
  enableTelegram: boolean
}

interface SettingsContextType extends Settings {
  setCurrency: (c: Currency) => void
  setTheme: (t: Theme) => void
  setHighTVL: (v: string) => void
  setMediumTVL: (v: string) => void
  setDeltaThreshold: (v: string) => void
  setAlertLevel: (a: AlertLevel) => void
  setTelegramChatId: (id: string) => void
  setEnableTelegram: (enabled: boolean) => void
  resetToDefaults: () => void
}

const SettingsContext = createContext<SettingsContextType | null>(null)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>({
    currency: 'USD',
    theme: 'dark',
    highTVL: '1000000',
    mediumTVL: '100000',
    deltaThreshold: '0.5',
    alertLevel: 'all',
    telegramChatId: '',
    enableTelegram: false,
  })

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('polymath-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Ensure defaults are merged in case older localStorage version exists
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (e) {
        console.warn('Failed to parse settings from localStorage', e)
      }
    }
  }, [])

  // Save & Apply Theme
  useEffect(() => {
    localStorage.setItem('polymath-settings', JSON.stringify(settings))
    
    if (settings.theme === 'light') {
      document.documentElement.classList.add('light')
    } else {
      document.documentElement.classList.remove('light')
    }
  }, [settings])

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const resetToDefaults = () => {
    const defaults: Settings = {
      currency: 'USD',
      theme: 'dark',
      highTVL: '1000000',
      mediumTVL: '100000',
      deltaThreshold: '0.5',
      alertLevel: 'all',
      telegramChatId: '',
      enableTelegram: false,
    }
    setSettings(defaults)
  }

  return (
    <SettingsContext.Provider value={{
      ...settings,
      setCurrency: (c) => updateSetting('currency', c),
      setTheme: (t) => updateSetting('theme', t),
      setHighTVL: (v) => updateSetting('highTVL', v),
      setMediumTVL: (v) => updateSetting('mediumTVL', v),
      setDeltaThreshold: (v) => updateSetting('deltaThreshold', v),
      setAlertLevel: (a) => updateSetting('alertLevel', a),
      setTelegramChatId: (id) => updateSetting('telegramChatId', id),
      setEnableTelegram: (enabled) => updateSetting('enableTelegram', enabled),
      resetToDefaults,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used within SettingsProvider')
  return context
}