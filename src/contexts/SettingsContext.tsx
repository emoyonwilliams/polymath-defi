import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface SettingsContextType {
  currency: 'USD' | 'ETH' | 'MNT'
  highTVL: number
  mediumTVL: number
  deltaThreshold: number
  alertLevel: 'all' | 'critical' | 'none'
  setCurrency: (currency: 'USD' | 'ETH' | 'MNT') => void
  setHighTVL: (value: number) => void
  setMediumTVL: (value: number) => void
  setDeltaThreshold: (value: number) => void
  setAlertLevel: (level: 'all' | 'critical' | 'none') => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [currency, setCurrency] = useState<'USD' | 'ETH' | 'MNT'>('USD')
  const [highTVL, setHighTVL] = useState(1000000)
  const [mediumTVL, setMediumTVL] = useState(100000)
  const [deltaThreshold, setDeltaThreshold] = useState(0.5)
  const [alertLevel, setAlertLevel] = useState<'all' | 'critical' | 'none'>('all')

  // Load from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('polymath-currency') as 'USD' | 'ETH' | 'MNT' | null
    const savedHigh = localStorage.getItem('polymath-highTVL')
    const savedMedium = localStorage.getItem('polymath-mediumTVL')
    const savedDelta = localStorage.getItem('polymath-deltaThreshold')
    const savedAlert = localStorage.getItem('polymath-alertLevel') as 'all' | 'critical' | 'none' | null

    if (savedCurrency) setCurrency(savedCurrency)
    if (savedHigh) setHighTVL(Number(savedHigh))
    if (savedMedium) setMediumTVL(Number(savedMedium))
    if (savedDelta) setDeltaThreshold(Number(savedDelta))
    if (savedAlert) setAlertLevel(savedAlert)
  }, [])

  // Save to localStorage
  const saveSetting = (key: string, value: any) => {
    localStorage.setItem(`polymath-${key}`, String(value))
  }

  const updateCurrency = (newCurrency: 'USD' | 'ETH' | 'MNT') => {
    setCurrency(newCurrency)
    saveSetting('currency', newCurrency)
  }

  const updateHighTVL = (value: number) => {
    setHighTVL(value)
    saveSetting('highTVL', value)
  }

  const updateMediumTVL = (value: number) => {
    setMediumTVL(value)
    saveSetting('mediumTVL', value)
  }

  const updateDelta = (value: number) => {
    setDeltaThreshold(value)
    saveSetting('deltaThreshold', value)
  }

  const updateAlert = (level: 'all' | 'critical' | 'none') => {
    setAlertLevel(level)
    saveSetting('alertLevel', level)
  }

  return (
    <SettingsContext.Provider value={{
      currency, highTVL, mediumTVL, deltaThreshold, alertLevel,
      setCurrency: updateCurrency,
      setHighTVL: updateHighTVL,
      setMediumTVL: updateMediumTVL,
      setDeltaThreshold: updateDelta,
      setAlertLevel: updateAlert,
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