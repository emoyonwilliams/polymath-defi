import { ethers } from 'ethers'
import { MANTLE_RPC, MANTLE_TESTNET_RPC } from './constants'

export const getProvider = (testnet = false) => {
  return new ethers.JsonRpcProvider(testnet ? MANTLE_TESTNET_RPC : MANTLE_RPC)
}

export const getWalletProvider = async () => {
  if (!window.ethereum) throw new Error('No wallet found')
  await window.ethereum.request({ method: 'eth_requestAccounts' })
  return new ethers.BrowserProvider(window.ethereum)
}

export const connectWallet = async () => {
  const provider = await getWalletProvider()
  const signer = await provider.getSigner()
  const address = await signer.getAddress()
  const network = await provider.getNetwork()
  const balance = await provider.getBalance(address)
  return {
    address,
    chainId: Number(network.chainId),
    balance: ethers.formatEther(balance),
    signer,
  }
}

export const getMantleStats = async () => {
  try {
    const provider = getProvider(true) // Query Sepolia Testnet stats
    const blockNumber = await provider.getBlockNumber()
    const feeData = await provider.getFeeData()
    return {
      blockNumber,
      gasPrice: feeData.gasPrice 
        ? ethers.formatUnits(feeData.gasPrice, 'gwei') 
        : '0',
    }
  } catch (error) {
    console.error('Failed to fetch Mantle stats:', error)
    return { blockNumber: 0, gasPrice: '0' }
  }
}

export const switchToMantle = async () => {
  if (!window.ethereum) throw new Error('No wallet found')
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x138b' }], // Chain ID 5003 (hex: 0x138b) for Mantle Sepolia
    })
  } catch (error: any) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x138b',
          chainName: 'Mantle Sepolia',
          nativeCurrency: { name: 'MNT', symbol: 'MNT', decimals: 18 },
          rpcUrls: [MANTLE_TESTNET_RPC],
          blockExplorerUrls: ['https://explorer.sepolia.mantle.xyz'],
        }],
      })
    }
  }
}