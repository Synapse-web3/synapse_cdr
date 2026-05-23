import { createContext, useCallback, useContext, useState } from 'react';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { coinbaseWallet, injected } from '@wagmi/connectors';
import { siwe, clearAuth } from '../lib/api';

const WalletCtx = createContext(null);

export function WalletProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('synapse:auth') || null);

  const { address, isConnected } = useAccount();
  const { connect, isPending, variables: connectVars, error: connectError } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const wallet = isConnected && address
    ? { address: address.toLowerCase(), provider: connectVars?.connector?.id || 'injected' }
    : null;

  const connectWallet = useCallback((provider) => {
    if (provider === 'metamask' || provider === 'injected') {
      connect({ connector: injected() });
    } else if (provider === 'coinbase') {
      connect({ connector: coinbaseWallet({ appName: 'Synapse Protocol' }) });
    }
    setOpen(false);
  }, [connect]);

  const disconnect = useCallback(async () => {
    wagmiDisconnect();
    setAuthToken(null);
    clearAuth();
  }, [wagmiDisconnect]);

  const signIn = useCallback(async () => {
    if (!address) throw new Error('Wallet not connected');
    const token = await siwe(
      address.toLowerCase(),
      (msg) => signMessageAsync({ message: msg }),
    );
    setAuthToken(token);
    return token;
  }, [address, signMessageAsync]);

  const requireAuth = useCallback(async () => {
    if (authToken) return authToken;
    return signIn();
  }, [authToken, signIn]);

  const connecting = isPending ? (connectVars?.connector?.id || 'connecting') : null;

  return (
    <WalletCtx.Provider value={{
      open, setOpen,
      wallet,
      connect: connectWallet,
      disconnect,
      connecting,
      error: connectError?.message || null,
      authToken, signIn, requireAuth,
    }}>
      {children}
    </WalletCtx.Provider>
  );
}

export const useWallet = () => useContext(WalletCtx);
