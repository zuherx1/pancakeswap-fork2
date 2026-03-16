import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from '../ui/Modal';
import { Text } from '../ui/Typography';
import Toggle from '../ui/Toggle';
import { useSettings } from '../../context/SettingsContext';
import { MAINNET_CHAINS, TESTNET_CHAINS, Chain } from '../../config/supportedChains';
import { TATUM_CHAINS } from '../../utils/tatum';

/* ─── Tatum chains formatted like PancakeSwap chains ───────────────────── */
const TATUM_CHAIN_LIST: Chain[] = Object.entries(TATUM_CHAINS).map(([key, c]) => ({
  id:          c.chainId || 0,
  name:        c.name,
  shortName:   c.name.split(' ')[0],
  icon:        c.icon,
  color:       c.isEVM ? '#1FC7D4' : '#F0B90B',
  rpcUrl:      '',
  explorerUrl: '',
  nativeCurrency: { name: c.symbol, symbol: c.symbol, decimals: c.decimals },
  isTestnet:   false,
}));

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const ModeToggleRow = styled.div`
  display: flex;
  background: ${({ theme }) => theme.colors.input};
  border-radius: 14px;
  padding: 4px;
  gap: 4px;
  margin-bottom: 18px;
`;

const ModeBtn = styled.button<{ $active?: boolean }>`
  flex: 1; padding: 8px 6px; border-radius: 10px;
  font-size: 13px; font-weight: 700; font-family: 'Kanit', sans-serif;
  cursor: pointer; border: none; transition: all 0.15s;
  background: ${({ $active, theme }) => $active ? theme.colors.backgroundAlt : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.text : theme.colors.textSubtle};
  box-shadow: ${({ $active }) => $active ? '0 1px 4px rgba(0,0,0,0.1)' : 'none'};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 16px;
  @media(max-width:400px){ grid-template-columns: 1fr; }
`;

const ChainCard = styled.button<{ $active?: boolean; $color: string }>`
  display: flex; align-items: center; gap: 10px;
  padding: 12px 14px; border-radius: 16px;
  border: 2px solid ${({ $active, $color, theme }) => $active ? $color : theme.colors.cardBorder};
  background: ${({ $active, $color }) => $active ? $color + '12' : 'transparent'};
  cursor: pointer; transition: all 0.15s; text-align: left;
  font-family: 'Kanit', sans-serif;
  &:hover { border-color: ${({ $color }) => $color}; background: ${({ $color }) => $color + '10'}; transform: translateY(-1px); }
`;

const ChainIcon = styled.div<{ $color: string }>`
  width: 36px; height: 36px; border-radius: 50%;
  background: ${({ $color }) => $color + '20'};
  border: 1px solid ${({ $color }) => $color + '40'};
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
`;

const ChainInfo = styled.div`flex: 1; min-width: 0;`;
const ChainName = styled.div`font-size: 14px; font-weight: 700; color: ${({ theme }) => theme.colors.text}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`;
const ChainNative = styled.div`font-size: 11px; color: ${({ theme }) => theme.colors.textSubtle};`;

const ActiveDot = styled.div<{ $color: string }>`
  width: 8px; height: 8px; border-radius: 50%;
  background: ${({ $color }) => $color}; flex-shrink: 0;
  box-shadow: 0 0 6px ${({ $color }) => $color};
`;

const SectionTitle = styled.div`
  font-size: 12px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: ${({ theme }) => theme.colors.textSubtle};
  margin: 12px 0 8px; display: flex; align-items: center; gap: 6px;
`;

const TestnetRow = styled.div`
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors.input};
  border-radius: 14px; margin-bottom: 12px;
`;

const ModeInfoBadge = styled.div`
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px; border-radius: 12px; margin-bottom: 14px;
  background: ${({ theme }) => theme.colors.primary + '12'};
  border: 1px solid ${({ theme }) => theme.colors.primary + '30'};
  font-size: 12px; color: ${({ theme }) => theme.colors.primary};
  font-family: 'Kanit', sans-serif;
`;

interface Props { onDismiss: () => void; }

const NetworkSwitcherModal: React.FC<Props> = ({ onDismiss }) => {
  const { settings, update } = useSettings();
  const activeId   = settings.activeChainId;
  const showTests  = settings.showTestnets;
  const chainMode  = settings.chainMode || 'pancakeswap';

  // Local view toggle (doesn't change global chainMode — that's admin only)
  // We just read chainMode from settings which is synced from admin
  const isPancake  = chainMode === 'pancakeswap';
  const isTatum    = chainMode === 'tatum';

  const switchChain = async (chain: Chain) => {
    const eth = (window as any).ethereum;
    if (eth && chain.rpcUrl) {
      try {
        await eth.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x' + chain.id.toString(16) }],
        });
      } catch (err: any) {
        if (err.code === 4902 && chain.rpcUrl) {
          try {
            await eth.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId:           '0x' + chain.id.toString(16),
                chainName:         chain.name,
                nativeCurrency:    chain.nativeCurrency,
                rpcUrls:           [chain.rpcUrl],
                blockExplorerUrls: [chain.explorerUrl],
              }],
            });
          } catch {}
        }
      }
    }
    update({ activeChainId: chain.id });
    onDismiss();
  };

  const renderChainGrid = (chains: Chain[]) => (
    <Grid>
      {chains.map(chain => (
        <ChainCard
          key={chain.id + chain.name}
          $active={activeId === chain.id}
          $color={chain.color}
          onClick={() => switchChain(chain)}
        >
          <ChainIcon $color={chain.color}>{chain.icon}</ChainIcon>
          <ChainInfo>
            <ChainName>{chain.shortName}</ChainName>
            <ChainNative>{chain.nativeCurrency.symbol}</ChainNative>
          </ChainInfo>
          {activeId === chain.id && <ActiveDot $color={chain.color} />}
        </ChainCard>
      ))}
    </Grid>
  );

  return (
    <Modal title="Select Network" onDismiss={onDismiss}>

      {/* Mode info badge */}
      <ModeInfoBadge>
        {isPancake ? '🍴' : '🔗'}
        {isPancake
          ? 'Showing PancakeSwap chains — change in Admin → Site Settings'
          : 'Showing Tatum.io chains — change in Admin → Site Settings'}
      </ModeInfoBadge>

      {/* PancakeSwap chains */}
      {isPancake && (
        <>
          <SectionTitle>🌐 Mainnet</SectionTitle>
          {renderChainGrid(MAINNET_CHAINS)}

          <TestnetRow>
            <div>
              <Text small bold>Show Testnets</Text>
              <Text small color="textSubtle">Display test networks</Text>
            </div>
            <Toggle
              checked={showTests}
              onChange={e => update({ showTestnets: e.target.checked })}
              scale="sm"
            />
          </TestnetRow>

          {showTests && (
            <>
              <SectionTitle>🧪 Testnet</SectionTitle>
              {renderChainGrid(TESTNET_CHAINS)}
            </>
          )}
        </>
      )}

      {/* Tatum chains */}
      {isTatum && (
        <>
          <SectionTitle>🔗 EVM Chains</SectionTitle>
          {renderChainGrid(TATUM_CHAIN_LIST.filter(c =>
            Object.values(TATUM_CHAINS).find(t => t.name === c.name)?.isEVM === true
          ))}

          <SectionTitle>⛓ Non-EVM Chains</SectionTitle>
          {renderChainGrid(TATUM_CHAIN_LIST.filter(c =>
            Object.values(TATUM_CHAINS).find(t => t.name === c.name)?.isEVM === false
          ))}
        </>
      )}
    </Modal>
  );
};

export default NetworkSwitcherModal;
