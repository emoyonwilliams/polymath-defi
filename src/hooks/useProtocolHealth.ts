import { useState, useCallback } from 'react'
import { analyzeProtocolRisk, generateHealthInsight, type RiskAssessment } from '../lib/claude'
import { PROTOCOLS } from '../lib/constants'

export interface ProtocolHealthData {
  protocolId: string
  name: string
  assessment: RiskAssessment | null
  isLoading: boolean
  lastUpdated: number | null
}

export const useProtocolHealth = () => {
  const [healthData, setHealthData] = useState<ProtocolHealthData[]>(
    PROTOCOLS.map(p => ({
      protocolId: p.id,
      name: p.name,
      assessment: null,
      isLoading: false,
      lastUpdated: null,
    }))
  )
  const [globalInsight, setGlobalInsight] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastChecked, setLastChecked] = useState<number | null>(null)

  const analyzeAll = useCallback(async () => {
    setIsAnalyzing(true)

    // Show loading state
    setHealthData(prev =>
      prev.map(p => ({ ...p, isLoading: true }))
    )

    const results = await Promise.all(
      PROTOCOLS.map(async (protocol) => {
        try {
          const assessment = await analyzeProtocolRisk(protocol.id)
          return { protocolId: protocol.id, assessment }
        } catch (error) {
          console.error(`Failed to analyze ${protocol.name}`)
          return { protocolId: protocol.id, assessment: null }
        }
      })
    )

    // Update health data
    setHealthData(prev =>
      prev.map(p => {
        const result = results.find(r => r.protocolId === p.protocolId)
        return {
          ...p,
          assessment: result?.assessment || null,
          isLoading: false,
          lastUpdated: Date.now(),
        }
      })
    )

    // Generate global insight
    const validSummaries = results
      .filter(r => r.assessment !== null)
      .map(r => ({
        name: PROTOCOLS.find(p => p.id === r.protocolId)?.name || '',
        riskScore: r.assessment!.riskScore,
        level: r.assessment!.level,
      }))

    if (validSummaries.length > 0) {
      const insight = await generateHealthInsight(validSummaries)
      setGlobalInsight(insight)
    }

    setLastChecked(Date.now())
    setIsAnalyzing(false)
  }, [])

  const analyzeOne = useCallback(async (protocolId: string) => {
    setHealthData(prev =>
      prev.map(p =>
        p.protocolId === protocolId ? { ...p, isLoading: true } : p
      )
    )

    const assessment = await analyzeProtocolRisk(protocolId)

    setHealthData(prev =>
      prev.map(p =>
        p.protocolId === protocolId
          ? { ...p, assessment, isLoading: false, lastUpdated: Date.now() }
          : p
      )
    )
  }, [])

  const getCriticalCount = () =>
    healthData.filter(p => p.assessment?.level === 'critical').length

  const getWarningCount = () =>
    healthData.filter(p => p.assessment?.level === 'high').length

  return {
    healthData,
    globalInsight,
    isAnalyzing,
    lastChecked,
    analyzeAll,
    analyzeOne,
    getCriticalCount,
    getWarningCount,
  }
}