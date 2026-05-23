import { keccak256, encodePacked, toBytes, toHex, parseUnits, erc20Abi } from 'viem';
import { writeContract, waitForTransactionReceipt, readContract } from '@wagmi/core';
import { wagmiConfig } from './wagmi';
import SynapseProtocolJson from './SynapseProtocol.json';
import SynapseTokenJson from './SynapseToken.json';
import SynapseIPNFTJson from './SynapseIPNFT.json';

export const SynapseProtocolAbi = SynapseProtocolJson.abi;
export const SynapseTokenAbi    = SynapseTokenJson.abi;
export const SynapseIPNFTAbi    = SynapseIPNFTJson.abi;

export const PROTOCOL_ADDRESS      = import.meta.env.VITE_PROTOCOL_ADDRESS      || '0x';
export const SYNAPSE_TOKEN_ADDRESS = import.meta.env.VITE_SYNAPSE_TOKEN_ADDRESS || '0x';
export const IPNFT_ADDRESS         = import.meta.env.VITE_IPNFT_ADDRESS         || '0x';
// Base mainnet USDC
export const USDC_ADDRESS          = import.meta.env.VITE_USDC_ADDRESS || '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

export const CLUSTER = import.meta.env.VITE_CLUSTER || 'mainnet';

export const ONE_SYNAPSE = 1_000_000n;
export const ONE_USDC    = 1_000_000n;
export const COMMIT_COST = parseUnits('10', 6);
export const MINT_COST   = parseUnits('50', 6);

export const GRADE = { A: 0, B: 1, C: 2, D: 3, X: 4, NONE: 0xff };
const DOMAIN_LABELS = ['Drug Discovery', 'Neuroscience', 'Materials', 'SynBio', 'Climate', 'Robotics'];
export const domainIndex = (label) => {
  const idx = DOMAIN_LABELS.indexOf(label);
  return idx >= 0 ? idx : 0;
};

export const isContractDeployed = (addr) =>
  !!addr && addr.startsWith('0x') && addr.length === 42;

export function basescanAccount(address) {
  return `https://basescan.org/address/${address}`;
}
export function basescanTx(hash) {
  return `https://basescan.org/tx/${hash}`;
}

// keccak256 commit-reveal hash (salt + plaintext)
export function saltedHash(salt, plaintext) {
  return keccak256(encodePacked(['bytes', 'bytes'], [salt, toBytes(plaintext)]));
}

// Hypothesis storage key: keccak256(author + shortId)
export const hypothesisKey = (author, shortId) =>
  keccak256(encodePacked(['address', 'bytes8'], [author, shortId]));

// Lab storage key: keccak256(operator + labId)
export const labKey = (operator, labId) =>
  keccak256(encodePacked(['address', 'bytes8'], [operator, labId]));

// Campaign storage key: keccak256(lead + campaignId)
export const campaignKey = (lead, id) =>
  keccak256(encodePacked(['address', 'bytes16'], [lead, id]));

// Approve ERC-20 token spend and wait for confirmation
export async function approveToken(tokenAddress, spender, amount) {
  const hash = await writeContract(wagmiConfig, {
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'approve',
    args: [spender, amount],
  });
  await waitForTransactionReceipt(wagmiConfig, { hash });
}

// Read ERC-20 balance
export async function tokenBalance(tokenAddress, owner) {
  return readContract(wagmiConfig, {
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [owner],
  });
}

export { writeContract, waitForTransactionReceipt, toHex };
