import { useState, useCallback } from 'react'
import { ethers } from 'ethers'
import { connectWallet, switchToMantle } from '../lib/mantle'
import type { WalletState } from '../types'

const initialState: WalletState = {
  address: null,
  isConnected: false,
  chainId: null,
  balance: null,
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>(initialState)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)

  const connect = useCallback(async () => {
    setIsConnecting(true)
    setError(null)
    try {
      await switchToMantle()
      const result = await connectWallet()
      setWallet({
        address: result.address,
        isConnected: true,
        chainId: result.chainId,
        balance: result.balance,
      })
      setSigner(result.signer)
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setWallet(initialState)
    setSigner(null)
    setError(null)
  }, [])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return {
    wallet,
    signer,
    isConnecting,
    error,
    connect,
    disconnect,
    formatAddress,
  }
}