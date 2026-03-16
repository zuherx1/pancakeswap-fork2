import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  balance: string;
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  chainId: null,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  balance: '0',
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth) return;

    // Check if already connected
    eth.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        eth.request({ method: 'eth_chainId' }).then((id: string) => setChainId(parseInt(id, 16)));
      }
    });

    const onAccountsChanged = (accounts: string[]) => {
      setAccount(accounts.length > 0 ? accounts[0] : null);
    };
    const onChainChanged = (id: string) => {
      setChainId(parseInt(id, 16));
      window.location.reload();
    };

    eth.on('accountsChanged', onAccountsChanged);
    eth.on('chainChanged', onChainChanged);

    return () => {
      eth.removeListener('accountsChanged', onAccountsChanged);
      eth.removeListener('chainChanged', onChainChanged);
    };
  }, []);

  const connect = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (!eth) { window.open('https://metamask.io/download/', '_blank'); return; }
    const accounts = await eth.request({ method: 'eth_requestAccounts' });
    const id = await eth.request({ method: 'eth_chainId' });
    setAccount(accounts[0]);
    setChainId(parseInt(id, 16));
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setBalance('0');
  }, []);

  return (
    <Web3Context.Provider value={{ account, chainId, isConnected: !!account, connect, disconnect, balance }}>
      {children}
    </Web3Context.Provider>
  );
};
