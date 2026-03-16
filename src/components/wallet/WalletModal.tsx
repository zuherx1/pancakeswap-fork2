import React from 'react';
import styled from 'styled-components';
import Modal from '../ui/Modal';

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
`;

const WalletBtn = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px 12px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  cursor: pointer;
  transition: all 0.2s;
  color: ${({ theme }) => theme.colors.text};
  font-family: 'Kanit', sans-serif;

  &:hover {
    background: ${({ theme }) => theme.colors.backgroundAlt};
    border-color: ${({ theme }) => theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(31,199,212,0.2);
  }

  img { width: 40px; height: 40px; border-radius: 12px; object-fit: contain; }
  span { font-size: 14px; font-weight: 600; }
`;

const Disclaimer = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSubtle};
  text-align: center;
  margin: 0;
  line-height: 1.6;

  a { color: ${({ theme }) => theme.colors.primary}; }
`;

const WALLETS = [
  { name: 'MetaMask',       icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg' },
  { name: 'WalletConnect',  icon: 'https://avatars.githubusercontent.com/u/37784886?s=200&v=4' },
  { name: 'Trust Wallet',   icon: 'https://trustwallet.com/assets/images/media/assets/TWT.png' },
  { name: 'Binance Wallet', icon: 'https://public.bnbstatic.com/image/admin_mgs_image_upload/20201110/87496d50-2408-43e1-ad4c-78b47b448a6a.png' },
  { name: 'Coinbase',       icon: 'https://avatars.githubusercontent.com/u/18060234?s=200&v=4' },
  { name: 'SafePal',        icon: 'https://s2.coinmarketcap.com/static/img/coins/200x200/8259.png' },
];

interface WalletModalProps {
  onDismiss: () => void;
}

const WalletModal: React.FC<WalletModalProps> = ({ onDismiss }) => {
  const handleConnect = (walletName: string) => {
    if (walletName === 'MetaMask') {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        (window as any).ethereum.request({ method: 'eth_requestAccounts' })
          .then(() => onDismiss())
          .catch(console.error);
      } else {
        window.open('https://metamask.io/download/', '_blank');
      }
    } else {
      alert(`${walletName} connection coming soon!`);
    }
  };

  return (
    <Modal title="Connect a Wallet" onDismiss={onDismiss}>
      <Grid>
        {WALLETS.map((w) => (
          <WalletBtn key={w.name} onClick={() => handleConnect(w.name)}>
            <img src={w.icon} alt={w.name} onError={(e) => { (e.target as any).style.display='none'; }} />
            <span>{w.name}</span>
          </WalletBtn>
        ))}
      </Grid>
      <Disclaimer>
        By connecting a wallet, you agree to PancakeSwap&apos;s{' '}
        <a href="/terms" target="_blank" rel="noreferrer">Terms of Service</a>
        {' '}and acknowledge that you have read and understand the{' '}
        <a href="/privacy" target="_blank" rel="noreferrer">PancakeSwap protocol disclaimer</a>.
      </Disclaimer>
    </Modal>
  );
};

export default WalletModal;
