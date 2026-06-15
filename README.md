# Polymath

### Total risk clarity for Mantle DeFi.

Polymath is a real-time risk intelligence dashboard for Mantle Network. It unifies on-chain smart contract risk and off-chain institutional risk across Mantle's leading DeFi protocols into a single, AI-powered view — with every risk assessment logged permanently on-chain for transparency and auditability.

Built for the **Mantle Turing Test Hackathon 2026** — AI x RWA track.

**Live app:** https://polymath-defi.vercel.app/

---

## The Problem

Mantle's DeFi ecosystem spans liquid staking (mETH), lending (Aave V3, INIT Capital), DEXs (Merchant Moe, Agni Finance), derivatives (Fluxion), and real-world asset protocols (Ondo's USDY, Ethena's USDe). Each carries a distinct risk profile, but no dashboard unifies them.

Existing portfolio trackers show yield. None on Mantle combine:

- On-chain smart contract risk — liquidation thresholds, utilization rates, oracle health
- Off-chain institutional risk — T-bill backing, custodian status, RWA collateral quality
- AI-generated risk summaries logged immutably on-chain

Polymath fills that gap.

---

## What Polymath Does

**Dashboard** — Your Mantle DeFi positions at a glance: net worth, yield earned, average APY, active protocols, and live network stats (block height, gas price).

**Health** — Real-time AI risk analysis across 8 monitored protocols. Each gets a risk score (0–100), risk level, key signals, and a recommendation. Assessments can be logged on-chain via the deployed RiskLog contract.

**Portfolio** — Full asset breakdown: balances, APY, value, individual risk scores, and a liquidity timeline showing instant vs. 7-day bridge withdrawal windows.

**Agent** — AI copilot for Mantle DeFi. Ask about your positions, compare yields across protocols, and get rebalancing suggestions grounded in real-time risk data.

**Rewards** — Track yield earned over time, claimable rewards, and ecosystem campaign progress.

**Governance** — Live Mantle governance proposals (MIPs), treasury size, and voting power — connecting governance activity directly to personal risk exposure.

**Settings** — Wallet and preference management.

---

## On-Chain Risk Logging

Every AI risk assessment can be permanently logged to Mantle Sepolia via a custom smart contract:

**Contract:** `RiskLog.sol`
**Address:** `0x4a182a0CfCC7f8A6D0c1766e71F7D51F3E1c90c6`
**Network:** Mantle Sepolia Testnet (Chain ID 5003)

```solidity
function logRisk(address protocol, uint8 riskScore, bytes32 summaryHash)
function getEntryCount()
function getLatestEntry()
```

This makes risk assessments auditable and tamper-proof — anyone can verify what Polymath flagged, and when, directly on-chain.

---

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Wallet:** ethers.js, with global wallet context that persists connection across routes and sessions
- **Routing:** react-router-dom
- **Smart Contract:** Solidity, deployed via Remix to Mantle Sepolia
- **Risk Intelligence:** Powered by Nansen AI
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
```

---

## Links

- **Live App:** https://polymath-defi.vercel.app/
- **X:** https://x.com/polymath_defi
- **Discord:** https://discord.gg/xPhm5wGF
- **Telegram:** https://t.me/polymathdefi

---

## License

MIT

---

Built with belief in Mantle's RWA-native future.