import { ethers } from 'ethers'
import { RISKLOG_CONTRACT_ADDRESS } from './constants'

const RISKLOG_ABI = [
  'function logRisk(address protocol, uint8 riskScore, bytes32 summaryHash) external',
  'function getEntryCount() external view returns (uint256)',
  'function getLatestEntry() external view returns (tuple(address protocol, uint8 riskScore, bytes32 summaryHash, uint256 timestamp))',
  'event RiskLogged(address indexed protocol, uint8 riskScore, bytes32 summaryHash, uint256 timestamp)',
]

export const getRiskLogContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(RISKLOG_CONTRACT_ADDRESS, RISKLOG_ABI, signerOrProvider)
}

export const logRiskOnChain = async (
  signer: ethers.Signer,
  protocolAddress: string,
  riskScore: number,
  summary: string
): Promise<string | null> => {
  try {
    const contract = getRiskLogContract(signer)
    const summaryHash = ethers.keccak256(ethers.toUtf8Bytes(summary))
    const tx = await contract.logRisk(
      protocolAddress,
      Math.min(100, Math.max(0, riskScore)),
      summaryHash
    )
    await tx.wait()
    return tx.hash
  } catch (error) {
    console.error('Failed to log risk on-chain:', error)
    return null
  }
}

export const getOnChainEntryCount = async (): Promise<number> => {
  try {
    const provider = new ethers.JsonRpcProvider(
      import.meta.env.VITE_MANTLE_TESTNET_RPC
    )
    const contract = getRiskLogContract(provider)
    const count = await contract.getEntryCount()
    return Number(count)
  } catch (error) {
    console.error('Failed to get entry count:', error)
    return 0
  }
}