# Synapse Protocol — Frontend

Physical AI infrastructure on Base. Synapse is the on-chain intelligence and attestation layer for drones, ground robots, humanoids and autonomous vehicles — unifying aerial telemetry attestation, a robotic training data marketplace, a hypothesis market for robotics R&D, and an autonomous agent fleet under one Web4 protocol with Proof-of-Physical-Work (PoPW).

---

## Overview

| Layer | What it does |
|---|---|
| **ATL Hypothesis Market** | Operators commit a salted `keccak256` hypothesis on Base before any mission. Post-mission reveal + evidence grading unlocks an IP-NFT. |
| **Proof-of-Physical-Work** | Every data package is signed with a hardware fingerprint, GPS-anchored and timestamped on Base. Fraudulent operators are slashed on-chain. |
| **IP-NFT Ecosystem** | Grade A/B verified results mint an ERC-721 + ERC-2981 royalty NFT via `SynapseIPNFT`. Tradeable on OpenSea / Blur with on-chain patent filing. |
| **Robotic Lab Network** | Operators book lab time via `bookLab` (USDC + SYNAPSE). Results stored on-chain; milestone funding released by `releaseMilestoneFunds`. |
| **BioLLM Marketplace** | On-chain routing of inference revenue (70 / 30 operator / treasury) and data query revenue (80 / 20 contributor / treasury). |
| **Autonomous Agent Fleet** | Verified agents registered on-chain; fleet coordination via the Synapse agent console. |

---

## Smart Contracts (Base Mainnet)

| Contract | Description |
|---|---|
| `SynapseProtocol` | Core protocol: hypothesis lifecycle, lab booking, PoPW, IP-NFT mint, staking, campaigns, revenue routing |
| `SynapseToken` | SYNAPSE ERC-20 (6 decimals) — burned on every protocol action |
| `SynapseIPNFT` | ERC-721 + ERC-2981 — minted only by the protocol contract on Grade A/B verified results |

### Token Economy

- `commitHypothesis` → burns **10 SYNAPSE**
- PoPW verification → burns **2 SYNAPSE** per package
- IP-NFT mint → burns **50 SYNAPSE** (50% to stakers)
- Inference revenue → **70%** operator / **30%** treasury
- Data query revenue → **80%** contributor / **20%** treasury

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Chain | Base Mainnet (Chain ID 8453) |
| Wallet | wagmi v3 + viem — MetaMask, Coinbase Wallet |
| Styling | Tailwind CSS |
| Animation | GSAP + ScrollTrigger |
| Icons | Iconify |
| Notifications | Sonner |

---

## Project Structure

```
src/
  components/       # Shared UI — GlobalHeader, Footer, Hero, Features, FAQ, etc.
  pages/            # Route pages — Protocol, HypothesisLab, Labs, IPNFT, etc.
  lib/
    wagmi.js        # wagmi config — Base mainnet, injected + Coinbase connectors
    contracts.js    # Contract addresses, ABIs, basescan helpers
    api.js          # REST API helpers
SynapseProtocol.json  # Main contract ABI
SynapseToken.json     # SYNAPSE ERC-20 ABI
SynapseIPNFT.json     # IP-NFT ERC-721 ABI
```

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Fill in contract addresses and RPC URL

# Start dev server
pnpm dev
```

### Environment variables

```
VITE_BASE_RPC_URL=https://mainnet.base.org
VITE_PROTOCOL_ADDRESS=0x...
VITE_SYNAPSE_TOKEN_ADDRESS=0x...
VITE_IPNFT_ADDRESS=0x...
VITE_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
VITE_CLUSTER=mainnet
```

---

## Key Protocol Flows

### ATL Hypothesis Commit-Reveal

```
1. operator calls commitHypothesis(shortId, domain, gradeTarget, keccak256(salt + plaintext))
   → burns 10 SYNAPSE via burnFrom
   → emits EvtHypothesisCommitted

2. mission executes on hardware

3. operator calls revealHypothesis(shortId, salt, plaintext)
   → contract recomputes hash; reverts with HashMismatch if wrong

4. evidenceGrader calls setHypothesisGrade(hypKey, grade)
   → emits EvtHypothesisGraded

5. Grade A/B → mintIpnft → SynapseIPNFT.mint(to, tokenId, uri, royaltyBps)
   → burns 50 SYNAPSE; reverts with GradeInsufficient below Grade B
```

### PoPS Biosafety Shield

```
setPopsClearance(hypothesisKey, cleared)
  → PopsShieldFlagged  — blocked, biosafety risk detected
  → PopsShieldPending  — scan still running, hypothesis gated
```

---

## Partner Integrations

- **Flypraxis** — drone feed intelligence layer; ATL attestation makes detections IP-monetisable
- **ROBA Labs** — open robotics platform; operators earn SYNAPSE for verified training data
- **Kalder Systems** — OFAC-compliant defense ATL with ZK geofence proofs

---

## License

Confidential & Proprietary — Synapse Protocol · v1.0.0 · 2026
