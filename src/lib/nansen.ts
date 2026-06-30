// src/lib/nansen.ts — Nansen Smart Money Intelligence (credit-efficient, aggressively cached)

const NANSEN_API_KEY = import.meta.env.VITE_NANSEN_API_KEY || ''
const NANSEN_API_BASE = 'https://api.nansen.ai/api/v1'

export interface SmartMoneySignal {
  symbol: string
  chain: string
  sector: string
  valueUsd: number
  holdersCount: number
  change24h: number
  marketCap: number
}

// 12-hour cache duration for Nansen credits protection
const CACHE_DURATION_MS = 12 * 60 * 60 * 1000 // 12 hours
const LOCAL_STORAGE_KEY = 'polymath_nansen_cache'

// High-fidelity mock response used during localhost development to preserve API credits
const MOCK_NANSEN_SIGNALS: SmartMoneySignal[] = [
  {
    symbol: 'ONDO',
    chain: 'ethereum',
    sector: 'RWAs',
    valueUsd: 94776578.55,
    holdersCount: 15,
    change24h: 0.0,
    marketCap: 1555223329.0
  },
  {
    symbol: 'ENA',
    chain: 'ethereum',
    sector: 'Stablecoin Issuers',
    valueUsd: 9354279.11,
    holdersCount: 13,
    change24h: 0.0,
    marketCap: 736789091.0
  },
  {
    symbol: 'WMNT',
    chain: 'mantle',
    sector: 'L1/L2 Token & Derivatives',
    valueUsd: 920.45,
    holdersCount: 1,
    change24h: 0.0,
    marketCap: 6754486.0
  }
]

/**
 * Fetch smart money holdings for Mantle and Ethereum chains.
 * Protects user credits by:
 * 1. Returning static high-fidelity mocks when testing on localhost.
 * 2. Caching live production responses in localStorage for 12 hours.
 */
export const fetchSmartMoneySignals = async (): Promise<SmartMoneySignal[]> => {
  // Safeguard 1: Preserving credits during development/testing
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  if (isLocalhost) {
    console.log('Nansen API: Localhost detected. Returning mock signals to preserve credits.')
    return MOCK_NANSEN_SIGNALS
  }

  if (!NANSEN_API_KEY) {
    console.log('No Nansen API key found — skipping smart money signals')
    return []
  }

  // Safeguard 2: 12-hour persistence caching
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      const age = Date.now() - parsed.timestamp
      if (age < CACHE_DURATION_MS) {
        console.log(`Nansen API: Returning cached data (${Math.round(age / 60000)} min old)`)
        return parsed.signals
      }
    }
  } catch (e) {
    console.warn('Failed to parse Nansen localStorage cache', e)
  }

  try {
    console.log('Nansen API: Cache miss / expired. Fetching live smart money signals...')
    const response = await fetch(`${NANSEN_API_BASE}/smart-money/holdings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': NANSEN_API_KEY,
      },
      body: JSON.stringify({
        chains: ['mantle', 'ethereum'],
        pagination: { limit: 20 },
      }),
    })

    if (!response.ok) {
      console.warn(`Nansen API error (${response.status}): ${await response.text()}`)
      return []
    }

    const json = await response.json()
    const data = json.data || []

    const signals: SmartMoneySignal[] = data.map((item: any) => ({
      symbol: item.token_symbol || 'Unknown',
      chain: item.chain || 'unknown',
      sector: item.token_sectors?.[0] || 'Uncategorized',
      valueUsd: item.value_usd || 0,
      holdersCount: item.holders_count || 0,
      change24h: item.balance_24h_percent_change || 0,
      marketCap: item.market_cap_usd || 0,
    }))

    // Save to cache
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
        timestamp: Date.now(),
        signals
      }))
    } catch (e) {
      console.warn('Failed to save Nansen cache to localStorage', e)
    }

    return signals
  } catch (error) {
    console.warn('Nansen smart money fetch failed:', error)
    return []
  }
}
