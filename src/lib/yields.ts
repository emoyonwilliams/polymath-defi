// src/lib/yields.ts — Live DeFiLlama Yields Integration (free, no API key)

// DeFiLlama pool IDs mapped to our monitored Mantle protocols
// Discovered via https://yields.llama.fi/pools filtered for chain=mantle
const POOL_ID_MAP: Record<string, string> = {
  mETH: '009b6f09-bfa7-4852-8685-0980d9478419',   // circuit-protocol mETH on Mantle
  USDC: '32cb38a5-b9b9-441a-bf07-8fab47b999d3',   // aave-v3 USDC on Mantle
  USDY: 'b5d7a190-38d2-4fdd-8c14-1fd00c11bce1',   // ondo-yield-assets USDY on Mantle
  USDe: '76b70b33-d8a4-4e61-8092-9bd1f2be2fc9',   // aave-v3 USDe (sUSDe) on Mantle
  FLUX: 'ebec73de-fd1e-4f97-8287-d9cb01c7d352',   // fluxion-network USDC-WMSTRX on Mantle
}

// Fallback APYs used when DeFiLlama is unreachable
const FALLBACK_APYS: Record<string, number> = {
  MNT: 0,
  mETH: 4.8,
  USDC: 3.8,
  MOE: 8.4,
  INIT: 5.5,
  USDY: 5.1,
  USDe: 4.2,
  FLUX: 12.5,
}

/**
 * Fetch live APY data from DeFiLlama for our monitored Mantle pools.
 * Free, no API key required. Returns a map of symbol → current APY.
 * Tokens without a DeFiLlama pool mapping retain their fallback APYs.
 */
export const fetchLiveAPYs = async (): Promise<Record<string, number>> => {
  const apys = { ...FALLBACK_APYS }

  try {
    // Fetch individual pool data for each mapped pool
    const poolIds = Object.entries(POOL_ID_MAP)

    const results = await Promise.allSettled(
      poolIds.map(async ([symbol, poolId]) => {
        const response = await fetch(`https://yields.llama.fi/chart/${poolId}`)
        if (!response.ok) return { symbol, apy: null }
        const json = await response.json()
        // The chart endpoint returns an array of data points, latest is last
        const latest = json.data?.[json.data.length - 1]
        return { symbol, apy: latest?.apy ?? null }
      })
    )

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.apy !== null) {
        apys[result.value.symbol] = Math.round(result.value.apy * 100) / 100
      }
    })

    console.log('Live APYs loaded from DeFiLlama:', apys)
  } catch (error) {
    console.warn('DeFiLlama yields fetch failed, using fallback APYs:', error)
  }

  return apys
}
