import { createContext, useCallback, useContext, useState } from 'react';
import { useAccount, useConnect, useConnectors, useDisconnect, useSignMessage } from 'wagmi';
import { siwe, clearAuth } from '../lib/api';

const WalletCtx = createContext(null);

export function WalletProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('synapse:auth') || null);

  const { address, isConnected, connector: activeConnector } = useAccount();
  const connectors = useConnectors();
  const { connect, isPending, variables: connectVars, error: connectError } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const wallet = isConnected && address
    ? { address: address.toLowerCase(), provider: activeConnector?.id || connectVars?.connector?.id || 'injected' }
    : null;

  const connectWallet = useCallback((provider) => {
    const id = 'injected';
    const connector = connectors.find(c => c.id === id);
    if (connector) connect({ connector });
    setOpen(false);
  }, [connect, connectors]);

  const disconnect = useCallback(() => {
    wagmiDisconnect(activeConnector ? { connector: activeConnector } : undefined);
    setAuthToken(null);
    clearAuth();
  }, [wagmiDisconnect, activeConnector]);

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
