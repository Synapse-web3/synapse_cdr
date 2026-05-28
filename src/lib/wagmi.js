import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http(import.meta.env.VITE_BASE_RPC_URL || undefined),
  },
  connectors: [injected()],
  pollingInterval: 30_000,
});
