import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import Modal from '../ui/Modal';
import { Input } from '../ui/Input';
import { Text } from '../ui/Typography';
import {
  Token, TOKENS_BY_CHAIN, CHAIN_NAMES,
  BSC_TOKENS, ETH_TOKENS, ARB_TOKENS, BASE_TOKENS,
} from '../../constants/tokens';
import { useSettings } from '../../context/SettingsContext';

/* ─── Styled ─────────────────────────────────────────────────────────────── */
const SearchWrap = styled.div`margin-bottom: 12px;`;

const ChainTabs = styled.div`
  display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 14px;
`;

const ChainTab = styled.button<{ $active?: boolean }>`
  padding: 5px 12px; border-radius: 10px; font-size: 12px; font-weight: 700;
  font-family: 'Kanit', sans-serif; cursor: pointer; transition: all .15s;
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.cardBorder};
  background: ${({ $active, theme }) => $active ? theme.colors.primary + '15' : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.textSubtle};
`;

const CommonRow = styled.div`
  display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;
`;

const CommonBtn = styled.button<{ $active?: boolean }>`
  display: flex; align-items: center; gap: 5px;
  padding: 5px 10px; border-radius: 10px; cursor: pointer;
  border: 1px solid ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.cardBorder};
  background: ${({ $active, theme }) => $active ? theme.colors.primary + '15' : theme.colors.input};
  color: ${({ $active, theme }) => $active ? theme.colors.primary : theme.colors.text};
  font-size: 13px; font-weight: 600; font-family: 'Kanit', sans-serif;
  transition: all .15s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const Sep = styled.div`
  height: 1px; background: ${({ theme }) => theme.colors.cardBorder}; margin: 8px 0;
`;

const TokenList = styled.div`
  max-height: 340px; overflow-y: auto; margin: 0 -24px; padding: 0 24px;
  scrollbar-width: thin;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.colors.cardBorder}; border-radius: 4px; }
`;

const TokenRow = styled.button<{ $disabled?: boolean }>`
  display: flex; align-items: center; gap: 12px;
  width: 100%; padding: 10px 0; border: none; background: transparent;
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ $disabled }) => $disabled ? 0.4 : 1};
  border-radius: 12px; transition: background .1s;
  &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.input}; padding: 10px 8px; margin: 0 -8px; }
`;

const LogoWrap = styled.div`
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  overflow: hidden; background: ${({ theme }) => theme.colors.input};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  display: flex; align-items: center; justify-content: center;
`;

const TokenLogo = styled.img`
  width: 100%; height: 100%; object-fit: contain;
  border-radius: 50%;
`;

const FallbackLogo = styled.div`
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px; font-weight: 700;
  color: ${({ theme }) => theme.colors.primary};
  background: ${({ theme }) => theme.colors.primary + '15'};
  border-radius: 50%;
`;

const TokenInfo = styled.div`flex: 1; text-align: left; min-width: 0;`;

const AddressText = styled.div`
  font-size: 11px; color: ${({ theme }) => theme.colors.textSubtle};
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-family: monospace;
`;

const EmptyMsg = styled.div`
  text-align: center; padding: 32px 0;
  color: ${({ theme }) => theme.colors.textSubtle};
  font-size: 14px;
`;

/* ── Common tokens per chain ─────────────────────────────────────────────── */
const COMMON: Record<number, string[]> = {
  56:    ['BNB','CAKE','USDT','USDC','BUSD','ETH','BTCB','SOL'],
  1:     ['ETH','WBTC','USDT','USDC','DAI','LINK','UNI','AAVE'],
  42161: ['ETH','ARB','USDC','USDT','DAI','WBTC','LINK'],
  8453:  ['ETH','USDC','DAI','cbETH'],
  324:   ['ETH','USDC.e','USDT','WBTC'],
  1101:  ['ETH','USDC','USDT'],
  204:   ['BNB','USDT','ETH'],
  59144: ['ETH','USDC','USDT'],
};

const CHAIN_LIST = [
  { id: 56,    label: '🟡 BNB Chain' },
  { id: 1,     label: '🔷 Ethereum' },
  { id: 42161, label: '🔵 Arbitrum' },
  { id: 8453,  label: '🔹 Base' },
  { id: 324,   label: '⚙️ zkSync' },
];

interface Props {
  selectedToken?:  Token;
  /* new prop name */
  onSelectToken?:  (token: Token) => void;
  /* old prop name — kept for backward compatibility */
  onSelect?:       (token: Token) => void;
  onDismiss:       () => void;
  /* new prop name */
  disabledToken?:  Token;
  /* old prop name — kept for backward compatibility */
  otherToken?:     Token;
  title?:          string;
}

export default function TokenSelectModal({
  selectedToken,
  onSelectToken,
  onSelect,
  onDismiss,
  disabledToken,
  otherToken,
  title = 'Select a Token',
}: Props) {
  const { settings }   = useSettings();
  const [search,  setSearch]  = useState('');
  const [chainId, setChainId] = useState(settings?.activeChainId || 56);

  // Accept either prop name
  const handleSelect = onSelectToken || onSelect || (() => {});
  const blocked      = disabledToken || otherToken;

  // Sync chain with wallet chain
  useEffect(() => {
    if (settings?.activeChainId) setChainId(settings.activeChainId);
  }, [settings?.activeChainId]);

  const allTokens  = TOKENS_BY_CHAIN[chainId] || BSC_TOKENS;
  const commonSyms = COMMON[chainId] || COMMON[56];

  const filtered = useMemo(() => {
    if (!search) return allTokens;
    const q = search.toLowerCase().trim();
    return allTokens.filter(t =>
      t.symbol.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.address.toLowerCase() === q
    );
  }, [allTokens, search]);

  const commonTokens = allTokens.filter(t => commonSyms.includes(t.symbol));
  const listTokens   = search ? filtered : filtered.filter(t => !commonSyms.includes(t.symbol));

  const handleToken = (token: Token) => {
    if (blocked?.symbol === token.symbol) return;
    handleSelect(token);
    onDismiss();
  };

  const renderToken = (token: Token) => {
    const isDisabled = blocked?.symbol === token.symbol;
    const isSelected = selectedToken?.symbol === token.symbol;
    return (
      <TokenRow
        key={token.address + token.symbol}
        $disabled={isDisabled}
        onClick={() => handleToken(token)}
        style={{ background: isSelected ? 'rgba(31,199,212,0.08)' : undefined }}
      >
        <LogoWrap>
          {token.logoURI ? (
            <TokenLogo
              src={token.logoURI}
              alt={token.symbol}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <FallbackLogo>{token.symbol.slice(0, 2)}</FallbackLogo>
          )}
        </LogoWrap>
        <TokenInfo>
          <Text bold style={{ fontSize: 15 }}>{token.symbol}</Text>
          <Text small color="textSubtle">{token.name}</Text>
          {token.address !== token.symbol && token.address !== 'ETH' && token.address !== 'BNB' && (
            <AddressText>{token.address.slice(0, 8)}…{token.address.slice(-6)}</AddressText>
          )}
        </TokenInfo>
        {isSelected && (
          <div style={{ color: '#1FC7D4', fontSize: 16, flexShrink: 0 }}>✓</div>
        )}
      </TokenRow>
    );
  };

  return (
    <Modal title={title} onDismiss={onDismiss}>
      {/* Chain selector */}
      <ChainTabs>
        {CHAIN_LIST.map(c => (
          <ChainTab
            key={c.id}
            $active={chainId === c.id}
            onClick={() => { setChainId(c.id); setSearch(''); }}
          >
            {c.label}
          </ChainTab>
        ))}
      </ChainTabs>

      {/* Search */}
      <SearchWrap>
        <Input
          placeholder="Search name or paste address…"
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
          autoFocus
        />
      </SearchWrap>

      {/* Common tokens */}
      {!search && commonTokens.length > 0 && (
        <>
          <Text small color="textSubtle" style={{ marginBottom: 8, fontWeight: 600 }}>Common tokens</Text>
          <CommonRow>
            {commonTokens.map(token => (
              <CommonBtn
                key={token.symbol}
                $active={selectedToken?.symbol === token.symbol}
                onClick={() => handleToken(token)}
              >
                {token.logoURI ? (
                  <img src={token.logoURI} width={18} height={18} style={{ borderRadius: '50%' }} alt={token.symbol} />
                ) : null}
                {token.symbol}
              </CommonBtn>
            ))}
          </CommonRow>
          <Sep />
          <Text small color="textSubtle" style={{ marginBottom: 8, fontWeight: 600 }}>
            All tokens on {CHAIN_NAMES[chainId] || 'this chain'}
          </Text>
        </>
      )}

      {/* Full token list */}
      <TokenList>
        {(search ? filtered : listTokens).map(renderToken)}
        {filtered.length === 0 && (
          <EmptyMsg>
            No tokens found for "{search}"
            <br />
            <span style={{ fontSize: 12, marginTop: 6, display: 'block' }}>
              You can paste a contract address to import a custom token
            </span>
          </EmptyMsg>
        )}
      </TokenList>
    </Modal>
  );
}
