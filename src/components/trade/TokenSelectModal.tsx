import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import Modal from '../ui/Modal';
import { Input } from '../ui/Input';
import TokenLogo from '../ui/TokenLogo';
import { BSC_TOKENS, Token } from '../../constants/tokens';
import { Text } from '../ui/Typography';

const SearchWrap = styled.div`
  margin-bottom: 16px;
`;

const CommonTokens = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const CommonBtn = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 12px;
  background: ${({ active, theme }) => active ? theme.colors.primary + '20' : theme.colors.input};
  border: 1px solid ${({ active, theme }) => active ? theme.colors.primary : theme.colors.cardBorder};
  color: ${({ active, theme }) => active ? theme.colors.primary : theme.colors.text};
  font-size: 14px;
  font-weight: 600;
  font-family: 'Kanit', sans-serif;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.colors.cardBorder};
  margin: 8px 0;
`;

const TokenList = styled.div`
  max-height: 320px;
  overflow-y: auto;
  margin: 0 -24px;
  padding: 0 24px;
`;

const TokenRow = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  background: transparent;
  border: none;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.4 : 1};
  transition: background 0.15s;
  gap: 12px;
  text-align: left;

  &:hover:not(:disabled) { background: ${({ theme }) => theme.colors.input}; }
`;

const TokenInfo = styled.div`
  flex: 1;
`;

const TokenSymbol = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const TokenName = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSubtle};
`;

const COMMON_TOKENS = ['BNB', 'CAKE', 'BUSD', 'USDT', 'USDC', 'ETH', 'BTCB'];

interface TokenSelectModalProps {
  onDismiss: () => void;
  onSelect: (token: Token) => void;
  selectedToken?: Token;
  otherToken?: Token;
}

const TokenSelectModal: React.FC<TokenSelectModalProps> = ({ onDismiss, onSelect, selectedToken, otherToken }) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return BSC_TOKENS.filter(t =>
      t.symbol.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.address.toLowerCase().includes(q)
    );
  }, [search]);

  const commonTokens = BSC_TOKENS.filter(t => COMMON_TOKENS.includes(t.symbol));

  return (
    <Modal title="Select a Token" onDismiss={onDismiss}>
      <SearchWrap>
        <Input
          placeholder="Search name or paste address"
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoFocus
        />
      </SearchWrap>

      <Text small color="textSubtle" style={{ marginBottom: 8 }}>Common tokens</Text>
      <CommonTokens>
        {commonTokens.map(t => (
          <CommonBtn
            key={t.symbol}
            active={selectedToken?.symbol === t.symbol}
            onClick={() => { onSelect(t); onDismiss(); }}
          >
            <TokenLogo src={t.logoURI} symbol={t.symbol} size={20} />
            {t.symbol}
          </CommonBtn>
        ))}
      </CommonTokens>

      <Divider />

      <TokenList>
        {filtered.map(t => {
          const isSelected = selectedToken?.symbol === t.symbol;
          const isOther    = otherToken?.symbol === t.symbol;
          return (
            <TokenRow
              key={t.address}
              disabled={isOther}
              onClick={() => { if (!isOther) { onSelect(t); onDismiss(); } }}
            >
              <TokenLogo src={t.logoURI} symbol={t.symbol} size={36} />
              <TokenInfo>
                <TokenSymbol>{t.symbol} {isSelected && '✓'}</TokenSymbol>
                <TokenName>{t.name}</TokenName>
              </TokenInfo>
            </TokenRow>
          );
        })}
        {filtered.length === 0 && (
          <Text color="textSubtle" textAlign="center" style={{ padding: '24px 0' }}>
            No results found.
          </Text>
        )}
      </TokenList>
    </Modal>
  );
};

export default TokenSelectModal;
