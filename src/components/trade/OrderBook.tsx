import React from 'react';
import styled from 'styled-components';
import { OrderBook as OB } from '../../hooks/usePerps';
import { Text } from '../ui/Typography';

const Wrapper = styled.div`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-left: 1px solid ${({ theme }) => theme.colors.cardBorder};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 8px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
`;

const Row = styled.div<{ side: 'ask'|'bid'; depth?: number }>`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 3px 12px;
  cursor: pointer;
  position: relative;
  transition: background 0.1s;

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    width: ${({ depth = 0 }) => depth * 100}%;
    background: ${({ side, theme }) =>
      side === 'ask'
        ? theme.colors.danger + '18'
        : theme.colors.success + '18'};
    z-index: 0;
  }

  &:hover { background: ${({ theme }) => theme.colors.input}; }
  span { position: relative; z-index: 1; font-size: 12px; font-family: 'Roboto Mono', monospace; }
`;

const AskPrice = styled.span`color: ${({ theme }) => theme.colors.danger};`;
const BidPrice = styled.span`color: ${({ theme }) => theme.colors.success};`;

const SpreadRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.input};
`;

const MarkPriceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background: ${({ theme }) => theme.colors.success + '12'};
`;

const Lists = styled.div`flex: 1; overflow: hidden; display: flex; flex-direction: column;`;
const AskList = styled.div`flex: 1; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end;`;
const BidList = styled.div`flex: 1; overflow-y: auto;`;

interface Props {
  orderBook: OB;
  markPrice: number;
  symbol:    string;
}

const OrderBookPanel: React.FC<Props> = ({ orderBook, markPrice, symbol }) => {
  const maxAskSize = Math.max(...orderBook.asks.map(a => a[1]));
  const maxBidSize = Math.max(...orderBook.bids.map(b => b[1]));

  const askTotal  = orderBook.asks.slice(0, 8).reduce((s, a) => s + a[1], 0);
  const bidTotal  = orderBook.bids.slice(0, 8).reduce((s, b) => s + b[1], 0);
  const spread    = orderBook.asks[0]?.[0] - orderBook.bids[0]?.[0];
  const spreadPct = ((spread / markPrice) * 100).toFixed(3);

  const fmt = (n: number) => n > 1000 ? n.toFixed(1) : n > 1 ? n.toFixed(2) : n.toFixed(4);

  return (
    <Wrapper>
      <Header>
        <Text small color="textSubtle">Price (USDT)</Text>
        <Text small color="textSubtle" textAlign="center">Size</Text>
        <Text small color="textSubtle" textAlign="right">Total</Text>
      </Header>

      <Lists>
        {/* Asks (sells) - show bottom 8 reversed */}
        <AskList>
          {[...orderBook.asks].slice(0, 8).reverse().map(([price, size], i) => (
            <Row key={i} side="ask" depth={size / maxAskSize}>
              <AskPrice>{fmt(price)}</AskPrice>
              <span style={{ textAlign: 'center' }}>{size.toFixed(3)}</span>
              <span style={{ textAlign: 'right', color: '#7A6EAA' }}>{(price * size).toFixed(0)}</span>
            </Row>
          ))}
        </AskList>

        {/* Mark price */}
        <MarkPriceRow>
          <Text bold style={{ color: '#31D0AA', fontSize: 16, fontFamily: 'Roboto Mono, monospace' }}>
            {fmt(markPrice)}
          </Text>
          <Text small color="textSubtle" style={{ marginLeft: 8 }}>${fmt(markPrice)}</Text>
        </MarkPriceRow>

        {/* Spread */}
        <SpreadRow>
          <Text small color="textSubtle">Spread</Text>
          <Text small color="textSubtle">{fmt(spread)} ({spreadPct}%)</Text>
        </SpreadRow>

        {/* Bids (buys) */}
        <BidList>
          {orderBook.bids.slice(0, 8).map(([price, size], i) => (
            <Row key={i} side="bid" depth={size / maxBidSize}>
              <BidPrice>{fmt(price)}</BidPrice>
              <span style={{ textAlign: 'center' }}>{size.toFixed(3)}</span>
              <span style={{ textAlign: 'right', color: '#7A6EAA' }}>{(price * size).toFixed(0)}</span>
            </Row>
          ))}
        </BidList>
      </Lists>

      {/* Buy/Sell ratio */}
      <div style={{ padding: '8px 12px', borderTop: '1px solid', borderColor: 'inherit' }}>
        <div style={{ display: 'flex', height: 4, borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
          <div style={{ width: `${(bidTotal / (bidTotal + askTotal)) * 100}%`, background: '#31D0AA' }} />
          <div style={{ flex: 1, background: '#ED4B9E' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Text small color="success">{((bidTotal / (bidTotal + askTotal)) * 100).toFixed(1)}% B</Text>
          <Text small color="failure">{((askTotal / (bidTotal + askTotal)) * 100).toFixed(1)}% S</Text>
        </div>
      </div>
    </Wrapper>
  );
};

export default OrderBookPanel;
