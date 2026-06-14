import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { ethers } from 'ethers'
import { connectWallet, switchToMantle } from '../lib/mantle'

interface WalletState {
  address: string | null
  isConnected: boolean
  chainId: number | null
  balance: string | null
  signer: ethers.Signer | null
}

interface WalletContextType extends WalletState {
  isConnecting: boolean
  error: string | null
  connect: () => Promise<void>
  disconnect: () => void
  formatAddress: (address: string) => string
}

const WalletContext = createContext<WalletContextType | null>(null)

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
    balance: null,
    signer: null,
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const savedAddress = localStorage.getItem('polymath_wallet_address')
    if (savedAddress && window.ethereum) {
      reconnect()
    }
  }, [])

  const reconnect = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.listAccounts()
      if (accounts.length > 0) {
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        const network = await provider.getNetwork()
        const balance = await provider.getBalance(address)
        setWallet({
          address,
          isConnected: true,
          chainId: Number(network.chainId),
          balance: ethers.formatEther(balance),
          signer,
        })
      }
    } catch (err) {
      localStorage.removeItem('polymath_wallet_address')
    }
  }

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
        signer: result.signer,
      })
      localStorage.setItem('polymath_wallet_address', result.address)
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setWallet({ address: null, isConnected: false, chainId: null, balance: null, signer: null })
    localStorage.removeItem('polymath_wallet_address')
    setError(null)
  }, [])

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

  return (
    <WalletContext.Provider value={{ ...wallet, isConnecting, error, connect, disconnect, formatAddress }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWalletContext = () => {
  const context = useContext(WalletContext)
  if (!context) throw new Error('useWalletContext must be used within WalletProvider')
  return context
}