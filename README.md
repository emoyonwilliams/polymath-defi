# Polymath

### Total risk clarity for Mantle DeFi.

Polymath is a real-time risk intelligence dashboard for Mantle Network. It unifies on-chain smart contract risk, Pyth-backed oracle health, and off-chain institutional backing across Mantle's leading DeFi protocols into a single view—grounded in structured Gemini 2.0 Flash AI telemetry, with every risk assessment logged permanently on-chain for transparency and auditability.

Built for the **Mantle Turing Test Hackathon 2026** — AI x RWA track.

**Live app:** https://polymath-defi.vercel.app/

---

## The Problem

Mantle's DeFi ecosystem spans liquid staking (mETH), lending (Aave V3, INIT Capital), DEXs (Merchant Moe, Agni Finance), derivatives (Fluxion), and real-world asset protocols (Ondo's USDY, Ethena's USDe). Each carries a distinct risk profile, but no dashboard unifies them.

Existing portfolio trackers show yield. None on Mantle combine:
- **On-chain smart contract risk** — liquidation thresholds, utilization rates, oracle health
- **Real-Time Price Feeds** — Pyth Hermes APIs scaling asset valuations
- **Off-chain institutional risk** — T-bill backing, custodian status, RWA collateral quality
- **AI-generated risk telemetry** — structured assessments logged immutably on-chain
- **Automated Alerts** — Telegram Bot alerts tailored to the user's specific portfolio holdings

Polymath fills that gap.

---

## What Polymath Does

- **Dashboard** — Your Mantle DeFi positions at a glance: net worth, yield earned, average APY, active protocols, and live network stats (block height, gas price). Scale your balances dynamically across alternative base currencies ($USD, $ETH, $MNT) using real-time Pyth price feeds.
- **Health** — Real-time risk analysis across 8 monitored protocols powered by **Gemini 2.0 Flash**. Each gets a risk score (0–100), risk level, key warning signals, and actionable recommendation. Click to log any assessment hash permanently on-chain via the deployed `RiskLog` contract.
- **Portfolio** — Full asset breakdown: balances, APY, value, individual risk scores, and a liquidity timeline showing instant vs. 7-day bridge withdrawal windows.
- **Agent** — AI copilot for Mantle DeFi. Chat with an LLM agent that has full, context-aware query access to your wallet balances and yields. Get rebalancing suggestions grounded in real-time risk data.
- **Rewards** — Track yield earned over time, claimable rewards (with on-chain claim triggers), and campaign progress.
- **Governance** — Live Mantle governance proposals loaded dynamically via the **Snapshot Hub GraphQL API**, treasury size, and voting power.
- **Telegram Alerts** — Set up your personal Telegram Chat ID in the app. Polymath scans your portfolio and automatically DMs you warning signals if a protocol you have assets in breaches your risk thresholds. It also broadcasts critical warnings directly to the public `@polymathdefi` channel.
- **Resources & B2B Pricing** — Clean in-app tabbed panel detailing the B2B sustainability architecture (Protocol Listing Registries, 0.05% Yield Rebalancing Router Fees, and Institutional Treasury Dashboards).

---

## On-Chain Risk Logging

Every AI risk assessment is hashed and permanently logged to Mantle Sepolia via a custom registry smart contract:

- **Contract:** `RiskLog.sol`
- **Address:** `0x4a182a0CfCC7f8A6D0c1766e71F7D51F3E1c90c6`
- **Network:** Mantle Sepolia Testnet (Chain ID 5003)

```solidity
function logRisk(address protocol, uint8 riskScore, bytes32 summaryHash)
function getEntryCount()
function getLatestEntry()
```

This makes risk assessments auditable and tamper-proof—anyone can verify what Polymath flagged, and when, directly on-chain.

---

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Vanilla CSS (Glassmorphism & premium HSL dark-mode theme)
- **Wallet & Chain Interaction:** Ethers.js (v6) + tanstack-query
- **Risk Telemetry & Agent AI:** Gemini 2.0 Flash API (enforcing strict JSON output parsing schemas)
- **Asset Valuations:** Pyth Network Hermes API (dynamic spot price conversions)
- **Governance Feed:** Snapshot Hub GraphQL API
- **Alert System:** Telegram Bot API
- **Deployment:** Vercel

---

## Protocols Monitored

| Protocol | Type | Risk Surface |
|---|---|---|
| mETH | Liquid Staking | On-chain + Bridge |
| Aave V3 | Lending | On-chain |
| Merchant Moe | DEX | On-chain |
| Agni Finance | DEX | On-chain |
| INIT Capital | Money Market | On-chain |
| Fluxion | Derivatives | On-chain |
| USDY (Ondo) | RWA | Off-chain + On-chain |
| USDe (Ethena) | Synthetic | Off-chain + On-chain |

---

## Running Locally

```bash
git clone https://github.com/emoyonwilliams/polymath-defi.git
cd polymath-defi
npm install
npm run dev
```

### Create a `.env` file in the root:

```env
VITE_MANTLE_RPC=https://rpc.mantle.xyz
VITE_MANTLE_TESTNET_RPC=https://rpc.sepolia.mantle.xyz
VITE_RISKLOG_CONTRACT_ADDRESS=0x4a182a0CfCC7f8A6D0c1766e71F7D51F3E1c90c6
VITE_NANSEN_API_KEY=nsn_5ce56db9ceb03d27b437d55f02a9e308

# Gemini API key (starts with AQ...)
VITE_GEMINI_API_KEY=your_gemini_api_key

# Telegram Alerts Configuration
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VITE_TELEGRAM_CHANNEL_CHAT_ID=@polymathdefi
```

---

## Links

- **Live App:** https://polymath-defi.vercel.app/
- **Substack Blog:** https://polymathdefi.substack.com/p/total-risk-clarity?r=8mp3mp
- **X / Twitter:** https://x.com/polymath_defi
- **Discord:** https://discord.gg/xPhm5wGF
- **Telegram Channel:** https://t.me/polymathdefi

---

## License

MIT

---

Built with belief in Mantle's RWA-native future.