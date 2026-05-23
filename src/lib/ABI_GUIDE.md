# ABI Files — Frontend Integration Guide

## Where are the ABI files?

The three compiled ABI files live alongside this guide in `src/lib/`:

```
src/lib/SynapseProtocol.json
src/lib/SynapseToken.json
src/lib/SynapseIPNFT.json
```

If you receive updated ABIs from the contract team, drop the new files into `src/lib/` (replacing the old ones) and update the contract addresses in `.env`.

---

## Do you need to reshare ABIs after recent changes?

| Change made | ABI affected? | Action needed |
|---|---|---|
| `setPopsClearance` internal logic fix | **No** — function signature unchanged | No reshare needed |
| Added getter functions (`getHypothesis`, `getBooking`, etc.) | **Yes** — new read functions added | Already updated in `src/lib/` |
| Added unstake flow (`requestUnstake`, `withdrawUnstake`) | **Yes** | Already updated in `src/lib/` |
| Added `cancelBooking`, `initializeProtocol`, `setIpNftContract` | **Yes** | Already updated in `src/lib/` |
| `IpnftMintedInternal` event added to SynapseIPNFT | **Yes** | Already updated in `src/lib/` |
| New errors: `AlreadyInitialized`, `BookingNotPending`, `CooldownNotElapsed`, etc. | **Yes** | Already updated in `src/lib/` |

---

## How to extract and share ABI arrays (for contract team)

Run this from the contract project root after `forge build`:

```bash
# Extract ABI-only JSON files (no bytecode — safe to ship to frontend)
jq '.abi' out/SynapseProtocol.sol/SynapseProtocol.json > SynapseProtocol.json
jq '.abi' out/SynapseToken.sol/SynapseToken.json       > SynapseToken.json
jq '.abi' out/SynapseIPNFT.sol/SynapseIPNFT.json       > SynapseIPNFT.json
```

Then copy these three `.json` files into `src/lib/` in this repo.

---

## How to use ABIs in the frontend (Viem / wagmi)

```ts
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";

import { SynapseProtocolAbi, SynapseTokenAbi, SynapseIPNFTAbi } from "./contracts";
import { PROTOCOL_ADDRESS, SYNAPSE_TOKEN_ADDRESS, IPNFT_ADDRESS } from "./contracts";

const publicClient = createPublicClient({ chain: base, transport: http() });

// Read a hypothesis (new getter function)
const hypothesis = await publicClient.readContract({
  address: PROTOCOL_ADDRESS,
  abi: SynapseProtocolAbi,
  functionName: "getHypothesis",
  args: [hypothesisKey],
});

// Commit a hypothesis (wallet required)
await walletClient.writeContract({
  address: PROTOCOL_ADDRESS,
  abi: SynapseProtocolAbi,
  functionName: "commitHypothesis",
  args: [{
    shortId:     toHex(shortId, { size: 8 }),
    domain:      1,
    gradeTarget: 0,
    saltedHash:  saltedHash,
  }],
});
```

---

## Key derivation (replaces Solana PDAs)

```ts
import { keccak256, encodePacked } from "viem";

// All four key types are also exported from contracts.js
const hypothesisKey = (author: `0x${string}`, shortId: `0x${string}`) =>
  keccak256(encodePacked(["address", "bytes8"], [author, shortId]));

const labKey = (operator: `0x${string}`, labId: `0x${string}`) =>
  keccak256(encodePacked(["address", "bytes8"], [operator, labId]));

const campaignKey = (lead: `0x${string}`, id: `0x${string}`) =>
  keccak256(encodePacked(["address", "bytes16"], [lead, id]));

const bookingKey = (lKey: `0x${string}`, slotStart: bigint) =>
  keccak256(encodePacked(["bytes32", "int256"], [lKey, slotStart]));
```

---

## Commitment hash (for `commitHypothesis`)

```ts
import { keccak256, encodePacked, toBytes } from "viem";

const salt      = crypto.getRandomValues(new Uint8Array(32));
const plaintext = "My hypothesis text";

const saltedHash = keccak256(
  encodePacked(["bytes", "bytes"], [salt, toBytes(plaintext)])
);
// Store `salt` off-chain — you need it again for `revealHypothesis`
```

---

## New contract functions (added in latest build)

### SynapseProtocol

| Function | Description |
|---|---|
| `getHypothesis(key)` | Returns full `HypothesisRecord` struct |
| `getBooking(key)` | Returns full `BookingRecord` struct |
| `getIpnft(key)` | Returns full `IpnftRecord` struct |
| `getLab(key)` | Returns full `LabRecord` struct |
| `getCampaign(key)` | Returns full `CampaignRecord` with milestones |
| `getStakeRecord(who)` | Returns `StakeRecord` for an operator |
| `initializeProtocol(params)` | One-time init — sets evidenceGrader, treasury, etc. |
| `setIpNftContract(addr)` | Points protocol at the deployed SynapseIPNFT |
| `requestUnstake(amount)` | Starts the unstake cooldown (62093a80 seconds) |
| `withdrawUnstake()` | Withdraw after cooldown — reverts `CooldownNotElapsed` if early |
| `cancelBooking(bKey)` | Cancel a pending booking |

### New revert errors

`AlreadyInitialized` · `BookingNotPending` · `CampaignNotActive` · `CooldownNotElapsed` · `Forbidden` · `InvalidSlotTimes` · `NoPendingUnstake` · `ReentrancyGuardReentrantCall` · `SafeERC20FailedOperation` · `SlotUnavailable` · `TooManyMilestones` · `Unauthorized`

### SynapseIPNFT

New internal event: `IpnftMintedInternal(tokenId indexed, to indexed)` — emitted inside the NFT contract when `mint` is called by the protocol.

---

## Frontend environment variables

```
VITE_PROTOCOL_ADDRESS=0x...
VITE_SYNAPSE_TOKEN_ADDRESS=0x...
VITE_IPNFT_ADDRESS=0x...
VITE_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
VITE_CLUSTER=mainnet
```
