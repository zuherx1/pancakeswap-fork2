import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import Modal from '../ui/Modal';
import { Input } from '../ui/Input';
import { Text } from '../ui/Typography';
import { CNcurrency } from '../../utils/changenow';

const SearchWrap = styled.div`margin-bottom: 16px;`;

const List = styled.div`
  max-height: 360px;
  overflow-y: auto;
  margin: 0 -24px;
  padding: 0 24px;
`;

const Row = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
  text-align: left;
  &:hover { background: ${({ theme }) => theme.colors.input}; }
`;

const CoinImg = styled.img`
  width: 32px; height: 32px; border-radius: 50%;
  object-fit: contain;
  background: ${({ theme }) => theme.colors.input};
`;

const FiatEmoji = styled.div`
  width: 32px; height: 32px; border-radius: 50%;
  background: ${({ theme }) => theme.colors.input};
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
`;

const CoinInfo = styled.div`flex: 1;`;
const CoinTicker = styled.div`font-size: 15px; font-weight: 700; color: ${({ theme }) => theme.colors.text}; text-transform: uppercase;`;
const CoinName   = styled.div`font-size: 12px; color: ${({ theme }) => theme.colors.textSubtle};`;

interface Props {
  onDismiss: () => void;
  onSelect:  (c: CNcurrency) => void;
  currencies: CNcurrency[];
  selected?: CNcurrency;
  title?: string;
}

const CurrencySelectModal: React.FC<Props> = ({ onDismiss, onSelect, currencies, selected, title }) => {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return currencies.filter(c =>
      c.ticker.toLowerCase().includes(s) || c.name.toLowerCase().includes(s)
    );
  }, [currencies, q]);

  return (
    <Modal title={title || 'Select Currency'} onDismiss={onDismiss}>
      <SearchWrap>
        <Input placeholder="Search coin or ticker…" value={q} onChange={e => setQ(e.target.value)} autoFocus />
      </SearchWrap>
      <List>
        {filtered.map(c => (
          <Row key={c.ticker + (c.network || '')} onClick={() => { onSelect(c); onDismiss(); }}>
            {c.isFiat ? (
              <FiatEmoji>{c.image}</FiatEmoji>
            ) : (
              <CoinImg
                src={c.image}
                alt={c.ticker}
                onError={e => { (e.target as any).style.display = 'none'; }}
              />
            )}
            <CoinInfo>
              <CoinTicker>{c.ticker}{c.network ? ` (${c.network})` : ''}</CoinTicker>
              <CoinName>{c.name}</CoinName>
            </CoinInfo>
            {selected?.ticker === c.ticker && <span style={{ color: '#1FC7D4' }}>✓</span>}
          </Row>
        ))}
        {filtered.length === 0 && (
          <Text color="textSubtle" textAlign="center" style={{ padding: '24px 0' }}>No results</Text>
        )}
      </List>
    </Modal>
  );
};

export default CurrencySelectModal;
