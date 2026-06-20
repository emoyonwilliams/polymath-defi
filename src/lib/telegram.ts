// src/lib/telegram.ts

export interface TelegramAlertConfig {
  botToken: string
  chatId: string
  alertLevel: 'all' | 'critical' | 'none'
}

/**
 * Sends a raw text message to a specific Telegram Chat ID using the provided Bot Token.
 */
export const sendTelegramMessage = async (
  botToken: string,
  chatId: string,
  message: string
): Promise<boolean> => {
  if (!botToken || !chatId) {
    console.warn('Telegram botToken or chatId is missing.')
    return false
  }

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      throw new Error(`Telegram API returned error ${response.status}: ${errText}`)
    }

    return true
  } catch (error) {
    console.error('Failed to send Telegram message:', error)
    return false
  }
}

/**
 * Dispatches a success test alert to verify connection.
 */
export const sendTestAlert = async (botToken: string, chatId: string): Promise<boolean> => {
  const testMessage = `🔔 *Polymath Alert Test Connection* 🔔\n\nSuccess! Your Telegram Bot and Chat ID are correctly configured. You will now receive real-time portfolio alerts from Polymath.`
  return sendTelegramMessage(botToken, chatId, testMessage)
}

/**
 * Scans user balances and checks if any protocol has crossed the risk threshold,
 * dispatching a personalized warning if needed.
 */
export const checkAndSendPortfolioAlerts = async (
  botToken: string,
  chatId: string,
  alertLevel: 'all' | 'critical' | 'none',
  userBalances: Array<{ protocol: string; balance: number }>,
  healthAssessments: Array<{ protocolId: string; name: string; level: 'low' | 'medium' | 'high' | 'critical'; riskScore: number; summary: string }>
): Promise<string[]> => {
  if (!botToken || !chatId || alertLevel === 'none') {
    return []
  }

  const sentAlerts: string[] = []
  const activePositions = userBalances.filter(b => b.balance > 0)

  for (const pos of activePositions) {
    const assessment = healthAssessments.find(a => a.protocolId === pos.protocol)
    if (!assessment) continue

    // Check if the assessment matches the user's alert level criteria
    const shouldAlert =
      alertLevel === 'all' ||
      (alertLevel === 'critical' && assessment.level === 'critical')

    if (shouldAlert) {
      const alertMsg = `🚨 *Polymath Position Risk Alert* 🚨\n\nWe detected a safety shift in a protocol where you hold assets:\n\n• *Protocol:* ${assessment.name}\n• *Current Balance:* ${pos.balance.toFixed(4)}\n• *Risk Score:* ${assessment.riskScore}/100\n• *Risk Status:* ${assessment.level.toUpperCase()}\n\n*Summary:* ${assessment.summary}\n\n👉 [Launch Polymath and Rebalance Now](https://polymath-defi.vercel.app/app/portfolio)`
      
      const success = await sendTelegramMessage(botToken, chatId, alertMsg)
      if (success) {
        sentAlerts.push(assessment.name)
      }
    }
  }

  // Also broadcast to the public channel if configured in the environment
  const channelChatId = import.meta.env.VITE_TELEGRAM_CHANNEL_CHAT_ID
  if (channelChatId) {
    for (const assessment of healthAssessments) {
      if (assessment.level === 'critical' || assessment.level === 'high') {
        const publicMsg = `📢 *Polymath Ecosystem Alert* 📢\n\nProtocol *${assessment.name}* has experienced a risk shift:\n• *Risk Score:* ${assessment.riskScore}/100\n• *Level:* ${assessment.level.toUpperCase()}\n\n*Incident Summary:* ${assessment.summary}`
        await sendTelegramMessage(botToken, channelChatId, publicMsg)
      }
    }
  }

  return sentAlerts
}
